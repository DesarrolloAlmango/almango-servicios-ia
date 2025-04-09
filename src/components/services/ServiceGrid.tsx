
import React from "react";
import { TarjetaServicio, ServiceIconsMap } from "@/types/service";
import ServiceCard from "@/components/ServiceCard";
import { CartItem } from "@/types/service";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ServiceGridProps {
  services: TarjetaServicio[] | undefined;
  iconComponents: ServiceIconsMap;
  addToCart: (item: CartItem) => void;
  isError: boolean;
}

const ServiceGrid: React.FC<ServiceGridProps> = ({ 
  services, 
  iconComponents, 
  addToCart,
  isError
}) => {
  if (!services || services.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay servicios disponibles</p>
      </div>
    );
  }

  const itemsPerRow = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  const lastRowItemCount = services.length % itemsPerRow;
  const needsCentering = lastRowItemCount > 0 && lastRowItemCount < itemsPerRow;

  const handleViewInConsole = () => {
    console.log("All services data:", services);
    toast.info("Datos mostrados en la consola", { duration: 2000 });
  };

  return (
    <>
      {isError && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-md">
          <p className="text-amber-700">
            No se pudieron obtener los servicios del servidor. Mostrando información local.
          </p>
        </div>
      )}
      
      {/* Display all services raw data for testing */}
      <div className="bg-blue-50 p-3 rounded-md mb-6 border border-blue-200">
        <p className="text-blue-700 font-medium">Datos de Servicios (Test):</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-2 mb-2"
          onClick={handleViewInConsole}
        >
          Ver en consola
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
        {services.map((service, index) => (
          <div key={index} className="opacity-100 translate-y-0">
            <ServiceCard 
              id={service.id} 
              name={service.name} 
              iconComponent={iconComponents[service.icon]} 
              addToCart={addToCart}
              externalUrl={service.url}
            />
          </div>
        ))}
      </div>
      
      {needsCentering && (
        <style dangerouslySetInnerHTML={{
          __html: `
            @media (min-width: 768px) {
              .grid > div:nth-last-child(-n+${lastRowItemCount}) {
                grid-column-start: ${Math.ceil((itemsPerRow - lastRowItemCount) / 2) + 1};
              }
            }
          `
        }} />
      )}
    </>
  );
};

export default ServiceGrid;
