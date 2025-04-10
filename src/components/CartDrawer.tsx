
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
import LocationStep from "@/components/checkout/LocationStep";
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
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = (data: any) => {
    console.log("Checkout data:", {
      department: selectedDepartment,
      location: selectedLocation,
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
    setSelectedDepartment("");
    setSelectedLocation("");
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
          {cartItems.length === 0 && currentStep === 0 ? (
            <div className="flex-grow flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                Tu carrito está vacío
              </p>
            </div>
          ) : (
            <>
              <StepIndicator currentStep={currentStep} totalSteps={4} />
              
              <div className="flex-grow">
                {currentStep === 0 && (
                  <LocationStep 
                    selectedDepartment={selectedDepartment}
                    setSelectedDepartment={setSelectedDepartment}
                    selectedLocation={selectedLocation}
                    setSelectedLocation={setSelectedLocation}
                    onNext={handleNextStep}
                  />
                )}
                
                {currentStep === 1 && (
                  <CartItemsStep 
                    cartItems={cartItems}
                    updateCartItem={updateCartItem}
                    total={total}
                    onPrevious={handlePreviousStep}
                    onNext={handleNextStep}
                  />
                )}
                
                {currentStep === 2 && (
                  <DateTimeStep 
                    selectedDate={selectedDate}
                    setSelectedDate={setSelectedDate}
                    selectedTimeSlot={selectedTimeSlot}
                    setSelectedTimeSlot={setSelectedTimeSlot}
                    onPrevious={handlePreviousStep}
                    onNext={handleNextStep}
                  />
                )}
                
                {currentStep === 3 && (
                  <PersonalInfoStep 
                    onPrevious={handlePreviousStep}
                    onSubmit={handleSubmit}
                    cartItems={cartItems}
                    total={total}
                    selectedDepartment={selectedDepartment}
                    selectedLocation={selectedLocation}
                    selectedDate={selectedDate}
                    selectedTimeSlot={selectedTimeSlot}
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
