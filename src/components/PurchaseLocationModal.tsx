import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin } from "lucide-react";
import { toast } from "sonner";

interface Store {
  id: string;
  name: string;
  logo?: string;
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
  const [apiStores, setApiStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);

  // Opciones fijas que deben aparecer primero
  const fixedStores: Store[] = [
    { id: "other", name: "Otro" },
    { id: "unknown", name: "No lo sé" }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
    }
  }, [isOpen]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/AlmangoXV1NETFramework/WebAPI/ObtenerProveedor", {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType?.includes('application/json')) {
        throw new TypeError("La respuesta no es JSON");
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error("Formato de datos inválido");
      }

      const validStores = data
        .filter((item: any) => item.ProveedorID && item.ProveedorNombre)
        .map((item: any) => ({
          id: item.ProveedorID.toString(),
          name: item.ProveedorNombre.toString(),
          logo: item.ProveedorLogo?.toString() || ""
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Ordenar alfabéticamente

      setApiStores(validStores);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      toast.warning("No se pudieron cargar los proveedores. Usando opciones básicas.");
      setApiStores([]);
    } finally {
      setLoading(false);
    }
  };

  // Combinar opciones fijas primero y luego los proveedores de la API
  const displayedStores = [
    ...fixedStores,
    ...(apiStores.length > 0 ? apiStores : stores)
  ];

  const handleStoreChange = (value: string) => {
    setSelectedStore(value);
    setShowOtherInput(value === "other");
    if (value !== "other") setOtherStore("");
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

    const selected = displayedStores.find(store => store.id === selectedStore);
    const storeName = selectedStore === "other" 
      ? otherStore 
      : selected?.name || "";

    onSelectLocation(selectedStore, storeName, selectedStore === "other" ? otherStore : undefined);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            <label className="block text-sm font-medium">
              Lugar de Compra
            </label>
            <Select
              value={selectedStore}
              onValueChange={handleStoreChange}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Cargando..." : "Selecciona un comercio"} />
              </SelectTrigger>
              <SelectContent>
                {displayedStores.map(store => (
                  <SelectItem 
                    key={store.id} 
                    value={store.id}
                    className={fixedStores.some(f => f.id === store.id) ? "font-semibold" : ""}
                  >
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {showOtherInput && (
              <Input
                placeholder="Nombre del comercio"
                value={otherStore}
                onChange={(e) => setOtherStore(e.target.value)}
                className="mt-2"
              />
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Confirmar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseLocationModal;