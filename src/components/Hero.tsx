
import { ArrowRight, UserRound, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import ContactInfo from "@/components/ContactInfo";
import { useEffect, useRef } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const handshakeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Animation for handshake
    const handshake = handshakeRef.current;
    if (handshake) {
      let position = 0;
      let direction = 1;
      const animate = () => {
        if (!handshake) return;
        position += 0.5 * direction;
        
        // Change direction when reaching boundaries
        if (position > 30) direction = -1;
        if (position < 0) direction = 1;
        
        handshake.style.transform = `translateX(${position}px)`;
        requestAnimationFrame(animate);
      };
      
      animate();
    }
  }, []);
  
  return <div className={`relative w-full overflow-hidden ${isMobile ? "min-h-[calc(100vh-40px)]" : "min-h-[100vh] md:min-h-[110vh]"} flex items-start pt-20 md:pt-28`}>
      {/* Hero background with primary colors */}
      <div className="absolute inset-0 z-0 bg-[#14162c]">
        <div className="absolute inset-0 z-1" style={{
          background: "radial-gradient(circle at 20% 30%, #008be1 0%, transparent 40%), radial-gradient(circle at 80% 70%, #ff6900 0%, transparent 40%), radial-gradient(circle at 50% 50%, #0EA5E9 0%, transparent 30%)",
          opacity: 0.8
        }}></div>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#14162c] to-transparent z-2"></div>
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#14162c] to-transparent z-2"></div>
      </div>
      
      {/* Animated handshake image */}
      <div 
        ref={handshakeRef}
        className="absolute left-[25%] sm:left-[15%] md:left-[10%] top-[15%] z-20 animate-bounce"
        style={{
          animation: 'bounce 3s infinite ease-in-out',
          transition: 'transform 0.5s ease-in-out'
        }}
      >
        <div className="relative">
          <svg width="150" height="150" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g>
              <path 
                d="M9 11.5C9 11.5 10 12 12 12C14 12 15 11.5 15 11.5M15 7V11.5M9 7V11.5"
                stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="animate-pulse"
              />
              <path 
                d="M8.4,10.6c0,0-0.9-0.9-1.6-0.9c-0.9,0-2.1,1.2-0.6,2.2c1.1,0.8,2.9-0.1,3.9-0.5" 
                stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="animate-pulse"
              />
              <path 
                d="M15.6,10.6c0,0,0.9-0.9,1.6-0.9c0.9,0,2.1,1.2,0.6,2.2c-1.1,0.8-2.9-0.1-3.9-0.5" 
                stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
                className="animate-pulse"
              />
              <path 
                d="M10.5,12c0,0-2.2,2-3.5,3.1c-0.6,0.5-1.1,1-0.7,1.6c0.3,0.4,0.9,0.2,1.2,0c1-0.8,2.7-2.4,3.7-3.4" 
                stroke="#FF6900" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
              <path 
                d="M13.5,12c0,0,2.2,2,3.5,3.1c0.6,0.5,1.1,1,0.7,1.6c-0.3,0.4-0.9,0.2-1.2,0c-1-0.8-2.7-2.4-3.7-3.4" 
                stroke="#008be1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
              />
            </g>
          </svg>
          <div className="absolute -bottom-8 w-full text-center">
            <span className="text-white font-bold text-sm shadow-lg">CONECTAMOS SOLUCIONES</span>
          </div>
        </div>
      </div>
      
      {/* Contenedor principal con ajustes precisos de margen */}
      <div className="container relative z-10 mx-auto px-6 text-left pl-8 md:pl-12 mt-[66px] sm:mt-[50px] md:mt-[23px]">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-[5px] max-w-xl animate-fade-in font-sans drop-shadow-lg px-0 py-0 my-0 lg:text-4xl">SOLICITÁ TU SERVICIO EN MINUTOS</h1>
        <p className="text-xl text-white mb-2 max-w-xl font-normal animate-fade-in drop-shadow-lg md:text-xl py-[4px]">RÁPIDO. FÁCIL. CON GARANTÍA. SIN VUELTAS. </p>
        <Button onClick={() => navigate('/servicios')} className="bg-primary hover:bg-primary/80 text-white px-4 py-2 rounded-md text-lg shadow-lg flex items-center transition-all hover:scale-105 animate-fade-in my-0 mx-0 py-[23px] px-[21px] font-serif" style={{
        animation: 'buttonGlow 2s infinite ease-in-out'
      }}>
          SOLICITAR SERVICIO <ArrowRight className="ml-2" size={18} />
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
