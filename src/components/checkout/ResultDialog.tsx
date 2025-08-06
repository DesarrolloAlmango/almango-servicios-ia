import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Eye, MessageSquare } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ServiceRequest } from "@/types/checkoutTypes";
import MercadoPagoPayment from "./MercadoPagoPayment";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { formatTimeSlot, formatLocationInfo } from "@/utils/timeUtils";
import { format } from "date-fns";

interface ResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequests: ServiceRequest[];
  error: string | null;
  checkingPayment: boolean;
  onPaymentClick: (solicitudId: number) => void;
  onViewServiceDetails: (request: ServiceRequest) => void;
  departments: Array<{id: string, name: string}>;
  municipalities: Record<string, Array<{id: string, name: string}>>;
}

const ResultDialog: React.FC<ResultDialogProps> = ({
  isOpen,
  onClose,
  serviceRequests,
  error,
  checkingPayment,
  onPaymentClick,
  onViewServiceDetails,
  departments,
  municipalities,
}) => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [sendingFeedback, setSendingFeedback] = useState(false);
  
  const hasPendingMercadoPagoPayments = serviceRequests.some(
    req => req.requestData.MetodoPagosID === 4 && !req.paymentConfirmed
  );
  
  // Check if all MercadoPago payments are confirmed (for showing feedback and WhatsApp)
  const allMercadoPagoPaymentsConfirmed = serviceRequests.every(
    req => req.requestData.MetodoPagosID !== 4 || req.paymentConfirmed
  );

  const handleClose = () => {
    onClose();
    navigate('/'); // Redirect to home page on close
  };

  const sendFeedbackToAPI = async (feedbackText: string) => {
    if (!feedbackText.trim() || serviceRequests.length === 0) {
      return { success: false, error: "No hay feedback o solicitudes para enviar" };
    }

    try {
      // Prepare the parameters for the API call
      const solicitudIds = serviceRequests.map(req => req.solicitudId).join(', ');
      const clientName = serviceRequests[0]?.requestData?.Nombre || 'Cliente';
      const nombreParam = `(${solicitudIds}) ${clientName}`;
      
      const url = new URL("https://app.almango.com.uy/WebAPI/OrganizarMail");
      url.searchParams.append("Maildesignid", "7");
      url.searchParams.append("Maildesigntipo", "N");
      url.searchParams.append("Email", "");
      url.searchParams.append("Nombre", nombreParam);
      url.searchParams.append("Urladjunto", "");
      url.searchParams.append("Htmltext", feedbackText);

      console.log("Sending feedback to API:", url.toString());

      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (result.Ok === true || result.Ok === "true") {
        return { success: true };
      } else {
        return { success: false, error: result.ErrorDescription || "Error desconocido al enviar feedback" };
      }
    } catch (error) {
      console.error("Error sending feedback:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Error de conexión al enviar feedback" 
      };
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim()) {
      toast.error("Por favor ingresa tu mensaje antes de enviar");
      return;
    }

    // Immediately hide the form and show loading state
    setFeedbackSent(true);
    setSendingFeedback(true);
    
    try {
      const result = await sendFeedbackToAPI(feedback);
      
      if (result.success) {
        toast.success("¡Gracias por tu feedback! Tu mensaje ha sido enviado correctamente.");
        setFeedback(""); // Clear the feedback input
      } else {
        toast.error(result.error || "Error al enviar el feedback");
      }
    } catch (error) {
      console.error("Error in handleFeedbackSubmit:", error);
      toast.error("Error inesperado al enviar el feedback");
    } finally {
      setSendingFeedback(false);
    }
  };

  const formatServiceRequestsForWhatsApp = () => {
    if (serviceRequests.length === 0) return "Hola%2C+Me+interesa+contratar+un+servicio.";
    
    let message = "Hola%2C+aquí+están+los+detalles+de+mis+solicitudes%3A%0A%0A";
    
    serviceRequests.forEach((request, index) => {
      const data = request.requestData;
      
      message += `*SOLICITUD+%23${request.solicitudId}*%0A`;
      message += `Servicio%3A+${encodeURIComponent(request.serviceName)}%0A`;
      
      // Información Personal
      message += `%0A*Información+Personal%3A*%0A`;
      message += `Nombre%3A+${encodeURIComponent(data.Nombre || 'No especificado')}%0A`;
      message += `Teléfono%3A+${encodeURIComponent(data.Telefono || 'No especificado')}%0A`;
      message += `Email%3A+${encodeURIComponent(data.Mail || 'No especificado')}%0A`;
      
      // Departamento y Localidad - usar nombres en lugar de IDs
      const locationInfo = formatLocationInfo(
        data.DepartamentoId?.toString(), 
        data.MunicipioId?.toString(), 
        departments, 
        municipalities
      );
      if (locationInfo) {
        const [departmentName, municipalityName] = locationInfo.split(', ');
        message += `Departamento%3A+${encodeURIComponent(departmentName || 'No especificado')}%0A`;
        message += `Localidad%3A+${encodeURIComponent(municipalityName || 'No especificada')}%0A`;
      } else {
        message += `Departamento%3A+No+especificado%0A`;
        message += `Localidad%3A+No+especificada%0A`;
      }
      
      // Detalles de la Instalación
      message += `%0A*Detalles+de+la+Instalación%3A*%0A`;
      message += `Dirección%3A+${encodeURIComponent(data.Direccion || 'No especificada')}%0A`;
      
      // Formatear la fecha de DD/MM/YYYY
      let formattedDate = 'No especificada';
      if (data.FechaInstalacion) {
        try {
          const date = new Date(data.FechaInstalacion);
          formattedDate = format(date, 'dd/MM/yyyy');
        } catch (error) {
          console.error('Error formatting date:', error);
        }
      }
      message += `Fecha%3A+${encodeURIComponent(formattedDate)}%0A`;
      
      // Formatear el horario usando formatTimeSlot
      const formattedTimeSlot = formatTimeSlot(data.TurnoInstalacion || "");
      message += `Horario%3A+${encodeURIComponent(formattedTimeSlot)}%0A`;
      
      // Comentarios
      if (data.Comentario && data.Comentario.trim()) {
        message += `Comentarios%3A+${encodeURIComponent(data.Comentario)}%0A`;
      }
      
      // Servicios Solicitados
      message += `%0A*Servicios+Solicitados%3A*%0A`;
      if (data.Level1 && Array.isArray(data.Level1)) {
        data.Level1.forEach((item: any) => {
          const quantity = item.Cantidad || 1;
          const price = item.Precio || 0;
          const finalPrice = item.PrecioFinal || 0;
          
          // Use the service name as product description (same as shown in request details)
          const productDescription = request.serviceName || `Producto ${item.ProductoID}`;
          message += `${encodeURIComponent(productDescription)}+-+Cantidad%3A+${quantity}+-+Precio%3A+%24${price.toLocaleString()}+-+Precio+Final%3A+%24${finalPrice.toLocaleString()}%0A`;
        });
        
        // Costo adicional por zona si existe
        const zoneCost = data.CostoXZona || 0;
        if (zoneCost > 0) {
          message += `Adicional+por+zona%3A+%24${zoneCost.toLocaleString()}%0A`;
        }
        
        // Total
        const itemsTotal = data.Level1.reduce((sum: number, item: any) => {
          return sum + (item.PrecioFinal || 0);
        }, 0);
        const total = itemsTotal + zoneCost;
        message += `*Total%3A+%24${total.toLocaleString()}*%0A`;
      }
      
      // Información de Pago
      message += `%0A*Información+de+Pago%3A*%0A`;
      let paymentMethod = 'No especificado';
      if (data.MetodoPagosID === 1) paymentMethod = 'Efectivo';
      else if (data.MetodoPagosID === 2) paymentMethod = 'Transferencia bancaria';
      else if (data.MetodoPagosID === 3) paymentMethod = 'Débito/Crédito en el lugar';
      else if (data.MetodoPagosID === 4) paymentMethod = 'MercadoPago';
      
      message += `Método+de+pago%3A+${encodeURIComponent(paymentMethod)}%0A`;
      
      if (request.paymentConfirmed) {
        message += `Estado+del+pago%3A+Confirmado%0A`;
      } else if (data.MetodoPagosID === 4) {
        message += `Estado+del+pago%3A+Pendiente%0A`;
      }
      
      if (index < serviceRequests.length - 1) {
        message += "%0A" + "─".repeat(30) + "%0A%0A";
      }
    });
    
    message += "%0A%0A¿Podrían+ayudarme+con+estas+solicitudes%3F";
    
    return message;
  };

  const handleWhatsAppClick = () => {
    const formattedMessage = formatServiceRequestsForWhatsApp();
    window.open(`https://api.whatsapp.com/send?phone=+59892612655&text=${formattedMessage}`, "_blank");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
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
                      ¡Solicitudes pendientes de pago!
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
                      ¡Todo listo, el servicio está confirmado!
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
                          onClick={() => onViewServiceDetails(request)}
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
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
            
            {hasPendingMercadoPagoPayments && (
              <div className="space-y-4">
                <MercadoPagoPayment 
                  onPaymentClick={() => {
                    const firstUnconfirmedRequest = serviceRequests.find(
                      req => req.requestData.MetodoPagosID === 4 && !req.paymentConfirmed
                    );
                    if (firstUnconfirmedRequest) {
                      onPaymentClick(firstUnconfirmedRequest.solicitudId);
                    }
                  }}
                  isProcessing={checkingPayment}
                />
              </div>
            )}

            {/* Feedback section - only show when all payments are confirmed */}
            {allMercadoPagoPaymentsConfirmed && (
              <div className="mt-6 space-y-2">
                {feedbackSent ? (
                  // Show success message after feedback is sent
                  <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                    <p className="text-green-600 font-medium">
                      {sendingFeedback ? (
                        <span className="flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enviando tu sugerencia...
                        </span>
                      ) : (
                        "¡Gracias por tu feedback! Tu sugerencia se envió correctamente."
                      )}
                    </p>
                  </div>
                ) : (
                  // Show feedback form if not sent yet
                  <div className="text-left mb-2 text-gray-700">
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                      ¿Cómo podemos mejorar? Te leemos...
                    </label>
                    <Textarea
                      id="feedback"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder="Tu opinión nos ayuda a mejorar..."
                      className="w-full"
                      rows={3}
                    />
                    <div className="mt-2 text-right">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleFeedbackSubmit} 
                        disabled={!feedback.trim()}
                      >
                        <MessageSquare className="mr-1 h-4 w-4" />
                        Enviar
                      </Button>
                    </div>
                  </div>
                )}
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

        {/* WhatsApp section - only show when all payments are confirmed */}
        {allMercadoPagoPaymentsConfirmed && serviceRequests.length > 0 && (
          <div className="mt-2 text-center text-sm text-gray-600 flex flex-col items-center">
            <p className="mb-2">¿Tenés consultas? Escribinos por WhatsApp</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleWhatsAppClick} 
              className="bg-green-500 hover:bg-green-600 text-white border-green-600"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="mr-2"
              >
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                <path d="M9.5 13.5c.5 1 1.5 1 2.5 1s2 0 2.5-1" />
              </svg>
              Contactar por WhatsApp
            </Button>
          </div>
        )}

        <DialogFooter className="mt-4">
          <Button onClick={handleClose} className="w-full">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResultDialog;
