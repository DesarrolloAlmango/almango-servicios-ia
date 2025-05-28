
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/pages/Servicios";
import ProductTermsModal from "./ProductTermsModal";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export interface CartItemsStepProps {
  cartItems: CartItem[];
  updateCartItem: (id: string, quantity: number) => void;
  total: number;
  onNext: () => void;
  onPrevious: () => void;
}

interface SelectedTerms {
  textosId: string | null;
  productName: string;
}

const CartItemsStep: React.FC<CartItemsStepProps> = ({ 
  cartItems, 
  updateCartItem, 
  total, 
  onNext,
  onPrevious
}) => {
  const [selectedTerms, setSelectedTerms] = useState<SelectedTerms | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const nextButtonRef = useRef<HTMLDivElement>(null);
  
  const handleIncreaseQuantity = (id: string, currentQuantity: number) => {
    updateCartItem(id, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (id: string, currentQuantity: number) => {
    updateCartItem(id, currentQuantity - 1);
  };

  const handleTermsAcceptance = (checked: boolean) => {
    setTermsAccepted(checked);
    
    if (checked && nextButtonRef.current) {
      // Scroll suave hacia abajo al botón siguiente
      setTimeout(() => {
        nextButtonRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  };

  const handleViewTerms = (item: CartItem, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    console.log("Ver términos clicked for:", item.name, "textosId:", item.textosId);
    
    if (item.textosId) {
      setSelectedTerms({ 
        textosId: item.textosId, 
        productName: item.name 
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold">Resumen de Servicios</h3>
        <p className="text-muted-foreground">Revisa y confirma tus servicios seleccionados</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No hay servicios en el carrito</p>
        </div>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-muted-foreground">{item.serviceCategory}</p>
                {item.textosId && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={(e) => handleViewTerms(item, e)}
                    className="text-orange-500 hover:text-orange-600 p-0 h-auto mt-1 text-sm font-normal"
                  >
                    Ver Condiciones
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-md border flex items-center">
                  <button 
                    className="px-2 py-1 text-lg hover:bg-gray-100"
                    onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                  >
                    -
                  </button>
                  <span className="px-3 py-1">{item.quantity}</span>
                  <button 
                    className="px-2 py-1 text-lg hover:bg-gray-100"
                    onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                  >
                    +
                  </button>
                </div>
                <span className="font-medium min-w-[70px] text-right">
                  ${(item.price * item.quantity).toLocaleString('es-UY', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          ))}

          <div className="flex justify-between p-4 bg-orange-50 rounded-lg text-orange-800 font-medium">
            <span>Total</span>
            <span>${total.toLocaleString('es-UY', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      )}

      {cartItems.length > 0 && (
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            checked={termsAccepted}
            onCheckedChange={handleTermsAcceptance}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="terms"
              className="text-sm text-muted-foreground"
            >
              Acepto los términos y condiciones de todos los servicios seleccionados
            </Label>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4 mb-8" ref={nextButtonRef}>
        <div className="ml-auto">
          <Button 
            onClick={onNext} 
            disabled={cartItems.length === 0 || !termsAccepted}
          >
            Siguiente
          </Button>
        </div>
      </div>

      {selectedTerms && (
        <ProductTermsModal
          isOpen={!!selectedTerms}
          onClose={() => setSelectedTerms(null)}
          textosId={selectedTerms.textosId}
          productName={selectedTerms.productName}
        />
      )}
    </div>
  );
};

export default CartItemsStep;
