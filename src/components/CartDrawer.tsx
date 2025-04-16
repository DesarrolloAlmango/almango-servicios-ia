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
import { format } from "date-fns";
import CheckoutSummary from "./checkout/CheckoutSummary";
import { CheckoutData } from "@/types/checkoutTypes";

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
  }[];
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
  cartItems = [],
  updateCartItem, 
  total,
  purchaseLocations = []
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
  const [showSummary, setShowSummary] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData[]>([]);

  useEffect(() => {
    if (isOpen && departments.length === 0) {
      fetchDepartments();
    }
  }, [isOpen, departments.length]);

  useEffect(() => {
    if (selectedDepartment && !municipalities[selectedDepartment]) {
      fetchMunicipalities(selectedDepartment);
    }
  }, [selectedDepartment, municipalities]);

  const fetchDepartments = async () => {
    setLoading(prev => ({...prev, departments: true}));
    try {
      const response = await fetch("/api/AlmangoXV1NETFramework/WebAPI/ObtenerDepto");
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const formattedDepartments = data.map((item: any) => ({
          id: item.DepartamentoId?.toString() || "",
          name: item.DepartamentoDepartamento?.toString() || ""
        })).filter((dept: any) => dept.id && dept.name)
          .sort((a: any, b: any) => a.name.localeCompare(b.name));

        setDepartments(formattedDepartments);
      } else {
        console.error("Department data is not an array:", data);
        setDepartments([
          { id: "1", name: "Montevideo" },
          { id: "2", name: "Canelones" },
          { id: "3", name: "Maldonado" }
        ]);
      }
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
        .filter((mun: any) => mun.id && mun.name && mun.name !== "-")
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

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

  const getTimeSlotNumber = (timeSlot: string): string => {
    const timeRanges: Record<string, string> = {
      "08:00 - 12:00": "1",
      "12:00 - 16:00": "2",
      "16:00 - 20:00": "3"
    };
    return timeRanges[timeSlot] || "1";
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
    const safeLocations = Array.isArray(purchaseLocations) ? purchaseLocations : [];
    const safeCartItems = Array.isArray(cartItems) ? cartItems : [];
    
    const serviceGroups = safeCartItems.reduce((acc: Record<string, any[]>, item) => {
      const location = safeLocations.find(loc => loc.serviceId === item.serviceId);
      if (location) {
        if (!acc[item.serviceId]) {
          acc[item.serviceId] = [];
        }
        acc[item.serviceId].push({
          ...item,
          location
        });
      } else {
        const serviceId = item.serviceId || "unknown";
        if (!acc[serviceId]) {
          acc[serviceId] = [];
        }
        acc[serviceId].push({
          ...item,
          location: { storeId: "", storeName: "" }
        });
      }
      return acc;
    }, {});

    const checkoutDataArray: CheckoutData[] = Object.entries(serviceGroups).map(([serviceId, items]) => {
      const firstItem = items[0] || {};
      const location = firstItem.location || {};
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      const formattedData: CheckoutData = {
        Nombre: data.name,
        Telefono: data.phone,
        Mail: data.email || null,
        PaisISO: 0,
        DepartamentoId: Number(selectedDepartment) || null,
        MunicipioId: Number(selectedLocation) || null,
        ZonasID: 0,
        Direccion: `${data.street} ${data.number}${data.apartment ? ` Apto ${data.apartment}` : ''}${data.corner ? ` esq. ${data.corner}` : ''}`,
        MetodoPagosID: data.paymentMethod === "later" ? 1 : 4,
        SolicitudPagada: "",
        SolicitaCotizacion: total.toString(),
        SolicitaOtroServicio: "",
        OtroServicioDetalle: "",
        FechaInstalacion: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm:ss") : "",
        TurnoInstalacion: getTimeSlotNumber(selectedTimeSlot),
        Comentario: data.comments || "",
        ProveedorAuxiliar: getProviderAuxiliary(location.storeId || "", location.otherLocation),
        items: items.map(item => ({
          RubrosId: Number(item.serviceId),
          MedidasID: Number(item.categoryId),
          InventarioId: Number(item.productId),
          SolicitudesItemsCantidad: item.quantity,
          SolicitudItemsSR: "N",
          SolicitudItemsComision: 0,
          SolicitudItemsComisionTipo: "P"
        }))
      };

      return formattedData;
    });

    setCheckoutData(checkoutDataArray);
    setShowSummary(true);
  };

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Carrito de Servicios</SheetTitle>
          </SheetHeader>
          
          {Array.isArray(purchaseLocations) && purchaseLocations.length > 0 && (
            <div className="mt-4 p-3 rounded-lg border-[1px] border-blue-200 bg-blue-50">
              <h4 className="text-sm font-medium text-blue-700 mb-1">Lugares de compra registrados:</h4>
              <div className="space-y-1">
                {purchaseLocations.map((location, index) => (
                  <div key={index} className="flex items-center text-xs">
                    <MapPin className="text-blue-500 mr-1" size={12} />
                    <span className="text-blue-700 font-medium">{location.serviceName}: </span>
                    <span className="text-blue-600 ml-1">
                      {location.storeId === "other" ? location.otherLocation : location.storeName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex flex-col h-[calc(100vh-12rem)] mt-6">
            {(!safeCartItems || safeCartItems.length === 0) && currentStep === 0 ? (
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
                  
                  {currentStep === 1 && safeCartItems && (
                    <CartItemsStep 
                      cartItems={safeCartItems}
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
                  
                  {currentStep === 3 && safeCartItems && (
                    <PersonalInfoStep 
                      onPrevious={handlePreviousStep}
                      onSubmit={handleSubmit}
                      cartItems={safeCartItems}
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
      
      <CheckoutSummary 
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        data={checkoutData}
      />
    </>
  );
};

export default CartDrawer;
