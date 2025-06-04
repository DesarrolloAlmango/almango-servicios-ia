import React, { useEffect, useRef, useState } from 'react';

interface SealItem {
  imageUrl: string;
  alt: string;
}

const SealItems: SealItem[] = [{
  imageUrl: "https://almango.com.uy/img/caracteristicas/01-atencion-personalizada.svg",
  alt: "Atención personalizada"
}, {
  imageUrl: "https://almango.com.uy/img/caracteristicas/02-servicios-seguros.svg",
  alt: "Servicios seguros"
}, {
  imageUrl: "https://almango.com.uy/img/caracteristicas/03-profesionales-calificados.svg",
  alt: "Profesionales calificados"
}, {
  imageUrl: "https://almango.com.uy/img/caracteristicas/04-pago-online.svg",
  alt: "Pago online"
}, {
  imageUrl: "https://almango.com.uy/img/caracteristicas/05-garantia-de-instalacion.svg",
  alt: "Garantía de instalación"
}, {
  imageUrl: "https://almango.com.uy/img/caracteristicas/06-proveedores-verificados.svg",
  alt: "Proveedores verificados"
}];

const ServicesShowcase: React.FC = () => {
  const [serviceCount, setServiceCount] = useState<number>(98800);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Create refs for each section to animate
  const servicesDescriptionRef = useRef<HTMLDivElement>(null);
  const counterSectionRef = useRef<HTMLDivElement>(null);
  const sealsSectionRef = useRef<HTMLDivElement>(null);

  // Fetch service count from API
  useEffect(() => {
    const fetchServiceCount = async () => {
      console.log('Iniciando obtención del número de servicios...');
      
      try {
        console.log('Intentando endpoint: https://app.almango.com.uy/WebAPI/ObtenerNroServicio');
        const response = await fetch('https://app.almango.com.uy/WebAPI/ObtenerNroServicio');
        
        if (response.ok) {
          const count = await response.json();
          console.log('Número de servicios obtenido exitosamente:', count);
          setServiceCount(count);
        } else {
          console.error('Error en el endpoint:', response.status);
        }
      } catch (error) {
        console.error('Error en la llamada al endpoint:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Pequeña demora para que se ejecute después de las tarjetas
    const timer = setTimeout(() => {
      fetchServiceCount();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Convert number to array of digits for display
  const getDigitsArray = (number: number): number[] => {
    return number.toString().padStart(6, '0').split('').map(digit => parseInt(digit));
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    // Setup observer for section animations
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('animate-from-left')) {
            entry.target.classList.add('animate-section-from-left');
          } else if (entry.target.classList.contains('animate-from-right')) {
            entry.target.classList.add('animate-section-from-right');
          }
          sectionObserver.unobserve(entry.target);
        }
      });
    }, options);

    // Setup observer for service items (staggered animation)
    const itemObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Apply staggered animation based on index stored in data-index
          const index = parseInt(entry.target.getAttribute('data-index') || '0');
          // Staggered delay (0.05s per item)
          const delay = index * 0.05;
          (entry.target as HTMLElement).style.animationDelay = `${delay}s`;
          entry.target.classList.add('animate-item-appear');
          itemObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    // Special observer for counter digits to animate them individually
    const counterObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counters = entry.target.querySelectorAll('.service-item');
          counters.forEach((item, index) => {
            const delay = index * 0.1;
            (item as HTMLElement).style.animationDelay = `${delay}s`;
            item.classList.add('animate-item-appear');
          });
          counterObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1
    });

    // Observe sections
    if (servicesDescriptionRef.current) {
      sectionObserver.observe(servicesDescriptionRef.current);
    }
    if (counterSectionRef.current) {
      sectionObserver.observe(counterSectionRef.current);
      counterObserver.observe(counterSectionRef.current);
    }
    if (sealsSectionRef.current) {
      sectionObserver.observe(sealsSectionRef.current);
    }

    // Observe each seal item
    document.querySelectorAll('.seal-item').forEach((item, index) => {
      item.setAttribute('data-index', index.toString());
      itemObserver.observe(item);
    });
    return () => {
      sectionObserver.disconnect();
      itemObserver.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  return (
    <section className="py-16 bg-[#F0F0F0] overflow-x-hidden">
      <div className="container mx-auto px-4">
        
        {/* Title for the Services Section - Updated with enhanced styling */}
        <div className="mb-12 relative">
          <div className="w-full max-w-3xl mx-auto">
            <h2 className="font-bold text-center text-gray-800 uppercase text-2xl flex flex-col">
              <span className="bg-gradient-to-r from-secondary to-secondary/80 py-5 px-8 rounded-md inline-block shadow-lg relative overflow-hidden border-l-4 border-primary">
                <span className="relative z-10 text-white">SERVICIOS REALIZADOS</span>
              </span>
            </h2>
          </div>
        </div>
        
        <div ref={servicesDescriptionRef} className="max-w-3xl mx-auto mt-8 mb-12 animate-from-left opacity-0">
          {/* Services Description Content */}
        </div>
        
        {/* Services Counter Section - Updated with dynamic number */}
        <div ref={counterSectionRef} className="mt-14 flex flex-col md:flex-row items-center justify-center gap-6 animate-from-left opacity-0 bg-white/80 py-8 px-6 rounded-md shadow-md">
          <div className="text-gray-800 text-2xl md:text-3xl font-bold uppercase">
            SERVICIOS REALIZADOS
          </div>
          
          <div className="flex">
            {isLoading ? (
              // Loading state - show spinning placeholder
              <div className="w-10 h-14 md:w-12 md:h-16 flex items-center justify-center text-xl md:text-2xl font-bold mx-1 rounded-md shadow-md bg-gray-400 animate-pulse">
                <span className="text-white">...</span>
              </div>
            ) : (
              getDigitsArray(serviceCount).map((digit, index) => (
                <div 
                  key={index} 
                  className="service-item opacity-0 text-white w-10 h-14 md:w-12 md:h-16 flex items-center justify-center text-xl md:text-2xl font-bold mx-1 rounded-md shadow-md"
                  style={{backgroundColor: index % 2 === 0 ? '#ff6900' : '#008be1'}}
                >
                  {digit}
                </div>
              ))
            )}
          </div>
          
          <div className="text-gray-800 text-2xl md:text-3xl font-bold uppercase">
            Y CONTANDO...
          </div>
        </div>
        
        {/* Seals Section - Updated with blue and white background */}
        <div ref={sealsSectionRef} className="mt-16 animate-from-right opacity-0">
          <div className="bg-gradient-to-r from-secondary/90 to-secondary/70 py-10 px-6 rounded-lg shadow-md">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
              {SealItems.map((seal, index) => (
                <div key={index} className="flex flex-col items-center seal-item opacity-0">
                  <div className="h-28 w-28 p-3 rounded-full bg-white/90 shadow-md border border-primary/40 flex items-center justify-center mb-3 hover:shadow-lg transition-all duration-300 transform hover:rotate-6">
                    <img 
                      src={seal.imageUrl} 
                      alt={seal.alt} 
                      className="h-20 w-20 transition-transform hover:scale-110 duration-300" 
                    />
                  </div>
                  <p className="text-center text-sm font-medium text-white">{seal.alt}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesShowcase;
