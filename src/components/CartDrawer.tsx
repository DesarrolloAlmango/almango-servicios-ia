import React, { useState, useEffect, useRef } from "react";
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
import CartItemsStep from "@/components/checkout/CartItemsStep";
import DateTimeStep from "@/components/checkout/DateTimeStep";
import PersonalInfoStep from "@/components/checkout/PersonalInfoStep";
import { MapPin } from "lucide-react";
import { format } from "date-fns";
import CheckoutSummary from "./checkout/CheckoutSummary";
import { CheckoutData } from "@/types/checkoutTypes";
import { getTimeSlotNumber } from "@/utils/timeUtils";

interface CartDrawerProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  cartItems: CartItem[];
  updateCartItem: (id: string, quantity: number) => void;
  total: number;
  purchaseLocations?: {
    storeId: string;
    storeName: string;
    otherLocation?: string;
    serviceId?: string;
    serviceName?: string;
    departmentId?: string;
    locationId?: string;
    departmentName?: string;
    locationName?: string;
  }[];
  setPurchaseLocations?: (locations: any[]) => void;
}

interface Department {
  id: string;
  name: string;
}

interface Municipality {
  id: string;
  name: string;
}

const getProviderAuxiliary = (location: string, otherLocation?: string): string | null => {
  if (location === "other") return "otro";
  if (location === "NoLoSe") return "NoLoSe";
  return null;
};

const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  setIsOpen, 
  cartItems, 
  updateCartItem, 
  total,
  purchaseLocations = [],
  setPurchaseLocations
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData[]>([]);
  
  const [departments, setDepartments] = useState<Department[]>([]);
  const [municipalities, setMunicipalities] = useState<Record<string, Municipality[]>>({});
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setTimeout(() => {
        contentRef.current?.scrollTo({
          top: 200,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [currentStep]);

  const handleNextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 2));
  };

  const handlePreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    if (purchaseLocations.length > 0) {
      const uniqueDepartments = new Map<string, Department>();
      
      purchaseLocations.forEach(location => {
        if (location.departmentId && location.departmentName) {
          uniqueDepartments.set(location.departmentId, {
            id: location.departmentId,
            name: location.departmentName
          });
        }
      });
      
      setDepartments(Array.from(uniqueDepartments.values()));
      
      const locationsByDepartment: Record<string, Municipality[]> = {};
      
      purchaseLocations.forEach(location => {
        if (location.departmentId && location.locationId && location.locationName) {
          if (!locationsByDepartment[location.departmentId]) {
            locationsByDepartment[location.departmentId] = [];
          }
          
          const exists = locationsByDepartment[location.departmentId].some(
            m => m.id === location.locationId
          );
          
          if (!exists) {
            locationsByDepartment[location.departmentId].push({
              id: location.locationId,
              name: location.locationName
            });
          }
        }
      });
      
      setMunicipalities(locationsByDepartment);
    }
  }, [purchaseLocations]);

  const handleSubmit = (data: any) => {
    const serviceGroups = cartItems.reduce((acc: Record<string, any[]>, item) => {
      const location = purchaseLocations.find(loc => loc.serviceId === item.serviceId);
      if (location) {
        if (!acc[item.serviceId]) {
          acc[item.serviceId] = [];
        }
        acc[item.serviceId].push({
          ...item,
          location
        });
      }
      return acc;
    }, {});

    const checkoutDataArray: CheckoutData[] = Object.entries(serviceGroups).map(([serviceId, items]) => {
      const location = items[0].location;
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const formattedData: CheckoutData = {
        Nombre: data.name,
        Telefono: data.phone,
        Mail: data.email || null,
        PaisISO: 0,
        DepartamentoId: Number(location.departmentId) || null,
        MunicipioId: Number(location.locationId) || null,
        ZonasID: 0,
        Direccion: `${data.street} ${data.number}${data.apartment ? ` Apto ${data.apartment}` : ''}${data.corner ? ` esq. ${data.corner}` : ''}`,
        MetodoPagosID: data.paymentMethod === "later" ? 1 : 4,
        SolicitudPagada: "",
        SolicitaCotizacion: total.toString(),
        SolicitaOtroServicio: "",
        OtroServicioDetalle: "",
        FechaInstalacion: format(selectedDate!, "yyyy-MM-dd'T'HH:mm:ss"),
        TurnoInstalacion: getTimeSlotNumber(selectedTimeSlot),
        Comentario: data.comments || "",
        ConfirmarCondicionesUso: "S",
        ProveedorAuxiliar: getProviderAuxiliary(location.storeId, location.otherLocation),
        Level1: items.map(item => ({
          RubrosId: Number(item.serviceId),
          ProductoID: Number(item.categoryId),
          DetalleID: Number(item.productId),
          Cantidad: item.quantity,
          Precio: Number(item.price.toFixed(2)),
          SR: "N",
          Comision: 0,
          ComisionTipo: "P",
          PrecioFinal: Number((item.price * item.quantity).toFixed(2))
        })),
        serviceName: location.serviceName || 'Servicio'
      };

      return formattedData;
    });

    setCheckoutData(checkoutDataArray);
    setShowSummary(true);
  };

  const resetCheckoutForm = () => {
    setCurrentStep(0);
    setSelectedDate(undefined);
    setSelectedTimeSlot("");
    cartItems.forEach(item => {
      updateCartItem(item.id, 0);
    });
    if (setPurchaseLocations) {
      setPurchaseLocations([]);
    }
  };

  const handleCheckoutClose = (success: boolean) => {
    setShowSummary(false);
    
    if (success) {
      resetCheckoutForm();
    }
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Carrito de Servicios</SheetTitle>
          </SheetHeader>
          
          {purchaseLocations.length > 0 && (
            <div className="mt-4 p-3 rounded-lg border-[1px] border-blue-200 bg-blue-50">
              <h4 className="text-sm font-medium text-blue-700 mb-1">Lugares de compra registrados:</h4>
              <div className="space-y-1">
                {purchaseLocations.map((location, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <MapPin className="text-blue-500 mr-1" size={12} />
                    <span className="text-blue-700 font-medium">{location.serviceName}: </span>
                    <span className="text-blue-600 ml-1">
                      {location.storeId === "other" ? location.otherLocation : location.storeName}
                      {location.departmentName && location.locationName && (
                        <span className="text-blue-400 ml-1">
                          ({location.departmentName}, {location.locationName})
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div ref={contentRef} className="flex flex-col h-[calc(100vh-12rem)] mt-6">
            {cartItems.length === 0 && currentStep === 0 ? (
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
                      onPrevious={handlePreviousStep}
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
                      selectedDepartment=""
                      selectedLocation=""
                      departments={departments || []}
                      municipalities={municipalities || {}}
                    />
                  )}
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      <CheckoutSummary 
        isOpen={showSummary}
        onClose={handleCheckoutClose}
        data={checkoutData}
      />
    </>
  );
};

export default CartDrawer;
