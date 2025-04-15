
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Check, XCircle, Loader2 } from "lucide-react";
import { CheckoutData } from "@/types/checkoutTypes";
import { toast } from "sonner";

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
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [solicitudId, setSolicitudId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Resetea los estados cuando el modal se cierra
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setSolicitudId(null);
      setError(null);
    }
  }, [isOpen]);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    toast.success("JSON copiado al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitOrder = async () => {
    try {
      setSubmitting(true);
      setError(null);

      // Prepara el JSON para la solicitud
      const jsonSolicitud = JSON.stringify(data);
      
      // Construye la URL con los parámetros requeridos
      const url = new URL("/api/AlmangoXV1NETFramework/WebAPI/AltaSolicitud", window.location.origin);
      url.searchParams.append("Userconect", "NoEmpty");
      url.searchParams.append("Key", "d3d3LmF6bWl0YS5jb20=");
      url.searchParams.append("Proveedorid", "0");
      url.searchParams.append("Usuarioid", "0");
      url.searchParams.append("Jsonsolicitud", jsonSolicitud);

      // Realiza la llamada al endpoint
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
      }

      // Parsea el resultado (retorna un número de solicitud)
      const result = await response.json();
      
      // Guarda el número de solicitud
      setSolicitudId(result);
      toast.success(`Solicitud enviada correctamente. Número: ${result}`);
    } catch (err) {
      console.error("Error al enviar la solicitud:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al procesar la solicitud");
      toast.error("No se pudo procesar la solicitud");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center">
            {solicitudId ? (
              <div className="flex items-center justify-center gap-2 text-lg text-green-600">
                <CheckCircle className="h-6 w-6" />
                <span>¡Solicitud Enviada!</span>
              </div>
            ) : (
              "Resumen de la Compra"
            )}
          </DialogTitle>
        </DialogHeader>

        {solicitudId ? (
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
              <pre className="bg-gray-100 p-4 rounded-md text-xs overflow-auto max-h-[300px]">
                {JSON.stringify(data, null, 2)}
              </pre>
              <div className="mt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1"
                  onClick={handleCopyJson}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiado" : "Copiar JSON"}
                </Button>
              </div>
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
          {!solicitudId ? (
            <>
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                className="flex-1 gap-2" 
                onClick={handleSubmitOrder}
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
  );
};

export default CheckoutSummary;
