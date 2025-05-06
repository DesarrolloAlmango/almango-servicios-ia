
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2, Eye } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ServiceRequest } from "@/types/checkoutTypes";
import MercadoPagoPayment from "./MercadoPagoPayment";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";

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
  const { theme } = useTheme();
  const hasPendingMercadoPagoPayments = serviceRequests.some(
    req => req.requestData.MetodoPagosID === 4 && !req.paymentConfirmed
  );

  const handleClose = () => {
    onClose();
    navigate('/'); // Redirect to home page on close
  };

  const isDarkMode = theme === 'dark';

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal={true}>
      <DialogContent 
        className={`max-w-md ${isDarkMode ? 'dark' : ''}`}
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
          <Button onClick={handleClose} className="w-full">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ResultDialog;
