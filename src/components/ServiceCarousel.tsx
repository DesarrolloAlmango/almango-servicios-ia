
import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ServiceCarouselProps {
  children: React.ReactNode[];
}

const ServiceCarousel: React.FC<ServiceCarouselProps> = ({ children }) => {
  if (!children || children.length === 0) {
    return <div className="text-center py-8">No hay servicios disponibles</div>;
  }

  return (
    <Carousel
      opts={{
        align: "start",
        loop: true,
      }}
      className="w-full max-w-screen-xl mx-auto"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {children.map((child, index) => (
          <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/4">
            <div className="flex items-center justify-center py-4">
              {child}
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <div className="flex justify-center gap-2 mt-4">
        <CarouselPrevious className="relative -left-0 top-0 translate-y-0 h-9 w-9" />
        <CarouselNext className="relative -right-0 top-0 translate-y-0 h-9 w-9" />
      </div>
    </Carousel>
  );
};

export default ServiceCarousel;
