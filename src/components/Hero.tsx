
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
      className="relative min-h-screen flex items-center pt-16"
    >
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-cover bg-center" style={{ 
          backgroundImage: "linear-gradient(to bottom, rgba(0,0,0,0.8), rgba(20,27,46,0.9)), url('/lovable-uploads/aab5a4c1-bbe2-4be4-ac76-41eeb5f246fd.png')",
          backgroundSize: "cover"
        }} />
        {/* Efecto estrellado */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAwIiBoZWlnaHQ9IjQwMDAiPgo8ZmlsdGVyIGlkPSJub2lzZSIgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSI+CjxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIwLjc1IiBzdGl0Y2hUaWxlcz0ic3RpdGNoIiAvPgo8L2ZpbHRlcj4KPHJlY3Qgd2lkdGg9IjQwMDAiIGhlaWdodD0iNDAwMCIgZmlsdGVyPSJ1cmwoI25vaXNlKSIgb3BhY2l0eT0iMC4wNSIvPgo8L3N2Zz4=')] opacity-30"></div>
      </div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="flex flex-col items-start max-w-3xl mx-auto text-left">
          <h1 
            className={`text-4xl md:text-6xl font-bold text-[#ff6900] mb-3 md:mb-6 uppercase leading-tight font-display transition-all duration-1000 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Profesionales a tu servicio
          </h1>
          
          <p 
            className={`text-xl md:text-3xl font-bold text-white mb-8 uppercase leading-relaxed transition-all duration-1000 delay-300 transform ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            Soluciones para tu hogar o empresa en un solo lugar
          </p>
          
          <Button 
            onClick={navigateToServices}
            className={`bg-primary hover:bg-primary/90 text-white px-6 py-5 rounded-md uppercase font-medium text-lg shadow-lg transition-all duration-1000 delay-500 transform ${
              isVisible ? 'opacity-100 translate-y-0 hover:scale-105' : 'opacity-0 translate-y-10'
            } font-display`}
          >
            Solicita tu servicio
          </Button>
        </div>
      </div>
      
      <ContactInfo />
      
      {/* Elementos de diseño para efecto nocturno */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/40 to-transparent z-0" />
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/30 to-transparent z-0" />
      
      {/* Estrellas brillantes */}
      <div className="stars absolute inset-0 z-0">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="star absolute rounded-full bg-white"
            style={{
              width: `${Math.random() * 2 + 1}px`,
              height: `${Math.random() * 2 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animation: `pulse ${Math.random() * 3 + 2}s infinite alternate`
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default Hero;
