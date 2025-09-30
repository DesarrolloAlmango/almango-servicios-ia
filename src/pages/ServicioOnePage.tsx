import React, { useState, useEffect } from "react";
import { ArrowLeft, Home, Wind, Droplets, Zap, Package, Truck, Baby, MapPin, CalendarClock, UserCheck, CreditCard, Check, ShoppingCart, Plus, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckoutData, CheckoutItem } from "@/types/checkoutTypes";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import PurchaseLocationModal from "@/components/PurchaseLocationModal";
import { setGlobalZoneCost } from "@/utils/globalZoneCost";

interface TarjetaServicio {
  id?: string;
  name: string;
  icon: keyof typeof iconComponents | string;
  url?: string;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
}

interface Product {
  ProductoID: number;
  NombreProducto: string;
  Precio: number;
  TextosId?: number;
  RubrosId: number;
  SR: string;
  Comision: number;
  ComisionTipo: string;
}

interface LocationData {
  countries: Array<{
    id: number;
    name: string;
    iso: string;
  }>;
  departments: Array<{
    id: number;
    name: string;
    paisId: number;
  }>;
  municipalities: Array<{
    id: number;
    name: string;
    departamentoId: number;
  }>;
  zones: Array<{
    id: number;
    name: string;
    municipioId: number;
    costo: number;
  }>;
}

interface PurchaseLocation {
  storeId: string;
  storeName: string;
  departmentId: string;
  departmentName: string;
  locationId: string;
  locationName: string;
  zonaCostoAdicional?: string;
}

const iconComponents = {
  Package,
  Baby,
  Wind,
  Home,
  Droplets,
  Zap,
  Truck
};

