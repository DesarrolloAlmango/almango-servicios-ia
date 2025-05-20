
import React from "react";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ServiciosHeaderProps {
  handleBackToHome: () => void;
  getCartItemsCount: () => number;
  setIsCartOpen: (isOpen: boolean) => void;
}

const ServiciosHeader: React.FC<ServiciosHeaderProps> = ({ 
  handleBackToHome, 
  getCartItemsCount, 
  setIsCartOpen 
}) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-[#F8F4F0] shadow-md">
      <div className="container mx-auto">
        <div className="flex justify-between items-center py-4 px-4">
          <Button variant="ghost" onClick={handleBackToHome} className="flex items-center gap-2 text-gray-800">
            <ArrowLeft size={20} />
            <span>Volver</span>
          </Button>
          
          <div className="relative cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={40} className="text-gray-800" />
            {getCartItemsCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-white text-sm rounded-full h-6 w-6 flex items-center justify-center border-2 border-[#FDE1D3]">
                {getCartItemsCount()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiciosHeader;
