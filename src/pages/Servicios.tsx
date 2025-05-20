import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, ShoppingCart, Home, Wind, Droplets, Zap, Package, Truck, Baby, X, MapPin } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/ServiceCard";
import CartDrawer from "@/components/CartDrawer";
import ServiceCarousel from "@/components/ServiceCarousel";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import PurchaseLocationModal from "@/components/PurchaseLocationModal";

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
  textosId?: string | null; // Add the textosId property
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
  categoryId?: string;  // Nueva propiedad para almacenar la categoría seleccionada
  categoryName?: string; // Nueva propiedad para almacenar el nombre de la categoría
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

const fallbackServices: TarjetaServicio[] = [
  { id: "elec-1", name: "Electricidades", icon: "Zap" },
  { id: "plum-2", name: "Plomería", icon: "Droplets" },
  { id: "cerr-3", name: "Cerrajería", icon: "Home" },
  { id: "clim-4", name: "Climatización", icon: "Wind" },
  { id: "mudz-5", name: "Mudanzas", icon: "Truck" },
  { id: "paqt-6", name: "Paquetería", icon: "Package" },
  { id: "baby-7", name: "Cuidado Infantil", icon: "Baby" }
];

const fallbackMudanzaServices: TarjetaServicio[] = [
  { id: "mudz-local-1", name: "Mudanza Local", icon: "Truck" },
  { id: "mudz-inter-2", name: "Mudanza Interestatal", icon: "Truck" },
  { id: "mudz-corp-3", name: "Mudanza Corporativa", icon: "Package" },
  { id: "mudz-embalaje-4", name: "Servicio de Embalaje", icon: "Package" }
];