const ServicioOnePage = () => {
  const navigate = useNavigate();
  const {
    userId,
    commerceId,
    serviceId: urlServiceId,
    categoryId: urlCategoryId
  } = useParams();

  // Form states
  const [selectedService, setSelectedService] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [personalInfo, setPersonalInfo] = useState({
    nombre: "",
    telefono: "",
    email: "",
    calle: "",
    numero: "",
    esquina: "",
    apartamento: ""
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("1");
  const [comments, setComments] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [soliciteQuote, setSoliciteQuote] = useState(false);
  const [soliciteOtherService, setSoliciteOtherService] = useState(false);
  const [otherServiceDetail, setOtherServiceDetail] = useState("");

  // UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckoutSummary, setShowCheckoutSummary] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [purchaseLocation, setPurchaseLocation] = useState<PurchaseLocation | null>(null);
  const [allSelectedServices, setAllSelectedServices] = useState<{
    serviceId: string;
    serviceName: string;
    categoryId: string;
    categoryName: string;
    products: Product[];
  }[]>([]);

  // Data fetching
  const {
    data: services,
    isLoading: isServicesLoading
  } = useQuery({
    queryKey: ["tarjetasServicios", commerceId],
    queryFn: async () => {
      const response = await fetch("https://app.almango.com.uy/WebAPI/GetTarjetasServicios");
      if (!response.ok) throw new Error("Error al obtener servicios");
      const data = await response.json();
      return JSON.parse(data.SDTTarjetasServiciosJson);
    }
  });

  const {
    data: categories,
    isLoading: isCategoriesLoading
  } = useQuery({
    queryKey: ["categories", selectedService],
    queryFn: async () => {
      if (!selectedService) return [];
      const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerNivel1?Nivel0=${selectedService}`);
      if (!response.ok) throw new Error("Error al obtener categorías");
      const data = await response.json();
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      const mappedCategories = parsedData.map((cat: any) => ({
        id: cat.Nivel1ID ? cat.Nivel1ID.toString() : cat.id?.toString() || cat.ID?.toString(),
        name: cat.NombreNivel1 || cat.name || cat.Name,
        icon: cat.IconoNivel1 || cat.icon
      }));
      return mappedCategories;
    },
    enabled: !!selectedService
  });

  const {
    data: products,
    isLoading: isProductsLoading
  } = useQuery({
    queryKey: ["products", selectedService, selectedCategory, purchaseLocation?.storeId, purchaseLocation?.departmentId, purchaseLocation?.locationId],
    queryFn: async () => {
      if (!selectedService || !selectedCategory || !purchaseLocation) return [];
      const params = new URLSearchParams({
        Nivel0: selectedService,
        Nivel1: selectedCategory,
        ComercioId: purchaseLocation.storeId,
        DepartamentoId: purchaseLocation.departmentId,
        LocalidadId: purchaseLocation.locationId
      });
      const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerNivel2?${params.toString()}`);
      if (!response.ok) throw new Error("Error al obtener productos");
      const data = await response.json();
      const mappedProducts = data.map((product: any) => ({
        ProductoID: parseInt(product.id) || product.ProductoID,
        NombreProducto: product.name || product.NombreProducto,
        Precio: parseFloat(product.price) || product.Precio,
        TextosId: product.TextosId || product.textosId,
        RubrosId: parseInt(selectedCategory),
        SR: product.SR || "S",
        Comision: product.Comision || 0,
        ComisionTipo: product.ComisionTipo || "P"
      }));
      return mappedProducts;
    },
    enabled: !!(selectedService && selectedCategory && purchaseLocation)
  });

  const {
    data: locationData,
    isLoading: isLocationLoading
  } = useQuery({
    queryKey: ["locationData"],
    queryFn: async () => {
      const [countriesRes, departmentsRes, municipalitiesRes, zonesRes] = await Promise.all([
        fetch("https://app.almango.com.uy/WebAPI/GetPaises"),
        fetch("https://app.almango.com.uy/WebAPI/GetDepartamentos"),
        fetch("https://app.almango.com.uy/WebAPI/GetMunicipios"),
        fetch("https://app.almango.com.uy/WebAPI/GetZonas")
      ]);
      const [countries, departments, municipalities, zones] = await Promise.all([
        countriesRes.json(),
        departmentsRes.json(),
        municipalitiesRes.json(),
        zonesRes.json()
      ]);
      return {
        countries: JSON.parse(countries.SDTPaisesJson),
        departments: JSON.parse(departments.SDTDepartamentosJson),
        municipalities: JSON.parse(municipalities.SDTMunicipiosJson),
        zones: JSON.parse(zones.SDTZonasJson)
      };
    }
  });

  // Pre-select from URL parameters
  useEffect(() => {
    if (urlServiceId) {
      setSelectedService(urlServiceId);
    }
    if (urlCategoryId) {
      setSelectedCategory(urlCategoryId);
    }
  }, [urlServiceId, urlCategoryId]);

  const handleProductToggle = (product: Product, selected: boolean) => {
    if (selected) {
      setSelectedProducts(prev => [...prev, product]);
    } else {
      setSelectedProducts(prev => prev.filter(p => p.ProductoID !== product.ProductoID));
    }
  };

  // Remove unused filter functions since we're using purchaseLocation data

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return (allSelectedServices.length > 0 || selectedService && selectedCategory && selectedProducts.length > 0) && !!selectedDate && !!selectedTimeSlot;
      case 2:
        return !!(personalInfo.nombre && personalInfo.telefono && personalInfo.calle && personalInfo.numero);
      default:
        return false;
    }
  };

  const addCurrentServiceToList = () => {
    if (!selectedService || !selectedCategory || selectedProducts.length === 0) {
      toast.error("Por favor complete la selección de servicio");
      return;
    }
    const serviceName = services?.find(s => s.id === selectedService)?.name || "";
    const categoryName = categories?.find(c => c.id === selectedCategory)?.name || "";
    const newService = {
      serviceId: selectedService,
      serviceName,
      categoryId: selectedCategory,
      categoryName,
      products: [...selectedProducts]
    };
    setAllSelectedServices(prev => [...prev, newService]);
    setSelectedService("");
    setSelectedCategory("");
    setSelectedProducts([]);
    setPurchaseLocation(null);
  };

  const removeServiceFromList = (index: number) => {
    setAllSelectedServices(prev => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!selectedService || !selectedCategory) {
        toast.error("Por favor seleccione un servicio y categoría");
        return;
      }
      if (!purchaseLocation) {
        setIsLocationModalOpen(true);
        return;
      }
      if (allSelectedServices.length === 0 && selectedProducts.length === 0) {
        toast.error("Por favor seleccione al menos un producto");
        return;
      }
    }
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error("Por favor complete todos los campos requeridos");
    }
  };

  const handleLocationSelect = (storeId: string, storeName: string, departmentId: string, departmentName: string, locationId: string, locationName: string, otherLocation?: string, zonaCostoAdicional?: string) => {
    const location: PurchaseLocation = {
      storeId,
      storeName,
      departmentId,
      departmentName,
      locationId,
      locationName,
      zonaCostoAdicional
    };
    setPurchaseLocation(location);
    const zoneCost = zonaCostoAdicional ? parseFloat(zonaCostoAdicional) : 0;
    setGlobalZoneCost(zoneCost);
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Get location data from purchaseLocation
      let departamentoId = 0;
      let municipioId = 0;
      let zonasId = 0;
      let paisId = 1; // Default to Uruguay

      if (purchaseLocation) {
        departamentoId = parseInt(purchaseLocation.departmentId || "0");
        municipioId = parseInt(purchaseLocation.locationId || "0");
        const zone = locationData?.zones.find(z => z.municipioId === municipioId);
        if (zone) {
          zonasId = zone.id;
        }
      }

      // Note: personal info override removed since we use purchaseLocation data

      const zoneCost = locationData?.zones.find(z => z.id === zonasId)?.costo || 0;

      // Combine all selected services and current selection
      const allProducts = [...allSelectedServices.flatMap(service => service.products), ...selectedProducts];
      
      if (allProducts.length === 0) {
        toast.error("Debe seleccionar al menos un producto");
        return;
      }

      const checkoutItems: CheckoutItem[] = allProducts.map(product => ({
        RubrosId: product.RubrosId,
        ProductoID: product.ProductoID,
        DetalleID: null,
        Cantidad: 1,
        Precio: product.Precio,
        SR: product.SR,
        Comision: product.Comision,
        ComisionTipo: product.ComisionTipo,
        PrecioFinal: product.Precio,
        ProductName: product.NombreProducto
      }));

      const data = {
        Nombre: personalInfo.nombre,
        Telefono: personalInfo.telefono,
        Mail: personalInfo.email || "",
        PaisISO: paisId,
        DepartamentoId: departamentoId,
        MunicipioId: municipioId,
        ZonasID: zonasId,
        Direccion: `${personalInfo.calle} ${personalInfo.numero}${personalInfo.apartamento ? ` Apto ${personalInfo.apartamento}` : ''}${personalInfo.esquina ? ` esq. ${personalInfo.esquina}` : ''}`,
        MetodoPagosID: parseInt(paymentMethod) || 1,
        SolicitudPagada: null,
        SolicitaCotizacion: soliciteQuote ? "S" : "N",
        SolicitaOtroServicio: soliciteOtherService ? "S" : "N",
        OtroServicioDetalle: otherServiceDetail || "",
        FechaInstalacion: format(selectedDate!, "yyyy-MM-dd"),
        TurnoInstalacion: selectedTimeSlot,
        Comentario: comments || "",
        ConfirmarCondicionesUso: "S",
        ProveedorAuxiliar: commerceId || null,
        CostoXZona: zoneCost,
        Descuento: 0,
        Level1: checkoutItems
      };

      // Validate required fields
      const missingFields = [];
      if (!data.Nombre) missingFields.push("Nombre");
      if (!data.Telefono) missingFields.push("Teléfono");
      if (!personalInfo.calle) missingFields.push("Calle");
      if (!personalInfo.numero) missingFields.push("Número");
      if (!data.DepartamentoId) missingFields.push("Departamento");
      if (!data.MunicipioId) missingFields.push("Municipio");
      if (!data.ZonasID) missingFields.push("Zona");
      if (!data.FechaInstalacion) missingFields.push("Fecha");
      if (!data.TurnoInstalacion) missingFields.push("Horario");
      if (data.Level1.length === 0) missingFields.push("Productos");

      if (missingFields.length > 0) {
        toast.error(`Faltan campos requeridos: ${missingFields.join(", ")}`);
        return;
      }

      // Prepare API call
      const jsonSolicitud = JSON.stringify(data);
      let providerId = "0";
      if (commerceId) {
        providerId = commerceId;
      } else if (purchaseLocation?.storeId) {
        providerId = purchaseLocation.storeId;
      }

      console.log("=== DATOS DE LA SOLICITUD ===");
      console.log("Provider ID:", providerId);
      console.log("User ID:", userId || "0");  
      console.log("Purchase Location:", purchaseLocation);
      console.log("Datos que se envían:", data);
      console.log("JSON que se envía:", jsonSolicitud);

      const url = new URL("https://app.almango.com.uy/WebAPI/AltaSolicitud");
      url.searchParams.append("Userconect", "NoEmpty");
      url.searchParams.append("Key", "d3d3LmF6bWl0YS5jb20=");
      url.searchParams.append("Proveedorid", providerId);
      url.searchParams.append("Usuarioid", userId || "0");
      url.searchParams.append("Jsonsolicitud", jsonSolicitud);

      console.log("URL completa:", url.toString());

      const response = await fetch(url.toString());
      
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      console.log("Response text raw:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Error parsing JSON:", parseError);
        throw new Error("La respuesta del servidor no es un JSON válido");
      }
      
      console.log("Respuesta del servidor parseada:", result);
      
      if (result && (result.SolicitudesID > 0 || result.solicitudesId > 0 || result.id > 0)) {
        const solicitudId = result.SolicitudesID || result.solicitudesId || result.id;
        
        toast.success(`¡Solicitud creada exitosamente!`, {
          description: `Número de solicitud: ${solicitudId}`,
          duration: 10000,
        });

        // Reset form data
        setAllSelectedServices([]);
        setSelectedService("");
        setSelectedCategory("");
        setSelectedProducts([]);
        setPersonalInfo({
          nombre: "",
          telefono: "",
          email: "",
          calle: "",
          numero: "",
          esquina: "",
          apartamento: ""
        });
        setSelectedDate(undefined);
        setSelectedTimeSlot("");
        setComments("");
        setAcceptTerms(false);
        setSoliciteQuote(false);
        setSoliciteOtherService(false);
        setOtherServiceDetail("");
        setPurchaseLocation(null);
        setCurrentStep(1);

      } else {
        console.error("Formato de respuesta inesperado:", result);
        throw new Error(`Respuesta del servidor: ${responseText.substring(0, 200)}...`);
      }

    } catch (error) {
      console.error("Error al procesar solicitud:", error);
      toast.error("Error al procesar la solicitud", {
        description: error instanceof Error ? error.message : "Error desconocido"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="service">Seleccione un Servicio</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {isServicesLoading ? (
                    <SelectItem value="loading" disabled>Cargando...</SelectItem>
                  ) : (
                    services?.map((service: TarjetaServicio) => (
                      <SelectItem key={service.id} value={service.id!}>
                        {service.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedService && (
              <div>
                <Label htmlFor="category">Seleccione una Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {isCategoriesLoading ? (
                      <SelectItem value="loading" disabled>Cargando categorías...</SelectItem>
                    ) : categories && categories.length > 0 ? (
                      categories.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-categories" disabled>
                        No hay categorías disponibles
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {purchaseLocation && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-sm">Ubicación del servicio</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {purchaseLocation.storeName} - {purchaseLocation.departmentName}, {purchaseLocation.locationName}
                </p>
                {purchaseLocation.zonaCostoAdicional && parseFloat(purchaseLocation.zonaCostoAdicional) > 0 && (
                  <p className="text-xs text-orange-600 mt-1">
                    Costo adicional por zona: ${purchaseLocation.zonaCostoAdicional}
                  </p>
                )}
              </div>
            )}

            {selectedCategory && !purchaseLocation && (
              <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setIsLocationModalOpen(true)}>
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 flex-1">Configurar ubicación del servicio</span>
                <span className="text-xs text-gray-500">Click para configurar</span>
              </div>
            )}

            {/* Services Summary Section */}
            {allSelectedServices.length > 0 && (
              <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-green-800">
                      Servicios Agregados ({allSelectedServices.length})
                    </h3>
                    <p className="text-sm text-green-600">
                      Puedes agregar más servicios o continuar al siguiente paso
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  {allSelectedServices.map((service, index) => (
                    <div key={index} className="bg-white p-4 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart className="h-4 w-4 text-green-600" />
                            <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Categoría: {service.categoryName}</p>
                          <p className="text-sm text-green-600 mb-3">{service.products.length} productos seleccionados</p>
                          
                          <div className="space-y-1 mb-3">
                            {service.products.map((product, idx) => (
                              <div key={idx} className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                                <span className="text-gray-700">{product.NombreProducto}</span>
                                <span className="font-medium text-gray-900">${product.Precio}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                            <span className="text-sm font-medium text-gray-700">Subtotal:</span>
                            <span className="text-lg font-bold text-green-700">
                              ${service.products.reduce((sum, p) => sum + p.Precio, 0)}
                            </span>
                          </div>
                        </div>
                        
                        <Button variant="ghost" size="sm" onClick={() => removeServiceFromList(index)} className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-4">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-green-200 bg-green-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-green-800">Total de servicios:</span>
                    <span className="text-xl font-bold text-green-800">
                      ${allSelectedServices.reduce((total, service) => total + service.products.reduce((sum, p) => sum + p.Precio, 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Date and Time Selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <CalendarClock className="h-4 w-4" />
                Fecha y Hora del Servicio
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarClock className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 z-50 bg-white" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          return date.getDay() === 0 || date < today || date.getTime() === today.getTime();
                        }}
                        locale={es}
                        className="pointer-events-auto"
                        fromDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)}
                        toDate={new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                {selectedDate && (
                  <div>
                    <Label htmlFor="timeSlot">Horario</Label>
                    <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                      <SelectTrigger className="bg-white">
                        <SelectValue placeholder="Seleccionar horario" />
                      </SelectTrigger>
                      <SelectContent className="z-50 bg-white">
                        {(() => {
                          const day = selectedDate.getDay();
                          let timeSlots: string[] = [];
                          
                          if (day === 6) {
                            timeSlots = ["08:00 - 14:00", "14:00 - 20:00"];
                          } else if (day !== 0) {
                            timeSlots = ["08:00 - 12:00", "12:00 - 16:00", "16:00 - 20:00"];
                          }
                          
                          // Clear selected time slot if it's not available for the current day
                          if (selectedTimeSlot && !timeSlots.includes(selectedTimeSlot)) {
                            setSelectedTimeSlot("");
                          }
                          
                          return timeSlots.map(slot => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            {/* Service Selection Section */}
            {selectedCategory && purchaseLocation && (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-blue-600" />
                    <Label className="text-base font-medium">
                      Productos disponibles para: {services?.find(s => s.id === selectedService)?.name}
                    </Label>
                  </div>
                  
                  <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                    {isProductsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : products && products.length > 0 ? (
                      products.map((product: Product) => (
                        <div
                          key={product.ProductoID}
                          className={cn(
                            "flex items-center space-x-3 p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md",
                            selectedProducts.some(p => p.ProductoID === product.ProductoID)
                              ? "border-primary bg-primary/5 shadow-sm"
                              : "border-gray-200 hover:border-gray-300"
                          )}
                          onClick={() => handleProductToggle(product, !selectedProducts.some(p => p.ProductoID === product.ProductoID))}
                        >
                          <Checkbox
                            id={`product-${product.ProductoID}`}
                            checked={selectedProducts.some(p => p.ProductoID === product.ProductoID)}
                            onCheckedChange={(checked) => handleProductToggle(product, checked as boolean)}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <Label htmlFor={`product-${product.ProductoID}`} className="cursor-pointer block">
                              <div className="font-medium text-gray-900 mb-1">
                                {product.NombreProducto}
                              </div>
                              <div className="text-lg font-bold text-primary">
                                ${product.Precio.toLocaleString()}
                              </div>
                            </Label>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-8">
                        No hay productos disponibles para esta categoría
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <UserCheck className="h-12 w-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-semibold">Datos Personales</h3>
              <p className="text-muted-foreground">Complete su información personal</p>
            </div>

            {/* Debug info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">🔍 Debug - JSON completo que se enviará:</h4>
              <pre className="text-xs text-yellow-700 whitespace-pre-wrap bg-yellow-100 p-2 rounded max-h-96 overflow-y-auto">
                {JSON.stringify({
                  Nombre: personalInfo.nombre,
                  Telefono: personalInfo.telefono,
                  Mail: personalInfo.email || null,
                  PaisISO: 0,
                  DepartamentoId: purchaseLocation ? parseInt(purchaseLocation.departmentId || "0") : 0,
                  MunicipioId: purchaseLocation ? parseInt(purchaseLocation.locationId || "0") : 0,
                  ZonasID: purchaseLocation && locationData ? locationData.zones.find(z => z.municipioId === parseInt(purchaseLocation.locationId || "0"))?.id || 0 : 0,
                  Direccion: `${personalInfo.calle} ${personalInfo.numero}${personalInfo.apartamento ? ` Apto ${personalInfo.apartamento}` : ''}${personalInfo.esquina ? ` esq. ${personalInfo.esquina}` : ''}`,
                  MetodoPagosID: parseInt(paymentMethod) || 1,
                  SolicitudPagada: null,
                  SolicitaCotizacion: soliciteQuote ? "S" : "N",
                  SolicitaOtroServicio: soliciteOtherService ? "S" : "N",
                  OtroServicioDetalle: otherServiceDetail || "",
                  FechaInstalacion: selectedDate ? format(selectedDate, "yyyy-MM-dd") : "",
                  TurnoInstalacion: selectedTimeSlot,
                  Comentario: comments || "",
                  ConfirmarCondicionesUso: "S",
                  ProveedorAuxiliar: commerceId || null,
                  CostoXZona: purchaseLocation && locationData ? locationData.zones.find(z => z.municipioId === parseInt(purchaseLocation.locationId || "0"))?.costoAdicional || 0 : 0,
                  Level1: selectedProducts.map(product => ({
                    RubrosId: parseInt(selectedService) || 0,
                    ProductoID: parseInt(selectedCategory) || null,
                    DetalleID: product.ProductoID || null,
                    Cantidad: 1,
                    Precio: product.Precio || 0,
                    SR: "N",
                    Comision: 0,
                    ComisionTipo: "P",
                    PrecioFinal: product.Precio || 0
                  }))
                }, null, 2)}
              </pre>
            </div>

            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre completo *</Label>
                <Input 
                  id="nombre" 
                  placeholder="Nombre y apellido" 
                  value={personalInfo.nombre} 
                  onChange={e => setPersonalInfo(prev => ({
                    ...prev,
                    nombre: e.target.value
                  }))} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input 
                  id="telefono" 
                  placeholder="Teléfono de contacto" 
                  value={personalInfo.telefono} 
                  onChange={e => setPersonalInfo(prev => ({
                    ...prev,
                    telefono: e.target.value
                  }))} 
                  required 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Correo electrónico (opcional)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com" 
                value={personalInfo.email} 
                onChange={e => setPersonalInfo(prev => ({
                  ...prev,
                  email: e.target.value
                }))} 
              />
            </div>

            {/* Dirección */}
            <div className="space-y-4">
              <h4 className="font-medium">Dirección</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="calle">Calle *</Label>
                  <Input 
                    id="calle" 
                    placeholder="Nombre de la calle" 
                    value={personalInfo.calle} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      calle: e.target.value
                    }))} 
                    required 
                  />
                </div>
                <div>
                  <Label htmlFor="numero">Número *</Label>
                  <Input 
                    id="numero" 
                    placeholder="Número de puerta" 
                    value={personalInfo.numero} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      numero: e.target.value
                    }))} 
                    required 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="esquina">Esquina (opcional)</Label>
                  <Input 
                    id="esquina" 
                    placeholder="Esquina de referencia" 
                    value={personalInfo.esquina} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      esquina: e.target.value
                    }))} 
                  />
                </div>
                <div>
                  <Label htmlFor="apartamento">Apartamento (opcional)</Label>
                  <Input 
                    id="apartamento" 
                    placeholder="Número de apartamento" 
                    value={personalInfo.apartamento} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      apartamento: e.target.value
                    }))} 
                  />
                </div>
              </div>
            </div>

            {/* Método de Pago */}
            <div className="space-y-4">
              <h4 className="font-medium">Método de Pago</h4>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="efectivo" />
                  <Label htmlFor="efectivo">Efectivo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="transferencia" />
                  <Label htmlFor="transferencia">Transferencia</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Comentarios adicionales */}
            <div>
              <Label htmlFor="comments">Comentarios adicionales (opcional)</Label>
              <Textarea
                id="comments"
                placeholder="Comentarios sobre el servicio"
                value={comments}
                onChange={e => setComments(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = ["Servicios", "Datos Personales"];
  const stepIcons = [ShoppingCart, UserCheck];
  const stepDescriptions = [
    "Selecciona los servicios que necesitas",
    "Completa tus datos de contacto"
  ];

  if (showCheckoutSummary && checkoutData) {
    const departmentsData = locationData?.departments.map(dept => ({
      id: dept.id.toString(),
      name: dept.name
    })) || [];
    const municipalitiesData = locationData?.departments.reduce((acc, dept) => {
      const municipalities = locationData?.municipalities.filter(mun => mun.departamentoId === dept.id) || [];
      acc[dept.id.toString()] = municipalities.map(mun => ({
        id: mun.id.toString(),
        name: mun.name
      }));
      return acc;
    }, {} as Record<string, Array<{
      id: string;
      name: string;
    }>>) || {};
    
    return (
      <CheckoutSummary 
        isOpen={showCheckoutSummary} 
        onClose={(success) => {
          setShowCheckoutSummary(false);
          if (success) {
            toast.success("Solicitud enviada correctamente");
            navigate("/");
          }
        }} 
        data={[checkoutData]} 
        departments={departmentsData} 
        municipalities={municipalitiesData} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Solicitud de Servicio</h1>
          <div className="w-20"></div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {stepTitles.map((title, index) => {
              const StepIcon = stepIcons[index];
              const stepNumber = index + 1;
              const isActive = currentStep === stepNumber;
              const isCompleted = currentStep > stepNumber;
              
              return (
                <div key={stepNumber} className="flex flex-col items-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-200",
                    isActive 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : isCompleted
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-muted-foreground text-muted-foreground"
                  )}>
                    {isCompleted ? (
                      <Check className="h-6 w-6" />
                    ) : (
                      <StepIcon className="h-6 w-6" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={cn(
                      "font-medium text-sm",
                      isActive ? "text-primary" : isCompleted ? "text-green-600" : "text-muted-foreground"
                    )}>
                      {title}
                    </p>
                    <p className="text-xs text-muted-foreground">{stepDescriptions[index]}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {React.createElement(stepIcons[currentStep - 1], { className: "h-6 w-6" })}
                {stepTitles[currentStep - 1]}
              </CardTitle>
              <CardDescription>
                {stepDescriptions[currentStep - 1]}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderStepContent()}
            </CardContent>

            {/* Navigation Buttons */}
            <div className="px-6 pb-6">
              <div className="flex justify-between gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(prev => prev - 1)} 
                  disabled={currentStep === 1}
                  className="min-w-32"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Anterior
                </Button>
              
                {currentStep < stepTitles.length ? (
                  <div className="flex gap-2">
                    {currentStep === 1 && allSelectedServices.length > 0 && (
                      <Button onClick={() => {
                        if (!selectedDate || !selectedTimeSlot) {
                          toast.error("Por favor seleccione fecha y horario");
                          return;
                        }
                        setCurrentStep(2);
                      }} className="flex-1">
                        Continuar con {allSelectedServices.length} servicio{allSelectedServices.length > 1 ? 's' : ''} seleccionado{allSelectedServices.length > 1 ? 's' : ''}
                      </Button>
                    )}
                    {currentStep === 1 && (selectedService || selectedCategory || selectedProducts.length > 0) && (
                      <Button variant="outline" onClick={() => {
                        setSelectedService("");
                        setSelectedCategory("");
                        setSelectedProducts([]);
                        setPurchaseLocation(null);
                      }} className="min-w-40">
                        Limpiar selección actual
                      </Button>
                    )}
                    {currentStep === 2 && (
                      <Button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting || !validateStep(2)}
                        className="min-w-32"
                      >
                        {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
                      </Button>
                    )}
                  </div>
                ) : (
                  <Button onClick={handleSubmit} disabled={!validateStep(currentStep) || isSubmitting}>
                    {isSubmitting ? "Procesando..." : "Confirmar Solicitud"}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        <PurchaseLocationModal 
          isOpen={isLocationModalOpen} 
          onClose={() => setIsLocationModalOpen(false)} 
          onSelectLocation={handleLocationSelect} 
          stores={[]} 
          serviceId={selectedService} 
          serviceName={services?.find(s => s.id === selectedService)?.name} 
          categoryId={selectedCategory} 
          categoryName={categories?.find(c => c.id === selectedCategory)?.name} 
        />
      </div>
    </div>
  );
};

export default ServicioOnePage;