import React, { useState, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Skeleton, PriceSkeleton, TextSkeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft, ShoppingCart, RefreshCw } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

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
  isPriceLoading = false
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

  return (
    <Card className="overflow-hidden h-full flex flex-col relative">
      <div className="relative h-40 bg-gray-100 flex items-center justify-center">
        {!imageLoaded && (
          <Skeleton className="absolute inset-0 w-full h-full" />
        )}
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
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary"
              onClick={(e) => { 
                e.stopPropagation(); 
                onDecrease(); 
              }}
            >
              -
            </button>
            <span className="w-8 h-8 flex items-center justify-center font-medium">
              {quantity}
            </span>
            <button 
              className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-primary"
              onClick={(e) => { 
                e.stopPropagation(); 
                onIncrease(); 
              }}
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
          ) : product.price !== undefined ? (
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
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProductIds, setLoadingProductIds] = useState<Set<string>>(new Set());
  const [cartAnimating, setCartAnimating] = useState<Record<string, boolean>>({});
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const initialLoadComplete = useRef(false);

  // Improved fetchUpdatedPrice function to ensure proper provider ID usage
  const fetchUpdatedPrice = async (product: Product): Promise<{id: string, price: number}> => {
    if (!purchaseLocationId || !serviceId || !category.id) {
      console.log("Missing required parameters for price fetch:", { 
        purchaseLocationId, 
        serviceId, 
        categoryId: category.id 
      });
      return { id: product.id, price: product.defaultPrice || product.price };
    }

    try {
      // Log the API call with explicit params for debugging
      console.log(`Fetching price with params: proveedorId=${purchaseLocationId}, nivel0=${serviceId}, nivel1=${category.id}, nivel2=${product.id}`);
      
      const response = await fetch(
        `/api/AlmangoXV1NETFramework/WebAPI/ObtenerPrecio?Proveedorid=${purchaseLocationId}&Nivel0=${serviceId}&Nivel1=${category.id}&Nivel2=${product.id}`
      );
      
      if (!response.ok) {
        console.error(`Error response from price API: ${response.status} ${response.statusText}`);
        throw new Error(`Error al obtener precio: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Price data received for ${product.id}:`, data);
      
      if (data && typeof data.Precio === 'number') {
        // IMPORTANT CHANGE: Only use ObtenerPrecio price if it's greater than 0
        // Otherwise, fall back to the product's default price from ObtenerNivel2
        if (data.Precio > 0) {
          return { 
            id: product.id,
            price: data.Precio 
          };
        } else {
          console.log(`ObtenerPrecio returned zero for product ${product.id}, using default price: ${product.defaultPrice || product.price}`);
          return { 
            id: product.id,
            price: product.defaultPrice || product.price 
          };
        }
      } else {
        console.warn(`Invalid price data format for product ${product.id}:`, data);
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

  // Function to update all prices - critical for ensuring prices are always current
  const updateAllPrices = async () => {
    if (!purchaseLocationId || !serviceId || isUpdatingPrices || products.length === 0) {
      console.log("Skipping price update - missing data or already updating", { 
        purchaseLocationId, 
        serviceId, 
        isUpdatingPrices, 
        productCount: products.length 
      });
      return false;
    }
    
    try {
      console.log(`Updating all prices for category ${category.name} with proveedorId=${purchaseLocationId}`);
      setIsUpdatingPrices(true);
      
      // Mark all products as loading prices
      const loadingIds = new Set(products.map(p => p.id));
      setLoadingProductIds(loadingIds);
      
      // Fetch updated prices individually
      const pricePromises = products.map(product => fetchUpdatedPrice(product));
      const updatedPrices = await Promise.all(pricePromises);
      
      console.log("All prices fetched successfully:", updatedPrices);
      
      // Update all product prices at once
      setProducts(prevProducts => 
        prevProducts.map(p => {
          const updatedPrice = updatedPrices.find(up => up.id === p.id);
          return updatedPrice ? { ...p, price: updatedPrice.price } : p;
        })
      );
      
      // Clear loading state
      setLoadingProductIds(new Set());
      console.log("Prices updated successfully for all products");
      return true;
    } catch (error) {
      console.error("Error updating prices:", error);
      toast.error("Hubo un error al actualizar los precios");
      return false;
    } finally {
      setIsUpdatingPrices(false);
    }
  };

  // Direct fetchProducts function to get products via ObtenerNivel2 endpoint
  const fetchProducts = async () => {
    if (!serviceId || !category.id) {
      console.log("Skipping product fetch - missing serviceId or categoryId");
      return [];
    }
    
    try {
      console.log(`Fetching products: serviceId=${serviceId}, categoryId=${category.id}`);
      const response = await fetch(`/api/AlmangoXV1NETFramework/WebAPI/ObtenerNivel2?Nivel0=${serviceId}&Nivel1=${category.id}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener productos: ${response.status}`);
      }
      
      const productsData = await response.json();
      console.log(`Fetched ${productsData.length} products for category ${category.id}`);
      
      // Initialize products with their default prices from ObtenerNivel2
      const initialProducts = productsData.map((product: any) => ({ 
        ...product, 
        defaultPrice: product.price,  // Store the original price as defaultPrice
        price: product.price          // Will be updated by ObtenerPrecio immediately
      }));
      
      setProducts(initialProducts);
      
      // Setup initial quantities based on cart items
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
      
      // Mark all products as loading prices initially
      setLoadingProductIds(new Set(initialProducts.map((p: Product) => p.id)));
      
      // Immediately fetch prices from ObtenerPrecio for each product
      if (purchaseLocationId) {
        console.log(`Products loaded, immediately fetching prices with proveedorId=${purchaseLocationId}`);
        setTimeout(() => updateAllPrices(), 0);  // Using setTimeout to ensure rendering completes
      }
      
      return initialProducts;
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Hubo un error al cargar los productos");
      return [];
    }
  };

  // Effect to load products when the category changes
  useEffect(() => {
    if (category.id && serviceId) {
      console.log("Category changed, fetching products:", category.name);
      fetchProducts();
    }
  }, [category.id, serviceId]);

  // Effect to update quantities from cart
  useEffect(() => {
    // Setup initial quantities based on cart items when they change
    if (products.length > 0) {
      const initialQuantities: Record<string, number> = { ...productQuantities };
      let hasChanges = false;
      
      products.forEach(product => {
        const cartItem = currentCartItems.find(item => 
          item.productId === product.id && 
          item.categoryId === category.id &&
          item.serviceId === serviceId
        );
        
        const newQuantity = cartItem ? cartItem.quantity : 0;
        if (initialQuantities[product.id] !== newQuantity) {
          initialQuantities[product.id] = newQuantity;
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        setProductQuantities(initialQuantities);
      }
    }
  }, [currentCartItems, products]);

  // Effect to update prices when purchase location is set/changed
  useEffect(() => {
    if (!purchaseLocationId || !serviceId) return;

    if (products.length > 0 && purchaseLocationId) {
      console.log(`Purchase location changed to ${purchaseLocationId}, updating prices`);
      // Always update prices when purchase location changes - no caching
      updateAllPrices();
    }
  }, [purchaseLocationId, serviceId]);

  // Always update prices when the component mounts or when products are loaded
  useEffect(() => {
    if (products.length > 0 && purchaseLocationId && serviceId && !initialLoadComplete.current) {
      console.log("Products loaded initially, updating prices");
      updateAllPrices();
      initialLoadComplete.current = true;
    }
  }, [products.length]);

  // ADDED: Additional effect to ensure prices are always fetched when component is shown
  useEffect(() => {
    if (products.length > 0 && purchaseLocationId && serviceId) {
      console.log("Component visible, forcing price refresh");
      updateAllPrices();
    }
    
    // Cleanup function to prevent memory leaks
    return () => {
      initialLoadComplete.current = false; // Reset for next time
    };
  }, []);

  const updateCart = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    const purchaseLocation = { departmentId: undefined, locationId: undefined };

    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: newQuantity,
      image: product.image,
      serviceCategory: `${serviceName} - ${category.name}`,
      serviceId: serviceId,
      categoryId: category.id,
      productId: product.id,
      departmentId: purchaseLocation?.departmentId,
      locationId: purchaseLocation?.locationId,
      textosId: product.textosId
    });

    setCartAnimating(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setCartAnimating(prev => ({ ...prev, [productId]: false }));
    }, 700);
  };

  const increaseQuantity = (productId: string) => {
    setProductQuantities(prev => {
      const newValue = (prev[productId] || 0) + 1;
      setTimeout(() => updateCart(productId, newValue), 0);
      return { ...prev, [productId]: newValue };
    });
  };

  const decreaseQuantity = (productId: string) => {
    setProductQuantities(prev => {
      const newValue = Math.max(0, (prev[productId] || 0) - 1);
      setTimeout(() => updateCart(productId, newValue), 0);
      return { ...prev, [productId]: newValue };
    });
  };

  const handleAddAllToCart = () => {
    const purchaseLocation = { departmentId: undefined, locationId: undefined };
    const itemsToAdd = products
      .filter(product => productQuantities[product.id] > 0)
      .map(product => ({
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
        textosId: product.textosId
      }));

    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach(item => addToCart(item));
      closeDialog();
      const currentPath = location.pathname;
      navigate(currentPath, { state: { openCart: true } });
    } else {
      toast.error("Seleccione al menos un producto");
    }
  };

  const handleContractNow = () => {
    const purchaseLocation = { departmentId: undefined, locationId: undefined };
    
    const itemsToAdd = products
      .filter(product => productQuantities[product.id] > 0)
      .map(product => ({
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
        textosId: product.textosId
      }));

    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach(item => addToCart(item));
      closeDialog();
      const currentPath = location.pathname;
      navigate(currentPath, { state: { openCart: true } });
    } else {
      toast.error("Seleccione al menos un producto");
    }
  };

  const handleAddAnotherService = () => {
    const purchaseLocation = { departmentId: undefined, locationId: undefined };
    
    const itemsToAdd = products
      .filter(product => productQuantities[product.id] > 0)
      .map(product => ({
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
        textosId: product.textosId
      }));

    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach(item => addToCart(item));
      closeDialog();
      navigate('/servicios');
    } else {
      toast.error("Seleccione al menos un producto");
    }
  };

  const hasSelectedProducts = Object.values(productQuantities).some(qty => qty > 0);

  // Determine if we need to show loading message
  const allProductsLoading = products.length === 0;

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
        
        {purchaseLocationId && (
          <Button 
            onClick={() => updateAllPrices()}
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
      
      {!purchaseLocationId && (
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
                purchaseLocationId={purchaseLocationId}
                serviceId={serviceId}
                categoryId={category.id}
                isPriceLoading={loadingProductIds.has(product.id)}
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
