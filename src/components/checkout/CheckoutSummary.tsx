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
import { CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

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
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<CheckoutData | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState<string>("");
  const [isRedirecting, setIsRedirecting] = useState(false);

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

      for (const serviceData of data) {
        setProcessingService(serviceData.serviceName || 'Servicio');
        const solicitudId = await processServiceRequest(serviceData);
        setServiceRequests(prev => [...prev, {
          solicitudId,
          serviceName: serviceData.serviceName || 'Servicio',
          requestData: serviceData
        }]);

        if (serviceData.MetodoPagosID === 4) {
          setIsRedirecting(true);
          setTimeout(() => {
            window.open(`http://109.199.100.16:80/PasarelaPagos.NetEnvironment/procesarpago.aspx?S${solicitudId}`, '_blank');
            setIsRedirecting(false);
          }, 2000);
        }
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

  const handleViewServiceDetails = (request: ServiceRequest) => {
    setSelectedRequestData(request.requestData);
    setShowDetailDialog(true);
  };

  const getTurnoLabel = (turno: string) => {
    switch (turno.toLowerCase()) {
      case "am":
        return "Mañana (8:00 - 12:00)";
      case "pm":
        return "Tarde (13:00 - 17:00)";
      default:
        return turno;
    }
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
                <div className="flex items-center justify-center gap-2 text-lg">
                  {isRedirecting ? (
                    <Loader2 className="h-6 w-6 animate-spin text-yellow-600" />
                  ) : (
                    <CheckCircle className="h-6 w-6 text-yellow-600" />
                  )}
                  <span className="text-yellow-600">
                    {isRedirecting ? 
                      "Redireccionando a Mercado Pago..." : 
                      "¡Servicios Confirmados! (Pendiente de Pago)"
                    }
                  </span>
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
              <Alert variant="default" className="bg-yellow-50 border-yellow-200">
                <CheckCircle className="h-5 w-5 text-yellow-600" />
                <AlertTitle>Solicitudes pendientes de pago</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="text-lg font-semibold mb-2">
                    Números de solicitud:
                  </p>
                  <div className="space-y-2">
                    {serviceRequests.map((request, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-yellow-100"
                      >
                        <div className="text-left">
                          <div 
                            className="text-xl font-bold text-yellow-600 cursor-pointer hover:text-yellow-700 transition-colors flex items-center gap-2"
                            onClick={() => handleViewServiceDetails(request)}
                          >
                            #{request.solicitudId}
                            <Eye className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Haz clic en el número de solicitud para ver los detalles.
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
                      <p className="text-lg">{getTurnoLabel(selectedRequestData.TurnoInstalacion)}</p>
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
                  <div className="space-y-4">
                    {selectedRequestData.Level1.map((item, index) => (
                      <div key={index} className="p-4 rounded-lg bg-slate-50">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Cantidad</p>
                            <p className="text-lg">{item.Cantidad}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Precio</p>
                            <p className="text-lg">${item.Precio}</p>
                          </div>
                        </div>
                        <Separator className="my-4" />
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Precio Final</p>
                          <p className="text-lg">${item.PrecioFinal}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setShowDetailDialog(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog 
        open={showPaymentModal} 
        onOpenChange={(open) => {
          if (!open) {
            setShowPaymentModal(false);
            onClose(true);
          }
        }}
      >
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Procesar Pago</DialogTitle>
            <DialogDescription>
              Se abrirá la página de Mercado Pago para completar tu pago.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center p-4">
            <iframe 
              src={paymentUrl}
              className="w-full h-[600px] border-0"
              title="Mercado Pago"
            />
          </div>

          <DialogFooter>
            <Button onClick={() => {
              setShowPaymentModal(false);
              onClose(true);
            }}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CheckoutSummary;
