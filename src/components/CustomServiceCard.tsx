
import ServiceCard from './ServiceCard';
import { LucideIcon } from 'lucide-react';
import React from 'react';

interface CustomServiceCardProps {
  id?: string;
  name: string;
  icon?: string;
  iconComponent: LucideIcon;
  addToCart: (item: any) => void;
  externalUrl?: string;
  onCategorySelect: (serviceId: string, categoryId: string, categoryName: string) => void;
  purchaseLocation: any;
  forceOpen?: boolean;
  circular?: boolean;
  currentCartItems: any[]; // Removed the optional marker (?)
  customId?: string;
}

const CustomServiceCard: React.FC<CustomServiceCardProps> = ({ customId, ...props }) => {
  // Añadimos un controlador de eventos específico para facilitar la depuración
  const handleServiceCardClick = (e: React.MouseEvent) => {
    console.log(`Service card clicked: ${props.name} (ID: ${props.id})`);
    // El evento click se propagará al ServiceCard interno
  };

  return (
    <div 
      id={customId || `custom-service-${props.id}`} 
      className="service-card-wrapper cursor-pointer"
      data-service-id={props.id}
      data-service-name={props.name}
      onClick={handleServiceCardClick}
    >
      <ServiceCard {...props} />
    </div>
  );
};

export default CustomServiceCard;
