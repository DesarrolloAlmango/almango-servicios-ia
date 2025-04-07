
import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
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

  // Check if we should open the cart from navigation state
  useEffect(() => {
    if (location.state && location.state.openCart) {
      setIsCartOpen(true);
      // Clear the state to prevent reopening on refresh
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

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto">
          {/* Navigation controls */}
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
              <ShoppingCart size={20} />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold mb-12 text-center text-gray-500 uppercase">Nuestros Servicios</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard 
              name="Armado de Muebles" 
              icon="Package" 
              addToCart={addToCart} 
            />
            <ServiceCard 
              name="Aire Libre" 
              icon="Wind" 
              addToCart={addToCart} 
            />
            <ServiceCard 
              name="Decohogar" 
              icon="home" 
              addToCart={addToCart} 
            />
            <ServiceCard 
              name="Equipo Sanitario, Baño y Cocina" 
              icon="Droplets" 
              addToCart={addToCart} 
            />
            <ServiceCard 
              name="Instalación de Electrodomésticos" 
              icon="Zap" 
              addToCart={addToCart} 
            />
            <ServiceCard 
              name="Aire Acondicionado" 
              icon="Wind" 
              addToCart={addToCart} 
            />
            <ServiceCard 
              name="Mudanza" 
              icon="Truck" 
              addToCart={addToCart}
              externalUrl="http://localhost/AlmangoXV1NETFramework/mudanza.aspx?Mode=UPD&MudanzaId=0&ProveedorId=0&SecUserId=0"
            />
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

