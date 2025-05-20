
import React from 'react';

const ServiciosStyles: React.FC = () => {
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
      .service-card {
        transition: all 0.3s ease;
      }
      
      .service-card:hover {
        transform: translateY(-5px);
      }
      
      .service-card.highlighted {
        box-shadow: 0 0 0 3px #f06900, 0 8px 20px rgba(240, 105, 0, 0.2);
      }
      
      .servicios-page .card-title {
        line-height: 1.2;
      }
      
      @media (max-width: 640px) {
        .servicios-page {
          padding-top: 1rem;
        }
      }
    `}} />
  );
};

export default ServiciosStyles;
