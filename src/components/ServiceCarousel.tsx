
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
  const onlyOne = children.length === 1;

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
            xs:gap-[10px] sm:gap-[12px] 
            md:gap-4 lg:gap-4
            flex
            justify-center
            ${onlyOne ? 'xs:!justify-center sm:!justify-center !justify-center' : ''}
          `}
        >
          {children.map((child, index) => (
            <CarouselItem
              key={index}
              className={`
                pl-0
                basis-[calc(85%-16px)]
                xs:basis-[calc(92vw-10px)] sm:basis-[calc(92vw-12px)]
                md:basis-[calc(33.333%-16px)] lg:basis-[calc(25%-16px)]
                ${shouldCenter ? "mx-auto" : ""}
                ${
                  onlyOne
                    ? "xs:ml-0 sm:ml-0 ml-0"
                    : index === 0
                      ? "xs:ml-[calc(50vw-46vw)] sm:ml-[calc(50vw-46vw)]"
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

