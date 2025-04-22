
import React, { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Search } from "lucide-react";
import { toast } from "sonner";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";

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
  const [storeSearch, setStoreSearch] = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [municipalities, setMunicipalities] = useState<Record<string, Municipality[]>>({});
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [loadingLocation, setLoadingLocation] = useState({
    departments: false,
    municipalities: false
  });
  const [openStoreSelect, setOpenStoreSelect] = useState(false);

  const fixedStores: Store[] = [
    { id: "other", name: "Otro" },
    { id: "unknown", name: "No lo sé" }
  ];

  useEffect(() => {
    if (isOpen) {
      fetchProviders();
      fetchDepartments();
      setSelectedStore("");
      setOtherStore("");
      setShowOtherInput(false);
      setSelectedDepartment("");
      setSelectedLocation("");
      setStoreSearch("");
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
      const response = await fetch("/api/AlmangoXV1NETFramework/WebAPI/ObtenerProveedor");

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

  const handleStoreSelect = (value: string) => {
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

    const selected = [...fixedStores, ...localStores].find(store => store.id === selectedStore);
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

  const displayedStores = useMemo(() => {
    return [...fixedStores, ...localStores];
  }, [localStores]);

  const currentMunicipalities = selectedDepartment ? municipalities[selectedDepartment] || [] : [];

  const filteredStores = [
    ...fixedStores,
    ...localStores.filter(store => 
      store.name.toLowerCase().includes(storeSearch.toLowerCase())
    )
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center mb-6">
          <MapPin className="h-12 w-12 mx-auto text-orange-500 mb-2" />
          <DialogDescription className="text-center">
            Necesitamos esta información para brindarte un mejor servicio
          </DialogDescription>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">
              ¿Dónde realizaste la compra?
            </h3>
            {serviceName && (
              <p className="text-muted-foreground text-sm">
                Para el servicio: <span className="font-semibold text-orange-500">{serviceName}</span>
              </p>
            )}
            
            <div className="relative">
              <Command className="rounded-lg border shadow-md">
                <CommandInput 
                  placeholder="Buscar comercio..."
                  value={storeSearch}
                  onValueChange={setStoreSearch}
                  disabled={loading}
                />
                <CommandList>
                  <CommandEmpty>No se encontraron comercios</CommandEmpty>
                  <CommandGroup>
                    {loading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </div>
                    ) : (
                      filteredStores.map((store) => (
                        <CommandItem
                          key={store.id}
                          value={store.id}
                          onSelect={handleStoreSelect}
                          className="cursor-pointer"
                        >
                          {store.name}
                        </CommandItem>
                      ))
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </div>

            {showOtherInput && (
              <Input
                placeholder="Nombre del comercio"
                value={otherStore}
                onChange={(e) => setOtherStore(e.target.value)}
                className="mt-2"
              />
            )}
          </div>

          <div className="space-y-4 pt-4">
            <h3 className="text-lg font-semibold">
              ¿Dónde vamos a realizar el servicio?
            </h3>
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
