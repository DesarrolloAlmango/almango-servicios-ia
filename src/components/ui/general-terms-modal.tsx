
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "@/hooks/useTheme";

interface GeneralTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GeneralTermsModal({ isOpen, onClose }: GeneralTermsModalProps) {
  const [terms, setTerms] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  useEffect(() => {
    if (isOpen) {
      fetchTerms();
    }
  }, [isOpen]);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const textosId = 1; // Fixed ID as required
      const response = await fetch(
        `/api/AlmangoXV1NETFramework/WebAPI/ObtenerTyCProductos?Textosid=${textosId}`
      );
      
      if (!response.ok) {
        throw new Error("Error al obtener términos y condiciones");
      }
      
      const data = await response.json();
      
      if (data && data.Texto) {
        const decodedText = decodeHTMLEntities(data.Texto);
        setTerms(decodedText);
      } else {
        setTerms("No se encontraron términos y condiciones.");
      }
    } catch (error) {
      console.error("Error fetching terms:", error);
      toast.error("Error al cargar términos y condiciones", {
        description: "Por favor intente nuevamente más tarde."
      });
      setTerms("Error al cargar los términos y condiciones.");
    } finally {
      setLoading(false);
    }
  };

  const decodeHTMLEntities = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = text;
    return textarea.value;
  };

  const isDarkMode = theme === 'dark';

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent 
        className={`max-w-3xl max-h-screen overflow-y-auto ${isDarkMode ? 'dark' : ''}`}
      >
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            Términos y Condiciones
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Cargando términos y condiciones...</span>
          </div>
        ) : (
          <div 
            className="prose prose-sm max-w-none mt-2" 
            dangerouslySetInnerHTML={{ __html: terms }}
          />
        )}
        
        {/* Keep mobile footer button as an additional option, with 30px bottom padding */}
        {isMobile && (
          <DialogFooter className="mt-4 pb-[30px]">
            <Button 
              onClick={onClose} 
              className="w-full"
              variant="outline"
            >
              <X className="mr-2 h-4 w-4" />
              Cerrar
            </Button>
          </DialogFooter>
        )}

        {/* Add a non-mobile close button with bottom padding when not mobile */}
        {!isMobile && (
          <div className="flex justify-center mt-4 pb-[30px]">
            <Button 
              onClick={onClose} 
              variant="outline"
            >
              <X className="mr-2 h-4 w-4" />
              Cerrar
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
