
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { es } from "date-fns/locale";
import { format, addDays, isWeekend, isBefore, isToday } from "date-fns";

interface DateTimeStepProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTimeSlot: string;
  setSelectedTimeSlot: (timeSlot: string) => void;
  onPrevious: () => void;
  onNext: () => void;
}

const DateTimeStep: React.FC<DateTimeStepProps> = ({
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  onPrevious,
  onNext,
}) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);

  // Esta función determina qué franjas horarias están disponibles según el día
  useEffect(() => {
    if (!selectedDate) return;
    
    const day = selectedDate.getDay(); // 0 = domingo, 6 = sábado
    
    if (day === 6) { // Sábado
      setAvailableTimeSlots([
        "08:00 - 12:00",
        "12:00 - 16:00"
      ]);
    } else if (day !== 0) { // Cualquier día menos domingo
      setAvailableTimeSlots([
        "08:00 - 12:00",
        "12:00 - 16:00",
        "16:00 - 20:00"
      ]);
    } else {
      // Domingo - no hay franjas disponibles
      setAvailableTimeSlots([]);
    }
    
    // Resetear la selección si no está disponible en el nuevo día
    if (selectedTimeSlot && !availableTimeSlots.includes(selectedTimeSlot)) {
      setSelectedTimeSlot("");
    }
  }, [selectedDate]);

  // Función para deshabilitar fechas en el calendario
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Deshabilitar domingos y fechas pasadas
    return date.getDay() === 0 || isBefore(date, today);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Clock className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">Fecha y Hora</h3>
        <p className="text-muted-foreground">Selecciona cuándo necesitas el servicio</p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Elige una fecha</h4>
          <div className="flex justify-center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={disabledDays}
              locale={es}
              className="rounded-md border"
              fromDate={new Date()}
              toDate={addDays(new Date(), 60)}
            />
          </div>
        </div>

        {selectedDate && availableTimeSlots.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Elige un horario</h4>
            <RadioGroup 
              value={selectedTimeSlot} 
              onValueChange={setSelectedTimeSlot}
              className="grid grid-cols-1 md:grid-cols-3 gap-2"
            >
              {availableTimeSlots.map((slot) => (
                <div key={slot} className="flex items-center space-x-2">
                  <RadioGroupItem value={slot} id={`slot-${slot}`} />
                  <Label htmlFor={`slot-${slot}`} className="cursor-pointer">
                    {slot}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )}

        {selectedDate && availableTimeSlots.length === 0 && (
          <div className="text-center py-4 text-red-500">
            No hay horarios disponibles para la fecha seleccionada. Por favor, elige otro día.
          </div>
        )}
      </div>

      <div className="flex justify-between gap-4 pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button 
          onClick={onNext}
          disabled={!selectedDate || !selectedTimeSlot}
          className="bg-primary"
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};

export default DateTimeStep;
