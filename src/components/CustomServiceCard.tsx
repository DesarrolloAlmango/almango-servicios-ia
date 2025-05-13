
import ServiceCard from './ServiceCard';
import { LucideIcon } from 'lucide-react';

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
  return (
    <div id={customId || `custom-service-${props.id}`}>
      <ServiceCard {...props} />
    </div>
  );
};

export default CustomServiceCard;
