import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Home, Wind, Droplets, Zap, Package, Truck, Baby, MapPin, CalendarClock, UserCheck, CreditCard, Check, ShoppingCart, Plus, X, Pencil, Copy, Banknote } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import fondoAzul from "@/assets/fondo-azul-patrones.svg";
import logo from "@/assets/logo-new.svg";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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
import { CustomPriceTermsModal } from "@/components/checkout/CustomPriceTermsModal";
import { formatPrice } from "@/utils/priceFormat";
import ResultDialog from "@/components/checkout/ResultDialog";
import RequestDetailsDialog from "@/components/checkout/RequestDetailsDialog";
import { useMercadoPagoPayment } from "@/components/checkout/useMercadoPagoPayment";
import { ServiceRequest } from "@/types/checkoutTypes";
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
  Imagen?: string;
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
    categoryId: urlCategoryId,
    solicitudId
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
  const [paymentMethod, setPaymentMethod] = useState("later"); // Default to pay later
  const [comments, setComments] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptProductTerms, setAcceptProductTerms] = useState(false);
  const [noNumber, setNoNumber] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // UI states
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckoutSummary, setShowCheckoutSummary] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [purchaseLocation, setPurchaseLocation] = useState<PurchaseLocation | null>(null);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
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
  const [suggestedPrice, setSuggestedPrice] = useState<number>(0);
  
  // Result dialog states
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRequestData, setSelectedRequestData] = useState<CheckoutData | null>(null);
  
  const [usesCustomPrice, setUsesCustomPrice] = useState<"suggested" | "custom">("suggested");
  const [isCustomPriceTermsOpen, setIsCustomPriceTermsOpen] = useState(false);
  
  // Payment link ref for MercadoPago
  const paymentLinkRef = useRef<HTMLAnchorElement>(null);
  
  // State to track if the provider is internal
  const [isInternalProvider, setIsInternalProvider] = useState(false);

  // Use the custom hook for MercadoPago payment handling
  const {
    checkingPayment,
  } = useMercadoPagoPayment(
    serviceRequests, 
    setServiceRequests,
    showResultDialog,
    selectedRequestData,
    setSelectedRequestData,
    selectedServiceId
  );
  
  // Check if commerceId corresponds to an internal provider
  useEffect(() => {
    const checkInternalProvider = async () => {
      if (!commerceId || commerceId === "0") {
        setIsInternalProvider(false);
        return;
      }
      
      // Exception: commerceId 1001 always allows MercadoPago and custom price
      if (commerceId === "1001") {
        setIsInternalProvider(false);
        return;
      }
      
      try {
        const response = await fetch("https://app.almango.com.uy/WebAPI/ObtenerProveedorTodos");
        if (!response.ok) {
          console.error("Error fetching providers:", response.status);
          setIsInternalProvider(false);
          return;
        }
        
        const data = await response.json();
        const provider = data.find((item: any) => item.ProveedorID?.toString() === commerceId.toString());
        
        if (provider && provider.ProveedorUsoInterno === 'S') {
          setIsInternalProvider(true);
          // If internal provider, force suggested price and pay later
          setUsesCustomPrice("suggested");
          setPaymentMethod("later");
          console.log("Internal provider detected, disabling MercadoPago and custom price");
        } else {
          setIsInternalProvider(false);
        }
      } catch (error) {
        console.error("Error checking internal provider:", error);
        setIsInternalProvider(false);
      }
    };
    
    checkInternalProvider();
  }, [commerceId]);

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

      // Map the products to the expected format
      const mappedProducts = data.map((product: any) => ({
        ProductoID: parseInt(product.id) || product.ProductoID || product.Nivel2Id,
        NombreProducto: product.name || product.NombreProducto || product.Nivel2Descripcion,
        Precio: parseFloat(product.price) || product.Precio,
        TextosId: product.TextosId || product.textosId,
        RubrosId: parseInt(selectedCategory),
        SR: product.SR || "S",
        Comision: product.Comision || 0,
        ComisionTipo: product.ComisionTipo || "P",
        DetallesID: product.DetallesID || product.detallesId || null,
        Imagen: product.image || product.Imagen || product.imagen || ""
      }));
      console.log("Mapped products:", mappedProducts);
      return mappedProducts;
    },
    enabled: !!(selectedService && selectedCategory && purchaseLocation)
  });
  
  // Fetch departments
  const { data: departments } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const response = await fetch("https://app.almango.com.uy/WebAPI/GetDepartamentos");
      if (!response.ok) throw new Error("Error al obtener departamentos");
      const data = await response.json();
      return data.map((dept: any) => ({
        id: dept.DepartamentoId?.toString() || dept.id,
        name: dept.DepartamentoNombre || dept.name
      }));
    }
  });
  
  // Fetch municipalities
  const { data: municipalities } = useQuery({
    queryKey: ["municipalities"],
    queryFn: async () => {
      const response = await fetch("https://app.almango.com.uy/WebAPI/GetLocalidades");
      if (!response.ok) throw new Error("Error al obtener localidades");
      const data = await response.json();
      const grouped: Record<string, Array<{id: string, name: string}>> = {};
      data.forEach((loc: any) => {
        const deptId = loc.DepartamentoId?.toString() || loc.departmentId;
        if (!grouped[deptId]) grouped[deptId] = [];
        grouped[deptId].push({
          id: loc.LocalidadId?.toString() || loc.id,
          name: loc.LocalidadNombre || loc.name
        });
      });
      return grouped;
    }
  });

  // Progressive product display effect
  useEffect(() => {
    if (!products || products.length === 0) {
      setDisplayedProducts([]);
      return;
    }

    // Reset displayed products when products change
    setDisplayedProducts([]);
    let currentIndex = 0;
    const showNextProduct = () => {
      if (currentIndex < products.length) {
        setDisplayedProducts(prev => [...prev, products[currentIndex]]);
        currentIndex++;
        setTimeout(showNextProduct, 50); // Show each product with 50ms delay
      }
    };

    // Start showing products progressively
    const timeoutId = setTimeout(showNextProduct, 0);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [products]);

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
    // Reset suggested price when product quantity changes
    setSuggestedPrice(0);
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.ProductoID === product.ProductoID);
      if (existing) {
        const newQuantity = existing.quantity + change;
        if (newQuantity <= 0) {
          // Remove product if quantity becomes 0
          return prev.filter(p => p.ProductoID !== product.ProductoID);
        }

        // Update quantity
        return prev.map(p => p.ProductoID === product.ProductoID ? {
          ...p,
          quantity: newQuantity
        } : p);
      } else if (change > 0) {
        // Add new product with quantity 1
        return [...prev, {
          ...product,
          quantity: 1
        }];
      }
      return prev;
    });
  };
  const validateForm = (): boolean => {
    console.log("validateForm called");
    const hasServices = allSelectedServices.length > 0;
    const hasDateTime = !!selectedDate && !!selectedTimeSlot;
    const hasPersonalInfo = !!(personalInfo.name && personalInfo.phone && personalInfo.street && (personalInfo.number || noNumber) && personalInfo.termsAccepted);
    const hasAcceptedTerms = acceptTerms;
    console.log("Form validation:", {
      hasServices,
      hasDateTime,
      hasPersonalInfo,
      hasAcceptedTerms,
      allSelectedServices: allSelectedServices.length,
      selectedProducts: selectedProducts.length,
      selectedDate,
      selectedTimeSlot,
      name: personalInfo.name,
      phone: personalInfo.phone,
      termsAccepted: personalInfo.termsAccepted,
      acceptTerms,
      result: hasServices && hasDateTime && hasPersonalInfo && hasAcceptedTerms
    });
    return hasServices && hasDateTime && hasPersonalInfo && hasAcceptedTerms;
  };
  const addCurrentServiceToList = () => {
    if (!selectedService || !selectedCategory || selectedProducts.length === 0) {
      toast.error("Por favor complete la selección de servicio");
      return;
    }
    if (!acceptProductTerms) {
      toast.error("Debés aceptar las condiciones de los productos para continuar");
      return;
    }

    // Reset suggested price when adding new service
    setSuggestedPrice(0);
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
    setAcceptProductTerms(false);
    // DON'T reset: setPurchaseLocation(null);
  };
  const removeServiceFromList = (index: number) => {
    setAllSelectedServices(prev => prev.filter((_, i) => i !== index));
    // Reset suggested price when removing service
    setSuggestedPrice(0);
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
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });

    // Reset suggested price when editing service
    setSuggestedPrice(0);
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

  const handleLocationSelect = async (storeId: string, storeName: string, departmentId: string, departmentName: string, locationId: string, locationName: string, otherLocation?: string, zonaCostoAdicional?: string) => {
    console.log("=== LOCATION SELECT RECIBIDO ===");
    console.log("storeId:", storeId);
    console.log("storeName:", storeName);
    console.log("departmentId:", departmentId);
    console.log("departmentName:", departmentName);
    console.log("locationId:", locationId);
    console.log("locationName:", locationName);
    console.log("zonaCostoAdicional:", zonaCostoAdicional);
    
    // Check if the selected provider is internal
    // Exception: "No lo sé" (unknown) and "Otro" (other) always allow MercadoPago and custom price
    if (storeId === "unknown" || storeId === "other") {
      setIsInternalProvider(false);
    } else if (storeId) {
      try {
        const response = await fetch("https://app.almango.com.uy/WebAPI/ObtenerProveedorTodos");
        if (response.ok) {
          const data = await response.json();
          const provider = data.find((item: any) => item.ProveedorID?.toString() === storeId.toString());
          
          if (provider && provider.ProveedorUsoInterno === 'S') {
            setIsInternalProvider(true);
            // If internal provider, force suggested price and pay later
            setUsesCustomPrice("suggested");
            setPaymentMethod("later");
            setSuggestedPrice(0);
            console.log("Internal provider selected, disabling MercadoPago and custom price");
          } else {
            setIsInternalProvider(false);
          }
        }
      } catch (error) {
        console.error("Error checking internal provider:", error);
        setIsInternalProvider(false);
      }
    } else {
      setIsInternalProvider(false);
    }
    
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
    const hasServices = allSelectedServices.length > 0 || selectedService && selectedCategory && selectedProducts.length > 0;
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

    // Calculate total to validate custom price
    const zoneCost = parseFloat(purchaseLocation?.zonaCostoAdicional || "0");
    const productsTotalForValidation = allSelectedServices.reduce((total, service) => total + service.products.reduce((sum, p) => sum + p.Precio * p.quantity, 0), 0);
    const totalSuggestedPrice = productsTotalForValidation + zoneCost;

    // Validate that custom price is not less than 50% of suggested price
    if (suggestedPrice > 0 && suggestedPrice < totalSuggestedPrice * 0.5) {
      toast.error("El precio personalizado no puede ser menor al 50% del precio sugerido");
      return;
    }

    // Combine all selected services with their context and current selection
    const allServicesWithProducts = [...allSelectedServices.map(service => ({
      serviceId: service.serviceId,
      categoryId: service.categoryId,
      products: service.products
    })),
    // Add current selection if there are selected products
    ...(selectedProducts.length > 0 ? [{
      serviceId: selectedService,
      categoryId: selectedCategory,
      products: selectedProducts
    }] : [])];
    if (allServicesWithProducts.length === 0 || allServicesWithProducts.every(s => s.products.length === 0)) {
      toast.error("Debe seleccionar al menos un producto");
      return;
    }

    // Map products correctly: RubrosId=Nivel0(service), ProductoID=Nivel1(category), DetalleID=Nivel2(product)
    const checkoutItems: CheckoutItem[] = allServicesWithProducts.flatMap(service => service.products.map(product => ({
      RubrosId: parseInt(service.serviceId),
      ProductoID: parseInt(service.categoryId),
      DetalleID: product.ProductoID,
      // The product ID is the Nivel2 (DetalleID)
      Cantidad: product.quantity || 1,
      Precio: product.Precio,
      SR: product.SR,
      Comision: product.Comision,
      ComisionTipo: product.ComisionTipo,
      PrecioFinal: product.Precio * (product.quantity || 1),
      ProductName: product.NombreProducto
    })));

    // Calculate total
    const productsTotal = checkoutItems.reduce((sum, item) => sum + item.PrecioFinal, 0);
    const total = productsTotal + zoneCost;

    // Calculate discount if suggested price is provided
    const discountAmount = suggestedPrice > 0 ? Math.round(productsTotal + zoneCost - suggestedPrice) : 0;
    const data: CheckoutData = {
      Nombre: personalInfo.name,
      Telefono: personalInfo.phone,
      Mail: personalInfo.email || null,
      PaisISO: 0,
      DepartamentoId: parseInt(purchaseLocation?.departmentId || "0"),
      MunicipioId: parseInt(purchaseLocation?.locationId || "0"),
      DepartamentoNombre: purchaseLocation?.departmentName,
      MunicipioNombre: purchaseLocation?.locationName,
      ZonasID: 0,
      Direccion: `${personalInfo.street} ${personalInfo.number}${personalInfo.apartment ? ` Apto ${personalInfo.apartment}` : ''}${personalInfo.corner ? ` esq. ${personalInfo.corner}` : ''}`,
      MetodoPagosID: paymentMethod === "later" ? 1 : 4,
      SolicitudPagada: "",
      SolicitaCotizacion: total.toString(),
      SolicitaOtroServicio: "",
      OtroServicioDetalle: "",
      FechaInstalacion: format(selectedDate!, "yyyy-MM-dd"),
      TurnoInstalacion: getTimeSlotNumber(selectedTimeSlot),
      Comentario: personalInfo.comments || "",
      ConfirmarCondicionesUso: personalInfo.termsAccepted ? "S" : "N",
      ProveedorAuxiliar: getProviderAuxiliary(purchaseLocation?.storeId || "unknown", purchaseLocation?.storeName),
      CostoXZona: zoneCost,
      PaginaOne: "",
      Descuento: discountAmount,
      ...(solicitudId && {
        SolicitudIdCancelar: parseInt(solicitudId)
      }),
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
    if (!data.TurnoInstalacion) missingFields.push("Turno");
    if (data.Level1.length === 0) missingFields.push("Productos");
    if (!personalInfo.termsAccepted) missingFields.push("Términos y condiciones");
    if (!acceptTerms) missingFields.push("Aceptar términos y condiciones");
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
      const allServicesForLogging = [...allSelectedServices, ...(selectedProducts.length > 0 ? [{
        serviceId: selectedService,
        categoryId: selectedCategory,
        products: selectedProducts
      }] : [])];
      const allProducts = allServicesForLogging.flatMap(service => service.products);
      
      console.log("=== DEBUG: PARÁMETROS DE RUTA ===");
      console.log("userId desde params:", userId);
      console.log("commerceId desde params:", commerceId);
      console.log("solicitudId desde params:", solicitudId);
      
      console.log("\n=== DEBUG: PROVIDER ID ===");
      console.log("ProveedorAuxiliar en data:", data.ProveedorAuxiliar);
      console.log("Provider ID calculado:", providerId);
      console.log("Purchase Location storeId:", purchaseLocation?.storeId);
      
      console.log("\n=== DEBUG: JSON COMPLETO A ENVIAR ===");
      console.log("JSON stringify:", jsonSolicitud);
      console.log("\n=== DEBUG: DATA OBJECT COMPLETO ===");
      console.log(JSON.stringify(data, null, 2));
      
      console.log("\n=== DATOS DE LA SOLICITUD ===");
      console.log("Provider ID:", providerId);
      console.log("User ID:", userId || "0");
      console.log("Datos completos:", data);
      console.log("=== IDs DEL JSON ===");
      console.log("DepartamentoId en JSON:", data.DepartamentoId);
      console.log("MunicipioId en JSON:", data.MunicipioId);
      console.log("PaisISO en JSON:", data.PaisISO);
      console.log("ZonasID en JSON:", data.ZonasID);
      console.log("SolicitaCotizacion en JSON:", data.SolicitaCotizacion);
      console.log("Personal Info completo:", personalInfo);
      console.log("Purchase Location:", purchaseLocation);
      console.log("Selected Products:", allProducts);
      const url = new URL("https://app.almango.com.uy/WebAPI/AltaSolicitud");
      url.searchParams.append("Userconect", "NoEmpty");
      url.searchParams.append("Key", "d3d3LmF6bWl0YS5jb20=");
      url.searchParams.append("Proveedorid", providerId);
      url.searchParams.append("Usuarioid", userId || "0");
      url.searchParams.append("Jsonsolicitud", jsonSolicitud);
      
      console.log("\n=== DEBUG: URL PARAMETERS ===");
      console.log("Proveedorid que se envía:", providerId);
      console.log("Usuarioid que se envía:", userId || "0");
      console.log("URL completa:", url.toString());
      console.log("\n=== DEBUG: DECODIFICANDO URL ===");
      console.log("Proveedorid decodificado:", decodeURIComponent(url.searchParams.get("Proveedorid") || ""));
      console.log("Usuarioid decodificado:", decodeURIComponent(url.searchParams.get("Usuarioid") || ""));
      
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
        // Create ServiceRequest object
        const serviceRequest: ServiceRequest = {
          solicitudId: parseInt(result.SolicitudesID),
          serviceName: services?.find(s => s.id === selectedService)?.name || "Servicio",
          requestData: data,
          paymentConfirmed: paymentMethod === "later" // If paying later, mark as confirmed
        };
        
        setServiceRequests([serviceRequest]);
        setShowConfirmationModal(false);
        setShowResultDialog(true);

        // Reset form
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
          termsAccepted: true
        });
        setSelectedDate(undefined);
        setComments("");
        setAcceptTerms(false);
        setSelectedTimeSlot("");
        setPaymentMethod("later");
        setNoNumber(false);
        setPurchaseLocation(null);
        setConfirmationData(null);
        setSuggestedPrice(0);
      } else {
        toast.error("Error: No se pudo obtener el ID de la solicitud");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setError(`Error al enviar la solicitud: ${error instanceof Error ? error.message : "Error desconocido"}`);
      setShowConfirmationModal(false);
      setShowResultDialog(true);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle payment link for MercadoPago
  const handlePaymentLink = (solicitudId: number) => {
    const paymentUrl = `https://pay.almango.com.uy/procesarpago.aspx?S${solicitudId}`;
    if (paymentLinkRef.current) {
      paymentLinkRef.current.href = paymentUrl;
      paymentLinkRef.current.click();
    }
  };
  
  const stepTitles = ["Formulario de solicitud de servicio"];
  const renderStepContent = () => {
    return <div className="space-y-6">
        {/* Ubicación del servicio - Primera prioridad */}
            <div className="transition-all duration-300">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                <MapPin className="h-5 w-5 text-primary" />
                Ubicación del servicio
              </h4>
              {purchaseLocation ? <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">Ubicación configurada</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setIsLocationModalOpen(true)} className="h-8 text-sm">
                    Editar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  {purchaseLocation.storeName} - {purchaseLocation.departmentName}, {purchaseLocation.locationName}
                </p>
                {purchaseLocation.zonaCostoAdicional && parseFloat(purchaseLocation.zonaCostoAdicional) > 0 && <p className="text-sm text-primary font-medium mt-2">
                    Costo adicional por zona: ${formatPrice(parseFloat(purchaseLocation.zonaCostoAdicional))}
                  </p>}
              </div> : <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg border border-border transition-colors cursor-pointer hover:bg-muted" onClick={() => setIsLocationModalOpen(true)}>
                <MapPin className="h-5 w-5 text-primary" />
                <span className="text-sm text-foreground flex-1">Ingresá la ubicación aquí *</span>
              </div>}
            </div>

            {/* Services Summary Section */}
            {allSelectedServices.length > 0 && <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Check className="h-5 w-5 text-secondary" />
                  <h3 className="font-semibold text-secondary text-base">
                    Servicios Agregados ({allSelectedServices.length})
                  </h3>
                </div>
                
                <div className="space-y-3">
                  {allSelectedServices.map((service, index) => <div key={index} className="bg-background p-3 rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{service.serviceName}</h4>
                          <p className="text-sm text-muted-foreground mb-2">{service.categoryName}</p>
                          
                          <div className="space-y-1 mb-2">
                            {service.products.map((product, idx) => <div key={idx} className="flex justify-between text-sm bg-muted/50 px-2 py-1 rounded">
                                <span className="text-foreground">{product.NombreProducto} x{product.quantity}</span>
                                <span className="font-medium text-foreground">${formatPrice(product.Precio * product.quantity)}</span>
                              </div>)}
                          </div>
                          
                          <div className="flex justify-between items-center pt-2 border-t border-border">
                            <span className="text-sm font-medium text-muted-foreground">Subtotal:</span>
                            <span className="font-bold text-secondary">
                              ${formatPrice(service.products.reduce((sum, p) => sum + p.Precio * p.quantity, 0))}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 ml-3">
                          <Button variant="ghost" size="sm" onClick={() => editServiceFromList(index)} className="text-secondary hover:text-secondary/80 hover:bg-secondary/10 h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => removeServiceFromList(index)} className="text-destructive hover:text-destructive/80 hover:bg-destructive/10 h-8 w-8 p-0">
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>)}
                </div>
                
                <div className="mt-3 pt-3 border-t border-secondary/30 bg-secondary/5 rounded-lg p-3">
                  <div className="space-y-2">
                    {purchaseLocation?.zonaCostoAdicional && parseFloat(purchaseLocation.zonaCostoAdicional) > 0 && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-secondary">Precio del servicio:</span>
                          <span className="text-lg font-bold text-secondary">
                            ${formatPrice(allSelectedServices.reduce((total, service) => total + service.products.reduce((sum, p) => sum + p.Precio * p.quantity, 0), 0))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-secondary">Costo adicional por zona:</span>
                          <span className="font-semibold text-secondary">
                            ${formatPrice(parseFloat(purchaseLocation.zonaCostoAdicional))}
                          </span>
                        </div>
                      </>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-secondary/20">
                      <span className={cn("font-bold text-secondary", usesCustomPrice === "custom" && suggestedPrice > 0 && "line-through opacity-60")}>
                        {isInternalProvider ? "Monto final:" : "Monto final (precio sugerido):"}
                      </span>
                      <span className={cn("text-xl font-bold text-secondary", usesCustomPrice === "custom" && suggestedPrice > 0 && "line-through opacity-60")}>
                        ${formatPrice(allSelectedServices.reduce((total, service) => total + service.products.reduce((sum, p) => sum + p.Precio * p.quantity, 0), 0) + parseFloat(purchaseLocation?.zonaCostoAdicional || "0"))}
                      </span>
                    </div>
                    {usesCustomPrice === "custom" && suggestedPrice > 0 && (
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-bold text-primary">Precio personalizado:</span>
                        <span className="text-xl font-bold text-primary">
                          ${formatPrice(suggestedPrice)}
                        </span>
                      </div>
                    )}
                    
                    {/* Precio personalizado - campo opcional */}
                    {!isInternalProvider && allSelectedServices.length > 0 && <div className="space-y-4 p-4 mt-4 rounded-lg border-2 border-primary/40 bg-primary/5">
                        <div className="space-y-2">
                          <Label className="text-sm font-semibold flex items-center gap-2">
                            <span className="text-lg">💰</span>
                            ¿Querés proponer un precio distinto? Aplica{" "}
                            <button type="button" onClick={() => setIsCustomPriceTermsOpen(true)} className="text-primary hover:underline font-semibold">
                              Términos y Condiciones
                            </button>
                          </Label>
                          
                          <RadioGroup 
                            value={usesCustomPrice} 
                            onValueChange={(value: "suggested" | "custom") => {
                              if (isInternalProvider && value === "custom") {
                                toast.info("El precio personalizado no está disponible para comercios internos");
                                return;
                              }
                              setUsesCustomPrice(value);
                              if (value === "suggested") {
                                setSuggestedPrice(0);
                              } else if (value === "custom") {
                                // If switching to custom price and MercadoPago is selected, switch to pay later
                                if (paymentMethod === "now") {
                                  setPaymentMethod("later");
                                  toast.info("El pago con MercadoPago no está disponible con precio personalizado");
                                }
                              }
                            }} 
                            className="flex gap-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="suggested" id="price-suggested" />
                              <Label htmlFor="price-suggested" className="cursor-pointer font-normal">
                                Precio sugerido
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem 
                                value="custom" 
                                id="price-custom" 
                                disabled={isInternalProvider}
                              />
                              <Label 
                                htmlFor="price-custom" 
                                className={cn(
                                  "font-normal",
                                  isInternalProvider ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                )}
                              >
                                Precio distinto
                              </Label>
                            </div>
                          </RadioGroup>
                          
                          {isInternalProvider && (
                            <p className="text-xs text-muted-foreground mt-1">
                              El precio personalizado no está disponible para comercios internos
                            </p>
                          )}
                        </div>

                        {usesCustomPrice === "custom" && <>
                            <Input id="suggested-price" type="number" min="0" max={allSelectedServices.reduce((total, service) => total + service.products.reduce((sum, p) => sum + p.Precio * p.quantity, 0), 0) + parseFloat(purchaseLocation?.zonaCostoAdicional || "0")} value={suggestedPrice || ""} onChange={e => {
                  const value = parseFloat(e.target.value) || 0;
                  const servicesTotal = allSelectedServices.reduce((total, service) => total + service.products.reduce((sum, p) => sum + p.Precio * p.quantity, 0), 0);
                  const zoneCost = parseFloat(purchaseLocation?.zonaCostoAdicional || "0");
                  const finalTotal = servicesTotal + zoneCost;
                  if (value <= finalTotal) {
                    setSuggestedPrice(value);
                  } else {
                    toast.error("El precio sugerido no puede ser mayor al total final");
                  }
                }} placeholder="Ingresá un monto personalizado" className="h-12 text-lg font-semibold border-primary/50" />
                            
                            {suggestedPrice > 0 && <div className="flex justify-between items-center p-3 rounded-md bg-green-50 border border-green-200">
                                <span className="text-sm font-medium text-green-800">Descuento a aplicar:</span>
                                <span className="text-lg font-bold text-green-600">
                                  -${formatPrice(allSelectedServices.reduce((total, service) => total + service.products.reduce((sum, p) => sum + p.Precio * p.quantity, 0), 0) + parseFloat(purchaseLocation?.zonaCostoAdicional || "0") - suggestedPrice)}
                                </span>
                              </div>}
                          </>}
                      </div>}
                  </div>
                </div>
              </div>}

            {/* Date and Time Selection - Only visible after at least one service is added */}
            {allSelectedServices.length > 0 && (
              <div className="p-4 bg-accent/50 rounded-lg border border-border transition-all duration-300">
                <h4 className="font-semibold mb-3 flex items-center gap-2 text-foreground">
                  <CalendarClock className="h-5 w-5 text-primary" />
                  Fecha y Turno del Servicio
                </h4>
                
                <p className="text-sm text-muted-foreground mb-4 italic">
                  El Profesional asiste dentro del rango horario seleccionado
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date" className="text-sm font-medium mb-2 block">Fecha *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-background h-10", !selectedDate && "text-muted-foreground")}>
                          <CalendarClock className="mr-2 h-3 w-3" />
                          {selectedDate ? format(selectedDate, "PPP", {
                      locale: es
                    }) : "Seleccionar fecha"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 z-50 bg-white" align="start">
                        <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={date => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date.getDay() === 0 || date < today || date.getTime() === today.getTime();
                  }} locale={es} className="pointer-events-auto" fromDate={new Date(new Date().getTime() + 24 * 60 * 60 * 1000)} toDate={new Date(new Date().getTime() + 60 * 24 * 60 * 60 * 1000)} />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  {selectedDate && <div>
                      <Label htmlFor="timeSlot" className="text-sm font-medium mb-2 block">Turno *</Label>
                      <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                        <SelectTrigger className="bg-background h-10">
                          <SelectValue placeholder="Seleccionar turno" />
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
                    return timeSlots.map(slot => <SelectItem key={slot} value={slot}>
                                {slot}
                              </SelectItem>);
                  })()}
                        </SelectContent>
                      </Select>
                    </div>}
                </div>
              </div>
            )}

            <div className={cn("transition-all duration-300", !purchaseLocation && "opacity-50 pointer-events-none")}>
              <Label htmlFor="service" className="text-sm font-medium mb-2 block">
                {allSelectedServices.length > 0 ? "¿Qué otro servicio necesitás?" : "¿Qué servicio necesitás?"}
                {!purchaseLocation && <span className="text-xs text-muted-foreground font-normal ml-2">(Configurá ubicación primero)</span>}
              </Label>
              {!selectedService ? <Select value={selectedService} onValueChange={setSelectedService} disabled={!purchaseLocation}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Ver servicios" />
                  </SelectTrigger>
                  <SelectContent>
                    {isServicesLoading ? <SelectItem value="loading" disabled>Cargando servicios...</SelectItem> : services && services.length > 0 ? services.map((service: TarjetaServicio) => <SelectItem key={service.id} value={service.id!}>
                          {service.name}
                        </SelectItem>) : <SelectItem value="no-services" disabled>
                        No hay servicios disponibles
                      </SelectItem>}
                  </SelectContent>
                </Select> : <div className="flex gap-2">
                  <Input value={services?.find(s => s.id === selectedService)?.name || ""} disabled className="h-10 bg-muted" />
                  <Button type="button" variant="outline" size="icon" onClick={() => {
            setSelectedService("");
            setSelectedCategory("");
            setSelectedProducts([]);
          }} className="h-10 w-10 flex-shrink-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>}
            </div>

            {selectedService && <div className={cn("transition-all duration-300", !purchaseLocation && "opacity-50 pointer-events-none")}>
                <Label htmlFor="category" className="text-sm font-medium mb-2 block">
                  Seleccioná una Categoría
                  {!purchaseLocation && <span className="text-xs text-muted-foreground font-normal ml-2">(Configurá ubicación primero)</span>}
                </Label>
                {!selectedCategory ? <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={!purchaseLocation}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Ver categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      {isCategoriesLoading ? <SelectItem value="loading" disabled>Cargando categorías...</SelectItem> : categories && categories.length > 0 ? categories.map((category: Category) => <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>) : <SelectItem value="no-categories" disabled>
                          No hay categorías disponibles
                        </SelectItem>}
                    </SelectContent>
                  </Select> : <div className="flex gap-2">
                    <Input value={categories?.find(c => c.id === selectedCategory)?.name || ""} disabled className="h-10 bg-muted" />
                    <Button type="button" variant="outline" size="icon" onClick={() => {
            setSelectedCategory("");
            setSelectedProducts([]);
          }} className="h-10 w-10 flex-shrink-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>}
            </div>}

            {/* Service Selection Section - Only show when category and location are selected */}
            {selectedCategory && purchaseLocation && <div className="bg-background border border-border rounded-lg p-4 shadow-sm">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-primary" />
                    <Label className="font-semibold">
                      Productos disponibles para: {services?.find(s => s.id === selectedService)?.name}
                    </Label>
                  </div>
                  
                  <div className="grid gap-3 max-h-80 overflow-y-auto pr-2">
                    {isProductsLoading ? <div className="space-y-3">
                        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
                      </div> : displayedProducts && displayedProducts.length > 0 ? displayedProducts.filter(product => product).map((product: Product) => {
              const selectedProduct = selectedProducts.find(p => p.ProductoID === product.ProductoID);
              const quantity = selectedProduct?.quantity || 0;
              const imageSource = product.Imagen && product.Imagen.startsWith('data:image') ? product.Imagen : product.Imagen ? `data:image/png;base64,${product.Imagen}` : null;
              return <div key={product.ProductoID} className={cn("flex items-center space-x-3 p-3 border-2 rounded-lg transition-all duration-200", quantity > 0 ? "border-primary bg-primary/5 shadow-md" : "border-border hover:border-primary/50")}>
                            <div className="flex-shrink-0 w-16 h-16 bg-muted/30 rounded-md overflow-hidden flex items-center justify-center">
                              {imageSource ? <img src={imageSource} alt={product.NombreProducto} className="w-full h-full object-contain" /> : <Package className="h-8 w-8 text-muted-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <span className="font-semibold text-sm text-foreground block">{product.NombreProducto}</span>
                                  <span className="text-xs text-muted-foreground">Código: {product.ProductoID}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-bold text-secondary text-sm">${formatPrice(product.Precio)}</span>
                                  <span className="block text-xs text-muted-foreground">por unidad</span>
                                </div>
                              </div>
                              
                              <div className="mb-1">
                                <Button variant="link" className="text-xs text-secondary hover:text-secondary/80 p-0 h-auto cursor-pointer" onClick={() => setSelectedProductTerms({
                      textosId: product.TextosId?.toString() || null,
                      productName: product.NombreProducto
                    })} type="button">
                                  Ver Condiciones
                                </Button>
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">Cantidad:</span>
                                <div className="flex items-center gap-2">
                                  <Button type="button" variant="outline" size="sm" onClick={() => handleProductQuantityChange(product, -1)} disabled={quantity === 0} className="h-7 w-7 p-0">
                                    -
                                  </Button>
                                  <span className="font-semibold text-sm min-w-[2ch] text-center">{quantity}</span>
                                  <Button type="button" variant="outline" size="sm" onClick={() => handleProductQuantityChange(product, 1)} className="h-7 w-7 p-0">
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                              
                              {quantity > 0 && <div className="mt-2 pt-2 border-t border-border">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-medium text-muted-foreground">Subtotal:</span>
                                    <span className="font-bold text-sm text-primary">${formatPrice(product.Precio * quantity)}</span>
                                  </div>
                                </div>}
                            </div>
                          </div>;
            }) : <div className="text-center py-6 text-muted-foreground bg-muted/30 rounded-lg">
                        <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-medium">No hay productos disponibles</p>
                        <p className="text-sm">para esta categoría en tu ubicación</p>
                      </div>}
                  </div>

                  {/* Add Service Action */}
                  {selectedProducts.length > 0 && <div className="mt-4 p-4 bg-primary/10 border border-primary/30 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-primary">
                          ✓ {selectedProducts.reduce((sum, p) => sum + p.quantity, 0)} productos ({selectedProducts.length} tipos)
                        </p>
                        <div className="text-right">
                          <p className="text-lg font-bold text-primary">
                            ${formatPrice(selectedProducts.reduce((sum, p) => sum + p.Precio * p.quantity, 0))}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mb-3 flex items-start gap-2">
                        <Checkbox id="accept-product-terms" checked={acceptProductTerms} onCheckedChange={checked => setAcceptProductTerms(checked as boolean)} className="mt-1" />
                        <label htmlFor="accept-product-terms" className="text-sm text-foreground leading-tight cursor-pointer">
                          Acepto las condiciones del servicio. 
                        </label>
                      </div>
                      
                      <Button onClick={addCurrentServiceToList} disabled={!acceptProductTerms} className="w-full bg-primary hover:bg-primary/90 h-10 disabled:opacity-50 disabled:cursor-not-allowed">
                        <Plus className="h-4 w-4 mr-2" />
                        AGREGAR A LA SOLICITUD
                      </Button>
                    </div>}
                </div>
              </div>}

        {/* Información Personal Section - Only visible after date and time slot are selected */}
        {selectedDate && selectedTimeSlot && (
          <>
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
                <Input id="name" placeholder="Nombre y apellido" value={personalInfo.name} className="h-10" onChange={e => setPersonalInfo(prev => ({
                ...prev,
                name: e.target.value
              }))} required />
              </div>
              <div>
                <Label htmlFor="phone" className="text-sm font-medium mb-2 block">Teléfono *</Label>
                <Input id="phone" placeholder="Teléfono de contacto" value={personalInfo.phone} className="h-10" onChange={e => setPersonalInfo(prev => ({
                ...prev,
                phone: e.target.value
              }))} required />
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="text-sm font-medium mb-2 block">Correo electrónico (opcional)</Label>
              <Input id="email" type="email" placeholder="tu@email.com" value={personalInfo.email} className="h-10" onChange={e => setPersonalInfo(prev => ({
              ...prev,
              email: e.target.value
            }))} />
            </div>

            {/* Dirección */}
            <div className="space-y-4">
              <h4 className="font-semibold">Dirección</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street" className="text-sm font-medium mb-2 block">Calle *</Label>
                  <Input id="street" placeholder="Nombre de la calle" value={personalInfo.street} className="h-10" onChange={e => setPersonalInfo(prev => ({
                  ...prev,
                  street: e.target.value
                }))} required />
                </div>
                
                <div>
                  <Label htmlFor="number" className="text-sm font-medium mb-2 block">Número *</Label>
                  <div className="space-y-2">
                    <Input id="number" placeholder="Número de puerta" value={personalInfo.number} disabled={noNumber} className="h-10" onChange={e => setPersonalInfo(prev => ({
                    ...prev,
                    number: e.target.value
                  }))} required={!noNumber} />
                    <div className="flex items-center space-x-2">
                      <Checkbox id="no-number" checked={noNumber} onCheckedChange={checked => {
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
                    }} className="h-4 w-4" />
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
                  <Input id="corner" placeholder="Intersección más cercana" value={personalInfo.corner} className="h-10" onChange={e => setPersonalInfo(prev => ({
                  ...prev,
                  corner: e.target.value
                }))} />
                </div>
                
                <div>
                  <Label htmlFor="apartment" className="text-sm font-medium mb-2 block">Apartamento</Label>
                  <Input id="apartment" placeholder="Apto (opcional)" value={personalInfo.apartment} className="h-10" onChange={e => setPersonalInfo(prev => ({
                  ...prev,
                  apartment: e.target.value
                }))} />
                </div>
              </div>
            </div>


            {/* Comentarios */}
            <div>
              <Label htmlFor="comments" className="text-sm font-medium mb-2 block">Comentarios</Label>
              <Textarea id="comments" placeholder="¿Hay algo más que debamos saber?" value={personalInfo.comments} className="min-h-[80px]" onChange={e => setPersonalInfo(prev => ({
              ...prev,
              comments: e.target.value
            }))} />
            </div>

            {/* Forma de pago */}
            {!isInternalProvider && (
              <div className="space-y-3">
                <Label className="text-sm font-medium">Forma de pago</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="later" id="payment-later" />
                    <Label htmlFor="payment-later" className="flex items-center gap-2 cursor-pointer font-normal">
                      Pagar después (al profesional)
                      <Banknote size={18} className="text-green-500" />
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem 
                      value="now" 
                      id="payment-now" 
                      disabled={usesCustomPrice === "custom" || isInternalProvider}
                    />
                    <Label 
                      htmlFor="payment-now" 
                      className={cn(
                        "flex items-center gap-2 font-normal",
                        (usesCustomPrice === "custom" || isInternalProvider) ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                      )}
                    >
                      Pagar ahora (crédito/débito)
                      <CreditCard size={18} className="text-sky-500" />
                    </Label>
                  </div>
                  {(usesCustomPrice === "custom" || isInternalProvider) && (
                    <p className="text-xs text-muted-foreground ml-6">
                      {isInternalProvider 
                        ? "El pago con MercadoPago no está disponible para comercios internos"
                        : "El pago con MercadoPago solo está disponible con precio sugerido"
                      }
                    </p>
                  )}
                </RadioGroup>
              </div>
            )}

            {/* Términos y condiciones */}
            <div className="flex items-start space-x-2 p-4 bg-accent/30 rounded-lg border border-border">
              <Checkbox id="terms" checked={acceptTerms} onCheckedChange={checked => setAcceptTerms(checked as boolean)} className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                  Acepto los{" "}
                  <button type="button" onClick={e => {
                  e.preventDefault();
                  setIsTermsModalOpen(true);
                }} className="text-primary hover:underline font-semibold">
                    términos y condiciones
                  </button>
                  {" "}*
                </Label>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>;
  };
  return <div className="min-h-screen" style={{
    backgroundImage: `url(${fondoAzul})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}>
      {/* Hidden link for MercadoPago payment */}
      <a 
        ref={paymentLinkRef} 
        href="about:blank" 
        target="_blank" 
        rel="noopener noreferrer" 
        style={{ display: 'none' }}
      />
      <div className="container mx-auto py-8 max-w-3xl">
        <div className="mb-6 px-4">
          <div className="rounded-t-3xl p-8 text-center bg-[#fe8d0c]/0">
            <h1 className="text-white text-3xl mb-3 tracking-wide font-extrabold md:text-3xl">SOLICITÁ TU SERVICIO EN MINUTOS</h1>
            <p className="text-white text-sm mt-[-8px] font-semibold md:text-xl">RÁPIDO, FÁCIL, SEGURO. SIN VUELTAS.</p>
          </div>
        </div>
        <div className="px-4 mt-14">
        <Card className="shadow-xl border-border -mt-6">
          <CardHeader className="from-primary to-secondary text-primary-foreground p-6 bg-[fe8d0c] m-[-2px] flex flex-row items-center justify-between bg-[#fe8d0c]/0">
            <CardTitle className="text-lg font-semibold flex items-center gap-2 text-sky-600">
              <Package className="h-5 w-5" />
              {stepTitles[0]}
            </CardTitle>
            <img src={logo} alt="Logo" style={{
              imageRendering: 'crisp-edges'
            }} className="h-11 w-auto object-contain mr-[-15px]" />
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
                {(selectedService || selectedCategory || selectedProducts.length > 0) && <Button variant="outline" onClick={() => {
                setSelectedService("");
                setSelectedCategory("");
                setSelectedProducts([]);
              }} className="h-10 text-slate-950 font-bold">
                    Limpiar
                  </Button>}
                <Button onClick={handleShowConfirmation} disabled={isSubmitting || !validateForm()} className="min-w-32 h-10 bg-primary hover:bg-primary/90">
                  {isSubmitting ? "Enviando..." : "Confirmar Solicitud"}
                </Button>
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
          commerceId={commerceId}
        />
        
        <ProductTermsModal isOpen={!!selectedProductTerms} onClose={() => setSelectedProductTerms(null)} textosId={selectedProductTerms?.textosId || null} productName={selectedProductTerms?.productName || ""} />

        <CustomPriceTermsModal isOpen={isCustomPriceTermsOpen} onClose={() => setIsCustomPriceTermsOpen(false)} />

        <ConfirmationModal open={showConfirmationModal} onClose={() => setShowConfirmationModal(false)} onConfirm={handleSubmit} title="Confirmar Solicitud" description="Por favor revise los datos antes de enviar la solicitud." jsonData={confirmationData} isSubmitting={isSubmitting} hasSuggestedPrice={true} />

        <GeneralTermsModal isOpen={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />

        <ResultDialog
          isOpen={showResultDialog}
          onClose={() => {
            setShowResultDialog(false);
            navigate('/');
          }}
          serviceRequests={serviceRequests}
          error={error}
          checkingPayment={checkingPayment}
          onPaymentClick={handlePaymentLink}
          onViewServiceDetails={(request: ServiceRequest) => {
            setSelectedServiceId(request.solicitudId);
            setSelectedRequestData(request.requestData);
            setShowDetailDialog(true);
          }}
          departments={departments || []}
          municipalities={municipalities || {}}
        />

        <RequestDetailsDialog
          isOpen={showDetailDialog}
          onClose={() => setShowDetailDialog(false)}
          requestData={selectedRequestData}
          serviceId={selectedServiceId}
          departments={departments || []}
          municipalities={municipalities || {}}
        />
      </div>
    </div>;
};
export default ServicioOnePage;