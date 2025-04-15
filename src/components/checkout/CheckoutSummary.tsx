
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { CheckoutData } from "@/types/checkoutTypes";
import { toast } from "sonner";
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

interface CheckoutSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  data: CheckoutData[];
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  isOpen,
  onClose,
  data,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [solicitudId, setSolicitudId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Resetea los estados cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setSolicitudId(null);
      setError(null);
      setShowConfirmDialog(false);
    }
  }, [isOpen]);

  const handleConfirmOrder = () => {
    setShowConfirmDialog(true);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmDialog(false);
  };

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setShowConfirmDialog(false);

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
        toast.success(`Solicitud enviada correctamente. Número: ${result.SolicitudesID}`);
      } else {
        throw new Error("La solicitud no pudo ser procesada correctamente");
      }
    } catch (err) {
      console.error("Error al enviar la solicitud:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al procesar la solicitud");
      toast.error("No se pudo procesar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-center">
              {solicitudId !== null ? (
                <div className="flex items-center justify-center gap-2 text-lg text-green-600">
                  <CheckCircle className="h-6 w-6" />
                  <span>¡Solicitud Enviada!</span>
                </div>
              ) : (
                "Resumen de la Compra"
              )}
            </DialogTitle>
          </DialogHeader>

          {solicitudId !== null ? (
            <div className="py-6 text-center space-y-4">
              <p className="text-lg font-semibold">
                Tu número de solicitud es:
              </p>
              <div className="text-3xl font-bold text-primary py-3 px-6 rounded-lg bg-primary/10 inline-block mx-auto">
                {solicitudId}
              </div>
              <p className="text-muted-foreground text-sm mt-2">
                Guarda este número para futuras consultas sobre tu pedido.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5">
                <h3 className="font-medium text-lg mb-2">Detalles del Pedido</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Revisa los detalles de tu pedido antes de finalizar la compra.
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded text-sm text-red-700">
                  <div className="flex items-center gap-2">
                    <XCircle size={16} className="shrink-0" />
                    <p>Error: {error}</p>
                  </div>
                </div>
              )}
            </>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            {solicitudId === null ? (
              <>
                <Button variant="outline" className="flex-1" onClick={onClose}>
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 gap-2" 
                  onClick={handleConfirmOrder}
                  disabled={submitting}
                >
                  {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                  Finalizar Compra
                </Button>
              </>
            ) : (
              <Button onClick={onClose} className="w-full">
                Cerrar
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar compra?</AlertDialogTitle>
            <AlertDialogDescription>
              Estás a punto de finalizar tu compra. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelConfirmation}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitOrder}>Confirmar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CheckoutSummary;
