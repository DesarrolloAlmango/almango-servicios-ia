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
  return <div className={`relative w-full overflow-hidden ${isMobile ? "min-h-[calc(100vh-40px)]" : "min-h-[75vh] md:min-h-[82vh]"} flex items-start pt-10 md:pt-14`}>
      {/* Hero background */}
      <div className="absolute inset-0 z-0 bg-[#498bdd]">
        <div className="absolute inset-0 z-1" style={{
        background: "radial-gradient(circle at 20% 30%, #0066cc 0%, transparent 40%), radial-gradient(circle at 80% 70%, #3a7bd5 0%, transparent 40%), radial-gradient(circle at 50% 50%, #00d2ff 0%, transparent 30%)",
        opacity: 0.6
      }}></div>
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#498bdd] to-transparent z-2"></div>
      </div>
      
      {/* Imagen ajustada a bordes superior y derecho */}
      <div className="absolute inset-0 z-1 overflow-hidden">
        {isMobile ? <div className="absolute right-0 top-0 h-full w-full">
            <img src="/lovable-uploads/61c4eb76-3dac-472b-ad75-4c5029d686f7.png" alt="Apretón de manos profesional" className="animate-fade-in h-full w-auto object-cover object-right" style={{
          opacity: 0.8,
          maxWidth: 'none',
          position: 'absolute',
          right: '-140%',
          // Modificado a 60% más a la derecha
          top: 0,
          height: '100%',
          width: 'auto',
          minHeight: '100%'
        }} />
          </div> : <div className="absolute right-0 top-0 h-full w-auto">
            <img src="/lovable-uploads/61c4eb76-3dac-472b-ad75-4c5029d686f7.png" alt="Apretón de manos profesional" className="animate-fade-in h-full w-auto object-contain" style={{
          opacity: 0.8,
          maxWidth: 'none'
        }} />
          </div>}
      </div>
      
      {/* Contenido principal */}
      <div className="container relative z-10 mx-auto px-6 text-left pl-8 md:pl-12 mt-[100px] sm:mt-[90px] md:mt-[80px]">
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-[5px] max-w-xl animate-fade-in font-sans drop-shadow-lg px-0 py-0 my-0 lg:text-5xl tracking-tight">
          SOLICITÁ TU SERVICIO EN MINUTOS
        </h1>
        <p className="text-2xl sm:text-xl text-white mb-2 max-w-xl font-normal animate-fade-in drop-shadow-lg md:text-xl py-[4px] font-serif">RÁPIDO, FÁCIL, SEGURO, SIN VUELTAS.</p>
        <Button onClick={() => navigate('/servicios')} className="bg-primary hover:bg-primary/80 text-white px-6 py-3 rounded-md text-xl shadow-lg flex items-center transition-all hover:scale-105 animate-fade-in my-0 mx-0 sm:py-[20px] sm:px-[21px] font-serif" style={{
        animation: 'buttonGlow 2s infinite ease-in-out'
      }}>
          SOLICITAR SERVICIO <ArrowRight className="ml-2" size={20} />
        </Button>
      </div>

      <ContactInfo />
    </div>;
};
export default Hero;