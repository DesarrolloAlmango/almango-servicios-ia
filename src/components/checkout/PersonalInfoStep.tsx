
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

// Create base schema without paymentMethod
const baseFormSchema = z.object({
  name: z.string().min(2, { message: "El nombre es obligatorio" }),
  phone: z.string().min(8, { message: "El teléfono debe tener al menos 8 dígitos" }),
  email: z.string().optional(),
  street: z.string().min(2, { message: "La calle es obligatoria" }),
  number: z.string().min(1, { message: "El número es obligatorio" }),
  corner: z.string().optional(),
  apartment: z.string().optional(),
  comments: z.string().optional(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: "Debes aceptar los términos y condiciones" }),
  }),
});

// Function to create schema based on payment availability
const createFormSchema = (paymentEnabled: boolean) => {
  if (paymentEnabled) {
    return baseFormSchema.extend({
      paymentMethod: z.enum(["later", "now"], {
        required_error: "Selecciona un método de pago",
      }),
    });
  } else {
    return baseFormSchema.extend({
      paymentMethod: z.enum(["later", "now"]).optional(),
    });
  }
};

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

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
  const [paymentEnabled, setPaymentEnabled] = useState(true);
  const [isLoadingPaymentStatus, setIsLoadingPaymentStatus] = useState(false);
  const { commerceId } = useParams();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(createFormSchema(paymentEnabled)),
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

  // Update form resolver when payment availability changes
  useEffect(() => {
    const currentValues = form.getValues();
    const newSchema = createFormSchema(paymentEnabled);
    
    // Reset the form with new resolver
    form.reset(currentValues);
    
    // Manually update the resolver by recreating the form configuration
    const newResolver = zodResolver(newSchema);
    (form as any)._resolver = newResolver;
    
    if (!paymentEnabled) {
      // Clear payment method selection if payment is disabled
      form.setValue("paymentMethod", undefined as any);
    }
  }, [paymentEnabled, form]);

  useEffect(() => {
    const checkPaymentAvailability = async () => {
      // Only execute the endpoint call if commerceId is present
      if (!commerceId) {
        console.log("No commerce ID found, payment methods remain enabled");
        setPaymentEnabled(true);
        return;
      }

      setIsLoadingPaymentStatus(true);
      try {
        const response = await fetch(
          `https://app.almango.com.uy/WebAPI/ObtenerProveedorPagoDefault?Proveedorid=${commerceId}`
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch payment status');
        }
        
        const responseData = await response.json();
        console.log("Payment availability response:", responseData);
        
        // Handle both response formats: direct boolean or {"Boolean": boolean}
        const paymentAvailable = responseData.Boolean !== undefined ? responseData.Boolean : responseData;
        console.log("Payment available:", paymentAvailable);
        
        setPaymentEnabled(paymentAvailable === true);
        
        if (paymentAvailable === false) {
          // Clear payment method selection if payment is disabled
          form.setValue("paymentMethod", undefined as any);
        }
      } catch (error) {
        console.error("Error checking payment availability:", error);
        toast.error("Error al verificar disponibilidad de pagos");
        // Keep payment enabled on error
        setPaymentEnabled(true);
      } finally {
        setIsLoadingPaymentStatus(false);
      }
    };

    checkPaymentAvailability();
  }, [commerceId, form]);

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

    // Only validate payment method if payment is enabled
    if (paymentEnabled && !data.paymentMethod) {
      toast.error("Método de pago requerido", {
        description: "Debes seleccionar un método de pago para continuar."
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
    if (!paymentEnabled) return;
    
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
          {/* ... keep existing code (form fields for name, phone, email, address, comments) */}
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

          {paymentEnabled && (
            <FormField
              control={form.control}
              name="paymentMethod"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Forma de pago</FormLabel>
                  {isLoadingPaymentStatus ? (
                    <div className="text-sm text-muted-foreground">
                      Verificando disponibilidad de pagos...
                    </div>
                  ) : (
                    <FormControl>
                      <RadioGroup
                        onValueChange={handlePaymentMethodChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="later" 
                            id="payment-later"
                          />
                          <Label 
                            htmlFor="payment-later" 
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            Pagar después (al profesional)
                            <Banknote size={18} className="text-green-500" />
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem 
                            value="now" 
                            id="payment-now"
                          />
                          <Label 
                            htmlFor="payment-now" 
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            Pagar ahora (Mercado Pago)
                            <CreditCard size={18} className="text-sky-500" />
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

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
