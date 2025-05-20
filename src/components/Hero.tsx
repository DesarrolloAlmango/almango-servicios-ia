
import { ArrowRight, UserRound, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ContactInfo from "@/components/ContactInfo";
import { useEffect, useState } from "react";
import LottieAnimation from "./LottieAnimation";

const Hero = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    // Set loaded state after initial render
    setIsLoaded(true);
  }, []);
  
  return <div className={`relative w-full overflow-hidden ${isMobile ? "min-h-[calc(75vh-40px)]" : "min-h-[75vh] md:min-h-[82vh]"} flex items-start pt-16 md:pt-20`}>
      {/* Hero background with primary colors */}
      <div className="absolute inset-0 z-0 bg-[#14162c]">
        <div className="absolute inset-0 z-1" style={{
        background: "radial-gradient(circle at 20% 30%, #008be1 0%, transparent 40%), radial-gradient(circle at 80% 70%, #ff6900 0%, transparent 40%), radial-gradient(circle at 50% 50%, #0EA5E9 0%, transparent 30%)",
        opacity: 0.8
      }}></div>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#14162c] to-transparent z-2"></div>
      </div>
      
      {/* Contenedor principal con ajuste de margen para bajar el texto */}
      <div className="container relative z-10 mx-auto px-6 text-left pl-8 md:pl-12 mt-[100px] sm:mt-[90px] md:mt-[80px]">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-[5px] max-w-xl animate-fade-in font-sans drop-shadow-lg px-0 py-0 my-0 lg:text-5xl tracking-tight">
          SOLICITÁ TU SERVICIO EN MINUTOS
        </h1>
        <p className="text-xl text-white mb-2 max-w-xl font-normal animate-fade-in drop-shadow-lg md:text-xl py-[4px] font-serif">
          RÁPIDO. FÁCIL. SEGURO. SIN VUELTAS.
        </p>
        <Button onClick={() => navigate('/servicios')} className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-md text-lg shadow-lg flex items-center transition-all hover:scale-105 animate-fade-in my-0 mx-0 py-[20px] px-[21px] font-serif" style={{
        animation: 'buttonGlow 2s infinite ease-in-out'
      }}>
          SOLICITAR SERVICIO <ArrowRight className="ml-2" size={18} />
        </Button>
      </div>

      {/* Tiras de Login y Registro posicionadas en el centro vertical */}
      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col gap-2 z-20">
        <div className="login-strip animate-bounce-in">
          <a href="https://app.almango.com.uy/wwpbaseobjects.login.aspx" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 cursor-pointer bg-[#008be1] hover:bg-[#0079c4] hover:shadow-lg hover:rotate-[-2deg] text-white py-2 pl-3 pr-3 sm:pr-4 rounded-l-md font-display font-bold tracking-wider hover:tracking-widest">
            <UserRound size={20} className="hover:animate-[spin_1s_ease-in-out]" />
            <span className="font-bold hover:animate-pulse hidden sm:inline ml-2 text-shadow">LOGIN</span>
          </a>
        </div>
        
        <div className="register-strip animate-bounce-in" style={{
        animationDelay: '0.3s'
      }}>
          <a href="https://almango.com.uy/altas/" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 cursor-pointer bg-primary hover:bg-primary/80 hover:shadow-lg hover:rotate-[-2deg] text-white py-2 pl-3 pr-3 sm:pr-4 rounded-l-md font-display font-bold tracking-wider hover:tracking-widest">
            <UserRoundPlus size={20} className="hover:scale-125 transition-transform" />
            <span className="font-bold hover:animate-pulse hidden sm:inline ml-2 text-shadow">REGISTRO</span>
          </a>
        </div>
      </div>

      <ContactInfo />
    </div>;
};

export default Hero;
