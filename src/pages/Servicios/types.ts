
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

export interface TarjetaServicio {
  id?: string;
  name: string;
  icon: string;
  url?: string;
}

export interface PurchaseLocation {
  storeId: string;
  storeName: string;
  otherLocation?: string;
  serviceId?: string;
  serviceName?: string;
  departmentId?: string;
  departmentName?: string;
  locationId?: string;
  locationName?: string;
  categoryId?: string;
  categoryName?: string;
}

// Global window interface extensions
declare global {
  interface Window {
    lastSelectedServiceId?: string;
    lastSelectedCategoryName?: string;
    toast?: any;
  }
}
