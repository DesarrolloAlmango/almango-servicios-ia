
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
    zonaCostoAdicional?: number;
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
  zonaCostoAdicional?: number;
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
  const [cartItemsWithZoneCost, setCartItemsWithZoneCost] = useState<CartItem[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Update cart items when purchaseLocations change to include zone costs
  useEffect(() => {
    const updatedCartItems = [...cartItems];
    
    // Remove any existing zone cost items
    const filteredItems = updatedCartItems.filter(item => item.name !== "Adicional por zona");
    
    // Add zone cost items for locations with additional cost
    purchaseLocations.forEach(location => {
      if (location.zonaCostoAdicional && location.zonaCostoAdicional > 0) {
        const zoneCostItem: CartItem = {
          id: `zone-cost-${location.serviceId}`,
          name: "Adicional por zona",
          price: location.zonaCostoAdicional,
          quantity: 1,
          serviceId: location.serviceId || "",
          categoryId: "",
          productId: "",
          serviceCategory: location.serviceName || "Costo adicional",
          textosId: null,
          image: "" // Add missing image property
        };
        filteredItems.push(zoneCostItem);
      }
    });
    
    setCartItemsWithZoneCost(filteredItems);
  }, [cartItems, purchaseLocations]);

  // Calculate total including zone costs
  const totalWithZoneCost = cartItemsWithZoneCost.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
              name: location.locationName,
              zonaCostoAdicional: location.zonaCostoAdicional || 0
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
    // Use original cartItems for checkout, not the ones with zone cost
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
      const itemsTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const zoneCost = location.zonaCostoAdicional || 0;
      const total = itemsTotal + zoneCost;

      const level1Items = items.map(item => ({
        RubrosId: Number(item.serviceId),
        ProductoID: Number(item.categoryId),
        DetalleID: Number(item.productId),
        Cantidad: item.quantity,
        Precio: Number(item.price),
        SR: "N",
        Comision: 0,
        ComisionTipo: "P",
        PrecioFinal: Number((item.price * item.quantity)),
        productoNombre: item.name
      }));

      // Add zone cost as separate item if it exists
      if (zoneCost > 0) {
        level1Items.push({
          RubrosId: Number(serviceId),
          ProductoID: 0,
          DetalleID: 0,
          Cantidad: 1,
          Precio: Number(zoneCost),
          SR: "N",
          Comision: 0,
          ComisionTipo: "P",
          PrecioFinal: Number(zoneCost),
          productoNombre: "Adicional por zona"
        });
      }

      const formattedData: CheckoutData = {
        Nombre: data.name,
        Telefono: data.phone,
        Mail: data.email || null,
        PaisISO: 0,
        DepartamentoId: Number(location.departmentId) || null,
        MunicipioId: Number(location.locationId) || null,
        ZonasID: 0,
        Direccion: `${data.street} ${data.number}${data.apartment ? ` Apto ${data.apartment}` : ''}${data.corner ? ` esq. ${data.corner}` : ''}`,
        MetodoPagosID: data.paymentMethodId || 0,
        SolicitudPagada: "",
        SolicitaCotizacion: total.toString(),
        SolicitaOtroServicio: "",
        OtroServicioDetalle: "",
        FechaInstalacion: format(selectedDate!, "yyyy-MM-dd'T'HH:mm:ss"),
        TurnoInstalacion: getTimeSlotNumber(selectedTimeSlot),
        Comentario: data.comments || "",
        ConfirmarCondicionesUso: "S",
        ProveedorAuxiliar: getProviderAuxiliary(location.storeId, location.otherLocation),
        Level1: level1Items,
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
          
          <div ref={contentRef} className="flex flex-col h-[calc(100vh-12rem)] mt-6">
            {cartItemsWithZoneCost.length === 0 && currentStep === 0 ? (
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
                      cartItems={cartItemsWithZoneCost} 
                      updateCartItem={updateCartItem} 
                      total={totalWithZoneCost} 
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
                      cartItems={cartItemsWithZoneCost} 
                      total={totalWithZoneCost} 
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
