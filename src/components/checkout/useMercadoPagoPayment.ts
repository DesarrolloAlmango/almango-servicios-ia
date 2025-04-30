
import { useState, useRef, useEffect } from "react";
import { ServiceRequest } from "@/types/checkoutTypes";

export interface UseMercadoPagoPaymentReturn {
  paymentCheckIntervalRef: React.MutableRefObject<number | null>;
  checkingPayment: boolean;
  paymentStatusChecked: Record<number, boolean>;
  setPaymentStatusChecked: React.Dispatch<React.SetStateAction<Record<number, boolean>>>;
  checkPendingPayments: () => Promise<void>;
  setCheckingPayment: React.Dispatch<React.SetStateAction<boolean>>;
  startPaymentPolling: () => void;
  stopPaymentPolling: () => void;
}

export const useMercadoPagoPayment = (
  serviceRequests: ServiceRequest[],
  setServiceRequests: React.Dispatch<React.SetStateAction<ServiceRequest[]>>,
  showResultDialog: boolean,
  selectedRequestData: any,
  setSelectedRequestData: React.Dispatch<React.SetStateAction<any>>,
  selectedServiceId: number | null
): UseMercadoPagoPaymentReturn => {
  const [paymentStatusChecked, setPaymentStatusChecked] = useState<Record<number, boolean>>({});
  const [checkingPayment, setCheckingPayment] = useState(false);
  const paymentCheckIntervalRef = useRef<number | null>(null);

  const checkPendingPayments = async () => {
    const pendingRequests = serviceRequests.filter(
      request => request.requestData.MetodoPagosID === 4 && !request.paymentConfirmed
    );
    
    if (pendingRequests.length === 0) {
      console.log("No pending requests to check, clearing interval");
      if (paymentCheckIntervalRef.current) {
        window.clearInterval(paymentCheckIntervalRef.current);
        paymentCheckIntervalRef.current = null;
      }
      return;
    }

    setCheckingPayment(true);
    console.log(`Verificando ${pendingRequests.length} pagos pendientes...`);
    
    try {
      for (const request of pendingRequests) {
        console.log(`Verificando estado de pago para solicitud ${request.solicitudId}`);
        
        const checkUrl = `/api/AlmangoXV1NETFramework/WebAPI/ConsultarPagoPendiente?Solicitudesid=${request.solicitudId}`;
        console.log(`URL de verificación: ${checkUrl}`);
        
        try {
          const response = await fetch(checkUrl);
          
          let rawResponseText = "";
          try {
            rawResponseText = await response.clone().text();
            console.log(`Respuesta de texto crudo:`, rawResponseText);
          } catch (e) {
            console.error("Error al leer texto crudo de respuesta:", e);
          }
          
          if (!response.ok) {
            console.error(`Error HTTP: ${response.status} ${response.statusText}`);
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
          }
          
          let result: any = null;
          let isPaid = false;
          
          console.log("Comenzando análisis de la respuesta...");
          
          try {
            result = await response.json();
            console.log(`Respuesta parseada como JSON:`, result);
            
            isPaid = result && result.Pagado === "S";
            console.log(`¿JSON contiene Pagado="S"? ${isPaid ? 'SÍ' : 'NO'}`);
          } catch (jsonError) {
            console.warn(`La respuesta no es JSON válido: ${jsonError}`);
            
            if (rawResponseText.includes('"Pagado":"S"')) {
              console.log("Se encontró 'Pagado:S' en la respuesta de texto, creando objeto manualmente");
              result = { Pagado: "S" };
              isPaid = true;
            } else {
              console.log("Análisis alternativo: No se encontró 'Pagado:S' en el texto");
              result = { Pagado: "N", rawText: rawResponseText };
              isPaid = false;
            }
          }
          
          console.log(`RESULTADO FINAL: ¿Pago confirmado? ${isPaid ? 'SÍ' : 'NO'}`);
          console.log(`Datos de resultado:`, result);
          
          if (isPaid) {
            console.log(`✅ PAGO CONFIRMADO para solicitud ${request.solicitudId}`);
            
            setPaymentStatusChecked(prev => ({
              ...prev,
              [request.solicitudId]: true
            }));
            
            // Update the service request to mark payment as confirmed
            setServiceRequests(prev => 
              prev.map(item => {
                if (item.solicitudId === request.solicitudId) {
                  // Also update the SolicitudPagada flag in the requestData
                  return { 
                    ...item, 
                    paymentConfirmed: true,
                    requestData: {
                      ...item.requestData,
                      SolicitudPagada: "S"  // Set the payment status to "S" (paid)
                    }
                  };
                }
                return item;
              })
            );
            
            // Check if we need to stop polling
            const updatedRequests = serviceRequests.map(item => {
              if (item.solicitudId === request.solicitudId) {
                return { 
                  ...item, 
                  paymentConfirmed: true,
                  requestData: {
                    ...item.requestData,
                    SolicitudPagada: "S"
                  }
                };
              }
              return item;
            });
            
            const stillHasPendingPayments = updatedRequests.some(
              req => req.requestData.MetodoPagosID === 4 && !req.paymentConfirmed
            );
            
            if (!stillHasPendingPayments && paymentCheckIntervalRef.current) {
              console.log("Todos los pagos confirmados, deteniendo verificación");
              window.clearInterval(paymentCheckIntervalRef.current);
              paymentCheckIntervalRef.current = null;
            }
            
            // Update selectedRequestData if it matches the current request
            if (selectedRequestData && selectedRequestData.SolicitudPagada !== "S" && 
                request.solicitudId === selectedServiceId) {
              setSelectedRequestData({
                ...selectedRequestData,
                SolicitudPagada: "S"
              });
            }
          } else {
            console.log(`⏱️ Pago aún no confirmado para solicitud ${request.solicitudId}. Pagado="${result?.Pagado || 'desconocido'}"`);
          }
        } catch (err) {
          console.error(`Error al verificar pago para solicitud ${request.solicitudId}:`, err);
        }
      }
    } catch (err) {
      console.error("Error general al verificar estado de pagos:", err);
    } finally {
      setCheckingPayment(false);
    }

    const allConfirmed = serviceRequests.every(
      req => req.requestData.MetodoPagosID !== 4 || req.paymentConfirmed
    );
    
    if (allConfirmed && paymentCheckIntervalRef.current) {
      console.log("Todos los pagos confirmados, deteniendo verificación");
      window.clearInterval(paymentCheckIntervalRef.current);
      paymentCheckIntervalRef.current = null;
    }
  };

  const startPaymentPolling = () => {
    // Check immediately on first load
    checkPendingPayments();
    
    // Set up interval for repeated checks
    if (!paymentCheckIntervalRef.current) {
      paymentCheckIntervalRef.current = window.setInterval(() => {
        checkPendingPayments();
      }, 3000);
    }
  };

  const stopPaymentPolling = () => {
    if (paymentCheckIntervalRef.current) {
      window.clearInterval(paymentCheckIntervalRef.current);
      paymentCheckIntervalRef.current = null;
    }
  };

  useEffect(() => {
    const hasPendingMercadoPagoPayments = serviceRequests.some(
      request => request.requestData.MetodoPagosID === 4 && !request.paymentConfirmed
    );

    if (showResultDialog && hasPendingMercadoPagoPayments && !paymentCheckIntervalRef.current) {
      console.log("Started polling for pending payments");
      startPaymentPolling();
    }

    return () => {
      stopPaymentPolling();
    };
  }, [showResultDialog, serviceRequests]);

  return {
    paymentCheckIntervalRef,
    checkingPayment,
    paymentStatusChecked,
    setPaymentStatusChecked,
    checkPendingPayments,
    setCheckingPayment,
    startPaymentPolling,
    stopPaymentPolling
  };
};
