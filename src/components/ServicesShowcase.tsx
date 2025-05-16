import React, { useEffect, useRef } from 'react';

interface ServiceItem {
  title: string;
  imageUrl: string;
}

interface SealItem {
  imageUrl: string;
  alt: string;
}

const ServiceItems: ServiceItem[] = [{
  title: "INSTALACIONES ELÉCTRICAS",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-01.png"
}, {
  title: "ARMADO DE MUEBLES",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-04.png"
}, {
  title: "INSTALACIONES SANITARIAS",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-02.png"
}, {
  title: "SERVICIO DE A/A",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-05.png"
}, {
  title: "MUDANZAS",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-03.png"
}, {
  title: "INSTALACIÓN DE ELECTRO DOMÉSTICOS",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-06.png"
}, {
  title: "JARDINERÍA",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-07.png"
}, {
  title: "ALBAÑILERÍA",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-11.png"
}, {
  title: "REVESTIMIENTO",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-08.png"
}, {
  title: "PINTURA",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-12.png"
}, {
  title: "SISTEMAS DE SEGURIDAD",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-09.png"
}, {
  title: "CERRAJERÍA",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-09.png"
}, {
  title: "DECO HOGAR",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-10.png"
}, {
  title: "HERRERÍA",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-14.png"
}, {
  title: "LIMPIEZA",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-15.png"
}, {
  title: "FUMIGACIÓN",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-16.png"
}, {
  title: "SERVICIO TÉCNICO",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-17.png"
}, {
  title: "STEEL FRAMING",
  imageUrl: "https://almango.com.uy/img/iconos/icon-steelframing.png"
}, {
  title: "MONTAJES PARA DEPÓSITOS",
  imageUrl: "https://almango.com.uy/img/iconos/icon-depositos.png"
}, {
  title: "CALEFACCIÓN",
  imageUrl: "https://almango.com.uy/img/iconos/icono-almango-18.png"
}];

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
  // Create refs for each section to animate
  const servicesDescriptionRef = useRef<HTMLDivElement>(null);
  const servicesGridRef = useRef<HTMLDivElement>(null);
  const counterSectionRef = useRef<HTMLDivElement>(null);
  const sealsSectionRef = useRef<HTMLDivElement>(null);

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

    // Observe sections
    if (servicesDescriptionRef.current) {
      sectionObserver.observe(servicesDescriptionRef.current);
    }
    if (servicesGridRef.current) {
      sectionObserver.observe(servicesGridRef.current);
    }
    if (counterSectionRef.current) {
      sectionObserver.observe(counterSectionRef.current);
    }
    if (sealsSectionRef.current) {
      sectionObserver.observe(sealsSectionRef.current);
    }

    // Observe each service item
    document.querySelectorAll('.service-item').forEach((item, index) => {
      // Store index for staggered delay
      item.setAttribute('data-index', index.toString());
      itemObserver.observe(item);
    });

    // Observe each seal item
    document.querySelectorAll('.seal-item').forEach((item, index) => {
      item.setAttribute('data-index', index.toString());
      itemObserver.observe(item);
    });
    return () => {
      sectionObserver.disconnect();
      itemObserver.disconnect();
    };
  }, []);

  return (
    <section className="py-16 bg-gradient-to-b from-secondary/30 to-secondary/10">
      <div className="container mx-auto px-4">
        
        {/* Title for the Services Section - Updated with enhanced styling */}
        <div className="mb-12 relative">
          <div className="w-full max-w-3xl mx-auto">
            <h2 className="font-bold text-center text-white uppercase text-2xl flex flex-col">
              <span className="bg-gradient-to-r from-secondary to-secondary/80 py-5 px-8 rounded-md inline-block shadow-lg relative overflow-hidden border-l-4 border-primary">
                <span className="relative z-10">SERVICIOS REALIZADOS</span>
              </span>
            </h2>
          </div>
        </div>
        
        <div ref={servicesDescriptionRef} className="max-w-3xl mx-auto mt-8 mb-12 animate-from-left opacity-0">
          {/* Services Description Content */}
        </div>
        
        {/* Updated grid with blue backgrounds and orange accents */}
        <div ref={servicesGridRef} className="animate-from-right opacity-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {ServiceItems.map((service, index) => (
            <div key={index} className="service-item opacity-0 cursor-pointer transition-transform duration-300 hover:scale-105 p-2">
              <div className="bg-secondary/80 rounded-lg p-3 h-full shadow-md flex flex-col items-center justify-center hover:shadow-lg transition-all border-t-2 border-primary/70">
                <div className="bg-white/90 rounded-full p-2 mb-2">
                  <img src={service.imageUrl} alt={service.title} className="h-12 w-12 object-contain" />
                </div>
                <p className="text-xs font-semibold text-center mt-1 text-white">{service.title}</p>
              </div>
            </div>
          ))}
        </div>
        
        {/* Services Counter Section - Updated with gradient blue background */}
        <div ref={counterSectionRef} className="mt-14 flex flex-col md:flex-row items-center justify-center gap-6 animate-from-left opacity-0 bg-secondary/70 py-6 px-4 rounded-md shadow-md">
          <div className="text-white text-2xl md:text-3xl font-bold uppercase">
            SERVICIOS REALIZADOS
          </div>
          
          <div className="flex">
            {[0, 9, 8, 8, 0, 0].map((digit, index) => (
              <div 
                key={index} 
                className="service-item opacity-0 bg-primary text-white w-10 h-14 md:w-12 md:h-16 flex items-center justify-center text-xl md:text-2xl font-bold mx-1 rounded-md shadow-md"
              >
                {digit}
              </div>
            ))}
          </div>
          
          <div className="text-white text-2xl md:text-3xl font-bold uppercase">
            Y CONTANDO...
          </div>
        </div>
        
        {/* Seals Section - Updated with blue gradient background */}
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
