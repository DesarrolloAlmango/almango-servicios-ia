
import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServicesShowcase from "@/components/ServicesShowcase";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import LogoCarousel from "@/components/LogoCarousel";
import { Separator } from "@/components/ui/separator";
import ServiceCardsGrid from "@/components/ServiceCardsGrid";

// Logos reorganizados según el orden solicitado con las URLs corregidas
const organizedLogos = [
  // DIVINO - corregido
  { url: "https://almango.com.uy/img/logos/DIVINO.png", alt: "DIVINO" },
  // EL EMPORIO DEL HOGAR - corregido
  { url: "https://almango.com.uy/img/logos/EMPORIO.png", alt: "EL EMPORIO DEL HOGAR" },
  // MUEBLERIA DELMAR - corregido
  { url: "https://almango.com.uy/img/logos/DELMAR.jpg", alt: "MUEBLERIA DELMAR" },
  // NARVAJA HOGAR - corregido
  { url: "https://almango.com.uy/img/logos/NARVAJA.png", alt: "NARVAJA HOGAR" },
  // SODIMAC - corregido
  { url: "https://almango.com.uy/img/logos/logo-sodimac.png", alt: "SODIMAC" },
  // BALTON - corregido
  { url: "https://almango.com.uy/img/logos/BALTON.jpg", alt: "BALTON" },
  // FINKEL - corregido
  { url: "https://almango.com.uy/img/logos/FINKEL.png", alt: "FINKEL" },
  // CAROLINAS STORE - corregido extensión a .jpg
  { url: "https://almango.com.uy/img/logos/STORE.jpg", alt: "CAROLINAS STORE" },
  // ACHER CERÁMICAS - corregido
  { url: "https://almango.com.uy/img/logos/ACHER.png", alt: "ACHER CERÁMICAS" },
  // LA CUEVA MUEBLES - corregido
  { url: "https://almango.com.uy/img/logos/logo-lacueva.png", alt: "LA CUEVA MUEBLES" },
  // EL CERRO ELECTRODOMÉSTICOS - no disponible, espacio vacío
  { url: "", alt: "EL CERRO ELECTRODOMÉSTICOS" },
  // LA MULATA MUEBLES - corregido
  { url: "https://almango.com.uy/img/logos/logo-lamulata.png", alt: "LA MULATA MUEBLES" },
  // PGU URUGUAY - corregido
  { url: "https://almango.com.uy/img/logos/PGU.png", alt: "PGU URUGUAY" },
  // LABORATORIO ATGEN - no disponible, espacio vacío
  { url: "", alt: "LABORATORIO ATGEN" },
  // LABORATORIO BELTRAN ZUNINO - no disponible, espacio vacío
  { url: "", alt: "LABORATORIO BELTRAN ZUNINO" },
  // PRONTOMETAL - corregido
  { url: "https://almango.com.uy/img/logos/logo-prontometal.png", alt: "PRONTOMETAL" },
  // ONFLOR - corregido
  { url: "https://almango.com.uy/img/logos/ONFLOR.png", alt: "ONFLOR" },
  // MINISTERIO DE GANADERÍA AGRICULTURA Y PESCA (MGAP) - no disponible, espacio vacío
  { url: "", alt: "MINISTERIO DE GANADERÍA AGRICULTURA Y PESCA (MGAP)" },
  // PODER JUDICIAL - no disponible, espacio vacío
  { url: "", alt: "PODER JUDICIAL" },
  // INTENDENCIA MUNICIPAL DE MONTEVIDEO - no disponible, espacio vacío
  { url: "", alt: "INTENDENCIA MUNICIPAL DE MONTEVIDEO" },
  // ENGEL & VOLKERS - corregido
  { url: "https://almango.com.uy/img/logos/logo-volkers.png", alt: "ENGEL & VOLKERS" },
  // SUPERMERCADOS: DISCO - corregido
  { url: "https://almango.com.uy/img/logos/logo-disco.png", alt: "DISCO" },
  // SUPERMERCADOS: GEANT - corregido
  { url: "https://almango.com.uy/img/logos/logo-geant.png", alt: "GEANT" },
  // SUPERMERCADOS: DEVOTO - corregido
  { url: "https://almango.com.uy/img/logos/logo-devoto.png", alt: "DEVOTO" },
  // SUPERMERCADOS: LA CABAÑA - no disponible, espacio vacío
  { url: "", alt: "LA CABAÑA" }
];

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
    <div className="min-h-screen flex flex-col overflow-x-hidden">
      <Header />
      <main id="inicio" className="flex-grow bg-zinc-200 mx-0 my-0 overflow-x-hidden">
        <Hero />
        
        {/* Service Cards Grid - positioned to overlap with the hero section */}
        <ServiceCardsGrid />
        
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
          
          <div className="w-full px-4 py-0">
            <div className="w-full overflow-hidden max-w-6xl mx-auto">
              <LogoCarousel logos={organizedLogos} direction="rtl" speed="super-slow" />
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
    </div>
  );
};
export default Index;
