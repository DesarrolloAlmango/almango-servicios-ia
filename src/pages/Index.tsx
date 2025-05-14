import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServicesShowcase from "@/components/ServicesShowcase";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import LogoCarousel from "@/components/LogoCarousel";
import { Separator } from "@/components/ui/separator";
import ServiceCardsGrid from "@/components/ServiceCardsGrid";

// First 8 logos
const firstHalfLogos = [
  {
    url: "https://almango.com.uy/img/logos/logo-sodimac.png",
    alt: "Sodimac"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-devoto.png",
    alt: "Devoto"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-disco.png",
    alt: "Disco"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-geant.png",
    alt: "Geant"
  },
  {
    url: "https://almango.com.uy/img/logos/Logos-Almango-03.png",
    alt: "Almango"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-lacueva.png",
    alt: "La Cueva"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-lamulata.png",
    alt: "La Mulata"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-prontometal.png",
    alt: "Pronto Metal"
  }
];

// Last 8 logos
const secondHalfLogos = [
  {
    url: "https://almango.com.uy/img/logos/logo-arte.png",
    alt: "Arte"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-cimarron.png",
    alt: "Cimarron"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-ferrobasso.png",
    alt: "Ferro Basso"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-elombu.png",
    alt: "El Ombu"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-adi.png",
    alt: "ADI"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-volkers.png",
    alt: "Volkers"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-tiendamia.png",
    alt: "Tienda Mia"
  },
  {
    url: "https://almango.com.uy/img/logos/logo-blanes.png",
    alt: "Blanes"
  }
];

// Combine all logos into a single array for the carousel
const allLogos = [...firstHalfLogos, ...secondHalfLogos];

const Index = () => {
  // Create refs for each section to animate
  const contratarSectionRef = useRef<HTMLElement>(null);
  const quienesSomosSectionRef = useRef<HTMLElement>(null);
  const formarParteSectionRef = useRef<HTMLElement>(null);
  const partnersSectionRef = useRef<HTMLElement>(null);

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

          // For step-by-step item animations with increased delay between items
          const animItems = entry.target.querySelectorAll('.anim-item');
          animItems.forEach((item, index) => {
            // Increased delay between items to make the sequence more visible
            const delay = index * 0.3; // Increased from 0.1 to 0.3 seconds
            (item as HTMLElement).style.animationDelay = `${delay}s`;
            item.classList.add('animate-item-appear');
          });

          // Special animation for the contratar section steps
          const contratarItems = entry.target.querySelectorAll('.contratar-item');
          contratarItems.forEach((item, index) => {
            const delay = index * 0.5; // Half-second delay between items
            (item as HTMLElement).style.animationDelay = `${delay}s`;
            item.classList.add('animate-item-appear');

            // Find icon and text within this item and apply cascading animation
            const icon = item.querySelector('.icon-container');
            const title = item.querySelector('.item-title');
            const desc = item.querySelector('.item-desc');
            if (icon) {
              (icon as HTMLElement).style.animationDelay = `${delay}s`;
              icon.classList.add('animate-scale-in');
            }
            if (title) {
              (title as HTMLElement).style.animationDelay = `${delay + 0.2}s`;
              title.classList.add('animate-fade-in');
            }
            if (desc) {
              (desc as HTMLElement).style.animationDelay = `${delay + 0.4}s`;
              desc.classList.add('animate-fade-in');
            }
          });
          sectionObserver.unobserve(entry.target);
        }
      });
    }, options);

    // Observe sections
    if (contratarSectionRef.current) {
      sectionObserver.observe(contratarSectionRef.current);
    }
    if (quienesSomosSectionRef.current) {
      sectionObserver.observe(quienesSomosSectionRef.current);
    }
    if (formarParteSectionRef.current) {
      sectionObserver.observe(formarParteSectionRef.current);
    }
    if (partnersSectionRef.current) {
      sectionObserver.observe(partnersSectionRef.current);
    }
    return () => {
      sectionObserver.disconnect();
    };
  }, []);
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow" id="inicio">
        <Hero />
        
        {/* Service Cards Grid - positioned to overlap with the hero section */}
        <ServiceCardsGrid />
        
        {/* Partners Section - Moved here to be right after service cards */}
        <section ref={partnersSectionRef} className="bg-[#F0F0F0] py-8 animate-from-left w-full">
          <div className="bg-[#F97316] mb-8 -mt-8 px-0 mx-0 py-[46px] w-full">
            <h2 className="font-bold text-center text-white uppercase text-2xl flex flex-col">
              <span className="px-[20px]">ALGUNOS DE NUESTROS CLIENTES</span>
              <span className="px-[20px]">Y ALIANZAS COMERCIALES</span>
            </h2>
          </div>
          
          <div className="w-full px-0">
            <div className="w-full overflow-hidden">
              <LogoCarousel logos={allLogos} direction="rtl" speed="normal" />
            </div>
          </div>
        </section>
        
        <Separator className="h-1 bg-black mt-8" />
        
        <section id="nuestros-servicios">
          <ServicesShowcase />
        </section>
        
        <Separator className="h-1 bg-black" />
        
        <section ref={contratarSectionRef} id="como-contratar" className="py-20 px-4 bg-primary text-white animate-from-right">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center uppercase">¿CÓMO CONTRATAR?</h2>
            <h3 className="text-xl font-medium mb-12 text-center">PROCESO DE CONTRATACIÓN</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
              <div className="text-center flex flex-col items-center contratar-item opacity-0">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110 icon-container opacity-0">
                  <img src="https://almango.com.uy/img/agenda-almango.svg" alt="Agenda" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2 item-title opacity-0">Agendá fecha y hora</h4>
                <p className="text-white/90 item-desc opacity-0">Coordinación inmediata.</p>
              </div>
              
              <div className="text-center flex flex-col items-center contratar-item opacity-0">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110 icon-container opacity-0">
                  <img src="https://almango.com.uy/img/pago-almango.svg" alt="Recibir técnico" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2 item-title opacity-0">Recibí al técnico</h4>
                <p className="text-white/90 item-desc opacity-0">Un profesional calificado realizará el trabajo.</p>
              </div>
              
              <div className="text-center flex flex-col items-center contratar-item opacity-0">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110 icon-container opacity-0">
                  <img src="https://almango.com.uy/img/pago-almango.svg" alt="Pago" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2 item-title opacity-0">Realizá el pago al finalizar</h4>
                <p className="text-white/90 item-desc opacity-0">Seleccioná el medio que más te convenga.</p>
              </div>
              
              <div className="text-center flex flex-col items-center contratar-item opacity-0">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110 icon-container opacity-0">
                  <img src="https://almango.com.uy/img/valora-almango.svg" alt="Valoración" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2 item-title opacity-0">Ayudanos a mejorar</h4>
                <p className="text-white/90 item-desc opacity-0">Calificá el servicio, tus comentarios importan.</p>
              </div>
            </div>
          </div>
        </section>
        
        <Separator className="h-1 bg-black" />
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
