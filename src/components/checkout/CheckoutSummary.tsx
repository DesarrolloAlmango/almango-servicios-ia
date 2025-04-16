
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
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
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
  const [solicitudId, setSolicitudId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);

  // Resetea los estados cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setSolicitudId(null);
      setError(null);
      setShowResultDialog(false);
    }
  }, [isOpen]);

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Tomar solo el primer objeto del array (eliminar los corchetes)
      const checkoutItem = data.length > 0 ? data[0] : null;
      
      if (!checkoutItem) {
        throw new Error("No hay datos para procesar");
      }
      
      // Prepara el JSON para la solicitud (sin corchetes)
      const jsonSolicitud = JSON.stringify(checkoutItem);
      
      // Construye la URL con los parámetros requeridos
      const url = new URL("/api/AlmangoXV1NETFramework/WebAPI/AltaSolicitud", window.location.origin);
      url.searchParams.append("Userconect", "NoEmpty");
      url.searchParams.append("Key", "d3d3LmF6bWl0YS5jb20="); // Valor correcto
      url.searchParams.append("Proveedorid", "0");
      url.searchParams.append("Usuarioid", "0");
      url.searchParams.append("Jsonsolicitud", jsonSolicitud);

      // Realiza la llamada al endpoint
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
      }

      // Parsea el resultado (retorna un objeto con SolicitudesID)
      const result = await response.json();
      
      // Verifica si el ID es mayor que cero para considerarlo exitoso
      if (result && typeof result.SolicitudesID !== 'undefined' && result.SolicitudesID > 0) {
        setSolicitudId(result.SolicitudesID);
        setShowResultDialog(true);
      } else {
        throw new Error("La solicitud no pudo ser procesada correctamente");
      }
    } catch (err) {
      console.error("Error al enviar la solicitud:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al procesar la solicitud");
      setShowResultDialog(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseResultDialog = () => {
    setShowResultDialog(false);
    onClose(solicitudId !== null);
    // Redirigir a la página de Servicios
    navigate('/servicios');
  };

  return (
    <>
      <AlertDialog open={isOpen} onOpenChange={(open) => {
        if (!open && !solicitudId && !error) {
          onClose(false);
        }
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Servicio</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que deseas contratar este servicio?
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
          className="max-w-md" 
          onPointerDownOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
          hideCloseButton={true} // Ocultar el botón X para cerrar
        >
          <DialogHeader>
            <DialogTitle className="text-center">
              {solicitudId !== null ? (
                <div className="flex items-center justify-center gap-2 text-lg text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span>¡Servicio Confirmado!</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2 text-lg text-red-600">
                  <XCircle className="h-6 w-6" />
                  <span>Error al Procesar Servicio</span>
                </div>
              )}
            </DialogTitle>
          </DialogHeader>

          {solicitudId !== null ? (
            <div className="py-6 text-center space-y-4">
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle>Solicitud exitosa</AlertTitle>
                <AlertDescription className="mt-2">
                  <p className="text-lg font-semibold mb-2">
                    Tu número de solicitud es:
                  </p>
                  <div className="text-3xl font-bold text-green-600 py-3 px-6 rounded-lg bg-green-100 inline-block mx-auto">
                    {solicitudId}
                  </div>
                  <p className="text-sm text-muted-foreground mt-4">
                    Guarda este número para futuras consultas sobre tu servicio.
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
