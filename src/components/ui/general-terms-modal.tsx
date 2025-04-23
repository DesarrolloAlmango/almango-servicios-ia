import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface GeneralTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GeneralTermsModal({ isOpen, onClose }: GeneralTermsModalProps) {
  const [terms, setTerms] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

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
      
      // Accedemos directamente a data.Texto en lugar de data.textos[0].texto
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-screen overflow-y-auto">
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
      </DialogContent>
    </Dialog>
  );
}