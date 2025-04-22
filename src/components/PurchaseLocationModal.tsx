import React, { useState, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [isStoreDropdownOpen, setIsStoreDropdownOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
      setSearchQuery("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (isStoreDropdownOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isStoreDropdownOpen]);

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

      let storesData = Array.isArray(data) ? data : data.result || data.data || [];
      
      if (!Array.isArray(storesData)) {
        throw new Error("Formato de datos inválido");
      }

      const validStores = storesData
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
    const selectedStoreObj = [...fixedStores, ...localStores].find(store => store.id === value);
    setSelectedStore(value);
    setShowOtherInput(value === "other");
    
    // Actualizar el searchQuery con el nombre del store seleccionado
    if (selectedStoreObj) {
      setSearchQuery(selectedStoreObj.name);
    }
    
    setIsStoreDropdownOpen(false);
  };

  const handleInputClick = () => {
    // Si ya hay una selección, limpiarla al hacer clic nuevamente
    if (selectedStore) {
      setSelectedStore("");
      setSearchQuery("");
      setShowOtherInput(false);
      setOtherStore("");
    }
    setIsStoreDropdownOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value === "") {
      setSelectedStore("");
      setShowOtherInput(false);
    }
    setIsStoreDropdownOpen(true);
  };

  const handleInputBlur = (e: React.FocusEvent) => {
    // Verificar si el blur fue causado por hacer clic en el ScrollArea
    if (scrollAreaRef.current && scrollAreaRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    setTimeout(() => {
      setIsStoreDropdownOpen(false);
    }, 200);
  };

  const handleScrollAreaMouseDown = (e: React.MouseEvent) => {
    // Prevenir el blur cuando se interactúa con el ScrollArea
    e.preventDefault();
  };

  const handleConfirm = () => {
    if (!selectedStore && searchQuery) {
      setSelectedStore("other");
      setOtherStore(searchQuery);
      setShowOtherInput(true);
    }

    if (!selectedStore && !searchQuery) {
      toast.error("Por favor selecciona o escribe un lugar de compra");
      return;
    }

    if (selectedStore === "other" && !otherStore.trim() && !searchQuery.trim()) {
      toast.error("Por favor ingresa el nombre del comercio");
      return;
    }

    if (!selectedDepartment || !selectedLocation) {
      toast.error("Por favor selecciona departamento y localidad");
      return;
    }

    const storeName = selectedStore === "other" 
      ? otherStore || searchQuery 
      : [...fixedStores, ...localStores].find(store => store.id === selectedStore)?.name || "";
    
    const selectedDepartmentObj = departments.find(dept => dept.id === selectedDepartment);
    const selectedLocationObj = currentMunicipalities.find(mun => mun.id === selectedLocation);

    onSelectLocation(
      selectedStore || "other", 
      storeName,
      selectedDepartment,
      selectedDepartmentObj?.name || "",
      selectedLocation,
      selectedLocationObj?.name || "",
      selectedStore === "other" ? otherStore || searchQuery : undefined
    );
    onClose();
  };

  const displayedStores = useMemo(() => {
    return [...fixedStores, ...localStores];
  }, [localStores]);

  const filteredStores = useMemo(() => {
    if (!searchQuery) return displayedStores;
    return displayedStores.filter(store => 
      store.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [displayedStores, searchQuery]);

  const currentMunicipalities = selectedDepartment ? municipalities[selectedDepartment] || [] : [];

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
            <label className="block text-sm font-medium">
              Lugar de Compra
            </label>
            
            <div className="relative">
              <div className="flex items-center relative">
                <Input
                  ref={inputRef}
                  placeholder={loading ? "Cargando..." : "Buscar o seleccionar comercio"}
                  value={searchQuery}
                  onChange={handleInputChange}
                  onClick={handleInputClick}
                  onBlur={handleInputBlur}
                  className="pr-8 text-xs"
                />
                {selectedStore && (
                  <X 
                    className="h-4 w-4 absolute right-7 text-muted-foreground cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedStore("");
                      setSearchQuery("");
                      setShowOtherInput(false);
                      setOtherStore("");
                    }}
                  />
                )}
                <ChevronDown className="h-4 w-4 absolute right-3 text-muted-foreground" />
              </div>
              
              {isStoreDropdownOpen && (
                <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-lg">
                  <ScrollArea 
                    ref={scrollAreaRef}
                    className="h-[200px] rounded-md"
                    onMouseDown={handleScrollAreaMouseDown}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center p-4">
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        <span className="text-xs">Cargando opciones...</span>
                      </div>
                    ) : filteredStores.length > 0 ? (
                      filteredStores.map((store, index) => (
                        <div
                          key={store.id}
                          className={`px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer uppercase text-xs
                                    ${index < 2 ? 'font-bold' : ''}`}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleStoreChange(store.id)}
                        >
                          {store.name}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-2 text-muted-foreground text-xs">
                        No se encontraron resultados
                      </div>
                    )}
                  </ScrollArea>
                </div>
              )}
            </div>

            {showOtherInput && (
              <Input
                placeholder="Nombre del comercio"
                value={otherStore}
                onChange={(e) => setOtherStore(e.target.value)}
                className="mt-2 text-xs"
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
                  <ScrollArea className="h-[200px]">
                    {currentMunicipalities.map(municipality => (
                      <SelectItem key={municipality.id} value={municipality.id}>
                        {municipality.name}
                      </SelectItem>
                    ))}
                  </ScrollArea>
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
            disabled={loading || (!selectedStore && !searchQuery) || (selectedStore === "other" && !otherStore.trim() && !searchQuery.trim()) || !selectedDepartment || !selectedLocation}
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