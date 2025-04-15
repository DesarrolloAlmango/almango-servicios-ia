
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
        <div className="space-y-6">
          {data.map((serviceData, index) => (
            <div key={index} className="border rounded-lg p-4">
              <h3 className="font-medium mb-2">Servicio {index + 1}</h3>
              <div className="bg-slate-50 p-4 rounded-md">
                <pre className="whitespace-pre-wrap overflow-x-auto text-sm font-mono">
                  {JSON.stringify(serviceData, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutSummary;
