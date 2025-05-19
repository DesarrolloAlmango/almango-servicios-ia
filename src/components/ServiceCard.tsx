import React, { useState, useCallback, forwardRef, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import CategoryCarousel from "./CategoryCarousel";
import { ChevronDown, ChevronUp, LucideIcon, ExternalLink, ArrowLeft, ShoppingCart } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { Skeleton, PriceSkeleton, TextSkeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogContent } from "./ui/dialog";

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
  const [pricesFetched, setPricesFetched] = useState<boolean>(false);

  const getPurchaseLocationForService = (serviceId: string) => {
    return null;
  };

  const fetchUpdatedPrice = async (product: Product): Promise<{id: string, price: number}> => {
    if (!purchaseLocationId || !serviceId || !category.id) {
      return { id: product.id, price: product.defaultPrice || product.price };
    }

    try {
      const response = await fetch(
        `/api/AlmangoXV1NETFramework/WebAPI/ObtenerPrecio?Proveedorid=${purchaseLocationId}&Nivel0=${serviceId}&Nivel1=${category.id}&Nivel2=${product.id}`
      );
      
      if (!response.ok) {
        throw new Error(`Error al obtener precio: ${response.status}`);
      }
      
      const data = await response.json();
      return { 
        id: product.id,
        price: data.Precio > 0 ? data.Precio : (product.defaultPrice || product.price) 
      };
    } catch (error) {
      console.error(`Error al obtener precio para producto ${product.id}:`, error);
      return { 
        id: product.id,
        price: product.defaultPrice || product.price 
      };
    }
  };

  useEffect(() => {
    // Set initial state with product base data
    if (category.products.length > 0 && !pricesFetched) {
      // Initialize all products with their default prices first
      const initialProducts = category.products.map(product => ({ 
        ...product, 
        defaultPrice: product.price 
      }));
      setProducts(initialProducts);
      
      // Setup initial quantities based on cart items
      const initialQuantities: Record<string, number> = {};
      initialProducts.forEach(product => {
        const cartItem = currentCartItems.find(item => 
          item.productId === product.id && 
          item.categoryId === category.id &&
          item.serviceId === serviceId
        );
        
        initialQuantities[product.id] = cartItem ? cartItem.quantity : 0;
      });
      setProductQuantities(initialQuantities);
      
      // Mark all products as loading prices
      const loadingIds = new Set(initialProducts.map(p => p.id));
      setLoadingProductIds(loadingIds);
      
      // Fetch updated prices individually
      initialProducts.forEach(async (product) => {
        try {
          const updatedPrice = await fetchUpdatedPrice(product);
          
          // Update the specific product price as it becomes available
          setProducts(prevProducts => 
            prevProducts.map(p => 
              p.id === updatedPrice.id ? { ...p, price: updatedPrice.price } : p
            )
          );
          
          // Mark this product as no longer loading
          setLoadingProductIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(updatedPrice.id);
            return newSet;
          });
        } catch (error) {
          console.error(`Error al actualizar precio para ${product.id}:`, error);
          // Even on error, mark the product as no longer loading to show default price
          setLoadingProductIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(product.id);
            return newSet;
          });
        }
      });
      
      // Mark prices as fetched to prevent refetching
      setPricesFetched(true);
    }
  }, [category, purchaseLocationId, serviceId, currentCartItems, pricesFetched]);

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
        >
          <ArrowLeft size={16} />
          <span>Volver a Categorías</span>
        </button>
        <h3 className="text-xl font-semibold ml-auto">{category.name}</h3>
      </div>
      
      {allProductsLoading ? (
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <TextSkeleton text="Calculando precios..." />
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

interface ServiceCardProps {
  id?: string;
  name: string;
  iconComponent?: LucideIcon;
  icon?: string;
  addToCart: (item: any) => void;
  externalUrl?: string;
  onCategorySelect?: (serviceId: string, categoryId: string, categoryName: string) => void;
  purchaseLocation?: any;
  forceOpen?: boolean;
  circular?: boolean;
  currentCartItems?: any[];
  className?: string;
}

const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(({
  id = '',
  name,
  iconComponent: IconComponent,
  icon,
  addToCart,
  externalUrl,
  onCategorySelect,
  purchaseLocation,
  forceOpen = false,
  circular = false,
  currentCartItems = [],
  className = "",
}, ref) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [imageError, setImageError] = useState(false);
  const dialogOpenRef = useRef(false);
  
  // Create a service object for the selectedService prop
  const currentService = { id, name };
  
  useEffect(() => {
    // Track if dialog was just opened to prevent auto-reopen
    if (isDialogOpen) {
      dialogOpenRef.current = true;
    }
    
    // Modificamos esta función para llamar directamente a ObtenerNivel2 cuando tenemos categoryId
    if (forceOpen && id && purchaseLocation && !dialogOpenRef.current) {
      setIsDialogOpen(true);
      
      // Si tenemos categoryId, cargar directamente los productos
      if (purchaseLocation.categoryId) {
        fetchProducts(id, purchaseLocation.categoryId);
      } else {
        // Solo si no hay categoryId, cargamos primero las categorías
        fetchCategories(id);
      }
    } else if (forceOpen && id && !dialogOpenRef.current) {
      setIsDialogOpen(true);
      fetchCategories(id);
    }
    
    // Reset the tracking ref when dialog closes
    if (!isDialogOpen && dialogOpenRef.current) {
      // Add a small delay to ensure we don't immediately reopen
      const timer = setTimeout(() => {
        dialogOpenRef.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [forceOpen, id, purchaseLocation, isDialogOpen]);

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
      // Llamada directa a ObtenerNivel2
      console.log(`Fetching products directly for service ${serviceId} and category ${categoryId}`);
      const response = await fetch(
        `/api/AlmangoXV1NETFramework/WebAPI/ObtenerNivel2?Nivel0=${serviceId}&Nivel1=${categoryId}`
      );
      
      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Products data:', data);
      
      const transformedProducts = data.map((product: any) => ({
        id: product.id || product.Nivel2Id,
        name: product.name || product.Nivel2Descripcion,
        price: product.price ? parseFloat(product.price) : (product.Precio ? parseFloat(product.Precio) : 0),
        image: product.image || product.Imagen || "",
        category: categoryId,
        textosId: product.TextosId || null
      }));
      
      // Crear una categoría temporal si no existe en el estado
      if (!categories.some(cat => cat.id === categoryId)) {
        const categoryName = purchaseLocation?.categoryName || "Productos";
        const tempCategory: Category = {
          id: categoryId,
          name: categoryName,
          image: "",
          products: transformedProducts
        };
        
        setCategories(prev => [...prev, tempCategory]);
        setSelectedCategory(tempCategory);
      } else {
        // Actualizar la categoría existente con los productos
        setCategories(prev => prev.map(cat => 
          cat.id === categoryId ? { ...cat, products: transformedProducts } : cat
        ));
        
        const updatedCategory = categories.find(cat => cat.id === categoryId);
        if (updatedCategory) {
          setSelectedCategory({ ...updatedCategory, products: transformedProducts });
        }
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
    
    if (id && !dialogOpenRef.current) {
      setIsDialogOpen(true);
      fetchCategories(id);
    }
  };
  
  const handleCategorySelect = (category: Category) => {
    if (id && onCategorySelect) {
      // Notificamos al componente padre para que muestre el modal de ubicación o los productos
      onCategorySelect(id, category.id, category.name);
      setIsDialogOpen(false);
    } else if (category.products.length > 0) {
      setSelectedCategory(category);
    } else if (id) {
      fetchProducts(id, category.id);
    }
  };

  const purchaseLocationId = purchaseLocation ? purchaseLocation.storeId : undefined;

  const getCardBackground = () => {
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

  const backgroundImage = getCardBackground();

  const isShowingCategoryCarousel = !selectedCategory && !isLoading && !error;

  return (
    <div 
      ref={ref}
      className={cn(
        "mb-6 mx-auto transition-all duration-500",
        circular ? 'max-w-[220px]' : 'max-w-md',
        className
      )}
      onClick={handleCardClick}
    >
      <Card 
        className={`${circular 
          ? "w-[220px] h-[220px] aspect-square rounded-full shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border-0 overflow-hidden group"
          : "w-[280px] h-[200px] rounded-lg shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border-0 overflow-hidden group"
        }`}
      >
        <CardContent className="p-0 flex flex-col items-center justify-end h-full relative">
          <div className="absolute inset-0 w-full h-full">
            <div className={`w-full h-full ${circular ? 'bg-gradient-to-t from-black/90 via-black/60 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/60 to-transparent'} absolute inset-0 z-10`} />
            <img 
              src={backgroundImage}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-95"
              onError={(e) => {
                console.error("Image failed to load:", backgroundImage);
                e.currentTarget.src = "/placeholder.svg";
                setImageError(true);
              }}
            />
          </div>
          <div className="relative z-20 px-3 text-center w-full absolute bottom-[30%] transition-transform duration-300 transform group-hover:translate-y-[-8px]">
            <h3 className={`${circular ? 'text-base' : 'text-xl'} font-bold text-center text-white drop-shadow-md transition-all duration-300 group-hover:text-[#ff6900] line-clamp-2 uppercase`}>
              {name}
            </h3>
          </div>
        </CardContent>
      </Card>
      
      <Dialog 
        open={isDialogOpen} 
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          // If closing, make sure we reset the category
          if (!open) {
            // Optional: can add a small delay here if needed
            setTimeout(() => {
              setSelectedCategory(null);
            }, 100);
          }
        }}
      >
        <DialogContent 
          className={
            `max-w-[850px] w-full max-h-[90vh] overflow-y-auto p-0
            ${!selectedCategory && !isLoading && !error ? 
              "sm:max-w-[850px] w-[100%] sm:w-auto rounded-none sm:rounded-lg"
              : "max-w-4xl"}`
          }
        >
          <div className="p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-center px-3 mx-auto text-orange-500 truncate uppercase">{name}</h2>
            
            {purchaseLocation && selectedCategory && (
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
                <TextSkeleton text="Cargando..." />
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
                onSelectCategory={(categoryId, categoryName) => {
                  // Find the category object with the matching ID
                  const category = categories.find(cat => cat.id === categoryId);
                  if (category) {
                    handleCategorySelect(category);
                  }
                }}
                selectedService={currentService}
                isLoading={isLoading}
                cartItems={currentCartItems}
              />
            ) : (
              <ProductGrid 
                category={selectedCategory} 
                addToCart={addToCart}
                onBack={() => setSelectedCategory(null)}
                serviceName={name}
                closeDialog={() => setIsDialogOpen(false)}
                serviceId={id}
                purchaseLocationId={purchaseLocationId}
                currentCartItems={currentCartItems}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

ServiceCard.displayName = "ServiceCard";

export default ServiceCard;
