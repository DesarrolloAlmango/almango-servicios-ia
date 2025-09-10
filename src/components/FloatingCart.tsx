import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CartItem } from '@/pages/Servicios';

interface FloatingCartProps {
  cartItems: CartItem[];
  onCartClick: () => void;
  isVisible: boolean;
}

const FloatingCart: React.FC<FloatingCartProps> = ({
  cartItems,
  onCartClick,
  isVisible
}) => {
  const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);

  if (!isVisible || totalItems === 0) {
    return null;
  }

  return (
    <Button
      onClick={onCartClick}
      className="fixed top-4 right-16 w-12 h-12 rounded-full bg-primary/90 backdrop-blur-sm text-white hover:bg-primary border-2 border-white/20 shadow-lg transition-all duration-300 hover:scale-110 z-[9999] flex items-center justify-center"
      size="icon"
      aria-label={`Ver carrito con ${totalItems} productos`}
    >
      <div className="relative">
        <ShoppingCart size={20} />
        {totalItems > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-semibold">
            {totalItems > 99 ? '99+' : totalItems}
          </span>
        )}
      </div>
    </Button>
  );
};

export default FloatingCart;