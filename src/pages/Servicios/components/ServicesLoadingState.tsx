
import React from "react";
import { ArrowLeft, ShoppingCart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const ServicesLoadingState: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="absolute inset-0 z-0 bg-[#14162c]">
        <div className="absolute inset-0 z-1" style={{
          background: "radial-gradient(circle at 20% 30%, #008be1 0%, transparent 40%), radial-gradient(circle at 80% 70%, #ff6900 0%, transparent 40%), radial-gradient(circle at 50% 50%, #0EA5E9 0%, transparent 30%)",
          opacity: 0.8
        }}></div>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#14162c] to-transparent z-2"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#14162c] to-transparent z-2"></div>
      </div>
      <main className="flex-grow py-8 px-4 relative z-10 servicios-page">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8 mt-4">
            <Button variant="ghost" className="flex items-center gap-2 hover:text-gray-300 text-white">
              <ArrowLeft size={20} />
              <span>Volver</span>
            </Button>
            
            <div className="relative cursor-pointer">
              <ShoppingCart size={24} className="text-white" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-12 text-center text-[#008be1] uppercase font-display opacity-0 transition-opacity duration-500">
            Nuestros Servicios
          </h1>
          
          <div className="flex justify-center items-center h-64 gap-6">
            <div className="w-[220px] h-[220px]">
              <Skeleton className="w-full h-full rounded-full" />
            </div>
            <div className="w-[220px] h-[220px]">
              <Skeleton className="w-full h-full rounded-full" />
            </div>
            <div className="w-[220px] h-[220px]">
              <Skeleton className="w-full h-full rounded-full" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ServicesLoadingState;
