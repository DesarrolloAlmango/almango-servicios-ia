
import React from 'react';

interface MercadoPagoIconProps {
  className?: string;
}

const MercadoPagoIcon: React.FC<MercadoPagoIconProps> = ({ className }) => {
  return (
    <img 
      src="/lovable-uploads/3ce91ecb-3dd1-4068-90d7-049af06355d8.png" 
      alt="Mercado Pago"
      className={`object-contain ${className}`}
    />
  );
};

export default MercadoPagoIcon;
