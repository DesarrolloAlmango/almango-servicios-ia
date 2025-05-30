
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Skeleton, PriceSkeleton, TextSkeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, ShoppingCart, RefreshCw } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  serviceCategory: string;
  serviceId?: string;
  categoryId?: string;
  productId?: string;
  departmentId?: string;
  locationId?: string;
  textosId?: string | null;
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
  defaultPrice?: number;
  textosId?: string;
}
interface ProductCardProps {
  product: Product;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  animating: boolean;
  purchaseLocationId?: string;
  serviceId?: string;
  categoryId?: string;
  isPriceLoading?: boolean;
  hasPurchaseLocation: boolean;
  onBackToCategories: () => void;
}
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantity,
  onIncrease,
  onDecrease,
  animating,
  purchaseLocationId,
  serviceId,
  categoryId,
  isPriceLoading = false,
  hasPurchaseLocation,
  onBackToCategories
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
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

  // SIMPLIFIED: Only disable buttons if no purchase location
  const buttonsDisabled = !hasPurchaseLocation;
  
  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasPurchaseLocation) {
      toast.error("Por favor, seleccione un lugar de compra primero");
      onBackToCategories();
    }
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col relative">
      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
        {!imageLoaded && <Skeleton className="absolute inset-0 w-full h-full" />}
        {imageSource && !imageError ? (
          <img 
            src={imageSource} 
            alt={product.name} 
            className="w-full h-full object-cover" 
            onError={() => setImageError(true)} 
            onLoad={() => setImageLoaded(true)}
            style={{ opacity: imageLoaded ? 1 : 0 }}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500 text-sm">Imagen no disponible</span>
          </div>
        )}
        {animating && (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
            <div className="animate-bounce scale-[2.2] bg-white bg-opacity-80 rounded-full shadow-lg flex items-center justify-center duration-500 p-2">
              <ShoppingCart size={32} className="text-orange-500" />
            </div>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-full p-1 shadow-md flex items-center">
            <button 
              className={`w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary ${buttonsDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={(e) => {
                if (buttonsDisabled) {
                  handleButtonClick(e);
                } else {
                  e.stopPropagation();
                  onDecrease();
                }
              }}
              disabled={buttonsDisabled}
            >
              -
            </button>
            <span className="w-8 h-8 flex items-center justify-center font-medium">
              {quantity}
            </span>
            <button 
              className={`w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary ${buttonsDisabled ? 'cursor-not-allowed opacity-50' : ''}`}
              onClick={(e) => {
                if (buttonsDisabled) {
                  handleButtonClick(e);
                } else {
                  e.stopPropagation();
                  onIncrease();
                }
              }}
              disabled={buttonsDisabled}
            >
              +
            </button>
          </div>
        </div>
      </div>
      <CardContent className="p-4 flex-grow">
        <h4 className="font-medium mb-1 line-clamp-2">{product.name}</h4>
        <div className="flex justify-between items-center mt-2">
          {isPriceLoading ? (
            <PriceSkeleton />
          ) : product.price !== undefined && product.price >= 0 ? (
            <span className="font-bold">
              ${product.price.toLocaleString('es-UY', { maximumFractionDigits: 0 })}
            </span>
          ) : (
            <PriceSkeleton />
          )}
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
  currentCartItems: CartItem[];
}

const ProductGrid: React.FC<ProductGridProps> = ({
  category,
  addToCart,
  onBack,
  serviceName,
  closeDialog,
  serviceId,
  purchaseLocationId,
  currentCartItems
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  
  const { userId, commerceId } = params;
  const effectivePurchaseLocationId = purchaseLocationId || commerceId;

  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProductIds, setLoadingProductIds] = useState<Set<string>>(new Set());
  const [cartAnimating, setCartAnimating] = useState<Record<string, boolean>>({});
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [pricesLoaded, setPricesLoaded] = useState(false);

  // Refs to prevent infinite loops
  const productsLoaded = useRef(false);

  // Function to fetch updated price for a specific product
  const fetchUpdatedPrice = async (product: Product): Promise<{ id: string; price: number; }> => {
    if (!effectivePurchaseLocationId || !serviceId || !category.id) {
      return {
        id: product.id,
        price: product.defaultPrice || product.price
      };
    }
    
    try {
      const response = await fetch(`/api/WebAPI/ObtenerPrecio?Proveedorid=${effectivePurchaseLocationId}&Nivel0=${serviceId}&Nivel1=${category.id}&Nivel2=${product.id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener precio: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && typeof data.Precio === 'number' && data.Precio > 0) {
        return {
          id: product.id,
          price: data.Precio
        };
      } else {
        return {
          id: product.id,
          price: product.defaultPrice || product.price
        };
      }
    } catch (error) {
      console.error(`Error fetching price for product ${product.id}:`, error);
      return {
        id: product.id,
        price: product.defaultPrice || product.price
      };
    }
  };

  // Function to update all prices
  const updateAllPrices = async () => {
    if (!effectivePurchaseLocationId || !serviceId || products.length === 0 || pricesLoaded) {
      return;
    }

    try {
      setIsUpdatingPrices(true);
      setLoadingProductIds(new Set(products.map(p => p.id)));

      const pricePromises = products.map(product => fetchUpdatedPrice(product));
      const updatedPrices = await Promise.all(pricePromises);

      setProducts(prevProducts => 
        prevProducts.map(p => {
          const updatedPrice = updatedPrices.find(up => up.id === p.id);
          return updatedPrice ? { ...p, price: updatedPrice.price } : p;
        })
      );

      setLoadingProductIds(new Set());
      setPricesLoaded(true);
    } catch (error) {
      console.error("Error updating prices:", error);
      toast.error("Hubo un error al actualizar los precios");
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  // Function to fetch products
  const fetchProducts = async () => {
    if (!serviceId || !category.id || productsLoaded.current) {
      return;
    }
    
    try {
      setLoadingProductIds(new Set(['loading-all']));
      const response = await fetch(`https://app.almango.com.uy/webapi/ObtenerNivel2?Nivel0=${serviceId}&Nivel1=${category.id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener productos: ${response.status}`);
      }
      
      const productsData = await response.json();

      const initialProducts = productsData.map((product: any) => ({
        id: product.id || product.Nivel2Id,
        name: product.name || product.Nivel2Descripcion,
        price: 0, // Start with 0, prices will be loaded after location confirmation
        defaultPrice: product.price ? parseFloat(product.price) : product.Precio ? parseFloat(product.Precio) : 0,
        image: product.image || product.Imagen || "",
        category: category.id,
        textosId: product.TextosId || null
      }));

      setProducts(initialProducts);
      productsLoaded.current = true;
      setLoadingProductIds(new Set());

      // Setup initial quantities
      const initialQuantities: Record<string, number> = {};
      initialProducts.forEach((product: Product) => {
        const cartItem = currentCartItems.find(item => 
          item.productId === product.id && 
          item.categoryId === category.id && 
          item.serviceId === serviceId
        );
        initialQuantities[product.id] = cartItem ? cartItem.quantity : 0;
      });
      setProductQuantities(initialQuantities);

    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Hubo un error al cargar los productos");
      setLoadingProductIds(new Set());
    }
  };

  // Load products when category changes
  useEffect(() => {
    if (category.id && serviceId) {
      productsLoaded.current = false;
      setPricesLoaded(false);
      fetchProducts();
    }
  }, [category.id, serviceId]);

  // Listen for productGridShown event to trigger price loading
  useEffect(() => {
    const handleProductGridShown = () => {
      console.log("ProductGrid received productGridShown event - loading prices");
      if (products.length > 0 && effectivePurchaseLocationId && !pricesLoaded) {
        updateAllPrices();
      }
    };

    document.addEventListener('productGridShown', handleProductGridShown);
    
    return () => {
      document.removeEventListener('productGridShown', handleProductGridShown);
    };
  }, [products.length, effectivePurchaseLocationId, pricesLoaded]);

  // Update cart helpers
  const updateCart = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const cartItem: CartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: newQuantity,
      image: product.image,
      serviceCategory: `${serviceName} - ${category.name}`,
      serviceId: serviceId,
      categoryId: category.id,
      productId: product.id,
      departmentId: undefined,
      locationId: undefined,
      textosId: product.textosId || null
    };

    addToCart(cartItem);
    
    setCartAnimating(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setCartAnimating(prev => ({ ...prev, [productId]: false }));
    }, 700);
  };

  const increaseQuantity = (productId: string) => {
    if (!effectivePurchaseLocationId) {
      toast.error("Por favor, seleccione un lugar de compra primero");
      onBack();
      return;
    }
    
    setProductQuantities(prev => {
      const newValue = (prev[productId] || 0) + 1;
      setTimeout(() => updateCart(productId, newValue), 0);
      return { ...prev, [productId]: newValue };
    });
  };

  const decreaseQuantity = (productId: string) => {
    if (!effectivePurchaseLocationId) {
      toast.error("Por favor, seleccione un lugar de compra primero");
      onBack();
      return;
    }
    
    setProductQuantities(prev => {
      const newValue = Math.max(0, (prev[productId] || 0) - 1);
      setTimeout(() => updateCart(productId, newValue), 0);
      return { ...prev, [productId]: newValue };
    });
  };

  const handleAddAllToCart = () => {
    const purchaseLocation = {
      departmentId: undefined,
      locationId: undefined
    };
    const itemsToAdd = products.filter(product => productQuantities[product.id] > 0).map(product => {
      console.log('=== DEBUG handleAddAllToCart ===');
      console.log('Product:', product.name);
      console.log('Product textosId:', product.textosId);
      console.log('=== END handleAddAllToCart DEBUG ===');
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: productQuantities[product.id],
        image: product.image,
        serviceCategory: `${serviceName} - ${category.name}`,
        serviceId: serviceId,
        categoryId: category.id,
        productId: product.id,
        departmentId: purchaseLocation?.departmentId,
        locationId: purchaseLocation?.locationId,
        textosId: product.textosId || null
      };
    });
    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach(item => addToCart(item));
      closeDialog();
      const currentPath = location.pathname;
      navigate(currentPath, {
        state: {
          openCart: true
        }
      });
    } else {
      toast.error("Seleccione al menos un producto");
    }
  };
  const handleContractNow = () => {
    const purchaseLocation = {
      departmentId: undefined,
      locationId: undefined
    };
    const itemsToAdd = products.filter(product => productQuantities[product.id] > 0).map(product => {
      console.log('=== DEBUG handleContractNow ===');
      console.log('Product:', product.name);
      console.log('Product textosId:', product.textosId);
      console.log('=== END handleContractNow DEBUG ===');
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: productQuantities[product.id],
        image: product.image,
        serviceCategory: `${serviceName} - ${category.name}`,
        serviceId: serviceId,
        categoryId: category.id,
        productId: product.id,
        departmentId: purchaseLocation?.departmentId,
        locationId: purchaseLocation?.locationId,
        textosId: product.textosId || null
      };
    });
    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach(item => addToCart(item));
      closeDialog();
      const currentPath = location.pathname;
      navigate(currentPath, {
        state: {
          openCart: true
        }
      });
    } else {
      toast.error("Seleccione al menos un producto");
    }
  };
  const handleAddAnotherService = () => {
    const purchaseLocation = {
      departmentId: undefined,
      locationId: undefined
    };
    const itemsToAdd = products.filter(product => productQuantities[product.id] > 0).map(product => {
      console.log('=== DEBUG handleAddAnotherService ===');
      console.log('Product:', product.name);
      console.log('Product textosId:', product.textosId);
      console.log('=== END handleAddAnotherService DEBUG ===');
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: productQuantities[product.id],
        image: product.image,
        serviceCategory: `${serviceName} - ${category.name}`,
        serviceId: serviceId,
        categoryId: category.id,
        productId: product.id,
        departmentId: purchaseLocation?.departmentId,
        locationId: purchaseLocation?.locationId,
        textosId: product.textosId || null
      };
    });
    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach(item => addToCart(item));
      closeDialog();
      navigate('/servicios');
    } else {
      toast.error("Seleccione al menos un producto");
    }
  };

  const hasSelectedProducts = Object.values(productQuantities).some(qty => qty > 0);
  const allProductsLoading = products.length === 0 || loadingProductIds.has('loading-all');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-primary hover:underline"
          aria-label="back-to-categories"
        >
          <ArrowLeft size={16} />
          <span>Volver a Categorías</span>
        </button>
        <h3 className="text-xl font-semibold ml-auto">{category.name}</h3>
        
        {effectivePurchaseLocationId && pricesLoaded && (
          <Button 
            onClick={() => {
              setPricesLoaded(false);
              updateAllPrices();
            }} 
            variant="outline" 
            size="sm" 
            className="ml-2" 
            disabled={isUpdatingPrices}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isUpdatingPrices ? 'animate-spin' : ''}`} />
            {isUpdatingPrices ? 'Actualizando...' : 'Actualizar precios'}
          </Button>
        )}
      </div>
      
      {!effectivePurchaseLocationId && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Los precios se mostrarán después de seleccionar un lugar de compra.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {allProductsLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <TextSkeleton text="Cargando productos..." />
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
                animating={!!cartAnimating[product.id]}
                purchaseLocationId={effectivePurchaseLocationId}
                serviceId={serviceId}
                categoryId={category.id}
                isPriceLoading={loadingProductIds.has(product.id)}
                hasPurchaseLocation={!!effectivePurchaseLocationId}
                onBackToCategories={onBack}
              />
            ))}
          </div>
          {hasSelectedProducts && (
            <div className="flex justify-center gap-2 sm:gap-4 mt-8 sticky bottom-4 bg-white p-4 rounded-lg shadow-md">
              <Button 
                onClick={handleAddAnotherService} 
                variant="outline" 
                className="text-secondary border-secondary hover:bg-secondary hover:text-white transition-colors text-xs sm:text-sm px-2 sm:px-4"
              >
                Agregar otro servicio
              </Button>
              <Button 
                onClick={handleContractNow} 
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm px-2 sm:px-4"
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
