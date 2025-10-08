import React, { useState, useEffect } from "react";
import { ArrowLeft, Home, Wind, Droplets, Zap, Package, Truck, Baby, MapPin, CalendarClock, UserCheck, CreditCard, Check, ShoppingCart, Plus, X, Pencil } from "lucide-react";
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
import { CheckoutData, CheckoutItem, getProviderAuxiliary } from "@/types/checkoutTypes";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import PurchaseLocationModal from "@/components/PurchaseLocationModal";
import ConfirmationModal from "@/components/ConfirmationModal";
import { GeneralTermsModal } from "@/components/ui/general-terms-modal";
import { setGlobalZoneCost } from "@/utils/globalZoneCost";
import ProductTermsModal from "@/components/checkout/ProductTermsModal";

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

interface ProductWithQuantity extends Product {
  quantity: number;
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
  const [selectedProducts, setSelectedProducts] = useState<ProductWithQuantity[]>([]);
  const [personalInfo, setPersonalInfo] = useState({
    name: "",
    phone: "",
    email: "",
    street: "",
    number: "",
    corner: "",
    apartment: "",
    comments: "",
    termsAccepted: true // Always accepted by default
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
    products: ProductWithQuantity[];
  }[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [confirmationData, setConfirmationData] = useState<any>(null);
  const [selectedProductTerms, setSelectedProductTerms] = useState<{
    textosId: string | null;
    productName: string;
  } | null>(null);

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
    isLoading: isCategoriesLoading,
    error: categoriesError
  } = useQuery({
    queryKey: ["categories", selectedService],
    queryFn: async () => {
      if (!selectedService) {
        console.log("No service selected, returning empty categories");
        return [];
      }
      
      console.log("Fetching categories for service:", selectedService);
      
      try {
        const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerNivel1?Nivel0=${selectedService}`);
        console.log("Response status:", response.status, response.statusText);
        
        if (!response.ok) {
          console.error("Response not OK:", response.status);
          throw new Error("Error al obtener categorías");
        }
        
        const data = await response.json();
        console.log("Raw categories data:", data);

        // Parse the JSON if it comes as a string
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        console.log("Parsed categories data:", parsedData);

        // Check if parsedData is an array
        if (!Array.isArray(parsedData)) {
          console.error("Categories data is not an array:", parsedData);
          return [];
        }

        // Map the categories based on the actual structure
        const mappedCategories = parsedData.map((cat: any) => ({
          id: cat.Nivel1ID ? cat.Nivel1ID.toString() : cat.id?.toString() || cat.ID?.toString(),
          name: cat.NombreNivel1 || cat.name || cat.Name,
          icon: cat.IconoNivel1 || cat.icon
        }));
        console.log("Mapped categories:", mappedCategories);
        return mappedCategories;
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Error al cargar las categorías");
        throw error;
      }
    },
    enabled: !!selectedService,
    retry: 1
  });

  // Log category errors
  useEffect(() => {
    if (categoriesError) {
      console.error("Categories query error:", categoriesError);
    }
  }, [categoriesError]);

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

  const handleProductQuantityChange = (product: Product, change: number) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.ProductoID === product.ProductoID);
      
      if (existing) {
        const newQuantity = existing.quantity + change;
        
        if (newQuantity <= 0) {
          // Remove product if quantity becomes 0
          return prev.filter(p => p.ProductoID !== product.ProductoID);
        }
        
        // Update quantity
        return prev.map(p => 
          p.ProductoID === product.ProductoID 
            ? { ...p, quantity: newQuantity }
            : p
        );
      } else if (change > 0) {
        // Add new product with quantity 1
        return [...prev, { ...product, quantity: 1 }];
      }
      
      return prev;
    });
  };


  const validateForm = (): boolean => {
    console.log("validateForm called");
    const hasServices = allSelectedServices.length > 0 || (selectedService && selectedCategory && selectedProducts.length > 0);
    const hasDateTime = !!selectedDate && !!selectedTimeSlot;
    const hasPersonalInfo = !!(personalInfo.name && personalInfo.phone && personalInfo.street && (personalInfo.number || noNumber) && personalInfo.termsAccepted);
    
    console.log("Form validation:", { 
      hasServices, 
      hasDateTime,
      hasPersonalInfo,
      allSelectedServices: allSelectedServices.length,
      selectedProducts: selectedProducts.length,
      selectedDate,
      selectedTimeSlot,
      name: personalInfo.name,
      phone: personalInfo.phone,
      termsAccepted: personalInfo.termsAccepted,
      result: hasServices && hasDateTime && hasPersonalInfo 
    });
    
    return hasServices && hasDateTime && hasPersonalInfo;
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

  const editServiceFromList = (index: number) => {
    const serviceToEdit = allSelectedServices[index];
    
    // Load the service data back into the form
    setSelectedService(serviceToEdit.serviceId);
    setSelectedCategory(serviceToEdit.categoryId);
    setSelectedProducts([...serviceToEdit.products]);
    
    // Remove from the list of added services
    setAllSelectedServices(prev => prev.filter((_, i) => i !== index));
    
    // Scroll to top to show the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    toast.info("Servicio cargado para edición");
  };

  // Helper function to convert time slot string to number (1, 2, or 3)
  const getTimeSlotNumber = (timeSlot: string): string => {
    if (timeSlot === "08:00 - 12:00" || timeSlot === "08:00 - 14:00") return "1";
    if (timeSlot === "12:00 - 16:00" || timeSlot === "14:00 - 20:00") return "2";
    if (timeSlot === "16:00 - 20:00") return "3";
    return "1"; // default
  };

  // Removed handleNextStep since we now have a single form

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
    
    // Check if we have services (either in the list or currently selected)
    const hasServices = allSelectedServices.length > 0 || (selectedService && selectedCategory && selectedProducts.length > 0);
    
    if (!hasServices) {
      toast.error("Por favor seleccione al menos un servicio");
      return;
    }
    
    if (!purchaseLocation) {
      setIsLocationModalOpen(true);
      return;
    }
    
    if (!validateForm()) {
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
        Cantidad: product.quantity || 1,
        Precio: product.Precio,
        SR: product.SR,
        Comision: product.Comision,
        ComisionTipo: product.ComisionTipo,
        PrecioFinal: product.Precio * (product.quantity || 1),
        ProductName: product.NombreProducto
      }))
    );

    // Calculate total
    const productsTotal = checkoutItems.reduce((sum, item) => sum + item.PrecioFinal, 0);
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
        ProveedorAuxiliar: getProviderAuxiliary(
          purchaseLocation?.storeId || "unknown",
          purchaseLocation?.storeName
        ),
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
      
      // Determine provider ID from ProveedorAuxiliar
      let providerId = "0";
      
      if (data.ProveedorAuxiliar) {
        const aux = data.ProveedorAuxiliar.trim();
        
        // If it's "No lo sé", provider ID should be 0 
        if (aux === "No lo sé") {
          providerId = "0";
        } else {
          providerId = aux;
        }
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
          termsAccepted: true // Reset to default (accepted)
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
    "Solicitud de Servicio"
  ];

  const renderStepContent = () => {
    return (
      <div className="space-y-6">
        {/* Date and Time Selection - First priority */}
            <div className="p-4 bg-accent/50 rounded-lg border border-border">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                <CalendarClock className="h-5 w-5 text-primary" />
                Fecha y Hora del Servicio
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-sm font-medium mb-2 block">Fecha *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal bg-background h-10",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarClock className="mr-2 h-3 w-3" />
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
                    <Label htmlFor="timeSlot" className="text-sm font-medium mb-2 block">Horario *</Label>
                    <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                      <SelectTrigger className="bg-background h-10">
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
                  </div>
                )}
              </div>
            </div>

            {/* Services Summary Section */}
            {allSelectedServices.length > 0 && (
              <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-secondary" />
                  <h3 className="font-semibold text-secondary text-base">
                    Servicios Agregados ({allSelectedServices.length})
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {allSelectedServices.map((service, index) => (
                    <div key={index} className="bg-background p-3 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{service.serviceName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{service.categoryName}</p>
                          
                          <div className="space-y-1 mb-2">
                            {service.products.map((product, idx) => (
                              <div key={idx} className="flex justify-between text-sm bg-muted/50 px-2 py-1 rounded">
                                <span className="text-foreground">{product.NombreProducto} x{product.quantity}</span>
                                <span className="font-medium text-foreground">${product.Precio * product.quantity}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-border">
                            <span className="text-sm font-medium text-muted-foreground">Subtotal:</span>
                            <span className="font-bold text-secondary">
                              ${service.products.reduce((sum, p) => sum + (p.Precio * p.quantity), 0)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => editServiceFromList(index)} 
                            className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeServiceFromList(index)} 
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-secondary/30 bg-secondary/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-secondary">Total de servicios:</span>
                    <span className="text-lg font-bold text-secondary">
                      ${allSelectedServices.reduce((total, service) => total + service.products.reduce((sum, p) => sum + (p.Precio * p.quantity), 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="service" className="text-sm font-medium mb-2 block">Seleccione otro Servicio</Label>
              <Select value={selectedService} onValueChange={setSelectedService}>
                <SelectTrigger className="h-10">
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
            </div>

            {selectedService && (
              <div>
                <Label htmlFor="category" className="text-sm font-medium mb-2 block">Seleccione una Categoría</Label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="h-10">
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
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Ubicación del servicio</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsLocationModalOpen(true)}
                    className="h-8 text-sm"
                  >
                    Editar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {purchaseLocation.storeName} - {purchaseLocation.departmentName}, {purchaseLocation.locationName}
                </p>
                {purchaseLocation.zonaCostoAdicional && parseFloat(purchaseLocation.zonaCostoAdicional) > 0 && (
                  <p className="text-sm text-primary font-medium mt-2">
                    Costo adicional por zona: ${purchaseLocation.zonaCostoAdicional}
                  </p>
                )}
              </div>
            )}

            {selectedCategory && !purchaseLocation && (
              <div 
                className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border cursor-pointer hover:bg-muted transition-colors" 
                onClick={() => setIsLocationModalOpen(true)}
              >
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground flex-1">Configurar ubicación del servicio</span>
                <span className="text-sm text-muted-foreground">Click aquí</span>
              </div>
            )}

            {/* Services Summary Section */}
            {allSelectedServices.length > 0 && (
              <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-secondary" />
                  <h3 className="font-semibold text-secondary text-base">
                    Servicios Agregados ({allSelectedServices.length})
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {allSelectedServices.map((service, index) => (
                    <div key={index} className="bg-background p-3 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{service.serviceName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{service.categoryName}</p>
                          
                          <div className="space-y-1 mb-2">
                            {service.products.map((product, idx) => (
                              <div key={idx} className="flex justify-between text-sm bg-muted/50 px-2 py-1 rounded">
                                <span className="text-foreground">{product.NombreProducto} x{product.quantity}</span>
                                <span className="font-medium text-foreground">${product.Precio * product.quantity}</span>
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-border">
                            <span className="text-sm font-medium text-muted-foreground">Subtotal:</span>
                            <span className="font-bold text-secondary">
                              ${service.products.reduce((sum, p) => sum + (p.Precio * p.quantity), 0)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-3">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => editServiceFromList(index)} 
                            className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 h-8 w-8 p-0"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => removeServiceFromList(index)} 
                            className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 pt-3 border-t border-secondary/30 bg-secondary/5 rounded-lg p-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-secondary">Total de servicios:</span>
                    <span className="text-lg font-bold text-secondary">
                      ${allSelectedServices.reduce((total, service) => total + service.products.reduce((sum, p) => sum + (p.Precio * p.quantity), 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            )}


            {/* Service Selection Section - Only show when category and location are selected */}
            {selectedCategory && purchaseLocation && (
              <div className="bg-background border border-border rounded-lg p-4 shadow-sm">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-primary" />
                    <Label className="font-semibold">
                      Productos disponibles para: {services?.find(s => s.id === selectedService)?.name}
                    </Label>
                  </div>
                  
                  <div className="grid gap-3 max-h-80 overflow-y-auto pr-2">
                    {isProductsLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <Skeleton key={i} className="h-20 w-full rounded-lg" />
                        ))}
                      </div>
                    ) : products && products.length > 0 ? (
                      products.map((product: Product) => {
                        const selectedProduct = selectedProducts.find(p => p.ProductoID === product.ProductoID);
                        const quantity = selectedProduct?.quantity || 0;
                        
                        return (
                          <div 
                            key={product.ProductoID} 
                            className={cn(
                              "flex items-center space-x-2 p-2 border-2 rounded-lg transition-all duration-200", 
                              quantity > 0
                                ? "border-primary bg-primary/5 shadow-md" 
                                : "border-border hover:border-primary/50"
                            )}
                          >
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-semibold text-sm text-foreground block">{product.NombreProducto}</span>
                                  <span className="text-xs text-muted-foreground">Código: {product.ProductoID}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-secondary text-sm">${product.Precio}</span>
                                  <span className="block text-xs text-muted-foreground">por unidad</span>
                                </div>
                              </div>
                              
                              <div className="mb-1">
                                <Button 
                                  variant="link" 
                                  className="text-xs text-secondary hover:text-secondary/80 p-0 h-auto cursor-pointer" 
                                  onClick={() => setSelectedProductTerms({
                                    textosId: product.TextosId?.toString() || null,
                                    productName: product.NombreProducto
                                  })} 
                                  type="button"
                                >
                                  Ver Condiciones
                                </Button>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Cantidad:</span>
                                <div className="flex items-center gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleProductQuantityChange(product, -1)}
                                    disabled={quantity === 0}
                                    className="h-7 w-7 p-0"
                                  >
                                    -
                                  </Button>
                                  <span className="font-semibold text-sm min-w-[2ch] text-center">{quantity}</span>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleProductQuantityChange(product, 1)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              {quantity > 0 && (
                                <div className="mt-2 pt-2 border-t border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-muted-foreground">Subtotal:</span>
                                    <span className="font-bold text-sm text-primary">${product.Precio * quantity}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg">
                        <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-medium">No hay productos disponibles</p>
                        <p className="text-sm">para esta categoría en tu ubicación</p>
                      </div>
                    )}
                  </div>

                  {/* Add Service Action */}
                  {selectedProducts.length > 0 && (
                    <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-primary">
                          ✓ {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} productos ({selectedProducts.length} tipos)
                        </p>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ${selectedProducts.reduce((sum, p) => sum + (p.Precio * p.quantity), 0)}
                          </p>
                        </div>
                      </div>
                      <Button onClick={addCurrentServiceToList} className="w-full bg-primary hover:bg-primary/90 h-10">
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar a solicitud
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

        {/* Información Personal Section */}
        <Separator className="my-6" />
        
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-3">
            <UserCheck className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Información Personal</h3>
          </div>
          
          <div className="space-y-4">
            {/* Información Personal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium mb-2 block">Nombre completo *</Label>
                <Input 
                  id="name" 
                  placeholder="Nombre y apellido" 
                  value={personalInfo.name}
                  className="h-10"
                  onChange={e => setPersonalInfo(prev => ({
                    ...prev,
                    name: e.target.value
                  }))} 
                  required 
                />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Teléfono *</Label>
                <Input 
                  id="phone" 
                  placeholder="Teléfono de contacto" 
                  value={personalInfo.phone}
                  className="h-10"
                  onChange={e => setPersonalInfo(prev => ({
                    ...prev,
                    phone: e.target.value
                  }))} 
                  required 
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">Correo electrónico (opcional)</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="tu@email.com" 
                value={personalInfo.email}
                className="h-10"
                onChange={e => setPersonalInfo(prev => ({
                  ...prev,
                  email: e.target.value
                }))} 
              />
            </div>

            {/* Dirección */}
            <div className="space-y-4">
              <h4 className="font-semibold">Dirección</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street" className="text-sm font-medium mb-2 block">Calle *</Label>
                  <Input 
                    id="street" 
                    placeholder="Nombre de la calle" 
                    value={personalInfo.street}
                    className="h-10"
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      street: e.target.value
                    }))} 
                    required 
                  />
                </div>
                
                <div>
                  <Label htmlFor="number" className="text-sm font-medium mb-2 block">Número *</Label>
                  <div className="space-y-2">
                    <Input 
                      id="number" 
                      placeholder="Número de puerta" 
                      value={personalInfo.number} 
                      disabled={noNumber}
                      className="h-10"
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
                        className="h-4 w-4"
                      />
                      <Label htmlFor="no-number" className="text-sm font-normal cursor-pointer">
                        S/N
                      </Label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="corner" className="text-sm font-medium mb-2 block">Esquina</Label>
                  <Input 
                    id="corner" 
                    placeholder="Intersección más cercana" 
                    value={personalInfo.corner}
                    className="h-10"
                    onChange={e => setPersonalInfo(prev => ({
                      ...prev,
                      corner: e.target.value
                    }))} 
                  />
                </div>
                
                <div>
                  <Label htmlFor="apartment" className="text-sm font-medium mb-2 block">Apartamento</Label>
                  <Input 
                    id="apartment" 
                    placeholder="Apto (opcional)" 
                    value={personalInfo.apartment}
                    className="h-10"
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
              <Label htmlFor="comments" className="text-sm font-medium mb-2 block">Comentarios</Label>
              <Textarea 
                id="comments" 
                placeholder="¿Hay algo más que debamos saber?" 
                value={personalInfo.comments}
                className="min-h-[80px]"
                onChange={e => setPersonalInfo(prev => ({
                  ...prev,
                  comments: e.target.value
                }))} 
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Solicitar Servicio
          </h1>
          <p className="text-muted-foreground text-sm">Complete el formulario para solicitar su servicio</p>
        </div>

        <Card className="shadow-xl border-border">
          <CardHeader className="bg-gradient-to-r from-primary to-secondary text-primary-foreground p-6">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5" />
              {stepTitles[0]}
            </CardTitle>
          </CardHeader>
            
            <CardContent className="p-6">
              {renderStepContent()}
            </CardContent>
            
            {/* Action Buttons */}
            <div className="flex justify-between items-center p-6 border-t bg-accent/10">
              <div className="text-sm text-muted-foreground">
                * Campos requeridos
              </div>
              <div className="flex gap-3">
                {(selectedService || selectedCategory || selectedProducts.length > 0) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSelectedService("");
                      setSelectedCategory("");
                      setSelectedProducts([]);
                    }} 
                    className="h-10"
                  >
                    Limpiar
                  </Button>
                )}
                <Button 
                  onClick={handleShowConfirmation} 
                  disabled={isSubmitting || !validateForm()}
                  className="min-w-32 h-10 bg-primary hover:bg-primary/90"
                >
                  {isSubmitting ? "Enviando..." : "Confirmar Solicitud"}
                </Button>
              </div>
            </div>
          </Card>

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
        
        <ProductTermsModal
          isOpen={!!selectedProductTerms}
          onClose={() => setSelectedProductTerms(null)}
          textosId={selectedProductTerms?.textosId || null}
          productName={selectedProductTerms?.productName || ""}
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