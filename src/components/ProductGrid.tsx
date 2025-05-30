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

  // Determine if buttons should be disabled
  const buttonsDisabled = !hasPurchaseLocation || isPriceLoading || product.price === 0;

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasPurchaseLocation) {
      toast.error("Por favor, seleccione un lugar de compra primero");
      onBackToCategories();
    } else if (isPriceLoading || product.price === 0) {
      toast.info("Esperando carga de precios...");
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
          ) : product.price !== undefined && product.price > 0 ? (
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
  onOpenLocationModal?: () => void;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  category,
  addToCart,
  onBack,
  serviceName,
  closeDialog,
  serviceId,
  purchaseLocationId,
  currentCartItems,
  onOpenLocationModal
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProductIds, setLoadingProductIds] = useState<Set<string>>(new Set());
  const [cartAnimating, setCartAnimating] = useState<Record<string, boolean>>({});
  const [isUpdatingPrices, setIsUpdatingPrices] = useState(false);
  const [flashBackButton, setFlashBackButton] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  // Refs to track component state
  const initialLoadComplete = useRef(false);
  const productsInitialized = useRef(false);
  const categorySelected = useRef(false);
  const componentMounted = useRef(false);

  // Function to fetch products via ObtenerNivel2 endpoint
  const fetchProducts = async () => {
    if (!serviceId || !category.id) {
      console.log("Skipping product fetch - missing serviceId or categoryId");
      return [];
    }

    try {
      console.log(`Fetching products: serviceId=${serviceId}, categoryId=${category.id}`);

      // Set loading state
      setIsLoadingProducts(true);
      
      const response = await fetch(`/api/WebAPI/ObtenerNivel2?Nivel0=${serviceId}&Nivel1=${category.id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener productos: ${response.status}`);
      }

      const productsData = await response.json();
      console.log(`Fetched ${productsData.length} products for category ${category.id}`, productsData);

      // Initialize products with their default prices but set price to 0 initially
      const initialProducts = productsData.map((product: any) => {
        console.log('=== DEBUG Product Mapping in fetchProducts ===');
        console.log('Original product from ObtenerNivel2:', product);
        console.log('Product TextosId from API:', product.TextosId);
        console.log('Product TextosId type:', typeof product.TextosId);
        console.log('=== END Product Mapping DEBUG ===');
        
        return {
          id: product.id || product.Nivel2Id,
          name: product.name || product.Nivel2Descripcion,
          price: 0, // Initialize with 0 to show loading state
          defaultPrice: product.price ? parseFloat(product.price) : product.Precio ? parseFloat(product.Precio) : 0,
          image: product.image || product.Imagen || "",
          category: category.id,
          textosId: product.TextosId || null
        };
      });

      console.log('ProductGrid: Transformed products with textosId:', initialProducts);

      // Set the products with initial data
      setProducts(initialProducts);
      productsInitialized.current = true;

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

      // Clear the loading state
      setIsLoadingProducts(false);

      // If we have a purchase location, immediately fetch prices
      if (purchaseLocationId) {
        console.log(`Products loaded, immediately fetching prices with proveedorId=${purchaseLocationId}`);
        // Mark all products as loading prices before fetching
        setLoadingProductIds(new Set(initialProducts.map((p: Product) => p.id)));
        await updateAllPrices();
      }

      return initialProducts;
    } catch (error) {
      console.error("Error loading products:", error);
      toast.error("Hubo un error al cargar los productos");
      setIsLoadingProducts(false);
      setProducts([]); // Ensure products is empty on error
      return [];
    }
  };

  // Effect to load products immediately when component mounts (both flows)
  useEffect(() => {
    console.log("ProductGrid mounted - loading products immediately");
    fetchProducts();
  }, [category.id, serviceId]);

  // Listen for openCategory event from location confirmation (for price updates)
  useEffect(() => {
    const handleOpenCategory = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail && customEvent.detail.fromLocationConfirmation) {
        const { categoryId, serviceId: eventServiceId } = customEvent.detail;
        console.log("ProductGrid: Received openCategory from location confirmation:", categoryId, eventServiceId);
        
        // Only proceed if this matches our current category and service and we have a purchase location
        if (categoryId === category.id && eventServiceId === serviceId && purchaseLocationId) {
          console.log("ProductGrid: Updating prices after location confirmation");
          updateAllPrices();
        }
      }
    };

    document.addEventListener('openCategory', handleOpenCategory);
    
    return () => {
      document.removeEventListener('openCategory', handleOpenCategory);
    };
  }, [category.id, serviceId, purchaseLocationId]);

  // Function to fetch updated price for a specific product
  const fetchUpdatedPrice = async (product: Product): Promise<{ id: string; price: number; }> => {
    if (!purchaseLocationId || !serviceId || !category.id) {
      console.log("Missing required parameters for price fetch:", {
        purchaseLocationId, serviceId, categoryId: category.id
      });
      return { id: product.id, price: product.defaultPrice || product.price };
    }

    try {
      console.log(`Fetching price for: proveedorId=${purchaseLocationId}, nivel0=${serviceId}, nivel1=${category.id}, nivel2=${product.id}`);
      const response = await fetch(`/api/WebAPI/ObtenerPrecio?Proveedorid=${purchaseLocationId}&Nivel0=${serviceId}&Nivel1=${category.id}&Nivel2=${product.id}`);
      
      if (!response.ok) {
        console.error(`Error response from price API: ${response.status} ${response.statusText}`);
        throw new Error(`Error al obtener precio: ${response.status}`);
      }

      const data = await response.json();
      console.log(`Price data received for ${product.id}:`, data);

      if (data && typeof data.Precio === 'number') {
        if (data.Precio > 0) {
          console.log(`Using ObtenerPrecio price for product ${product.id}: ${data.Precio}`);
          return { id: product.id, price: data.Precio };
        } else {
          console.log(`ObtenerPrecio returned zero for product ${product.id}, using default price: ${product.defaultPrice || product.price}`);
          return { id: product.id, price: product.defaultPrice || product.price };
        }
      } else {
        console.warn(`Invalid price data format for product ${product.id}:`, data);
        return { id: product.id, price: product.defaultPrice || product.price };
      }
    } catch (error) {
      console.error(`Error fetching price for product ${product.id}:`, error);
      return { id: product.id, price: product.defaultPrice || product.price };
    }
  };

  // Function to update all product prices
  const updateAllPrices = async () => {
    if (!purchaseLocationId || !serviceId || isUpdatingPrices || products.length === 0) {
      console.log("Skipping price update - missing data or already updating", {
        purchaseLocationId, serviceId, isUpdatingPrices, productCount: products.length
      });
      return false;
    }

    try {
      console.log(`Updating all prices for category ${category.name} with proveedorId=${purchaseLocationId}`);
      setIsUpdatingPrices(true);

      // Mark all products as loading prices
      const loadingIds = new Set(products.map(p => p.id));
      setLoadingProductIds(loadingIds);

      // Fetch updated prices individually for each product
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
      updateAllPrices();
    }
  }, [purchaseLocationId, serviceId]);

  useEffect(() => {
    if (products.length > 0 && purchaseLocationId && serviceId && !initialLoadComplete.current) {
      console.log("Products loaded initially, updating prices");
      updateAllPrices();
      initialLoadComplete.current = true;
    }
  }, [products.length]);

  useEffect(() => {
    componentMounted.current = true;

    if (componentMounted.current && products.length > 0 && purchaseLocationId && serviceId) {
      console.log("Component mounted/visible, forcing price refresh");
      updateAllPrices();
    }

    return () => {
      initialLoadComplete.current = false;
      componentMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && componentMounted.current && products.length > 0 && purchaseLocationId && serviceId) {
        console.log("Page became visible again, refreshing prices");
        updateAllPrices();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [products, purchaseLocationId, serviceId]);

  useEffect(() => {
    const handleCategorySelected = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { categoryId, categoryName, serviceId: eventServiceId } = customEvent.detail;
        console.log("ProductGrid received categorySelected event:", categoryId, categoryName);

        if (eventServiceId === serviceId) {
          categorySelected.current = true;
        }
      }
    };

    document.addEventListener('categorySelected', handleCategorySelected);
    return () => {
      document.removeEventListener('categorySelected', handleCategorySelected);
    };
  }, [serviceId]);

  useEffect(() => {
    const handleProductGridShown = () => {
      if (products.length > 0 && purchaseLocationId && serviceId) {
        console.log("ProductGrid shown event detected, refreshing prices");
        updateAllPrices();
      }
    };

    const handleRouteChange = () => {
      if (location.pathname === '/servicios' && products.length > 0 && purchaseLocationId && serviceId) {
        console.log("Route changed to /servicios, refreshing prices");
        updateAllPrices();
      }
    };

    document.addEventListener('productGridShown', handleProductGridShown);
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      document.removeEventListener('productGridShown', handleProductGridShown);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [products, purchaseLocationId, serviceId, location.pathname]);

  const updateCart = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const purchaseLocation = { departmentId: undefined, locationId: undefined };
    
    console.log('=== DEBUG updateCart in ProductGrid ===');
    console.log('Product found:', product);
    console.log('Product textosId being added to cart:', product.textosId);
    console.log('Product textosId type:', typeof product.textosId);
    console.log('=== END updateCart DEBUG ===');

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
      departmentId: purchaseLocation?.departmentId,
      locationId: purchaseLocation?.locationId,
      textosId: product.textosId || null
    };

    console.log('ProductGrid: Cart item being added with textosId:', cartItem);
    addToCart(cartItem);

    setCartAnimating(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => {
      setCartAnimating(prev => ({ ...prev, [productId]: false }));
    }, 700);
  };

  const increaseQuantity = (productId: string) => {
    if (!purchaseLocationId) {
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
    if (!purchaseLocationId) {
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
    const purchaseLocation = { departmentId: undefined, locationId: undefined };
    
    const itemsToAdd = products.filter(product => productQuantities[product.id] > 0)
      .map(product => {
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
      navigate(currentPath, { state: { openCart: true } });
    } else {
      toast.error("Seleccione al menos un producto");
    }
  };

  const handleContractNow = () => {
    const purchaseLocation = { departmentId: undefined, locationId: undefined };
    
    const itemsToAdd = products.filter(product => productQuantities[product.id] > 0)
      .map(product => {
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
      navigate(currentPath, { state: { openCart: true } });
    } else {
      toast.error("Seleccione al menos un producto");
    }
  };

  const handleAddAnotherService = () => {
    const purchaseLocation = { departmentId: undefined, locationId: undefined };
    
    const itemsToAdd = products.filter(product => productQuantities[product.id] > 0)
      .map(product => {
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

  // Determine if we need to show loading message
  const showLoadingMessage = isLoadingProducts;

  const handleLocationLinkClick = () => {
    if (onOpenLocationModal) {
      onOpenLocationModal();
    } else {
      onBack();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-4">
        <button 
          onClick={onBack} 
          className={`flex items-center gap-2 text-primary hover:underline ${!purchaseLocationId ? 'relative' : ''}`}
          aria-label="back-to-categories"
        >
          <ArrowLeft size={16} />
          <span>Volver a Categorías</span>
          
          {flashBackButton && (
            <span 
              className="absolute inset-0 bg-yellow-100 animate-pulse rounded-md opacity-20 z-[-1]" 
              style={{
                maxHeight: '35px',
                transform: 'scale(1.05)',
                animation: 'pulse 2s infinite alternate'
              }}
            />
          )}
        </button>
        <h3 className="text-xl font-semibold ml-auto">{category.name}</h3>
        
        {purchaseLocationId && products.length > 0 && (
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
                Los precios se mostrarán después de seleccionar un{' '}
                <button 
                  onClick={handleLocationLinkClick}
                  className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
                >
                  lugar de compra
                </button>.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {showLoadingMessage ? (
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
                hasPurchaseLocation={!!purchaseLocationId}
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
