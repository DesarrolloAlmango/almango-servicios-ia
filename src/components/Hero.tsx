
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 min-h-[70vh] md:min-h-[80vh] flex items-center">
      {/* Stars background */}
      <div className="absolute inset-0 z-0">
        <div className="stars-container absolute inset-0">
          <div className="stars"></div>
          <div className="stars2"></div>
          <div className="stars3"></div>
        </div>
      </div>
      
      <div className="container relative z-10 mx-auto px-6 text-left">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 max-w-xl">
          Servicios Para Tu Hogar y Empresa
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-xl">
          Conectamos a personas y empresas con los mejores profesionales verificados
        </p>
        <Button 
          onClick={() => navigate('/servicios')}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-md uppercase font-medium text-lg shadow-lg flex items-center"
        >
          Solicita Tu Servicio <ArrowRight className="ml-2" size={18} />
        </Button>
      </div>
    </div>
  );
};

export default Hero;
