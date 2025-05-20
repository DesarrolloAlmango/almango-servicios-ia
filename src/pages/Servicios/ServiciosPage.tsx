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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Refs
  const serviceCardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pendingCategoryAutoClickRef = useRef<boolean>(false);
  const pendingProductFetchRef = useRef<boolean>(false);

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

  // Modified effect to handle pending category auto-click and product loading
  useEffect(() => {
    if (pendingProductFetchRef.current && selectedServiceId && selectedCategoryId) {
      console.log("Initiating automatic product fetch:", {
        serviceId: selectedServiceId,
        categoryId: selectedCategoryId,
      });
      
      // Reset the flag
      pendingProductFetchRef.current = false;
      
      // Find the service location for the selected service
      const serviceLocation = purchaseLocations.find(loc => loc.serviceId === selectedServiceId);
      
      if (serviceLocation?.departmentId && serviceLocation?.locationId) {
        console.log("Found location info, proceeding with product fetch:", {
          serviceId: selectedServiceId,
          categoryId: selectedCategoryId,
          locationId: serviceLocation.locationId,
          departmentId: serviceLocation.departmentId
        });
        
        // Set loading state
        setIsLoadingProducts(true);
        
        // Direct API call to fetch products with prices
        fetch(`/api/AlmangoXV1NETFramework/WebAPI/ObtenerNivel2?Nivel0=${selectedServiceId}&Nivel1=${selectedCategoryId}`)
          .then(response => response.json())
          .then(products => {
            console.log(`Fetched ${products.length} products for category ${selectedCategoryId}`);
            
            if (products.length > 0) {
              // For each product, fetch its price
              const pricePromises = products.map(product => 
                fetch(`/api/AlmangoXV1NETFramework/WebAPI/ObtenerPrecio?DepartamentoId=${serviceLocation.departmentId}&LocalidadId=${serviceLocation.locationId}&ArticuloId=${product.id}`)
                  .then(res => res.json())
                  .then(priceData => ({
                    ...product,
                    price: priceData.price || 0
                  }))
              );
              
              // Wait for all price fetch operations to complete
              return Promise.all(pricePromises);
            }
            return products;
          })
          .then(productsWithPrices => {
            console.log("Products with prices loaded:", productsWithPrices);
            // Here you would update your state with the products
            // This could be dispatching an event or updating local state
            
            // Fire an event with the products data for ServiceCard to consume
            const productLoadedEvent = new CustomEvent('productsLoaded', {
              detail: {
                serviceId: selectedServiceId,
                categoryId: selectedCategoryId,
                products: productsWithPrices
              }
            });
            document.dispatchEvent(productLoadedEvent);
            
            toast.success(`Productos cargados para ${selectedCategoryName || 'la categoría seleccionada'}`);
          })
          .catch(error => {
            console.error("Error fetching products or prices:", error);
            toast.error("Error al cargar los productos. Intente nuevamente.");
          })
          .finally(() => {
            setIsLoadingProducts(false);
          });
      }
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
  
  // Modified to handle the new flow
  const handleCategorySelect = (serviceId: string, categoryId: string, categoryName: string) => {
    setSelectedServiceId(serviceId);
    setSelectedCategoryId(categoryId);
    setSelectedCategoryName(categoryName);
    
    const service = [...(displayedServices || []), ...(displayedMudanzaServices || [])].find(s => s.id === serviceId);
    if (service) {
      setSelectedServiceName(service.name);
    }
    
    // Check if there's an existing purchase location with department and location IDs
    const existingLocation = purchaseLocations.find(
      loc => loc.serviceId === serviceId && loc.departmentId && loc.locationId
    );
    
    if (existingLocation) {
      console.log("Location already exists, updating with category and proceeding to fetch products:", {
        serviceId,
        categoryId,
        categoryName,
        location: existingLocation
      });
      
      // Update the existing location with the new category info
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
      
      // Set the pending product fetch flag to trigger the automatic product loading
      pendingProductFetchRef.current = true;
    } else {
      console.log("No location found, opening location modal for:", {
        serviceId,
        categoryId,
        categoryName
      });
      
      // No existing location, open the modal to select a location
      setIsLocationModalOpen(true);
    }
  };
  
  // Modified to handle automatic product loading after location selection
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
        // If a category was already selected, trigger automatic product loading
        pendingProductFetchRef.current = true;
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

  // Add state for product modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [productModalDetails, setProductModalDetails] = useState<{
    serviceId: string;
    categoryId: string;
    categoryName: string;
    products: any[];
    prices: Record<string, number>;
  } | null>(null);

  // Add new effect to listen for showProductsModal events
  useEffect(() => {
    const handleShowProductsModal = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { serviceId, categoryId, categoryName, products, prices, triggerImmediately } = customEvent.detail;
        console.log("Received showProductsModal event:", { serviceId, categoryId, categoryName, productCount: products?.length });
        
        // Set the product modal details
        setProductModalDetails({
          serviceId,
          categoryId,
          categoryName: categoryName || "Productos",
          products: products || [],
          prices: prices || {}
        });
        
        // Open the modal immediately if triggered from location selection
        if (triggerImmediately) {
          console.log("Opening product modal immediately");
          setIsProductModalOpen(true);
        }
      }
    };
    
    document.addEventListener('showProductsModal', handleShowProductsModal);
    
    return () => {
      document.removeEventListener('showProductsModal', handleShowProductsModal);
    };
  }, []);

  // Product modal rendering
  const renderProductModal = () => {
    if (!productModalDetails) return null;
    
    return (
      <Dialog open={isProductModalOpen} onOpenChange={setIsProductModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {productModalDetails.categoryName}
            </DialogTitle>
            <DialogDescription>
              Selecciona los productos que deseas añadir al carrito
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {productModalDetails.products.length > 0 ? (
              <div className="space-y-4">
                {productModalDetails.products.map((product) => {
                  const productId = product.Nivel2?.toString();
                  const productName = product.Nivel2Descripcion?.toString();
                  const price = productModalDetails.prices[productId] || 0;
                  
                  if (!productId || !productName) return null;
                  
                  return (
                    <div key={productId} className="flex justify-between items-center p-3 border rounded-md">
                      <div>
                        <p className="font-medium">{productName}</p>
                        <p className="text-sm text-muted-foreground">
                          ${price.toLocaleString('es-UY', { minimumFractionDigits: 0 })}
                        </p>
                      </div>
                      <button 
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded text-sm"
                        onClick={() => {
                          // Add to cart
                          const newItem: CartItem = {
                            id: `${productModalDetails.serviceId}-${productModalDetails.categoryId}-${productId}`,
                            serviceId: productModalDetails.serviceId,
                            categoryId: productModalDetails.categoryId,
                            productId: productId,
                            name: productName,
                            price: price,
                            quantity: 1
                          };
                          addToCart(newItem);
                          toast.success(`${productName} añadido al carrito`);
                        }}
                      >
                        Agregar
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center py-4 text-muted-foreground">
                No hay productos disponibles para esta categoría
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
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
          
          {/* Store information for commerce ID or selected service */}
          <StoreInfo 
            commerceId={commerceId} 
            storeName={storeName} 
            selectedService={selectedServiceId ? { 
              id: selectedServiceId, 
              name: selectedServiceName || "" 
            } : undefined}
            selectedCategory={selectedCategoryId ? {
              id: selectedCategoryId,
              name: selectedCategoryName || ""
            } : undefined}
            isLoadingProducts={isLoadingProducts}
          />
          
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
          serviceId={selectedServiceId}
          categoryId={selectedCategoryId}
          categoryName={selectedCategoryName}
        />
        
        {/* Product modal - Nuevo modal para mostrar productos tras seleccionar ubicación */}
        {renderProductModal()}
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
