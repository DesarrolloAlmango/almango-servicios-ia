import React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import MercadoPagoIcon from "@/components/ui/mercado-pago-icon";

interface PersonalInfoStepProps {
  onPrevious: () => void;
  onSubmit: (data: any) => void;
  cartItems: any[];
  total: number;
  selectedDate: Date | undefined;
  selectedTimeSlot: string;
  selectedDepartment: string;
  selectedLocation: string;
  departments: { id: string; name: string }[];
  municipalities: Record<string, { id: string; name: string }[]>;
}

const formSchema = z.object({
  name: z.string().min(2, {
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  phone: z.string().min(8, {
    message: "El teléfono debe tener al menos 8 caracteres.",
  }),
  email: z.string().email({
    message: "Por favor, introduce un email válido.",
  }).optional().or(z.literal("")),
  street: z.string().min(2, {
    message: "La calle debe tener al menos 2 caracteres.",
  }),
  number: z.string().min(1, {
    message: "El número debe tener al menos 1 caracter.",
  }),
  apartment: z.string().optional().or(z.literal("")),
  corner: z.string().optional().or(z.literal("")),
  paymentMethod: z.enum(["now", "later"], {
    required_error: "Debes seleccionar un método de pago.",
  }),
  comments: z.string().optional().or(z.literal("")),
  department: z.string().optional(),
  municipality: z.string().optional(),
});

const PersonalInfoStep = ({ 
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
}: PersonalInfoStepProps) => {
  const nextButtonRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      street: "",
      number: "",
      apartment: "",
      corner: "",
      paymentMethod: "now",
      comments: "",
      department: selectedDepartment || "",
      municipality: selectedLocation || "",
    },
  });

  const { isValid } = form.formState;

  const submitData = (values: z.infer<typeof formSchema>) => {
    if (!selectedDate) {
      toast.error("Por favor, selecciona una fecha.");
      return;
    }

    if (!selectedTimeSlot) {
      toast.error("Por favor, selecciona un horario.");
      return;
    }

    const formattedDate = format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: es });
    const formattedTime = selectedTimeSlot;

    const confirmMessage = `
      Confirmar datos:
      Fecha: ${formattedDate}
      Hora: ${formattedTime}
      Total: $${total.toLocaleString('es-UY', { maximumFractionDigits: 0 })}
      
      ¿Deseas confirmar la solicitud?
    `;

    if (window.confirm(confirmMessage)) {
      onSubmit(values);
    } else {
      toast.warning("Solicitud cancelada.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold">Información Personal</h3>
        <p className="text-muted-foreground">
          Completa tus datos para finalizar la compra
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(submitData)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre Completo</FormLabel>
                <FormControl>
                  <Input placeholder="Ingresa tu nombre" {...field} />
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
                  <Input placeholder="Ingresa tu teléfono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingresa tu email"
                    {...field}
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="street"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Calle</FormLabel>
                  <FormControl>
                    <Input placeholder="Calle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="number"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Número</FormLabel>
                  <FormControl>
                    <Input placeholder="Número" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-4">
            <FormField
              control={form.control}
              name="apartment"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Apartamento (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Apartamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="corner"
              render={({ field }) => (
                <FormItem className="w-1/2">
                  <FormLabel>Esquina (opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Esquina" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {departments.length > 0 && municipalities && (
            <>
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Departamento</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecciona un departamento" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.getValues("department") && municipalities[form.getValues("department")] && (
                <FormField
                  control={form.control}
                  name="municipality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Municipio</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un municipio" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {municipalities[form.getValues("department")].map((municipality) => (
                            <SelectItem key={municipality.id} value={municipality.id}>
                              {municipality.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </>
          )}

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Método de Pago</FormLabel>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="now" />
                    </FormControl>
                    <FormLabel className="font-normal">Pagar ahora</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="later" />
                    </FormControl>
                    <FormLabel className="font-normal">Pagar al finalizar el servicio</FormLabel>
                  </FormItem>
                </RadioGroup>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="comments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comentarios (opcional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ingresa tus comentarios"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-between pt-4 mb-8" ref={nextButtonRef}>
            <Button 
              variant="outline"
              onClick={onPrevious} 
              className="mr-4"
            >
              Anterior
            </Button>
            <div className="flex items-center gap-2">
              <MercadoPagoIcon className="w-16 h-16" />
              <Button 
                onClick={form.handleSubmit(submitData)} 
                disabled={!isValid}
              >
                Pagar ahora
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default PersonalInfoStep;
