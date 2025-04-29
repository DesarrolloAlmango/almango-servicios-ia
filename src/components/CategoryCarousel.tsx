
import React, { useState } from "react";
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const getImageSource = (imageStr: string) => {
    if (!imageStr) return null;
    if (imageStr.startsWith('data:image')) {
      return imageStr;
    }
    try {
      new URL(imageStr);
      return imageStr;
    } catch {
      return `data:image/png;base64,${imageStr}`;
    }
  };

  const handleImageLoad = (categoryId: string) => {
    setLoadingImages(prev => ({ ...prev, [categoryId]: false }));
  };

  const handleImageError = (categoryId: string, imageUrl: string) => {
    console.error("Error loading category image:", imageUrl);
    setFailedImages(prev => ({ ...prev, [categoryId]: true }));
    setLoadingImages(prev => ({ ...prev, [categoryId]: false }));
  };

  // Precargar imágenes para mejorar la experiencia
  React.useEffect(() => {
    categories.forEach(category => {
      if (!category.id) return;
      
      setLoadingImages(prev => ({ ...prev, [category.id]: true }));
      
      const imgSource = getImageSource(category.image);
      if (imgSource) {
        const img = new Image();
        img.onload = () => handleImageLoad(category.id);
        img.onerror = () => handleImageError(category.id, imgSource);
        img.src = imgSource;
      } else {
        setFailedImages(prev => ({ ...prev, [category.id]: true }));
        setLoadingImages(prev => ({ ...prev, [category.id]: false }));
      }
    });
  }, [categories]);
  
  return (
    <div className="py-4 sm:py-6 w-full">
      <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-center px-2 truncate mx-auto">Selecciona una categoría</h3>
      
      <Carousel
        className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-xl lg:max-w-3xl mx-auto"
        opts={{ 
          align: "center",
          loop: true
        }}
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
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
                <div className="overflow-hidden rounded-full border-2 border-primary mx-auto w-16 sm:w-20 h-16 sm:h-20 mb-2 bg-gray-100 relative">
                  <AspectRatio ratio={1} className="bg-gray-100">
                    {/* Mostrar skeleton mientras carga la imagen */}
                    {loadingImages[category.id] && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Skeleton className="h-full w-full rounded-full" />
                      </div>
                    )}
                    
                    {getImageSource(category.image) && !failedImages[category.id] ? (
                      <img
                        src={getImageSource(category.image)}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onLoad={() => handleImageLoad(category.id)}
                        onError={() => handleImageError(category.id, category.image)}
                        style={{ 
                          opacity: loadingImages[category.id] ? 0 : 1,
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500 text-xs">Sin imagen</span>
                      </div>
                    )}
                  </AspectRatio>
                </div>
                <p className="text-center text-sm sm:text-base font-medium mt-1 sm:mt-2 line-clamp-2 px-1">{category.name}</p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
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
