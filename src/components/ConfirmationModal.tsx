import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  return <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Confirmar Servicios
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <DialogDescription className="text-base text-foreground">
            ¿Estás seguro que deseas contratar estos servicios?
          </DialogDescription>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isSubmitting}
            className="uppercase"
          >
            Cancelar
          </Button>
          <Button 
            onClick={onConfirm} 
            disabled={isSubmitting}
            className="uppercase bg-[#fe8d0c] hover:bg-[#e67e0a]"
          >
            {isSubmitting ? "Enviando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
export default ConfirmationModal;