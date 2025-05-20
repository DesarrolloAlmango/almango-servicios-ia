
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

  const handleNextWithDelay = () => {
    // Call the original onNext function first
    onNext();
    
    // If we have a categoryId and a stored serviceId, trigger product price recalculation
    if (categoryId && window.lastSelectedServiceId) {
      console.log("LocationStep: Triggering product price recalculation for category:", categoryId);
      
      // First dispatch the update prices event with forceRefresh flag
      const updatePricesEvent = new CustomEvent('updateProductPrices', { 
        detail: { 
          categoryId,
          serviceId: window.lastSelectedServiceId,
          forceRefresh: true,
          timestamp: Date.now() // Add timestamp to make each event unique
        } 
      });
      document.dispatchEvent(updatePricesEvent);
      
      setTimeout(() => {
        // Then dispatch the openCategory event to ensure the category remains open
        console.log("LocationStep: Dispatching openCategory event for:", categoryId);
        
        const openCategoryEvent = new CustomEvent('openCategory', { 
          detail: { 
            categoryId,
            serviceId: window.lastSelectedServiceId || undefined,
            categoryName: window.lastSelectedCategoryName || undefined
          } 
        });
        document.dispatchEvent(openCategoryEvent);
        
        // Apply visual highlight to the category card
        setTimeout(() => {
          // Find the category element by various selectors
          const selectors = [
            `[data-category-id="${categoryId}"]`,
            `.category-item-${categoryId}`,
            `[data-category="${categoryId}"]`
          ];
          
          let categoryElement = null;
          for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
              categoryElement = element;
              console.log(`LocationStep: Found category element with selector: ${selector}`);
              break;
            }
          }
          
          if (categoryElement) {
            // Find the clickable card within the category element
            const clickableCard = categoryElement.querySelector('.cursor-pointer');
            if (clickableCard) {
              console.log("LocationStep: Found clickable element, highlighting");
              
              // Apply visual highlighting with animation
              clickableCard.classList.add('ring-4', 'ring-orange-500', 'scale-110', 'bg-orange-50');
              categoryElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              
              // Remove scale and background after animation completes
              setTimeout(() => {
                clickableCard.classList.remove('scale-110', 'bg-orange-50');
              }, 2000);
            }
          }
        }, 300);
      }, 500);
    }
  };

  // Add listener for if location modal is closed without confirming
  useEffect(() => {
    // Function to handle closing the products dialog if the location modal closes without confirming
    const handleLocationModalClosed = () => {
      // Find all dialogs
      const dialogs = document.querySelectorAll('[role="dialog"]');
      dialogs.forEach(dialog => {
        // Only target product dialogs (those containing product grids)
        if (dialog.querySelector('.product-grid')) {
          // Get close button
          const closeButton = dialog.querySelector('[data-dialog-close]');
          if (closeButton && closeButton instanceof HTMLElement) {
            console.log('LocationStep: Location modal closed without confirming, closing product dialog');
            closeButton.click();
          }
        }
      });
    };

    // Add event listeners for price debug information
    const handlePriceDebugInfo = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { storeId, serviceId, categoryId, products } = customEvent.detail;
        console.log(`LocationStep received debug info: Store=${storeId}, Service=${serviceId}, Category=${categoryId}`);
        console.log(`Products to fetch prices for:`, products);
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
            onValueChange={setSelectedLocation} 
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

// Add this for TypeScript global variable declaration
declare global {
  interface Window {
    lastSelectedServiceId?: string;
    lastSelectedCategoryName?: string;
    toast?: any; // For accessing toast from window object
  }
}

export default LocationStep;
