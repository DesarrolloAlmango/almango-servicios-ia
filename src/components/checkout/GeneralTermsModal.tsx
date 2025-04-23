
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GeneralTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TermsResponse {
  Texto: string;
}

const GeneralTermsModal: React.FC<GeneralTermsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [termsContent, setTermsContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTerms = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/AlmangoXV1NETFramework/WebAPI/ObtenerTyCProductos?Textosid=1`
        );
        
        if (!response.ok) {
          throw new Error(`Error al obtener términos y condiciones: ${response.status}`);
        }
        
        const data: TermsResponse = await response.json();
        
        const decodedContent = data.Texto
          .replace(/\\u000a/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\/g, '');
        
        setTermsContent(decodedContent);
      } catch (error) {
        console.error("Error fetching terms:", error);
        setError(`No se pudieron cargar los términos y condiciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-orange-500">
            Términos y Condiciones Generales
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-4">{error}</div>
          ) : (
            <div 
              className="prose prose-sm max-w-none prose-headings:text-orange-500 prose-strong:text-orange-500"
              dangerouslySetInnerHTML={{ __html: termsContent }} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GeneralTermsModal;
