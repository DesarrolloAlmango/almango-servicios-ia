
import React from "react";

interface StoreInfoProps {
  commerceId?: string;
  storeName: string;
}

const StoreInfo: React.FC<StoreInfoProps> = ({ commerceId, storeName }) => {
  if (!commerceId) return null;
  
  return (
    <div className="bg-white/80 shadow-md rounded-lg p-4 mb-6">
      <h2 className="text-xl font-semibold">Servicios de {storeName}</h2>
      <p className="text-sm text-muted-foreground">
        Todos los servicios disponibles en esta ubicación
      </p>
    </div>
  );
};

export default StoreInfo;
