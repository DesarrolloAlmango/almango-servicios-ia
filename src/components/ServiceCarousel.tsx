
import React from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext
} from "@/components/ui/carousel";

interface ServiceCarouselProps {
  children: React.ReactNode[];
  title?: string;
}

const ServiceCarousel: React.FC<ServiceCarouselProps> = ({ children, title }) => {
  if (!children || children.length === 0) {
    return <div className="text-center py-8">No hay servicios disponibles</div>;
  }

  const shouldCenter = children.length <= 2;

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      {title && (
        <h2 className="text-2xl font-semibold text-center mb-6 text-[#ff6900]">{title}</h2>
      )}
      <Carousel
        opts={{
          align: shouldCenter ? "center" : "start",
          loop: children.length > 2,
          containScroll: "trimSnaps",
          dragFree: true,  // Allow free scrolling
        }}
        className="w-full relative"
      >
        <CarouselContent className="gap-4 xs:gap-[20px] sm:gap-4 md:gap-4 lg:gap-4"> {/* Explicit gap between items */}
          {children.map((child, index) => (
            <CarouselItem 
              key={index} 
              className={`pl-0 
                basis-[calc(85%-20px)] xs:basis-[calc(50%-20px)] sm:basis-[calc(50%-20px)] md:basis-[calc(33.333%-20px)] lg:basis-[calc(25%-20px)] 
                ${shouldCenter ? "mx-auto" : ""}`}
            >
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
    </div>
  );
};

export default ServiceCarousel;
