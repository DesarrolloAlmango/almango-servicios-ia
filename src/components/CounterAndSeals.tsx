
import React, { useEffect, useRef } from 'react';

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

const CounterAndSeals: React.FC = () => {
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

    // Setup observer for staggered animation
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
    if (counterSectionRef.current) {
      sectionObserver.observe(counterSectionRef.current);
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
    };
  }, []);

  return (
    <section className="py-16 bg-[#F0F0F0]">
      <div className="container mx-auto">
        {/* Services Counter Section */}
        <div ref={counterSectionRef} className="mt-8 flex flex-col md:flex-row items-center justify-center gap-6 animate-from-left opacity-0">
          <div className="text-secondary text-2xl md:text-3xl font-bold uppercase">
            SERVICIOS REALIZADOS
          </div>
          
          <div className="flex">
            {[0, 9, 8, 8, 0, 0].map((digit, index) => (
              <div key={index} className="bg-[#1A1F2C] text-white w-10 h-14 md:w-12 md:h-16 flex items-center justify-center text-xl md:text-2xl font-bold mx-0.5 service-item opacity-0">
                {digit}
              </div>
            ))}
          </div>
          
          <div className="text-secondary text-2xl md:text-3xl font-bold uppercase">
            Y CONTANDO...
          </div>
        </div>
        
        {/* Seals Section */}
        <div ref={sealsSectionRef} className="mt-16 animate-from-right opacity-0">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-6">
            {SealItems.map((seal, index) => (
              <div key={index} className="flex flex-col items-center seal-item opacity-0">
                <img src={seal.imageUrl} alt={seal.alt} className="h-28 w-28 mb-2 transition-transform hover:scale-110 duration-300" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CounterAndSeals;
