import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { ShoppingCart, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import CategoryCarousel from "@/components/CategoryCarousel";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  image: string;
  price?: number;
  count?: number;
}

interface ServiceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  id?: string;
  name: string;
  iconComponent?: React.ComponentType<any>;
  icon?: string;
  addToCart: (item: any) => void;
  externalUrl?: string;
  onCategorySelect?: (serviceId: string, categoryId: string, categoryName: string) => void;
  purchaseLocation?: {
    storeId: string;
    storeName: string;
    otherLocation?: string;
    departmentId?: string;
    departmentName?: string;
    locationId?: string;
    locationName?: string;
    categoryId?: string;
    categoryName?: string;
  } | null;
  forceOpen?: boolean;
  circular?: boolean;
  currentCartItems?: any[];
}

const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(({
  id,
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
  className,
  ...props
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [showAddToCart, setShowAddToCart] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [autoSelectCategoryId, setAutoSelectCategoryId] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    click: () => {
      if (cardRef.current) {
        cardRef.current.click();
      }
    }
  }));

  useEffect(() => {
    if (forceOpen) {
      setIsExpanded(true);
    }
  }, [forceOpen]);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!isExpanded || !id) return;
      setIsLoading(true);
      try {
        const response = await fetch(`/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios3?ServicioId=${id}`);
        if (!response.ok) {
          throw new Error("Error al obtener las categorías de servicios");
        }
        const data = await response.json();
        const parsedData = JSON.parse(data.SDTTarjetasServiciosJson);
        setCategories(parsedData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("No se pudieron cargar las categorías.");
        setCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (isExpanded) {
      fetchCategories();
    }
  }, [isExpanded, id]);

  useEffect(() => {
    if (purchaseLocation && purchaseLocation.categoryId) {
      setAutoSelectCategoryId(purchaseLocation.categoryId);
    }
  }, [purchaseLocation]);

  const handleCardClick = () => {
    if (externalUrl) {
      window.open(externalUrl, "_blank");
      return;
    }

    if (onCategorySelect && id) {
      const shouldExpand = onCategorySelect(id, "", "");
      if (shouldExpand === false) {
        return;
      }
    }

    setIsExpanded(prev => !prev);
    setShowAddToCart(false);
    setSelectedCategory(null);
    setQuantity(1);
  };

  const handleCategorySelect = (categoryId: string, categoryName: string) => {
    if (!id) return;
    setSelectedCategory({
      id: categoryId,
      name: categoryName
    });
    setShowAddToCart(true);
    if (onCategorySelect) {
      onCategorySelect(id, categoryId, categoryName);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedCategory || !id) return;
    setIsAddingToCart(true);
    try {
      const itemToAdd = {
        id: `${id}-${selectedCategory.id}`,
        name: `${name} - ${selectedCategory.name}`,
        price: selectedCategory.price || 100,
        quantity: quantity,
        image: selectedCategory.image,
        serviceCategory: name,
        serviceId: id,
        categoryId: selectedCategory.id,
        productId: null,
        departmentId: purchaseLocation?.departmentId,
        locationId: purchaseLocation?.locationId
      };
      addToCart(itemToAdd);
      toast.success(`${quantity} ${name} - ${selectedCategory.name} agregado al carrito!`);
      setIsExpanded(false);
      setShowAddToCart(false);
      setSelectedCategory(null);
      setQuantity(1);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("No se pudo agregar al carrito.");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const existingCartItem = currentCartItems.find(item => item.serviceId === id && item.categoryId === selectedCategory?.id);
  const cartQuantity = existingCartItem ? existingCartItem.quantity : 0;

  return <Card className={`w-full shadow-md transition-all duration-300 ease-in-out ${isExpanded ? "translate-y-0" : "translate-y-0"} ${className}`} style={{
    cursor: externalUrl ? "pointer" : "auto"
  }}>
      <button ref={cardRef} onClick={handleCardClick} className="w-full h-full flex flex-col items-center justify-center p-4 relative outline-none">
        <CardHeader className="flex flex-col items-center justify-center space-y-2 p-0">
          {circular ? <div className="rounded-full border-2 border-primary flex items-center justify-center w-24 h-24 overflow-hidden bg-secondary/30">
              {IconComponent ? <IconComponent className="h-12 w-12 text-primary" /> : icon ? <img src={icon} alt={name} className="max-w-full max-h-full" /> : <ShoppingCart className="h-12 w-12 text-primary" />}
            </div> : <div className="w-full aspect-video overflow-hidden rounded-md">
              {IconComponent ? <IconComponent className="h-12 w-12 text-primary" /> : icon ? <img src={icon} alt={name} className="max-w-full max-h-full" /> : <ShoppingCart className="h-12 w-12 text-primary" />}
            </div>}
          <CardTitle className="text-lg font-semibold text-center">{name}</CardTitle>
        </CardHeader>
      </button>

      {isExpanded && <CardContent className="p-4">
          {purchaseLocation ? <Badge variant="outline" className="mb-4 w-full">
              Lugar de compra registrado: {purchaseLocation.storeName}
              {purchaseLocation.departmentName && purchaseLocation.locationName && <>
                  ({purchaseLocation.departmentName}, {purchaseLocation.locationName})
                </>}
            </Badge> : <div className="text-center text-muted-foreground mb-4">
              Selecciona un lugar de compra para ver las categorías
            </div>}

          {purchaseLocation && <CategoryCarousel categories={categories} onSelectCategory={handleCategorySelect} selectedService={{
          id: id,
          name: name
        }} isLoading={isLoading} cartItems={currentCartItems} purchaseLocation={purchaseLocation} autoSelectCategoryId={autoSelectCategoryId} />}

          {showAddToCart && selectedCategory && <div className="mt-4">
              <Separator className="my-2" />
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">
                  {selectedCategory.name}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(q => Math.max(1, q - 1))} disabled={quantity <= 1}>
                    -
                  </Button>
                  <Input type="number" className="w-16 text-center text-sm" value={quantity} onChange={(e) => {
                  const value = parseInt(e.target.value);
                  setQuantity(isNaN(value) ? 1 : Math.max(1, value));
                }} min="1" />
                  <Button variant="ghost" size="sm" onClick={() => setQuantity(q => q + 1)}>
                    +
                  </Button>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Precio: ${selectedCategory.price || 100}
                </div>
                <Button size="sm" onClick={handleAddToCart} disabled={isAddingToCart}>
                  {isAddingToCart ? "Agregando..." : `Agregar ${quantity} al carrito`}
                </Button>
              </div>
              {cartQuantity > 0 && <div className="mt-2 text-green-500 text-sm">
                  Ya tienes {cartQuantity} en el carrito
                </div>}
            </div>}
        </CardContent>}
    </Card>;
});
ServiceCard.displayName = "ServiceCard";
export default ServiceCard;
