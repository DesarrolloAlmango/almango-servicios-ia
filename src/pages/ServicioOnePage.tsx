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
import ConfirmationModal from "@/components/ConfirmationModal";
import { GeneralTermsModal } from "@/components/ui/general-terms-modal";
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
  DetallesID?: number | null;
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
    name: "",
    phone: "",
    email: "",
    street: "",
    number: "",
    corner: "",
    apartment: "",
    comments: "",
    termsAccepted: false
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("1"); // Default to cash (efectivo)
  const [comments, setComments] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [noNumber, setNoNumber] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

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
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);

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
        ComisionTipo: product.ComisionTipo || "P",
        DetallesID: product.DetallesID || product.detallesId || null
      }));
      console.log("Mapped products:", mappedProducts);
      return mappedProducts;
    },
    enabled: !!(selectedService && selectedCategory && purchaseLocation)
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


  const validateStep = (step: number): boolean => {
    console.log("validateStep called for step:", step);
    switch (step) {
      case 1:
        const step1Valid = (allSelectedServices.length > 0 || selectedService && selectedCategory && selectedProducts.length > 0) && !!selectedDate && !!selectedTimeSlot;
        console.log("Step 1 validation:", { allSelectedServices: allSelectedServices.length, selectedService, selectedCategory, selectedProducts: selectedProducts.length, selectedDate, selectedTimeSlot, result: step1Valid });
        return step1Valid;
      case 2:
        const step2Valid = !!(personalInfo.name && personalInfo.phone && personalInfo.street && (personalInfo.number || noNumber) && personalInfo.termsAccepted);
        console.log("Step 2 validation:", { 
          name: personalInfo.name, 
          phone: personalInfo.phone, 
          street: personalInfo.street, 
          number: personalInfo.number, 
          noNumber: noNumber, 
          numberCondition: (personalInfo.number || noNumber),
          termsAccepted: personalInfo.termsAccepted, 
          result: step2Valid 
        });
        return step2Valid;
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

    // Reset current selection but KEEP purchaseLocation - it persists for the entire order
    setSelectedService("");
    setSelectedCategory("");
    setSelectedProducts([]);
    // DON'T reset: setPurchaseLocation(null);
  };

  const removeServiceFromList = (index: number) => {
    setAllSelectedServices(prev => prev.filter((_, i) => i !== index));
  };

  // Helper function to convert time slot string to number (1, 2, or 3)
  const getTimeSlotNumber = (timeSlot: string): string => {
    if (timeSlot === "08:00 - 12:00" || timeSlot === "08:00 - 14:00") return "1";
    if (timeSlot === "12:00 - 16:00" || timeSlot === "14:00 - 20:00") return "2";
    if (timeSlot === "16:00 - 20:00") return "3";
    return "1"; // default
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
    console.log("=== LOCATION SELECT RECIBIDO ===");
    console.log("storeId:", storeId);
    console.log("storeName:", storeName);
    console.log("departmentId:", departmentId);
    console.log("departmentName:", departmentName);
    console.log("locationId:", locationId);
    console.log("locationName:", locationName);
    console.log("zonaCostoAdicional:", zonaCostoAdicional);
    
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
    console.log("=== PURCHASE LOCATION GUARDADO ===", location);

    // Set global zone cost for price calculations
    const zoneCost = zonaCostoAdicional ? parseFloat(zonaCostoAdicional) : 0;
    setGlobalZoneCost(zoneCost);
  };

  const handleShowConfirmation = () => {
    console.log("handleShowConfirmation called, purchaseLocation:", purchaseLocation);
    if (!validateStep(currentStep)) {
      toast.error("Por favor complete todos los campos requeridos");
      return;
    }

    const zoneCost = parseFloat(purchaseLocation?.zonaCostoAdicional || "0");

    // Combine all selected services with their context and current selection
    const allServicesWithProducts = [
      ...allSelectedServices.map(service => ({
        serviceId: service.serviceId,
        categoryId: service.categoryId,
        products: service.products
      })),
      // Add current selection if there are selected products
      ...(selectedProducts.length > 0 ? [{
        serviceId: selectedService,
        categoryId: selectedCategory,
        products: selectedProducts
      }] : [])
    ];
    
    if (allServicesWithProducts.length === 0 || allServicesWithProducts.every(s => s.products.length === 0)) {
      toast.error("Debe seleccionar al menos un producto");
      return;
    }

    // Map products correctly: RubrosId=Nivel0(service), ProductoID=Nivel1(category), DetalleID=Nivel2(product)
    const checkoutItems: CheckoutItem[] = allServicesWithProducts.flatMap(service => 
      service.products.map(product => ({
        RubrosId: parseInt(service.serviceId),
        ProductoID: parseInt(service.categoryId),
        DetalleID: product.ProductoID, // The product ID is the Nivel2 (DetalleID)
        Cantidad: 1,
        Precio: product.Precio,
        SR: product.SR,
        Comision: product.Comision,
        ComisionTipo: product.ComisionTipo,
        PrecioFinal: product.Precio,
        ProductName: product.NombreProducto
      }))
    );

    // Calculate total
    const productsTotal = checkoutItems.reduce((sum, item) => sum + item.Precio, 0);
    const total = productsTotal + zoneCost;

      const data: CheckoutData = {
        Nombre: personalInfo.name,
        Telefono: personalInfo.phone,
        Mail: personalInfo.email || null,
        PaisISO: 0,
        DepartamentoId: parseInt(purchaseLocation?.departmentId || "0"),
        MunicipioId: parseInt(purchaseLocation?.locationId || "0"),
        ZonasID: 0,
        Direccion: `${personalInfo.street} ${personalInfo.number}${personalInfo.apartment ? ` Apto ${personalInfo.apartment}` : ''}${personalInfo.corner ? ` esq. ${personalInfo.corner}` : ''}`,
        MetodoPagosID: parseInt(paymentMethod) || 1,
        SolicitudPagada: "",
        SolicitaCotizacion: total.toString(),
        SolicitaOtroServicio: "",
        OtroServicioDetalle: "",
        FechaInstalacion: format(selectedDate!, "yyyy-MM-dd"),
        TurnoInstalacion: getTimeSlotNumber(selectedTimeSlot),
        Comentario: personalInfo.comments || "",
        ConfirmarCondicionesUso: personalInfo.termsAccepted ? "S" : "N",
        ProveedorAuxiliar: commerceId || purchaseLocation?.storeId || null,
        CostoXZona: zoneCost,
        Level1: checkoutItems
      };


      console.log("=== VERIFICACIÓN DE ESTRUCTURA ===");
      console.log("Data object keys:", Object.keys(data));
      console.log("CheckoutData esperado vs actual:");
      console.log("- Nombre:", data.Nombre);
      console.log("- DepartamentoId:", data.DepartamentoId, "(" + (purchaseLocation?.departmentName || "sin nombre") + ")");
      console.log("- MunicipioId:", data.MunicipioId, "(" + (purchaseLocation?.locationName || "sin nombre") + ")");
      console.log("- ProveedorAuxiliar:", data.ProveedorAuxiliar);
      console.log("- PurchaseLocation completo:", purchaseLocation);
      console.log("- Level1 length:", data.Level1.length);
      console.log("- Level1 structure:", data.Level1[0]);

    // Validate required fields
    const missingFields = [];
    if (!data.Nombre) missingFields.push("Nombre");
    if (!data.Telefono) missingFields.push("Teléfono");
    if (!data.Direccion) missingFields.push("Dirección");
    if (!data.FechaInstalacion) missingFields.push("Fecha");
    if (!data.TurnoInstalacion) missingFields.push("Horario");
    if (data.Level1.length === 0) missingFields.push("Productos");
    if (!personalInfo.termsAccepted) missingFields.push("Términos y condiciones");

    if (missingFields.length > 0) {
      toast.error(`Faltan campos requeridos: ${missingFields.join(", ")}`);
      return;
    }

    // Store the data and show confirmation modal
    setConfirmationData(data);
    setShowConfirmationModal(true);
  };

  const handleSubmit = async () => {
    if (!confirmationData) return;
    
    setIsSubmitting(true);
    try {
      const data = confirmationData;

      // Prepare API call to AltaSolicitud
      const jsonSolicitud = JSON.stringify(data);
      
      // Determine provider ID from commerceId or purchaseLocation
      let providerId = "0";
      if (commerceId) {
        providerId = commerceId;
      } else if (purchaseLocation?.storeId) {
        providerId = purchaseLocation.storeId;
      }

      // Combine all selected services and current selection for logging
      const allServicesForLogging = [
        ...allSelectedServices,
        ...(selectedProducts.length > 0 ? [{
          serviceId: selectedService,
          categoryId: selectedCategory,
          products: selectedProducts
        }] : [])
      ];
      const allProducts = allServicesForLogging.flatMap(service => service.products);

      console.log("=== DATOS DE LA SOLICITUD ===");
      console.log("Provider ID:", providerId);
      console.log("User ID:", userId || "0");
      console.log("Datos completos:", data);
      console.log("=== IDs DEL JSON ===");
      console.log("DepartamentoId en JSON:", data.DepartamentoId);
      console.log("MunicipioId en JSON:", data.MunicipioId);
      console.log("PaisISO en JSON:", data.PaisISO);
      console.log("ZonasID en JSON:", data.ZonasID);
      console.log("SolicitaCotizacion en JSON:", data.SolicitaCotizacion);
      console.log("JSON que se envía:", jsonSolicitud);
      console.log("Personal Info completo:", personalInfo);
      console.log("Purchase Location:", purchaseLocation);
      console.log("Selected Products:", allProducts);

      const url = new URL("https://app.almango.com.uy/WebAPI/AltaSolicitud");
      url.searchParams.append("Userconect", "NoEmpty");
      url.searchParams.append("Key", "d3d3LmF6bWl0YS5jb20=");
      url.searchParams.append("Proveedorid", providerId);
      url.searchParams.append("Usuarioid", userId || "0");
      url.searchParams.append("Jsonsolicitud", jsonSolicitud);

      console.log("URL completa:", url.toString());

      const response = await fetch(url.toString());
      
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
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
        console.log("Raw response that failed to parse:", responseText);
        throw new Error("Error al procesar la respuesta del servidor");
      }

      console.log("=== RESULTADO FINAL ===");
      console.log("SolicitudesID:", result.SolicitudesID);
      
      if (result.SolicitudesID && result.SolicitudesID !== "0") {
        toast.success(`Solicitud enviada exitosamente. ID: ${result.SolicitudesID}`);
        // Reset form or redirect
        setCurrentStep(1);
        setSelectedService("");
        setSelectedCategory("");
        setSelectedProducts([]);
        setAllSelectedServices([]);
        setPersonalInfo({
          name: "",
          phone: "",
          email: "",
          street: "",
          number: "",
          corner: "",
          apartment: "",
          comments: "",
          termsAccepted: false
        });
        setSelectedDate(undefined);
        setComments("");
        setAcceptTerms(false);
        setSelectedTimeSlot("");
        setPaymentMethod("1");
        setNoNumber(false);
        setPurchaseLocation(null);
        setShowConfirmationModal(false);
        setConfirmationData(null);
      } else {
        toast.error("Error: No se pudo obtener el ID de la solicitud");
      }
    } catch (error) {
      console.error("Error al enviar solicitud:", error);
      toast.error("Error al enviar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepTitles = [
    "Servicios y Programación",
    "Información Personal"
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Date and Time Selection - First priority */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium mb-4 flex items-center gap-2 text-blue-800">
                <CalendarClock className="h-5 w-5" />
                Fecha y Hora del Servicio
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Fecha *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-white",
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
                    <Label htmlFor="timeSlot">Horario *</Label>
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

            <div>
              <Label htmlFor="service">Seleccione un Servicio</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {isServicesLoading ? (
                    <SelectItem value="loading" disabled>Cargando servicios...</SelectItem>
                  ) : services && services.length > 0 ? (
                    services.map((service: TarjetaServicio) => (
                      <SelectItem key={service.id} value={service.id!}>
                        {service.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-services" disabled>
                      No hay servicios disponibles
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {services && (
                <p className="text-xs text-muted-foreground mt-1">
                  Servicios encontrados: {services.length}
                </p>
              )}
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
                {categories && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Categorías encontradas: {categories.length}
                  </p>
                )}
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
              <div 
                className="mt-4 flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors" 
                onClick={() => setIsLocationModalOpen(true)}
              >
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
                        
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeServiceFromList(index)} 
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 ml-4"
                        >
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


            {/* Service Selection Section - Only show when category and location are selected */}
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
                            onCheckedChange={checked => handleProductToggle(product, checked as boolean)} 
                            className="w-5 h-5" 
                          />
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
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground bg-gray-50 rounded-lg">
                        <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <p className="font-medium">No hay productos disponibles</p>
                        <p className="text-sm">para esta categoría en tu ubicación</p>
                      </div>
                    )}
                  </div>

                  {/* Add Service Action */}
                  {selectedProducts.length > 0 && (
                    <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
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
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre completo *</Label>
                <Input 
                  id="name" 
                  placeholder="Nombre y apellido" 
                  value={personalInfo.name} 
                  onChange={e => setPersonalInfo(prev => ({
                    ...prev,
                    name: e.target.value
                  }))} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input 
                  id="phone" 
                  placeholder="Teléfono de contacto" 
                  value={personalInfo.phone} 
                  onChange={e => setPersonalInfo(prev => ({
                    ...prev,
                    phone: e.target.value
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
                  <Label htmlFor="street">Calle *</Label>
                  <Input 
                    id="street" 
                    placeholder="Nombre de la calle" 
                    value={personalInfo.street} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      street: e.target.value
                    }))} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="number">Número *</Label>
                  <div className="space-y-2">
                    <Input 
                      id="number" 
                      placeholder="Número de puerta" 
                      value={personalInfo.number} 
                      disabled={noNumber}
                      onChange={e => setPersonalInfo(prev => ({
                        ...prev,
                        number: e.target.value
                      }))} 
                      required={!noNumber}
                    />
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="no-number"
                        checked={noNumber}
                        onCheckedChange={(checked) => {
                          setNoNumber(checked as boolean);
                          if (checked) {
                            setPersonalInfo(prev => ({
                              ...prev,
                              number: "S/N"
                            }));
                          } else {
                            setPersonalInfo(prev => ({
                              ...prev,
                              number: ""
                            }));
                          }
                        }}
                      />
                      <Label htmlFor="no-number" className="text-sm font-normal cursor-pointer">
                        S/N (sin número)
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="corner">Esquina</Label>
                  <Input 
                    id="corner" 
                    placeholder="Intersección más cercana" 
                    value={personalInfo.corner} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      corner: e.target.value
                    }))} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="apartment">Apartamento</Label>
                  <Input 
                    id="apartment" 
                    placeholder="Apto (opcional)" 
                    value={personalInfo.apartment} 
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      apartment: e.target.value
                    }))} 
                  />
                </div>
              </div>
            </div>


            {/* Comentarios */}
            <div>
              <Label htmlFor="comments">Comentarios</Label>
              <Textarea 
                id="comments" 
                placeholder="¿Hay algo más que debamos saber?" 
                value={personalInfo.comments} 
                onChange={e => setPersonalInfo(prev => ({
                  ...prev,
                  comments: e.target.value
                }))} 
              />
            </div>

            {/* Método de Pago */}
            <div>
              <Label>Método de Pago</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="efectivo" />
                  <Label htmlFor="efectivo">Efectivo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="tarjeta" />
                  <Label htmlFor="tarjeta">Tarjeta de Crédito/Débito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="transferencia" />
                  <Label htmlFor="transferencia">Transferencia Bancaria</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Términos y Condiciones */}
            <div className="flex items-start space-x-2">
              <Checkbox 
                id="terms" 
                checked={personalInfo.termsAccepted} 
                onCheckedChange={(checked) => setPersonalInfo(prev => ({
                  ...prev,
                  termsAccepted: checked === true
                }))} 
              />
              <div className="flex flex-col space-y-1">
                <Label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Acepto los{" "}
                  <button
                    type="button"
                    onClick={() => setIsTermsModalOpen(true)}
                    className="text-primary underline hover:text-primary/80"
                  >
                    términos y condiciones
                  </button>
                  {" "}*
                </Label>
              </div>
            </div>

          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Solicitar Servicio</h1>
          </div>

          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold flex items-center gap-3">
                  {currentStep === 1 && <Package className="h-6 w-6" />}
                  {currentStep === 2 && <UserCheck className="h-6 w-6" />}
                  {stepTitles[currentStep - 1]}
                </CardTitle>
                <CardDescription className="text-blue-100 text-sm">
                  Paso {currentStep} de {stepTitles.length}
                </CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="p-8">
              {renderStepContent()}
            </CardContent>
            
            {/* Action Buttons */}
            <div className="flex justify-between p-8 pt-0 border-t bg-muted/30">
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
                      // DON'T reset purchaseLocation here
                    }} className={allSelectedServices.length > 0 ? "flex-1" : ""}>
                      Limpiar selección actual
                    </Button>
                  )}
                  {currentStep === 2 && (
                    <Button 
                      onClick={handleShowConfirmation} 
                      disabled={isSubmitting || !validateStep(2)}
                      className="min-w-32"
                    >
                      {isSubmitting ? "Enviando..." : "Confirmar Solicitud"}
                    </Button>
                  )}
                </div>
              ) : (
                <Button onClick={handleShowConfirmation} disabled={!validateStep(currentStep) || isSubmitting}>
                  {isSubmitting ? "Procesando..." : "Confirmar Solicitud"}
                </Button>
              )}
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
          commerceId={commerceId}
        />
        
        <ConfirmationModal
          open={showConfirmationModal}
          onClose={() => setShowConfirmationModal(false)}
          onConfirm={handleSubmit}
          title="Confirmar Solicitud"
          description="Por favor revise los datos antes de enviar la solicitud."
          jsonData={confirmationData}
          isSubmitting={isSubmitting}
        />

        <GeneralTermsModal 
          isOpen={isTermsModalOpen} 
          onClose={() => setIsTermsModalOpen(false)} 
        />
      </div>
    </div>
  );
};

export default ServicioOnePage;