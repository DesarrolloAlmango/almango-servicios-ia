
import React, { useState } from "react";
import { LucideIcon } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CartItem } from "@/pages/Servicios";
import CategoryCarousel from "@/components/CategoryCarousel";
import ProductGrid from "@/components/ProductGrid";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ServiceCardProps {
  id?: string;
  name: string;
  iconComponent: LucideIcon;
  icon?: string;
  addToCart: (item: CartItem) => void;
  externalUrl?: string;
  onBeforeCardClick?: () => boolean;
  purchaseLocation?: {
    storeId: string;
    storeName: string;
    otherLocation?: string;
    serviceId?: string;
  } | null;
  forceOpen?: boolean;
}

const CircularServiceCard: React.FC<ServiceCardProps> = ({ 
  id, 
  name, 
  icon,
  addToCart, 
  externalUrl,
  onBeforeCardClick,
  purchaseLocation,
  forceOpen = false
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  React.useEffect(() => {
    if (forceOpen && id) {
      setIsDialogOpen(true);
      fetchCategories(id);
    }
  }, [forceOpen, id]);

  const fetchCategories = async (serviceId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/AlmangoXV1NETFramework/WebAPI/ObtenerNivel1?Nivel0=${serviceId}`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar categorías: ${response.status}`);
      }
      
      const data = await response.json();
      
      const transformedCategories = data.map((category: any) => ({
        id: category.id || category.Nivel1Id,
        name: category.name || category.Nivel1Descripcion,
        image: category.image || category.Imagen || "",
        products: []
      }));
      
      setCategories(transformedCategories);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error("Error al cargar categorías");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async (serviceId: string, categoryId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/AlmangoXV1NETFramework/WebAPI/ObtenerNivel2?Nivel0=${serviceId}&Nivel1=${categoryId}`
      );
      
      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.status}`);
      }
      
      const data = await response.json();
      
      const transformedProducts = data.map((product: any) => ({
        id: product.id || product.Nivel2Id,
        name: product.name || product.Nivel2Descripcion,
        price: product.price ? parseFloat(product.price) : (product.Precio ? parseFloat(product.Precio) : 0),
        image: product.image || product.Imagen || "",
        category: categoryId
      }));
      
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId ? { ...cat, products: transformedProducts } : cat
      ));
      
      const updatedCategory = categories.find(cat => cat.id === categoryId);
      if (updatedCategory) {
        setSelectedCategory({ ...updatedCategory, products: transformedProducts });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      toast.error("Error al cargar productos");
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = () => {
    if (externalUrl) {
      window.location.href = externalUrl;
      return;
    }
    
    if (id) {
      if (onBeforeCardClick) {
        const shouldProceed = onBeforeCardClick();
        if (!shouldProceed) return;
      }
      
      setIsDialogOpen(true);
      if (id) {
        fetchCategories(id);
      }
    }
  };
  
  const handleCategorySelect = (category: any) => {
    if (category.products.length > 0) {
      setSelectedCategory(category);
    } else if (id) {
      fetchProducts(id, category.id);
    }
  };

  const getImageSource = () => {
    if (icon) {
      if (icon.startsWith('data:image')) {
        return icon;
      }
      
      try {
        new URL(icon);
        return icon;
      } catch (e) {
        if (icon.startsWith('data:image')) {
          return icon;
        }
        return `data:image/png;base64,${icon}`;
      }
    }
    
    return "/placeholder.svg";
  };

  const backgroundImage = getImageSource();

  return (
    <>
      <div 
        className="cursor-pointer transition-all transform hover:-translate-y-1 hover:shadow-lg group"
        onClick={handleCardClick}
      >
        <div className="w-28 h-28 sm:w-36 sm:h-36 mx-auto rounded-full overflow-hidden border-2 border-primary shadow-md">
          <div className="w-full h-full relative">
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10" />
            <img 
              src={backgroundImage}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
                setImageError(true);
              }}
            />
          </div>
        </div>
        <p className="mt-3 text-center font-medium text-sm sm:text-base line-clamp-2">{name}</p>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-center uppercase text-orange-500">{name}</h2>
            
            {purchaseLocation && (
              <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
                <span className="font-medium text-blue-700">Lugar de compra: </span>
                <span className="text-blue-600">
                  {purchaseLocation.storeId === "other" 
                    ? purchaseLocation.otherLocation 
                    : purchaseLocation.storeName}
                </span>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
                <p className="font-medium">Error: {error}</p>
                <button 
                  className="mt-2 px-4 py-2 bg-white border border-red-300 rounded-md text-red-600 hover:bg-red-50"
                  onClick={() => id && fetchCategories(id)}
                >
                  Reintentar
                </button>
              </div>
            ) : !selectedCategory ? (
              <CategoryCarousel 
                categories={categories} 
                onSelectCategory={handleCategorySelect} 
              />
            ) : (
              <ProductGrid 
                category={selectedCategory} 
                addToCart={addToCart}
                onBack={() => setSelectedCategory(null)}
                serviceName={name}
                closeDialog={() => setIsDialogOpen(false)}
                serviceId={id}
                purchaseLocationId={purchaseLocation?.storeId}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CircularServiceCard;
