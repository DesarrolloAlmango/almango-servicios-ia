
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Store {
  id: string;
  name: string;
  logo?: string;
}

interface PurchaseLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (
    storeId: string, 
    storeName: string, 
    departmentId: string,
    departmentName: string,
    locationId: string,
    locationName: string,
    otherLocation?: string
  ) => void;
  stores?: Store[];
  serviceName?: string;
}

interface Department {
  id: string;
  name: string;
}

interface Municipality {
  id: string;
  name: string;
}

const PurchaseLocationModal: React.FC<PurchaseLocationModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  stores = [],
  serviceName
}) => {
  const [selectedStore, setSelectedStore] = useState<string>("");
  const [otherStore, setOtherStore] = useState<string>("");
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [localStores, setLocalStores] = useState<Store[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [municipalities, setMunicipalities] = useState<Record<string, Municipality[]>>({});
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState({
    departments: false,
    municipalities: false
  });

  // Fixed stores that should appear first
  const fixedStores: Store[] = [
    { id: "other", name: "Otro" },
    { id: "unknown", name: "No lo sé" }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
      fetchDepartments();
      // Reset values when modal opens
      setSelectedStore("");
      setOtherStore("");
      setShowOtherInput(false);
      setSelectedDepartment("");
      setSelectedLocation("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDepartment && !municipalities[selectedDepartment]) {
      fetchMunicipalities(selectedDepartment);
    }
  }, [selectedDepartment]);

  const fetchDepartments = async () => {
    setLoadingLocation(prev => ({...prev, departments: true}));
    try {
      const response = await fetch("/api/AlmangoXV1NETFramework/WebAPI/ObtenerDepto");
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      const formattedDepartments = data.map((item: any) => ({
        id: item.DepartamentoId?.toString() || "",
        name: item.DepartamentoDepartamento?.toString() || ""
      })).filter(dept => dept.id && dept.name)
        .sort((a, b) => a.name.localeCompare(b.name));

      setDepartments(formattedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("No se pudieron cargar los departamentos");
      setDepartments([
        { id: "1", name: "Montevideo" },
        { id: "2", name: "Canelones" },
        { id: "3", name: "Maldonado" }
      ]);
    } finally {
      setLoadingLocation(prev => ({...prev, departments: false}));
    }
  };

  const fetchMunicipalities = async (departmentId: string) => {
    setLoadingLocation(prev => ({...prev, municipalities: true}));
    setSelectedLocation("");
    try {
      const response = await fetch(
        `/api/AlmangoXV1NETFramework/WebAPI/ObtenerMunicipio?DepartamentoId=${departmentId}`
      );
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      const formattedMunicipalities = data
        .map((item: any) => ({
          id: item.DepartamentoMunicipioId?.toString() || "",
          name: item.DepartamentoMunicipioNombre?.toString() || ""
        }))
        .filter(mun => mun.id && mun.name && mun.name !== "-")
        .sort((a, b) => a.name.localeCompare(b.name));

      setMunicipalities(prev => ({
        ...prev,
        [departmentId]: formattedMunicipalities
      }));
    } catch (error) {
      console.error("Error fetching municipalities:", error);
      toast.error("No se pudieron cargar las localidades");
      setMunicipalities(prev => ({
        ...prev,
        [departmentId]: []
      }));
    } finally {
      setLoadingLocation(prev => ({...prev, municipalities: false}));
    }
  };

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
        .sort((a, b) => a.name.localeCompare(b.name));

      setLocalStores(validStores);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      toast.warning("No se pudieron cargar los proveedores. Usando opciones básicas.");
      setLocalStores([]);
    } finally {
      setLoading(false);
    }
  };

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

    if (!selectedDepartment || !selectedLocation) {
      toast.error("Por favor selecciona departamento y localidad");
      return;
    }

    const selected = displayedStores.find(store => store.id === selectedStore);
    const storeName = selectedStore === "other" 
      ? otherStore 
      : selected?.name || "";
    
    const selectedDepartmentObj = departments.find(dept => dept.id === selectedDepartment);
    const selectedLocationObj = currentMunicipalities.find(mun => mun.id === selectedLocation);

    onSelectLocation(
      selectedStore, 
      storeName,
      selectedDepartment,
      selectedDepartmentObj?.name || "",
      selectedLocation,
      selectedLocationObj?.name || "",
      selectedStore === "other" ? otherStore : undefined
    );
    onClose();
  };

  // Combinar opciones fijas primero y luego los proveedores
  const displayedStores = [
    ...fixedStores,
    ...localStores
  ];

  const currentMunicipalities = selectedDepartment ? municipalities[selectedDepartment] || [] : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogTitle className="text-center">
          Selección de Lugar de Compra
        </DialogTitle>
        
        <DialogDescription className="text-center">
          Necesitamos esta información para brindarte un mejor servicio
        </DialogDescription>
        
        <div className="text-center mb-6">
          <MapPin className="h-12 w-12 mx-auto text-orange-500 mb-2" />
          <h3 className="text-xl font-semibold">¿Dónde realizaste la compra?</h3>
          {serviceName && (
            <p className="text-muted-foreground text-sm mt-1">
              Para el servicio: <span className="font-semibold text-orange-500">{serviceName}</span>
            </p>
          )}
        </div>

        <div className="space-y-4">
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

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Departamento
            </label>
            <Select 
              value={selectedDepartment} 
              onValueChange={(value) => {
                setSelectedDepartment(value);
                setSelectedLocation("");
              }}
              disabled={loadingLocation.departments}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingLocation.departments ? "Cargando departamentos..." : "Selecciona un departamento"
                } />
              </SelectTrigger>
              <SelectContent>
                {departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium">
              Localidad
            </label>
            <Select 
              value={selectedLocation} 
              onValueChange={setSelectedLocation}
              disabled={!selectedDepartment || loadingLocation.municipalities}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  loadingLocation.municipalities ? "Cargando localidades..." : 
                  !selectedDepartment ? "Selecciona un departamento primero" : 
                  "Selecciona una localidad"
                } />
              </SelectTrigger>
              <SelectContent>
                {currentMunicipalities.map(municipality => (
                  <SelectItem key={municipality.id} value={municipality.id}>
                    {municipality.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={loading || !selectedStore || (selectedStore === "other" && !otherStore.trim()) || !selectedDepartment || !selectedLocation}
            className="bg-orange-500 hover:bg-orange-600"
          >
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PurchaseLocationModal;
