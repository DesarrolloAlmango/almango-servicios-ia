
import React, { useEffect, useRef } from 'react';
interface ServiceItem {
  title: string;
  imageUrl: string;
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

const ServicesShowcase: React.FC = () => {
  // Create refs for each section to animate
  const servicesDescriptionRef = useRef<HTMLDivElement>(null);
  const servicesGridRef = useRef<HTMLDivElement>(null);
  
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

    // Observe each service item
    document.querySelectorAll('.service-item').forEach((item, index) => {
      // Store index for staggered delay
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
        <div ref={servicesDescriptionRef} className="max-w-3xl mx-auto mt-8 mb-12 animate-from-left opacity-0">
        </div>
        
        <div ref={servicesGridRef} className="animate-from-right opacity-0 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-1 gap-y-0">
          {ServiceItems.map((service, index) => <div key={index} className="service-item opacity-0 cursor-pointer transition-transform duration-300 hover:scale-110">
            </div>)}
        </div>
      </div>
    </section>;
};
export default ServicesShowcase;
