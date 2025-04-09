
import { useQuery } from "@tanstack/react-query";
import { TarjetaServicio } from "@/types/service";
import { toast } from "sonner";

const fallbackServices: TarjetaServicio[] = [
  { id: "elec-1", name: "Electricidades", icon: "Zap" },
  { id: "plum-2", name: "Plomería", icon: "Droplets" },
  { id: "cerr-3", name: "Cerrajería", icon: "Home" },
  { id: "clim-4", name: "Climatización", icon: "Wind" },
  { id: "mudz-5", name: "Mudanzas", icon: "Truck" },
  { id: "paqt-6", name: "Paquetería", icon: "Package" },
  { id: "baby-7", name: "Cuidado Infantil", icon: "Baby" }
];

const fetchTarjetasServicios = async (): Promise<TarjetaServicio[]> => {
  try {
    // Use the proxy to avoid CORS issues
    const response = await fetch(
      "/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios",{
        "headers": {
          "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-language": "es-ES,es;q=0.9",
        },
        "method": "GET"
      }
    );
    
    if (!response.ok) {
      throw new Error("Error al obtener las tarjetas de servicios");
    }
    
    const data = await response.json();
    console.log("API Response:", data); // Log the full API response for testing
    return JSON.parse(data.SDTTarjetasServiciosJson);
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export function useServicesData() {
  const {
    data: services,
    isLoading,
    isError,
    error
  } = useQuery<TarjetaServicio[], Error>({
    queryKey: ["tarjetasServicios"],
    queryFn: fetchTarjetasServicios,
    meta: {
      onError: (error: Error) => {
        console.error("Error en la consulta:", error);
        toast.error("No se pudieron cargar los servicios. Mostrando datos locales.");
      }
    }
  });

  return {
    services,
    isLoading,
    isError,
    error,
    displayedServices: isError ? fallbackServices : services,
    fallbackServices
  };
}
