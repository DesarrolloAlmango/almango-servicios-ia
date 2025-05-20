
import React from "react";

interface StoreInfoProps {
  commerceId?: string;
  storeName: string;
  selectedService?: {
    id: string;
    name: string;
  };
  selectedCategory?: {
    id: string;
    name: string;
  };
  isLoadingProducts?: boolean;
}

const StoreInfo: React.FC<StoreInfoProps> = ({ 
  commerceId, 
  storeName, 
  selectedService, 
  selectedCategory,
  isLoadingProducts = false
}) => {
  if (!commerceId && !selectedService) return null;
  
  return (
    <div className="bg-white/80 shadow-md rounded-lg p-4 mb-6 transition-all duration-300">
      <h2 className="text-xl font-semibold">
        {commerceId ? `Servicios de ${storeName}` : (selectedService ? selectedService.name : "Servicios")}
      </h2>
      <p className="text-sm text-muted-foreground">
        {commerceId 
          ? "Todos los servicios disponibles en esta ubicación" 
          : (selectedCategory 
              ? `Categoría: ${selectedCategory.name}` 
              : "Seleccione una categoría para continuar"
            )
        }
      </p>
      
      {isLoadingProducts && (
        <div className="mt-2">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse"></div>
            <span className="text-sm">Cargando productos...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoreInfo;
