
import React, { useState, useEffect } from "react";
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
import { CheckCircle, XCircle, Loader2, Search } from "lucide-react";
import { CheckoutData, ServiceRequest } from "@/types/checkoutTypes";
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

interface CheckoutSummaryProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
  data: CheckoutData[];
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [processingService, setProcessingService] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setServiceRequests([]);
      setError(null);
      setShowResultDialog(false);
      setProcessingService(null);
      setSelectedServiceId(null);
    }
  }, [isOpen]);

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

      // Procesar cada servicio secuencialmente
      for (const serviceData of data) {
        setProcessingService(serviceData.serviceName || 'Servicio');
        const solicitudId = await processServiceRequest(serviceData);
        setServiceRequests(prev => [...prev, {
          solicitudId,
          serviceName: serviceData.serviceName || 'Servicio'
        }]);
      }

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

  const handleViewServiceDetails = (solicitudId: number) => {
    setSelectedServiceId(solicitudId);
    // Aquí se podría implementar la lógica para mostrar los detalles de la solicitud
    console.log(`Ver detalles de la solicitud: ${solicitudId}`);
  };

  return (
    <>
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
                <div className="flex items-center justify-center gap-2 text-lg text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span>¡Servicios Confirmados!</span>
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
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle>Solicitudes exitosas</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="text-lg font-semibold mb-2">
                    Números de solicitud:
                  </p>
                  <div className="space-y-2">
                    {serviceRequests.map((request, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-green-100"
                      >
                        <div className="text-left">
                          <span className="text-sm text-green-700">{request.serviceName}</span>
                          <div className="text-xl font-bold text-green-600">
                            #{request.solicitudId}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="ml-2"
                          onClick={() => handleViewServiceDetails(request.solicitudId)}
                        >
                          <Search className="h-4 w-4 mr-1" />
                          Ver detalle
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Guarda estos números para futuras consultas sobre tus servicios.
                  </p>
                </AlertDescription>
              </Alert>
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
    </>
  );
};

export default CheckoutSummary;
