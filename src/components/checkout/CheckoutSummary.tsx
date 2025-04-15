
import React from 'react';
import { CheckoutData } from '@/types/checkoutTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CheckoutSummaryProps {
  isOpen: boolean;
  onClose: () => void;
  data: CheckoutData[];
}

const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({ isOpen, onClose, data }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Resumen de la Compra</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {data.map((serviceData, index) => (
            <div key={index} className="border rounded-lg p-4">
              <pre className="whitespace-pre-wrap overflow-x-auto text-xs">
                {JSON.stringify(serviceData, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutSummary;
