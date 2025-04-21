
import React from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  return (
    <div className="py-6">
      <h3 className="text-xl font-medium mb-6 text-center">Selecciona una categoría</h3>
      
      <Carousel
        className="w-full max-w-3xl mx-auto"
        opts={{ 
          align: "start",
          loop: true
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
                    />
                  </AspectRatio>
                </div>
                <p className="text-center font-medium mt-2">{category.name}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-0" />
        <CarouselNext className="right-0" />
      </Carousel>
    </div>
  );
};

export default CategoryCarousel;
