
import React from "react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Minus } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CartItem } from "@/pages/Servicios";

interface CartDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cartItems: CartItem[];
  updateCartItem: (id: string, quantity: number) => void;
  total: number;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  setIsOpen, 
  cartItems, 
  updateCartItem, 
  total 
}) => {
  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Carrito de Compras</SheetTitle>
        </SheetHeader>
        
        <div className="flex flex-col h-[calc(100vh-12rem)]">
          {cartItems.length === 0 ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-grow pr-4 my-6">
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-4 border-b pb-4">
                    {item.image && (
                      <div className="h-16 w-16 rounded bg-gray-100 overflow-hidden">
                        <img 
                          src={item.image} 
                          alt={item.name} 
                          className="h-full w-full object-cover"
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
          )}
          
          <SheetFooter className="mt-auto border-t pt-4">
            <div className="w-full space-y-4">
              <div className="flex justify-between">
                <span className="font-medium">Total</span>
                <span className="font-bold">${total.toFixed(2)}</span>
              </div>
              
              <Button 
                className="w-full" 
                disabled={cartItems.length === 0}
              >
                Proceder al Pago
              </Button>
            </div>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
