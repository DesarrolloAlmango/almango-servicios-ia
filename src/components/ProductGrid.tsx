
import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CartItem } from "@/pages/Servicios";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  defaultPrice?: number;
}

interface Category {
  id: string;
  name: string;
  image: string;
  products: Product[];
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
  purchaseLocationId?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({ 
  category, 
  addToCart, 
  onBack, 
  serviceName,
  closeDialog,
  serviceId,
  purchaseLocationId
}) => {
  const navigate = useNavigate();
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingPrices, setIsLoadingPrices] = useState(true);

  const fetchUpdatedPrice = async (product: Product): Promise<number> => {
    if (!purchaseLocationId || !serviceId || !category.id) {
      return product.defaultPrice || product.price;
    }

    try {
      const response = await fetch(
        `/api/AlmangoXV1NETFramework/WebAPI/ObtenerPrecio?Proveedorid=${purchaseLocationId}&Nivel0=${serviceId}&Nivel1=${category.id}&Nivel2=${product.id}`
      );
      
      if (!response.ok) {
        throw new Error(`Error al obtener precio: ${response.status}`);
      }
      
      const data = await response.json();
      return data.Precio > 0 ? data.Precio : (product.defaultPrice || product.price);
    } catch (error) {
      console.error(`Error al obtener precio para producto ${product.id}:`, error);
      return product.defaultPrice || product.price;
    }
  };

  useEffect(() => {
    const loadProductsWithPrices = async () => {
      if (!category.products.length) {
        setIsLoadingPrices(false);
        return;
      }

      try {
        const productsWithPrices = await Promise.all(
          category.products.map(async (product) => {
            const updatedPrice = await fetchUpdatedPrice(product);
            return { 
              ...product, 
              price: updatedPrice,
              defaultPrice: product.price
            };
          })
        );
        
        setProducts(productsWithPrices);
        setProductQuantities(
          Object.fromEntries(productsWithPrices.map(product => [product.id, 0]))
        );
      } catch (error) {
        console.error("Error al cargar precios:", error);
        toast.error("Error al cargar precios de productos");
        setProducts(category.products.map(p => ({ ...p, defaultPrice: p.price })));
        setProductQuantities(
          Object.fromEntries(category.products.map(product => [product.id, 0]))
        );
      } finally {
        setIsLoadingPrices(false);
      }
    };

    loadProductsWithPrices();
  }, [category, purchaseLocationId, serviceId]);

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
    const itemsToAdd = products
      .filter(product => productQuantities[product.id] > 0)
      .map(product => ({
        serviceId: serviceId || "",
        serviceName: serviceName,
        categoryId: category.id,
        categoryName: category.name,
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: productQuantities[product.id],
        image: product.image,
        id: product.id,
        name: product.name,
        serviceCategory: `${serviceName} - ${category.name}`,
        purchaseLocationId: purchaseLocationId
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
    const itemsToAdd = products
      .filter(product => productQuantities[product.id] > 0)
      .map(product => ({
        serviceId: serviceId || "",
        serviceName: serviceName,
        categoryId: category.id,
        categoryName: category.name,
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: productQuantities[product.id],
        image: product.image,
        id: product.id,
        name: product.name,
        serviceCategory: `${serviceName} - ${category.name}`,
        purchaseLocationId: purchaseLocationId
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
      
      {isLoadingPrices ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          <p className="text-gray-600">Actualizando precios...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="flex items-center justify-center h-40">
          <p className="text-gray-500">No hay productos disponibles</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {products.map(product => (
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
        </>
      )}
    </div>
  );
};

export default ProductGrid;
