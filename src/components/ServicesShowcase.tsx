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
  return <section className="py-16 bg-[#F0F0F0]">
      <div className="container mx-auto">
        
        {/* Title for the Services Section - Adding it now */}
        <div className="mb-12">
          <h2 className="font-bold text-center text-white uppercase text-2xl flex flex-col">
            <span className="bg-secondary py-5 px-8 rounded-md inline-block">SERVICIOS REALIZADOS</span>
          </h2>
        </div>
        
        <div ref={servicesDescriptionRef} className="max-w-3xl mx-auto mt-8 mb-12 animate-from-left opacity-0">
          {/* Services Description Content */}
        </div>
        
        <div ref={servicesGridRef} className="animate-from-right opacity-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-1 gap-y-0">
          {ServiceItems.map((service, index) => <div key={index} className="service-item opacity-0 cursor-pointer transition-transform duration-300 hover:scale-110">
              
            </div>)}
        </div>
        
        {/* Services Counter Section */}
        <div ref={counterSectionRef} className="mt-20 flex flex-col md:flex-row items-center justify-center gap-6 animate-from-left opacity-0">
          <div className="text-secondary text-2xl md:text-3xl font-bold uppercase">
            SERVICIOS REALIZADOS
          </div>
          
          <div className="flex">
            {[0, 9, 8, 8, 0, 0].map((digit, index) => <div key={index} className="bg-[#1A1F2C] text-white w-10 h-14 md:w-12 md:h-16 flex items-center justify-center text-xl md:text-2xl font-bold mx-0.5 service-item opacity-0">
                {digit}
              </div>)}
          </div>
          
          <div className="text-secondary text-2xl md:text-3xl font-bold uppercase">
            Y CONTANDO...
          </div>
        </div>
        
        {/* Seals Section */}
        <div ref={sealsSectionRef} className="mt-16 animate-from-right opacity-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
            {SealItems.map((seal, index) => <div key={index} className="flex flex-col items-center seal-item opacity-0">
                <img src={seal.imageUrl} alt={seal.alt} className="h-28 w-28 mb-2 transition-transform hover:scale-110 duration-300" />
                <p className="text-center text-sm">{seal.alt}</p>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
export default ServicesShowcase;