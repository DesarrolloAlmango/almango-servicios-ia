
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProductTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  textosId?: string | null;
  productName: string;
}

interface TermsResponse {
  Texto: string;
}

const ProductTermsModal: React.FC<ProductTermsModalProps> = ({
  isOpen,
  onClose,
  textosId,
  productName,
}) => {
  const [termsContent, setTermsContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    const fetchTerms = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        console.log('=== FETCHING TERMS DEBUG ===');
        console.log('textosId received:', textosId);
        console.log('textosId type:', typeof textosId);
        
        if (!textosId) {
          console.log('No textosId provided, using default value 1');
          // Si no hay textosId específico, usar términos generales (ID 1)
          setTermsContent("Este producto no tiene términos y condiciones específicos. Se aplicarán los términos y condiciones generales de la empresa.");
          setIsLoading(false);
          return;
        }
        
        const url = `https://app.almango.com.uy/webapi/ObtenerTyCProductos?Textosid=${textosId}`;
        console.log('Fetching URL:', url);
        
        const response = await fetch(url);
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          throw new Error(`Error al obtener términos y condiciones: ${response.status}`);
        }
        
        const data: TermsResponse = await response.json();
        console.log('Response data:', data);
        
        // Decodificar las secuencias Unicode y establecer el HTML
        const decodedContent = data.Texto
          .replace(/\\u000a/g, '\n')  // Convertir \u000a a saltos de línea
          .replace(/\\"/g, '"')       // Convertir \" a "
          .replace(/\\/g, '');        // Eliminar barras invertidas restantes
        
        setTermsContent(decodedContent);
        console.log('=== END FETCHING TERMS DEBUG ===');
      } catch (error) {
        console.error("Error fetching terms:", error);
        setError(`No se pudieron cargar los términos y condiciones: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTerms();
  }, [textosId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-orange-500">
            Términos y Condiciones
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">{productName}</p>
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
      </DialogContent>
    </Dialog>
  );
};

export default ProductTermsModal;
