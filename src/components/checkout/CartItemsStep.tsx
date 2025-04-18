
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus, ShoppingCart } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "@/pages/Servicios";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

interface CartItemsStepProps {
  cartItems: CartItem[];
  updateCartItem: (id: string, quantity: number) => void;
  total: number;
  onPrevious: () => void;
  onNext: () => void;
}

const CartItemsStep: React.FC<CartItemsStepProps> = ({
  cartItems,
  updateCartItem,
  total,
  onPrevious,
  onNext,
}) => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Función para procesar la imagen del producto
  const getImageSource = (imageString?: string) => {
    if (!imageString) return null;
    
    if (imageString.startsWith('data:image')) {
      return imageString;
    }
    
    try {
      new URL(imageString);
      return imageString;
    } catch {
      return `data:image/png;base64,${imageString}`;
    }
  };

  // Added function to validate cart before proceeding
  const handleNext = () => {
    if (cartItems.length === 0) {
      toast.error("No hay productos en el carrito. Agrega al menos un servicio para continuar.");
      return;
    }
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <ShoppingCart className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">Servicios</h3>
        <p className="text-muted-foreground">Revisa los servicios seleccionados</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex-grow flex items-center justify-center py-8">
          <p className="text-muted-foreground text-center">
            Tu carrito está vacío
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[250px] pr-4">
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                  {item.image && (
                    <div className="h-16 w-16 rounded bg-gray-100 overflow-hidden">
                      <img 
                        src={getImageSource(item.image)} 
                        alt={item.name} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          // Fallback para imágenes que no cargan
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                  
                  <div className="flex-grow">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.serviceCategory}</p>
                    <p className="font-bold mt-1">${item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center border rounded-md">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={() => updateCartItem(item.id, item.quantity - 1)}
                      >
                        <Minus size={16} />
                      </Button>
                      <span className="w-8 text-center">{item.quantity}</span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-8 w-8 p-0"
                        onClick={() => updateCartItem(item.id, item.quantity + 1)}
                      >
                        <Plus size={16} />
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 h-6 w-6"
                      onClick={() => updateCartItem(item.id, 0)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Reduced margin here (mt-2 instead of pt-2) */}
          <div className="flex items-start gap-2 mt-2">
            <Checkbox 
              id="terms" 
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <label 
              htmlFor="terms" 
              className="text-sm text-gray-600 cursor-pointer"
            >
              Acepto los <a href="#" className="text-primary underline">Términos y Condiciones</a> del servicio
            </label>
          </div>
        </>
      )}

      <div className="pt-4 border-t">
        <div className="flex justify-between mb-4">
          <span className="font-medium">Total</span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between gap-4 pb-6">
          <Button variant="outline" onClick={onPrevious}>
            Anterior
          </Button>
          <Button 
            onClick={handleNext}
            disabled={cartItems.length === 0 || !termsAccepted}
            className="bg-primary"
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItemsStep;
