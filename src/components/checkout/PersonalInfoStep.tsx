
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  RadioGroup, 
  RadioGroupItem 
} from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { User, ClipboardList, CreditCard, Banknote, MapPin } from "lucide-react";
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
import { GeneralTermsModal } from "@/components/ui/general-terms-modal";
import { useParams } from "react-router-dom";

// Create conditional schema based on payment methods availability
const createFormSchema = (paymentMethodsDisabled: boolean) => z.object({
  name: z.string().min(2, { message: "El nombre es obligatorio" }),
  phone: z.string().min(8, { message: "El teléfono debe tener al menos 8 dígitos" }),
  email: z.string().optional(),
  street: z.string().min(2, { message: "La calle es obligatoria" }),
  number: z.string().min(1, { message: "El número es obligatorio" }),
  corner: z.string().optional(),
  apartment: z.string().optional(),
  comments: z.string().optional(),
  paymentMethod: paymentMethodsDisabled 
    ? z.string().optional() 
    : z.enum(["later", "now"], {
        required_error: "Selecciona un método de pago",
      }),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
});

type FormValues = {
  name: string;
  phone: string;
  email?: string;
  street: string;
  number: string;
  corner?: string;
  apartment?: string;
  comments?: string;
  paymentMethod?: "later" | "now";
  termsAccepted: boolean;
};

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
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [paymentMethodsDisabled, setPaymentMethodsDisabled] = useState(false);
  const { commerceId } = useParams();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(createFormSchema(paymentMethodsDisabled)),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      street: "",
      number: "",
      corner: "",
      apartment: "",
      comments: "",
      paymentMethod: undefined,
      termsAccepted: undefined as any,
    },
  });

  // Check payment provider default when commerceId is present
  useEffect(() => {
    const checkPaymentProvider = async () => {
      if (commerceId) {
        try {
          const response = await fetch(`http://109.199.100.16/AlmangoXV1NETFramework/WebAPI/ObtenerProveedorPagoDefault?Proveedorid=${commerceId}`);
          if (response.ok) {
            const result = await response.json();
            console.log("Payment provider result:", result);
            
            // Only disable if the result is specifically false
            if (result === false) {
              setPaymentMethodsDisabled(true);
              form.setValue("paymentMethod", undefined);
            } else {
              setPaymentMethodsDisabled(false);
            }
          }
        } catch (error) {
          console.error("Error checking payment provider:", error);
          // On error, don't disable payment methods
          setPaymentMethodsDisabled(false);
        }
      } else {
        // If no commerceId, enable payment methods
        setPaymentMethodsDisabled(false);
      }
    };

    checkPaymentProvider();
  }, [commerceId, form]);

  // Update form validation when paymentMethodsDisabled changes
  useEffect(() => {
    const currentValues = form.getValues();
    form.reset(currentValues);
  }, [paymentMethodsDisabled, form]);

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

  const showPaymentWarning = () => {
    toast.warning("Método de pago no disponible", {
      description: "Momentáneamente esta forma de pago no está disponible."
    });
  };

  const handlePaymentMethodChange = (value: string) => {
    // Prevent any selection when payment methods are disabled
    if (paymentMethodsDisabled) {
      showPaymentWarning();
      return;
    }
    
    if (value === "later" || value === "now") {
      form.setValue("paymentMethod", value);
    }
  };

  const handleOpenTermsModal = () => {
    setIsTermsModalOpen(true);
  };

  // Format price with thousands separator (dot) and no decimals
  const formatPrice = (price: number): string => {
    return price.toLocaleString('es-UY', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <User className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">Datos Personales</h3>
        <p className="text-muted-foreground">Completa tus datos para finalizar</p>
      </div>

      {/* ... keep existing code (Accordion with order summary) */}
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
                    <span className="font-medium">${formatPrice(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between font-medium pt-2 border-t mt-2">
                <span>Total</span>
                <span>${formatPrice(total)}</span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* ... keep existing code (all form fields except payment method) */}
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
                <FormLabel>Correo electrónico (opcional)</FormLabel>
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
                    <Input placeholder="Intersección más cercana" {...field} />
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
                <FormLabel>Comentarios</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="¿Hay algo más que debamos saber?" 
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
                    value={paymentMethodsDisabled ? undefined : field.value}
                    className="flex flex-col space-y-1"
                  >
                    <div 
                      className={`flex items-center space-x-2 ${paymentMethodsDisabled ? 'pointer-events-none cursor-not-allowed' : ''}`}
                      onClick={paymentMethodsDisabled ? showPaymentWarning : undefined}
                    >
                      <RadioGroupItem 
                        value="later" 
                        id="payment-later"
                        disabled={paymentMethodsDisabled}
                        className={paymentMethodsDisabled ? 'opacity-30 border-gray-300' : ''}
                      />
                      <Label 
                        htmlFor="payment-later" 
                        className={`flex items-center gap-2 ${paymentMethodsDisabled ? 'opacity-30 cursor-not-allowed text-gray-400' : ''}`}
                      >
                        Pagar después (al profesional)
                        <Banknote size={18} className={paymentMethodsDisabled ? 'text-gray-300' : 'text-green-500'} />
                      </Label>
                    </div>
                    <div 
                      className={`flex items-center space-x-2 ${paymentMethodsDisabled ? 'pointer-events-none cursor-not-allowed' : ''}`}
                      onClick={paymentMethodsDisabled ? showPaymentWarning : undefined}
                    >
                      <RadioGroupItem 
                        value="now" 
                        id="payment-now"
                        disabled={paymentMethodsDisabled}
                        className={paymentMethodsDisabled ? 'opacity-30 border-gray-300' : ''}
                      />
                      <Label 
                        htmlFor="payment-now" 
                        className={`flex items-center gap-2 ${paymentMethodsDisabled ? 'opacity-30 cursor-not-allowed text-gray-400' : ''}`}
                      >
                        Pagar ahora (Mercado Pago)
                        <CreditCard size={18} className={paymentMethodsDisabled ? 'text-gray-300' : 'text-sky-500'} />
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                {paymentMethodsDisabled && (
                  <p className="text-sm text-muted-foreground">
                    Las formas de pago no están disponibles para este proveedor.
                  </p>
                )}
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
                    <span 
                      className="text-primary hover:underline cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        handleOpenTermsModal();
                      }}
                    >
                      términos y condiciones
                    </span>
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
      
      <GeneralTermsModal 
        isOpen={isTermsModalOpen} 
        onClose={() => setIsTermsModalOpen(false)} 
      />
    </div>
  );
};

export default PersonalInfoStep;
