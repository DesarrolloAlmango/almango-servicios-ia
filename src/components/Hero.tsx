
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden bg-gray-950 min-h-[100vh] md:min-h-[110vh] flex items-center">
      {/* Stars background */}
      <div className="absolute inset-0 z-0">
        <div className="stars-container absolute inset-0">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
      </div>
      
      <div className="container relative z-10 mx-auto px-6 text-left pl-8 md:pl-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4 max-w-xl animate-fade-in">
          PROFESIONALES A TU SERVICIO
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-xl font-normal animate-fade-in">
          SOLUCIONES PARA TU HOGAR O EMPRESA EN UN SOLO LUGAR
        </p>
        <Button 
          onClick={() => navigate('/servicios')}
          className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-md uppercase font-medium text-lg shadow-lg flex items-center transition-transform hover:scale-105 animate-fade-in"
        >
          Solicita Tu Servicio <ArrowRight className="ml-2" size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Hero;
