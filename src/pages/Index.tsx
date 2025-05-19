
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
const firstHalfLogos = [{
  url: "https://almango.com.uy/img/logos/logo-sodimac.png",
  alt: "Sodimac"
}, {
  url: "https://almango.com.uy/img/logos/logo-devoto.png",
  alt: "Devoto"
}, {
  url: "https://almango.com.uy/img/logos/logo-disco.png",
  alt: "Disco"
}, {
  url: "https://almango.com.uy/img/logos/logo-geant.png",
  alt: "Geant"
}, {
  url: "https://almango.com.uy/img/logos/Logos-Almango-03.png",
  alt: "Almango"
}, {
  url: "https://almango.com.uy/img/logos/logo-lacueva.png",
  alt: "La Cueva"
}, {
  url: "https://almango.com.uy/img/logos/logo-lamulata.png",
  alt: "La Mulata"
}, {
  url: "https://almango.com.uy/img/logos/logo-prontometal.png",
  alt: "Pronto Metal"
}];

// Last 8 logos
const secondHalfLogos = [{
  url: "https://almango.com.uy/img/logos/logo-arte.png",
  alt: "Arte"
}, {
  url: "https://almango.com.uy/img/logos/logo-cimarron.png",
  alt: "Cimarron"
}, {
  url: "https://almango.com.uy/img/logos/logo-ferrobasso.png",
  alt: "Ferro Basso"
}, {
  url: "https://almango.com.uy/img/logos/logo-elombu.png",
  alt: "El Ombu"
}, {
  url: "https://almango.com.uy/img/logos/logo-adi.png",
  alt: "ADI"
}, {
  url: "https://almango.com.uy/img/logos/logo-volkers.png",
  alt: "Volkers"
}, {
  url: "https://almango.com.uy/img/logos/logo-tiendamia.png",
  alt: "Tienda Mia"
}, {
  url: "https://almango.com.uy/img/logos/logo-blanes.png",
  alt: "Blanes"
}];

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
  return <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main id="inicio" className="flex-grow bg-zinc-200 mx-0 my-0 overflow-x-hidden relative">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <Hero />
        </div>
        
        {/* Service Cards Grid - positioned to overlap with the hero section with higher z-index */}
        <div style={{ position: 'relative', zIndex: 10 }}>
          <ServiceCardsGrid />
        </div>
        
        {/* Subtle separator */}
        <Separator className="h-0.5 bg-primary/30 my-4 mx-auto w-[80%] rounded-full" />
        
        {/* Partners Section - Updated with light background */}
        <section ref={partnersSectionRef} className="bg-[#F0F0F0] py-12 animate-from-left w-full">
          <div className="container mx-auto px-4">
            <div className="relative mb-8">
              <div className="w-full max-w-3xl mx-auto">
                <h2 className="font-bold text-center text-gray-800 uppercase text-2xl flex flex-col">
                  <span className="bg-gradient-to-r from-secondary to-secondary/80 py-5 px-8 rounded-md inline-block shadow-lg relative overflow-hidden border-l-4 border-primary">
                    <span className="relative z-10 text-white">ALGUNOS DE NUESTROS CLIENTES Y ALIANZAS COMERCIALES</span>
                  </span>
                </h2>
              </div>
            </div>
          </div>
          
          <div className="w-full px-4 py-6">
            <div className="w-full overflow-hidden max-w-6xl mx-auto">
              <LogoCarousel logos={allLogos} direction="rtl" speed="super-slow" />
            </div>
          </div>
        </section>
        
        {/* Subtle separator */}
        <Separator className="h-0.5 bg-primary/30 my-4 mx-auto w-[80%] rounded-full" />
        
        <section id="nuestros-servicios" className="bg-[#F0F0F0]">
          <ServicesShowcase />
        </section>
        
        {/* Subtle separator */}
        <Separator className="h-0.5 bg-primary/30 my-4 mx-auto w-[80%] rounded-full" />
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>;
};
export default Index;
