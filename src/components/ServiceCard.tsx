import React, { useState, useCallback, forwardRef, useEffect, useRef } from 'react';
import { Button } from "./ui/button";
import CategoryCarousel from "./CategoryCarousel";
import { ChevronDown, ChevronUp, LucideIcon, ExternalLink, ArrowLeft, ShoppingCart, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { AspectRatio } from "./ui/aspect-ratio";
import { cn } from "@/lib/utils";
import { Skeleton, PriceSkeleton, TextSkeleton } from "./ui/skeleton";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import ProductGrid from "./ProductGrid";
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

// Extended service interface with price and image fields that might be used elsewhere
interface ServiceDetails {
  id: string;
  name: string;
  price?: number;
  image?: string;
}
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
  pendingCategoryId?: string;
  pendingCategoryName?: string;
  commerceId?: string;
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
  pendingCategoryId,
  pendingCategoryName,
  commerceId
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
  const categorySelectionInProgressRef = useRef(false);

  // Create a service object for the selectedService prop
  const currentService: ServiceDetails = {
    id,
    name
  };
  useEffect(() => {
    // Track if dialog was just opened to prevent auto-reopen
    if (isDialogOpen) {
      dialogOpenRef.current = true;
    }

    // Special handling for when we have purchase location and pending category ID
    if (isDialogOpen && id && purchaseLocation && pendingCategoryId) {
      console.log("Loading products for pending category with existing purchase location:", {
        serviceId: id,
        categoryId: pendingCategoryId,
        categoryName: pendingCategoryName
      });

      // Directly fetch products for the pending category
      fetchProducts(id, pendingCategoryId);
    }
    // Normal dialog open handling
    else if (forceOpen && id && purchaseLocation && !dialogOpenRef.current) {
      console.log("Force open dialog with purchase location:", purchaseLocation);
      setIsDialogOpen(true);

      // Si tenemos categoryId, cargar directamente los productos
      if (purchaseLocation.categoryId) {
        console.log("Category ID found, fetching products directly:", purchaseLocation.categoryId);
        fetchProducts(id, purchaseLocation.categoryId);
      } else {
        // Solo si no hay categoryId, cargamos primero las categorías
        console.log("No category ID, loading categories first");
        fetchCategories(id, commerceId);
      }
    } else if (forceOpen && id && !dialogOpenRef.current) {
      console.log("Force open dialog without purchase location");
      setIsDialogOpen(true);
      fetchCategories(id, commerceId);
    }

    // Reset the tracking ref when dialog closes
    if (!isDialogOpen && dialogOpenRef.current) {
      // Add a small delay to ensure we don't immediately reopen
      const timer = setTimeout(() => {
        dialogOpenRef.current = false;
        // Also reset category selection flag when dialog is closed
        categorySelectionInProgressRef.current = false;
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [forceOpen, id, purchaseLocation, isDialogOpen, pendingCategoryId, pendingCategoryName]);
  // Function to check category permission
  const checkCategoryPermission = async (commerceId: string, serviceId: string, categoryId: string): Promise<boolean> => {
    try {
      const url = `https://app.almango.com.uy/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${serviceId}&Nivel1=${categoryId}`;
      console.log(`Checking category permission with URL: ${url}`);
      console.log(`Parameters - commerceId: ${commerceId}, serviceId: ${serviceId}, categoryId: ${categoryId}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        console.warn(`Category permission check failed for category ${categoryId}:`, response.status);
        return false;
      }
      const data = await response.json();
      console.log(`Category permission check for ${categoryId}:`, data);
      return data.Permiso === true;
    } catch (error) {
      console.error(`Error checking category permission for ${categoryId}:`, error);
      return false;
    }
  };

  const fetchCategories = async (serviceId: string, commerceId?: string) => {
    console.log("Fetching categories for service:", serviceId, "commerceId:", commerceId);
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerNivel1?Nivel0=${serviceId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar categorías: ${response.status}`);
      }
      const data = await response.json();
      console.log("Categories data received:", data);
      
      let transformedCategories = data.map((category: any) => ({
        id: category.id || category.Nivel1Id,
        name: category.name || category.Nivel1Descripcion,
        image: category.image || category.Imagen || "",
        products: []
      }));

      // Filter categories by permissions if commerceId is provided
      if (commerceId && serviceId) {
        console.log("Checking category permissions with commerceId:", commerceId, "serviceId:", serviceId);
        const permissionChecks = transformedCategories.map((category: Category) => 
          checkCategoryPermission(commerceId, serviceId, category.id)
        );
        const permissions = await Promise.all(permissionChecks);
        const filteredCategories = transformedCategories.filter((_: any, index: number) => permissions[index]);
        console.log(`Filtered ${filteredCategories.length} of ${transformedCategories.length} categories based on permissions`);
        transformedCategories = filteredCategories;
      }
      
      setCategories(transformedCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      toast.error("Error al cargar categorías");
      console.error("Error fetching categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to fetch updated price for a specific product
  const fetchUpdatedPrice = async (product: Product, serviceId: string, categoryId: string, purchaseLocationId?: string): Promise<{
    id: string;
    price: number;
  }> => {
    if (!purchaseLocationId || !serviceId || !categoryId) {
      console.log("Missing required parameters for price fetch:", {
        purchaseLocationId,
        serviceId,
        categoryId
      });
      return {
        id: product.id,
        price: product.defaultPrice || product.price
      };
    }
    try {
      // Log the API call for debugging
      console.log(`ServiceCard: Fetching price for: proveedorId=${purchaseLocationId}, nivel0=${serviceId}, nivel1=${categoryId}, nivel2=${product.id}`);
      const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerPrecio?Proveedorid=${purchaseLocationId}&Nivel0=${serviceId}&Nivel1=${categoryId}&Nivel2=${product.id}`);
      if (!response.ok) {
        throw new Error(`Error al obtener precio: ${response.status}`);
      }
      const data = await response.json();
      console.log(`ServiceCard: Price data received for ${product.id}:`, data);

      // IMPORTANT: Only use ObtenerPrecio price if it's greater than 0
      if (data && typeof data.Precio === 'number') {
        if (data.Precio > 0) {
          console.log(`ServiceCard: Using ObtenerPrecio price for product ${product.id}: ${data.Precio}`);
          return {
            id: product.id,
            price: data.Precio
          };
        } else {
          console.log(`ServiceCard: ObtenerPrecio returned zero for product ${product.id}, using default price: ${product.defaultPrice || product.price}`);
          return {
            id: product.id,
            price: product.defaultPrice || product.price
          };
        }
      } else {
        console.warn(`ServiceCard: Invalid price data format for product ${product.id}:`, data);
        return {
          id: product.id,
          price: product.defaultPrice || product.price
        };
      }
    } catch (error) {
      console.error(`ServiceCard: Error fetching price for product ${product.id}:`, error);
      return {
        id: product.id,
        price: product.defaultPrice || product.price
      };
    }
  };

  // Fetch prices for all products in a category
  const fetchAllPrices = async (products: Product[], serviceId: string, categoryId: string, purchaseLocationId?: string) => {
    if (!purchaseLocationId || !serviceId || products.length === 0) {
      console.log("ServiceCard: Skipping price update - missing data", {
        purchaseLocationId,
        serviceId,
        productCount: products.length
      });
      return products;
    }
    console.log(`ServiceCard: Updating prices for all ${products.length} products in category ${categoryId}`);
    try {
      // Fetch updated prices in parallel
      const pricePromises = products.map(product => fetchUpdatedPrice(product, serviceId, categoryId, purchaseLocationId));
      const updatedPrices = await Promise.all(pricePromises);
      console.log("ServiceCard: All prices fetched successfully:", updatedPrices);

      // Update product prices with the fetched values
      const updatedProducts = products.map(product => {
        const updatedPrice = updatedPrices.find(p => p.id === product.id);
        if (updatedPrice) {
          return {
            ...product,
            price: updatedPrice.price
          };
        }
        return product;
      });
      console.log("ServiceCard: Products with updated prices:", updatedProducts);
      return updatedProducts;
    } catch (error) {
      console.error("ServiceCard: Error updating all prices:", error);
      return products; // Return original products if there's an error
    }
  };

  // Update the fetchProducts function to include price fetching
  const fetchProducts = async (serviceId: string, categoryId: string) => {
    console.log(`ServiceCard: Fetching products for service ${serviceId} and category ${categoryId}`);
    setIsLoading(true);
    try {
      // Call ObtenerNivel2 to get initial product data
      const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerNivel2?Nivel0=${serviceId}&Nivel1=${categoryId}`);
      if (!response.ok) {
        throw new Error(`Error al cargar productos: ${response.status}`);
      }
      const data = await response.json();
      console.log('ServiceCard: Products data received from ObtenerNivel2:', data);

      // Transform products and set default prices
      let transformedProducts = data.map((product: any) => {
        console.log('=== DEBUG Product Mapping ===');
        console.log('Original product:', product);
        console.log('Product TextosId from API:', product.TextosId);
        console.log('Product TextosId type:', typeof product.TextosId);
        console.log('=== END Product Mapping DEBUG ===');
        return {
          id: product.id || product.Nivel2Id,
          name: product.name || product.Nivel2Descripcion,
          price: 0,
          // Initialize with 0 to show loading state and disable buttons
          defaultPrice: product.price ? parseFloat(product.price) : product.Precio ? parseFloat(product.Precio) : 0,
          image: product.image || product.Imagen || "",
          category: categoryId,
          textosId: product.TextosId || null
        };
      });
      console.log('ServiceCard: Transformed products with textosId:', transformedProducts);

      // Buscar la categoría existente o crear una temporal
      let categoryToUpdate: Category | undefined = categories.find(cat => cat.id === categoryId);

      // CRITICAL CHANGE: Fetch prices immediately after ObtenerNivel2 when purchase location is available
      const purchaseLocationId = purchaseLocation ? purchaseLocation.storeId : undefined;
      if (purchaseLocationId) {
        console.log(`ServiceCard: Purchase location found (${purchaseLocationId}), fetching prices immediately`);
        transformedProducts = await fetchAllPrices(transformedProducts, serviceId, categoryId, purchaseLocationId);
      }
      if (!categoryToUpdate) {
        // Si la categoría no existe en el estado, crear una temporal
        console.log("ServiceCard: Category not found in state, creating temporary one");
        const categoryName = pendingCategoryName || purchaseLocation?.categoryName || "Productos";
        categoryToUpdate = {
          id: categoryId,
          name: categoryName,
          image: "",
          products: transformedProducts
        };

        // Actualizar el estado de categorías
        setCategories(prev => [...prev, categoryToUpdate!]);
      } else {
        // Si la categoría existe, actualizar sus productos
        console.log("ServiceCard: Category found in state, updating products");
        categoryToUpdate = {
          ...categoryToUpdate,
          products: transformedProducts
        };

        // Actualizar el estado de categorías
        setCategories(prev => prev.map(cat => cat.id === categoryId ? categoryToUpdate! : cat));
      }

      // Siempre actualizar selectedCategory para mostrar los productos
      console.log("ServiceCard: Setting selected category:", categoryToUpdate);
      setSelectedCategory(categoryToUpdate);

      // After setting the category and products, dispatch an event to notify any components
      // that the product grid has been shown with updated data
      document.dispatchEvent(new CustomEvent('productGridShown'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos');
      toast.error("Error al cargar productos");
      console.error("ServiceCard: Error fetching products:", err);
    } finally {
      setIsLoading(false);
      // Reset the category selection flag once products are loaded
      categorySelectionInProgressRef.current = false;
    }
  };
  const handleCardClick = () => {
    if (externalUrl) {
      window.location.href = externalUrl;
      return;
    }
    if (id && !dialogOpenRef.current) {
      setIsDialogOpen(true);
      fetchCategories(id, commerceId);
    }
  };
  const handleCategorySelect = (category: Category) => {
    console.log("ServiceCard: Category selected:", category);

    // Set the flag to prevent closing the dialog while loading products
    categorySelectionInProgressRef.current = true;

    // Siempre cargamos productos primero, independientemente de si hay ubicación o no
    if (id) {
      console.log("ServiceCard: Fetching products for category - regardless of purchase location:", category.id);
      fetchProducts(id, category.id);

      // Si NO hay ubicación de compra, notificamos al padre para mostrar el modal después
      if (!purchaseLocation && onCategorySelect) {
        console.log("ServiceCard: Calling onCategorySelect from parent - no purchase location exists");

        // Usamos setTimeout para asegurarnos de que los productos se carguen primero
        setTimeout(() => {
          onCategorySelect(id, category.id, category.name);
        }, 100);
      }
      return true; // Return true to indicate successful processing
    }
    return true; // Default return value
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
  return <div ref={ref} className={cn("mb-6 mx-auto transition-all duration-500", circular ? 'max-w-[220px]' : 'max-w-md', className)} onClick={handleCardClick}>
      <Card className={`${circular ? "w-[220px] h-[220px] aspect-square rounded-full shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border-0 overflow-hidden group" : "w-[280px] h-[200px] rounded-lg shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 cursor-pointer border-0 overflow-hidden group"}`}>
        <CardContent className="p-0 flex flex-col items-center justify-end h-full relative">
          <div className="absolute inset-0 w-full h-full">
            <div className={`w-full h-full ${circular ? 'bg-gradient-to-t from-black/90 via-black/60 to-transparent' : 'bg-gradient-to-t from-black/80 via-black/60 to-transparent'} absolute inset-0 z-10`} />
            <img src={backgroundImage} alt={name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 brightness-90 group-hover:brightness-95" onError={e => {
            console.error("Image failed to load:", backgroundImage);
            e.currentTarget.src = "/placeholder.svg";
            setImageError(true);
          }} />
          </div>
          <div className="relative z-20 px-3 text-center w-full absolute bottom-[30%] transition-transform duration-300 transform group-hover:translate-y-[-8px]">
            <h3 className={`${circular ? 'text-base' : 'text-xl'} font-bold text-center text-white drop-shadow-md transition-all duration-300 group-hover:text-[#ff6900] line-clamp-2 uppercase`}>
              {name}
            </h3>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={open => {
      console.log("Dialog open change:", open, "Category selection in progress:", categorySelectionInProgressRef.current);

      // If a category selection is in progress and trying to close, prevent it
      if (!open && categorySelectionInProgressRef.current) {
        console.log("Preventing dialog from closing during category selection");
        return;
      }
      setIsDialogOpen(open);
      // If closing, make sure we reset the category with a delay
      if (!open) {
        console.log("Dialog closing, will reset selected category after delay");
        // Add a delay to prevent issues with transitions
        setTimeout(() => {
          setSelectedCategory(null);
          console.log("Selected category reset to null");
        }, 300);
      }
    }}>
        <DialogContent className={`max-w-[850px] w-full max-h-[90vh] overflow-y-auto p-0
            ${!selectedCategory && !isLoading && !error ? "sm:max-w-[850px] w-[100%] sm:w-auto rounded-none sm:rounded-lg" : "max-w-4xl"}`}
      // Disable auto-close during category selection
      hideCloseButton={categorySelectionInProgressRef.current}>
          {/* Add DialogTitle for accessibility */}
          <DialogTitle className="sr-only">{name}</DialogTitle>
          
          <div className="p-4 sm:p-6">
            <h2 className="text-xl font-bold mb-2 sm:mb-4 text-center px-3 mx-auto text-orange-500 uppercase \ntruncate sm:truncate-0 sm:whitespace-normal sm:break-words\nmax-w-[300px] sm:max-w-none">{name}</h2>
            
            {purchaseLocation && selectedCategory && <div className="mb-4 bg-blue-50 p-3 rounded-lg border border-blue-200 text-sm">
                <span className="font-medium text-blue-700">Lugar de compra: </span>
                <span className="text-blue-600">
                  {purchaseLocation.storeId === "other" ? purchaseLocation.otherLocation : purchaseLocation.storeName}
                </span>
              </div>}
            
            {isLoading ? <div className="flex justify-center items-center h-40">
                <TextSkeleton text="Cargando..." />
              </div> : error ? <div className="bg-red-50 p-4 rounded-md border border-red-200 text-red-700">
                <p className="font-medium">Error: {error}</p>
                <Button variant="outline" className="mt-2" onClick={() => id && fetchCategories(id, commerceId)}>
                  Reintentar
                </Button>
              </div> : !selectedCategory ? <CategoryCarousel categories={categories} onSelectCategory={(categoryId, categoryName) => {
            // Find the category object with the matching ID
            const category = categories.find(cat => cat.id === categoryId);
            if (category) {
              handleCategorySelect(category);
            }
          }} selectedService={currentService} isLoading={isLoading} cartItems={currentCartItems} purchaseLocation={purchaseLocation} /> : <ProductGrid category={selectedCategory} addToCart={addToCart} onBack={() => {
            console.log("Back to categories clicked");
            setSelectedCategory(null);
          }} serviceName={name} closeDialog={() => {
            console.log("Close dialog requested from ProductGrid");
            setIsDialogOpen(false);
          }} serviceId={id} purchaseLocationId={purchaseLocationId} currentCartItems={currentCartItems} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>;
});
ServiceCard.displayName = "ServiceCard";
export default ServiceCard;