import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Home, Wind, Droplets, Zap, Package, Truck, Baby } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/ServiceCard";
import CartDrawer from "@/components/CartDrawer";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  serviceCategory: string;
}

interface TarjetaServicio {
  name: string;
  icon: keyof typeof iconComponents;
  url?: string;
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
  { name: "Electricidad", icon: "Zap" },
  { name: "Plomería", icon: "Droplets" },
  { name: "Cerrajería", icon: "Home" },
  { name: "Climatización", icon: "Wind" },
  { name: "Mudanzas", icon: "Truck" },
  { name: "Paquetería", icon: "Package" },
  { name: "Cuidado Infantil", icon: "Baby" }
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

  const {
    data: services,
    isLoading,
    isError,
    error,
  } = useQuery<TarjetaServicio[], Error>({
    queryKey: ["tarjetasServicios"],
    queryFn: fetchTarjetasServicios,
    onError: (err) => {
      console.error("Error en la consulta:", err);
      toast.error("No se pudieron cargar los servicios. Mostrando datos locales.");
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

  const itemsPerRow = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const lastRowItemCount = displayedServices?.length ? displayedServices.length % itemsPerRow : 0;
  const needsCentering = lastRowItemCount > 0 && lastRowItemCount < itemsPerRow;

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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {displayedServices?.map((service, index) => (
              <div key={index} className="opacity-100 translate-y-0">
                <ServiceCard 
                  name={service.name} 
                  iconComponent={iconComponents[service.icon]} 
                  addToCart={addToCart}
                  externalUrl={service.url}
                />
              </div>
            ))}
          </div>
          
          {needsCentering && (
            <style dangerouslySetInnerHTML={{
              __html: `
                @media (min-width: 768px) {
                  .grid > div:nth-last-child(-n+${lastRowItemCount}) {
                    grid-column-start: ${Math.ceil((itemsPerRow - lastRowItemCount) / 2) + 1};
                  }
                }
              `
            }} />
          )}
        </div>
        
        <CartDrawer 
          isOpen={isCartOpen}
          setIsOpen={setIsCartOpen}
          cartItems={cartItems}
          updateCartItem={updateCartItem}
          total={getCartTotal()}
        />
      </main>
    </div>
  );
};

export default Servicios;
