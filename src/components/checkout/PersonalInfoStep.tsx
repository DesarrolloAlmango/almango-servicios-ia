import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { User, ClipboardList, CreditCard, Banknote, AlertCircle, MapPin } from "lucide-react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { CartItem } from "@/pages/Servicios";
import { 
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, { message: "El nombre es obligatorio" }),
  phone: z.string().min(8, { message: "El teléfono debe tener al menos 8 dígitos" }),
  email: z.string().email({ message: "Email inválido" }),
  street: z.string().min(2, { message: "La calle es obligatoria" }),
  number: z.string().min(1, { message: "El número es obligatorio" }),
  corner: z.string().optional(),
  apartment: z.string().optional(),
  comments: z.string().optional(),
  paymentMethod: z.enum(["later", "now"], {
    required_error: "Selecciona un método de pago",
  }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface PersonalInfoStepProps {
  onPrevious: () => void;
  onSubmit: (data: FormValues) => void;
  cartItems: CartItem[];
  total: number;
  selectedDepartment: string;
  selectedLocation: string;
  selectedDate?: Date;
  selectedTimeSlot: string;
  departments: Array<{ id: string; name: string; }>;
  municipalities: Record<string, Array<{ id: string; name: string; }>>;
}

const PersonalInfoStep: React.FC<PersonalInfoStepProps> = ({
  onPrevious,
  onSubmit,
  cartItems,
  total,
  selectedDepartment,
  selectedLocation,
  selectedDate,
  selectedTimeSlot,
  departments = [],
  municipalities = {},
}) => {
  const [showOrderSummary, setShowOrderSummary] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      street: "",
      number: "",
      corner: "",
      apartment: "",
      comments: "",
      paymentMethod: "later",
      termsAccepted: undefined as any,
    },
  });

  const formatDate = (date?: Date) => {
    if (!date) return "No seleccionada";
    return new Intl.DateTimeFormat('es-UY', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };

  const getDepartmentName = (departmentId: string) => {
    if (!departments || !Array.isArray(departments) || departments.length === 0) return departmentId;
    const department = departments.find(dept => dept.id === departmentId);
    return department ? department.name : departmentId;
  };

  const getLocationName = (departmentId: string, locationId: string) => {
    if (!municipalities || !municipalities[departmentId]) return locationId;
    const municipalitiesList = municipalities[departmentId] || [];
    const municipality = municipalitiesList.find(mun => mun.id === locationId);
    return municipality ? municipality.name : locationId;
  };

  const getServiceLocation = (item: CartItem) => {
    if (!item.departmentId || !item.locationId) {
      return "Ubicación no registrada";
    }

    const departmentName = getDepartmentName(item.departmentId);
    const locationName = getLocationName(item.departmentId, item.locationId);
    
    return `${departmentName}, ${locationName}`;
  };

  const groupServicesByLocation = (items: CartItem[]) => {
    return items.reduce((acc: { [key: string]: CartItem[] }, item) => {
      const locationKey = item.departmentId && item.locationId ? 
        `${item.departmentId}-${item.locationId}` : 
        'no-location';
      
      if (!acc[locationKey]) {
        acc[locationKey] = [];
      }
      
      acc[locationKey].push(item);
      return acc;
    }, {});
  };

  const getLocationLabel = (departmentId: string, locationId: string) => {
    const departmentName = getDepartmentName(departmentId);
    const locationName = getLocationName(departmentId, locationId);
    return `${departmentName}, ${locationName}`;
  };

  const handleSubmit = (data: FormValues) => {
    if (cartItems.length === 0) {
      toast.error("No hay servicios en el carrito", {
        description: "Debes agregar al menos un servicio para continuar."
      });
      return;
    }
    onSubmit(data);
  };

  const handlePaymentMethodChange = (value: string) => {
    if (value === "now") {
      toast.warning("Método de pago no disponible", {
        description: "Momentáneamente esta forma de pago no está disponible."
      });
      return;
    }
    
    if (value === "later") {
      form.setValue("paymentMethod", value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">Datos Personales</h3>
        <p className="text-muted-foreground">Completa tus datos para finalizar</p>
      </div>

      <Accordion type="single" collapsible className="mb-6 border rounded-md">
        <AccordionItem value="order-summary">
          <AccordionTrigger className="px-4 py-2">
            <div className="flex items-center gap-2">
              <ClipboardList size={18} />
              <span>Ver resumen del pedido</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-2 space-y-4">
            <div className="space-y-2">
              <h4 className="font-medium">Servicios y ubicaciones</h4>
              {Object.entries(groupServicesByLocation(cartItems)).map(([locationKey, items], index) => {
                const [departmentId, locationId] = locationKey.split('-');
                const locationLabel = locationKey !== 'no-location' ? 
                  getLocationLabel(departmentId, locationId) : 
                  'Ubicación no especificada';

                return (
                  <div key={index} className="text-sm">
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin size={12} className="text-primary" />
                      <span className="font-medium">{locationLabel}</span>
                    </div>
                    <div className="pl-4 border-l-2 border-gray-100 space-y-1">
                      {items.map(item => (
                        <div key={item.id} className="text-sm">
                          <span className="text-muted-foreground">
                            {item.serviceCategory}: {item.name} x{item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Fecha y hora</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(selectedDate)} - {selectedTimeSlot || "No seleccionada"}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Productos seleccionados</h4>
              <ul className="text-sm space-y-1">
                {cartItems.map(item => (
                  <li key={item.id} className="flex justify-between">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-medium pt-2 border-t mt-2">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre y apellido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="Teléfono de contacto" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo electrónico</FormLabel>
                <FormControl>
                  <Input placeholder="tu@email.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Calle</FormLabel>
                  <FormControl>
                    <Input placeholder="Nombre de la calle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input placeholder="Número de puerta" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="corner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Esquina</FormLabel>
                  <FormControl>
                    <Input placeholder="Esquina (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="apartment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apartamento</FormLabel>
                  <FormControl>
                    <Input placeholder="Apto (opcional)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentarios adicionales</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Instrucciones adicionales para el técnico" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Forma de pago</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={handlePaymentMethodChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="later" id="payment-later" />
                      <Label htmlFor="payment-later" className="flex items-center gap-2">
                        Pagar después (directo al profesional)
                        <Banknote size={18} className="text-green-500" />
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="now" id="payment-now" disabled={true} />
                      <Label 
                        htmlFor="payment-now" 
                        className="flex items-center gap-2 opacity-50 cursor-not-allowed"
                      >
                        Pagar ahora (Mercado Pago)
                        <CreditCard size={18} className="text-sky-500" />
                        <AlertCircle size={16} className="text-amber-500" />
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="termsAccepted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    id="terms"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel htmlFor="terms" className="text-sm font-normal">
                    Acepto los{" "}
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <span className="text-primary hover:underline cursor-pointer">
                          términos y condiciones
                        </span>
                      </HoverCardTrigger>
                      <HoverCardContent className="text-xs">
                        <p>Al contratar nuestros servicios, aceptas nuestros términos y condiciones, que incluyen:</p>
                        <ul className="list-disc pl-4 mt-2 space-y-1">
                          <li>Política de cancelación</li>
                          <li>Política de privacidad</li>
                          <li>Condiciones de servicio</li>
                        </ul>
                      </HoverCardContent>
                    </HoverCard>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <div className="flex justify-between gap-4 pt-4 pb-6">
            <Button type="button" variant="outline" onClick={onPrevious}>
              Anterior
            </Button>
            <Button type="submit" className="bg-primary">
              Contratar Servicio
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfoStep;
