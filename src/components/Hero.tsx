
import { ArrowRight, UserRound, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ContactInfo from "@/components/ContactInfo";

const Hero = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <div className={`relative w-full overflow-hidden ${isMobile ? "min-h-[calc(100vh-40px)]" : "min-h-[100vh] md:min-h-[110vh]"} flex items-center`}>
      {/* Hero background image with responsive support */}
      <div className="absolute inset-0 z-0">
        <img 
          src={isMobile ? "/lovable-uploads/844d8cf9-49eb-4dea-aed8-da206b842f56.png" : "/lovable-uploads/c2ed9c0f-52fe-496a-b472-3ce279dac5df.png"}
          alt="Profesionales Almango" 
          className="w-full h-full object-cover object-center"
          style={{ 
            imageRendering: "auto",
            maxWidth: "none",
          }}
        />
      </div>
      
      {/* Removed the blue overlay div that was affecting image visibility */}
      
      <div className="container relative z-10 mx-auto px-6 text-left pl-8 md:pl-12">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 max-w-xl animate-fade-in font-sans drop-shadow-lg">
          PROFESIONALES A TU SERVICIO
        </h1>
        <p className="text-xl md:text-2xl text-white mb-8 max-w-xl font-normal animate-fade-in drop-shadow-lg">
          SOLUCIONES PARA TU HOGAR O EMPRESA EN UN SOLO LUGAR
        </p>
        <Button onClick={() => navigate('/servicios')} className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-md uppercase font-medium text-lg shadow-lg flex items-center transition-transform hover:scale-105 animate-fade-in">
          Solicita Tu Servicio <ArrowRight className="ml-2" size={18} />
        </Button>
      </div>

      {/* Login and Register strips */}
      <div className="absolute right-0 md:top-1/4 top-[15%] flex flex-col gap-2 z-20">
        {/* Login strip with completely isolated hover effects */}
        <div className="login-strip animate-bounce-in">
          <a href="https://app.almango.com.uy/wwpbaseobjects.login.aspx" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 cursor-pointer bg-[#008be1] hover:bg-[#0079c4] hover:shadow-lg hover:rotate-[-2deg] text-white py-2 pl-3 pr-4 rounded-l-md">
            <div className="icon-container mr-2">
              <UserRound size={20} className="hover:animate-[spin_1s_ease-in-out]" />
            </div>
            <span className="font-medium hover:animate-pulse">LOGIN</span>
          </a>
        </div>
        
        {/* Register strip with completely isolated hover effects */}
        <div className="register-strip animate-bounce-in" style={{
        animationDelay: '0.3s'
      }}>
          <a href="https://almango.com.uy/altas/" target="_blank" rel="noopener noreferrer" className="flex items-center transition-all duration-300 cursor-pointer bg-primary hover:bg-primary/80 hover:shadow-lg hover:rotate-[-2deg] text-white py-2 pl-3 pr-4 rounded-l-md">
            <div className="icon-container mr-2">
              <UserRoundPlus size={20} className="hover:scale-125 transition-transform" />
            </div>
            <span className="font-medium hover:animate-pulse">REGISTRO</span>
          </a>
        </div>
      </div>

      <ContactInfo />
    </div>
  );
};

export default Hero;
