
import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface LogoCarouselProps {
  logos: {
    url: string;
    alt: string;
  }[];
  direction?: "ltr" | "rtl";
  speed?: "normal" | "fast" | "super-fast" | "ultra-fast";
}

const LogoCarousel: React.FC<LogoCarouselProps> = ({
  logos,
  direction = "rtl",
  speed = "normal"
}) => {
  if (!logos || logos.length === 0) {
    return null;
  }

  // Duplicate the logos multiple times to create a longer seamless loop effect
  // By repeating 4 times, we ensure no visible reset during scroll
  const extendedLogos = [...logos, ...logos, ...logos, ...logos];

  return (
    <div className="overflow-hidden w-full">
      <Carousel 
        opts={{
          align: "start",
          containScroll: false,
          dragFree: true,
          loop: true
        }}
        className="w-full"
      >
        <CarouselContent 
          className={`${direction === "rtl" ? "animate-infinite-scroll-reverse" : "animate-infinite-scroll"} 
            ${speed === "fast" ? "fast-scroll" : ""} 
            ${speed === "super-fast" ? "super-fast-scroll" : ""} 
            ${speed === "ultra-fast" ? "ultra-fast-scroll" : ""}
            flex ${direction === "rtl" ? "flex-row-reverse" : "flex-row"} w-max`}
        >
          {extendedLogos.map((logo, index) => (
            <CarouselItem 
              key={index} 
              className="min-w-0 basis-1/6 sm:basis-1/8 md:basis-1/10 lg:basis-1/12 xl:basis-1/16 flex-shrink-0"
            >
              <div className="h-36 flex items-center justify-center p-3 transition-all hover:scale-105 py-0 px-0">
                <img 
                  src={logo.url} 
                  alt={logo.alt} 
                  className="max-h-full max-w-full object-contain" 
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default LogoCarousel;
