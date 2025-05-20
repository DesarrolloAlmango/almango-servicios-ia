
import React from "react";
import { MapPin } from "lucide-react";

interface StoreInfoProps {
  commerceId?: string;
  storeName: string;
}

const StoreInfo: React.FC<StoreInfoProps> = ({ commerceId, storeName }) => {
  if (!commerceId || !storeName) return null;
  
  return (
    <div className="mb-6 bg-white/70 p-3 rounded-lg border border-gray-300">
      <h3 className="font-medium text-gray-800 mb-2">Lugar de compra fijo:</h3>
      <div className="flex items-center gap-2">
        <MapPin className="text-gray-800" size={16} />
        <span className="text-gray-700">{storeName}</span>
      </div>
    </div>
  );
};

export default StoreInfo;
