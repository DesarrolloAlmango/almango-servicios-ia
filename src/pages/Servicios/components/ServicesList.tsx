
import React from "react";
import { Separator } from "@/components/ui/separator";
import ServiceCarousel from "@/components/ServiceCarousel";
import ServiceCard from "@/components/ServiceCard";
import { CartItem, PurchaseLocation, TarjetaServicio } from "../types";
import { Home, Wind, Droplets, Zap, Package, Truck, Baby } from "lucide-react";

interface ServicesListProps {
  services: TarjetaServicio[] | undefined;
  mudanzaServices: TarjetaServicio[] | undefined;
  serviceCardRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  handleServiceCardClick: (serviceId: string | undefined, serviceName: string) => boolean;
  handleCategorySelect: (serviceId: string, categoryId: string, categoryName: string) => void;
  getPurchaseLocationForService: (serviceId: string) => PurchaseLocation | null;
  pendingServiceCardAction: boolean;
  selectedServiceId: string | null;
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  highlightedServiceId: string | null;
}

// Map of icon components
const iconComponents = {
  Package,
  Baby,
  Wind,
  Home,
  Droplets,
  Zap,
  Truck
};

const ServicesList: React.FC<ServicesListProps> = ({
  services,
  mudanzaServices,
  serviceCardRefs,
  handleServiceCardClick,
  handleCategorySelect,
  getPurchaseLocationForService,
  pendingServiceCardAction,
  selectedServiceId,
  cartItems,
  addToCart,
  highlightedServiceId
}) => {
  return (
    <>
      <div id="armado-instalacion" className="mb-12 relative">
        <ServiceCarousel primaryTitlePart="ARMADO" secondaryTitlePart=" E INSTALACIÓN" titleClassName="font-bold">
          {services?.map((service, index) => {
            const isIconKey = Object.keys(iconComponents).includes(service.icon as string);
            const isHighlighted = service.id === highlightedServiceId;
            
            return (
              <ServiceCard 
                key={index} 
                id={service.id} 
                name={service.name} 
                iconComponent={isIconKey ? iconComponents[service.icon as keyof typeof iconComponents] : Home} 
                icon={!isIconKey ? service.icon : undefined} 
                addToCart={addToCart} 
                externalUrl={service.url} 
                onCategorySelect={handleCategorySelect} 
                purchaseLocation={getPurchaseLocationForService(service.id || "")} 
                forceOpen={pendingServiceCardAction && selectedServiceId === service.id} 
                circular={true} 
                currentCartItems={cartItems} 
                className={isHighlighted ? "ring-4 ring-primary ring-offset-4 ring-offset-[#F8F4F0]" : ""} 
                ref={element => {
                  if (service.id) {
                    serviceCardRefs.current[service.id] = element;
                  }
                }} 
              />
            );
          })}
        </ServiceCarousel>
      </div>
      
      {/* Add a subtle separator line between carousels */}
      <div className="flex justify-center mb-12">
        <Separator className="w-4/5 bg-gray-300 opacity-60" />
      </div>
      
      <div className="mb-12">
        <ServiceCarousel primaryTitlePart="FLETES Y" secondaryTitlePart=" MUDANZAS" showLoadingNames={false} loadingItems={[]} lightTitle={true}>
          {mudanzaServices?.map((service, index) => {
            const isIconKey = Object.keys(iconComponents).includes(service.icon as string);
            const isHighlighted = service.id === highlightedServiceId;
            
            return (
              <ServiceCard 
                key={index} 
                id={service.id} 
                name={service.name} 
                iconComponent={isIconKey ? iconComponents[service.icon as keyof typeof iconComponents] : Truck} 
                icon={!isIconKey ? service.icon : undefined} 
                addToCart={addToCart} 
                externalUrl={service.url} 
                onCategorySelect={handleCategorySelect} 
                purchaseLocation={getPurchaseLocationForService(service.id || "")} 
                forceOpen={pendingServiceCardAction && selectedServiceId === service.id} 
                circular={true} 
                currentCartItems={cartItems} 
                className={isHighlighted ? "ring-4 ring-primary ring-offset-4 ring-offset-[#f06900]" : ""} 
                ref={element => {
                  if (service.id) {
                    serviceCardRefs.current[service.id] = element;
                  }
                }} 
              />
            );
          })}
        </ServiceCarousel>
      </div>
    </>
  );
};

export default ServicesList;
