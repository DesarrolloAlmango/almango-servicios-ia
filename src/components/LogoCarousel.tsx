
import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface LogoCarouselProps {
  logos: { url: string; alt: string }[];
  direction?: "ltr" | "rtl";
  speed?: "normal" | "fast";
}

const LogoCarousel: React.FC<LogoCarouselProps> = ({ 
  logos,
  direction = "rtl",
  speed = "normal"
}) => {
  if (!logos || logos.length === 0) {
    return null;
  }

  // Triple the logos to create a longer seamless loop effect
  const extendedLogos = [...logos, ...logos, ...logos];
  
  return (
    <div className="overflow-hidden">
      <Carousel
        opts={{
          align: "start",
          containScroll: false,
          dragFree: true,
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent 
          className={`${direction === "rtl" ? "animate-infinite-scroll-reverse" : "animate-infinite-scroll"} ${speed === "fast" ? "fast-scroll" : ""} flex ${direction === "rtl" ? "flex-row-reverse" : "flex-row"}`}
        >
          {extendedLogos.map((logo, index) => (
            <CarouselItem 
              key={index} 
              className="basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 flex-shrink-0"
            >
              <div className="h-32 flex items-center justify-center p-4 transition-all hover:scale-105">
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
