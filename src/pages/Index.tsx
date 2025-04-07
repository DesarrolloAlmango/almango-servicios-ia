
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import ContactInfo from "@/components/ContactInfo";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        
        {/* Placeholder sections for future implementation */}
        <section id="servicios" className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">NUESTROS SERVICIOS</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Placeholder for service cards */}
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                  <div className="h-16 w-16 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <div className="w-8 h-8 bg-primary rounded-md"></div>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Servicio {i}</h3>
                  <p className="text-gray-600">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit, vulputate eu pharetra nec.
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        <section id="quienes-somos" className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">¿QUIÉNES SOMOS?</h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-gray-700 mb-6">
                En ALMANGO, somos un equipo de profesionales dedicados a brindar soluciones integrales para tu hogar o empresa.
              </p>
              <p className="text-lg text-gray-700">
                Nuestro compromiso es ofrecer servicios de alta calidad, con personal calificado y precios competitivos.
              </p>
            </div>
          </div>
        </section>
        
        <section id="formar-parte" className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">FORMAR PARTE</h2>
            <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
              <p className="text-lg text-gray-700 mb-6 text-center">
                ¿Eres un profesional y deseas formar parte de nuestro equipo?
              </p>
              <div className="flex justify-center">
                <button className="bg-secondary hover:bg-secondary/90 text-white px-6 py-3 rounded-md uppercase font-medium transition-transform hover:scale-105">
                  Únete a nosotros
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      <WhatsAppButton />
      <ContactInfo />
    </div>
  );
};

export default Index;
