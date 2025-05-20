
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

interface ResultDialogProps {
  isOpen: boolean;
  onClose: () => void;
  serviceRequests: ServiceRequest[];
  error: string | null;
  checkingPayment: boolean;
  onPaymentClick: (solicitudId: number) => void;
  onViewServiceDetails: (request: ServiceRequest) => void;
}

const ResultDialog: React.FC<ResultDialogProps> = ({
  isOpen,
  onClose,
  serviceRequests,
  error,
  checkingPayment,
  onPaymentClick,
  onViewServiceDetails,
}) => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState("");
  const hasPendingMercadoPagoPayments = serviceRequests.some(
    req => req.requestData.MetodoPagosID === 4 && !req.paymentConfirmed
  );

  const handleClose = () => {
    onClose();
    navigate('/'); // Redirect to home page on close
  };

  const handleFeedbackSubmit = () => {
    if (feedback.trim()) {
      // Here you would implement sending the feedback to your backend
      console.log("Sending feedback:", feedback);
      toast.success("¡Gracias por tu feedback!");
      setFeedback(""); // Clear the feedback input
    }
  };

  const handleWhatsAppClick = () => {
    window.open("https://api.whatsapp.com/send?phone=+59892612655&text=Hola%2C+Me+interesa+contratar+un+servicio.", "_blank");
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

            {/* Feedback textarea */}
            <div className="mt-6 space-y-2">
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
            </div>
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
