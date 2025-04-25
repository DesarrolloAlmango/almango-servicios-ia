
import { Button } from "@/components/ui/button";

interface MercadoPagoPaymentProps {
  onPaymentClick: () => void;
}

const MercadoPagoPayment = ({ onPaymentClick }: MercadoPagoPaymentProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <img 
        src="/lovable-uploads/3ce91ecb-3dd1-4068-90d7-049af06355d8.png"
        alt="Mercado Pago"
        className="h-36 w-auto"
      />
      <button 
        onClick={onPaymentClick}
        className="text-[#009ee3] hover:text-[#008ed0] underline text-sm font-medium"
      >
        Iniciar pago
      </button>
    </div>
  );
};

export default MercadoPagoPayment;
