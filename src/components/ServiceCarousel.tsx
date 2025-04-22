
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
    <div
      className={`
        w-full
        max-w-screen-xl
        mx-auto
        px-1
        xs:max-w-[99vw] xs:px-0
        sm:max-w-[99vw] sm:px-0
      `}
    >
      {title && (
        <h2 className="text-2xl font-semibold text-center mb-6 text-[#ff6900]">{title}</h2>
      )}
      <Carousel
        opts={{
          align: shouldCenter ? "center" : "start",
          loop: children.length > 2,
          containScroll: "trimSnaps",
          dragFree: true,
        }}
        className="w-full relative"
      >
        <CarouselContent
          className={`
            gap-4
            xs:gap-[20px] sm:gap-[20px]
            md:gap-4 lg:gap-4
          `}
        >
          {children.map((child, index) => (
            <CarouselItem
              key={index}
              className={`
                pl-0
                basis-[calc(85%-20px)]
                xs:basis-[calc(90vw-20px)] sm:basis-[calc(90vw-20px)]
                md:basis-[calc(33.333%-20px)] lg:basis-[calc(25%-20px)]
                ${shouldCenter ? "mx-auto" : ""}
                ${
                  index === 0
                    ? "xs:ml-[calc(50vw-45vw)] sm:ml-[calc(50vw-45vw)]"
                    : ""
                }
              `}
            >
              <div className="flex items-center justify-center py-4">{child}</div>
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

