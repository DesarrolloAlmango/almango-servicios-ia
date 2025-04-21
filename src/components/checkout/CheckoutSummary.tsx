
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
import { CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";

interface CheckoutSummaryProps {
  isOpen: boolean;
  onClose: (success: boolean) => void;
  data: CheckoutData[];
}

interface RequestResult {
  solicitudId: number;
  error: string | null;
  serviceCategory?: string;
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState<RequestResult[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [allCompleted, setAllCompleted] = useState(false);

  // Resetea los estados cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setResults([]);
      setError(null);
      setShowResultDialog(false);
      setCurrentItemIndex(0);
      setAllCompleted(false);
    }
  }, [isOpen]);

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setResults([]);
      setCurrentItemIndex(0);
      
      if (data.length === 0) {
        throw new Error("No hay datos para procesar");
      }
      
      // Procesar la primera solicitud
      await processNextItem();
      
    } catch (err) {
      console.error("Error al iniciar las solicitudes:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al procesar la solicitud");
      setShowResultDialog(true);
      setSubmitting(false);
    }
  };

  const processNextItem = async () => {
    try {
      if (currentItemIndex >= data.length) {
        // Todas las solicitudes han sido procesadas
        setAllCompleted(true);
        setSubmitting(false);
        setShowResultDialog(true);
        return;
      }

      const checkoutItem = data[currentItemIndex];
      
      // Preparar el JSON para la solicitud (sin corchetes)
      const jsonSolicitud = JSON.stringify(checkoutItem);
      
      // Construir la URL con los parámetros requeridos
      const url = new URL("/api/AlmangoXV1NETFramework/WebAPI/AltaSolicitud", window.location.origin);
      url.searchParams.append("Userconect", "NoEmpty");
      url.searchParams.append("Key", "d3d3LmF6bWl0YS5jb20="); // Valor correcto
      url.searchParams.append("Proveedorid", "0");
      url.searchParams.append("Usuarioid", "0");
      url.searchParams.append("Jsonsolicitud", jsonSolicitud);

      // Realizar la llamada al endpoint
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
      }

      // Parsear el resultado
      const result = await response.json();
      
      // Verificar si el ID es mayor que cero para considerarlo exitoso
      if (result && typeof result.SolicitudesID !== 'undefined' && result.SolicitudesID > 0) {
        // Obtener la categoría del servicio de manera segura
        const serviceCategory = checkoutItem.items?.[0]?.serviceCategory || "Servicio";
        
        // Añadir el resultado exitoso
        setResults(prev => [...prev, { 
          solicitudId: result.SolicitudesID, 
          error: null,
          serviceCategory 
        }]);
        
        // Mostrar notificación de éxito
        toast({
          title: "Solicitud registrada",
          description: `Solicitud #${result.SolicitudesID} creada exitosamente`,
        });
        
        // Procesar el siguiente ítem
        setCurrentItemIndex(prev => prev + 1);
        setTimeout(() => processNextItem(), 500); // Pequeña pausa entre solicitudes
      } else {
        throw new Error("La solicitud no pudo ser procesada correctamente");
      }
    } catch (err) {
      console.error(`Error al procesar la solicitud ${currentItemIndex + 1}:`, err);
      
      // Obtener la categoría del servicio de manera segura
      const serviceCategory = data[currentItemIndex]?.items?.[0]?.serviceCategory || "Servicio";
      
      // Registrar el error para este ítem
      setResults(prev => [...prev, { 
        solicitudId: 0, 
        error: err instanceof Error ? err.message : "Error desconocido",
        serviceCategory
      }]);
      
      // Intentar con el siguiente ítem a pesar del error
      setCurrentItemIndex(prev => prev + 1);
      setTimeout(() => processNextItem(), 500);
    }
  };

  const handleCloseResultDialog = () => {
    setShowResultDialog(false);
    onClose(results.some(r => r.solicitudId > 0));
    // Redirigir a la página de Servicios
    navigate('/servicios');
  };

  const handleViewDetails = (solicitudId: number) => {
    // Aquí puedes implementar la navegación a la página de detalles
    // Por ahora, mostraremos un mensaje en el toast
    toast({
      title: "Detalles de solicitud",
      description: `Ver detalles de la solicitud #${solicitudId}`,
    });
    
    // Una implementación futura podría navegar a una página de detalles
    // navigate(`/solicitudes/${solicitudId}`);
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={(open) => {
        if (!open && !results.length && !error) {
          onClose(false);
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Servicio</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas contratar {data.length > 1 ? `estos ${data.length} servicios` : "este servicio"}?
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

      {/* Diálogo persistente para mostrar resultados - Sin botón X para cerrar */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog} modal={true}>
        <DialogContent 
          className="max-w-lg" 
          onPointerDownOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
          hideCloseButton={true} // Ocultar el botón X para cerrar
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              {results.some(r => r.solicitudId > 0) ? (
                <div className="flex items-center justify-center gap-2 text-lg text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span>¡Servicio{results.length > 1 ? "s" : ""} Confirmado{results.length > 1 ? "s" : ""}!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-lg text-red-600">
                  <XCircle className="h-6 w-6" />
                  <span>Error al Procesar Servicio{data.length > 1 ? "s" : ""}</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {/* Mostrar resultados de las solicitudes */}
          <div className="py-4 text-center space-y-4">
            {submitting && !allCompleted ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">
                  Procesando servicio {currentItemIndex + 1} de {data.length}...
                </p>
              </div>
            ) : results.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Resumen de solicitudes</h3>
                <div className="space-y-2">
                  {results.map((result, index) => (
                    <div key={index} className={`border rounded-lg p-3 ${result.solicitudId > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {result.solicitudId > 0 ? (
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                          )}
                          <div className="text-left">
                            <p className="font-medium">{result.serviceCategory || `Servicio ${index + 1}`}</p>
                            {result.solicitudId > 0 ? (
                              <p className="text-green-700 flex items-center gap-1">
                                Solicitud: 
                                <Button 
                                  variant="link" 
                                  className="p-0 h-auto text-green-600 hover:text-green-800 flex items-center"
                                  onClick={() => handleViewDetails(result.solicitudId)}
                                >
                                  #{result.solicitudId}
                                  <ExternalLink className="ml-1 h-3 w-3" />
                                </Button>
                              </p>
                            ) : (
                              <p className="text-red-700">{result.error}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertTitle>Error en la solicitud</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            ) : null}
          </div>

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
