
import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Home, Wind, Droplets, Zap, Package, Truck, Baby, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/ServiceCard";
import CartDrawer from "@/components/CartDrawer";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import PurchaseLocationModal from "@/components/PurchaseLocationModal";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  serviceCategory: string;
}

interface TarjetaServicio {
  id?: string;
  name: string;
  icon: keyof typeof iconComponents;
  url?: string;
}

interface PurchaseLocation {
  storeId: string;
  storeName: string;
  otherLocation?: string;
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

const fetchTarjetasServicios = async (): Promise<TarjetaServicio[]> => {
  try {
    const response = await fetch(
      "/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios"
    );
    
    if (!response.ok) {
      throw new Error("Error al obtener las tarjetas de servicios");
    }
    
    const data = await response.json();
    // console.log("API Response:", data); // Comentado para producción
    return JSON.parse(data.SDTTarjetasServiciosJson);
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

const Servicios = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [purchaseLocation, setPurchaseLocation] = useState<PurchaseLocation | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const {
    data: services,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["tarjetasServicios"],
    queryFn: fetchTarjetasServicios,
    meta: {
      onError: (error: any) => {
        console.error("Error en la consulta:", error);
        toast.error("No se pudieron cargar los servicios. Mostrando datos locales.");
      }
    }
  });

  const displayedServices = isError ? fallbackServices : services;

  useEffect(() => {
    if (location.state && location.state.openCart) {
      setIsCartOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleBackToHome = () => {
    navigate('/');
  };

  const addToCart = (item: CartItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      if (existingItem) {
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: i.quantity + item.quantity } 
            : i
        );
      } else {
        return [...prevItems, item];
      }
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

  const handleServiceCardClick = (serviceId: string | undefined) => {
    if (!serviceId) return;
    
    if (!purchaseLocation) {
      setSelectedServiceId(serviceId);
      setIsLocationModalOpen(true);
    } else {
      return true;
    }
    
    return false;
  };

  const handleLocationSelect = (storeId: string, storeName: string, otherLocation?: string) => {
    setPurchaseLocation({ 
      storeId, 
      storeName, 
      otherLocation 
    });
    setIsLocationModalOpen(false);
    toast.success("Lugar de compra registrado");
  };

  const clearPurchaseLocation = () => {
    setPurchaseLocation(null);
    setSelectedServiceId(null);
  };

  const getPurchaseLocationDisplay = () => {
    if (!purchaseLocation) return undefined;
    
    return purchaseLocation.storeId === "other" 
      ? purchaseLocation.otherLocation 
      : purchaseLocation.storeName;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
        <main className="flex-grow py-8 px-4">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8 mt-4">
              <Button 
                variant="ghost" 
                onClick={handleBackToHome}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span>Volver</span>
              </Button>
              
              <Button 
                variant="ghost" 
                className="relative"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingCart size={24} />
              </Button>
            </div>
            
            <h1 className="text-3xl font-normal mb-12 text-center text-gray-900 uppercase font-display">Nuestros Servicios</h1>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
              {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full max-w-sm" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8 mt-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToHome}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="relative"
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
          
          <h1 className="text-3xl font-normal mb-12 text-center text-gray-900 uppercase font-display">Nuestros Servicios</h1>
          
          {isError && (
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md">
              <p className="text-amber-700">
                No se pudieron obtener los servicios del servidor. Mostrando información local.
              </p>
            </div>
          )}
          
          {purchaseLocation && (
            <div className="mb-6 bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
              <div>
                <span className="font-medium text-blue-700">Lugar de compra: </span>
                <span className="text-blue-600">
                  {purchaseLocation.storeId === "other" 
                    ? purchaseLocation.otherLocation 
                    : purchaseLocation.storeName}
                </span>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearPurchaseLocation} 
                className="text-blue-700 hover:bg-blue-100"
              >
                <X size={16} />
              </Button>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mx-auto max-w-6xl justify-items-center">
            {displayedServices?.map((service, index) => (
              <div key={index} className="w-full max-w-[280px]">
                <ServiceCard 
                  id={service.id}
                  name={service.name} 
                  iconComponent={iconComponents[service.icon]} 
                  addToCart={addToCart}
                  externalUrl={service.url}
                  onBeforeCardClick={() => handleServiceCardClick(service.id)}
                />
              </div>
            ))}
          </div>
        </div>
        
        <CartDrawer 
          isOpen={isCartOpen}
          setIsOpen={setIsCartOpen}
          cartItems={cartItems}
          updateCartItem={updateCartItem}
          total={getCartTotal()}
          purchaseLocation={getPurchaseLocationDisplay()}
        />
        
        <PurchaseLocationModal 
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          onSelectLocation={handleLocationSelect}
        />
      </main>

      <style>
        {`
        @media (min-width: 640px) and (max-width: 1023px) {
          .grid-cols-2 > div:nth-child(odd):last-child {
            grid-column: 1 / span 2;
            justify-self: center;
          }
        }
        
        @media (min-width: 1024px) {
          /* Para la última fila cuando hay solo 2 elementos */
          .grid-cols-3 > div:nth-last-child(1):nth-child(3n-1),
          .grid-cols-3 > div:nth-last-child(2):nth-child(3n-1) {
            margin-left: calc(100% / 3);
          }
          
          /* Para la última fila cuando hay solo 1 elemento */
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
