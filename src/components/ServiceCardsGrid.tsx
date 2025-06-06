
import { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
  }, {
    id: "3333",
    name: "Aire Libre",
    icon: "https://graniteliquidators.com/wp-content/uploads/2017/03/3359339afae91e1d7fe16fad86e028849ed1db81.jpg",
    url: ""
  }, {
    id: "7",
    name: "Decohogar",
    icon: "https://content.elmueble.com/medio/2024/10/29/un-estante-de-lado-a-lado-para-exponer-cuadros_22e02709_241029102653_900x900.webp",
    url: ""
  }, {
    id: "9",
    name: "Equipo Sanitario, Baño y Cocina",
    icon: "https://blog.decorcenter.pe/wp-content/uploads/2022/05/portada-como-decorar-un-bano-de-visitas-moderno.jpg",
    url: ""
  }, {
    id: "10",
    name: "Instalación de Electrodomésticos",
    icon: "https://serviciotecnicotrivino.com.ar/wp-content/uploads/2022/03/11-mitos-768x472.jpg",
    url: ""
  }, {
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
        const response = await fetch('https://app.almango.com.uy/WebAPI/GetTarjetasServicios');
        const mudanzaResponse = await fetch('https://app.almango.com.uy/WebAPI/GetTarjetasServicios2');
        
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

        // Reorder services: put mudanza service in position 2 (index 1)
        const reorderedServices = [...servicesData];
        if (mudanzaServicesData.length > 0) {
          // Insert mudanza service at position 1 (second position)
          reorderedServices.splice(1, 0, ...mudanzaServicesData);
        }

        setServices(reorderedServices);
      } catch (err) {
        console.error('Error fetching services:', err);

        // Use mock data as fallback with same reordering logic
        const reorderedMockServices = [...mockServices];
        reorderedMockServices.splice(1, 0, ...mockMudanzaServices);
        
        setServices(reorderedMockServices);
        toast({
          title: "No se pudieron cargar servicios desde el servidor",
          description: "Mostrando servicios de ejemplo",
          variant: "default"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [toast]);

  const handleServiceClick = (serviceId: string, serviceName: string) => {
    // Crear evento personalizado para categoría seleccionada
    // Esto permite que otros componentes puedan reaccionar
    if (window.lastSelectedCategoryId && window.lastSelectedCategoryName) {
      // Si hay una categoría seleccionada anteriormente, la recordamos
      const openCategoryEvent = new CustomEvent('openCategory', {
        detail: {
          serviceId: serviceId,
          categoryId: window.lastSelectedCategoryId,
          categoryName: window.lastSelectedCategoryName
        }
      });
      
      // Almacenar en ventana global para otros componentes
      window.lastSelectedServiceId = serviceId;
      
      // Disparar después de navegar para que los componentes estén listos
      setTimeout(() => {
        document.dispatchEvent(openCategoryEvent);
        console.log('Dispatched openCategory event with:', {
          serviceId,
          categoryId: window.lastSelectedCategoryId,
          categoryName: window.lastSelectedCategoryName
        });
      }, 500);
    }
    
    // Navigate to services page with the service name as state
    navigate('/servicios', {
      state: {
        clickedService: serviceName
      }
    });
  };

  const handleVerMasClick = () => {
    navigate('/servicios');
  };

  if (loading) {
    return <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-24 bg-[#F0F0F0] relative z-[100]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 -mt-24 relative justify-center">
          {[...Array(6)].map((_, index) => <Card key={`skeleton-${index}`} className="bg-white/90 shadow-md hover:shadow-lg transition-all duration-300 h-40 animate-pulse w-full max-w-md mx-auto">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              </CardContent>
            </Card>)}
        </div>
      </div>;
  }

  // Show only the first 6 services for the home page
  const displayedServices = services.slice(0, 6);

  return <div className="bg-[#F0F0F0] py-8 relative z-[100]">
      <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-24 relative z-[80]">
        {/* Left side rotated "DESTACADOS" text - hidden on medium screens and below */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 translate-y-[10px] -translate-x-10 sm:-translate-x-20 origin-center">
          <p style={{
          whiteSpace: 'nowrap'
        }} className="transform -rotate-90 text-4xl font-bold tracking-widest text-secondary hidden lg:block translate-x-[-15px]">
            DESTACADOS
          </p>
        </div>

        {/* Right side rotated "DESTACADOS" text - hidden on medium screens and below */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-y-[10px] translate-x-10 sm:translate-x-20 origin-center">
          <p style={{
          whiteSpace: 'nowrap'
        }} className="transform rotate-90 text-4xl font-bold tracking-widest text-primary hidden lg:block translate-x-[15px]">
            DESTACADOS
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 -mt-24 relative z-[90] justify-center">
          {displayedServices.map(service => <Card key={service.id} onClick={() => handleServiceClick(service.id, service.name)} className="bg-white/90 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-105 h-40 overflow-hidden w-full max-w-md mx-auto">
              <CardContent className="p-0 flex flex-col items-center justify-center h-full relative">
                {/* Use AspectRatio to maintain image proportions */}
                <AspectRatio ratio={1 / 1} className="w-full h-full">
                  <img src={service.icon} alt={service.name} className="w-full h-full object-cover" onError={e => {
                (e.target as HTMLImageElement).src = "https://almango.com.uy/img/iconos/icono-almango-01.png"; // Default image
              }} />
                  {/* Dark overlay for better text visibility */}
                  <div className="absolute inset-0 bg-black/50"></div>
                </AspectRatio>
                {/* Text positioned over the image with uppercase transformation */}
                <div className="absolute inset-0 flex flex-col items-center justify-center p-3">
                  <h3 className="text-base sm:text-lg font-bold text-center text-white uppercase">{service.name}</h3>
                </div>
              </CardContent>
            </Card>)}
        </div>

        {/* Ver más button */}
        <div className="flex justify-center mt-8">
          <Button 
            onClick={handleVerMasClick}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 text-lg font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
          >
            VER MÁS
          </Button>
        </div>
      </div>
    </div>;
};

// Declare global variables for TypeScript
declare global {
  interface Window {
    lastSelectedCategoryId?: string;
    lastSelectedCategoryName?: string;
    lastSelectedServiceId?: string;
  }
}

export default ServiceCardsGrid;
