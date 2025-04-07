
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { icons, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryCarousel from "@/components/CategoryCarousel";
import { CartItem } from "@/pages/Servicios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ServiceCardProps {
  name: string;
  icon: keyof typeof icons;
  addToCart: (item: CartItem) => void;
}

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

const ServiceCard: React.FC<ServiceCardProps> = ({ name, icon, addToCart }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  
  // Datos de ejemplo - en una aplicación real vendrían de una API
  const categories: Category[] = [
    {
      id: "cat1",
      name: "Instalaciones",
      image: "https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=300&h=300",
      products: [
        { id: "p1", name: "Instalación de Tomacorriente", price: 25, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300&h=300", category: "Instalaciones" },
        { id: "p2", name: "Cambio de Lámpara", price: 15, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300&h=300", category: "Instalaciones" },
      ]
    },
    {
      id: "cat2",
      name: "Reparaciones",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300&h=300",
      products: [
        { id: "p3", name: "Reparación de Interruptor", price: 20, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300&h=300", category: "Reparaciones" },
        { id: "p4", name: "Reparación de Enchufe", price: 18, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300&h=300", category: "Reparaciones" },
      ]
    },
    {
      id: "cat3",
      name: "Mantenimiento",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300&h=300",
      products: [
        { id: "p5", name: "Mantenimiento de Tablero", price: 50, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300&h=300", category: "Mantenimiento" },
        { id: "p6", name: "Revisión de Circuitos", price: 35, image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=300&h=300", category: "Mantenimiento" },
      ]
    }
  ];
  
  const IconComponent = icons[icon];
  
  return (
    <>
      <Card 
        className="rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer group"
        onClick={() => setIsDialogOpen(true)}
      >
        <CardContent className="p-6 flex flex-col items-center group-hover:bg-primary/5">
          <h3 className="text-xl font-bold mb-4 uppercase text-primary">{name}</h3>
          <IconComponent className="w-12 h-12 text-blue-500" />
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-center uppercase text-primary">{name}</h2>
          
          {!selectedCategory ? (
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
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

interface ProductGridProps {
  category: Category;
  addToCart: (item: CartItem) => void;
  onBack: () => void;
  serviceName: string;
  closeDialog: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  category, 
  addToCart, 
  onBack, 
  serviceName,
  closeDialog 
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

  // Check if any product has a quantity greater than 0
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

      {/* Action buttons below all products */}
      {hasSelectedProducts && (
        <div className="flex justify-center gap-4 mt-8">
          <Button 
            variant="outline"
            onClick={handleAddAllToCart}
          >
            Agregar al carrito
          </Button>
          <Button 
            onClick={handleContractNow}
          >
            Contratar ahora
          </Button>
        </div>
      )}
    </div>
  );
};

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

export default ServiceCard;
