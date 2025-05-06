
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

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({ categories, onSelectCategory }) => {
  const isMobile = useIsMobile();
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [cachedImages, setCachedImages] = useState<Record<string, string>>({});
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
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

  // Crear un IntersectionObserver para detectar elementos visibles
  useEffect(() => {
    // Observer para detectar qué elementos están visibles en el viewport
    const visibilityObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const categoryId = entry.target.getAttribute('data-category-id');
        if (categoryId) {
          if (entry.isIntersecting) {
            // Marcar como visible y priorizar su carga
            setVisibleItems(prev => {
              const updated = new Set(prev);
              updated.add(categoryId);
              return updated;
            });
          } else {
            // Opcional: remover de visibles cuando sale de la vista
            setVisibleItems(prev => {
              const updated = new Set(prev);
              updated.delete(categoryId);
              return updated;
            });
          }
        }
      });
    }, { 
      rootMargin: '50px',
      threshold: 0.1
    });
    
    // Registrar elementos para observar visibilidad
    itemRefs.current.forEach((ref, id) => {
      visibilityObserver.observe(ref);
    });
    
    return () => {
      visibilityObserver.disconnect();
    };
  }, []);

  // Implementar lazy loading con IntersectionObserver para imágenes
  useEffect(() => {
    // Observer para cargar imágenes en segundo plano
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

  // Efecto para monitorear elementos visibles y priorizar su carga
  useEffect(() => {
    // Priorizar la carga de elementos visibles
    visibleItems.forEach(categoryId => {
      if (!cachedImages[categoryId] && !loadingImages[categoryId]) {
        loadCategoryImage(categoryId);
      }
    });
    
    // Cargar los elementos no visibles después de un delay
    const timer = setTimeout(() => {
      categories.forEach(category => {
        if (!visibleItems.has(category.id) && !cachedImages[category.id] && !loadingImages[category.id]) {
          // Comenzar carga de imágenes no visibles con baja prioridad
          loadCategoryImage(category.id);
        }
      });
    }, 500); // Delay para priorizar elementos visibles primero
    
    return () => clearTimeout(timer);
  }, [visibleItems, categories, cachedImages, loadingImages]);

  // Observer para las referencias de imágenes
  useEffect(() => {
    // Registrar observadores para cada imagen que no esté en caché
    categories.forEach(category => {
      const imgElement = imageRefs.current.get(category.id);
      if (imgElement && !cachedImages[category.id] && intersectionObserver.current) {
        intersectionObserver.current.observe(imgElement);
      }
    });
  }, [categories, cachedImages]);

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
    const category = categories.find(c => c.id === categoryId);
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
              ref={el => el && itemRefs.current.set(category.id, el)}
              data-category-id={category.id}
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
                <p className="text-center text-sm sm:text-base font-medium mt-1 sm:mt-2 line-clamp-2 px-1 
                  animate-in fade-in duration-300">{category.name}</p>
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
