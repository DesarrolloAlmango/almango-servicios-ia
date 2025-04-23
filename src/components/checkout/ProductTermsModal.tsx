
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
  const [debugInfo, setDebugInfo] = useState<{
    sentId: string | null;
    responseStatus: string;
    responseLength: number;
  } | null>(null);

  React.useEffect(() => {
    const fetchTerms = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      setError(null);
      setDebugInfo(null);
      
      try {
        if (!textosId) {
          throw new Error("No se ha encontrado ID de términos para este producto");
        }
        
        // Guardamos el ID que estamos enviando para debug
        const sentId = textosId;
        
        // Usamos /api/ como proxy en lugar de llamar directamente a la URL externa
        const response = await fetch(
          `/api/AlmangoXV1NETFramework/WebAPI/ObtenerTyCProductos?Textosid=${textosId}`
        );
        
        const responseStatus = `${response.status} ${response.statusText}`;
        
        if (!response.ok) {
          throw new Error(`Error al obtener términos y condiciones: ${responseStatus}`);
        }
        
        const data = await response.text();
        const responseLength = data.length;
        
        setDebugInfo({
          sentId,
          responseStatus,
          responseLength
        });
        
        setTermsContent(data);
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
            Términos y Condiciones - {productName}
          </DialogTitle>
        </DialogHeader>
        
        {/* Información de Debug */}
        {debugInfo && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-700">Información de Debug:</h4>
            <ul className="text-sm text-blue-600 mt-1">
              <li>ID enviado: <span className="font-mono">{debugInfo.sentId || "null"}</span></li>
              <li>Estado de la respuesta: <span className="font-mono">{debugInfo.responseStatus}</span></li>
              <li>Longitud de la respuesta: <span className="font-mono">{debugInfo.responseLength} caracteres</span></li>
            </ul>
          </div>
        )}
        
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
