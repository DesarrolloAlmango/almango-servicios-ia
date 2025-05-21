
import React, { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationStepProps {
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  onNext: () => void;
  departments: Array<{
    id: string;
    name: string;
  }>;
  municipalities: Record<string, Array<{
    id: string;
    name: string;
  }>>;
  loading: {
    departments: boolean;
    municipalities: boolean;
  };
  title?: string;
  description?: string;
  buttonText?: string;
  showStoreSection?: boolean;
  storeName?: string;
  categoryId?: string;
}

const LocationStep: React.FC<LocationStepProps> = ({
  selectedDepartment,
  setSelectedDepartment,
  selectedLocation,
  setSelectedLocation,
  onNext,
  departments,
  municipalities,
  loading,
  title = "Lugar de Servicio",
  description = "Selecciona la ubicación donde necesitas el servicio",
  buttonText = "Siguiente",
  showStoreSection = false,
  storeName,
  categoryId
}) => {
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedLocation("");
  };

  const handleNextWithDelay = () => {
    // First, call the original onNext function immediately to close the modal
    onNext();
    
    // If we have a categoryId, dispatch the event after a delay
    // but don't attempt any direct DOM manipulation which could cause freezing
    if (categoryId) {
      console.log("LocationStep: Scheduling openCategory event for:", categoryId);
      
      setTimeout(() => {
        console.log("LocationStep: Dispatching openCategory event for:", categoryId);
        // Dispatch the event with the category ID
        try {
          // Get category name from window if available
          const categoryName = window.lastSelectedCategoryName || undefined;
          console.log("LocationStep: Category name for event:", categoryName);
          
          const openCategoryEvent = new CustomEvent('openCategory', { 
            detail: { 
              categoryId,
              // Use global variable if available
              serviceId: window.lastSelectedServiceId || undefined,
              categoryName
            } 
          });
          document.dispatchEvent(openCategoryEvent);
          
          // Add console log to track successful event dispatch
          console.log("LocationStep: Successfully dispatched openCategory event");
        } catch (error) {
          console.error("Error dispatching openCategory event:", error);
        }
      }, 300);  // Reduced delay to improve responsiveness
    }
  };

  const currentMunicipalities = selectedDepartment ? municipalities[selectedDepartment] || [] : [];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {showStoreSection && storeName && (
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <h4 className="font-medium text-blue-700 mb-1">Lugar de compra:</h4>
          <p className="text-blue-600">{storeName}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="department" className="block text-sm font-medium">
            Departamento
          </label>
          <Select 
            value={selectedDepartment} 
            onValueChange={handleDepartmentChange}
            disabled={loading.departments}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loading.departments ? "Cargando..." : "Selecciona un departamento"} />
            </SelectTrigger>
            <SelectContent>
              {loading.departments ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium">
            Localidad
          </label>
          <Select 
            value={selectedLocation} 
            onValueChange={setSelectedLocation} 
            disabled={!selectedDepartment || loading.municipalities}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                loading.municipalities ? "Cargando..." : 
                !selectedDepartment ? "Selecciona un departamento primero" : 
                currentMunicipalities.length === 0 ? "No hay localidades disponibles" :
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

      <div className="flex justify-end pt-4 pb-6 mt-4">
        <Button 
          onClick={handleNextWithDelay} 
          disabled={!selectedDepartment || !selectedLocation || loading.municipalities || loading.departments}
          className="bg-primary hover:bg-primary-dark"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

// Add this for TypeScript global variable declaration
declare global {
  interface Window {
    lastSelectedServiceId?: string;
    lastSelectedCategoryName?: string;
    toast?: any; // For accessing toast from window object
  }
}

export default LocationStep;
