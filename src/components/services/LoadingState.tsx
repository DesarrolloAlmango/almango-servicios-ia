
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart } from "lucide-react";

interface LoadingStateProps {
  handleBackToHome: () => void;
  openCart: () => void;
}

const LoadingState: React.FC<LoadingStateProps> = ({ handleBackToHome, openCart }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <main className="flex-grow py-8 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8 mt-4">
            <Button 
              variant="ghost" 
              onClick={handleBackToHome}
              className="flex items-center gap-2"
            >
              <ArrowLeft size={20} />
              <span>Volver</span>
            </Button>
            
            <Button 
              variant="ghost" 
              className="relative"
              onClick={openCart}
            >
              <ShoppingCart size={24} />
            </Button>
          </div>
          
          <h1 className="text-3xl font-normal mb-12 text-center text-gray-900 uppercase font-display">Nuestros Servicios</h1>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
            {[...Array(7)].map((_, i) => (
              <Skeleton key={i} className="h-48 w-full max-w-sm" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoadingState;
