
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

interface ServiceCard {
  id: number;
  nombre: string;
  descripcion: string;
  imagen: string;
}

// Mock data for when API fails
const mockServices: ServiceCard[] = [
  {
    id: 1,
    nombre: "Plomería",
    descripcion: "Servicios profesionales de plomería",
    imagen: "https://almango.com.uy/img/iconos/icono-plomeria.png"
  },
  {
    id: 2,
    nombre: "Electricidad",
    descripcion: "Instalaciones y reparaciones eléctricas",
    imagen: "https://almango.com.uy/img/iconos/icono-electricidad.png"
  },
  {
    id: 3,
    nombre: "Herrería",
    descripcion: "Servicios de herrería y cerrajería",
    imagen: "https://almango.com.uy/img/iconos/icono-herreria.png"
  },
  {
    id: 4,
    nombre: "Carpintería",
    descripcion: "Trabajos profesionales de carpintería",
    imagen: "https://almango.com.uy/img/iconos/icono-carpinteria.png"
  },
  {
    id: 5,
    nombre: "Limpieza",
    descripcion: "Servicios de limpieza profesional",
    imagen: "https://almango.com.uy/img/iconos/icono-limpieza.png"
  },
  {
    id: 6,
    nombre: "Pintura",
    descripcion: "Servicios profesionales de pintura",
    imagen: "https://almango.com.uy/img/iconos/icono-pintura.png"
  }
];

const ServiceCardsGrid = () => {
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Attempt to fetch services from the API
        const response = await fetch('https://almango.com.uy/api/Clientes/GetTarjetasServicios');
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const data = await response.json();
        setServices(data);
      } catch (err) {
        console.error('Error fetching services:', err);
        
        // Use mock data as fallback
        setServices(mockServices);
        
        // Show a toast notification
        toast({
          title: "No se pudieron cargar servicios desde el servidor",
          description: "Mostrando servicios de ejemplo",
          variant: "default",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  const handleServiceClick = (serviceId: number) => {
    navigate(`/servicios?id=${serviceId}`);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 -mt-10 z-10 relative px-4">
        {[...Array(6)].map((_, index) => (
          <Card key={`skeleton-${index}`} className="bg-white/90 shadow-md hover:shadow-lg transition-all duration-300 h-40 animate-pulse">
            <CardContent className="p-4 flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 bg-gray-200 rounded-md mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 -mt-10 z-10 relative px-4">
      {services.map((service) => (
        <Card 
          key={service.id}
          onClick={() => handleServiceClick(service.id)}
          className="bg-white/90 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 h-40"
        >
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <img 
              src={service.imagen} 
              alt={service.nombre} 
              className="w-16 h-16 object-contain mb-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://almango.com.uy/img/iconos/icono-almango-01.png"; // Default image
              }}
            />
            <h3 className="text-sm font-medium text-center text-gray-800">{service.nombre}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ServiceCardsGrid;
