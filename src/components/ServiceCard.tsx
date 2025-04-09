import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryCarousel from "@/components/CategoryCarousel";
import { CartItem, Category, Product } from "@/types/service";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { useCategoriesData } from "@/hooks/useCategoriesData";

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
  return (
    <Card className="overflow-hidden">
      <div className="relative h-24 bg-gray-100">
        <img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
        />
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
      
      <CardContent className="p-4">
        <h4 className="font-medium mb-1">{product.name}</h4>
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
      toast.success("Productos agregados al carrito", {
        classNames: {
          toast: "bg-green-100 border-l-4 border-green-500 text-green-800",
          title: "font-medium text-green-800",
          description: "text-green-700",
        }
      });
      closeDialog();
    } else {
      toast.error("Seleccione al menos un producto", {
        classNames: {
          toast: "bg-red-100 border-l-4 border-red-500 text-red-800",
          title: "font-medium text-red-800",
          description: "text-red-700",
        }
      });
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
      toast.error("Seleccione al menos un producto", {
        classNames: {
          toast: "bg-red-100 border-l-4 border-red-500 text-red-800",
          title: "font-medium text-red-800",
          description: "text-red-700",
        }
      });
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
        <p className="text-blue-700 font-medium">ID del Servicio: {serviceId}</p>
        <p className="text-blue-700 font-medium">Categoría: {category.name}</p>
        <p className="text-blue-700 font-medium">Precio: {category.precio} {category.monedaid}</p>
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
        <div className="flex justify-center gap-4 mt-8">
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
  const navigate = useNavigate();
  
  const { categories, isLoading, isError, responseData } = useCategoriesData(id);
  
  const handleCardClick = () => {
    if (id) {
      console.log('Service clicked:', { id, name, externalUrl });
      toast.info(`Servicio: ${name} (ID: ${id})`, {
        duration: 3000,
      });
    }
    
    if (externalUrl) {
      window.location.href = externalUrl;
    } else {
      setIsDialogOpen(true);
    }
  };
  
  return (
    <>
      <Card 
        data-component="service-card"
        className="w-[280px] h-[240px] rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border-0 service-card-hover"
        onClick={handleCardClick}
      >
        <CardContent className="p-8 flex flex-col items-center justify-center h-full">
          <IconComponent className="w-16 h-16 text-blue-500 mb-5 transition-transform duration-300 group-hover:scale-110" />
          <h3 className="text-lg font-bold text-center uppercase text-orange-500">{name}</h3>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-center uppercase text-orange-500">{name}</h2>
          
          <div className="bg-blue-50 p-3 rounded-md mb-4 border border-blue-200">
            <p className="text-blue-700 font-medium">Datos del Servicio:</p>
            <p className="text-blue-700">ID: {id}</p>
            {isLoading && <p className="text-blue-700">Cargando categorías...</p>}
            {isError && <p className="text-red-700">Error al cargar categorías. Usando datos predeterminados...</p>}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 mb-2"
              onClick={() => {
                console.log("Categories data:", categories);
                console.log("API Response:", responseData);
                toast.info("Datos en la consola", { duration: 2000 });
              }}
            >
              Ver datos en consola
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : !selectedCategory ? (
            <CategoryCarousel 
              categories={categories} 
              onSelectCategory={setSelectedCategory} 
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
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ServiceCard;
