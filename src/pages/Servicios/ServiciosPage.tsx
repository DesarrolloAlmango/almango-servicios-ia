import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { CartItem, PurchaseLocation } from "./types";
import ServicesList from "./components/ServicesList";
import CartDrawer from "@/components/CartDrawer";
import PurchaseLocationModal from "@/components/PurchaseLocationModal";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import WhatsAppButton from "@/components/WhatsAppButton";
import ServiciosHeader from "./components/ServiciosHeader";
import HowToHireSection from "./components/HowToHireSection";
import { fetchTarjetasServicios, fetchTarjetasMudanza } from "./api/serviciosApi";
import { fallbackServices, fallbackMudanzaServices } from "./data/fallbackData";
import { globalLastSelectedCategory } from "@/components/PurchaseLocationModal";
import ServiciosBackground from "./components/ServiciosBackground";
import ServicesLoadingState from "./components/ServicesLoadingState";
import StoreInfo from "./components/StoreInfo";
import ServiciosStyles from "./components/ServiciosStyles";

const ServiciosPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { commerceId } = useParams();
  
  // State variables
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
  
  // Refs
  const serviceCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pendingCategoryAutoClickRef = useRef<boolean>(false);

  // Queries for services data
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

  // Title animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setTitleVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Handle clicked service from previous page
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

  // Auto-click highlighted service effect
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

  // Handle pending category auto-click
  useEffect(() => {
    if (pendingCategoryAutoClickRef.current && selectedServiceId && selectedCategoryId) {
      console.log("Processing pending category auto-click:", {
        serviceId: selectedServiceId,
        categoryId: selectedCategoryId,
        categoryName: selectedCategoryName
      });

      // Reset the flag
      pendingCategoryAutoClickRef.current = false;

      // Small delay to ensure service card has been clicked
      const timer = setTimeout(() => {
        // Dispatch a direct product fetch
        const serviceLocation = purchaseLocations.find(loc => loc.serviceId === selectedServiceId);
        if (serviceLocation) {
          console.log("Forcing product fetch for:", {
            serviceId: selectedServiceId,
            categoryId: selectedCategoryId
          });

          // Direct API call to fetch products
          fetch(`/api/AlmangoXV1NETFramework/WebAPI/ObtenerNivel2?Nivel0=${selectedServiceId}&Nivel1=${selectedCategoryId}`).then(response => response.json()).then(data => {
            console.log(`Fetched ${data.length} products for category ${selectedCategoryId}`);
          }).catch(error => {
            console.error("Error fetching products:", error);
          });
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [purchaseLocations, selectedServiceId, selectedCategoryId, selectedCategoryName]);

  // Fetch store details if commerceId is provided
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

  // Handle open cart from location state
  useEffect(() => {
    if (location.state && location.state.openCart) {
      setIsCartOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Handle pending service card action
  useEffect(() => {
    if (pendingServiceCardAction && selectedServiceId) {
      const timer = setTimeout(() => {
        setPendingServiceCardAction(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pendingServiceCardAction, selectedServiceId]);

  // Add event listener for category opening
  useEffect(() => {
    const handleOpenCategory = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { serviceId, categoryId, categoryName } = customEvent.detail;
        console.log("Servicios page received openCategory event:", serviceId, categoryId, categoryName);
        
        // Set the selected service and category IDs
        setSelectedServiceId(serviceId);
        setSelectedCategoryId(categoryId);
        setSelectedCategoryName(categoryName);
        
        // Set pending action to trigger the product modal
        setPendingServiceCardAction(true);
        
        // Set flag for auto-click
        pendingCategoryAutoClickRef.current = true;
        
        // Find the service card element
        const serviceCardElement = serviceCardRefs.current[serviceId];
        if (serviceCardElement) {
          // Scroll to and click the service card
          serviceCardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          setTimeout(() => {
            serviceCardElement.click();
            console.log("Auto-clicked on service:", serviceId);
          }, 300);
        }
      }
    };
    
    document.addEventListener('openCategory', handleOpenCategory);
    
    return () => {
      document.removeEventListener('openCategory', handleOpenCategory);
    };
  }, []);

  // Helper functions
  const displayedServices = isServicesError ? fallbackServices : services;
  const displayedMudanzaServices = isErrorMudanza ? fallbackMudanzaServices : mudanzaServices;
  
  const getPurchaseLocationForService = (serviceId: string) => {
    return purchaseLocations.find(location => location.serviceId === serviceId) || null;
  };
  
  const getAllPurchaseLocations = () => {
    return purchaseLocations;
  };
  
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
        categoryId: selectedCategoryId || globalLastSelectedCategory.categoryId || undefined,
        categoryName: selectedCategoryName || globalLastSelectedCategory.categoryName || undefined
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

        // If this is the first time registering this service/category, trigger auto-click
        if (!existingLocation || existingLocation.categoryId !== selectedCategoryId) {
          pendingCategoryAutoClickRef.current = true;
        }
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

  // Loading state
  if (isServicesLoading && isLoadingMudanza) {
    return <ServicesLoadingState />;
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background elements are in ServiciosBackground component */}
      <ServiciosBackground />
      
      {/* Header with back button and cart */}
      <ServiciosHeader 
        handleBackToHome={handleBackToHome}
        getCartItemsCount={getCartItemsCount}
        setIsCartOpen={setIsCartOpen}
      />
      
      <main className="flex-grow py-8 px-4 relative z-10 servicios-page mt-16">
        <div className="container mx-auto">
          {/* How to hire section */}
          <HowToHireSection />
          
          <h1 className={`text-4xl md:text-5xl font-bold mb-12 text-center uppercase font-display transition-all duration-1000 transform ${titleVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            <span className="text-gray-800 text-5xl">NUESTROS SERVICIOS</span>
          </h1>
          
          {isServicesError && <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md">
              <p className="text-amber-700">
                No se pudieron obtener los servicios del servidor. Mostrando información local.
              </p>
            </div>}
          
          {/* Store information for commerce ID */}
          <StoreInfo commerceId={commerceId} storeName={storeName} />
          
          <ServicesList
            services={displayedServices}
            mudanzaServices={displayedMudanzaServices}
            serviceCardRefs={serviceCardRefs}
            handleServiceCardClick={handleServiceCardClick}
            handleCategorySelect={handleCategorySelect}
            getPurchaseLocationForService={getPurchaseLocationForService}
            pendingServiceCardAction={pendingServiceCardAction}
            selectedServiceId={selectedServiceId}
            cartItems={cartItems}
            addToCart={addToCart}
            highlightedServiceId={highlightedServiceId}
          />
        </div>
        
        {/* Cart drawer component */}
        <CartDrawer 
          isOpen={isCartOpen} 
          setIsOpen={setIsCartOpen} 
          cartItems={cartItems} 
          updateCartItem={updateCartItem} 
          total={getCartTotal()} 
          purchaseLocations={getAllPurchaseLocations()} 
          setPurchaseLocations={setPurchaseLocations} 
        />
        
        {/* Purchase location modal */}
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

      {/* Delete confirmation dialog */}
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

      {/* WhatsApp Button */}
      <WhatsAppButton />

      <ServiciosStyles />
    </div>
  );
};

export default ServiciosPage;
