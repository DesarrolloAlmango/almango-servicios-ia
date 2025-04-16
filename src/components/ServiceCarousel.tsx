
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

  return (
    <div className="w-full max-w-screen-xl mx-auto">
      {title && (
        <h2 className="text-2xl font-semibold text-center mb-6 text-[#ff6900]">{title}</h2>
      )}
      <Carousel
        opts={{
          align: "center",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-4 md:-ml-6">
          {children.map((child, index) => (
            <CarouselItem key={index} className="pl-4 md:pl-6 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
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
