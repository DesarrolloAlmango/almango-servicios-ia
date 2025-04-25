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
import { useToast } from "@/hooks/use-toast";
import MercadoPagoPayment from "./MercadoPagoPayment";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTimeSlot, formatLocationInfo } from "@/utils/timeUtils";

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
          toast({
            title: "Pago Pendiente",
            description: "Por favor, haz clic en el botón de Mercado Pago para continuar con tu pago.",
            duration: 5000,
          });
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
                  {allMercadoPago ? (
                    <>
                      <CheckCircle className="h-6 w-6 text-yellow-600" />
                      <span className="text-yellow-600">
                        Servicios Confirmados! (Pendiente de Pago)
                      </span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-600" />
                      <span className="text-green-600">
                        Servicios Confirmados!
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
                className={allMercadoPago ? 
                  "bg-yellow-50 border-yellow-200" : 
                  "bg-green-50 border-green-200"
                }
              >
                <CheckCircle className={`h-5 w-5 ${allMercadoPago ? "text-yellow-600" : "text-green-600"}`} />
                <AlertTitle>
                  {allMercadoPago ? 
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
                          allMercadoPago ? "bg-yellow-100" : "bg-green-100"
                        }`}
                      >
                        <div className="text-left">
                          <div 
                            className={`text-xl font-bold cursor-pointer hover:text-opacity-80 transition-colors flex items-center gap-2 ${
                              allMercadoPago ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"
                            }`}
                            onClick={() => handleViewServiceDetails(request)}
                          >
                            #{request.solicitudId}
                            <Eye className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
              {allMercadoPago && (
                <MercadoPagoPayment 
                  onPaymentClick={() => {
                    const firstRequest = serviceRequests[0];
                    if (firstRequest) {
                      handlePaymentLink(firstRequest.solicitudId);
                    }
                  }} 
                />
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
                            {item.DetalleNombre || selectedRequestData.serviceName}
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
                        <TableCell colSpan={3} className="text-right">Total</TableCell>
                        <TableCell className="text-right">${calcularTotal(selectedRequestData.Level1).toFixed(2)}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} className="text-right">Forma de pago</TableCell>
                        <TableCell className="text-right">{getFormaDePago(selectedRequestData.MetodoPagosID)}</TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
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
