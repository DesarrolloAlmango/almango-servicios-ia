import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const Index = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        <section id="servicios" className="py-20 px-4 relative">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-secondary uppercase">Nuestros Servicios</h2>
            
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-gray-600">
                Ofrecemos una amplia gama de servicios profesionales para satisfacer todas tus necesidades.
                Haz clic en el botón "Solicita tu servicio" para explorar todas nuestras opciones.
              </p>
            </div>
          </div>
        </section>
        
        <section id="quienes-somos" className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-secondary uppercase">¿Quiénes Somos?</h2>
            <div className="max-w-3xl mx-auto text-center">
              {/* Content will be provided later */}
            </div>
          </div>
        </section>
        
        <section id="formar-parte" className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-secondary uppercase">Formar Parte</h2>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
              {/* Content will be provided later */}
            </div>
          </div>
        </section>
        
        <section id="contacto" className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center text-secondary uppercase">Contacto</h2>
            <div className="max-w-3xl mx-auto">
              {/* Content will be provided later */}
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
