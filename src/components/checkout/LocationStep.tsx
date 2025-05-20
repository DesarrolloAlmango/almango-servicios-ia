
import React, { useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface LocationStepProps {
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
  selectedLocation: string;
  setSelectedLocation: (location: string) => void;
  onNext: () => void;
  departments: Array<{
    id: string;
    name: string;
  }>;
  municipalities: Record<string, Array<{
    id: string;
    name: string;
  }>>;
  loading: {
    departments: boolean;
    municipalities: boolean;
  };
  title?: string;
  description?: string;
  buttonText?: string;
  showStoreSection?: boolean;
  storeName?: string;
  categoryId?: string;
}

const LocationStep: React.FC<LocationStepProps> = ({
  selectedDepartment,
  setSelectedDepartment,
  selectedLocation,
  setSelectedLocation,
  onNext,
  departments,
  municipalities,
  loading,
  title = "Lugar de Servicio",
  description = "Selecciona la ubicación donde necesitas el servicio",
  buttonText = "Siguiente",
  showStoreSection = false,
  storeName,
  categoryId
}) => {
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedLocation("");
  };

  const handleLocationChange = (value: string) => {
    setSelectedLocation(value);
  };

  const handleNextWithDelay = () => {
    onNext();
    
    if (categoryId && window.lastSelectedServiceId) {
      console.log("LocationStep: Triggering product price recalculation for category:", categoryId);
      
      const updatePricesEvent = new CustomEvent('updateProductPrices', { 
        detail: { 
          categoryId,
          serviceId: window.lastSelectedServiceId,
          forceRefresh: true,
          timestamp: Date.now(),
          debugEventSource: 'LocationStep' 
        } 
      });
      document.dispatchEvent(updatePricesEvent);
      
      setTimeout(() => {
        const openCategoryEvent = new CustomEvent('openCategory', { 
          detail: { 
            categoryId,
            serviceId: window.lastSelectedServiceId || undefined,
            categoryName: window.lastSelectedCategoryName || undefined,
            forceOpenProducts: true,  // This flag forces the products modal to open
            timestamp: Date.now()
          } 
        });
        document.dispatchEvent(openCategoryEvent);
        
        setTimeout(() => {
          const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
          if (categoryElement) {
            const clickableCard = categoryElement.querySelector('.cursor-pointer');
            if (clickableCard) {
              clickableCard.classList.add('ring-4', 'ring-orange-500', 'scale-110', 'bg-orange-50');
              categoryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              const clickEvent = new MouseEvent('click', {
                bubbles: true,
                cancelable: true,
                view: window
              });
              clickableCard.dispatchEvent(clickEvent);
              
              setTimeout(() => {
                clickableCard.classList.remove('scale-110', 'bg-orange-50');
              }, 2000);
            }
          }
        }, 300);
      }, 500);
    }
  };

  useEffect(() => {
    const handleLocationModalClosed = () => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      dialogs.forEach(dialog => {
        if (dialog.querySelector('.product-grid')) {
          const closeButton = dialog.querySelector('[data-dialog-close]');
          if (closeButton && closeButton instanceof HTMLElement) {
            console.log('LocationStep: Location modal closed without confirming, closing product dialog');
            closeButton.click();
          }
        }
      });
    };

    const handlePriceDebugInfo = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { storeId, serviceId, categoryId, products } = customEvent.detail;
        console.log(`LocationStep received debug info: Store=${storeId}, Service=${serviceId}, Category=${categoryId}`);
        console.log(`Products to fetch prices for:`, products);
        
        toast.info(`Debug: ${products.length} productos encontrados para obtener precios`);
      }
    };
    
    document.addEventListener('priceDebugInfo', handlePriceDebugInfo);
    document.addEventListener('locationModalClosed', handleLocationModalClosed);
    
    return () => {
      document.removeEventListener('priceDebugInfo', handlePriceDebugInfo);
      document.removeEventListener('locationModalClosed', handleLocationModalClosed);
    };
  }, []);

  const currentMunicipalities = selectedDepartment ? municipalities[selectedDepartment] || [] : [];

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 mx-auto text-primary mb-2" />
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>

      {showStoreSection && storeName && (
        <div className="mb-4 p-3 rounded-md bg-blue-50 border border-blue-200">
          <h4 className="font-medium text-blue-700 mb-1">Lugar de compra:</h4>
          <p className="text-blue-600">{storeName}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="department" className="block text-sm font-medium">
            Departamento
          </label>
          <Select 
            value={selectedDepartment} 
            onValueChange={handleDepartmentChange}
            disabled={loading.departments}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loading.departments ? "Cargando..." : "Selecciona un departamento"} />
            </SelectTrigger>
            <SelectContent>
              {loading.departments ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                departments.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {dept.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label htmlFor="location" className="block text-sm font-medium">
            Localidad
          </label>
          <Select 
            value={selectedLocation} 
            onValueChange={handleLocationChange} 
            disabled={!selectedDepartment || loading.municipalities}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                loading.municipalities ? "Cargando..." : 
                !selectedDepartment ? "Selecciona un departamento primero" : 
                currentMunicipalities.length === 0 ? "No hay localidades disponibles" :
                "Selecciona una localidad"
              } />
            </SelectTrigger>
            <SelectContent>
              {currentMunicipalities.map(municipality => (
                <SelectItem key={municipality.id} value={municipality.id}>
                  {municipality.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-6 mt-4">
        <Button 
          onClick={handleNextWithDelay} 
          disabled={!selectedDepartment || !selectedLocation || loading.municipalities || loading.departments}
          className="bg-primary hover:bg-primary-dark"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
};

declare global {
  interface Window {
    lastSelectedServiceId?: string;
    lastSelectedCategoryName?: string;
    toast?: any; // For accessing toast from window object
  }
}

export default LocationStep;
