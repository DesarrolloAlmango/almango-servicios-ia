import { ArrowRight, UserRound, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ContactInfo from "@/components/ContactInfo";
const Hero = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  return <div className={`relative w-full overflow-hidden ${isMobile ? "min-h-[calc(100vh-40px)]" : "min-h-[100vh] md:min-h-[110vh]"} flex items-start pt-20 md:pt-28`}>
      {/* Hero background image */}
      <div className="absolute inset-0 z-0">
        <img src={isMobile ? "/lovable-uploads/844d8cf9-49eb-4dea-aed8-da206b842f56.png" : "/lovable-uploads/c2ed9c0f-52fe-496a-b472-3ce279dac5df.png"} alt="Profesionales Almango" className="w-full h-full object-cover object-center" style={{
        imageRendering: "auto",
        maxWidth: "none"
      }} />
      </div>
      
      {/* Contenedor principal con ajustes precisos de margen */}
      <div className="container relative z-10 mx-auto px-6 text-left pl-8 md:pl-12 mt-[56px] sm:mt-[40px] md:mt-[33px]">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 max-w-xl animate-fade-in font-sans drop-shadow-lg px-0 py-0 my-0 lg:text-4xl">
          PROFESIONALES A TU SERVICIO
        </h1>
        <p className="text-xl text-white mb-8 max-w-xl font-normal animate-fade-in drop-shadow-lg md:text-xl py-0 my-[14px]">
          SOLUCIONES PARA TU HOGAR O EMPRESA EN UN SOLO LUGAR
        </p>
        <Button onClick={() => navigate('/servicios')} className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-md uppercase font-medium text-lg shadow-lg flex items-center transition-transform hover:scale-105 animate-fade-in">
          Solicita Tu Servicio <ArrowRight className="ml-2" size={18} />
        </Button>
      </div>

      {/* Tiras de Login y Registro */}
      <div className="absolute right-0 md:top-1/4 top-[15%] flex flex-col gap-2 z-20">
        <div className="login-strip animate-bounce-in">
          <a href="https://app.almango.com.uy/wwpbaseobjects.login.aspx" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 cursor-pointer bg-[#008be1] hover:bg-[#0079c4] hover:shadow-lg hover:rotate-[-2deg] text-white py-2 pl-3 pr-3 sm:pr-4 rounded-l-md">
            <UserRound size={20} className="hover:animate-[spin_1s_ease-in-out]" />
            <span className="font-medium hover:animate-pulse hidden sm:inline ml-2">LOGIN</span>
          </a>
        </div>
        
        <div className="register-strip animate-bounce-in" style={{
        animationDelay: '0.3s'
      }}>
          <a href="https://almango.com.uy/altas/" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 cursor-pointer bg-primary hover:bg-primary/80 hover:shadow-lg hover:rotate-[-2deg] text-white py-2 pl-3 pr-3 sm:pr-4 rounded-l-md">
            <UserRoundPlus size={20} className="hover:scale-125 transition-transform" />
            <span className="font-medium hover:animate-pulse hidden sm:inline ml-2">REGISTRO</span>
          </a>
        </div>
      </div>

      <ContactInfo />
    </div>;
};
export default Hero;