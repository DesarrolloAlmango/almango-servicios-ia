
import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, X } from "lucide-react";
import { toast } from "sonner";

interface Store {
  id: string;
  name: string;
}

interface PurchaseLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (storeId: string, storeName: string, otherLocation?: string) => void;
  stores?: Store[];
}

const PurchaseLocationModal: React.FC<PurchaseLocationModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  stores = []
}) => {
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [otherStore, setOtherStore] = useState<string>("");
  const [showOtherInput, setShowOtherInput] = useState(false);

  // Default stores if API fails or none are provided
  const defaultStores: Store[] = [
    { id: "other", name: "Otro" },
    { id: "unknown", name: "No lo sé" },
    { id: "store1", name: "Tienda ALMANGO" },
    { id: "store2", name: "Comercio Afiliado 1" },
    { id: "store3", name: "Comercio Afiliado 2" }
  ];

  const displayedStores = stores.length > 0 ? stores : defaultStores;

  const handleStoreChange = (value: string) => {
    setSelectedStore(value);
    if (value === "other") {
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
      setOtherStore("");
    }
  };

  const handleConfirm = () => {
    if (!selectedStore) {
      toast.error("Por favor selecciona un lugar de compra");
      return;
    }

    if (selectedStore === "other" && !otherStore.trim()) {
      toast.error("Por favor ingresa el nombre del comercio");
      return;
    }

    const storeName = displayedStores.find(store => store.id === selectedStore)?.name || "";
    onSelectLocation(
      selectedStore, 
      storeName, 
      selectedStore === "other" ? otherStore : undefined
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center mb-6">
          <MapPin className="h-12 w-12 mx-auto text-orange-500 mb-2" />
          <h3 className="text-xl font-semibold">¿Dónde realizaste la compra?</h3>
          <p className="text-muted-foreground text-sm">
            Necesitamos esta información para brindarte un mejor servicio
          </p>
        </div>

        <div className="space-y-4 mb-4">
          <div className="space-y-2">
            <label htmlFor="store" className="block text-sm font-medium">
              Lugar de Compra
            </label>
            <Select
              value={selectedStore}
              onValueChange={handleStoreChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un comercio" />
              </SelectTrigger>
              <SelectContent>
                {displayedStores.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {showOtherInput && (
              <div className="mt-2">
                <Input
                  placeholder="Ingresa el nombre del comercio"
                  value={otherStore}
                  onChange={(e) => setOtherStore(e.target.value)}
                  className="w-full"
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseLocationModal;
