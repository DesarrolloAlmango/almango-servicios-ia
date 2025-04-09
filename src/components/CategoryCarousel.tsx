
import React from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Category } from "@/types/service";

interface CategoryCarouselProps {
  categories: Category[];
  onSelectCategory: (category: Category) => void;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, onSelectCategory }) => {
  return (
    <div className="py-6">
      <h3 className="text-xl font-medium mb-6 text-center">Selecciona una categoría</h3>
      
      {categories.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No hay categorías disponibles para este servicio</p>
        </div>
      ) : (
        <Carousel
          className="w-full max-w-3xl mx-auto"
          opts={{ 
            align: "start",
            loop: categories.length > 3
          }}
        >
          <CarouselContent>
            {categories.map(category => (
              <CarouselItem key={category.id} className="md:basis-1/3 lg:basis-1/4">
                <div 
                  className="cursor-pointer hover:scale-105 transition-transform"
                  onClick={() => onSelectCategory(category)}
                >
                  <div className="overflow-hidden rounded-full border-2 border-primary mx-auto w-20 h-20 mb-2">
                    <AspectRatio ratio={1} className="bg-gray-100">
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback image if the provided URL fails to load
                          e.currentTarget.src = "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=200&h=200";
                        }}
                      />
                    </AspectRatio>
                  </div>
                  <div className="text-center">
                    <p className="font-medium mt-2">{category.name}</p>
                    <p className="text-sm text-gray-600">{category.precio} {category.monedaid}</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          {categories.length > 3 && (
            <>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </>
          )}
        </Carousel>
      )}
    </div>
  );
};

export default CategoryCarousel;
