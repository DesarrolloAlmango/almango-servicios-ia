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

// Random service names for demonstration
const DEMO_SERVICE_NAMES = ["Corte de pelo", "Peinado", "Coloración", "Maquillaje", "Tratamiento facial", "Depilación", "Manicura premium", "Masaje relajante", "Pedicura", "Limpieza facial", "Alisado", "Extensiones", "Uñas acrílicas", "Cejas y pestañas"];

// Global variable for storing the last selected category ID
export let lastSelectedCategoryId: string | null = null;
export let lastSelectedCategoryName: string | null = null;

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
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);
  const categoryCardsRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const hasAutoSelectedRef = useRef(false);
  const autoSelectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoSelectionAttemptsRef = useRef(0);
  
  // Add missing refs
  const itemRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const imageRefs = useRef<Map<string, HTMLImageElement>>(new Map());
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  // Extract categoryId from URL when categories load - REMOVED DEBUG MESSAGES
  useEffect(() => {
    if (categories.length > 0) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlCategoryId = window.location.pathname.split('/').pop();
      const categoryIdFromURL = autoSelectCategoryId || urlCategoryId;
      
      if (categoryIdFromURL) {
        const foundCategory = categories.find(c => String(c.id) === String(categoryIdFromURL));
        if (foundCategory) {
          // Reset the auto-selection flag to allow new selection
          hasAutoSelectedRef.current = false;
          
          // Force trigger the auto-selection
          setTimeout(() => {
            handleCategoryClick(foundCategory);
          }, 1000);
        }
      }
    }
  }, [categories, autoSelectCategoryId]);

  // Simplified auto-select effect
  useEffect(() => {
    if (autoSelectTimeoutRef.current) {
      clearTimeout(autoSelectTimeoutRef.current);
    }

    let categoryIdToSelect = autoSelectCategoryId;
    
    if (!categoryIdToSelect) {
      const urlCategoryId = window.location.pathname.split('/').pop();
      categoryIdToSelect = urlCategoryId;
    }

    const categoryIdStr = categoryIdToSelect ? String(categoryIdToSelect) : null;

    if (categoryIdStr && categories.length > 0 && purchaseLocation && !hasAutoSelectedRef.current) {
      const categoryToSelect = categories.find(cat => String(cat.id) === categoryIdStr);
      
      if (categoryToSelect) {
        hasAutoSelectedRef.current = true;
        setSelectedCategoryName(categoryToSelect.name);
        
        autoSelectTimeoutRef.current = setTimeout(() => {
          handleCategoryClick(categoryToSelect);
          
          setTimeout(() => {
            focusCategoryCard(categoryToSelect.id);
          }, 500);
        }, 1500);
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
      hasAutoSelectedRef.current = false;
      autoSelectionAttemptsRef.current = 0;
    }
  }, [categories, purchaseLocation]);

  // Add listener for custom openCategory events - ENHANCED WITH BETTER COORDINATION
  useEffect(() => {
    const handleOpenCategoryEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { serviceId, categoryId, categoryName, fromURL } = customEvent.detail;
        
        // Convert categoryId to string for consistent comparison
        const categoryIdStr = String(categoryId);
        
        // Find the category we want to select
        const categoryToSelect = categories.find(cat => String(cat.id) === categoryIdStr);
        
        if (categoryToSelect && String(selectedService.id) === String(serviceId)) {
          // Update UI to show the selected category name
          setSelectedCategoryName(categoryToSelect.name);
          
          // Enhanced function to attempt category click with better retry logic
          const attemptCategoryClick = (attempt = 1, maxAttempts = 8) => {
            // First, handle the data selection through the normal flow
            handleCategoryClick(categoryToSelect);
            
            // Focus on the category card
            focusCategoryCard(categoryToSelect.id);
            
            // Try to find and click the DOM element for the category
            setTimeout(() => {
              const categoryElement = document.querySelector(`[data-category-id="${categoryToSelect.id}"]`);
              
              if (categoryElement) {
                // Find the clickable card within the category element
                const clickableCard = categoryElement.querySelector('.cursor-pointer');
                
                if (clickableCard && clickableCard instanceof HTMLElement) {
                  // Ensure the element is visible and scrolled into view
                  clickableCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  
                  // Wait a moment for scroll, then click
                  setTimeout(() => {
                    clickableCard.click();
                  }, 200);
                  
                  return; // Success, exit
                }
              }
              
              // If we couldn't find the element and haven't reached max attempts, retry
              if (attempt < maxAttempts) {
                const retryDelay = fromURL ? 800 * attempt : 500 * attempt; // Longer delays for URL events
                setTimeout(() => attemptCategoryClick(attempt + 1, maxAttempts), retryDelay);
              } else {
                // Last resort: try direct onSelectCategory call
                onSelectCategory(categoryToSelect.id, categoryToSelect.name);
              }
            }, fromURL ? 600 * attempt : 300 * attempt); // Longer initial delays for URL events
          };
          
          // Start the attempt process with appropriate delay based on source
          const initialDelay = fromURL ? 1000 : 500; // Longer delay for URL-triggered events
          setTimeout(() => attemptCategoryClick(), initialDelay);
          
        } else {
          // If category not found, maybe categories haven't loaded yet, retry
          if (!categoryToSelect && categories.length === 0) {
            console.log("Categories not loaded yet, will retry when they load");
          }
        }
      }
    };
    
    document.addEventListener('openCategory', handleOpenCategoryEvent);
    
    return () => {
      document.removeEventListener('openCategory', handleOpenCategoryEvent);
    };
  }, [categories, selectedService.id, onSelectCategory]);

  // Add listener for retry events
  useEffect(() => {
    const handleRetryCategory = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { serviceId, categoryId, categoryName } = customEvent.detail;
        
        // Dispatch the original openCategory event again
        setTimeout(() => {
          const openCategoryEvent = new CustomEvent('openCategory', {
            detail: { serviceId, categoryId, categoryName, fromURL: true }
          });
          document.dispatchEvent(openCategoryEvent);
        }, 300);
      }
    };
    
    document.addEventListener('retryCategory', handleRetryCategory);
    
    return () => {
      document.removeEventListener('retryCategory', handleRetryCategory);
    };
  }, []);

  // New function to focus and automatically click on a specific category card
  const focusCategoryCard = (categoryId: string) => {
    try {
      // Try to get the reference to the card from our refs map
      const cardRef = categoryCardsRefs.current.get(categoryId);
      
      // Find the category name to match with the selected one
      const category = categories.find(cat => cat.id === categoryId);
      const categoryName = category ? category.name : null;
      
      if (cardRef) {
        // Scroll the card into view and focus it
        cardRef.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center'
        });
        
        // Set focus on the card (for accessibility)
        cardRef.focus();
        
        // Simulate click on the card after focusing
        setTimeout(() => {
          if (categoryName === selectedCategoryName) {
            cardRef.click();
          }
        }, 300);
      } else {
        // Try to find the card by query selector as fallback
        const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
        if (categoryElement && categoryElement instanceof HTMLElement) {
          categoryElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
          });
          
          categoryElement.focus();
          
          // Also try to click it if it's a match
          if (categoryName === selectedCategoryName) {
            setTimeout(() => {
              const clickableElement = categoryElement.querySelector('.cursor-pointer');
              if (clickableElement && clickableElement instanceof HTMLElement) {
                clickableElement.click();
              }
            }, 300);
          }
        }
      }
    } catch (error) {
      console.error("Error focusing category card:", error);
    }
  };

  // Log when purchaseLocation changes to aid debugging
  useEffect(() => {
    if (purchaseLocation) {
      // If we have a category in the purchase location, update the selectedCategoryName
      if (purchaseLocation.categoryName) {
        setSelectedCategoryName(purchaseLocation.categoryName);
      }
    }
  }, [purchaseLocation]);

  // Function to preload product data when a category is selected
  const preloadProductData = async (categoryId: string) => {
    if (!selectedService.id) return;
    
    try {
      const endpoint = `npm /ObtenerNivel2?Nivel0=${selectedService.id}&Nivel1=${categoryId}`;
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
        const cacheData = localStorage.getItem('category_images_cache');
        if (cacheData) {
          const {
            images,
            timestamp
          } = JSON.parse(cacheData);

          // Verificar si la caché ha expirado
          if (Date.now() - timestamp < 24 * 60 * 60 * 1000) {
            setCachedImages(images || {});
            console.log('Imágenes de categorías cargadas desde caché local', Object.keys(images).length);
          } else {
            console.log('Caché de imágenes expirada, limpiando...');
            localStorage.removeItem('category_images_cache');
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
          localStorage.setItem('category_images_cache', JSON.stringify({
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
            const dataURL = canvas.toDataURL('image/jpeg', 0.6);
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

  // Handle category selection with global variable storage - REMOVED DEBUG MESSAGES
  const handleCategoryClick = (category: Category) => {
    // Store the selected category ID and name in global variables
    lastSelectedCategoryId = category.id;
    lastSelectedCategoryName = category.name;
    
    // Update the local state to show the selected category
    setSelectedCategoryName(category.name);
    
    // Dispatch a custom event to notify any listening components about the category selection
    const categorySelectedEvent = new CustomEvent('categorySelected', { 
      detail: { 
        categoryId: category.id,
        categoryName: category.name,
        serviceId: selectedService.id 
      } 
    });
    document.dispatchEvent(categorySelectedEvent);
    
    // Focus on the category card
    focusCategoryCard(category.id);
    
    // Preload product data in the background
    preloadProductData(category.id);
    
    // Call the parent's onSelectCategory function
    onSelectCategory(category.id, category.name);
  };

  // Check if this category is the auto-selected one - IMPROVED
  const isSelectedCategory = (categoryId: string) => {
    const categoryIdStr = autoSelectCategoryId ? String(autoSelectCategoryId) : null;
    return categoryIdStr === String(categoryId);
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
      <h3 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6 text-center px-2 mx-auto">
        <span>SELECCIONÁ UNA CATEGORÍA</span>
      </h3>
      
      <Carousel className="w-full max-w-xs xs:max-w-sm sm:max-w-md md:max-w-xl lg:max-w-3xl mx-auto" opts={{
      align: "center",
      loop: true
    }}>
        <CarouselContent className="-ml-2 sm:-ml-4">
          {categories.map(category => (
            <CarouselItem 
              key={category.id} 
              ref={el => el && itemRefs.current.set(category.id, el)} 
              data-category-id={category.id} 
              className="basis-1/2 sm:basis-1/3 lg:basis-1/4 pl-2 sm:pl-4 mx-1"
            >
              <div 
                onClick={() => handleCategoryClick(category)} 
                className={`cursor-pointer hover:scale-105 transition-transform mx-5px ${
                  isSelectedCategory(category.id) ? 'ring-2 ring-primary ring-offset-2' : ''
                }`}
                ref={el => el && categoryCardsRefs.current.set(category.id, el)}
                tabIndex={0}
                data-category-name={category.name}
              >
                <div className="overflow-hidden rounded-full border-2 border-primary mx-auto w-16 sm:w-20 h-16 sm:h-20 mb-2 bg-gray-100 relative">
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
    </div>;
};

export default CategoryCarousel;
