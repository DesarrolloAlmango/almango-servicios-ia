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

const ServicioOnePageWithUser = () => {
  const navigate = useNavigate();
  const {
    userId,
    solicitudId
  } = useParams();

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
    termsAccepted: true
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("1");
  const [comments, setComments] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [noNumber, setNoNumber] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
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

  const {
    data: services,
    isLoading: isServicesLoading
  } = useQuery({
    queryKey: ["tarjetasServicios", solicitudId],
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
        return [];
      }
      try {
        const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerNivel1?Nivel0=${selectedService}`);
        if (!response.ok) {
          throw new Error("Error al obtener categorías");
        }
        const data = await response.json();
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        if (!Array.isArray(parsedData)) {
          return [];
        }
        const mappedCategories = parsedData.map((cat: any) => ({
          id: cat.Nivel1ID ? cat.Nivel1ID.toString() : cat.id?.toString() || cat.ID?.toString(),
          name: cat.NombreNivel1 || cat.name || cat.Name,
          icon: cat.IconoNivel1 || cat.icon
        }));
        return mappedCategories;
      } catch (error) {
        toast.error("Error al cargar las categorías");
        throw error;
      }
    },
    enabled: !!selectedService,
    retry: 1
  });

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
        ComisionTipo: product.ComisionTipo || "P",
        DetallesID: product.DetallesID || product.detallesId || null
      }));
      return mappedProducts;
    },
    enabled: !!(selectedService && selectedCategory && purchaseLocation)
  });

  const handleProductQuantityChange = (product: Product, change: number) => {
    setSelectedProducts(prev => {
      const existing = prev.find(p => p.ProductoID === product.ProductoID);
      if (existing) {
        const newQuantity = existing.quantity + change;
        if (newQuantity <= 0) {
          return prev.filter(p => p.ProductoID !== product.ProductoID);
        }
        return prev.map(p => p.ProductoID === product.ProductoID ? {
          ...p,
          quantity: newQuantity
        } : p);
      } else if (change > 0) {
        return [...prev, {
          ...product,
          quantity: 1
        }];
      }
      return prev;
    });
  };

  const validateForm = (): boolean => {
    const hasServices = allSelectedServices.length > 0 || selectedService && selectedCategory && selectedProducts.length > 0;
    const hasDateTime = !!selectedDate && !!selectedTimeSlot;
    const hasPersonalInfo = !!(personalInfo.name && personalInfo.phone && personalInfo.street && (personalInfo.number || noNumber) && personalInfo.termsAccepted);
    const hasAcceptedTerms = acceptTerms;
    return hasServices && hasDateTime && hasPersonalInfo && hasAcceptedTerms;
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
  };

  const removeServiceFromList = (index: number) => {
    setAllSelectedServices(prev => prev.filter((_, i) => i !== index));
  };

  const editServiceFromList = (index: number) => {
    const serviceToEdit = allSelectedServices[index];
    setSelectedService(serviceToEdit.serviceId);
    setSelectedCategory(serviceToEdit.categoryId);
    setSelectedProducts([...serviceToEdit.products]);
    setAllSelectedServices(prev => prev.filter((_, i) => i !== index));
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    toast.info("Servicio cargado para edición");
  };

  const getTimeSlotNumber = (timeSlot: string): string => {
    if (timeSlot === "08:00 - 12:00" || timeSlot === "08:00 - 14:00") return "1";
    if (timeSlot === "12:00 - 16:00" || timeSlot === "14:00 - 20:00") return "2";
    if (timeSlot === "16:00 - 20:00") return "3";
    return "1";
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

  const handleShowConfirmation = () => {
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
    const zoneCost = parseFloat(purchaseLocation?.zonaCostoAdicional || "0");

    const allServicesWithProducts = [...allSelectedServices.map(service => ({
      serviceId: service.serviceId,
      categoryId: service.categoryId,
      products: service.products
    })),
    ...(selectedProducts.length > 0 ? [{
      serviceId: selectedService,
      categoryId: selectedCategory,
      products: selectedProducts
    }] : [])];

    if (allServicesWithProducts.length === 0 || allServicesWithProducts.every(s => s.products.length === 0)) {
      toast.error("Debe seleccionar al menos un producto");
      return;
    }

    const checkoutItems: CheckoutItem[] = allServicesWithProducts.flatMap(service => service.products.map(product => ({
      RubrosId: parseInt(service.serviceId),
      ProductoID: parseInt(service.categoryId),
      DetalleID: product.ProductoID,
      Cantidad: product.quantity || 1,
      Precio: product.Precio,
      SR: product.SR,
      Comision: product.Comision,
      ComisionTipo: product.ComisionTipo,
      PrecioFinal: product.Precio * (product.quantity || 1),
      ProductName: product.NombreProducto
    })));

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
      ProveedorAuxiliar: getProviderAuxiliary(purchaseLocation?.storeId || "unknown", purchaseLocation?.storeName),
      CostoXZona: zoneCost,
      PaginaOne: "One",
      Descuento: 0,
      Level1: checkoutItems
    };

    const missingFields = [];
    if (!data.Nombre) missingFields.push("Nombre");
    if (!data.Telefono) missingFields.push("Teléfono");
    if (!data.Direccion) missingFields.push("Dirección");
    if (!data.FechaInstalacion) missingFields.push("Fecha");
    if (!data.TurnoInstalacion) missingFields.push("Horario");
    if (data.Level1.length === 0) missingFields.push("Productos");
    if (!personalInfo.termsAccepted) missingFields.push("Términos y condiciones");
    if (!acceptTerms) missingFields.push("Aceptar términos y condiciones");

    if (missingFields.length > 0) {
      toast.error(`Faltan campos requeridos: ${missingFields.join(", ")}`);
      return;
    }

    setConfirmationData(data);
    setShowConfirmationModal(true);
  };

  // THE KEY DIFFERENCE: Add userId to UsuarioID parameter
  const handleSubmit = async () => {
    if (!confirmationData) return;
    setIsSubmitting(true);
    try {
      const data = confirmationData;
      const jsonSolicitud = JSON.stringify(data);

      let providerId = "0";
      if (data.ProveedorAuxiliar) {
        const aux = data.ProveedorAuxiliar.trim();
        if (aux === "No lo sé") {
          providerId = "0";
        } else {
          providerId = aux;
        }
      }

      const url = new URL("https://app.almango.com.uy/WebAPI/AltaSolicitud");
      url.searchParams.append("Userconect", "NoEmpty");
      url.searchParams.append("Key", "d3d3LmF6bWl0YS5jb20=");
      url.searchParams.append("Proveedorid", providerId);
      // HERE IS THE DIFFERENCE: Use userId from URL params
      url.searchParams.append("Usuarioid", userId || "0");
      url.searchParams.append("Jsonsolicitud", jsonSolicitud);

      console.log("URL completa con userId:", url.toString());

      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`Error en la respuesta: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error("Error al procesar la respuesta del servidor");
      }

      if (result.SolicitudesID && result.SolicitudesID !== "0") {
        toast.success(`Solicitud enviada exitosamente. ID: ${result.SolicitudesID}`);
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

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto p-4">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
          <ArrowLeft size={16} /> Volver
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Solicitud de Servicio</CardTitle>
            <CardDescription>Complete el formulario para solicitar el servicio deseado.</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Step 1: Selección de servicios */}
            {currentStep === 1 && (
              <>
                <div className="mb-4">
                  <Label htmlFor="service-select">Seleccione un servicio</Label>
                  {isServicesLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedService} onValueChange={setSelectedService} id="service-select">
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione un servicio" />
                      </SelectTrigger>
                      <SelectContent>
                        {services?.map(service => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="mb-4">
                  <Label htmlFor="category-select">Seleccione una categoría</Label>
                  {isCategoriesLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select value={selectedCategory} onValueChange={setSelectedCategory} id="category-select" disabled={!selectedService}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccione una categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories?.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                <div className="mb-4">
                  <Label>Seleccione productos</Label>
                  {isProductsLoading ? (
                    <Skeleton className="h-24 w-full" />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-64 overflow-y-auto border rounded p-2">
                      {products?.map(product => {
                        const selectedProduct = selectedProducts.find(p => p.ProductoID === product.ProductoID);
                        return (
                          <div key={product.ProductoID} className="flex items-center justify-between border-b py-2">
                            <div>
                              <p className="font-medium">{product.NombreProducto}</p>
                              <p className="text-sm text-muted-foreground">${product.Precio.toFixed(2)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" onClick={() => handleProductQuantityChange(product, -1)} disabled={!selectedProduct}>
                                <MinusIcon />
                              </Button>
                              <span>{selectedProduct?.quantity || 0}</span>
                              <Button size="sm" variant="outline" onClick={() => handleProductQuantityChange(product, 1)}>
                                <PlusIcon />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <Button onClick={addCurrentServiceToList} disabled={!selectedService || !selectedCategory || selectedProducts.length === 0}>
                  Agregar Servicio
                </Button>

                {allSelectedServices.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Servicios agregados</h3>
                    <ul>
                      {allSelectedServices.map((service, index) => (
                        <li key={index} className="border rounded p-2 mb-2 flex justify-between items-center">
                          <div>
                            <p className="font-medium">{service.serviceName} - {service.categoryName}</p>
                            <ul className="list-disc list-inside text-sm">
                              {service.products.map(product => (
                                <li key={product.ProductoID}>{product.NombreProducto} x {product.quantity}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => editServiceFromList(index)}>
                              <Pencil size={16} />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => removeServiceFromList(index)}>
                              <X size={16} />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => navigate(-1)}>Cancelar</Button>
                  <Button onClick={() => setCurrentStep(2)} disabled={allSelectedServices.length === 0 && (selectedProducts.length === 0 || !selectedService || !selectedCategory)}>
                    Siguiente
                  </Button>
                </div>
              </>
            )}

            {/* Step 2: Información personal y detalles */}
            {currentStep === 2 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre completo</Label>
                    <Input
                      id="name"
                      value={personalInfo.name}
                      onChange={e => setPersonalInfo({ ...personalInfo, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      value={personalInfo.phone}
                      onChange={e => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={personalInfo.email}
                      onChange={e => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="street">Calle</Label>
                    <Input
                      id="street"
                      value={personalInfo.street}
                      onChange={e => setPersonalInfo({ ...personalInfo, street: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="number">Número</Label>
                    <Input
                      id="number"
                      value={personalInfo.number}
                      onChange={e => setPersonalInfo({ ...personalInfo, number: e.target.value })}
                      disabled={noNumber}
                      required={!noNumber}
                    />
                    <Checkbox
                      checked={noNumber}
                      onCheckedChange={checked => {
                        setNoNumber(!!checked);
                        if (checked) {
                          setPersonalInfo({ ...personalInfo, number: "" });
                        }
                      }}
                    >
                      No tiene número
                    </Checkbox>
                  </div>
                  <div>
                    <Label htmlFor="corner">Esquina</Label>
                    <Input
                      id="corner"
                      value={personalInfo.corner}
                      onChange={e => setPersonalInfo({ ...personalInfo, corner: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="apartment">Apartamento</Label>
                    <Input
                      id="apartment"
                      value={personalInfo.apartment}
                      onChange={e => setPersonalInfo({ ...personalInfo, apartment: e.target.value })}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Label htmlFor="comments">Comentarios</Label>
                  <Textarea
                    id="comments"
                    value={personalInfo.comments}
                    onChange={e => setPersonalInfo({ ...personalInfo, comments: e.target.value })}
                  />
                </div>

                <div className="mt-4">
                  <Label>Fecha de instalación</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    locale={es}
                    disabled={(date) => date < new Date()}
                  />
                </div>

                <div className="mt-4">
                  <Label>Horario de instalación</Label>
                  <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} className="flex flex-col gap-2">
                    <RadioGroupItem value="08:00 - 12:00" id="time1" />
                    <Label htmlFor="time1">08:00 - 12:00</Label>
                    <RadioGroupItem value="12:00 - 16:00" id="time2" />
                    <Label htmlFor="time2">12:00 - 16:00</Label>
                    <RadioGroupItem value="16:00 - 20:00" id="time3" />
                    <Label htmlFor="time3">16:00 - 20:00</Label>
                  </RadioGroup>
                </div>

                <div className="mt-4">
                  <Label>Método de pago</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Tarjeta de crédito</SelectItem>
                      <SelectItem value="2">Transferencia bancaria</SelectItem>
                      <SelectItem value="3">Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Checkbox checked={acceptTerms} onCheckedChange={setAcceptTerms} id="acceptTerms" />
                  <Label htmlFor="acceptTerms" className="cursor-pointer">
                    Acepto los términos y condiciones
                  </Label>
                  <Button variant="link" onClick={() => setIsTermsModalOpen(true)}>Ver términos</Button>
                </div>

                <div className="mt-6 flex justify-between">
                  <Button variant="secondary" onClick={() => setCurrentStep(1)}>Anterior</Button>
                  <Button onClick={handleShowConfirmation} disabled={!validateForm()}>Confirmar</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <PurchaseLocationModal
        open={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelect={handleLocationSelect}
      />

      <ConfirmationModal
        open={showConfirmationModal}
        onClose={() => setShowConfirmationModal(false)}
        onConfirm={handleSubmit}
        title="Confirmar Solicitud"
        description="Revise los datos antes de enviar la solicitud."
        jsonData={confirmationData}
        isSubmitting={isSubmitting}
      />

      <GeneralTermsModal open={isTermsModalOpen} onClose={() => setIsTermsModalOpen(false)} />

      <ProductTermsModal
        productTerms={selectedProductTerms}
        onClose={() => setSelectedProductTerms(null)}
      />

      {showCheckoutSummary && checkoutData && (
        <CheckoutSummary data={checkoutData} onClose={() => setShowCheckoutSummary(false)} />
      )}
    </div>
  );
};

export default ServicioOnePageWithUser;
