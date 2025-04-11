import React, { useState, useEffect } from "react";
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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

interface Department {
  id: string;
  name: string;
}

interface Municipality {
  id: string;
  name: string;
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [municipalities, setMunicipalities] = useState<Record<string, Municipality[]>>({});
  const [loading, setLoading] = useState({
    departments: false,
    municipalities: false
  });

  useEffect(() => {
    if (isOpen && departments.length === 0) {
      fetchDepartments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDepartment && !municipalities[selectedDepartment]) {
      fetchMunicipalities(selectedDepartment);
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    setLoading(prev => ({...prev, departments: true}));
    try {
      const response = await fetch("/api/AlmangoXV1NETFramework/WebAPI/ObtenerDepto");
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      const formattedDepartments = data.map((item: any) => ({
        id: item.DepartamentoId?.toString() || "",
        name: item.DepartamentoDepartamento?.toString() || ""
      })).filter(dept => dept.id && dept.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      setDepartments(formattedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("No se pudieron cargar los departamentos");
      setDepartments([
        { id: "1", name: "Montevideo" },
        { id: "2", name: "Canelones" },
        { id: "3", name: "Maldonado" }
      ]);
    } finally {
      setLoading(prev => ({...prev, departments: false}));
    }
  };

  const fetchMunicipalities = async (departmentId: string) => {
    setLoading(prev => ({...prev, municipalities: true}));
    setSelectedLocation("");
    try {
      const response = await fetch(
        `/api/AlmangoXV1NETFramework/WebAPI/ObtenerMunicipio?DepartamentoId=${departmentId}`
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      const formattedMunicipalities = data
        .map((item: any) => ({
          id: item.DepartamentoMunicipioId?.toString() || "",
          name: item.DepartamentoMunicipioNombre?.toString() || ""
        }))
        .filter(mun => mun.id && mun.name && mun.name !== "-")
        .sort((a, b) => a.name.localeCompare(b.name));

      setMunicipalities(prev => ({
        ...prev,
        [departmentId]: formattedMunicipalities
      }));
    } catch (error) {
      console.error("Error fetching municipalities:", error);
      toast.error("No se pudieron cargar las localidades");
      setMunicipalities(prev => ({
        ...prev,
        [departmentId]: []
      }));
    } finally {
      setLoading(prev => ({...prev, municipalities: false}));
    }
  };

  const handleNextStep = () => {
    if (currentStep === 0 && (!selectedDepartment || !selectedLocation)) {
      toast.error("Por favor selecciona departamento y localidad");
      return;
    }
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
                    departments={departments}
                    municipalities={municipalities}
                    loading={loading}
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