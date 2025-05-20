
import React from "react";
import { useIsMobile } from "@/hooks/use-mobile";

const ServiciosBackground: React.FC = () => {
  const isMobile = useIsMobile();
  
  return (
    <div className="absolute inset-0 z-0">
      {/* Top half - natural grayish color - smaller for mobile */}
      <div className={`absolute inset-x-0 top-0 ${isMobile ? 'h-[67%]' : 'h-[53%]'} bg-[#F8F4F0]`}></div>
      {/* Bottom half - orange color - starts lower for mobile */}
      <div className={`absolute inset-x-0 bottom-0 ${isMobile ? 'h-[33%]' : 'h-[47%]'} bg-[#f06900]`}></div>
    </div>
  );
};

export default ServiciosBackground;
