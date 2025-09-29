import React, { useState, useEffect } from "react";
import { ArrowLeft, Home, Wind, Droplets, Zap, Package, Truck, Baby, MapPin, CalendarClock, UserCheck, CreditCard, Check } from "lucide-react";
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
  countries: Array<{ id: number; name: string; iso: string }>;
  departments: Array<{ id: number; name: string; paisId: number }>;
  municipalities: Array<{ id: number; name: string; departamentoId: number }>;
  zones: Array<{ id: number; name: string; municipioId: number; costo: number }>;
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
  const { userId, commerceId, serviceId: urlServiceId, categoryId: urlCategoryId } = useParams();
  
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
  const [installationDate, setInstallationDate] = useState<Date>();
  const [installationTime, setInstallationTime] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
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

  // Data fetching
  const { data: services, isLoading: isServicesLoading } = useQuery({
    queryKey: ["tarjetasServicios", commerceId],
    queryFn: async () => {
      const response = await fetch("https://app.almango.com.uy/WebAPI/GetTarjetasServicios");
      if (!response.ok) throw new Error("Error al obtener servicios");
      const data = await response.json();
      return JSON.parse(data.SDTTarjetasServiciosJson);
    }
  });

  const { data: categories, isLoading: isCategoriesLoading } = useQuery({
    queryKey: ["categories", selectedService],
    queryFn: async () => {
      if (!selectedService) return [];
      const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerNivel1?Nivel0=${selectedService}`);
      if (!response.ok) throw new Error("Error al obtener categorías");
      const data = await response.json();
      return data.map((cat: any) => ({
        id: cat.Nivel1ID.toString(),
        name: cat.NombreNivel1,
        icon: cat.IconoNivel1
      }));
    },
    enabled: !!selectedService
  });

  const { data: products, isLoading: isProductsLoading } = useQuery({
    queryKey: ["products", selectedService, selectedCategory],
    queryFn: async () => {
      if (!selectedService || !selectedCategory) return [];
      const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerNivel2?Nivel0=${selectedService}&Nivel1=${selectedCategory}`);
      if (!response.ok) throw new Error("Error al obtener productos");
      return await response.json();
    },
    enabled: !!(selectedService && selectedCategory)
  });

  const { data: locationData, isLoading: isLocationLoading } = useQuery({
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
        return !!(selectedService && selectedCategory && selectedProducts.length > 0);
      case 2:
        return !!(personalInfo.nombre && personalInfo.telefono && personalInfo.direccion && 
                 personalInfo.pais && personalInfo.departamento && personalInfo.municipio && personalInfo.zona);
      case 3:
        return !!(installationDate && installationTime && paymentMethod);
      case 4:
        return acceptTerms;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    } else {
      toast.error("Por favor complete todos los campos requeridos");
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) {
      toast.error("Por favor acepte los términos y condiciones");
      return;
    }

    setIsSubmitting(true);

    try {
      const zoneCost = locationData?.zones.find(z => z.id === parseInt(personalInfo.zona))?.costo || 0;
      
      const checkoutItems: CheckoutItem[] = selectedProducts.map(product => ({
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
        FechaInstalacion: format(installationDate!, "yyyy-MM-dd"),
        TurnoInstalacion: installationTime,
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
                      <SelectItem value="loading" disabled>Cargando...</SelectItem>
                    ) : (
                      categories?.map((category: Category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedCategory && (
              <div>
                <Label>Seleccione Productos/Servicios</Label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {isProductsLoading ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : (
                    products?.map((product: Product) => (
                      <div key={product.ProductoID} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <Checkbox
                          id={`product-${product.ProductoID}`}
                          checked={selectedProducts.some(p => p.ProductoID === product.ProductoID)}
                          onCheckedChange={(checked) => handleProductToggle(product, checked as boolean)}
                        />
                        <Label
                          htmlFor={`product-${product.ProductoID}`}
                          className="flex-1 cursor-pointer"
                        >
                          <div className="flex justify-between">
                            <span>{product.NombreProducto}</span>
                            <span className="font-semibold">${product.Precio}</span>
                          </div>
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre Completo *</Label>
                <Input
                  id="nombre"
                  value={personalInfo.nombre}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, nombre: e.target.value }))}
                  placeholder="Ingrese su nombre completo"
                />
              </div>
              <div>
                <Label htmlFor="telefono">Teléfono *</Label>
                <Input
                  id="telefono"
                  value={personalInfo.telefono}
                  onChange={(e) => setPersonalInfo(prev => ({ ...prev, telefono: e.target.value }))}
                  placeholder="Ingrese su teléfono"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={personalInfo.email}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Ingrese su email (opcional)"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pais">País *</Label>
                <Select value={personalInfo.pais} onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, pais: value, departamento: "", municipio: "", zona: "" }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione país" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLocationLoading ? (
                      <SelectItem value="loading" disabled>Cargando...</SelectItem>
                    ) : (
                      locationData?.countries.map((country) => (
                        <SelectItem key={country.id} value={country.id.toString()}>
                          {country.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="departamento">Departamento *</Label>
                <Select 
                  value={personalInfo.departamento} 
                  onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, departamento: value, municipio: "", zona: "" }))}
                  disabled={!personalInfo.pais}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredDepartments().map((dept) => (
                      <SelectItem key={dept.id} value={dept.id.toString()}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="municipio">Municipio *</Label>
                <Select 
                  value={personalInfo.municipio} 
                  onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, municipio: value, zona: "" }))}
                  disabled={!personalInfo.departamento}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione municipio" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredMunicipalities().map((mun) => (
                      <SelectItem key={mun.id} value={mun.id.toString()}>
                        {mun.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="zona">Zona *</Label>
                <Select 
                  value={personalInfo.zona} 
                  onValueChange={(value) => setPersonalInfo(prev => ({ ...prev, zona: value }))}
                  disabled={!personalInfo.municipio}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione zona" />
                  </SelectTrigger>
                  <SelectContent>
                    {getFilteredZones().map((zone) => (
                      <SelectItem key={zone.id} value={zone.id.toString()}>
                        {zone.name} (${zone.costo})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="direccion">Dirección *</Label>
              <Textarea
                id="direccion"
                value={personalInfo.direccion}
                onChange={(e) => setPersonalInfo(prev => ({ ...prev, direccion: e.target.value }))}
                placeholder="Ingrese su dirección completa"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <Label>Fecha de Instalación *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !installationDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarClock className="mr-2 h-4 w-4" />
                    {installationDate ? format(installationDate, "PPP", { locale: es }) : "Seleccione fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={installationDate}
                    onSelect={setInstallationDate}
                    initialFocus
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="installationTime">Horario de Instalación *</Label>
              <Select value={installationTime} onValueChange={setInstallationTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione horario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Mañana (8:00 - 12:00)</SelectItem>
                  <SelectItem value="afternoon">Tarde (13:00 - 17:00)</SelectItem>
                  <SelectItem value="evening">Noche (18:00 - 20:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Método de Pago *</Label>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1" id="payment1" />
                  <Label htmlFor="payment1">Efectivo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="2" id="payment2" />
                  <Label htmlFor="payment2">Tarjeta de Crédito</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3" id="payment3" />
                  <Label htmlFor="payment3">Transferencia Bancaria</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="comments">Comentarios Adicionales</Label>
              <Textarea
                id="comments"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Agregue cualquier comentario o solicitud especial"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="soliciteQuote"
                  checked={soliciteQuote}
                  onCheckedChange={(checked) => setSoliciteQuote(checked === true)}
                />
                <Label htmlFor="soliciteQuote">Solicitar cotización</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="soliciteOtherService"
                  checked={soliciteOtherService}
                  onCheckedChange={(checked) => setSoliciteOtherService(checked === true)}
                />
                <Label htmlFor="soliciteOtherService">Solicitar otro servicio</Label>
              </div>

              {soliciteOtherService && (
                <div>
                  <Label htmlFor="otherServiceDetail">Detalle del otro servicio</Label>
                  <Textarea
                    id="otherServiceDetail"
                    value={otherServiceDetail}
                    onChange={(e) => setOtherServiceDetail(e.target.value)}
                    placeholder="Describa el otro servicio que necesita"
                  />
                </div>
              )}
            </div>

            <Separator />

            <div className="flex items-center space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onCheckedChange={(checked) => setAcceptTerms(checked === true)}
              />
              <Label htmlFor="acceptTerms">
                Acepto los términos y condiciones *
              </Label>
            </div>

            {/* Summary */}
            <div className="bg-muted p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Resumen de su solicitud:</h3>
              <div className="space-y-1 text-sm">
                <p><strong>Servicio:</strong> {services?.find(s => s.id === selectedService)?.name}</p>
                <p><strong>Categoría:</strong> {categories?.find(c => c.id === selectedCategory)?.name}</p>
                <p><strong>Productos:</strong> {selectedProducts.length} productos seleccionados</p>
                <p><strong>Fecha:</strong> {installationDate ? format(installationDate, "PPP", { locale: es }) : "No seleccionada"}</p>
                <p><strong>Total estimado:</strong> ${selectedProducts.reduce((sum, p) => sum + p.Precio, 0) + (locationData?.zones.find(z => z.id === parseInt(personalInfo.zona))?.costo || 0)}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const stepTitles = [
    "Selección de Servicio",
    "Información Personal",
    "Fecha y Pago",
    "Confirmación"
  ];

  if (showCheckoutSummary && checkoutData) {
    const departmentsData = locationData?.departments.map(dept => ({
      id: dept.id.toString(),
      name: dept.name
    })) || [];

    const municipalitiesData = locationData?.departments.reduce((acc, dept) => {
      acc[dept.id.toString()] = locationData?.municipalities
        .filter(mun => mun.departamentoId === dept.id)
        .map(mun => ({ id: mun.id.toString(), name: mun.name })) || [];
      return acc;
    }, {} as Record<string, Array<{id: string, name: string}>>) || {};

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
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold">Solicitud de Servicio</h1>
          <div className="w-20" />
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {stepTitles.map((title, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                    index + 1 <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1 < currentStep ? <Check className="h-4 w-4" /> : index + 1}
                </div>
                <span className="text-xs mt-1 text-center">{title}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Paso {currentStep} de {stepTitles.length}</CardTitle>
            <CardDescription>{stepTitles[currentStep - 1]}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepContent()}
          </CardContent>
          
          {/* Action Buttons */}
          <div className="flex justify-between p-6 pt-0">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => prev - 1)}
              disabled={currentStep === 1}
            >
              Anterior
            </Button>
            
            {currentStep < stepTitles.length ? (
              <Button
                onClick={handleNextStep}
                disabled={!validateStep(currentStep)}
              >
                Siguiente
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!validateStep(currentStep) || isSubmitting}
              >
                {isSubmitting ? "Procesando..." : "Confirmar Solicitud"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ServicioOnePage;