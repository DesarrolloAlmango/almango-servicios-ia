
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";

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
}

const LocationStep: React.FC<LocationStepProps> = ({
  selectedDepartment,
  setSelectedDepartment,
  selectedLocation,
  setSelectedLocation,
  onNext,
  departments,
  municipalities,
  loading
}) => {
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedLocation("");
  };

  const currentMunicipalities = selectedDepartment && municipalities[selectedDepartment] 
    ? municipalities[selectedDepartment] || [] 
    : [];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">Lugar de Servicio</h3>
        <p className="text-muted-foreground">Selecciona la ubicación donde necesitas el servicio</p>
      </div>

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
              <SelectValue placeholder={loading.departments ? "Cargando departamentos..." : "Selecciona un departamento"} />
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
                loading.municipalities ? "Cargando localidades..." : 
                !selectedDepartment ? "Selecciona un departamento primero" : 
                currentMunicipalities.length === 0 ? "No hay localidades disponibles" :
                "Selecciona una localidad"
              } />
            </SelectTrigger>
            <SelectContent>
              {currentMunicipalities && currentMunicipalities.length > 0 ? (
                currentMunicipalities.map(municipality => (
                  <SelectItem key={municipality.id} value={municipality.id}>
                    {municipality.name}
                  </SelectItem>
                ))
              ) : (
                <div className="flex items-center justify-center p-4 text-sm text-muted-foreground">
                  {loading.municipalities ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Cargando...</>
                  ) : (
                    "No hay localidades disponibles"
                  )}
                </div>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-6 mt-4">
        <Button 
          onClick={onNext} 
          disabled={!selectedDepartment || !selectedLocation || loading.municipalities || loading.departments}
          className="bg-primary hover:bg-primary-dark"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default LocationStep;
