
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface ProductTermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  textosId?: string | null;
  productName: string;
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
      if (!textosId || !isOpen) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `/api/AlmangoXV1NETFramework/WebAPI/ObtenerTyCProductos?Textosid=${textosId}`
        );
        
        if (!response.ok) {
          throw new Error(`Error al obtener términos y condiciones: ${response.status}`);
        }
        
        const data = await response.text();
        setTermsContent(data);
        console.log("Términos y condiciones obtenidos:", data);
      } catch (error) {
        console.error("Error fetching terms:", error);
        setError("No se pudieron cargar los términos y condiciones");
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
            Términos y Condiciones - {productName}
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
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: termsContent }} 
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductTermsModal;
