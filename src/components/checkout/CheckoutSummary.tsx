import React, { useState, useEffect, useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Eye, Code } from "lucide-react";
import { CheckoutData } from "@/types/checkoutTypes";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import MercadoPagoPayment from "./MercadoPagoPayment";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTimeSlot, formatLocationInfo } from "@/utils/timeUtils";

interface ServiceRequest {
  solicitudId: number;
  serviceName: string;
  requestData: CheckoutData;
  paymentConfirmed?: boolean;
}

interface CheckoutSummaryProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
  data: CheckoutData[];
}

// Helper function to safely parse JSON
const safeParse = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.error("Error parsing JSON:", e);
    return null;
  }
};

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [processingService, setProcessingService] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<CheckoutData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState(false);
  const paymentLinkRef = useRef<HTMLAnchorElement>(null);
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([]);
  const [municipalities, setMunicipalities] = useState<Record<string, Array<{id: string, name: string}>>>({});
  
  const [showDebugDialog, setShowDebugDialog] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [debugTitle, setDebugTitle] = useState<string>("");

  const [paymentStatusChecked, setPaymentStatusChecked] = useState<Record<number, boolean>>({});
  const [checkingPayment, setCheckingPayment] = useState(false);
  const paymentCheckIntervalRef = useRef<number | null>(null);
  
  const [paymentCheckResults, setPaymentCheckResults] = useState<Array<{
    solicitudId: number;
    timestamp: string;
    responseData: any;
    isPaid: boolean;
    rawResponse?: string;
    error?: string;
  }>>([]);

  useEffect(() => {
    if (!isOpen) {
      setServiceRequests([]);
      setError(null);
      setShowResultDialog(false);
      setProcessingService(null);
      setSelectedServiceId(null);
      setShowDetailDialog(false);
      setSelectedRequestData(null);
      setIsRedirecting(false);
      setPaymentCheckResults([]);
      
      if (paymentCheckIntervalRef.current) {
        window.clearInterval(paymentCheckIntervalRef.current);
        paymentCheckIntervalRef.current = null;
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const hasPendingMercadoPagoPayments = serviceRequests.some(
      request => request.requestData.MetodoPagosID === 4 && !request.paymentConfirmed
    );

    if (showResultDialog && hasPendingMercadoPagoPayments && !paymentCheckIntervalRef.current) {
      console.log("Started polling for pending payments");
      toast({
        title: "Verificación de pagos iniciada",
        description: "Se está verificando el estado de los pagos cada 3 segundos",
        duration: 3000,
      });
      
      // Check immediately on first load
      checkPendingPayments();
      
      paymentCheckIntervalRef.current = window.setInterval(() => {
        checkPendingPayments();
      }, 3000);
    }

    return () => {
      if (paymentCheckIntervalRef.current) {
        window.clearInterval(paymentCheckIntervalRef.current);
        paymentCheckIntervalRef.current = null;
      }
    };
  }, [showResultDialog, serviceRequests]);

  const checkPendingPayments = async () => {
    const pendingRequests = serviceRequests.filter(
      request => request.requestData.MetodoPagosID === 4 && !request.paymentConfirmed
    );
    
    if (pendingRequests.length === 0) {
      console.log("No pending requests to check, clearing interval");
      toast({
        title: "No hay pagos pendientes",
        description: "No se encontraron solicitudes de pago pendientes para verificar",
        duration: 2000,
      });
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
        toast({
          title: "Verificando pago",
          description: `Consultando estado para solicitud #${request.solicitudId}...`,
          duration: 2000,
        });
        
        const checkUrl = `/api/AlmangoXV1NETFramework/WebAPI/ConsultarPagoPendiente?Solicitudesid=${request.solicitudId}`;
        console.log(`URL de verificación: ${checkUrl}`);
        
        try {
          const response = await fetch(checkUrl);
          
          let rawResponseText = "";
          try {
            rawResponseText = await response.clone().text();
            console.log(`Respuesta de texto crudo:`, rawResponseText);
            
            // Show raw response in a toast to help with debugging
            toast({
              title: "Respuesta del servidor (Raw)",
              description: `${rawResponseText.substring(0, 100)}${rawResponseText.length > 100 ? '...' : ''}`,
              duration: 5000,
            });
          } catch (e) {
            console.error("Error al leer texto crudo de respuesta:", e);
          }
          
          if (!response.ok) {
            console.error(`Error HTTP: ${response.status} ${response.statusText}`);
            throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
          }
          
          let result: any = null;
          let isPaid = false;
          
          // Log each step of the parsing process
          console.log("Comenzando análisis de la respuesta...");
          
          // First attempt: try to parse as JSON
          try {
            result = await response.json();
            console.log(`Respuesta parseada como JSON:`, result);
            
            // Check if the JSON contains Pagado:S
            isPaid = result && result.Pagado === "S";
            console.log(`¿JSON contiene Pagado="S"? ${isPaid ? 'SÍ' : 'NO'}`);
            
            toast({
              title: "Análisis del JSON",
              description: `Objeto JSON: ${JSON.stringify(result)}. Estado de pago: ${isPaid ? 'CONFIRMADO ✓' : 'pendiente ⏱'}`,
              duration: 3000,
            });
          } catch (jsonError) {
            console.warn(`La respuesta no es JSON válido: ${jsonError}`);
            toast({
              title: "Error de parseo JSON",
              description: `La respuesta no es JSON válido. Intentando análisis alternativo...`,
              duration: 3000,
            });
            
            // Second attempt: try to extract data from raw text
            if (rawResponseText.includes('"Pagado":"S"')) {
              console.log("Se encontró 'Pagado:S' en la respuesta de texto, creando objeto manualmente");
              result = { Pagado: "S" };
              isPaid = true;
              
              toast({
                title: "Análisis alternativo exitoso",
                description: `Se encontró "Pagado":"S" en el texto de respuesta. Pago CONFIRMADO ✓`,
                duration: 3000,
              });
            } else {
              console.log("Análisis alternativo: No se encontró 'Pagado:S' en el texto");
              result = { Pagado: "N", rawText: rawResponseText };
              isPaid = false;
              
              toast({
                title: "Análisis alternativo",
                description: `No se encontró "Pagado":"S" en el texto. Pago pendiente ⏱`,
                duration: 3000,
              });
            }
          }
          
          // Log the final determination
          console.log(`RESULTADO FINAL: ¿Pago confirmado? ${isPaid ? 'SÍ' : 'NO'}`);
          console.log(`Datos de resultado:`, result);
          
          setPaymentCheckResults(prev => [
            ...prev,
            {
              solicitudId: request.solicitudId,
              timestamp: new Date().toISOString(),
              responseData: result,
              rawResponse: rawResponseText,
              isPaid: isPaid
            }
          ]);
          
          // Final toast with the payment status
          toast({
            title: `Estado del pago #${request.solicitudId}`,
            description: `Resultado: ${isPaid ? 'PAGO CONFIRMADO ✓' : 'Pago pendiente ⏱'} (Pagado="${result?.Pagado || 'desconocido'}")`,
            variant: isPaid ? "default" : "default",
            duration: 5000,
          });
          
          if (isPaid) {
            console.log(`✅ PAGO CONFIRMADO para solicitud ${request.solicitudId}`);
            
            setPaymentStatusChecked(prev => ({
              ...prev,
              [request.solicitudId]: true
            }));
            
            toast({
              title: "¡Pago confirmado!",
              description: `El pago para la solicitud #${request.solicitudId} ha sido confirmado. Se detendrá la verificación.`,
              duration: 5000,
            });
            
            // Update the service request to mark payment as confirmed
            setServiceRequests(prev => 
              prev.map(item => 
                item.solicitudId === request.solicitudId 
                  ? { ...item, paymentConfirmed: true } 
                  : item
              )
            );
            
            // Check if we need to stop polling
            const updatedRequests = serviceRequests.map(item => 
              item.solicitudId === request.solicitudId 
                ? { ...item, paymentConfirmed: true } 
                : item
            );
            
            const stillHasPendingPayments = updatedRequests.some(
              req => req.requestData.MetodoPagosID === 4 && !req.paymentConfirmed
            );
            
            if (!stillHasPendingPayments && paymentCheckIntervalRef.current) {
              console.log("Todos los pagos confirmados, deteniendo verificación");
              window.clearInterval(paymentCheckIntervalRef.current);
              paymentCheckIntervalRef.current = null;
            }
          } else {
            console.log(`⏱️ Pago aún no confirmado para solicitud ${request.solicitudId}. Pagado="${result?.Pagado || 'desconocido'}"`);
          }
        } catch (err) {
          console.error(`Error al verificar pago para solicitud ${request.solicitudId}:`, err);
          
          setPaymentCheckResults(prev => [
            ...prev,
            {
              solicitudId: request.solicitudId,
              timestamp: new Date().toISOString(),
              responseData: null,
              isPaid: false,
              error: err instanceof Error ? err.message : String(err)
            }
          ]);
          
          toast({
            title: "Error de verificación",
            description: `No se pudo verificar el estado del pago: ${err instanceof Error ? err.message : String(err)}`,
            variant: "destructive",
            duration: 5000,
          });
        }
      }
    } catch (err) {
      console.error("Error general al verificar estado de pagos:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al verificar el estado de los pagos",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setCheckingPayment(false);
    }

    const allConfirmed = serviceRequests.every(
      req => req.requestData.MetodoPagosID !== 4 || req.paymentConfirmed
    );
    
    if (allConfirmed && paymentCheckIntervalRef.current) {
      console.log("Todos los pagos confirmados, deteniendo verificación");
      toast({
        title: "Verificación completada",
        description: "Todos los pagos han sido confirmados. Se detendrá la verificación.",
        duration: 3000,
      });
      window.clearInterval(paymentCheckIntervalRef.current);
      paymentCheckIntervalRef.current = null;
    }
  };

  const processServiceRequest = async (serviceData: CheckoutData): Promise<number> => {
    const jsonSolicitud = JSON.stringify(serviceData);
    const url = new URL("/api/AlmangoXV1NETFramework/WebAPI/AltaSolicitud", window.location.origin);
    url.searchParams.append("Userconect", "NoEmpty");
    url.searchParams.append("Key", "d3d3LmF6bWl0YS5jb20=");
    url.searchParams.append("Proveedorid", "0");
    url.searchParams.append("Usuarioid", "0");
    url.searchParams.append("Jsonsolicitud", jsonSolicitud);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result || typeof result.SolicitudesID === 'undefined' || result.SolicitudesID <= 0) {
      throw new Error("La solicitud no pudo ser procesada correctamente");
    }

    return result.SolicitudesID;
  };

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setServiceRequests([]);

      const processedRequests = [];

      for (const serviceData of data) {
        setProcessingService(serviceData.serviceName || 'Servicio');
        const solicitudId = await processServiceRequest(serviceData);
        
        const requestInfo = {
          solicitudId,
          serviceName: serviceData.serviceName || 'Servicio',
          requestData: serviceData
        };
        
        processedRequests.push(requestInfo);

        if (serviceData.MetodoPagosID === 4) {
          setIsRedirecting(true);
          toast({
            title: "Pago Pendiente",
            description: "Por favor, haz clic en el botón de Mercado Pago para continuar con tu pago.",
            duration: 5000,
          });
        }
      }

      setServiceRequests(processedRequests);
      setShowResultDialog(true);
    } catch (err) {
      console.error("Error al enviar la solicitud:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al procesar la solicitud");
      setShowResultDialog(true);
    } finally {
      setSubmitting(false);
      setProcessingService(null);
    }
  };

  const handleCloseResultDialog = () => {
    setShowResultDialog(false);
    onClose(serviceRequests.length > 0);
    navigate('/servicios');
  };

  const handleViewServiceDetails = (request: ServiceRequest) => {
    setSelectedRequestData(request.requestData);
    setShowDetailDialog(true);
  };

  const handleViewDebugData = (data: any, title: string) => {
    setDebugData(data);
    setDebugTitle(title);
    setShowDebugDialog(true);
  };

  const getFormaDePago = (metodoPagoId: number): string => {
    switch(metodoPagoId) {
      case 1:
        return "Pago al profesional";
      case 4:
        return "Mercado Pago";
      default:
        return `Método de pago ${metodoPagoId}`;
    }
  };

  const calcularTotal = (items: any[]): number => {
    return items.reduce((total, item) => total + item.PrecioFinal, 0);
  };

  const handlePaymentLink = (solicitudId: number) => {
    const paymentUrl = `http://109.199.100.16:80/PasarelaPagos.NetEnvironment/procesarpago.aspx?S${solicitudId}`;
    if (paymentLinkRef.current) {
      paymentLinkRef.current.href = paymentUrl;
      paymentLinkRef.current.click();
    }
  };

  const allPayLater = serviceRequests.length > 0 && 
    serviceRequests.every(req => req.requestData.MetodoPagosID === 1);

  const allMercadoPago = serviceRequests.length > 0 && 
    serviceRequests.every(req => req.requestData.MetodoPagosID === 4);

  const allMercadoPagoConfirmed = serviceRequests.length > 0 && 
    serviceRequests.every(req => 
      req.requestData.MetodoPagosID !== 4 || (req.requestData.MetodoPagosID === 4 && req.paymentConfirmed)
    );

  const hasPendingMercadoPagoPayments = serviceRequests.some(
    req => req.requestData.MetodoPagosID === 4 && !req.paymentConfirmed
  );

  return (
    <>
      <a 
        ref={paymentLinkRef} 
        href="about:blank" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ display: 'none' }}
      />

      <AlertDialog open={isOpen} onOpenChange={(open) => {
        if (!open && !serviceRequests.length && !error) {
          onClose(false);
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Servicios</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas contratar estos servicios?
              {submitting && processingService && (
                <div className="mt-2 text-sm text-muted-foreground">
                  Procesando {processingService}...
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onClose(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleSubmitOrder}
              disabled={submitting}
              className="gap-2"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog} modal={true}>
        <DialogContent 
          className="max-w-md" 
          onPointerDownOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
          hideCloseButton={true}
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              {serviceRequests.length > 0 ? (
                <div className="flex items-center justify-center gap-2 text-lg">
                  {hasPendingMercadoPagoPayments ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-yellow-600" />
                      <span className="text-yellow-600">
                        Servicios Confirmados! (Pendiente de Pago)
                        {checkingPayment && (
                          <span className="ml-2">
                            <Loader2 className="h-4 w-4 inline animate-spin" />
                          </span>
                        )}
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <span className="text-green-600">
                        Servicios Confirmados! {allMercadoPago && !hasPendingMercadoPagoPayments ? "Pago exitoso!" : ""}
                      </span>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-lg text-red-600">
                  <XCircle className="h-6 w-6" />
                  <span>Error al Procesar Servicios</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {serviceRequests.length > 0 ? (
            <div className="py-6 text-center space-y-4">
              <Alert 
                variant="default" 
                className={hasPendingMercadoPagoPayments ? 
                  "bg-yellow-50 border-yellow-200" : 
                  "bg-green-50 border-green-200"
                }
              >
                <CheckCircle className={`h-5 w-5 ${hasPendingMercadoPagoPayments ? "text-yellow-600" : "text-green-600"}`} />
                <AlertTitle>
                  {hasPendingMercadoPagoPayments ? 
                    "Solicitudes pendientes de pago" : 
                    "Solicitudes confirmadas"
                  }
                </AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="text-lg font-semibold mb-2">
                    Números de solicitud:
                  </p>
                  <div className="space-y-2">
                    {serviceRequests.map((request, index) => (
                      <div 
                        key={index}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          request.paymentConfirmed ? 
                            "bg-green-100" : 
                            (request.requestData.MetodoPagosID === 4 ? "bg-yellow-100" : "bg-green-100")
                        }`}
                      >
                        <div className="text-left">
                          <div 
                            className={`text-xl font-bold cursor-pointer hover:text-opacity-80 transition-colors flex items-center gap-2 ${
                              request.paymentConfirmed ? 
                                "text-green-600 hover:text-green-700" : 
                                (request.requestData.MetodoPagosID === 4 ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700")
                            }`}
                            onClick={() => handleViewServiceDetails(request)}
                          >
                            #{request.solicitudId}
                            <Eye className="h-4 w-4" />
                            {request.requestData.MetodoPagosID === 4 && !request.paymentConfirmed && checkingPayment && (
                              <Loader2 className="h-4 w-4 animate-spin ml-1" />
                            )}
                            {request.requestData.MetodoPagosID === 4 && request.paymentConfirmed && (
                              <span className="text-sm ml-1 bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                Pago confirmado
                              </span>
                            )}
                          </div>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => handleViewDebugData(
                            request.requestData, 
                            `JSON Solicitud #${request.solicitudId}`
                          )}
                        >
                          <Code className="h-4 w-4" />
                          Debug
                        </Button>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>

              {paymentCheckResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Historial de verificación de pagos</CardTitle>
                  </CardHeader>
                  <CardContent className="max-h-40 overflow-y-auto text-xs">
                    <div className="space-y-2">
                      {paymentCheckResults.map((result, index) => (
                        <div key={index} className={`p-2 rounded ${result.isPaid ? "bg-green-50" : result.error ? "bg-red-50" : "bg-gray-50"}`}>
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Solicitud #{result.solicitudId}</span>
                            <span className="text-gray-500">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="mt-1 text-left">
                            {result.error ? (
                              <span className="text-red-500">Error: {result.error}</span>
                            ) : (
                              <span>Respuesta: {JSON.stringify(result.responseData)}</span>
                            )}
                            {result.rawResponse && (
                              <div className="mt-1 text-gray-600">
                                Texto crudo: {result.rawResponse.substring(0, 50)}{result.rawResponse.length > 50 ? '...' : ''}
                              </div>
                            )}
                          </div>
                          <div className="mt-1 font-semibold text-left">
                            {result.isPaid ? (
                              <span className="text-green-600">¡Pago confirmado! (Pagado="S")</span>
                            ) : result.error ? (
                              <span className="text-red-600">Error de verificación</span>
                            ) : (
                              <span className="text-yellow-600">Pago pendiente (Pagado≠"S")</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {hasPendingMercadoPagoPayments && (
                <div className="space-y-4">
                  <MercadoPagoPayment 
                    onPaymentClick={() => {
                      const firstUnconfirmedRequest = serviceRequests.find(
                        req => req.requestData.MetodoPagosID === 4 && !req.paymentConfirmed
                      );
                      if (firstUnconfirmedRequest) {
                        handlePaymentLink(firstUnconfirmedRequest.solicitudId);
                      }
                    }}
                    isProcessing={checkingPayment}
                  />
                  
                  {serviceRequests.length > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-1 mx-auto"
                      onClick={() => {
                        const firstRequest = serviceRequests.find(
                          req => req.requestData.MetodoPagosID === 4 && !req.paymentConfirmed
                        ) || serviceRequests[0];
                        if (firstRequest) {
                          const paymentUrl = `http://109.199.100.16:80/PasarelaPagos.NetEnvironment/procesarpago.aspx?S${firstRequest.solicitudId}`;
                          handleViewDebugData(
                            { 
                              url: paymentUrl,
                              solicitudId: firstRequest.solicitudId,
                              checkPaymentUrl: `http://109.199.100.16/AlmangoXV1NETFramework/WebAPI/ConsultarPagoPendiente?Solicitudesid=${firstRequest.solicitudId}`
                            }, 
                            "URLs de Pago y Verificación"
                          );
                        }
                      }}
                    >
                      <Code className="h-4 w-4" />
                      Debug MP URLs
                    </Button>
                  )}

                  <Button
                    size="sm"
                    onClick={checkPendingPayments}
                    disabled={checkingPayment}
                    className="flex items-center gap-1 mx-auto"
                  >
                    {checkingPayment ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Verificar pago ahora
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="py-6 text-center space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertTitle>Error en la solicitud</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          )}

          <DialogFooter>
            <Button onClick={handleCloseResultDialog} className="w-full">
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle de la Solicitud</DialogTitle>
          </DialogHeader>
          
          {selectedRequestData && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                      <p className="text-lg">{selectedRequestData.Nombre}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                      <p className="text-lg">{selectedRequestData.Telefono}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-lg">{selectedRequestData.Mail || "No especificado"}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                    <p className="text-lg">{selectedRequestData.Direccion}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Detalles de la Instalación</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                      <p className="text-lg">
                        {format(new Date(selectedRequestData.FechaInstalacion), "dd/MM/yyyy")}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Turno</p>
                      <p className="text-lg">{formatTimeSlot(selectedRequestData.TurnoInstalacion)}</p>
                    </div>
                  </div>
                  {selectedRequestData.Comentario && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Comentarios</p>
                      <p className="text-lg">{selectedRequestData.Comentario}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Servicios Solicitados</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descripción</TableHead>
                        <TableHead className="text-center">Cantidad</TableHead>
                        <TableHead className="text-right">Precio</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRequestData.Level1.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">
                            {item.productoNombre || selectedRequestData.serviceName}
                            {formatLocationInfo(
                              selectedRequestData.DepartamentoId?.toString(),
                              selectedRequestData.MunicipioId?.toString(),
                              departments,
                              municipalities
                            ) && (
                              <div className="text-sm text-muted-foreground">
                                Ubicación: {formatLocationInfo(
                                  selectedRequestData.DepartamentoId?.toString(),
                                  selectedRequestData.MunicipioId?.toString(),
                                  departments,
                                  municipalities
                                )}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-center">{item.Cantidad}</TableCell>
                          <TableCell className="text-right">${item.Precio.toFixed(2)}</TableCell>
                          <TableCell className="text-right">${item.PrecioFinal.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right font-semibold">Total</TableCell>
                        <TableCell className="text-right font-bold">
                          ${calcularTotal(selectedRequestData.Level1).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Información de Pago</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Forma de Pago</p>
                      <p className="text-lg font-medium">
                        {getFormaDePago(selectedRequestData.MetodoPagosID)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Estado</p>
                      <p className={`text-lg font-medium ${
                        selectedRequestData.MetodoPagosID === 1 ? 
                          "text-blue-600" : 
                          (selectedRequestData.SolicitudPagada === "S" ? "text-green-600" : "text-yellow-600")
                      }`}>
                        {selectedRequestData.MetodoPagosID === 1 ? 
                          "Pago en el domicilio" : 
                          (selectedRequestData.SolicitudPagada === "S" ? "PAGADO" : "PENDIENTE")
                        }
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showDebugDialog} onOpenChange={setShowDebugDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{debugTitle || "Debug Data"}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <pre className="bg-gray-100 p-4 rounded-md overflow-x-auto text-xs">
              {debugData ? JSON.stringify(debugData, null, 2) : "No data available"}
            </pre>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowDebugDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckoutSummary;
