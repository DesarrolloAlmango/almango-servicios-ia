import React, { useState, useEffect } from 'react';
import CategoryCarousel from '@/components/CategoryCarousel';
import PurchaseLocationModal from '@/components/PurchaseLocationModal';
import CartDrawer from '@/components/CartDrawer';
import { Button } from "@/components/ui/button"
import { ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  serviceId: string;
  categoryId: string;
  productId: string;
  serviceCategory: string;
  textosId: string | null;
  image: string;
  departmentId?: string;
  locationId?: string;
}

const ServiciosPage: React.FC = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLocationModalOpen, setLocationModalOpen] = useState(false);
  const [isCartOpen, setCartOpen] = useState(false);
  const [total, setTotal] = useState(0);
  const [purchaseLocations, setPurchaseLocations] = useState<any[]>([]);
  const [commerceId, setCommerceId] = useState<string | undefined>(undefined);
  const [commerceName, setCommerceName] = useState<string | undefined>(undefined);
  const [lastSelectedServiceId, setLastSelectedServiceId] = useState<string | undefined>(undefined);
  const [lastSelectedCategoryId, setLastSelectedCategoryId] = useState<string | undefined>(undefined);
  const [lastSelectedCategoryName, setLastSelectedCategoryName] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Calculate the total based on cart items
    const newTotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    setTotal(newTotal);
  }, [cartItems]);

  const addToCart = (item: CartItem) => {
    const existingItemIndex = cartItems.findIndex(cartItem => cartItem.id === item.id);

    if (existingItemIndex !== -1) {
      // If item exists, update the quantity
      const updatedCartItems = [...cartItems];
      updatedCartItems[existingItemIndex].quantity += 1;
      setCartItems(updatedCartItems);
    } else {
      // If item doesn't exist, add it to the cart with quantity 1
      setCartItems([...cartItems, { ...item, quantity: 1 }]);
    }
    toast.success(`${item.name} agregado al carrito`);
  };

  const updateCartItem = (id: string, quantity: number) => {
    const updatedCartItems = cartItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(0, quantity) } : item
    );

    // Filter out items with zero quantity
    const filteredCartItems = updatedCartItems.filter(item => item.quantity > 0);
    setCartItems(filteredCartItems);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    setLastSelectedCategoryId(categoryId);
    setLastSelectedCategoryName(categoryName);
    // For now, we'll use a default service ID since CategoryCarousel expects this format
    setLastSelectedServiceId('1'); // You may need to adjust this based on your actual service logic
    setLocationModalOpen(true);
  };

  const handleLocationSelect = (
    storeId: string, 
    storeName: string, 
    departmentId: string,
    departmentName: string,
    locationId: string,
    locationName: string,
    otherLocation?: string,
    zonaCostoAdicional?: number
  ) => {
    console.log("Location selected with zone cost:", zonaCostoAdicional);
    
    if (lastSelectedServiceId && lastSelectedCategoryId) {
      const newLocation = {
        storeId,
        storeName,
        otherLocation,
        serviceId: lastSelectedServiceId,
        serviceName: lastSelectedCategoryName || "Servicio",
        departmentId,
        departmentName,
        locationId,
        locationName,
        zonaCostoAdicional: zonaCostoAdicional || 0
      };
      
      const existingLocationIndex = purchaseLocations.findIndex(
        loc => loc.serviceId === lastSelectedServiceId
      );
      
      if (existingLocationIndex >= 0) {
        const updatedLocations = [...purchaseLocations];
        updatedLocations[existingLocationIndex] = newLocation;
        setPurchaseLocations(updatedLocations);
      } else {
        setPurchaseLocations([...purchaseLocations, newLocation]);
      }

      // Add zone cost item to cart if applicable
      if (zonaCostoAdicional && zonaCostoAdicional > 0) {
        const zoneCostItem: CartItem = {
          id: `zone-cost-${lastSelectedServiceId}`,
          name: "Adicional por zona",
          price: zonaCostoAdicional,
          quantity: 1,
          serviceId: lastSelectedServiceId,
          categoryId: lastSelectedCategoryId,
          productId: "",
          serviceCategory: "Adicional",
          textosId: null,
          image: "",
          departmentId,
          locationId
        };

        // Remove existing zone cost item for this service if any
        const filteredCartItems = cartItems.filter(item => 
          !(item.name === "Adicional por zona" && item.serviceId === lastSelectedServiceId)
        );
        
        setCartItems([...filteredCartItems, zoneCostItem]);
      } else {
        // Remove zone cost item if zone cost is 0
        const filteredCartItems = cartItems.filter(item => 
          !(item.name === "Adicional por zona" && item.serviceId === lastSelectedServiceId)
        );
        setCartItems(filteredCartItems);
      }
      
      setLocationModalOpen(false);
      toast.success("Ubicación confirmada");
    } else {
      toast.error("Error: No se pudo identificar el servicio seleccionado");
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Nuestros Servicios</h1>
      
      <CategoryCarousel 
        categories={[]} 
        onSelectCategory={handleCategorySelect}
        selectedService={{ id: lastSelectedServiceId, name: "Servicio Seleccionado" }}
        isLoading={false}
      />
      
      {lastSelectedCategoryId && (
        <>
          <h2 className="text-xl font-semibold mt-6 mb-2">
            Productos Destacados para {lastSelectedCategoryName}
          </h2>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Funcionalidad de productos en desarrollo
            </p>
          </div>
        </>
      )}

      <PurchaseLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelectLocation={handleLocationSelect}
        serviceName={lastSelectedCategoryName}
        commerceId={commerceId}
        commerceName={commerceName}
        serviceId={lastSelectedServiceId}
        categoryId={lastSelectedCategoryId}
        categoryName={lastSelectedCategoryName}
      />

      <div className="fixed bottom-4 right-4">
        <Button onClick={() => setCartOpen(true)} className="bg-blue-500 text-white rounded-full p-2 shadow-lg hover:bg-blue-600">
          <ShoppingCart className="h-6 w-6"/>
          <span className="ml-2">Carrito</span>
        </Button>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        setIsOpen={setCartOpen}
        cartItems={cartItems}
        updateCartItem={updateCartItem}
        total={total}
        purchaseLocations={purchaseLocations}
        setPurchaseLocations={setPurchaseLocations}
      />
    </div>
  );
};

export default ServiciosPage;
