import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ServiceCard from '../components/ServiceCard';
import PurchaseLocationModal from '../components/PurchaseLocationModal';
import { Button } from "../components/ui/button";
import { ArrowLeft, Search, X } from "lucide-react";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { AspectRatio } from "../components/ui/aspect-ratio";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  icon: string;
  url: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  serviceCategory: string;
  serviceId?: string;
  categoryId?: string;
  productId?: string;
  departmentId?: string;
  locationId?: string;
  textosId?: string | null;
}

// Mock data for when API fails
const mockServices: Service[] = [
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
const mockMudanzaServices: Service[] = [
  {
    id: "1111",
    name: "Mudanza",
    icon: "https://tn.com.ar/resizer/v2/en-febrero-hacer-una-mudanza-en-el-amba-puede-costar-hasta-500000-foto-blogdeseguroscom-R76YF6LYRVFEHIWDAB5QT4S2EM.png?auth=0e45d37cfd3288d80391fb141181b48361378c8617a55a19aed4d0348d10ac9a&width=1440",
    url: "https://app.almango.com.uy/mudanza.aspx?Mode=INS&MudanzaId=0&ProveedorId=0&SecUserId=0"
  }
];

const Servicios = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [pendingCategoryName, setPendingCategoryName] = useState<string | null>(null);
  const { toast } = useToast();
  const initialRender = useRef(true);

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
        let servicesData: Service[] = [];
        let mudanzaServicesData: Service[] = [];

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

  useEffect(() => {
    if (location.state?.clickedService) {
      const serviceName = location.state.clickedService;
      console.log('Service clicked from home:', serviceName);
      
      const matchingService = services.find(service => 
        service.name.toLowerCase() === serviceName.toLowerCase()
      );
      
      if (matchingService) {
        console.log('Found matching service:', matchingService);
        setSelectedService(matchingService);
        setShowLocationModal(true);
      }
      
      // Clear the state after processing
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, services, navigate]);

  useEffect(() => {
    // Listen for the custom event
    document.addEventListener('openCategory', handleOpenCategoryEvent);

    // Cleanup the event listener when the component unmounts
    return () => {
      document.removeEventListener('openCategory', handleOpenCategoryEvent);
    };
  }, []);

  const handleOpenCategoryEvent = (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('Received openCategory event:', customEvent.detail);

    // Extract data from the event detail
    const { serviceId, categoryId, categoryName } = customEvent.detail;

    // Find the service by ID
    const service = services.find(s => s.id === serviceId);

    if (service) {
      console.log('Found service:', service);
      setSelectedService(service);
      setPendingCategoryId(categoryId);
      setPendingCategoryName(categoryName);
      setShowLocationModal(true);
    } else {
      console.log('Service not found');
    }
  };

  const handleServiceSelect = (service) => {
    setSelectedService(service);
    setShowLocationModal(true);
  };

  const handleLocationConfirm = (location: any) => {
    console.log("Location confirmed:", location);
    setShowLocationModal(false);
  };

  const handleCategorySelect = (serviceId, categoryId, categoryName) => {
    console.log("Category selected:", { serviceId, categoryId, categoryName });
    setPendingCategoryId(categoryId);
    setPendingCategoryName(categoryName);
  };

  const addToCart = (item) => {
    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(i => i.id === item.id);

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        return updatedItems;
      } else {
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
    toast({
      title: "Producto agregado al carrito",
      description: `${item.name} se ha agregado al carrito.`,
    });
  };

  const handleGoBack = () => {
    navigate('/');
  };

  const filteredServices = searchTerm
    ? services.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : services;

  if (loading) {
    return <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-24 bg-[#F0F0F0] relative z-[100]">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 -mt-24 relative justify-center">
          {[...Array(6)].map((_, index) => (
            <Card key={`skeleton-${index}`} className="bg-white/90 shadow-md hover:shadow-lg transition-all duration-300 h-40 animate-pulse w-full max-w-md mx-auto">
              <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                <div className="w-16 h-16 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header section */}
      <div className="bg-secondary text-white py-4 shadow-md">
        <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-24 flex items-center justify-between">
          <Button variant="ghost" onClick={handleGoBack} className="hover:bg-gray-700 text-white">
            <ArrowLeft className="mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-center">Servicios</h1>
          <div>
            {/* Add any additional header content here */}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 sm:px-8 md:px-12 lg:px-24 py-8">
        
        {/* Search section */}
        <div className="mb-8">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar un servicio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Services grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredServices.map(service => (
            <ServiceCard
              key={service.id}
              id={service.id}
              name={service.name}
              icon={service.icon}
              addToCart={addToCart}
              onCategorySelect={handleCategorySelect}
              forceOpen={selectedService?.id === service.id}
              currentCartItems={cartItems}
              pendingCategoryId={pendingCategoryId}
              pendingCategoryName={pendingCategoryName}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <PurchaseLocationModal
        isOpen={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          setSelectedService(null);
          setPendingCategoryId(null);
          setPendingCategoryName(null);
        }}
        service={selectedService}
      />
      {selectedService && (
        <ServiceCard
          id={selectedService.id}
          name={selectedService.name}
          icon={selectedService.icon}
          addToCart={addToCart}
          onCategorySelect={handleCategorySelect}
          forceOpen={showLocationModal}
          purchaseLocation={null}
          circular={false}
          currentCartItems={cartItems}
          pendingCategoryId={pendingCategoryId}
          pendingCategoryName={pendingCategoryName}
        />
      )}
    </div>
  );
};

export default Servicios;
