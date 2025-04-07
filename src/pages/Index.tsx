
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import { ArrowLeft, ShoppingCart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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
            {/* Navigation controls */}
            <div className="flex justify-between items-center mb-8">
              <Button 
                variant="ghost" 
                onClick={() => scrollToSection('inicio')}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={20} />
                <span>Volver</span>
              </Button>
              
              <Button variant="ghost" className="relative">
                <ShoppingCart size={20} />
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">0</span>
              </Button>
            </div>
            
            <h2 className="text-3xl font-bold mb-12 text-center text-secondary uppercase">Nuestros Servicios</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Service cards */}
              {['Electricidad', 'Plomería', 'Albañilería', 'Carpintería', 'Pintura', 'Jardinería'].map((service, i) => (
                <Card 
                  key={i} 
                  className="rounded-lg shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 group"
                >
                  <CardContent className="p-6 flex flex-col items-center group-hover:bg-primary/5">
                    <h3 className="text-xl font-bold mb-4 uppercase">{service}</h3>
                    <div className="h-16 w-16 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                      <div className="w-8 h-8 bg-primary/80 rounded-md"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
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
