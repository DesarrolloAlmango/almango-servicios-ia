
import React from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

interface ServiceCarouselProps {
  children: React.ReactNode[];
  title?: string;
  titleClassName?: string;
  showLoadingNames?: boolean;
  loadingItems?: string[];
  primaryTitlePart?: string;
  secondaryTitlePart?: string;
}

const ServiceCarousel: React.FC<ServiceCarouselProps> = ({
  children,
  title,
  titleClassName = "",
  showLoadingNames = false,
  loadingItems = [
    "Peluquería", "Manicura", "Pedicura", "Masajes",
    "Depilación", "Tratamiento facial", "Corte de cabello",
    "Tintura", "Maquillaje", "Estética corporal"
  ],
  primaryTitlePart,
  secondaryTitlePart
}) => {
  if (!children || children.length === 0) {
    return <div className="text-center py-8">No hay servicios disponibles</div>;
  }

  // Determinar si debe centrarse (cuando hay pocos elementos)
  const shouldCenter = children.length <= 2;
  
  return (
    <div className="w-full max-w-screen-xl mx-auto">
      {title && !primaryTitlePart && (
        <h2 className={`text-2xl md:text-3xl font-semibold text-center mb-6 text-[#ff6900] uppercase ${titleClassName}`}>
          {title}
        </h2>
      )}
      
      {primaryTitlePart && secondaryTitlePart && (
        <h2 className={`text-2xl md:text-3xl font-semibold text-center mb-6 uppercase ${titleClassName}`}>
          <span className="text-[#ff6900]">{primaryTitlePart}</span>
          <span className="text-[#008be1]">{secondaryTitlePart}</span>
        </h2>
      )}
      
      <Carousel 
        opts={{
          align: shouldCenter ? "center" : "start",
          loop: children.length > 2,
          containScroll: "trimSnaps"
        }} 
        className="w-full relative"
        showLoadingNames={showLoadingNames}
        loadingItems={loadingItems}
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {children.map((child, index) => (
            <CarouselItem 
              key={index} 
              className={`pl-2 sm:pl-4 
                basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 
                ${shouldCenter ? "mx-auto" : ""}`}
            >
              <div className="flex items-center justify-center py-4">
                {/* Apply orange border with transparency to child elements */}
                <div className="border-2 border-orange-500/50 rounded-full">
                  {child}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        <div className="flex justify-center gap-2 mt-4">
          <CarouselPrevious className="relative -left-0 top-0 translate-y-0 h-9 w-9 text-slate-900" />
          <CarouselNext className="relative -right-0 top-0 translate-y-0 h-9 w-9 text-slate-900" />
        </div>
      </Carousel>
    </div>
  );
};

export default ServiceCarousel;
