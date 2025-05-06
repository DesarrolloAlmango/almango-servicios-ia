
import React, { useState, useEffect, useRef, useMemo } from "react";
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
import { toast } from "sonner";

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

const IMAGE_CACHE_KEY = 'category_images_cache';
const IMAGE_CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
const COMPRESSION_QUALITY = 0.6; // Reducir calidad para mejorar rendimiento
const INITIAL_VISIBLE_CATEGORIES = 4; // Número de categorías visibles inicialmente

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, onSelectCategory }) => {
  const isMobile = useIsMobile();
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [cachedImages, setCachedImages] = useState<Record<string, string>>({});
  const [visibleCategories, setVisibleCategories] = useState<Category[]>([]);
  const [remainingCategories, setRemainingCategories] = useState<Category[]>([]);
  const [allCategoriesLoaded, setAllCategoriesLoaded] = useState<boolean>(false);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const carouselRef = useRef<HTMLDivElement>(null);
  
  // Función optimizada para obtener la URL de la imagen
  const getImageSource = useMemo(() => (imageStr: string) => {
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
  }, []);

  // Configuración inicial de categorías visibles y restantes
  useEffect(() => {
    if (categories.length > 0) {
      // Determinar cuántas categorías mostrar inicialmente según el dispositivo
      const initialCount = isMobile ? 2 : INITIAL_VISIBLE_CATEGORIES;
      const initialVisible = categories.slice(0, Math.min(initialCount, categories.length));
      const initialRemaining = categories.slice(Math.min(initialCount, categories.length));
      
      setVisibleCategories(initialVisible);
      setRemainingCategories(initialRemaining);
      
      // Cargar inmediatamente las categorías visibles
      initialVisible.forEach(category => {
        if (!cachedImages[category.id]) {
          loadCategoryImage(category.id);
        }
      });
      
      // Si no hay categorías restantes, marcar todo como cargado
      if (initialRemaining.length === 0) {
        setAllCategoriesLoaded(true);
      }
    }
  }, [categories, isMobile]);

  // Cargar el resto de categorías gradualmente
  useEffect(() => {
    if (remainingCategories.length > 0 && !allCategoriesLoaded) {
      const loadNextBatch = () => {
        // Cargar las siguientes 2-3 categorías
        const batchSize = 3;
        const nextBatch = remainingCategories.slice(0, batchSize);
        const newRemaining = remainingCategories.slice(batchSize);
        
        // Actualizar estado
        setVisibleCategories(prev => [...prev, ...nextBatch]);
        setRemainingCategories(newRemaining);
        
        // Cargar imágenes para el nuevo lote
        nextBatch.forEach(category => {
          if (!cachedImages[category.id]) {
            loadCategoryImage(category.id);
          }
        });
        
        // Si no quedan más categorías por cargar, marcar como completado
        if (newRemaining.length === 0) {
          setAllCategoriesLoaded(true);
        } else {
          // Programar la carga del siguiente lote
          setTimeout(loadNextBatch, 200);
        }
      };
      
      // Iniciar la carga del primer lote después de un breve retraso
      // para permitir que se muestren primero las categorías iniciales
      setTimeout(loadNextBatch, 300);
    }
  }, [remainingCategories, allCategoriesLoaded]);

  // Implementar lazy loading con IntersectionObserver
  useEffect(() => {
    // Crear un IntersectionObserver para cargar imágenes solo cuando sean visibles
    intersectionObserver.current = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const categoryId = entry.target.getAttribute('data-category-id');
          if (categoryId && !cachedImages[categoryId]) {
            loadCategoryImage(categoryId);
          }
          // Dejar de observar una vez que se ha iniciado la carga
          intersectionObserver.current?.unobserve(entry.target);
        }
      });
    }, { rootMargin: '100px' });
    
    return () => {
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
    };
  }, [cachedImages]);

  // Cargar caché de imágenes al inicio de manera asíncrona
  useEffect(() => {
    const loadCache = async () => {
      try {
        const cacheData = localStorage.getItem(IMAGE_CACHE_KEY);
        
        if (cacheData) {
          const { images, timestamp } = JSON.parse(cacheData);
          
          // Verificar si la caché ha expirado
          if (Date.now() - timestamp < IMAGE_CACHE_EXPIRY) {
            setCachedImages(images || {});
            console.log('Imágenes de categorías cargadas desde caché local', Object.keys(images).length);
          } else {
            console.log('Caché de imágenes expirada, limpiando...');
            localStorage.removeItem(IMAGE_CACHE_KEY);
          }
        }
      } catch (error) {
        console.error('Error al cargar caché de imágenes:', error);
      }
    };

    loadCache();
  }, []);

  // Observer para las referencias de imágenes
  useEffect(() => {
    // Registrar observadores para cada imagen que no esté en caché
    const allCategories = [...visibleCategories, ...remainingCategories];
    allCategories.forEach(category => {
      const imgElement = imageRefs.current.get(category.id);
      if (imgElement && !cachedImages[category.id] && intersectionObserver.current) {
        intersectionObserver.current.observe(imgElement);
      }
    });
  }, [visibleCategories, remainingCategories, cachedImages]);

  // Guardar imágenes en caché con debounce
  const saveImageToCache = useMemo(() => {
    let debounceTimer: ReturnType<typeof setTimeout>;
    
    return (categoryId: string, imageData: string) => {
      clearTimeout(debounceTimer);
      
      // Actualizar el estado inmediatamente para la UI
      setCachedImages(prev => ({ ...prev, [categoryId]: imageData }));
      
      // Debounce la escritura en localStorage para evitar operaciones frecuentes
      debounceTimer = setTimeout(() => {
        try {
          const newCache = { ...cachedImages, [categoryId]: imageData };
          
          localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify({
            images: newCache,
            timestamp: Date.now()
          }));
        } catch (error) {
          console.error('Error al guardar imagen en caché:', error);
        }
      }, 300);
    };
  }, [cachedImages]);

  const handleImageLoad = (categoryId: string) => {
    setLoadingImages(prev => ({ ...prev, [categoryId]: false }));
  };

  const handleImageError = (categoryId: string, imageUrl: string) => {
    console.error("Error loading category image:", imageUrl);
    setFailedImages(prev => ({ ...prev, [categoryId]: true }));
    setLoadingImages(prev => ({ ...prev, [categoryId]: false }));
  };

  // Función para cargar una imagen individual
  const loadCategoryImage = (categoryId: string) => {
    // Buscar la categoría en ambos arrays
    const category = [...visibleCategories, ...remainingCategories].find(c => c.id === categoryId);
    if (!category) return;
    
    setLoadingImages(prev => ({ ...prev, [categoryId]: true }));
    
    const imgSource = getImageSource(category.image);
    if (imgSource) {
      // Cargar la imagen
      const img = new Image();
      img.crossOrigin = "anonymous"; // Para permitir la conversión a base64
      
      img.onload = () => {
        handleImageLoad(categoryId);
        
        // Convertir la imagen a base64 para guardarla en caché con compresión
        try {
          const canvas = document.createElement('canvas');
          
          // Determinar el tamaño óptimo para la imagen en caché
          const maxSize = 150; // tamaño máximo para miniaturas de categoría
          let width = img.width;
          let height = img.height;
          
          // Mantener relación de aspecto pero reducir tamaño
          if (width > height && width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataURL = canvas.toDataURL('image/jpeg', COMPRESSION_QUALITY);
            saveImageToCache(categoryId, dataURL);
          }
        } catch (err) {
          console.warn('No se pudo convertir la imagen a base64:', err);
        }
      };
      
      img.onerror = () => handleImageError(categoryId, imgSource);
      img.src = imgSource;
    } else {
      setFailedImages(prev => ({ ...prev, [categoryId]: true }));
      setLoadingImages(prev => ({ ...prev, [categoryId]: false }));
    }
  };
  
  // Combinamos todas las categorías para renderizar (cargadas primero + resto)
  const allCategoriesToRender = [...visibleCategories];
  
  return (
    <div className="py-4 sm:py-6 w-full" ref={carouselRef}>
      <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-center px-2 truncate mx-auto">Selecciona una categoría</h3>
      
      <Carousel
        className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-xl lg:max-w-3xl mx-auto"
        opts={{ 
          align: "center",
          loop: true
        }}
      >
        <CarouselContent className="-ml-2 sm:-ml-4">
          {allCategoriesToRender.map(category => (
            <CarouselItem 
              key={category.id}
              className="
                basis-1/2 
                sm:basis-1/3 
                lg:basis-1/4
                pl-2 sm:pl-4
                animate-fade-in
              "
              style={{
                animationDelay: `${allCategoriesToRender.indexOf(category) * 50}ms`
              }}
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
                    
                    {/* Mostrar imagen desde caché si está disponible */}
                    {cachedImages[category.id] && !failedImages[category.id] ? (
                      <img
                        src={cachedImages[category.id]}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(category.id, category.image)}
                        style={{ 
                          opacity: loadingImages[category.id] ? 0 : 1,
                          transition: 'opacity 0.3s ease-in-out'
                        }}
                      />
                    ) : (
                      <>
                        {/* Mostrar imagen desde fuente original con lazy loading */}
                        {getImageSource(category.image) && !failedImages[category.id] ? (
                          <img
                            ref={el => el && imageRefs.current.set(category.id, el)}
                            data-category-id={category.id}
                            src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // placeholder transparente
                            data-src={getImageSource(category.image)}
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
                      </>
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
