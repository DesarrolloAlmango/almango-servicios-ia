import React, { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
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
import { CheckoutData, getProviderAuxiliary } from "@/types/checkoutTypes";
import { getTimeSlotNumber } from "@/utils/timeUtils";
import { getGlobalZoneCost, resetGlobalZoneCost } from "@/utils/globalZoneCost";

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
    zonaCostoAdicional?: string;
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
    setCurrentStep(prev => Math.min(prev + 1, 2));
  };
  const handlePreviousStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
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
          const exists = locationsByDepartment[location.departmentId].some(m => m.id === location.locationId);
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
  const formatPrice = (price: number): string => {
    return price.toLocaleString('es-UY', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };
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
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

      const formattedData: CheckoutData = {
        Nombre: data.name,
        Telefono: data.phone,
        Mail: data.email || null,
        PaisISO: 0,
        DepartamentoId: Number(location.departmentId) || null,
        MunicipioId: Number(location.locationId) || null,
        ZonasID: 0,
        Direccion: `${data.street} ${data.number}${data.apartment ? ` Apto ${data.apartment}` : ''}${data.corner ? ` esq. ${data.corner}` : ''}`,
        MetodoPagosID: data.paymentMethodId || 0, // Use the paymentMethodId from PersonalInfoStep
        SolicitudPagada: "",
        SolicitaCotizacion: total.toString(),
        SolicitaOtroServicio: "",
        OtroServicioDetalle: "",
        FechaInstalacion: format(selectedDate!, "yyyy-MM-dd'T'HH:mm:ss"),
        TurnoInstalacion: getTimeSlotNumber(selectedTimeSlot),
        Comentario: data.comments || "",
        ConfirmarCondicionesUso: "S",
        ProveedorAuxiliar: getProviderAuxiliary(location.storeId, location.otherLocation),
        CostoXZona: getGlobalZoneCost(),
        Level1: items.map(item => ({
          RubrosId: Number(item.serviceId),
          ProductoID: Number(item.categoryId),
          DetalleID: Number(item.productId),
          Cantidad: item.quantity,
          Precio: Number(item.price),
          SR: "N",
          Comision: 0,
          ComisionTipo: "P",
          PrecioFinal: Number((item.price * item.quantity))
        })),
        serviceName: location.serviceName || `Servicio ${serviceId}`
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
    resetGlobalZoneCost();
  };
  const handleCheckoutClose = (success: boolean) => {
    setShowSummary(false);
    if (success) {
      resetCheckoutForm();
    }
  };

  // Use global zone cost instead of calculating from purchase locations
  const zonaCostoAdicional = getGlobalZoneCost();

  return <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Carrito de Servicios</SheetTitle>
          </SheetHeader>
          
          {purchaseLocations.length > 0}
          
          <div ref={contentRef} className="flex flex-col h-[calc(100vh-12rem)] mt-6">
            {cartItems.length === 0 && currentStep === 0 ? <div className="flex-grow flex items-center justify-center">
                <p className="text-muted-foreground text-center">
                  Tu carrito está vacío
                </p>
              </div> : <>
                <StepIndicator currentStep={currentStep} totalSteps={3} />
                
                <div className="flex-grow">
                  {currentStep === 0 && <CartItemsStep 
                    cartItems={cartItems} 
                    updateCartItem={updateCartItem} 
                    total={total} 
                    onNext={handleNextStep} 
                    onPrevious={handlePreviousStep}
                    zonaCostoAdicional={zonaCostoAdicional}
                  />}
                  
                  {currentStep === 1 && <DateTimeStep selectedDate={selectedDate} setSelectedDate={setSelectedDate} selectedTimeSlot={selectedTimeSlot} setSelectedTimeSlot={setSelectedTimeSlot} onPrevious={handlePreviousStep} onNext={handleNextStep} />}
                  
                  {currentStep === 2 && <PersonalInfoStep onPrevious={handlePreviousStep} onSubmit={handleSubmit} cartItems={cartItems} total={total} selectedDate={selectedDate} selectedTimeSlot={selectedTimeSlot} selectedDepartment="" selectedLocation="" departments={departments || []} municipalities={municipalities || {}} />}
                </div>
              </>}
          </div>
        </SheetContent>
      </Sheet>
      
      <CheckoutSummary isOpen={showSummary} onClose={handleCheckoutClose} data={checkoutData} departments={departments} municipalities={municipalities} />
    </>;
};
export default CartDrawer;
