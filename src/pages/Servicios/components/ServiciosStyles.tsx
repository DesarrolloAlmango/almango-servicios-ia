
import React from "react";

const ServiciosStyles: React.FC = () => {
  return (
    <style>{`
      /* Add custom styling for section titles */
      .servicios-page h2 {
        position: relative;
        z-index: 10;
        font-size: 1.75rem;
        font-weight: 600;
      }
      
      /* Style for ARMADO E INSTALACIÓN title */
      #armado-instalacion h2 {
        color: #333333;
      }
      
      /* Style for FLETES Y MUDANZAS title - on orange background */
      #armado-instalacion + div + div h2 {
        color: white;
        font-weight: 600;
      }

      @media (min-width: 640px) and (max-width: 1023px) {
        .grid-cols-2 > div:nth-child(odd):last-child {
          grid-column: 1 / span 2;
          justify-self: center;
        }
      }
      
      @media (min-width: 1024px) {
        .grid-cols-3 > div:nth-last-child(1):nth-child(3n-1),
        .grid-cols-3 > div:nth-last-child(2):nth-child(3n-1) {
          margin-left: calc(100% / 3);
        }
        
        .grid-cols-3 > div:nth-last-child(1):nth-child(3n-2) {
          margin-left: calc(100% / 3);
        }
      }
    `}</style>
  );
};

export default ServiciosStyles;
