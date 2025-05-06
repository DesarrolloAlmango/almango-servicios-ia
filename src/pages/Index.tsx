
import { useEffect, useRef } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServicesShowcase from "@/components/ServicesShowcase";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import LogoCarousel from "@/components/LogoCarousel";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
      threshold: 0.1,
    };

    // Setup observer for section animations
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('animate-from-left')) {
            entry.target.classList.add('animate-section-from-left');
          } else if (entry.target.classList.contains('animate-from-right')) {
            entry.target.classList.add('animate-section-from-right');
          }
          
          // For step-by-step item animations
          const animItems = entry.target.querySelectorAll('.anim-item');
          animItems.forEach((item, index) => {
            const delay = index * 0.1;
            (item as HTMLElement).style.animationDelay = `${delay}s`;
            item.classList.add('animate-item-appear');
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

  return <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow" id="inicio">
        <Hero />
        
        <Separator className="h-1 bg-black" />
        <section id="nuestros-servicios">
          <ServicesShowcase />
        </section>
        <Separator className="h-1 bg-black" />
        
        {/* Partners Section */}
        <section ref={partnersSectionRef} className="bg-[#F0F0F0] py-8 animate-from-left w-full">
          <div className="bg-[#F97316] mb-8 -mt-8 px-0 mx-0 py-[46px] w-full">
            <h2 className="font-bold text-center text-white uppercase text-2xl flex flex-col">
              <span>ALGUNOS DE NUESTROS CLIENTES</span>
              <span>Y ALIANZAS COMERCIALES</span>
            </h2>
          </div>
          
          <div className="w-full px-0">
            <div className="w-full overflow-hidden">
              <LogoCarousel logos={allLogos} direction="rtl" speed="normal" />
            </div>
          </div>
        </section>
        <Separator className="h-1 bg-black" />
        
        <section ref={contratarSectionRef} id="como-contratar" className="py-20 px-4 bg-primary text-white animate-from-right">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center uppercase">¿CÓMO CONTRATAR?</h2>
            <h3 className="text-xl font-medium mb-12 text-center">PROCESO DE CONTRATACIÓN</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
              <div className="text-center flex flex-col items-center anim-item opacity-0">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110">
                  <img src="https://almango.com.uy/img/agenda-almango.svg" alt="Agenda" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Agendá fecha y hora</h4>
                <p className="text-white/90">Coordinación inmediata.</p>
              </div>
              
              <div className="text-center flex flex-col items-center anim-item opacity-0">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110">
                  <img src="https://almango.com.uy/img/pago-almango.svg" alt="Recibir técnico" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Recibí al técnico</h4>
                <p className="text-white/90">Un profesional calificado realizará el trabajo.</p>
              </div>
              
              <div className="text-center flex flex-col items-center anim-item opacity-0">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110">
                  <img src="https://almango.com.uy/img/pago-almango.svg" alt="Pago" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Realizá el pago al finalizar</h4>
                <p className="text-white/90">Seleccioná el medio que más te convenga.</p>
              </div>
              
              <div className="text-center flex flex-col items-center anim-item opacity-0">
                <div className="mb-4 transition-all duration-300 transform hover:scale-110">
                  <img src="https://almango.com.uy/img/valora-almango.svg" alt="Valoración" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Ayudanos a mejorar</h4>
                <p className="text-white/90">Calificá el servicio, tus comentarios importan.</p>
              </div>
            </div>
          </div>
        </section>
        <Separator className="h-1 bg-black" />
        
        <section ref={quienesSomosSectionRef} id="quienes-somos" className="py-20 px-4 bg-white animate-from-left">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-secondary uppercase">¿Quiénes Somos?</h2>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md mx-auto mb-4">
                  
                </div>
                <div className="w-full max-w-3xl">
                  <h3 className="text-xl font-semibold mb-3 text-primary anim-item opacity-0">ACERCA DE NOSOTROS</h3>
                  <p className="text-lg text-gray-600 mb-6 anim-item opacity-0">
                    Somos una empresa tecnológica que brinda soluciones en la contratación de servicios y oficios, 
                    conectando a personas y empresas con proveedores de servicio previamente validados.
                  </p>
                  <p className="text-lg text-gray-600 mb-6 anim-item opacity-0">
                    Aportamos valor agregado en el proceso de contratación de proveedores de servicios, 
                    brindando garantía, cobertura ante daños, pago online, atención personalizada y mucho más.
                  </p>
                  <p className="text-lg text-gray-600 anim-item opacity-0">
                    Generamos nuevas oportunidades de negocio para comercios y proveedores de servicio a través de un modelo innovador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Separator className="h-1 bg-black" />
        
        <section ref={formarParteSectionRef} id="formar-parte" className="py-20 px-4 bg-gray-50 animate-from-right">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-secondary uppercase">¿SOS EMPRESA O COMERCIO? CONOCÉ LOS BENEFICIOS.</h2>
            
            <div className="flex flex-col max-w-4xl mx-auto gap-12">
              {/* Comercios Card with attached image */}
              <div className="flex flex-col md:flex-row w-full">
                <div className="w-full md:w-1/2 bg-white p-8 rounded-l-lg shadow-md anim-item opacity-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 text-primary">FORMAR PARTE COMERCIOS</h3>
                    <p className="text-lg text-gray-600 mb-6">
                      Incrementá tus ingresos al ser parte de nuestra red de socios. Generando solicitudes de 
                      servicio en nuestra plataforma, obtendrás atractivas comisiones. Registrate para más información.
                    </p>
                  </div>
                  
                  <div className="mt-8 text-center">
                    <a href="https://almango.com.uy/altas/altacomercio.html" target="_blank" rel="noreferrer" className="inline-block">
                      <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md uppercase font-medium text-lg shadow-lg w-full sm:w-auto break-words">
                        <span className="hidden custom:inline">Pre-Registros de Comercios</span>
                        <span className="inline custom:hidden">COMERCIOS</span>
                      </Button>
                    </a>
                  </div>
                </div>
                
                <div className="w-full md:w-1/2 h-full">
                  <img 
                    src="https://almango.com.uy/img/img-local.jpg" 
                    alt="Comercios" 
                    className="w-full h-full object-cover md:rounded-r-lg border-4 border-black" 
                  />
                </div>
              </div>
              
              {/* Profesionales Card with attached image */}
              <div className="flex flex-col md:flex-row w-full">
                <div className="w-full md:w-1/2 order-2 md:order-1">
                  <img 
                    src="https://almango.com.uy/img/img-proveedores.jpg" 
                    alt="Profesionales" 
                    className="w-full h-full object-cover md:rounded-l-lg border-4 border-black" 
                  />
                </div>
                
                <div className="w-full md:w-1/2 bg-white p-8 rounded-r-lg shadow-md h-full order-1 md:order-2 anim-item opacity-0">
                  <h3 className="text-xl font-semibold mb-4 text-primary">FORMAR PARTE PROFESIONALES</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Unite a nuestra red de prestadores de servicios y aumentá tus ingresos. Con Almango, 
                    tendrás acceso a clientes potenciales y oportunidades de negocio constantes. Registrate para formar parte.
                  </p>
                  
                  <div className="mt-8 text-center">
                    <a href="https://almango.com.uy/altas/altaprestador.html" target="_blank" rel="noreferrer" className="inline-block">
                      <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md uppercase font-medium text-lg shadow-lg w-full sm:w-auto break-words">
                        <span className="hidden custom:inline">Pre-Registros de Profesionales</span>
                        <span className="inline custom:hidden">PROFESIONALES</span>
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>;
};
export default Index;
