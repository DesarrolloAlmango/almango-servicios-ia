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
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { CheckoutData, ServiceRequest } from "@/types/checkoutTypes";
import ResultDialog from "./ResultDialog";
import RequestDetailsDialog from "./RequestDetailsDialog";
import { useMercadoPagoPayment } from "./useMercadoPagoPayment";

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
  const [isRedirecting, setIsRedirecting] = useState(false);
  const paymentLinkRef = useRef<HTMLAnchorElement>(null);
  const [departments, setDepartments] = useState<Array<{id: string, name: string}>>([]);
  const [municipalities, setMunicipalities] = useState<Record<string, Array<{id: string, name: string}>>>({});
  const [showBlockingOverlay, setShowBlockingOverlay] = useState(false); // State for blocking overlay

  // Use the custom hook for MercadoPago payment handling
  const {
    checkingPayment,
    paymentStatusChecked,
    checkPendingPayments,
  } = useMercadoPagoPayment(
    serviceRequests, 
    setServiceRequests,
    showResultDialog,
    selectedRequestData,
    setSelectedRequestData,
    selectedServiceId
  );

  useEffect(() => {
    if (!isOpen) {
      // Clear state when dialog is closed to prevent stale UI
      setServiceRequests([]);
      setError(null);
      setShowResultDialog(false);
      setProcessingService(null);
      setSelectedServiceId(null);
      setShowDetailDialog(false);
      setSelectedRequestData(null);
      setIsRedirecting(false);
      setSubmitting(false); // Reset submitting state
      setShowBlockingOverlay(false); // Hide blocking overlay
    }
  }, [isOpen]);

  const processServiceRequest = async (serviceData: CheckoutData): Promise<number> => {
    try {
      // Get the provider ID from the ProveedorAuxiliar field
      const providerId = serviceData.ProveedorAuxiliar && serviceData.ProveedorAuxiliar.trim() !== "" ? 
                        (serviceData.ProveedorAuxiliar === "No lo sé" ? "0" : serviceData.ProveedorAuxiliar) : 
                        "0";
      
      // Optimize JSON by removing unnecessary fields and shortening values
      const optimizedData = {
        Nombre: serviceData.Nombre,
        Telefono: serviceData.Telefono,
        Mail: serviceData.Mail,
        PaisISO: serviceData.PaisISO,
        DepartamentoId: serviceData.DepartamentoId,
        MunicipioId: serviceData.MunicipioId,
        ZonasID: serviceData.ZonasID,
        Direccion: serviceData.Direccion,
        MetodoPagosID: serviceData.MetodoPagosID,
        SolicitudPagada: "",
        SolicitaCotizacion: serviceData.SolicitaCotizacion,
        SolicitaOtroServicio: "",
        OtroServicioDetalle: "",
        FechaInstalacion: serviceData.FechaInstalacion,
        TurnoInstalacion: serviceData.TurnoInstalacion,
        Comentario: serviceData.Comentario || "",
        ConfirmarCondicionesUso: "S",
        ProveedorAuxiliar: serviceData.ProveedorAuxiliar,
        CostoXZona: serviceData.CostoXZona,
        Level1: serviceData.Level1.map(item => ({
          RubrosId: item.RubrosId,
          ProductoID: item.ProductoID,
          DetalleID: item.DetalleID,
          Cantidad: item.Cantidad,
          Precio: item.Precio,
          SR: "N",
          Comision: 0,
          ComisionTipo: "P",
          PrecioFinal: item.PrecioFinal
        }))
      };

      const jsonSolicitud = JSON.stringify(optimizedData);
      const url = new URL("https://app.almango.com.uy/WebAPI/AltaSolicitud", window.location.origin);
      url.searchParams.append("Userconect", "NoEmpty");
      url.searchParams.append("Key", "d3d3LmF6bWl0YS5jb20=");
      url.searchParams.append("Proveedorid", providerId);
      url.searchParams.append("Usuarioid", "0");
      url.searchParams.append("Jsonsolicitud", jsonSolicitud);

      console.log("Optimized JSON length:", jsonSolicitud.length);
      console.log("Total URL length:", url.toString().length);

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result || typeof result.SolicitudesID === 'undefined' || result.SolicitudesID <= 0) {
        throw new Error("La solicitud no pudo ser procesada correctamente");
      }

      return result.SolicitudesID;
    } catch (error) {
      console.error("Error processing service request:", error);
      throw error; // Re-throw to be caught by the caller
    }
  };

  const handleSubmitOrder = async () => {
    if (submitting) return; // Prevent multiple submissions
    
    try {
      setSubmitting(true);
      setError(null);
      setServiceRequests([]);

      const processedRequests = [];

      for (const serviceData of data) {
        setProcessingService(serviceData.serviceName || 'Servicio');
        
        try {
          const solicitudId = await processServiceRequest(serviceData);
          
          const requestInfo = {
            solicitudId,
            serviceName: serviceData.serviceName || 'Servicio',
            requestData: serviceData
          };
          
          processedRequests.push(requestInfo);
        } catch (err) {
          // Log individual service errors but continue with others
          console.error(`Error processing service ${serviceData.serviceName}:`, err);
        }
      }

      if (processedRequests.length === 0) {
        throw new Error("No se pudo procesar ninguna solicitud. Por favor intenta nuevamente.");
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
    setSelectedServiceId(request.solicitudId);
    setSelectedRequestData(request.requestData);
    setShowDetailDialog(true);
  };

  const handlePaymentLink = (solicitudId: number) => {
    const paymentUrl = `https://pay.almango.com.uy/procesarpago.aspx?S${solicitudId}`;
    if (paymentLinkRef.current) {
      paymentLinkRef.current.href = paymentUrl;
      paymentLinkRef.current.click();
    }
  };

  return (
    <>
      <a 
        ref={paymentLinkRef} 
        href="about:blank" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ display: 'none' }}
      />

      {/* Full-screen blocking overlay - show when submitting */}
      {submitting && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-background p-6 rounded-lg shadow-lg max-w-sm w-full text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary mb-4" />
            <p className="text-lg font-medium mb-2">Procesando tu solicitud</p>
            <p className="text-muted-foreground">
              {processingService ? `Procesando ${processingService}...` : 'Por favor espera...'}
            </p>
          </div>
        </div>
      )}

      <AlertDialog open={isOpen && !submitting} onOpenChange={(open) => {
        if (!open && !submitting && !serviceRequests.length && !error) {
          onClose(false);
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Servicios</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas contratar estos servicios?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => onClose(false)} disabled={submitting}>
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

      <ResultDialog
        isOpen={showResultDialog}
        onClose={handleCloseResultDialog}
        serviceRequests={serviceRequests}
        error={error}
        checkingPayment={checkingPayment}
        onPaymentClick={handlePaymentLink}
        onViewServiceDetails={handleViewServiceDetails}
      />

      <RequestDetailsDialog
        isOpen={showDetailDialog}
        onClose={() => setShowDetailDialog(false)}
        requestData={selectedRequestData}
        serviceId={selectedServiceId}
        departments={departments}
        municipalities={municipalities}
      />
    </>
  );
};

export default CheckoutSummary;
