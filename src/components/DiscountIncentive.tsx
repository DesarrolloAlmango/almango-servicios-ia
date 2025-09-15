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
  
  // Definir niveles de descuento
  const discountLevels = [
    { minItems: 3, percentage: 10, label: "3-4 productos" },
    { minItems: 5, percentage: 15, label: "5-9 productos" },
    { minItems: 10, percentage: 20, label: "10+ productos" }
  ];
  
  // Encontrar el siguiente nivel de descuento
  const nextLevel = discountLevels.find(level => totalQuantity < level.minItems);
  const currentLevel = discountLevels.reverse().find(level => totalQuantity >= level.minItems);
  
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

  return (
    <div className={`bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 space-y-3 ${className}`}>
      <div className="flex items-center gap-2">
        <Gift className="h-5 w-5 text-green-600" />
        <h4 className="font-semibold text-green-800">¡Descuentos Especiales!</h4>
      </div>
      
      {/* Estado actual */}
      <div className="space-y-2">
        {currentDiscount ? (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-green-700">
              🎉 ¡Descuento activo del {currentDiscount.percentage}%!
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              -{currentDiscount.percentage}%
            </Badge>
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            Tienes {totalQuantity} producto{totalQuantity !== 1 ? 's' : ''} del rubro
          </div>
        )}
        
        {/* Progreso hacia el siguiente nivel */}
        {nextLevel && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700">
                Progreso hacia {nextLevel.percentage}% de descuento:
              </span>
              <span className="font-medium text-blue-600">
                {totalQuantity}/{nextLevel.minItems}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <TrendingUp className="h-4 w-4" />
              <span>
                ¡Solo {itemsNeeded} producto{itemsNeeded !== 1 ? 's' : ''} más para {nextLevel.percentage}% de descuento!
              </span>
            </div>
          </div>
        )}
        
        {/* Si ya alcanzó el máximo */}
        {!nextLevel && currentDiscount && (
          <div className="text-sm text-green-600 font-medium">
            🏆 ¡Has alcanzado el máximo descuento del 20%!
          </div>
        )}
      </div>
      
      {/* Información de todos los niveles */}
      <div className="pt-2 border-t border-green-200">
        <div className="text-xs text-gray-600 mb-2">Niveles de descuento disponibles:</div>
        <div className="flex flex-wrap gap-2">
          {discountLevels.reverse().map((level, index) => (
            <Badge 
              key={index}
              variant={totalQuantity >= level.minItems ? "default" : "outline"}
              className={`text-xs ${
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
    </div>
  );
};

export default DiscountIncentive;