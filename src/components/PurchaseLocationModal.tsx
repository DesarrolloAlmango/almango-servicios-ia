
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

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
  const [open, setOpen] = useState(false);

  // Define fixed stores outside of the component to avoid recreation on every render
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
      })).filter((dept: any) => dept.id && dept.name)
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

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
        .filter((mun: any) => mun.id && mun.name && mun.name !== "-")
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

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
      : (selected?.name || "");
    
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

  // Make sure we always have an array of displayedStores, even if empty
  const displayedStores = [
    ...fixedStores,
    ...((localStores && localStores.length > 0) ? localStores.slice(0, 5) : [])
  ];

  const currentMunicipalities = selectedDepartment && municipalities[selectedDepartment] 
    ? municipalities[selectedDepartment] || []
    : [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center mb-6">
          <MapPin className="h-12 w-12 mx-auto text-orange-500 mb-2" />
          <DialogTitle className="text-lg font-medium">¿Dónde realizaste la compra?</DialogTitle>
          {serviceName && (
            <p className="text-muted-foreground text-sm mt-1">
              Para el servicio: <span className="font-semibold text-orange-500">{serviceName}</span>
            </p>
          )}
        </div>
        
        <div className="space-y-6">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Selección del Lugar de Compra</h3>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                  disabled={loading}
                >
                  {selectedStore
                    ? displayedStores.find((store) => store.id === selectedStore)?.name || "Selecciona un comercio"
                    : loading ? "Cargando..." : "Selecciona un comercio"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                {Array.isArray(displayedStores) && displayedStores.length > 0 ? (
                  <Command>
                    <CommandInput placeholder="Buscar comercio..." />
                    <CommandEmpty>No se encontraron resultados.</CommandEmpty>
                    <CommandGroup>
                      {displayedStores.map((store) => (
                        <CommandItem
                          key={store.id}
                          value={store.id}
                          onSelect={(currentValue) => {
                            handleStoreChange(currentValue);
                            setOpen(false);
                          }}
                          className={cn(
                            "cursor-pointer",
                            fixedStores.some(f => f.id === store.id) ? "font-semibold" : ""
                          )}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedStore === store.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {store.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </Command>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span>Cargando comercios...</span>
                      </div>
                    ) : (
                      "No hay comercios disponibles"
                    )}
                  </div>
                )}
              </PopoverContent>
            </Popover>

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
            <h3 className="text-lg font-semibold">¿Dónde vamos a realizar el servicio?</h3>
            
            <div className="space-y-4">
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
                    {Array.isArray(departments) && departments.length > 0 ? (
                      departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        {loadingLocation.departments ? 
                          "Cargando..." : 
                          "No hay departamentos disponibles"
                        }
                      </div>
                    )}
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
                    {Array.isArray(currentMunicipalities) && currentMunicipalities.length > 0 ? (
                      currentMunicipalities.map(municipality => (
                        <SelectItem key={municipality.id} value={municipality.id}>
                          {municipality.name}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                        {loadingLocation.municipalities ? 
                          "Cargando..." : 
                          "No hay localidades disponibles"
                        }
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
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
