
import { Button } from "@/components/ui/button";
import ContactInfo from "@/components/ContactInfo";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Activar animaciones después de que el componente se monte
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  const navigateToServices = () => {
    navigate('/servicios');
  };

  return (
    <section 
      id="inicio" 
      className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-gray-800 to-gray-900"
    >
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-cover bg-center" style={{ 
          backgroundImage: "url('/lovable-uploads/c378da4a-a68e-48f2-83b3-10f5a6c9de6f.png')",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(0, 0, 0, 0.4)"
        }} />
      </div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          <h1 
            className={`text-3xl md:text-5xl font-bold text-white mb-3 md:mb-6 uppercase leading-tight transition-all duration-1000 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Profesionales a tu servicio
          </h1>
          
          <p 
            className={`text-xl md:text-2xl font-bold text-gray-200 mb-8 uppercase leading-relaxed transition-all duration-1000 delay-300 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Soluciones para tu hogar o empresa en un solo lugar
          </p>
          
          <Button 
            onClick={navigateToServices}
            className={`bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md uppercase font-medium text-lg shadow-lg transition-all duration-1000 delay-500 transform ${
              isVisible ? 'opacity-100 translate-y-0 hover:scale-105' : 'opacity-0 translate-y-10'
            }`}
          >
            Solicita tu servicio
          </Button>
        </div>
      </div>
      
      <ContactInfo />
      
      {/* Elementos de diseño */}
      <div className="absolute bottom-0 right-0 w-1/3 h-32 bg-primary opacity-10 z-0" />
      <div className="absolute top-1/4 right-10 w-16 h-16 bg-secondary rounded-full opacity-20 z-0" />
    </section>
  );
};

export default Hero;
