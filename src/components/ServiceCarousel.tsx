
import React, { useState } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CircularServiceCard from "./CircularServiceCard";
import { CartItem } from "@/pages/Servicios";
import { LucideIcon } from "lucide-react";

interface Service {
  id: string;
  name: string;
  icon: string;
  iconComponent?: LucideIcon;
}

interface ServiceCarouselProps {
  title: string;
  services: Service[];
  addToCart: (item: CartItem) => void;
  endpointSuffix?: string;
}

const ServiceCarousel: React.FC<ServiceCarouselProps> = ({ 
  title, 
  services,
  addToCart,
  endpointSuffix
}) => {
  const [purchaseLocation, setPurchaseLocation] = useState<any>(null);

  return (
    <section className="py-12 px-4 bg-white">
      <div className="container mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center text-secondary font-display">{title}</h2>
        
        <Carousel
          className="w-full max-w-5xl mx-auto"
          opts={{ 
            align: "start",
            loop: true
          }}
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {services.map(service => (
              <CarouselItem key={service.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <CircularServiceCard
                  id={service.id}
                  name={service.name}
                  icon={service.icon}
                  iconComponent={service.iconComponent}
                  addToCart={addToCart}
                  purchaseLocation={purchaseLocation}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="flex justify-center mt-4">
            <CarouselPrevious className="mr-2 static translate-y-0" />
            <CarouselNext className="ml-2 static translate-y-0" />
          </div>
        </Carousel>
      </div>
    </section>
  );
};

export default ServiceCarousel;
