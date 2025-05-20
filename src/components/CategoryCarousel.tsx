import React, { useState, useEffect, useRef, useMemo } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { CircleEllipsis } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Category {
  id: string;
  name: string;
  image: string;
  price?: number;
  count?: number;
}

interface CategoryCarouselProps {
  categories: Category[];
  onSelectCategory: (categoryId: string, categoryName: string) => void;
  selectedService: {
    id?: string;
    name: string;
  };
  isLoading?: boolean;
  cartItems?: any[];
  purchaseLocation?: any;
  autoSelectCategoryId?: string;
}

const IMAGE_CACHE_KEY = 'category_images_cache';
const IMAGE_CACHE_EXPIRY = 24 * 60 * 60 * 1000;
const COMPRESSION_QUALITY = 0.6;

// Random service names for demonstration
const DEMO_SERVICE_NAMES = ["Corte de pelo", "Peinado", "Coloración", "Maquillaje", "Tratamiento facial", "Depilación", "Manicura premium", "Masaje relajante", "Pedicura", "Limpieza facial", "Alisado", "Extensiones", "Uñas acrílicas", "Cejas y pestañas"];

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  onSelectCategory,
  selectedService,
  isLoading = false,
  cartItems = [],
  purchaseLocation,
  autoSelectCategoryId
}) => {
  const isMobile = useIsMobile();
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const [cachedImages, setCachedImages] = useState<Record<string, string>>({});
  const [visibleItems, setVisibleItems] = useState<Set<string>>(new Set());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const hasAutoSelectedRef = useRef(false);
  const autoSelectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSelectionAttemptsRef = useRef(0);

  // Enhanced auto-select effect with more robust handling and retry logic
  useEffect(() => {
    // Clear any pending auto-select timeout when dependencies change
    if (autoSelectTimeoutRef.current) {
      clearTimeout(autoSelectTimeoutRef.current);
    }

    // Only attempt auto-selection if we have all required data and haven't already selected
    if (autoSelectCategoryId && categories.length > 0 && purchaseLocation) {
      console.log("Checking for auto-selection. Category ID:", autoSelectCategoryId, 
                 "Has already selected:", hasAutoSelectedRef.current,
                 "Categories available:", categories.length);
      
      // Find the category we want to select
      const categoryToSelect = categories.find(cat => cat.id === autoSelectCategoryId);
      
      if (categoryToSelect && !hasAutoSelectedRef.current) {
        // Increment attempt counter
        autoSelectionAttemptsRef.current += 1;
        
        // Progressive backoff for retries (100ms, 200ms, 300ms, etc.)
        const delay = Math.min(100 * autoSelectionAttemptsRef.current, 1000);
        
        console.log(`Attempting auto-selection in ${delay}ms (attempt ${autoSelectionAttemptsRef.current})`);
        
        autoSelectTimeoutRef.current = setTimeout(() => {
          console.log("Auto-selecting category:", categoryToSelect.name);
          
          // Mark as selected to prevent multiple selections
          hasAutoSelectedRef.current = true;
          
          // Trigger the category selection
          handleCategoryClick(categoryToSelect);
          
          // Reset attempt counter after successful selection
          autoSelectionAttemptsRef.current = 0;
        }, delay);
      } else if (!categoryToSelect && autoSelectCategoryId) {
        console.log("Category not found for auto-selection:", autoSelectCategoryId, 
                   "Available categories:", categories.map(c => `${c.id}:${c.name}`).join(', '));
      }
    }

    return () => {
      if (autoSelectTimeoutRef.current) {
        clearTimeout(autoSelectTimeoutRef.current);
      }
    };
  }, [autoSelectCategoryId, categories, purchaseLocation]);

  // Reset auto-selection flag when key dependencies change
  useEffect(() => {
    if (categories.length > 0) {
      console.log("Resetting auto-selection state due to dependency change");
      hasAutoSelectedRef.current = false;
      autoSelectionAttemptsRef.current = 0;
    }
  }, [categories, purchaseLocation]);

  // Log when purchaseLocation changes to aid debugging
  useEffect(() => {
    if (purchaseLocation) {
      console.log("CategoryCarousel - Purchase location received:", purchaseLocation);
    }
  }, [purchaseLocation]);

  // Function to preload product data when a category is selected
  const preloadProductData = async (categoryId: string) => {
    if (!selectedService.id) return;
    
    try {
      const endpoint = `/api/AlmangoXV1NETFramework/WebAPI/ObtenerNivel2?Nivel0=${selectedService.id}&Nivel1=${categoryId}`;
      console.log(`Preloading products for service ${selectedService.id}, category ${categoryId}`);
      
      const response = await fetch(endpoint);
      if (!response.ok) {
        console.error(`Error preloading products: ${response.status}`);
      } else {
        const data = await response.json();
        console.log(`Preloaded ${data.length} products successfully`);
      }
    } catch (error) {
      console.error("Error preloading product data:", error);
    }
  };

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
    const visibilityObserver = new IntersectionObserver(entries => {
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
    intersectionObserver.current = new IntersectionObserver(entries => {
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
    }, {
      rootMargin: '100px'
    });
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
          const {
            images,
            timestamp
          } = JSON.parse(cacheData);

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

      // Actualizar el estado inmediato para la UI
      setCachedImages(prev => ({
        ...prev,
        [categoryId]: imageData
      }));

      // Debounce la escritura en localStorage para evitar operaciones frecuentes
      debounceTimer = setTimeout(() => {
        try {
          const newCache = {
            ...cachedImages,
            [categoryId]: imageData
          };
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
    setLoadingImages(prev => ({
      ...prev,
      [categoryId]: false
    }));
  };
  const handleImageError = (categoryId: string, imageUrl: string) => {
    console.error("Error loading category image:", imageUrl);
    setFailedImages(prev => ({
      ...prev,
      [categoryId]: true
    }));
    setLoadingImages(prev => ({
      ...prev,
      [categoryId]: false
    }));
  };

  // Función para cargar una imagen individual
  const loadCategoryImage = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    setLoadingImages(prev => ({
      ...prev,
      [categoryId]: true
    }));
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
            height = height * maxSize / width;
            width = maxSize;
          } else if (height > maxSize) {
            width = width * maxSize / height;
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
      setFailedImages(prev => ({
        ...prev,
        [categoryId]: true
      }));
      setLoadingImages(prev => ({
        ...prev,
        [categoryId]: false
      }));
    }
  };

  // Handle category selection with awareness of purchase location
  const handleCategoryClick = (category: Category) => {
    console.log("Category clicked:", category.name, "Purchase location:", purchaseLocation ? "exists" : "does not exist", "Category ID:", category.id);
    
    // Dispatch a custom event to notify any listening components about the category selection
    // This will help with debugging and inter-component communication
    const categorySelectedEvent = new CustomEvent('categorySelected', { 
      detail: { 
        categoryId: category.id,
        categoryName: category.name,
        serviceId: selectedService.id 
      } 
    });
    document.dispatchEvent(categorySelectedEvent);
    
    // Preload product data in the background
    preloadProductData(category.id);
    
    // Call the parent's onSelectCategory function
    onSelectCategory(category.id, category.name);
  };

  // Check if this category is the auto-selected one
  const isSelectedCategory = (categoryId: string) => {
    return autoSelectCategoryId === categoryId;
  };

  // Extraer solo los nombres de categorías para mostrar durante la carga
  const categoryNames = useMemo(() => isLoading ? DEMO_SERVICE_NAMES : categories.map(category => category.name), [categories, isLoading]);
  if (isLoading) {
    return <div className="w-full">
        <div className="text-center mb-8">
          <h3 className="text-xl font-semibold text-secondary">
            Cargando categorías para {selectedService.name}
          </h3>
          <div className="mt-4 flex justify-center">
            <CircleEllipsis className="animate-spin h-12 w-12 text-primary" />
          </div>
        </div>
        
        {/* Carousel con nombres durante la carga */}
        <Carousel className="w-full" showLoadingNames={true} loadingItems={categoryNames}>
          <CarouselContent>
            {Array(6).fill(0).map((_, index) => <CarouselItem key={index} className="md:basis-1/4 pl-4">
                <div className="aspect-square rounded-full bg-slate-100 animate-pulse"></div>
              </CarouselItem>)}
          </CarouselContent>
        </Carousel>
      </div>;
  }
  return <div className="py-4 sm:py-6 w-full">
      <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-center px-2 truncate mx-auto">SELECCIONÁ UNA CATEGORÍA</h3>
      
      <Carousel className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-xl lg:max-w-3xl mx-auto" opts={{
      align: "center",
      loop: true
    }}>
        <CarouselContent className="-ml-2 sm:-ml-4">
          {categories.map(category => <CarouselItem key={category.id} ref={el => el && itemRefs.current.set(category.id, el)} data-category-id={category.id} className="\n                basis-1/2 \n                sm:basis-1/3 \n                lg:basis-1/4\n                pl-2 sm:pl-4\nmx-1\n              ">
              <div onClick={() => handleCategoryClick(category)} className={`cursor-pointer hover:scale-105 transition-transform mx-5px ${isSelectedCategory(category.id) ? 'ring-4 ring-orange-500 rounded-full' : ''}`}>
                <div className={`overflow-hidden rounded-full border-2 ${isSelectedCategory(category.id) ? 'border-orange-500' : 'border-primary'} mx-auto w-16 sm:w-20 h-16 sm:h-20 mb-2 bg-gray-100 relative`}>
                  <AspectRatio ratio={1} className="bg-gray-100">
                    {/* Mostrar skeleton mientras carga la imagen */}
                    {loadingImages[category.id] && <div className="absolute inset-0 flex items-center justify-center z-10">
                        <Skeleton className="h-full w-full rounded-full" />
                      </div>}
                    
                    {/* Mostrar imagen desde caché si está disponible */}
                    {cachedImages[category.id] && !failedImages[category.id] ? <img src={cachedImages[category.id]} alt={category.name} className="w-full h-full object-cover" onError={() => handleImageError(category.id, category.image)} style={{
                  opacity: loadingImages[category.id] ? 0 : 1,
                  transition: 'opacity 0.3s ease-in-out'
                }} /> : <>
                        {/* Mostrar imagen desde fuente original con lazy loading */}
                        {getImageSource(category.image) && !failedImages[category.id] ? <img ref={el => el && imageRefs.current.set(category.id, el)} data-category-id={category.id} src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" // placeholder transparente
                  data-src={getImageSource(category.image)} alt={category.name} className="w-full h-full object-cover" loading="lazy" onLoad={() => handleImageLoad(category.id)} onError={() => handleImageError(category.id, category.image)} style={{
                    opacity: loadingImages[category.id] ? 0 : 1,
                    transition: 'opacity 0.3s ease-in-out'
                  }} /> : <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-500 text-xs">Sin imagen</span>
                          </div>}
                      </>}
                  </AspectRatio>
                </div>
                <p className={`text-center text-sm sm:text-base font-medium mt-1 sm:mt-2 line-clamp-2 px-1 
                  animate-in fade-in duration-300 ${isSelectedCategory(category.id) ? 'text-orange-500 font-bold' : ''}`}>{category.name}</p>
              </div>
            </CarouselItem>)}
        </CarouselContent>
        {!isMobile && <>
            <CarouselPrevious className="left-0 hidden sm:flex" />
            <CarouselNext className="right-0 hidden sm:flex" />
          </>}
      </Carousel>
    </div>;
};

export default CategoryCarousel;
