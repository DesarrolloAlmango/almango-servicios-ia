
import { Button } from "@/components/ui/button";

interface MercadoPagoPaymentProps {
  onPaymentClick: () => void;
}

const MercadoPagoPayment = ({ onPaymentClick }: MercadoPagoPaymentProps) => {
  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <img 
        src="/lovable-uploads/3ce91ecb-3dd1-4068-90d7-049af06355d8.png"
        alt="Mercado Pago"
        className="h-12 w-auto"
      />
      <Button 
        onClick={onPaymentClick}
        className="bg-[#009ee3] hover:bg-[#008ed0] text-white font-medium px-6"
      >
        Pagar con Mercado Pago
      </Button>
    </div>
  );
};

export default MercadoPagoPayment;
