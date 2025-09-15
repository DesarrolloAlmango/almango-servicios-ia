import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, TrendingUp } from "lucide-react";
import { CartItem } from "@/pages/Servicios";
import { calculateRubro1Discount } from "@/utils/discountUtils";

interface DiscountIncentiveProps {
  cartItems: CartItem[];
  className?: string;
}

export const DiscountIncentive: React.FC<DiscountIncentiveProps> = ({ 
  cartItems, 
  className = "" 
}) => {
  // Filtrar productos del rubro 1
  const rubro1Items = cartItems.filter(item => item.serviceId === "1");
  const totalQuantity = rubro1Items.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calcular descuento actual
  const currentDiscount = calculateRubro1Discount(cartItems);
  
  // Calcular el total de productos del rubro 1 para calcular ahorros
  const rubro1Total = rubro1Items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Definir niveles de descuento
  const discountLevels = [
    { minItems: 3, percentage: 10, label: "3-4" },
    { minItems: 5, percentage: 15, label: "5-9" },
    { minItems: 10, percentage: 20, label: "10+" }
  ];
  
  // Encontrar el siguiente nivel de descuento
  const nextLevel = discountLevels.find(level => totalQuantity < level.minItems);
  
  // Si no hay productos del rubro 1, no mostrar nada
  if (totalQuantity === 0) {
    return null;
  }

  // Calcular progreso hacia el siguiente nivel
  const getProgress = () => {
    if (!nextLevel) return 100; // Ya alcanzó el máximo descuento
    return (totalQuantity / nextLevel.minItems) * 100;
  };

  const progress = getProgress();
  const itemsNeeded = nextLevel ? nextLevel.minItems - totalQuantity : 0;
  
  // Calcular ahorro en pesos del siguiente nivel
  const nextLevelSavings = nextLevel ? Math.round(rubro1Total * (nextLevel.percentage / 100)) : 0;
  
  // Formatear precio
  const formatPrice = (price: number): string => {
    return price.toLocaleString('es-UY', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-green-600" />
          <span className="text-sm font-medium text-green-800">
            {currentDiscount ? (
              <>🎉 -{currentDiscount.percentage}% (${formatPrice(currentDiscount.amount)} ahorrado)</>
            ) : (
              <>Descuentos: {totalQuantity} productos</>
            )}
          </span>
        </div>
        
        {nextLevel && (
          <div className="text-xs text-blue-600 font-medium">
            +{itemsNeeded} = {nextLevel.percentage}% (${formatPrice(nextLevelSavings)})
          </div>
        )}
        
        {!nextLevel && currentDiscount && (
          <div className="text-xs text-green-600 font-medium">🏆 Máximo</div>
        )}
      </div>
      
      {nextLevel && (
        <div className="mt-2">
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-600">{totalQuantity}/{nextLevel.minItems}</span>
            <div className="flex gap-1">
              {discountLevels.map((level, index) => (
                <Badge 
                  key={index}
                  variant={totalQuantity >= level.minItems ? "default" : "outline"}
                  className={`text-xs px-1 py-0 h-4 ${
                    totalQuantity >= level.minItems 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : "border-gray-300 text-gray-500"
                  }`}
                >
                  {level.percentage}%
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscountIncentive;