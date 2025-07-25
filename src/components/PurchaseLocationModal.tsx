import React, { useState, useEffect, useMemo, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, ChevronDown, X } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import LocationStep from "@/components/checkout/LocationStep";
import { Textarea } from "@/components/ui/textarea";
import { lastSelectedCategoryId, lastSelectedCategoryName } from "@/components/CategoryCarousel";
import { setGlobalZoneCost } from "@/utils/globalZoneCost";

interface Store {
  id: string;
  name: string;
  logo?: string;
}
interface PurchaseLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (storeId: string, storeName: string, departmentId: string, departmentName: string, locationId: string, locationName: string, otherLocation?: string, zonaCostoAdicional?: string) => void;
  stores?: Store[];
  serviceName?: string;
  commerceId?: string;
  commerceName?: string;
  // Adding new props to handle category information
  serviceId?: string;
  categoryId?: string;
  categoryName?: string;
}
interface Department {
  id: string;
  name: string;
}
interface Municipality {
  id: string;
  name: string;
  zonaCostoAdicional?: string; // Add this property
}

// Global variable to store the last selected category for automatic opening
let globalLastSelectedCategory: {
  serviceId: string | null;
  categoryId: string | null;
  categoryName: string | null;
} = {
  serviceId: null,
  categoryId: null,
  categoryName: null
};
const PurchaseLocationModal: React.FC<PurchaseLocationModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  stores = [],
  serviceName,
  commerceId,
  commerceName,
  serviceId,
  categoryId,
  categoryName
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

  // Add state for fetched commerce name
  const [fetchedCommerceName, setFetchedCommerceName] = useState<string>("");
  const [isLoadingCommerceName, setIsLoadingCommerceName] = useState(false);
  const fixedStores: Store[] = [{
    id: "other",
    name: "Otro"
  }, {
    id: "unknown",
    name: "No lo sé"
  }];

  // Add state for the local tracking of category selection
  const [localCategoryId, setLocalCategoryId] = useState<string | undefined>(categoryId);
  const [localCategoryName, setLocalCategoryName] = useState<string | undefined>(categoryName);
  const [localServiceId, setLocalServiceId] = useState<string | undefined>(serviceId);

  // Use the global lastSelectedCategoryId if no categoryId is provided
  const effectiveCategoryId = categoryId || lastSelectedCategoryId || null;
  const effectiveCategoryName = categoryName || lastSelectedCategoryName || null;

  // Helper function to check if commerceId should be treated as valid
  const isValidCommerceId = (id?: string) => {
    return id && id !== "0" && id.trim() !== "";
  };

  // Function to fetch commerce name by ID using ObtenerProveedorTodos
  const fetchCommerceName = async (commerceId: string) => {
    setIsLoadingCommerceName(true);
    try {
      const response = await fetch("https://app.almango.com.uy/WebAPI/ObtenerProveedorTodos");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();

      // Find the provider with matching ID
      const provider = data.find((item: any) => item.ProveedorID?.toString() === commerceId.toString());
      if (provider && provider.ProveedorNombre) {
        setFetchedCommerceName(provider.ProveedorNombre);
      } else {
        setFetchedCommerceName("Comercio seleccionado");
      }
    } catch (error) {
      console.error("Error fetching commerce name:", error);
      setFetchedCommerceName("Comercio seleccionado");
    } finally {
      setIsLoadingCommerceName(false);
    }
  };

  // Handle modal close event
  const handleModalClose = () => {
    // Dispatch event to close the product modal too
    const closeProductModalEvent = new CustomEvent('closeProductModal');
    document.dispatchEvent(closeProductModalEvent);

    // Call the original onClose function
    onClose();
  };
  useEffect(() => {
    if (isOpen) {
      console.log("Modal opened with category:", effectiveCategoryId, effectiveCategoryName);
      const validCommerceId = isValidCommerceId(commerceId);
      if (!validCommerceId) {
        fetchProviders();
      } else {
        // Fetch the commerce name when commerceId is provided and valid
        fetchCommerceName(commerceId!);
      }
      fetchDepartments();
      setSelectedStore(validCommerceId ? commerceId! : "");
      setOtherStore("");
      setShowOtherInput(false);
      setSelectedDepartment("");
      setSelectedLocation("");
      setSearchQuery(validCommerceId ? commerceName || "" : "");

      // Set local category state from props or global variable
      if (effectiveCategoryId) {
        setLocalCategoryId(effectiveCategoryId);
        setLocalCategoryName(effectiveCategoryName || undefined);
        setLocalServiceId(serviceId || undefined);
      }

      // Also check the global variable when opening
      if (!effectiveCategoryId && globalLastSelectedCategory.categoryId) {
        setLocalCategoryId(globalLastSelectedCategory.categoryId);
        setLocalCategoryName(globalLastSelectedCategory.categoryName || undefined);
        setLocalServiceId(globalLastSelectedCategory.serviceId || undefined);
      }
    }
  }, [isOpen, commerceId, commerceName, categoryId, categoryName, effectiveCategoryId, effectiveCategoryName, serviceId]);
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

  // Listen for category selection events
  useEffect(() => {
    const handleCategorySelected = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const {
          categoryId,
          categoryName,
          serviceId
        } = customEvent.detail;
        console.log("PurchaseLocationModal received category selection event:", categoryId, categoryName, serviceId);
        setLocalCategoryId(categoryId);
        setLocalCategoryName(categoryName);
        setLocalServiceId(serviceId);

        // Update the global variable for persistence
        globalLastSelectedCategory = {
          serviceId,
          categoryId,
          categoryName
        };
      }
    };
    document.addEventListener('categorySelected', handleCategorySelected);
    return () => {
      document.removeEventListener('categorySelected', handleCategorySelected);
    };
  }, []);
  useEffect(() => {
    // Update local state when props change
    if (categoryId && categoryId !== localCategoryId) {
      setLocalCategoryId(categoryId);
    }
    if (categoryName && categoryName !== localCategoryName) {
      setLocalCategoryName(categoryName);
    }
    if (serviceId && serviceId !== localServiceId) {
      setLocalServiceId(serviceId);
    }
  }, [categoryId, categoryName, serviceId]);
  const fetchDepartments = async () => {
    setLoadingLocation(prev => ({
      ...prev,
      departments: true
    }));
    try {
      const response = await fetch("https://app.almango.com.uy/WebAPI/ObtenerDepto");
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      const formattedDepartments = data.map((item: any) => ({
        id: item.DepartamentoId?.toString() || "",
        name: item.DepartamentoDepartamento?.toString() || ""
      })).filter(dept => dept.id && dept.name).sort((a, b) => a.name.localeCompare(b.name));
      setDepartments(formattedDepartments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast.error("No se pudieron cargar los departamentos");
      setDepartments([{
        id: "1",
        name: "Montevideo"
      }, {
        id: "2",
        name: "Canelones"
      }, {
        id: "3",
        name: "Maldonado"
      }]);
    } finally {
      setLoadingLocation(prev => ({
        ...prev,
        departments: false
      }));
    }
  };
  const fetchMunicipalities = async (departmentId: string) => {
    setLoadingLocation(prev => ({
      ...prev,
      municipalities: true
    }));
    setSelectedLocation("");
    try {
      const response = await fetch(`https://app.almango.com.uy/WebAPI/ObtenerMunicipio?DepartamentoId=${departmentId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      const data = await response.json();
      const formattedMunicipalities = data.map((item: any) => ({
        id: item.DepartamentoMunicipioId?.toString() || "",
        name: item.DepartamentoMunicipioNombre?.toString() || "",
        zonaCostoAdicional: item.ZonaCostoAdicional?.toString() || "0.00" // Add this line
      })).filter(mun => mun.id && mun.name && mun.name !== "-").sort((a, b) => a.name.localeCompare(b.name));
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
      setLoadingLocation(prev => ({
        ...prev,
        municipalities: false
      }));
    }
  };
  const fetchProviders = async () => {
    setLoading(true);
    try {
      // Keep using ObtenerProveedor for the providers list
      const response = await fetch("https://app.almango.com.uy/WebAPI/ObtenerProveedor");
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
      const validStores = storesData.filter((item: any) => item.ProveedorID && item.ProveedorNombre).map((item: any) => ({
        id: item.ProveedorID.toString(),
        name: item.ProveedorNombre.toString(),
        logo: item.ProveedorLogo?.toString() || ""
      })).sort((a, b) => a.name.localeCompare(b.name));
      setLocalStores(validStores);
    } catch (error) {
      console.error("Error al obtener proveedores:", error);
      toast.warning("No se pudieron cargar los proveedores. Usando opciones básicas.");
      setLocalStores([]);
    } finally {
      setLoading(false);
    }
  };
  const closeKeyboard = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };
  const handleStoreChange = (value: string) => {
    const selectedStoreObj = [...fixedStores, ...localStores].find(store => store.id === value);
    setSelectedStore(value);
    setShowOtherInput(value === "other");
    if (selectedStoreObj) {
      setSearchQuery(selectedStoreObj.name);
    }
    setIsStoreDropdownOpen(false);

    // Close the keyboard when a store is selected
    closeKeyboard();
  };
  const handleInputClick = () => {
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
    if (scrollAreaRef.current && scrollAreaRef.current.contains(e.relatedTarget as Node)) {
      return;
    }
    setTimeout(() => {
      setIsStoreDropdownOpen(false);
    }, 200);
  };
  const handleScrollAreaMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  // Add state for tracking if we're in the process of confirming
  const [isConfirming, setIsConfirming] = useState(false);
  const handleConfirm = async () => {
    // Avoid double-clicking issues
    if (isConfirming) return;
    try {
      setIsConfirming(true);
      const validCommerceId = isValidCommerceId(commerceId);
      if (!validCommerceId) {
        if (!selectedStore && searchQuery) {
          setSelectedStore("other");
          setOtherStore(searchQuery);
          setShowOtherInput(true);
        }
        if (!selectedStore && !searchQuery) {
          toast.error("Por favor selecciona o escribe un lugar de compra");
          setIsConfirming(false);
          return;
        }
        if (selectedStore === "other" && !otherStore.trim()) {
          toast.error("Por favor ingresa el nombre del comercio");
          setIsConfirming(false);
          return;
        }
      }
      if (!selectedDepartment || !selectedLocation) {
        toast.error("Por favor selecciona departamento y localidad");
        setIsConfirming(false);
        return;
      }
      const storeId = validCommerceId ? commerceId! : selectedStore || "other";
      const storeName = validCommerceId ? fetchedCommerceName || commerceName || "Comercio seleccionado" : selectedStore === "other" ? otherStore || searchQuery : [...fixedStores, ...localStores].find(store => store.id === selectedStore)?.name || "";
      const selectedDepartmentObj = departments.find(dept => dept.id === selectedDepartment);
      const selectedLocationObj = currentMunicipalities.find(mun => mun.id === selectedLocation);

      // Set the global zone cost when location is confirmed
      const zoneCost = selectedLocationObj?.zonaCostoAdicional ? parseFloat(selectedLocationObj.zonaCostoAdicional) : 0;
      setGlobalZoneCost(zoneCost);

      // Use the effective category ID from props or the global variable
      const finalCategoryId = localCategoryId || lastSelectedCategoryId || categoryId || null;
      const finalCategoryName = localCategoryName || lastSelectedCategoryName || categoryName || null;
      console.log("Confirming location with category info:", {
        serviceId: localServiceId,
        categoryId: finalCategoryId,
        categoryName: finalCategoryName,
        commerceId,
        validCommerceId,
        zoneCost
      });

      // Close the modal and call onSelectLocation with zonaCostoAdicional
      onClose();
      onSelectLocation(
        storeId, 
        storeName, 
        selectedDepartment, 
        selectedDepartmentObj?.name || "", 
        selectedLocation, 
        selectedLocationObj?.name || "", 
        selectedStore === "other" ? otherStore || searchQuery : undefined,
        selectedLocationObj?.zonaCostoAdicional || "0"
      );

      // RESTORED: When validCommerceId is present, dispatch event to open products AFTER location is confirmed
      // For manual flow (no valid commerceId), the normal flow continues as before
      if (validCommerceId && finalCategoryId && localServiceId) {
        setTimeout(() => {
          console.log("Dispatching openCategory event after location confirmation for commerceId flow");
          const openCategoryEvent = new CustomEvent('openCategory', {
            detail: {
              serviceId: localServiceId,
              categoryId: finalCategoryId,
              categoryName: finalCategoryName,
              fromLocationConfirmation: true // Flag to indicate this comes from location confirmation
            }
          });
          document.dispatchEvent(openCategoryEvent);
        }, 100); // Small delay to ensure modal is closed first
      }
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      toast.error("Ocurrió un error al procesar la solicitud");
    } finally {
      setIsConfirming(false);
    }
  };
  const isFormValid = useMemo(() => {
    const validCommerceId = isValidCommerceId(commerceId);
    if (validCommerceId) {
      return selectedDepartment && selectedLocation;
    }
    if (!selectedStore && !searchQuery) return false;
    if (selectedStore === "other" && !otherStore.trim()) return false;
    return selectedDepartment && selectedLocation;
  }, [commerceId, selectedStore, searchQuery, otherStore, selectedDepartment, selectedLocation]);
  const displayedStores = useMemo(() => {
    return [...fixedStores, ...localStores];
  }, [localStores]);
  const filteredStores = useMemo(() => {
    if (!searchQuery) return displayedStores;
    return displayedStores.filter(store => store.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [displayedStores, searchQuery]);

  // Calculate dynamic height based on number of filtered results
  const getDropdownHeight = () => {
    if (loading) return "60px";
    const itemCount = filteredStores.length;
    if (itemCount === 0) return "60px"; // Height for "no results" message

    // Each item is approximately 40px (py-2 with text), max 6 items visible
    const maxItems = 6;
    const visibleItems = Math.min(itemCount, maxItems);
    return `${visibleItems * 40}px`;
  };
  const currentMunicipalities = selectedDepartment ? municipalities[selectedDepartment] || [] : [];

  // Get the selected municipality to show its zone cost
  const selectedMunicipality = currentMunicipalities.find(mun => mun.id === selectedLocation);
  const validCommerceId = isValidCommerceId(commerceId);
  return <Dialog open={isOpen} onOpenChange={open => {
    if (!open) {
      handleModalClose();
    }
  }}>
      <DialogContent className="sm:max-w-md">
        {/* Add DialogTitle to fix accessibility warning */}
        <DialogTitle className="sr-only">Selección de lugar de compra</DialogTitle>
        
        {!validCommerceId && <div className="text-center mb-6">
            <MapPin className="h-12 w-12 mx-auto text-orange-500 mb-2" />
            <DialogDescription className="text-center">
              Necesitamos esta información para brindarte un mejor servicio
            </DialogDescription>
          </div>}
        
        {validCommerceId ? <LocationStep selectedDepartment={selectedDepartment} setSelectedDepartment={setSelectedDepartment} selectedLocation={selectedLocation} setSelectedLocation={setSelectedLocation} onNext={handleConfirm} departments={departments} municipalities={municipalities} loading={loadingLocation} title="¿Dónde vamos a realizar el servicio?" description="Selecciona la ubicación donde necesitas el servicio" buttonText={isConfirming ? "Procesando..." : "Confirmar"} showStoreSection={true} storeName={isLoadingCommerceName ? "Cargando..." : fetchedCommerceName || commerceName || "Comercio seleccionado"} categoryId={undefined} // Remove automatic category opening
      /> : <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                ¿Dónde realizaste la compra?
              </h3>
              {serviceName && <p className="text-muted-foreground text-sm">
                  Para el servicio: <span className="font-semibold text-orange-500">{serviceName}</span>
                </p>}
              <label className="block text-sm font-medium">
                Lugar de Compra *
              </label>
              
              <div className="relative">
                <div className="flex items-center relative">
                  <Input ref={inputRef} placeholder={loading ? "Cargando..." : "Buscar o seleccionar comercio"} value={searchQuery} onChange={handleInputChange} onClick={handleInputClick} onBlur={handleInputBlur} className="pr-8 text-xs" />
                  {selectedStore && <X className="h-4 w-4 absolute right-7 text-muted-foreground cursor-pointer" onClick={e => {
                e.stopPropagation();
                setSelectedStore("");
                setSearchQuery("");
                setShowOtherInput(false);
                setOtherStore("");
              }} />}
                  <ChevronDown className="h-4 w-4 absolute right-3 text-muted-foreground" />
                </div>
                
                {isStoreDropdownOpen && <div className="absolute z-50 w-full mt-1 rounded-md border bg-popover shadow-lg">
                    <ScrollArea ref={scrollAreaRef} className="rounded-md" style={{
                height: getDropdownHeight()
              }} onMouseDown={handleScrollAreaMouseDown}>
                      {loading ? <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          <span className="text-xs">Cargando opciones...</span>
                        </div> : filteredStores.length > 0 ? filteredStores.map((store, index) => <div key={store.id} className={`px-4 py-2 hover:bg-accent hover:text-accent-foreground cursor-pointer uppercase text-xs
                                      ${index < 2 ? 'font-bold' : ''}`} onMouseDown={e => e.preventDefault()} onClick={() => handleStoreChange(store.id)}>
                            {store.name}
                          </div>) : <div className="px-4 py-2 text-muted-foreground text-xs">
                          No se encontraron resultados
                        </div>}
                    </ScrollArea>
                  </div>}
              </div>

              {showOtherInput && <div className="mt-2">
                  <label className="block text-sm font-medium">
                    Nombre del comercio *
                  </label>
                  <Input placeholder="Ingresa el nombre del comercio" value={otherStore} onChange={e => setOtherStore(e.target.value)} className="text-xs" onFocus={() => {
              // This is intentionally empty as we want the keyboard to open on focus
            }} />
                </div>}
            </div>

            <div className="space-y-4 pt-4">
              <h3 className="text-lg font-semibold">
                ¿Dónde vamos a realizar el servicio?
              </h3>
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Departamento *
                </label>
                <Select value={selectedDepartment} onValueChange={value => {
              setSelectedDepartment(value);
              setSelectedLocation("");
              // Close keyboard when selecting from dropdown
              closeKeyboard();
            }} disabled={loadingLocation.departments}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingLocation.departments ? "Cargando departamentos..." : "Selecciona un departamento"} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map(dept => <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Localidad *
                </label>
                <Select value={selectedLocation} onValueChange={value => {
              setSelectedLocation(value);
              // Close keyboard when selecting from dropdown
              closeKeyboard();
            }} disabled={!selectedDepartment || loadingLocation.municipalities}>
                  <SelectTrigger>
                    <SelectValue placeholder={loadingLocation.municipalities ? "Cargando localidades..." : !selectedDepartment ? "Selecciona un departamento primero" : "Selecciona una localidad"} />
                  </SelectTrigger>
                  <SelectContent>
                    <ScrollArea className="h-[200px]">
                      {currentMunicipalities.map(municipality => <SelectItem key={municipality.id} value={municipality.id}>
                          {municipality.name}
                        </SelectItem>)}
                    </ScrollArea>
                  </SelectContent>
                </Select>
              </div>

              {/* Debug section to show ZonaCostoAdicional - only show if value > 0 */}
              {selectedMunicipality && parseFloat(selectedMunicipality.zonaCostoAdicional) > 0 && <div className="mt-4 p-3 rounded-md bg-gray-50 border border-gray-200">
                  <h4 className="font-medium text-gray-700 mb-1 mx-0">Costo adicional por zona:</h4>
                  <p className="text-gray-600 text-sm">
                    Localidad: <span className="font-semibold">{selectedMunicipality.name}</span>
                  </p>
                  <p className="text-gray-600 text-sm">
                    Adicional: <span className="font-semibold">${selectedMunicipality.zonaCostoAdicional}</span>
                  </p>
                </div>}
            </div>
          </div>}

        {!validCommerceId && <DialogFooter>
            <Button variant="outline" onClick={handleModalClose} disabled={isConfirming}>
              Cancelar
            </Button>
            <Button onClick={handleConfirm} disabled={!isFormValid || loading || isConfirming} className="bg-orange-500 hover:bg-orange-600">
              {isConfirming ? <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Procesando...
                </> : "Confirmar"}
            </Button>
          </DialogFooter>}
      </DialogContent>
    </Dialog>;
};

// Export global last selected category for external access
export { globalLastSelectedCategory };
export default PurchaseLocationModal;
