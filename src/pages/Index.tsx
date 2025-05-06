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
const Index = () => {
  return <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow" id="inicio">
        <Hero />
        
        <Separator className="h-1 bg-black" />
        <ServicesShowcase />
        <Separator className="h-1 bg-black" />
        
        {/* Partners Section */}
        <section className="bg-[#F0F0F0] py-8">
          <div className="bg-[#F97316] py-6 mb-8 -mt-8">
            <h2 className="font-bold text-center text-white uppercase text-2xl">
              ALGUNOS DE NUESTROS CLIENTES Y ALIANZAS COMERCIALES
            </h2>
          </div>
          
          <div className="container mx-auto px-4">
            <div className="mb-6">
              <LogoCarousel logos={firstHalfLogos} direction="rtl" speed="super-fast" />
            </div>
            <div>
              <LogoCarousel logos={secondHalfLogos} direction="ltr" speed="super-fast" />
            </div>
          </div>
        </section>
        <Separator className="h-1 bg-black" />
        
        <section id="como-contratar" className="py-20 px-4 bg-primary text-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-4 text-center uppercase">¿CÓMO CONTRATAR?</h2>
            <h3 className="text-xl font-medium mb-12 text-center">PROCESO DE CONTRATACIÓN</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-6xl mx-auto">
              <div className="text-center flex flex-col items-center">
                <div className="mb-4">
                  <img src="https://almango.com.uy/img/agenda-almango.svg" alt="Agenda" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Agendá fecha y hora</h4>
                <p className="text-white/90">Coordinación inmediata.</p>
              </div>
              
              <div className="text-center flex flex-col items-center">
                <div className="mb-4">
                  <img src="https://almango.com.uy/img/pago-almango.svg" alt="Recibir técnico" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Recibí al técnico</h4>
                <p className="text-white/90">Un profesional calificado realizará el trabajo.</p>
              </div>
              
              <div className="text-center flex flex-col items-center">
                <div className="mb-4">
                  <img src="https://almango.com.uy/img/pago-almango.svg" alt="Pago" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Realizá el pago al finalizar</h4>
                <p className="text-white/90">Seleccioná el medio que más te convenga.</p>
              </div>
              
              <div className="text-center flex flex-col items-center">
                <div className="mb-4">
                  <img src="https://almango.com.uy/img/valora-almango.svg" alt="Valoración" className="h-16 w-16 mx-auto" />
                </div>
                <h4 className="text-lg font-semibold mb-2">Ayudanos a mejorar</h4>
                <p className="text-white/90">Calificá el servicio, tus comentarios importan.</p>
              </div>
            </div>
          </div>
        </section>
        <Separator className="h-1 bg-black" />
        
        <section id="quienes-somos" className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-secondary uppercase">¿Quiénes Somos?</h2>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-w-md mx-auto mb-4">
                  
                </div>
                <div className="w-full max-w-3xl">
                  <h3 className="text-xl font-semibold mb-3 text-primary">ACERCA DE NOSOTROS</h3>
                  <p className="text-lg text-gray-600 mb-6">
                    Somos una empresa tecnológica que brinda soluciones en la contratación de servicios y oficios, 
                    conectando a personas y empresas con proveedores de servicio previamente validados.
                  </p>
                  <p className="text-lg text-gray-600 mb-6">
                    Aportamos valor agregado en el proceso de contratación de proveedores de servicios, 
                    brindando garantía, cobertura ante daños, pago online, atención personalizada y mucho más.
                  </p>
                  <p className="text-lg text-gray-600">
                    Generamos nuevas oportunidades de negocio para comercios y proveedores de servicio a través de un modelo innovador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <Separator className="h-1 bg-black" />
        
        <section id="formar-parte" className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-secondary uppercase">¿SOS EMPRESA O COMERCIO? CONOCÉ LOS BENEFICIOS.</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4 text-primary">FORMAR PARTE COMERCIOS</h3>
                <p className="text-lg text-gray-600 mb-6">
                  Incrementá tus ingresos al ser parte de nuestra red de socios. Generando solicitudes de 
                  servicio en nuestra plataforma, obtendrás atractivas comisiones. Registrate para más información.
                </p>
                
                <div className="mt-8 text-center">
                  <a href="https://almango.com.uy/altas/altacomercio.html" target="_blank" rel="noreferrer" className="inline-block">
                    <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md uppercase font-medium text-lg shadow-lg w-full sm:w-auto break-words">
                      <span className="hidden custom:inline">Pre-Registros de Comercios</span>
                      <span className="inline custom:hidden">COMERCIOS</span>
                    </Button>
                  </a>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
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
        </section>
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>;
};
export default Index;