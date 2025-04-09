
import React, { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import CartDrawer from "@/components/CartDrawer";
import { useCartState } from "@/hooks/useCartState";
import { useServicesData } from "@/hooks/useServicesData";
import { iconComponents } from "@/utils/iconMap";
import LoadingState from "@/components/services/LoadingState";
import ServiceGrid from "@/components/services/ServiceGrid";

const Servicios = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  const { 
    cartItems, 
    addToCart, 
    updateCartItem, 
    getCartTotal, 
    getCartItemsCount 
  } = useCartState();
  
  const {
    displayedServices,
    isLoading,
    isError
  } = useServicesData();

  useEffect(() => {
    if (location.state && location.state.openCart) {
      setIsCartOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleBackToHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return <LoadingState handleBackToHome={handleBackToHome} openCart={() => setIsCartOpen(true)} />;
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
          
          <ServiceGrid 
            services={displayedServices} 
            iconComponents={iconComponents} 
            addToCart={addToCart}
            isError={isError}
          />
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
