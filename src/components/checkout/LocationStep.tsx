
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface LocationStepProps {
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  onNext: () => void;
}

const LocationStep: React.FC<LocationStepProps> = ({
  selectedDepartment,
  setSelectedDepartment,
  selectedLocation,
  setSelectedLocation,
  onNext
}) => {
  // Lista simplificada de departamentos y localidades
  const departments = [
    { id: "1", name: "Montevideo" },
    { id: "2", name: "Canelones" },
    { id: "3", name: "Maldonado" },
  ];

  const locations: Record<string, Array<{ id: string; name: string }>> = {
    "1": [
      { id: "1-1", name: "Centro" },
      { id: "1-2", name: "Pocitos" },
      { id: "1-3", name: "Carrasco" },
    ],
    "2": [
      { id: "2-1", name: "Ciudad de la Costa" },
      { id: "2-2", name: "Las Piedras" },
      { id: "2-3", name: "Pando" },
    ],
    "3": [
      { id: "3-1", name: "Punta del Este" },
      { id: "3-2", name: "Maldonado" },
      { id: "3-3", name: "San Carlos" },
    ],
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedLocation("");
  };

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
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona un departamento" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
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
            disabled={!selectedDepartment}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona una localidad" />
            </SelectTrigger>
            <SelectContent>
              {selectedDepartment &&
                locations[selectedDepartment]?.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4 mt-4">
        <Button
          onClick={onNext}
          disabled={!selectedDepartment || !selectedLocation}
          className="bg-primary"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default LocationStep;
