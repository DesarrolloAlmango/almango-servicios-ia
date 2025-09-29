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
    pais: "",
    departamento: "",
    municipio: "",
    zona: "",
    direccion: ""
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("1"); // Default to cash (efectivo)
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
      console.log("Fetching categories for service:", selectedService);
      const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerNivel1?Nivel0=${selectedService}`);
      if (!response.ok) throw new Error("Error al obtener categorías");
      const data = await response.json();
      console.log("Raw categories data:", data);

      // Parse the JSON if it comes as a string
      const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
      console.log("Parsed categories data:", parsedData);

      // Map the categories based on the actual structure
      const mappedCategories = parsedData.map((cat: any) => ({
        id: cat.Nivel1ID ? cat.Nivel1ID.toString() : cat.id?.toString() || cat.ID?.toString(),
        name: cat.NombreNivel1 || cat.name || cat.Name,
        icon: cat.IconoNivel1 || cat.icon
      }));
      console.log("Mapped categories:", mappedCategories);
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
      console.log("Fetching products for service:", selectedService, "category:", selectedCategory, "location:", purchaseLocation);

      // Include location parameters in the API call
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
      console.log("Raw products data:", data);

      // Map the products to the expected format
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
      console.log("Mapped products:", mappedProducts);
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
      const [countriesRes, departmentsRes, municipalitiesRes, zonesRes] = await Promise.all([fetch("https://app.almango.com.uy/WebAPI/GetPaises"), fetch("https://app.almango.com.uy/WebAPI/GetDepartamentos"), fetch("https://app.almango.com.uy/WebAPI/GetMunicipios"), fetch("https://app.almango.com.uy/WebAPI/GetZonas")]);
      const [countries, departments, municipalities, zones] = await Promise.all([countriesRes.json(), departmentsRes.json(), municipalitiesRes.json(), zonesRes.json()]);
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
  const getFilteredDepartments = () => {
    if (!locationData || !personalInfo.pais) return [];
    return locationData.departments.filter(dept => dept.paisId === parseInt(personalInfo.pais));
  };
  const getFilteredMunicipalities = () => {
    if (!locationData || !personalInfo.departamento) return [];
    return locationData.municipalities.filter(mun => mun.departamentoId === parseInt(personalInfo.departamento));
  };
  const getFilteredZones = () => {
    if (!locationData || !personalInfo.municipio) return [];
    return locationData.zones.filter(zone => zone.municipioId === parseInt(personalInfo.municipio));
  };
  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return allSelectedServices.length > 0 || selectedService && selectedCategory && selectedProducts.length > 0;
      case 2:
        return !!(personalInfo.nombre && personalInfo.telefono && personalInfo.direccion && personalInfo.pais);
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

    // Reset current selection
    setSelectedService("");
    setSelectedCategory("");
    setSelectedProducts([]);
    setPurchaseLocation(null);
    // toast.success(`Servicio "${serviceName}" agregado correctamente`);
  };
  const removeServiceFromList = (index: number) => {
    setAllSelectedServices(prev => prev.filter((_, i) => i !== index));
    // toast.success("Servicio eliminado");
  };
  const handleNextStep = () => {
    // For step 1, check if we need location first
    if (currentStep === 1) {
      if (!selectedService || !selectedCategory) {
        toast.error("Por favor seleccione un servicio y categoría");
        return;
      }
      if (!purchaseLocation) {
        setIsLocationModalOpen(true);
        return;
      }
      // Check if we have services selected or if we need to add current service
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

    // Set global zone cost for price calculations
    const zoneCost = zonaCostoAdicional ? parseFloat(zonaCostoAdicional) : 0;
    setGlobalZoneCost(zoneCost);

    // Don't automatically continue to next step, stay in step 1 to show products
    // toast.success("Ubicación configurada correctamente");
  };
  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error("Por favor acepte los términos y condiciones");
      return;
    }
    setIsSubmitting(true);
    try {
      const zoneCost = locationData?.zones.find(z => z.id === parseInt(personalInfo.zona))?.costo || 0;

      // Combine all selected services and current selection
      const allProducts = [...allSelectedServices.flatMap(service => service.products), ...selectedProducts];
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
      const data: CheckoutData = {
        Nombre: personalInfo.nombre,
        Telefono: personalInfo.telefono,
        Mail: personalInfo.email || null,
        PaisISO: parseInt(personalInfo.pais),
        DepartamentoId: parseInt(personalInfo.departamento),
        MunicipioId: parseInt(personalInfo.municipio),
        ZonasID: parseInt(personalInfo.zona),
        Direccion: personalInfo.direccion,
        MetodoPagosID: parseInt(paymentMethod),
        SolicitudPagada: null,
        SolicitaCotizacion: soliciteQuote ? "S" : "N",
        SolicitaOtroServicio: soliciteOtherService ? "S" : "N",
        OtroServicioDetalle: otherServiceDetail,
        FechaInstalacion: format(selectedDate!, "yyyy-MM-dd"),
        TurnoInstalacion: selectedTimeSlot,
        Comentario: comments,
        ConfirmarCondicionesUso: acceptTerms ? "S" : "N",
        ProveedorAuxiliar: commerceId || null,
        CostoXZona: zoneCost,
        Level1: checkoutItems,
        serviceName: services?.find(s => s.id === selectedService)?.name || ""
      };
      setCheckoutData(data);
      setShowCheckoutSummary(true);
    } catch (error) {
      console.error("Error al procesar solicitud:", error);
      toast.error("Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <div className="space-y-6">
            <div>
              <Label htmlFor="service">Seleccione un Servicio</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {isServicesLoading ? <SelectItem value="loading" disabled>Cargando...</SelectItem> : services?.map((service: TarjetaServicio) => <SelectItem key={service.id} value={service.id!}>
                        {service.name}
                      </SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {selectedService && <div>
                <Label htmlFor="category">Seleccione una Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {isCategoriesLoading ? <SelectItem value="loading" disabled>Cargando categorías...</SelectItem> : categories && categories.length > 0 ? categories.map((category: Category) => <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>) : <SelectItem value="no-categories" disabled>
                        No hay categorías disponibles
                      </SelectItem>}
                  </SelectContent>
                </Select>
                {categories && <p className="text-xs text-muted-foreground mt-1">
                    Categorías encontradas: {categories.length}
                  </p>}
              </div>}

            {purchaseLocation && <div className="mt-4 p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-orange-500" />
                  <span className="font-medium text-sm">Ubicación del servicio</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {purchaseLocation.storeName} - {purchaseLocation.departmentName}, {purchaseLocation.locationName}
                </p>
                {purchaseLocation.zonaCostoAdicional && parseFloat(purchaseLocation.zonaCostoAdicional) > 0 && <p className="text-xs text-orange-600 mt-1">
                    Costo adicional por zona: ${purchaseLocation.zonaCostoAdicional}
                  </p>}
              </div>}

            {selectedCategory && !purchaseLocation && <div className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" onClick={() => setIsLocationModalOpen(true)}>
                <MapPin className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 flex-1">Configurar ubicación del servicio</span>
                <span className="text-xs text-gray-500">Click para configurar</span>
              </div>}

            {/* Services Summary Section */}
            {allSelectedServices.length > 0 && <div className="mb-6 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl shadow-sm">
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
                  {allSelectedServices.map((service, index) => <div key={index} className="bg-white p-4 rounded-lg border border-green-100 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <ShoppingCart className="h-4 w-4 text-green-600" />
                            <h4 className="font-medium text-gray-900">{service.serviceName}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Categoría: {service.categoryName}</p>
                          <p className="text-sm text-green-600 mb-3">{service.products.length} productos seleccionados</p>
                          
                          <div className="space-y-1 mb-3">
                            {service.products.map((product, idx) => <div key={idx} className="flex justify-between text-xs bg-gray-50 px-2 py-1 rounded">
                                <span className="text-gray-700">{product.NombreProducto}</span>
                                <span className="font-medium text-gray-900">${product.Precio}</span>
                              </div>)}
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
                    </div>)}
                </div>
                
                <div className="mt-4 pt-4 border-t border-green-200 bg-green-50 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-semibold text-green-800">Total de servicios:</span>
                    <span className="text-xl font-bold text-green-800">
                      ${allSelectedServices.reduce((total, service) => total + service.products.reduce((sum, p) => sum + p.Precio, 0), 0)}
                    </span>
                  </div>
                </div>
              </div>}

            {/* Date and Time Selection - Always visible */}
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
                          
                          return timeSlots.map(slot => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                    
                    <p className="text-xs text-blue-600 mt-2">
                      En caso de coordinación web, confirme disponibilidad por WhatsApp.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Service Selection Section - Only show when category and location are selected */}
            {selectedCategory && purchaseLocation && <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-blue-600" />
                    <Label className="text-base font-medium">
                      Productos disponibles para: {services?.find(s => s.id === selectedService)?.name}
                    </Label>
                  </div>
                  
                  <div className="grid gap-3 max-h-96 overflow-y-auto pr-2">
                    {isProductsLoading ? <div className="space-y-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                      </div> : products && products.length > 0 ? products.map((product: Product) => <div key={product.ProductoID} className={cn("flex items-center space-x-3 p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer hover:shadow-md", selectedProducts.some(p => p.ProductoID === product.ProductoID) ? "border-primary bg-primary/5 shadow-sm" : "border-gray-200 hover:border-gray-300")} onClick={() => handleProductToggle(product, !selectedProducts.some(p => p.ProductoID === product.ProductoID))}>
                          <Checkbox id={`product-${product.ProductoID}`} checked={selectedProducts.some(p => p.ProductoID === product.ProductoID)} onCheckedChange={checked => handleProductToggle(product, checked as boolean)} className="w-5 h-5" />
                          <div className="flex-1">
                            <Label htmlFor={`product-${product.ProductoID}`} className="cursor-pointer block">
                              <div className="flex justify-between items-start">
                                <div>
                                  <span className="font-medium text-gray-900 block">{product.NombreProducto}</span>
                                  <span className="text-sm text-gray-500">Código: {product.ProductoID}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-bold text-primary">${product.Precio}</span>
                                  <span className="block text-xs text-gray-500">por servicio</span>
                                </div>
                              </div>
                            </Label>
                          </div>
                        </div>) : <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-lg">
                        <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="font-medium">No hay productos disponibles</p>
                        <p className="text-sm">para esta categoría en tu ubicación</p>
                      </div>}
                  </div>

                  {/* Add Service Action */}
                  {selectedProducts.length > 0 && <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-blue-900">
                            ✓ {selectedProducts.length} productos seleccionados
                          </p>
                          <p className="text-sm text-blue-700">
                            de "{services?.find(s => s.id === selectedService)?.name}"
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-900">
                            ${selectedProducts.reduce((sum, p) => sum + p.Precio, 0)}
                          </p>
                          <p className="text-xs text-blue-600">subtotal</p>
                        </div>
                      </div>
                      <Button onClick={addCurrentServiceToList} className="w-full bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar "{services?.find(s => s.id === selectedService)?.name}" a mi solicitud
                      </Button>
                    </div>}
                </div>
                
                {/* Date and Time Selection */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
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
                        <PopoverContent className="w-auto p-0" align="start">
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
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar horario" />
                          </SelectTrigger>
                          <SelectContent>
                            {(() => {
                              const day = selectedDate.getDay();
                              let timeSlots: string[] = [];
                              
                              if (day === 6) {
                                timeSlots = ["08:00 - 14:00", "14:00 - 20:00"];
                              } else if (day !== 0) {
                                timeSlots = ["08:00 - 12:00", "12:00 - 16:00", "16:00 - 20:00"];
                              }
                              
                              return timeSlots.map(slot => (
                                <SelectItem key={slot} value={slot}>
                                  {slot}
                                </SelectItem>
                              ));
                            })()}
                          </SelectContent>
                        </Select>
                        
                        <p className="text-xs text-blue-600 mt-2">
                          En caso de coordinación web, confirme disponibilidad por WhatsApp.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
            </div>}
          </div>;
      case 2:
        return <div className="space-y-6">
            <div className="text-center mb-6">
              <CalendarClock className="h-12 w-12 mx-auto text-primary mb-2" />
              <h3 className="text-xl font-semibold">Fecha y Hora</h3>
              <p className="text-muted-foreground">Selecciona cuándo necesitas el servicio</p>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-3">Elige una fecha</h4>
                <div className="flex justify-center">
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
                    className="rounded-md border pointer-events-auto" 
                    fromDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)} 
                    toDate={new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000)} 
                  />
                </div>
              </div>

              {selectedDate && (
                <div>
                  <h4 className="font-medium mb-3">Elige un horario</h4>
                  {(() => {
                    const day = selectedDate.getDay();
                    let timeSlots: string[] = [];
                    
                    if (day === 6) {
                      timeSlots = ["08:00 - 14:00", "14:00 - 20:00"];
                    } else if (day !== 0) {
                      timeSlots = ["08:00 - 12:00", "12:00 - 16:00", "16:00 - 20:00"];
                    }

                    return timeSlots.length > 0 ? (
                      <>
                        <RadioGroup 
                          value={selectedTimeSlot} 
                          onValueChange={setSelectedTimeSlot} 
                          className="grid grid-cols-1 md:grid-cols-3 gap-3"
                        >
                          {timeSlots.map(slot => (
                            <div key={slot} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-gray-50">
                              <RadioGroupItem value={slot} id={`slot-${slot}`} />
                              <Label htmlFor={`slot-${slot}`} className="cursor-pointer">
                                {slot}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-700 text-center">
                            En caso de coordinación web, confirme disponibilidad por WhatsApp.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-4 text-red-500">
                        No hay horarios disponibles para domingos. Por favor, elige otro día.
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          </div>;
      case 3:
        return <div className="space-y-6">

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
                    value={personalInfo.direccion} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      direccion: e.target.value
                    }))} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="numero">Número *</Label>
                  <Input 
                    id="numero" 
                    placeholder="Número de puerta" 
                    value={personalInfo.pais} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      pais: e.target.value
                    }))} 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="esquina">Esquina</Label>
                  <Input 
                    id="esquina" 
                    placeholder="Intersección más cercana" 
                    value={personalInfo.departamento} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      departamento: e.target.value
                    }))} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="apartamento">Apartamento</Label>
                  <Input 
                    id="apartamento" 
                    placeholder="Apto (opcional)" 
                    value={personalInfo.municipio} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      municipio: e.target.value
                    }))} 
                  />
                </div>
              </div>
            </div>

            {/* Comentarios */}
            <div>
              <Label htmlFor="comentarios">Comentarios</Label>
              <Textarea 
                id="comentarios" 
                placeholder="¿Hay algo más que debamos saber?" 
                value={personalInfo.zona} 
                onChange={e => setPersonalInfo(prev => ({
                  ...prev,
                  zona: e.target.value
                }))} 
              />
            </div>
            
            {/* Comentarios Adicionales */}
            <div>
              <Label htmlFor="comments">Comentarios Adicionales</Label>
              <Textarea 
                id="comments" 
                value={comments} 
                onChange={e => setComments(e.target.value)} 
                placeholder="Agregue cualquier comentario o solicitud especial" 
              />
            </div>

          </div>;

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
      acc[dept.id.toString()] = locationData?.municipalities.filter(mun => mun.departamentoId === dept.id).map(mun => ({
        id: mun.id.toString(),
        name: mun.name
      })) || [];
      return acc;
    }, {} as Record<string, Array<{
      id: string;
      name: string;
    }>>) || {};
    return <CheckoutSummary isOpen={showCheckoutSummary} onClose={success => {
      setShowCheckoutSummary(false);
      if (success) {
        toast.success("Solicitud enviada correctamente");
        navigate("/");
      }
    }} data={[checkoutData]} departments={departmentsData} municipalities={municipalitiesData} />;
  }
  return <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Solicitud de Servicio</h1>
          <div className="w-20" />
        </div>

        {/* Modern Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            {stepTitles.map((title, index) => {
            const IconComponent = stepIcons[index];
            const isCompleted = index + 1 < currentStep;
            const isCurrent = index + 1 === currentStep;
            return <div key={index} className="flex flex-col items-center relative flex-1">
                  {/* Connection Line */}
                  {index < stepTitles.length - 1 && <div className="absolute top-6 left-1/2 w-full h-0.5 bg-muted -z-10">
                      <div className={cn("h-full bg-primary transition-all duration-500", isCompleted ? "w-full" : "w-0")} />
                    </div>}
                  
                  {/* Step Circle */}
                  <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 shadow-lg", isCurrent && "animate-scale-in ring-4 ring-primary/20", isCompleted ? "bg-primary text-primary-foreground shadow-primary/25" : isCurrent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground")}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <IconComponent className="h-5 w-5" />}
                  </div>
                  
                  {/* Step Info */}
                  <div className="text-center mt-3 max-w-32">
                    <span className={cn("text-sm font-medium block transition-colors", isCurrent ? "text-primary" : isCompleted ? "text-primary" : "text-muted-foreground")}>
                      {title}
                    </span>
                    
                  </div>
                </div>;
          })}
          </div>
        </div>

        {/* Form Content with Animation */}
        <div className="max-w-4xl mx-auto animate-fade-in">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center border-b bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center justify-center gap-3 mb-2">
                {React.createElement(stepIcons[currentStep - 1], {
                className: "h-6 w-6 text-primary"
              })}
                <CardTitle className="text-xl text-primary">
                  Paso {currentStep} de {stepTitles.length}
                </CardTitle>
              </div>
              
            </CardHeader>
          <CardContent className="p-8">{renderStepContent()}</CardContent>
            
            {/* Action Buttons */}
            <div className="flex justify-between p-8 pt-0 border-t bg-muted/30">
              <Button variant="outline" onClick={() => setCurrentStep(prev => prev - 1)} disabled={currentStep === 1} className="min-w-32">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Anterior
              </Button>
            
            {currentStep < stepTitles.length ? (
              <div className="flex gap-2">
                {currentStep === 1 && allSelectedServices.length > 0 && (
                  <Button onClick={() => setCurrentStep(2)} className="flex-1">
                    Continuar con {allSelectedServices.length} servicio{allSelectedServices.length > 1 ? 's' : ''} seleccionado{allSelectedServices.length > 1 ? 's' : ''}
                  </Button>
                )}
                {currentStep === 1 && (selectedService || selectedCategory || selectedProducts.length > 0) && (
                  <Button variant="outline" onClick={() => {
                    setSelectedService("");
                    setSelectedCategory("");
                    setSelectedProducts([]);
                    setPurchaseLocation(null);
                    // toast.success("Selección actual limpiada");
                  }} className={allSelectedServices.length > 0 ? "flex-1" : ""}>
                    Limpiar selección actual
                  </Button>
                )}
                {currentStep === 1 && (
                  <Button 
                    onClick={() => setCurrentStep(prev => prev + 1)} 
                    disabled={!validateStep(currentStep)}
                    className="min-w-32"
                  >
                    Siguiente
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
          </Card>
        </div>

        <PurchaseLocationModal isOpen={isLocationModalOpen} onClose={() => setIsLocationModalOpen(false)} onSelectLocation={handleLocationSelect} stores={[]} serviceId={selectedService} serviceName={services?.find(s => s.id === selectedService)?.name} categoryId={selectedCategory} categoryName={categories?.find(c => c.id === selectedCategory)?.name} />
      </div>
    </div>;
};
export default ServicioOnePage;