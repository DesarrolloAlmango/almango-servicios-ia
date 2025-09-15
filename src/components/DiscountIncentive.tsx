import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gift, TrendingUp } from "lucide-react";
import { CartItem } from "@/pages/Servicios";
import { calculateRubro1Discount } from "@/utils/discountUtils";

interface DiscountIncentiveProps {
  cartItems: CartItem[];
  className?: string;
  compact?: boolean;
}

export const DiscountIncentive: React.FC<DiscountIncentiveProps> = ({ 
  cartItems, 
  className = "",
  compact = false 
}) => {
  // Filtrar productos del rubro 1
  const rubro1Items = cartItems.filter(item => item.serviceId === "1");
  const totalQuantity = rubro1Items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = rubro1Items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Calcular descuento actual
  const currentDiscount = calculateRubro1Discount(cartItems);
  
  // Formatear precio en pesos uruguayos
  const formatPrice = (amount: number) => {
    return amount.toLocaleString('es-UY', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };
  
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
  
  // Calcular ahorro potencial para el siguiente nivel
  const calculatePotentialSavings = () => {
    if (!nextLevel) return 0;
    return Math.round(totalAmount * (nextLevel.percentage / 100));
  };
  
  const potentialSavings = calculatePotentialSavings();

  if (compact) {
    return (
      <div className={`sticky top-0 z-30 bg-gradient-to-r from-green-500 to-blue-500 text-white px-3 py-2 shadow-md animate-fade-in ${className}`}>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Gift className="h-4 w-4" />
            {currentDiscount ? (
              <span className="font-medium">
                🎉 Ahorrando ${formatPrice(currentDiscount.amount)}
              </span>
            ) : (
              <span>Descuentos disponibles</span>
            )}
          </div>
          
          {nextLevel && (
            <div className="flex items-center gap-2">
              <span className="text-xs">
                +{itemsNeeded} = ${formatPrice(potentialSavings)}
              </span>
              <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          {!nextLevel && currentDiscount && (
            <span className="text-xs">🏆 Ahorro máximo: ${formatPrice(currentDiscount.amount)}</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3 space-y-2 animate-fade-in ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gift className="h-4 w-4 text-green-600" />
          <h4 className="font-medium text-green-800 text-sm">Descuentos Especiales</h4>
        </div>
        
        {currentDiscount && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
              -{currentDiscount.percentage}%
            </Badge>
            <span className="text-xs font-medium text-green-700">
              Ahorrás ${formatPrice(currentDiscount.amount)}
            </span>
          </div>
        )}
      </div>
      
      {nextLevel ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-gray-700">
            <span>Hacia ${formatPrice(potentialSavings)} de ahorro:</span>
            <span className="font-medium">{totalQuantity}/{nextLevel.minItems}</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div className="flex items-center gap-1 text-xs text-blue-600">
            <TrendingUp className="h-3 w-3" />
            <span>¡Solo {itemsNeeded} más para ahorrar ${formatPrice(potentialSavings)}!</span>
          </div>
        </div>
      ) : (
        <div className="text-xs text-green-600 font-medium">
          🏆 Máximo ahorro: ${formatPrice(currentDiscount?.amount || 0)}
        </div>
      )}
      
      <div className="flex gap-1 pt-1">
        {discountLevels.map((level, index) => (
          <Badge 
            key={index}
            variant={totalQuantity >= level.minItems ? "default" : "outline"}
            className={`text-xs px-1.5 py-0.5 ${
              totalQuantity >= level.minItems 
                ? "bg-green-500 hover:bg-green-600" 
                : "border-gray-300 text-gray-500"
            }`}
          >
            {level.label}: {level.percentage}%
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default DiscountIncentive;