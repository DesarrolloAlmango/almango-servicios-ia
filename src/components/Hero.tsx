
import { Button } from "@/components/ui/button";
import ContactInfo from "@/components/ContactInfo";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  const navigateToServices = () => {
    navigate('/servicios');
  };

  return (
    <section 
      id="inicio" 
      className="relative min-h-screen flex items-center pt-16 bg-gradient-to-br from-gray-50 to-gray-100"
    >
      <div className="absolute inset-0 z-0">
        <div className="w-full h-full bg-cover bg-center" style={{ 
          backgroundImage: "url('/lovable-uploads/58049e03-1df2-4982-9d08-287691c94caa.png')",
          backgroundBlendMode: "overlay",
          backgroundColor: "rgba(255, 255, 255, 0.85)"
        }} />
      </div>
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-3xl">
          <h1 className="text-3xl md:text-5xl font-bold text-secondary mb-3 md:mb-6 uppercase leading-tight">
            Profesionales a tu servicio
          </h1>
          
          <p className="text-xl md:text-2xl font-bold text-gray-700 mb-8 uppercase leading-relaxed">
            Soluciones para tu hogar o empresa en un solo lugar
          </p>
          
          <Button 
            onClick={navigateToServices}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md uppercase font-medium text-lg shadow-lg transition-transform hover:scale-105"
          >
            Solicita tu servicio
          </Button>
        </div>
      </div>
      
      <ContactInfo />
      
      {/* Add design elements */}
      <div className="absolute bottom-0 right-0 w-1/3 h-32 bg-primary opacity-10 z-0" />
      <div className="absolute top-1/4 right-10 w-16 h-16 bg-secondary rounded-full opacity-20 z-0" />
    </section>
  );
};

export default Hero;
