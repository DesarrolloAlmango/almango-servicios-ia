import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartItem } from "@/pages/Servicios";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { getGlobalZoneCost } from "@/utils/globalZoneCost";

interface PersonalInfoStepProps {
  onPrevious: () => void;
  onSubmit: (data: any) => void;
  cartItems: CartItem[];
  total: number;
  selectedDate?: Date;
  selectedTimeSlot: string;
  selectedDepartment: string;
  selectedLocation: string;
  departments: Array<{id: string, name: string}>;
  municipalities: Record<string, Array<{id: string, name: string}>>;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onPrevious,
  onSubmit,
  cartItems,
  total,
  selectedDate,
  selectedTimeSlot,
  selectedDepartment,
  selectedLocation,
  departments,
  municipalities
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [apartment, setApartment] = useState("");
  const [corner, setCorner] = useState("");
  const [comments, setComments] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("1");
  const [isDepartmentValid, setIsDepartmentValid] = useState(true);
  const [isLocationValid, setIsLocationValid] = useState(true);
  const [selectedMunicipality, setSelectedMunicipality] = useState("");

  // Get global zone cost
  const zonaCostoAdicional = getGlobalZoneCost();

  useEffect(() => {
    if (departments.length > 0) {
      setIsDepartmentValid(!!selectedDepartment);
    }
  }, [selectedDepartment, departments]);

  useEffect(() => {
    if (municipalities && Object.keys(municipalities).length > 0) {
      setIsLocationValid(!!selectedLocation);
    }
  }, [selectedLocation, municipalities]);

  const handleSubmit = () => {
    if (departments.length > 0 && !selectedDepartment) {
      setIsDepartmentValid(false);
      return;
    }

    if (municipalities && Object.keys(municipalities).length > 0 && !selectedLocation) {
      setIsLocationValid(false);
      return;
    }

    const data = {
      name,
      phone,
      email,
      street,
      number,
      apartment,
      corner,
      comments,
      paymentMethodId
    };
    onSubmit(data);
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setIsDepartmentValid(true);
    setSelectedLocation("");
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
    setIsLocationValid(true);
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold">Información Personal</h3>
        <p className="text-muted-foreground">Completa tus datos para finalizar la solicitud</p>
      </div>

      {/* Order Summary */}
      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h4 className="font-medium text-gray-900">Resumen del Pedido</h4>
        
        {cartItems.map(item => (
          <div key={item.id} className="flex justify-between text-sm">
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.price * item.quantity).toLocaleString('es-UY', {
              maximumFractionDigits: 0
            })}</span>
          </div>
        ))}

        {/* Adicional por zona */}
        <div className="flex justify-between text-sm">
          <span>Adicional por zona</span>
          <span>${zonaCostoAdicional.toLocaleString('es-UY', {
            maximumFractionDigits: 0
          })}</span>
        </div>
        
        <div className="border-t pt-2 flex justify-between font-medium">
          <span>Total</span>
          <span>${(total + zonaCostoAdicional).toLocaleString('es-UY', {
            maximumFractionDigits: 0
          })}</span>
        </div>
        
        {selectedDate && (
          <div className="text-sm text-gray-600">
            <span>Fecha: {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}</span>
            {selectedTimeSlot && <span className="ml-2">Turno: {selectedTimeSlot}</span>}
          </div>
        )}
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre Completo</Label>
          <Input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input type="tel" id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email (opcional)</Label>
          <Input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="street">Calle</Label>
          <Input type="text" id="street" value={street} onChange={(e) => setStreet(e.target.value)} />
        </div>
        <div className="flex gap-4">
          <div className="grid gap-2 flex-1">
            <Label htmlFor="number">Número</Label>
            <Input type="text" id="number" value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div className="grid gap-2 flex-1">
            <Label htmlFor="apartment">Apto. (opcional)</Label>
            <Input type="text" id="apartment" value={apartment} onChange={(e) => setApartment(e.target.value)} />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="corner">Esquina (opcional)</Label>
          <Input type="text" id="corner" value={corner} onChange={(e) => setCorner(e.target.value)} />
        </div>
      </div>

      {departments.length > 0 && (
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="department">Departamento</Label>
            <Select onValueChange={handleDepartmentChange} defaultValue={selectedDepartment}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona un departamento" />
              </SelectTrigger>
              <SelectContent>
                {departments.map(department => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!isDepartmentValid && (
              <p className="text-sm text-red-500">Por favor, selecciona un departamento.</p>
            )}
          </div>

          {selectedDepartment && municipalities[selectedDepartment] && municipalities[selectedDepartment].length > 0 && (
            <div className="grid gap-2">
              <Label htmlFor="location">Localidad</Label>
              <Select onValueChange={handleLocationChange} value={selectedLocation}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecciona una localidad" />
                </SelectTrigger>
                <SelectContent>
                  {municipalities[selectedDepartment].map(municipality => (
                    <SelectItem key={municipality.id} value={municipality.id}>
                      {municipality.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isLocationValid && (
                <p className="text-sm text-red-500">Por favor, selecciona una localidad.</p>
              )}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="comments">Comentarios (opcional)</Label>
          <Textarea id="comments" placeholder="¿Algún comentario adicional?" value={comments} onChange={(e) => setComments(e.target.value)} />
        </div>
      </div>

      <div className="grid gap-4">
        <Label>Método de Pago</Label>
        <RadioGroup defaultValue="1" className="flex flex-col space-y-1.5" onValueChange={setPaymentMethodId}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1" id="r1" />
            <Label htmlFor="r1">Efectivo</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="2" id="r2" />
            <Label htmlFor="r2">Tarjeta de Crédito</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="r3" />
            <Label htmlFor="r3">Transferencia Bancaria</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4" id="r4" />
            <Label htmlFor="r4">Mercado Pago</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onPrevious}>
          Anterior
        </Button>
        <Button onClick={handleSubmit}>
          Finalizar
        </Button>
      </div>
    </div>
  );
};

export default PersonalInfoStep;
