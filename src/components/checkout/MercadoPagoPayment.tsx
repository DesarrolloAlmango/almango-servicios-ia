
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface MercadoPagoPaymentProps {
  onPaymentClick: () => void;
  isProcessing?: boolean;
}

const MercadoPagoPayment = ({ onPaymentClick, isProcessing = false }: MercadoPagoPaymentProps) => {
  return (
    <div className="flex flex-col items-center gap-2">
      <img 
        src="/lovable-uploads/3ce91ecb-3dd1-4068-90d7-049af06355d8.png"
        alt="Mercado Pago"
        className="h-36 w-auto"
      />
      <button 
        onClick={onPaymentClick}
        className="text-[#009ee3] hover:text-[#008ed0] underline text-sm font-medium py-2 px-4 rounded-md transition-colors"
      >
        IR A PAGAR
        {isProcessing && (
          <span className="ml-2 inline-flex">
            <Loader2 className="h-4 w-4 animate-spin" />
          </span>
        )}
      </button>
    </div>
  );
};

export default MercadoPagoPayment;
