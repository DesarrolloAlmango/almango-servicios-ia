
import React from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";

interface Category {
  id: string;
  name: string;
  image: string;
  products: any[];
}

interface CategoryCarouselProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, onSelectCategory }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="py-4 sm:py-6 w-full">
      <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-center px-2 truncate mx-auto">{/* Siempre centrado */}
        Selecciona una categoría
      </h3>
      <Carousel
        className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-xl lg:max-w-3xl mx-auto"
        opts={{ 
          align: "center",
          loop: true
        }}
      >
        <CarouselContent
          className={`
            -ml-2 sm:-ml-4
            overflow-x-auto sm:overflow-x-visible
            scrollbar-hide
          `}
          style={{
            // Evita el scroll en pantallas sm en adelante
            WebkitOverflowScrolling: isMobile ? "touch" : "auto"
          }}
        >
          {categories.map(category => (
            <CarouselItem 
              key={category.id}
              className="
                basis-1/2 
                sm:basis-1/3 
                lg:basis-1/4
                pl-2 sm:pl-4
              "
            >
              <div 
                className="cursor-pointer hover:scale-105 transition-transform"
                onClick={() => onSelectCategory(category)}
              >
                <div className="overflow-hidden rounded-full border-2 border-primary mx-auto w-16 sm:w-20 h-16 sm:h-20 mb-2">
                  <AspectRatio ratio={1} className="bg-gray-100">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </AspectRatio>
                </div>
                <p className="text-center text-sm sm:text-base font-medium mt-1 sm:mt-2 line-clamp-2 px-1">{category.name}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Flechas sólo visibles en pantallas no móviles */}
        {!isMobile && (
          <>
            <CarouselPrevious className="left-0 hidden sm:flex" />
            <CarouselNext className="right-0 hidden sm:flex" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default CategoryCarousel;

