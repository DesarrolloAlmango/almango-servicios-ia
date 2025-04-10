import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryCarousel from "@/components/CategoryCarousel";
import { CartItem } from "@/pages/Servicios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";

interface Category {
  id: string;
  name: string;
  image: string;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface ProductCardProps {
  product: Product;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  quantity,
  onIncrease,
  onDecrease
}) => {
  const [imageError, setImageError] = useState(false);

  const getImageSource = () => {
    if (!product.image) return null;
    
    if (product.image.startsWith('data:image')) {
      return product.image;
    }
    
    try {
      new URL(product.image);
      return product.image;
    } catch {
      return `data:image/png;base64,${product.image}`;
    }
  };

  const imageSource = getImageSource();

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
        {imageSource && !imageError ? (
          <img 
            src={imageSource}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Imagen no disponible</span>
          </div>
        )}
        
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-full p-1 shadow-md flex items-center">
            <button 
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary"
              onClick={(e) => { e.stopPropagation(); onDecrease(); }}
            >
              -
            </button>
            <span className="w-8 h-8 flex items-center justify-center font-medium">
              {quantity}
            </span>
            <button 
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary"
              onClick={(e) => { e.stopPropagation(); onIncrease(); }}
            >
              +
            </button>
          </div>
        </div>
      </div>
      
      <CardContent className="p-4 flex-grow">
        <h4 className="font-medium mb-1 line-clamp-2">{product.name}</h4>
        <div className="flex justify-between items-center mt-2">
          <span className="font-bold">${product.price.toFixed(2)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

interface ProductGridProps {
  category: Category;
  addToCart: (item: CartItem) => void;
  onBack: () => void;
  serviceName: string;
  closeDialog: () => void;
  serviceId?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  category, 
  addToCart, 
  onBack, 
  serviceName,
  closeDialog,
  serviceId
}) => {
  const navigate = useNavigate();
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>(
    Object.fromEntries(category.products.map(product => [product.id, 0]))
  );

  const increaseQuantity = (productId: string) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const decreaseQuantity = (productId: string) => {
    setProductQuantities(prev => ({
      ...prev,
      [productId]: Math.max(0, (prev[productId] || 0) - 1)
    }));
  };

  const handleAddAllToCart = () => {
    const itemsToAdd = category.products
      .filter(product => productQuantities[product.id] > 0)
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: productQuantities[product.id],
        image: product.image,
        serviceCategory: `${serviceName} - ${category.name}`
      }));

    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach(item => addToCart(item));
      toast.success("Productos agregados al carrito");
      closeDialog();
    } else {
      toast.error("Seleccione al menos un producto");
    }
  };
  
  const handleContractNow = () => {
    const itemsToAdd = category.products
      .filter(product => productQuantities[product.id] > 0)
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: productQuantities[product.id],
        image: product.image,
        serviceCategory: `${serviceName} - ${category.name}`
      }));

    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach(item => addToCart(item));
      closeDialog();
      navigate('/servicios', { state: { openCart: true } });
    } else {
      toast.error("Seleccione al menos un producto");
    }
  };

  const hasSelectedProducts = Object.values(productQuantities).some(qty => qty > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft size={16} />
          <span>Volver a Categorías</span>
        </button>
        <h3 className="text-xl font-semibold ml-auto">{category.name}</h3>
      </div>
      
      <div className="bg-blue-50 p-3 rounded-md mb-4 border border-blue-200">
        {serviceId && (
          <p className="text-blue-700 font-medium">ID del Servicio: {serviceId}</p>
        )}
        <p className="text-blue-700 font-medium">ID de Categoría: {category.id}</p>
        <p className="text-blue-700">Categoría: {category.name}</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {category.products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product}
            quantity={productQuantities[product.id] || 0}
            onIncrease={() => increaseQuantity(product.id)}
            onDecrease={() => decreaseQuantity(product.id)}
          />
        ))}
      </div>

      {hasSelectedProducts && (
        <div className="flex justify-center gap-4 mt-8 sticky bottom-4 bg-white p-4 rounded-lg shadow-md">
          <Button 
            variant="outline"
            onClick={handleAddAllToCart}
            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            Agregar al carrito
          </Button>
          <Button 
            onClick={handleContractNow}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Contratar ahora
          </Button>
        </div>
      )}
    </div>
  );
};

interface ServiceCardProps {
  id?: string;
  name: string;
  iconComponent: LucideIcon;
  addToCart: (item: CartItem) => void;
  externalUrl?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ id, name, iconComponent: IconComponent, addToCart, externalUrl }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const fetchCategories = async (serviceId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/AlmangoXV1NETFramework/WebAPI/ObtenerNivel1?Nivel0=${serviceId}`);
      
      if (!response.ok) {
        throw new Error(`Error al cargar categorías: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Modificado para adaptarse a la estructura real del JSON
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
      
      // Modificado para adaptarse a la estructura real del JSON
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
    } else if (id) {
      setIsDialogOpen(true);
      fetchCategories(id);
    }
  };
  
  const handleCategorySelect = (category: Category) => {
    if (category.products.length > 0) {
      setSelectedCategory(category);
    } else if (id) {
      fetchProducts(id, category.id);
    }
  };

  return (
    <>
      <Card 
        className="w-[280px] h-[240px] rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border-0"
        onClick={handleCardClick}
      >
        <CardContent className="p-8 flex flex-col items-center justify-center h-full">
          <IconComponent className="w-16 h-16 text-blue-500 mb-5" />
          <h3 className="text-lg font-bold text-center uppercase text-orange-500">{name}</h3>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4 text-center uppercase text-orange-500">{name}</h2>
            
            {id && (
              <div className="bg-blue-50 p-3 rounded-md mb-4 border border-blue-200">
                <p className="text-blue-700 font-medium">ID del Servicio: {id}</p>
                {error && <p className="text-red-500 mt-2">{error}</p>}
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
                <p className="font-medium">Error: {error}</p>
                <Button 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => id && fetchCategories(id)}
                >
                  Reintentar
                </Button>
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
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServiceCard;