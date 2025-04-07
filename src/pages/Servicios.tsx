
import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Home, Wind, Droplets, Zap, Package, Truck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ServiceCard from "@/components/ServiceCard";
import CartDrawer from "@/components/CartDrawer";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  serviceCategory: string;
}

const Servicios = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (location.state && location.state.openCart) {
      setIsCartOpen(true);
      window.history.replaceState({}, document.title);
    }

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
              <ShoppingCart size={24} /> {/* Increased size from 20 to 24 */}
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold mb-12 text-center text-gray-300 uppercase font-display">Nuestros Servicios</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {[
              { name: "Armado de Muebles", icon: Package },
              { name: "Aire Libre", icon: Wind },
              { name: "Decohogar", icon: Home },
              { name: "Equipo Sanitario, Baño y Cocina", icon: Droplets },
              { name: "Instalación de Electrodomésticos", icon: Zap },
              { name: "Aire Acondicionado", icon: Wind },
              { name: "Mudanza", icon: Truck, url: "http://localhost/AlmangoXV1NETFramework/mudanza.aspx?Mode=UPD&MudanzaId=0&ProveedorId=0&SecUserId=0" }
            ].map((service, index) => (
              <div 
                key={index}
                className={`transition-all duration-700 transform ${
                  index < 3 || scrollY > 100 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'
                }`}
              >
                <ServiceCard 
                  name={service.name} 
                  iconComponent={service.icon} 
                  addToCart={addToCart}
                  externalUrl={service.url}
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
        />
      </main>
    </div>
  );
};

export default Servicios;