const fetchTarjetasServicios = async (): Promise<TarjetaServicio[]> => {
  try {
    const response = await fetch(
      "/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios"
    );
    
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
    const response = await fetch(
      "/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios2"
    );
    
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
  const { commerceId } = useParams();
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
  const [locationToDelete, setLocationToDelete] = useState<{ serviceId: string, locationName: string } | null>(null);
  const [titleVisible, setTitleVisible] = useState(false);
  const [highlightedServiceId, setHighlightedServiceId] = useState<string | null>(null);
  const [autoClickTriggered, setAutoClickTriggered] = useState(false);
  
  // Create refs to store references to service cards
  const serviceCardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const {
    data: services,
    isLoading: isServicesLoading,
    isError: isServicesError,
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
    isError: isErrorMudanza,
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

  // Basic title animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setTitleVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Effect to display toast message and highlight the clicked service
  useEffect(() => {
    if (location.state && location.state.clickedService) {
      // Show toast with the clicked service name
      toast.success(`Has seleccionado: ${location.state.clickedService}`, {
        duration: 4000,
        position: "top-center"
      });
      
      // Find the service ID by name to highlight the corresponding card
      const findServiceByName = () => {
        const displayedServices = isServicesError ? fallbackServices : services;
        const displayedMudanzaServices = isErrorMudanza ? fallbackMudanzaServices : mudanzaServices;
        
        const allServices = [
          ...(displayedServices || []),
          ...(displayedMudanzaServices || [])
        ];
        
        const foundService = allServices.find(
          service => service.name === location.state.clickedService
        );
        
        if (foundService && foundService.id) {
          setHighlightedServiceId(foundService.id);
          setAutoClickTriggered(false); // Reset this flag for new highlights
          
          // Remove highlight after animation completes
          setTimeout(() => {
            setHighlightedServiceId(null);
          }, 5000);
        }
      };
      
      // Execute after services are loaded
      if (!isServicesLoading && !isLoadingMudanza) {
        findServiceByName();
      }
      
      // Clear the state after displaying the toast
      window.history.replaceState({}, document.title);
    }
  }, [location.state, services, mudanzaServices, isServicesLoading, isLoadingMudanza, isServicesError, isErrorMudanza]);

  // New effect to automatically click on the highlighted service
  useEffect(() => {
    if (highlightedServiceId && serviceCardRefs.current[highlightedServiceId] && !autoClickTriggered) {
      // Add a small delay to ensure the UI is fully rendered
      const timer = setTimeout(() => {
        const serviceCardElement = serviceCardRefs.current[highlightedServiceId];
        if (serviceCardElement) {
          // Mark that we've triggered the auto-click to prevent repeated clicks
          setAutoClickTriggered(true);
          // Trigger a click on the service card
          serviceCardElement.click();
          console.log("Auto-clicked on service:", highlightedServiceId);
        }
      }, 800); // Delay to allow for the highlight effect to be visible
      
      return () => clearTimeout(timer);
    }
  }, [highlightedServiceId, autoClickTriggered]);

  useEffect(() => {
    const fetchStoreName = async () => {
      if (commerceId) {
        try {
          const response = await fetch(
            `/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetStoreDetails?storeId=${commerceId}`
          );
          
          if (!response.ok) {
            throw new Error("Error al obtener los detalles del comercio");
          }
          
          const data = await response.json();
          const storeDetails = JSON.parse(data.StoreDetailsJson);
          setStoreName(storeDetails.name);
          
          // Set initial purchase location for all services
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
    // Buscar cualquier ubicación que tenga este serviceId, independientemente de la categoría
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
      const filteredItems = prevItems.filter(i => 
        !(i.serviceId === itemWithLocation.serviceId && 
          i.categoryId === itemWithLocation.categoryId && 
          i.productId === itemWithLocation.productId)
      );
      
      if (itemWithLocation.quantity > 0) {
        return [...filteredItems, itemWithLocation];
      }
      
      return filteredItems;
    });
  };

  const updateCartItem = (id: string, quantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id 
          ? { ...item, quantity: Math.max(0, quantity) } 
          : item
      ).filter(item => item.quantity > 0)
    );
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
      // En comercio fijo, verificamos si ya tenemos información de ubicación
      const existingLocation = purchaseLocations.find(loc => 
        loc.serviceId === serviceId && loc.departmentId && loc.locationId
      );
      
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
    
    // Buscar cualquier ubicación asociada a este servicio, sin importar la categoría
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
    
    // Buscar el servicio seleccionado para obtener su nombre
    const service = [...(displayedServices || []), ...(displayedMudanzaServices || [])]
      .find(s => s.id === serviceId);
    
    if (service) {
      setSelectedServiceName(service.name);
    }
    
    // MODIFICACIÓN: Verificar si este SERVICIO ya tiene una ubicaci��n configurada
    // No importa la categoría, solo verificamos a nivel de servicio
    const existingLocation = purchaseLocations.find(loc => 
      loc.serviceId === serviceId && 
      loc.departmentId && 
      loc.locationId
    );
    
    if (existingLocation) {
      // Si ya tiene ubicación para este servicio, actualizamos la ubicación con la nueva categoría
      setPurchaseLocations(prev => {
        return prev.map(loc => {
          if (loc.serviceId === serviceId) {
            // Actualizar con la categoría actual
            return {
              ...loc,
              categoryId: categoryId,
              categoryName: categoryName
            };
          }
          return loc;
        });
      });
      // Mostramos los productos
      setPendingServiceCardAction(true);
    } else {
      // Si no tiene ubicación, mostramos el modal de ubicación
      setIsLocationModalOpen(true);
    }
  };

  const handleLocationSelect = (
    storeId: string, 
    storeName: string, 
    departmentId: string,
    departmentName: string,
    locationId: string,
    locationName: string,
    otherLocation?: string
  ) => {
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
        // Solo añadimos la información de categoría si está disponible
        categoryId: selectedCategoryId || undefined,
        categoryName: selectedCategoryName || undefined
      };
      
      // Verificar si ya existe alguna ubicación para este servicio
      const existingLocation = purchaseLocations.find(loc => loc.serviceId === selectedServiceId);
      
      // Actualizar o agregar la ubicación
      setPurchaseLocations(prev => {
        if (existingLocation) {
          // Si ya existe, actualizamos los datos manteniendo el mismo servicio
          return prev.map(loc => 
            loc.serviceId === selectedServiceId ? 
            {...newLocation} : loc
          );
        } else {
          // Si no existe, agregamos la nueva ubicación
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
      
      // Mostramos los productos si hay una categoría seleccionada
      if (selectedCategoryId) {
        setPendingServiceCardAction(true);
      }
    }
  };

  const clearPurchaseLocation = (serviceId: string, categoryId?: string) => {
    // If commerceId exists, don't allow location removal
    if (commerceId) return;
    
    const locationsToRemove = categoryId 
      ? purchaseLocations.filter(loc => loc.serviceId === serviceId && loc.categoryId === categoryId)
      : purchaseLocations.filter(loc => loc.serviceId === serviceId);
    
    if (locationsToRemove.length === 0) return;

    // Verificar si hay items en el carrito asociados a este servicio/categoría
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
      // Eliminar ubicaciones sin confirmación si no hay items en el carrito
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

    // Eliminar productos del carrito
    setCartItems(prev => prev.filter(item => item.serviceId !== locationToDelete.serviceId));
    
    // Eliminar ubicación
    setPurchaseLocations(prev => prev.filter(loc => loc.serviceId !== locationToDelete.serviceId));
    
    setShowDeleteConfirmation(false);
    setLocationToDelete(null);
    toast.success("Lugar de compra y productos asociados eliminados");
  };

  if (isServicesLoading && isLoadingMudanza) {
    return (
      <div className="min-h-screen flex flex-col">
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
              <Button 
                variant="ghost" 
                onClick={handleBackToHome}
                className="flex items-center gap-2 hover:text-gray-300 text-white"
              >
                <ArrowLeft size={20} />
                <span>Volver</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="relative hover:text-gray-300 text-white"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={24} />
              </Button>
            </div>
            
            <h1 className="text-3xl font-normal mb-12 text-center text-[#008be1] uppercase font-display opacity-0 transition-opacity duration-500">Nuestros Servicios</h1>
            
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
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Hero-style background with primary colors */}
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
            <Button 
              variant="ghost" 
              onClick={handleBackToHome}
              className="flex items-center gap-2 hover:text-gray-300 text-white"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="relative hover:text-gray-300 text-white"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart size={24} />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Button>
          </div>
          
          <h1 
            className={`text-3xl font-bold mb-12 text-center text-white uppercase font-display transition-all duration-1000 transform ${
              titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Nuestros Servicios
          </h1>
          
          {isServicesError && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md">
              <p className="text-amber-700">
                No se pudieron obtener los servicios del servidor. Mostrando información local.
              </p>
            </div>
          )}
          
          {commerceId && storeName && (
            <div className="mb-6 bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
              <h3 className="font-medium text-blue-300 mb-2">Lugar de compra fijo:</h3>
              <div className="flex items-center gap-2">
                <MapPin className="text-blue-300" size={16} />
                <span className="text-blue-200">{storeName}</span>
              </div>
            </div>
          )}
          
          {!commerceId && purchaseLocations.length > 0 && (
            <div className="mb-6 bg-blue-900/30 p-3 rounded-lg border border-blue-500/30">
              <h3 className="font-medium text-blue-300 mb-2">Lugares de compra registrados:</h3>
              <div className="space-y-2">
                {/* Group purchase locations by service */}
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
                }, {} as Record<string, {serviceId: string, serviceName: string, locations: PurchaseLocation[]}>))
                .map((serviceGroup, index) => (
                  <div key={index} className="text-sm">
                    {/* Service Name with locations underneath */}
                    <div className="font-medium text-blue-300">{serviceGroup.serviceName}:</div>
                    {serviceGroup.locations.map((location, locIndex) => (
                      <div key={locIndex} className="flex items-center ml-4 mt-1 text-blue-200">
                        <span>
                          {location.storeId === "other" ? location.otherLocation : location.storeName}
                          {location.departmentName && location.locationName && (
                            <span className="text-blue-300">
                              ({location.departmentName}, {location.locationName})
                            </span>
                          )}
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => clearPurchaseLocation(location.serviceId || "", location.categoryId)} 
                          className="h-5 w-5 p-0 text-blue-300 hover:bg-blue-800/30 ml-1"
                        >
                          <X size={12} />
                        </Button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-12">
            <ServiceCarousel title="Servicios de Armado e Instalación">
              {isServicesLoading ? (
                // Mostrar skeletons mientras se cargan los servicios
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="w-[220px] h-[220px]">
                    <Skeleton className="w-full h-full rounded-full" />
                  </div>
                ))
              ) : displayedServices?.map((service, index) => {
                const isIconKey = Object.keys(iconComponents).includes(service.icon as string);
                const isHighlighted = service.id === highlightedServiceId;
                
                return (
                  <ServiceCard 
                    key={index}
                    id={service.id}
                    name={service.name} 
                    iconComponent={isIconKey ? iconComponents[service.icon as keyof typeof iconComponents] : Home} 
                    icon={!isIconKey ? service.icon : undefined}
                    addToCart={addToCart}
                    externalUrl={service.url}
                    onCategorySelect={handleCategorySelect}
                    purchaseLocation={getPurchaseLocationForService(service.id || "")}
                    forceOpen={pendingServiceCardAction && selectedServiceId === service.id}
                    circular={true}
                    currentCartItems={cartItems}
                    className={isHighlighted ? "ring-4 ring-primary ring-offset-4 ring-offset-[#14162c] shadow-[0_0_15px_5px_rgba(14,165,233,0.6)] animate-pulse" : ""}
                    ref={element => {
                      if (service.id) {
                        serviceCardRefs.current[service.id] = element;
                      }
                    }}
                  />
                );
              })}
            </ServiceCarousel>
          </div>
          
          <div className="mb-12">
            <ServiceCarousel title="Servicios de Mudanza">
              {isLoadingMudanza ? (
                // Mostrar skeletons mientras se cargan los servicios de mudanza
                Array(4).fill(0).map((_, index) => (
                  <div key={index} className="w-[220px] h-[220px]">
                    <Skeleton className="w-full h-full rounded-full" />
                  </div>
                ))
              ) : displayedMudanzaServices?.map((service, index) => {
                const isIconKey = Object.keys(iconComponents).includes(service.icon as string);
                const isHighlighted = service.id === highlightedServiceId;
                
                return (
                  <ServiceCard 
                    key={index}
                    id={service.id}
                    name={service.name} 
                    iconComponent={isIconKey ? iconComponents[service.icon as keyof typeof iconComponents] : Truck} 
                    icon={!isIconKey ? service.icon : undefined}
                    addToCart={addToCart}
                    externalUrl={service.url}
                    onCategorySelect={handleCategorySelect}
                    purchaseLocation={getPurchaseLocationForService(service.id || "")}
                    forceOpen={pendingServiceCardAction && selectedServiceId === service.id}
                    circular={true}
                    currentCartItems={cartItems}
                    className={isHighlighted ? "ring-4 ring-primary ring-offset-4 ring-offset-[#14162c] shadow-[0_0_15px_5px_rgba(14,165,233,0.6)] animate-pulse" : ""}
                    ref={element => {
                      if (service.id) {
                        serviceCardRefs.current[service.id] = element;
                      }
                    }}
                  />
                );
              })}
            </ServiceCarousel>
          </div>
        </div>
        
        <CartDrawer 
          isOpen={isCartOpen}
          setIsOpen={setIsCartOpen}
          cartItems={cartItems}
          updateCartItem={updateCartItem}
          total={getCartTotal()}
          purchaseLocations={getAllPurchaseLocations()}
          setPurchaseLocations={setPurchaseLocations}
        />
        
        <PurchaseLocationModal 
          isOpen={isLocationModalOpen}
          onClose={() => {
            setIsLocationModalOpen(false);
            if (pendingServiceCardAction) {
              setPendingServiceCardAction(false);
            }
          }}
          onSelectLocation={handleLocationSelect}
          serviceName={`${selectedServiceName || ""} - ${selectedCategoryName || ""}`}
          commerceId={commerceId}
          commerceName={storeName}
        />
      </main>

      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar lugar de compra?</AlertDialogTitle>
            <AlertDialogDescription>
              {locationToDelete && (
                <>
                  Al eliminar el lugar de compra "{locationToDelete.locationName}", 
                  también se eliminarán todos los productos asociados del carrito. 
                  ¿Desea continuar?
                </>
              )}
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

      <style>
        {`
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
        `}
      </style>
    </div>
  );
};

export default Servicios;
