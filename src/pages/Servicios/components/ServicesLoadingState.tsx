
import React from "react";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import ServiciosBackground from "./ServiciosBackground";

const ServicesLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <ServiciosBackground />
      
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#F8F4F0] shadow-md">
        <div className="container mx-auto">
          <div className="flex justify-between items-center py-4 px-4">
            <Button variant="ghost" className="flex items-center gap-2 text-gray-800">
              <ArrowLeft size={20} />
              <span>Volver</span>
            </Button>
            
            <div className="relative cursor-pointer">
              <ShoppingCart size={40} className="text-gray-800" />
            </div>
          </div>
        </div>
      </div>
      
      <main className="flex-grow py-8 px-4 relative z-10 servicios-page mt-16">
        <div className="container mx-auto">
          <div className="flex flex-col items-center justify-center mt-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <h3 className="text-xl font-medium mt-2">Cargando servicios...</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mt-12">
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="flex flex-col items-center">
                <Skeleton className="h-48 w-48 rounded-full" />
                <Skeleton className="h-6 w-32 mt-4" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicesLoadingState;
