
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        <section id="servicios" className="py-20 px-4 relative bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center text-secondary uppercase font-display">Nuestros Servicios</h2>
            
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-gray-600 mb-8">
                Ofrecemos una amplia gama de servicios profesionales para satisfacer todas tus necesidades.
                Haz clic en el botón "Solicita tu servicio" para explorar todas nuestras opciones.
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
        
        <section id="quienes-somos" className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-secondary uppercase font-display">¿Quiénes Somos?</h2>
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2">
                  <img 
                    src="/lovable-uploads/10976e12-6bf7-48d0-b947-61ef37b1289b.png" 
                    alt="ALMANGO logo" 
                    className="w-full max-w-md mx-auto"
                  />
                </div>
                <div className="md:w-1/2 text-left">
                  <p className="text-lg text-gray-600 mb-6">
                    En ALMANGO, nos dedicamos a ofrecer soluciones profesionales para tu hogar o empresa. 
                    Nuestro equipo está formado por expertos en diversas áreas, comprometidos a brindar un 
                    servicio de calidad que supere tus expectativas.
                  </p>
                  <p className="text-lg text-gray-600">
                    Desde 2020, hemos crecido gracias a la confianza de nuestros clientes y a nuestro 
                    compromiso con la excelencia en cada trabajo que realizamos.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="formar-parte" className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-secondary uppercase font-display">Formar Parte</h2>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <p className="text-lg text-gray-600 mb-6 text-center">
                ¿Eres un profesional y quieres formar parte de nuestro equipo? 
                Completa el formulario y nos pondremos en contacto contigo.
              </p>
              
              <div className="mt-8 text-center">
                <Button 
                  className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md uppercase font-medium text-lg shadow-lg"
                >
                  Postularme
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

import { Button } from "@/components/ui/button";
export default Index;
