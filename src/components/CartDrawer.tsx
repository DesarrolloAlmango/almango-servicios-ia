
import React, { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { CartItem } from "@/pages/Servicios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Info, MapPin, Calendar, User } from "lucide-react";

import LocationStep from "@/components/checkout/LocationStep";
import CartItemsStep from "@/components/checkout/CartItemsStep";
import DateTimeStep from "@/components/checkout/DateTimeStep";
import PersonalInfoStep from "@/components/checkout/PersonalInfoStep";
import StepIndicator from "@/components/checkout/StepIndicator";
import { toast } from "sonner";

interface CartDrawerProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  cartItems: CartItem[];
  updateCartItem: (id: string, quantity: number) => void;
  total: number;
  purchaseLocations?: Record<string, string>;
}

const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  setIsOpen,
  cartItems,
  updateCartItem,
  total,
  purchaseLocations = {}
}) => {
  const [activeStep, setActiveStep] = useState(1);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");

  // Datos de ejemplo para departamentos
  const mockDepartments = [
    { id: "01", name: "Montevideo" },
    { id: "02", name: "Canelones" },
    { id: "03", name: "Maldonado" },
  ];

  // Datos de ejemplo para municipios
  const mockMunicipalities = {
    "01": [
      { id: "01-01", name: "Centro" },
      { id: "01-02", name: "Cordón" },
      { id: "01-03", name: "Pocitos" },
    ],
    "02": [
      { id: "02-01", name: "Ciudad de la Costa" },
      { id: "02-02", name: "Las Piedras" },
      { id: "02-03", name: "Pando" },
    ],
    "03": [
      { id: "03-01", name: "Punta del Este" },
      { id: "03-02", name: "Maldonado" },
      { id: "03-03", name: "San Carlos" },
    ],
  };

  const steps = [
    { id: 1, name: "Ubicación", icon: MapPin },
    { id: 2, name: "Servicios", icon: Info },
    { id: 3, name: "Fecha y Hora", icon: Calendar },
    { id: 4, name: "Datos Personales", icon: User },
  ];

  const handleNext = () => {
    if (activeStep < steps.length) {
      setActiveStep(activeStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = () => {
    // Aquí iría la lógica para enviar la solicitud
    console.log("Enviando solicitud...", {
      department: selectedDepartment,
      location: selectedLocation,
      date: selectedDate,
      time: selectedTime,
      name,
      email,
      phone,
      notes,
      items: cartItems,
      total,
    });

    toast.success("¡Solicitud enviada con éxito!");
    setIsOpen(false);
    
    // Resetear el formulario
    setActiveStep(1);
    setSelectedDepartment("");
    setSelectedLocation("");
    setSelectedDate(undefined);
    setSelectedTime("");
    setName("");
    setEmail("");
    setPhone("");
    setNotes("");

    // Aquí normalmente limpiaríamos el carrito después de enviar la solicitud
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          <div className="bg-primary p-4">
            <h2 className="text-xl font-bold text-white">Tu Carrito</h2>
          </div>

          <StepIndicator steps={steps} currentStep={activeStep} />

          <div className="flex-grow p-6 overflow-auto">
            {/* Información de lugares de compra seleccionados */}
            {Object.keys(purchaseLocations).length > 0 && (
              <div className="mb-6 bg-blue-50 p-3 rounded-lg">
                <h3 className="font-medium text-blue-700 mb-2">Lugares de compra:</h3>
                <ul className="space-y-1">
                  {Object.entries(purchaseLocations).map(([serviceId, locationText]) => (
                    <li key={serviceId} className="text-blue-600 text-sm">
                      {locationText}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeStep === 1 && (
              <LocationStep
                selectedDepartment={selectedDepartment}
                setSelectedDepartment={setSelectedDepartment}
                selectedLocation={selectedLocation}
                setSelectedLocation={setSelectedLocation}
                onNext={handleNext}
                departments={mockDepartments}
                municipalities={mockMunicipalities}
                loading={{ departments: false, municipalities: false }}
              />
            )}

            {activeStep === 2 && (
              <CartItemsStep
                cartItems={cartItems}
                updateCartItem={updateCartItem}
                total={total}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}

            {activeStep === 3 && (
              <DateTimeStep
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedTime={selectedTime}
                setSelectedTime={setSelectedTime}
                onPrevious={handlePrevious}
                onNext={handleNext}
              />
            )}

            {activeStep === 4 && (
              <PersonalInfoStep
                name={name}
                setName={setName}
                email={email}
                setEmail={setEmail}
                phone={phone}
                setPhone={setPhone}
                notes={notes}
                setNotes={setNotes}
                onPrevious={handlePrevious}
                onSubmit={handleSubmit}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
