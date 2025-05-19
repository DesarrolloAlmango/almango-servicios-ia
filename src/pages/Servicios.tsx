import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ShoppingCart, Home, Wind, Droplets, Zap, Package, Truck, Baby, X, MapPin, CalendarClock, UserCheck, CreditCard, Star } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/ServiceCard";
import CartDrawer from "@/components/CartDrawer";
import ServiceCarousel from "@/components/ServiceCarousel";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import PurchaseLocationModal from "@/components/PurchaseLocationModal";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  serviceCategory: string;
  serviceId?: string;
  categoryId?: string;
  productId?: string;
  departmentId?: string;
  locationId?: string;
  textosId?: string | null;
}
interface TarjetaServicio {
  id?: string;
  name: string;
  icon: keyof typeof iconComponents | string;
  url?: string;
}
interface PurchaseLocation {
  storeId: string;
  storeName: string;
  otherLocation?: string;
  serviceId?: string;
  serviceName?: string;
  departmentId?: string;
  departmentName?: string;
  locationId?: string;
  locationName?: string;
  categoryId?: string;
  categoryName?: string;
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
const fallbackServices: TarjetaServicio[] = [{
  id: "elec-1",
  name: "Electricidades",
  icon: "Zap"
}, {
  id: "plum-2",
  name: "Plomería",
  icon: "Droplets"
}, {
  id: "cerr-3",
  name: "Cerrajería",
  icon: "Home"
}, {
  id: "clim-4",
  name: "Climatización",
  icon: "Wind"
}, {
  id: "mudz-5",
  name: "Mudanzas",
  icon: "Truck"
}, {
  id: "paqt-6",
  name: "Paquetería",
  icon: "Package"
}, {
  id: "baby-7",
  name: "Cuidado Infantil",
  icon: "Baby"
}];
const fallbackMudanzaServices: TarjetaServicio[] = [{
  id: "mudz-local-1",
  name: "Mudanza Local",
  icon: "Truck"
}, {
  id: "mudz-inter-2",
  name: "Mudanza Interestatal",
  icon: "Truck"
}, {
  id: "mudz-corp-3",
  name: "Mudanza Corporativa",
  icon: "Package"
}, {
  id: "mudz-embalaje-4",
  name: "Servicio de Embalaje",
  icon: "Package"
}];
const fetchTarjetasServicios = async (): Promise<TarjetaServicio[]> => {
  try {
    const response = await fetch("/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios");
    if (!response.ok) {
      throw new Error("Error al obtener las tarjetas de servicios");
    }
    const data = await response.json();
    console.log("Datos de la API sin procesar:", data);
    const parsedData = JSON.parse(data.SDTTarjetasServiciosJson);
    console.log("Datos de servicios parseados:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};
const fetchTarjetasMudanza = async (): Promise<TarjetaServicio[]> => {
  try {
    const response = await fetch("/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios2");
    if (!response.ok) {
      throw new Error("Error al obtener las tarjetas de servicios de mudanza");
    }
    const data = await response.json();
    console.log("Datos de mudanza sin procesar:", data);
    const parsedData = JSON.parse(data.SDTTarjetasServiciosJson);
    console.log("Datos de servicios de mudanza parseados:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error fetching mudanza services:", error);
    throw error;
  }
};
const Servicios = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    commerceId
  } = useParams();
  const isMobile = useIsMobile();
  const [storeName, setStoreName] = useState<string>("");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [purchaseLocations, setPurchaseLocations] = useState<PurchaseLocation[]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedServiceName, setSelectedServiceName] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const [pendingServiceCardAction, setPendingServiceCardAction] = useState<boolean>(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<{
    serviceId: string;
    locationName: string;
  } | null>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const [highlightedServiceId, setHighlightedServiceId] = useState<string | null>(null);
  const [autoClickTriggered, setAutoClickTriggered] = useState(false);
  const serviceCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const {
    data: services,
    isLoading: isServicesLoading,
    isError: isServicesError
  } = useQuery({
    queryKey: ["tarjetasServicios"],
    queryFn: fetchTarjetasServicios,
    meta: {
      onError: (error: Error) => {
        console.error("Error en la consulta:", error);
        toast.error("No se pudieron cargar los servicios. Mostrando datos locales.");
      }
    }
  });
  const {
    data: mudanzaServices,
    isLoading: isLoadingMudanza,
    isError: isErrorMudanza
  } = useQuery({
    queryKey: ["tarjetasMudanza"],
    queryFn: fetchTarjetasMudanza,
    meta: {
      onError: (error: Error) => {
        console.error("Error en la consulta de mudanzas:", error);
        toast.error("No se pudieron cargar los servicios de mudanza. Mostrando datos locales.");
      }
    }
  });
  useEffect(() => {
    const timer = setTimeout(() => {
      setTitleVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (location.state && location.state.clickedService) {
      toast.success(`Has seleccionado: ${location.state.clickedService}`, {
        duration: 4000,
        position: "top-center"
      });
      const findServiceByName = () => {
        const displayedServices = isServicesError ? fallbackServices : services;
        const displayedMudanzaServices = isErrorMudanza ? fallbackMudanzaServices : mudanzaServices;
        const allServices = [...(displayedServices || []), ...(displayedMudanzaServices || [])];
        const foundService = allServices.find(service => service.name === location.state.clickedService);
        if (foundService && foundService.id) {
          setHighlightedServiceId(foundService.id);
          setAutoClickTriggered(false);
        }
      };
      if (!isServicesLoading && !isLoadingMudanza) {
        findServiceByName();
      }
      window.history.replaceState({}, document.title);
    }
  }, [location.state, services, mudanzaServices, isServicesLoading, isLoadingMudanza, isServicesError, isErrorMudanza]);
  useEffect(() => {
    if (highlightedServiceId && serviceCardRefs.current[highlightedServiceId] && !autoClickTriggered) {
      const timer = setTimeout(() => {
        const serviceCardElement = serviceCardRefs.current[highlightedServiceId];
        if (serviceCardElement) {
          setAutoClickTriggered(true);
          setHighlightedServiceId(null);
          serviceCardElement.click();
          console.log("Auto-clicked on service:", highlightedServiceId);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [highlightedServiceId, autoClickTriggered]);
  useEffect(() => {
    const fetchStoreName = async () => {
      if (commerceId) {
        try {
          const response = await fetch(`/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetStoreDetails?storeId=${commerceId}`);
          if (!response.ok) {
            throw new Error("Error al obtener los detalles del comercio");
          }
          const data = await response.json();
          const storeDetails = JSON.parse(data.StoreDetailsJson);
          setStoreName(storeDetails.name);
          if (services) {
            const initialLocations = services.map(service => ({
              storeId: commerceId,
              storeName: storeDetails.name,
              serviceId: service.id,
              serviceName: service.name,
              departmentId: storeDetails.departmentId,
              departmentName: storeDetails.departmentName,
              locationId: storeDetails.locationId,
              locationName: storeDetails.locationName
            }));
            setPurchaseLocations(initialLocations);
          }
        } catch (error) {
          console.error("Error fetching store details:", error);
        }
      }
    };
    fetchStoreName();
  }, [commerceId, services]);
  const displayedServices = isServicesError ? fallbackServices : services;
  const displayedMudanzaServices = isErrorMudanza ? fallbackMudanzaServices : mudanzaServices;
  const getPurchaseLocationForService = (serviceId: string) => {
    return purchaseLocations.find(location => location.serviceId === serviceId) || null;
  };
  const getAllPurchaseLocations = () => {
    return purchaseLocations;
  };
  useEffect(() => {
    if (location.state && location.state.openCart) {
      setIsCartOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  useEffect(() => {
    if (pendingServiceCardAction && selectedServiceId) {
      const timer = setTimeout(() => {
        setPendingServiceCardAction(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pendingServiceCardAction, selectedServiceId]);
  const handleBackToHome = () => {
    navigate('/');
  };
  const addToCart = (item: CartItem) => {
    const serviceLocation = purchaseLocations.find(loc => loc.serviceId === item.serviceId);
    const itemWithLocation = serviceLocation ? {
      ...item,
      departmentId: serviceLocation.departmentId,
      locationId: serviceLocation.locationId
    } : item;
    setCartItems(prevItems => {
      const filteredItems = prevItems.filter(i => !(i.serviceId === itemWithLocation.serviceId && i.categoryId === itemWithLocation.categoryId && i.productId === itemWithLocation.productId));
      if (itemWithLocation.quantity > 0) {
        return [...filteredItems, itemWithLocation];
      }
      return filteredItems;
    });
  };
  const updateCartItem = (id: string, quantity: number) => {
    setCartItems(prevItems => prevItems.map(item => item.id === id ? {
      ...item,
      quantity: Math.max(0, quantity)
    } : item).filter(item => item.quantity > 0));
  };
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };
  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };
  const handleServiceCardClick = (serviceId: string | undefined, serviceName: string) => {
    if (!serviceId) return false;
    if (commerceId) {
      const existingLocation = purchaseLocations.find(loc => loc.serviceId === serviceId && loc.departmentId && loc.locationId);
      if (existingLocation) {
        return true;
      } else {
        setSelectedServiceId(serviceId);
        setSelectedServiceName(serviceName);
        setIsLocationModalOpen(true);
        return false;
      }
    }
    if (isLocationModalOpen) {
      return false;
    }
    const existingLocation = purchaseLocations.find(loc => loc.serviceId === serviceId);
    if (existingLocation) {
      return true;
    } else {
      setSelectedServiceId(serviceId);
      setSelectedServiceName(serviceName);
      setIsLocationModalOpen(true);
      return false;
    }
  };
  const handleCategorySelect = (serviceId: string, categoryId: string, categoryName: string) => {
    setSelectedServiceId(serviceId);
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    const service = [...(displayedServices || []), ...(displayedMudanzaServices || [])].find(s => s.id === serviceId);
    if (service) {
      setSelectedServiceName(service.name);
    }
    const existingLocation = purchaseLocations.find(loc => loc.serviceId === serviceId && loc.departmentId && loc.locationId);
    if (existingLocation) {
      setPurchaseLocations(prev => {
        return prev.map(loc => {
          if (loc.serviceId === serviceId) {
            return {
              ...loc,
              categoryId: categoryId,
              categoryName: categoryName
            };
          }
          return loc;
        });
      });
      setPendingServiceCardAction(true);
    } else {
      setIsLocationModalOpen(true);
    }
  };
  const handleLocationSelect = (storeId: string, storeName: string, departmentId: string, departmentName: string, locationId: string, locationName: string, otherLocation?: string) => {
    if (selectedServiceId && selectedServiceName) {
      const newLocation: PurchaseLocation = {
        storeId,
        storeName,
        otherLocation,
        serviceId: selectedServiceId,
        serviceName: selectedServiceName,
        departmentId,
        departmentName,
        locationId,
        locationName,
        categoryId: selectedCategoryId || undefined,
        categoryName: selectedCategoryName || undefined
      };
      const existingLocation = purchaseLocations.find(loc => loc.serviceId === selectedServiceId);
      setPurchaseLocations(prev => {
        if (existingLocation) {
          return prev.map(loc => loc.serviceId === selectedServiceId ? {
            ...newLocation
          } : loc);
        } else {
          return [...prev, newLocation];
        }
      });
      setIsLocationModalOpen(false);
      let successMessage = "";
      if (selectedCategoryId && selectedCategoryName) {
        successMessage = `Lugar ${commerceId ? "de servicio" : "de compra"} registrado para ${selectedServiceName} - ${selectedCategoryName}`;
      } else {
        successMessage = `Lugar ${commerceId ? "de servicio" : "de compra"} registrado para ${selectedServiceName}`;
      }
      toast.success(successMessage);
      if (selectedCategoryId) {
        setPendingServiceCardAction(true);
      }
    }
  };
  const clearPurchaseLocation = (serviceId: string, categoryId?: string) => {
    if (commerceId) return;
    const locationsToRemove = categoryId ? purchaseLocations.filter(loc => loc.serviceId === serviceId && loc.categoryId === categoryId) : purchaseLocations.filter(loc => loc.serviceId === serviceId);
    if (locationsToRemove.length === 0) return;
    const hasAssociatedItems = cartItems.some(item => {
      if (categoryId) {
        return item.serviceId === serviceId && item.categoryId === categoryId;
      }
      return item.serviceId === serviceId;
    });
    if (hasAssociatedItems) {
      const location = locationsToRemove[0];
      setLocationToDelete({
        serviceId,
        locationName: location.storeId === "other" ? location.otherLocation! : location.storeName
      });
      setShowDeleteConfirmation(true);
    } else {
      if (categoryId) {
        setPurchaseLocations(prev => prev.filter(loc => !(loc.serviceId === serviceId && loc.categoryId === categoryId)));
      } else {
        setPurchaseLocations(prev => prev.filter(loc => loc.serviceId !== serviceId));
      }
      toast.success("Lugar de compra eliminado");
    }
  };
  const confirmDeleteLocation = () => {
    if (!locationToDelete) return;
    setCartItems(prev => prev.filter(item => item.serviceId !== locationToDelete.serviceId));
    setPurchaseLocations(prev => prev.filter(loc => loc.serviceId !== locationToDelete.serviceId));
    setShowDeleteConfirmation(false);
    setLocationToDelete(null);
    toast.success("Lugar de compra y productos asociados eliminados");
  };
  if (isServicesLoading && isLoadingMudanza) {
    return <div className="min-h-screen flex flex-col">
        <div className="absolute inset-0 z-0 bg-[#14162c]">
          <div className="absolute inset-0 z-1" style={{
          background: "radial-gradient(circle at 20% 30%, #008be1 0%, transparent 40%), radial-gradient(circle at 80% 70%, #ff6900 0%, transparent 40%), radial-gradient(circle at 50% 50%, #0EA5E9 0%, transparent 30%)",
          opacity: 0.8
        }}></div>
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#14162c] to-transparent z-2"></div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#14162c] to-transparent z-2"></div>
        </div>
        <main className="flex-grow py-8 px-4 relative z-10 servicios-page">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8 mt-4">
              <Button variant="ghost" onClick={handleBackToHome} className="flex items-center gap-2 hover:text-gray-300 text-white">
                <ArrowLeft size={20} />
                <span>Volver</span>
              </Button>
              
              <div className="relative cursor-pointer" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart size={24} className="text-white" />
                {getCartItemsCount() > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemsCount()}
                  </span>}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-[#008be1] uppercase font-display opacity-0 transition-opacity duration-500">
              Nuestros Servicios
            </h1>
            
            <div className="flex justify-center items-center h-64 gap-6">
              <div className="w-[220px] h-[220px]">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
              <div className="w-[220px] h-[220px]">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
              <div className="w-[220px] h-[220px]">
                <Skeleton className="w-full h-full rounded-full" />
              </div>
            </div>
          </div>
        </main>
      </div>;
  }
  return <div className="min-h-screen flex flex-col relative">
      {/* Split background color - adjusted for mobile devices */}
      <div className="absolute inset-0 z-0">
        {/* Top half - natural grayish color - smaller for mobile */}
        <div className={`absolute inset-x-0 top-0 ${isMobile ? 'h-[67%]' : 'h-[53%]'} bg-[#F8F4F0]`}></div>
        {/* Bottom half - orange color - starts lower for mobile */}
        <div className={`absolute inset-x-0 bottom-0 ${isMobile ? 'h-[33%]' : 'h-[47%]'} bg-[#f06900]`}></div>
      </div>
      
      <main className="flex-grow py-8 px-4 relative z-10 servicios-page">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8 mt-4">
            <Button variant="ghost" onClick={handleBackToHome} className="flex items-center gap-2 text-gray-800">
              <ArrowLeft size={20} />
              <span>Volver</span>
            </Button>
            
            <div className="relative cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={40} className="text-gray-800" />
              {getCartItemsCount() > 0 && <span className="absolute -top-2 -right-2 bg-primary text-white text-sm rounded-full h-6 w-6 flex items-center justify-center border-2 border-[#FDE1D3]">
                  {getCartItemsCount()}
                </span>}
            </div>
          </div>
          
          {/* ¿CÓMO CONTRATAR? Section - Added from Home page */}
          <div className="py-10 px-4 bg-[#F8F4F0] rounded-lg mb-12">
            <h2 className="text-3xl font-bold mb-4 text-center uppercase text-[#f06900]">¿CÓMO CONTRATAR?</h2>
            <h3 className="text-xl font-medium mb-10 text-center text-[#498bdd]">PROCESO DE CONTRATACIÓN</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
              <div className="text-center flex flex-col items-center opacity-100">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110">
                  <div className="bg-[#F8F4F0] p-4 rounded-full shadow-md">
                    <CalendarClock size={48} className="text-[#f06900]" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-[#498bdd]">Agendá fecha y hora</h4>
                <p className="text-gray-700">Coordinación inmediata.</p>
              </div>
              
              <div className="text-center flex flex-col items-center opacity-100">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110">
                  <div className="bg-[#F8F4F0] p-4 rounded-full shadow-md">
                    <UserCheck size={48} className="text-[#f06900]" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-[#498bdd]">Recibí al técnico</h4>
                <p className="text-gray-700">Un profesional calificado realizará el trabajo.</p>
              </div>
              
              <div className="text-center flex flex-col items-center opacity-100">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110">
                  <div className="bg-[#F8F4F0] p-4 rounded-full shadow-md">
                    <CreditCard size={48} className="text-[#f06900]" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-[#498bdd]">Realizá el pago al finalizar</h4>
                <p className="text-gray-700">Elegí cómo querés pagar. Online hasta 12 cuotas, o directo al Profesional al finalizar.</p>
              </div>
              
              <div className="text-center flex flex-col items-center opacity-100">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110">
                  <div className="bg-[#F8F4F0] p-4 rounded-full shadow-md">
                    <Star size={48} className="text-[#f06900]" />
                  </div>
                </div>
                <h4 className="text-lg font-semibold mb-2 text-[#498bdd]">Ayudanos a mejorar</h4>
                <p className="text-gray-700">Calificá el servicio, tus comentarios importan.</p>
              </div>
            </div>
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-bold mb-12 text-center uppercase font-display transition-all duration-1000 transform ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="text-gray-800 text-5xl">NUESTROS SERVICIOS</span>
          </h1>
          
          {isServicesError && <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md">
              <p className="text-amber-700">
                No se pudieron obtener los servicios del servidor. Mostrando información local.
              </p>
            </div>}
          
          {commerceId && storeName && <div className="mb-6 bg-white/70 p-3 rounded-lg border border-gray-300">
              <h3 className="font-medium text-gray-800 mb-2">Lugar de compra fijo:</h3>
              <div className="flex items-center gap-2">
                <MapPin className="text-gray-800" size={16} />
                <span className="text-gray-700">{storeName}</span>
              </div>
            </div>}
          
          {!commerceId && purchaseLocations.length > 0 && <div className="mb-6 bg-white/70 p-3 rounded-lg border border-gray-300">
              <h3 className="font-medium text-gray-800 mb-2">Lugares de compra registrados:</h3>
              <div className="space-y-2">
                {Object.values(purchaseLocations.reduce((grouped, location) => {
              if (!location.serviceId || !location.serviceName) return grouped;
              if (!grouped[location.serviceId]) {
                grouped[location.serviceId] = {
                  serviceId: location.serviceId,
                  serviceName: location.serviceName,
                  locations: []
                };
              }
              grouped[location.serviceId].locations.push(location);
              return grouped;
            }, {} as Record<string, {
              serviceId: string;
              serviceName: string;
              locations: PurchaseLocation[];
            }>)).map((serviceGroup, index) => <div key={index} className="text-sm">
                    <div className="font-medium text-gray-800">{serviceGroup.serviceName}:</div>
                    {serviceGroup.locations.map((location, locIndex) => <div key={locIndex} className="flex items-center ml-4 mt-1 text-gray-700">
                        <span>
                          {location.storeId === "other" ? location.otherLocation : location.storeName}
                          {location.departmentName && location.locationName && <span className="text-gray-600">
                              ({location.departmentName}, {location.locationName})
                            </span>}
                        </span>
                        <Button variant="ghost" size="sm" onClick={() => clearPurchaseLocation(location.serviceId || "", location.categoryId)} className="h-5 w-5 p-0 text-gray-600 hover:bg-gray-200 ml-1">
                          <X size={12} />
                        </Button>
                      </div>)}
                  </div>)}
              </div>
            </div>}
          
          <div id="armado-instalacion" className="mb-12 relative">
            <ServiceCarousel primaryTitlePart="ARMADO" secondaryTitlePart=" E INSTALACIÓN" titleClassName="font-bold">
              {isServicesLoading ? Array(4).fill(0).map((_, index) => <div key={index} className="w-[220px] h-[220px]">
                    <Skeleton className="w-full h-full rounded-full" />
                  </div>) : displayedServices?.map((service, index) => {
              const isIconKey = Object.keys(iconComponents).includes(service.icon as string);
              const isHighlighted = service.id === highlightedServiceId;
              return <ServiceCard key={index} id={service.id} name={service.name} iconComponent={isIconKey ? iconComponents[service.icon as keyof typeof iconComponents] : Home} icon={!isIconKey ? service.icon : undefined} addToCart={addToCart} externalUrl={service.url} onCategorySelect={handleCategorySelect} purchaseLocation={getPurchaseLocationForService(service.id || "")} forceOpen={pendingServiceCardAction && selectedServiceId === service.id} circular={true} currentCartItems={cartItems} className={isHighlighted ? "ring-4 ring-primary ring-offset-4 ring-offset-[#F8F4F0]" : ""} ref={element => {
                if (service.id) {
                  serviceCardRefs.current[service.id] = element;
                }
              }} />;
            })}
            </ServiceCarousel>
          </div>
          
          {/* Add a subtle separator line between carousels */}
          <div className="flex justify-center mb-12">
            <Separator className="w-4/5 bg-gray-300 opacity-60" />
          </div>
          
          <div className="mb-12">
            <ServiceCarousel primaryTitlePart="FLETES Y" secondaryTitlePart=" MUDANZAS" showLoadingNames={false} loadingItems={[]} lightTitle={true}>
              {isLoadingMudanza ? Array(4).fill(0).map((_, index) => <div key={index} className="w-[220px] h-[220px]">
                    <Skeleton className="w-full h-full rounded-full" />
                  </div>) : displayedMudanzaServices?.map((service, index) => {
              const isIconKey = Object.keys(iconComponents).includes(service.icon as string);
              const isHighlighted = service.id === highlightedServiceId;
              return <ServiceCard key={index} id={service.id} name={service.name} iconComponent={isIconKey ? iconComponents[service.icon as keyof typeof iconComponents] : Truck} icon={!isIconKey ? service.icon : undefined} addToCart={addToCart} externalUrl={service.url} onCategorySelect={handleCategorySelect} purchaseLocation={getPurchaseLocationForService(service.id || "")} forceOpen={pendingServiceCardAction && selectedServiceId === service.id} circular={true} currentCartItems={cartItems} className={isHighlighted ? "ring-4 ring-primary ring-offset-4 ring-offset-[#f06900]" : ""} ref={element => {
                if (service.id) {
                  serviceCardRefs.current[service.id] = element;
                }
              }} />;
            })}
            </ServiceCarousel>
          </div>
        </div>
        
        <CartDrawer isOpen={isCartOpen} setIsOpen={setIsCartOpen} cartItems={cartItems} updateCartItem={updateCartItem} total={getCartTotal()} purchaseLocations={getAllPurchaseLocations()} setPurchaseLocations={setPurchaseLocations} />
        
        <PurchaseLocationModal isOpen={isLocationModalOpen} onClose={() => {
        setIsLocationModalOpen(false);
        if (pendingServiceCardAction) {
          setPendingServiceCardAction(false);
        }
      }} onSelectLocation={handleLocationSelect} serviceName={`${selectedServiceName || ""} - ${selectedCategoryName || ""}`} commerceId={commerceId} commerceName={storeName} />
      </main>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lugar de compra?</AlertDialogTitle>
            <AlertDialogDescription>
              {locationToDelete && <>
                  Al eliminar el lugar de compra "{locationToDelete.locationName}", 
                  también se eliminarán todos los productos asociados del carrito. 
                  ¿Desea continuar?
                </>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
            setShowDeleteConfirmation(false);
            setLocationToDelete(null);
          }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLocation}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style>{`
        /* Add custom styling for section titles */
        .servicios-page h2 {
          position: relative;
          z-index: 10;
          font-size: 1.75rem;
          font-weight: 600;
        }
        
        /* Style for ARMADO E INSTALACIÓN title */
        #armado-instalacion h2 {
          color: #333333;
        }
        
        /* Style for FLETES Y MUDANZAS title - on orange background */
        #armado-instalacion + div + div h2 {
          color: white;
          font-weight: 600;
        }

        @media (min-width: 640px) and (max-width: 1023px) {
          .grid-cols-2 > div:nth-child(odd):last-child {
            grid-column: 1 / span 2;
            justify-self: center;
          }
        }
        
        @media (min-width: 1024px) {
          .grid-cols-3 > div:nth-last-child(1):nth-child(3n-1),
          .grid-cols-3 > div:nth-last-child(2):nth-child(3n-1) {
            margin-left: calc(100% / 3);
          }
          
          .grid-cols-3 > div:nth-last-child(1):nth-child(3n-2) {
            margin-left: calc(100% / 3);
          }
        }
      `}</style>
    </div>;
};
export default Servicios;