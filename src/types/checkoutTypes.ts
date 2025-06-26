

export interface CheckoutItem {
  RubrosId: number;
  ProductoID: number | null;
  DetalleID: number | null;
  Cantidad: number;
  Precio: number;
  SR: string;
  Comision: number;
  ComisionTipo: string;
  PrecioFinal: number;
  productoNombre?: string; // Add product name field
}

export interface CheckoutData {
  Nombre: string;
  Telefono: string;
  Mail: string | null;
  PaisISO: number | null;
  DepartamentoId: number | null;
  MunicipioId: number | null;
  ZonasID: number | null;
  Direccion: string;
  MetodoPagosID: number;
  SolicitudPagada: string | null;
  SolicitaCotizacion: string;
  SolicitaOtroServicio: string;
  OtroServicioDetalle: string;
  FechaInstalacion: string;
  TurnoInstalacion: string;
  Comentario: string;
  ConfirmarCondicionesUso: string;
  ProveedorAuxiliar: string | null;
  CostoXZona: number;
  Level1: CheckoutItem[];
  serviceName?: string; // Service category name
}

export interface ServiceRequest {
  solicitudId: number;
  serviceName: string;
  requestData: CheckoutData;
  paymentConfirmed?: boolean;
}

export const getProviderAuxiliary = (storeId: string, otherLocation?: string): string | null => {
  if (storeId === "unknown") return "No lo sé";
  if (storeId === "other" && otherLocation) return otherLocation;
  
  // Return the storeId as the provider ID
  return storeId;
};
