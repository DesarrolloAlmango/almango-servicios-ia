
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ServicesShowcase from "@/components/ServicesShowcase";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { Button } from "@/components/ui/button";

const Index = () => {
  return <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow" id="inicio">
        <Hero />
        
        <ServicesShowcase />
        
        <section id="servicios" className="py-20 px-4 relative bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-secondary uppercase">Nuestros Servicios</h2>
            
            <div className="max-w-3xl mx-auto mt-8">
              <h3 className="text-xl font-semibold mb-4 text-primary">Hogares</h3>
              <p className="text-lg text-gray-600 mb-8">
                Descubrí una amplia red de profesionales listos para ayudarte. En Almango, podés contratar servicios de reparación, instalación, reformas y una variedad de oficios para tu hogar. Disfrutá de precios estandarizados, garantía de instalación de 12 meses, profesionales calificados y más beneficios.
              </p>
              
              <h3 className="text-xl font-semibold mb-4 text-primary">Empresas</h3>
              <p className="text-lg text-gray-600 mb-8">
                A través de Almango podés acceder a servicios de logística, montaje, instalaciones, mantenimiento y mucho más, todo adaptado a las necesidades de tu empresa. Simplificá la gestión de proyectos y garantizá la eficiencia operativa.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-orange-50">
                  <div className="text-primary text-4xl mb-4">01</div>
                  <h3 className="text-xl font-semibold mb-2">Servicio Profesional</h3>
                  <p className="text-gray-600">Contamos con profesionales calificados para cada tipo de servicio que ofrecemos.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-orange-50">
                  <div className="text-primary text-4xl mb-4">02</div>
                  <h3 className="text-xl font-semibold mb-2">Atención Personalizada</h3>
                  <p className="text-gray-600">Nos adaptamos a tus necesidades específicas para brindarte la mejor solución.</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:bg-orange-50">
                  <div className="text-primary text-4xl mb-4">03</div>
                  <h3 className="text-xl font-semibold mb-2">Garantía de Calidad</h3>
                  <p className="text-gray-600">Todos nuestros servicios cuentan con garantía para tu tranquilidad.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
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
        
        <section id="formar-parte" className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-secondary uppercase">Formar Parte</h2>
            
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
