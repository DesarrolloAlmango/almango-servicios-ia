import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { User, ClipboardList, CreditCard, Banknote } from "lucide-react";
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
    const departments: Record<string, string> = {
      "1": "Montevideo",
      "2": "Canelones",
      "3": "Maldonado"
    };
    return departments[departmentId] || departmentId;
  };

  const getLocationName = (departmentId: string, locationId: string) => {
    const locations: Record<string, Record<string, string>> = {
      "1": {
        "1-1": "Centro",
        "1-2": "Pocitos",
        "1-3": "Carrasco"
      },
      "2": {
        "2-1": "Ciudad de la Costa",
        "2-2": "Las Piedras",
        "2-3": "Pando"
      },
      "3": {
        "3-1": "Punta del Este",
        "3-2": "Maldonado",
        "3-3": "San Carlos"
      }
    };
    return locations[departmentId]?.[locationId] || locationId;
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
              <h4 className="font-medium">Ubicación</h4>
              <p className="text-sm text-muted-foreground">
                {getDepartmentName(selectedDepartment)}, {getLocationName(selectedDepartment, selectedLocation)}
              </p>
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                    onValueChange={field.onChange}
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
                      <RadioGroupItem value="now" id="payment-now" />
                      <Label htmlFor="payment-now" className="flex items-center gap-2">
                        Pagar ahora (Mercado Pago)
                        <CreditCard size={18} className="text-sky-500" />
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

          <div className="flex justify-between gap-4 pt-4">
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
