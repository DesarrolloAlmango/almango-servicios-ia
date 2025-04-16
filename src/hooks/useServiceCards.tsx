
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface Service {
  id: string;
  name: string;
  icon: string;
}

export const useServiceCards = (endpointSuffix: string = "") => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const endpoint = endpointSuffix 
          ? `/api/AlmangoXV1NETFramework/WebAPI/GetTarjetasServicios${endpointSuffix}` 
          : "/api/AlmangoXV1NETFramework/WebAPI/GetTarjetasServicios";
          
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          throw new Error(`Error al cargar servicios: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Make sure data is an array before mapping
        if (Array.isArray(data)) {
          const transformedServices = data.map((service: any) => ({
            id: service.id || service.Nivel0Id || "",
            name: service.name || service.Nivel0Descripcion || "Servicio",
            icon: service.image || service.Imagen || "",
          }));
          
          setServices(transformedServices);
        } else {
          console.error("Data is not an array:", data);
          setServices([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
        toast.error("Error al cargar servicios");
        console.error("Error fetching services:", err);
        // Set empty array on error to prevent undefined
        setServices([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchServices();
  }, [endpointSuffix]);

  return { services, isLoading, error };
};
