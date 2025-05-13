
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";

interface ServiceCard {
  id: string;
  name: string;
  icon: string;
  url: string;
}

// Mock data for when API fails
const mockServices: ServiceCard[] = [
  {
    id: "1",
    name: "Armado de Muebles",
    icon: "https://roble.store/cdn/shop/articles/NordicStory_mueble_flotante_aparador_de_pared_comoda_mueble_de_TV_madera_maciza_roble_diseno_nordico_escandinavo_moderno_13_3024x.jpg?v=1662470702",
    url: ""
  },
  {
    id: "3333",
    name: "Aire Libre",
    icon: "https://graniteliquidators.com/wp-content/uploads/2017/03/3359339afae91e1d7fe16fad86e028849ed1db81.jpg",
    url: ""
  },
  {
    id: "7",
    name: "Decohogar",
    icon: "https://content.elmueble.com/medio/2024/10/29/un-estante-de-lado-a-lado-para-exponer-cuadros_22e02709_241029102653_900x900.webp",
    url: ""
  },
  {
    id: "9",
    name: "Equipo Sanitario, Baño y Cocina",
    icon: "https://blog.decorcenter.pe/wp-content/uploads/2022/05/portada-como-decorar-un-bano-de-visitas-moderno.jpg",
    url: ""
  },
  {
    id: "10",
    name: "Instalación de Electrodomésticos",
    icon: "https://serviciotecnicotrivino.com.ar/wp-content/uploads/2022/03/11-mitos-768x472.jpg",
    url: ""
  },
  {
    id: "3",
    name: "Aire Acondicionado",
    icon: "https://services.meteored.com/img/article/ola-de-calor-disipador-de-agua-para-que-tu-aire-acondicionado-no-gotee-pronostico-1673072259870_1024.jpg",
    url: ""
  }
];

// Mock data for mudanza (separate endpoint)
const mockMudanzaServices: ServiceCard[] = [
  {
    id: "1111",
    name: "Mudanza",
    icon: "https://tn.com.ar/resizer/v2/en-febrero-hacer-una-mudanza-en-el-amba-puede-costar-hasta-500000-foto-blogdeseguroscom-R76YF6LYRVFEHIWDAB5QT4S2EM.png?auth=0e45d37cfd3288d80391fb141181b48361378c8617a55a19aed4d0348d10ac9a&width=1440",
    url: "https://app.almango.com.uy/mudanza.aspx?Mode=INS&MudanzaId=0&ProveedorId=0&SecUserId=0"
  }
];

const ServiceCardsGrid = () => {
  const [services, setServices] = useState<ServiceCard[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      try {
        // Use the API endpoint that's working based on the network logs
        const response = await fetch('/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios');
        const mudanzaResponse = await fetch('/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios2');
        
        if (!response.ok || !mudanzaResponse.ok) {
          throw new Error(`HTTP error! Status: ${!response.ok ? response.status : mudanzaResponse.status}`);
        }
        
        // Parse the data format from the API
        const responseData = await response.json();
        const mudanzaData = await mudanzaResponse.json();
        
        console.info('Datos de la API sin procesar:', responseData);
        console.info('Datos de mudanza sin procesar:', mudanzaData);
        
        // Extract the services from the JSON strings
        let servicesData: ServiceCard[] = [];
        let mudanzaServicesData: ServiceCard[] = [];
        
        if (responseData?.SDTTarjetasServiciosJson) {
          servicesData = JSON.parse(responseData.SDTTarjetasServiciosJson);
          console.info('Datos de servicios parseados:', servicesData);
        }
        
        if (mudanzaData?.SDTTarjetasServiciosJson) {
          mudanzaServicesData = JSON.parse(mudanzaData.SDTTarjetasServiciosJson);
          console.info('Datos de servicios de mudanza parseados:', mudanzaServicesData);
        }
        
        // Combine both types of services
        setServices([...servicesData, ...mudanzaServicesData]);
      } catch (err) {
        console.error('Error fetching services:', err);
        
        // Use mock data as fallback
        setServices([...mockServices, ...mockMudanzaServices]);
        
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

  const handleServiceClick = (serviceId: string) => {
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
              src={service.icon} 
              alt={service.name} 
              className="w-16 h-16 object-contain mb-2"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://almango.com.uy/img/iconos/icono-almango-01.png"; // Default image
              }}
            />
            <h3 className="text-sm font-medium text-center text-gray-800">{service.name}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ServiceCardsGrid;
