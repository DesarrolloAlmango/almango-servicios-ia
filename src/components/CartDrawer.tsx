
import React, { useState } from "react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CartItem } from "@/pages/Servicios";
import StepIndicator from "@/components/checkout/StepIndicator";
import CartItemsStep from "@/components/checkout/CartItemsStep";
import DateTimeStep from "@/components/checkout/DateTimeStep";
import PersonalInfoStep from "@/components/checkout/PersonalInfoStep";
import { MapPin } from "lucide-react";

interface CartDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cartItems: CartItem[];
  updateCartItem: (id: string, quantity: number) => void;
  total: number;
  purchaseLocation?: string;
}

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  setIsOpen, 
  cartItems, 
  updateCartItem, 
  total,
  purchaseLocation
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const handleNextStep = () => {
    if (currentStep === 0) {
      // Skip the location step and go directly to cart items
      setCurrentStep(1);
    } else {
      // For other steps, just increment normally
      setCurrentStep((prev) => Math.min(prev + 1, 2));
    }
  };

  const handlePreviousStep = () => {
    if (currentStep === 1) {
      // Skip the location step when going backwards as well
      setCurrentStep(0);
    } else {
      // For other steps, just decrement normally
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const handleSubmit = (data: any) => {
    console.log("Checkout data:", {
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      personalInfo: data,
      purchaseLocation
    });
    
    toast.success("¡Pedido realizado con éxito! Te contactaremos pronto.", {
      duration: 5000
    });
    
    // Restablecer el carrito y cerrar el drawer
    setCurrentStep(0);
    setSelectedDate(undefined);
    setSelectedTimeSlot("");
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Carrito de Servicios</SheetTitle>
        </SheetHeader>
        
        {purchaseLocation && (
          <div className="mt-4 p-3 rounded-lg border-[1px] border-blue-200 bg-blue-50 flex items-center">
            <MapPin className="text-blue-500 mr-2" size={16} />
            <div className="text-sm text-blue-700">
              <span className="font-medium">Lugar de compra: </span>
              <span>{purchaseLocation}</span>
            </div>
          </div>
        )}
        
        <div className="flex flex-col h-[calc(100vh-12rem)] mt-6">
          {cartItems.length === 0 ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            <>
              <StepIndicator currentStep={currentStep} totalSteps={3} />
              
              <div className="flex-grow">
                {currentStep === 0 && (
                  <CartItemsStep 
                    cartItems={cartItems}
                    updateCartItem={updateCartItem}
                    total={total}
                    onNext={handleNextStep}
                    onPrevious={() => setIsOpen(false)}
                  />
                )}
                
                {currentStep === 1 && (
                  <DateTimeStep 
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    setSelectedTimeSlot={setSelectedTimeSlot}
                    onPrevious={handlePreviousStep}
                    onNext={handleNextStep}
                  />
                )}
                
                {currentStep === 2 && (
                  <PersonalInfoStep 
                    onPrevious={handlePreviousStep}
                    onSubmit={handleSubmit}
                    cartItems={cartItems}
                    total={total}
                    selectedDate={selectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    purchaseLocation={purchaseLocation}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
