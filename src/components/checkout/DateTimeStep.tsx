import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Clock } from "lucide-react";
import { es } from "date-fns/locale";
import { format, addDays, isBefore, isToday } from "date-fns";
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
  onNext
}) => {
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const timeSlotsRef = useRef<HTMLDivElement>(null);

  // Establecer el día siguiente como fecha seleccionada por defecto
  useEffect(() => {
    const tomorrow = addDays(new Date(), 1);
    tomorrow.setHours(0, 0, 0, 0);
    setSelectedDate(tomorrow);
  }, []);
  useEffect(() => {
    if (!selectedDate) return;
    const day = selectedDate.getDay(); // 0 = domingo, 6 = sábado

    if (day === 6) {
      // Sábado
      setAvailableTimeSlots(["08:00 - 14:00",
      // Updated time slot for Saturday
      "14:00 - 20:00" // Updated time slot for Saturday
      ]);
    } else if (day !== 0) {
      // Cualquier día menos domingo
      setAvailableTimeSlots(["08:00 - 12:00", "12:00 - 16:00", "16:00 - 20:00"]);
    } else {
      // Domingo - no hay franjas disponibles
      setAvailableTimeSlots([]);
    }

    // Resetear la selección si no está disponible en el nuevo día
    if (selectedTimeSlot && !availableTimeSlots.includes(selectedTimeSlot)) {
      setSelectedTimeSlot("");
    }
  }, [selectedDate]);
  useEffect(() => {
    if (selectedDate && timeSlotsRef.current) {
      setTimeout(() => {
        timeSlotsRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  }, [selectedDate]);

  // Función para deshabilitar fechas en el calendario
  const disabledDays = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Deshabilitar domingos, el día de hoy y fechas pasadas
    return date.getDay() === 0 || isBefore(date, today) || isToday(date);
  };
  return <div className="space-y-6">
      <div className="text-center mb-6">
        <Clock className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">Fecha y Hora</h3>
        <p className="text-muted-foreground">Selecciona cuándo necesitas el servicio</p>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-2">Elige una fecha</h4>
          <div className="flex justify-center">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} disabled={disabledDays} locale={es} className="rounded-md border" fromDate={addDays(new Date(), 1)} // Comienza desde mañana
          toDate={addDays(new Date(), 60)} />
          </div>
        </div>

        {selectedDate && <div ref={timeSlotsRef}>
            <h4 className="font-medium mb-2">Elige un horario</h4>
            {availableTimeSlots.length > 0 ? <>
                <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot} className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {availableTimeSlots.map(slot => <div key={slot} className="flex items-center space-x-2">
                      <RadioGroupItem value={slot} id={`slot-${slot}`} />
                      <Label htmlFor={`slot-${slot}`} className="cursor-pointer">
                        {slot}
                      </Label>
                    </div>)}
                </RadioGroup>
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <p className="text-sm text-blue-700 text-center">En caso de coordinación web, confirme disponibilidad por whatsapp.</p>
                </div>
              </> : <div className="text-center py-4 text-red-500">
                No hay horarios disponibles para la fecha seleccionada. Por favor, elige otro día.
              </div>}
          </div>}
      </div>

      <div className="flex justify-between gap-4 pt-4 pb-6">
        <Button variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button onClick={onNext} disabled={!selectedDate || !selectedTimeSlot} className="bg-primary hover:bg-primary-dark">
          Siguiente
        </Button>
      </div>
    </div>;
};
export default DateTimeStep;