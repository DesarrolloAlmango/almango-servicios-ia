
import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
interface LogoCarouselProps {
  logos: {
    url: string;
    alt: string;
  }[];
  direction?: "ltr" | "rtl";
  speed?: "normal" | "fast" | "super-fast" | "ultra-fast" | "slow" | "super-slow";
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
  // By repeating 6 times, we ensure no visible reset during scroll
  const extendedLogos = [...logos, ...logos, ...logos, ...logos, ...logos, ...logos];

  // Calculate animation speed class based on the speed prop
  const getSpeedClass = () => {
    switch (speed) {
      case "fast":
        return "animate-[infinite-scroll-reverse_25s_linear_infinite]";
      case "super-fast":
        return "animate-[infinite-scroll-reverse_20s_linear_infinite]";
      case "ultra-fast":
        return "animate-[infinite-scroll-reverse_15s_linear_infinite]";
      case "slow":
        return "animate-[infinite-scroll-reverse_45s_linear_infinite]";
      case "super-slow":
        return "animate-[infinite-scroll-reverse_60s_linear_infinite]";
      default:
        return "animate-[infinite-scroll-reverse_30s_linear_infinite]";
    }
  };
  return (
    <div className="overflow-hidden w-full py-5 rounded-md bg-[#f06900]">
      <Carousel opts={{
        align: "start",
        containScroll: false,
        dragFree: true,
        loop: true
      }} className="w-full overflow-hidden">
        <CarouselContent className={`
            ${direction === "rtl" ? getSpeedClass() : "animate-[infinite-scroll_30s_linear_infinite]"}
            flex ${direction === "rtl" ? "flex-row-reverse" : "flex-row"} w-max gap-0
          `}>
          {extendedLogos.map((logo, index) => <CarouselItem key={index} className="min-w-0 pl-0 basis-auto flex-shrink-0">
              <div className="h-28 flex items-center justify-center p-1 transition-all hover:scale-105 my-4 px-2">
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-primary/20 h-full w-full flex items-center justify-center transform hover:rotate-2 hover:shadow-lg transition-all duration-300">
                  <img src={logo.url} alt={logo.alt} className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            </CarouselItem>)}
        </CarouselContent>
      </Carousel>
    </div>
  );
};
export default LogoCarousel;
