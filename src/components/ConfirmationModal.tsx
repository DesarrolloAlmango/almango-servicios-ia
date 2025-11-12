import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface ConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  jsonData: any;
  isSubmitting?: boolean;
  isUpdateMode?: boolean;
  hasSuggestedPrice?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  jsonData,
  isSubmitting = false,
  isUpdateMode = false,
  hasSuggestedPrice = false
}) => {
  // Determine the type of request
  const isPreRequest = !isUpdateMode && !hasSuggestedPrice;
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isPreRequest ? (
              <>
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Confirmar Pre-Solicitud
              </>
            ) : (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Confirmar Solicitud
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {isPreRequest ? (
            <div className="space-y-3">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-900 dark:text-yellow-200">
                  <strong>Atención:</strong> Se cargará una <strong>Pre-Solicitud</strong> porque no se ha especificado un precio sugerido.
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                La Pre-Solicitud deberá ser completada posteriormente con el precio sugerido para hacerse efectiva como una Solicitud formal.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                <p className="text-sm text-green-900 dark:text-green-200">
                  Se cargará una <strong>Solicitud</strong> con todos los datos completos.
                </p>
              </div>
              {isUpdateMode && (
                <p className="text-sm text-muted-foreground">
                  Esta solicitud reemplazará la solicitud anterior.
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Enviando..." : isPreRequest ? "Confirmar Pre-Solicitud" : "Confirmar Solicitud"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;