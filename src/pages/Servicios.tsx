
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";
import CartDrawer from "@/components/CartDrawer";
import { toast } from "sonner";
import ServiceCarousel from "@/components/ServiceCarousel";
import { useServiceCards } from "@/hooks/useServiceCards";

export interface CartItem {
  serviceId: string;
  serviceName: string;
  categoryId: string;
  categoryName: string;
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  purchaseLocationId?: string;
  purchaseLocationName?: string;
}

const Servicios = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const { services: installationServices, isLoading: isLoadingInstallation } = useServiceCards();
  const { services: movingServices, isLoading: isLoadingMoving } = useServiceCards("2");
  
  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existingItem = prev.find(i => 
        i.serviceId === item.serviceId && 
        i.categoryId === item.categoryId && 
        i.productId === item.productId
      );
      
      if (existingItem) {
        return prev.map(i => 
          i.serviceId === item.serviceId && 
          i.categoryId === item.categoryId && 
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        return [...prev, item];
      }
    });
    
    toast.success(`${item.productName} agregado al carrito`, {
      description: `Cantidad: ${item.quantity}`,
      action: {
        label: "Ver carrito",
        onClick: () => setIsCartOpen(true)
      }
    });
  };
  
  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };
  
  const updateCartItemQuantity = (index: number, quantity: number) => {
    setCart(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, quantity } : item
      )
    );
  };
  
  const clearCart = () => {
    setCart([]);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header cartItemCount={cart.length} onCartClick={() => setIsCartOpen(true)} />
      
      <main className="flex-grow">
        <section className="py-12 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h1 className="text-3xl font-bold mb-8 text-center text-secondary uppercase font-display">
              Nuestros Servicios
            </h1>
            
            <div className="max-w-4xl mx-auto mb-12">
              <p className="text-lg text-gray-600 text-center">
                Disponemos de una amplia variedad de servicios para el hogar y oficina. Nuestros profesionales están capacitados para brindarle soluciones de calidad.
              </p>
            </div>
            
            {/* Servicios de Armado e Instalación Carousel */}
            {!isLoadingInstallation && installationServices.length > 0 && (
              <ServiceCarousel 
                title="Servicios de Armado e Instalación" 
                services={installationServices}
                addToCart={addToCart}
              />
            )}
            
            {/* Servicios de Mudanza Carousel */}
            {!isLoadingMoving && movingServices.length > 0 && (
              <ServiceCarousel 
                title="Servicios de Mudanza" 
                services={movingServices}
                addToCart={addToCart}
                endpointSuffix="2"
              />
            )}
            
            <div className="text-center mt-12">
              <Button 
                className="bg-primary hover:bg-primary/90" 
                onClick={() => setIsCartOpen(true)}
              >
                Ver Carrito ({cart.reduce((sum, item) => sum + item.quantity, 0)} items)
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <CartDrawer 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        cart={cart}
        removeFromCart={removeFromCart}
        updateQuantity={updateCartItemQuantity}
        clearCart={clearCart}
      />
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Servicios;
