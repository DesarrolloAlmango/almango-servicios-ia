export interface CheckoutItem {
  RubrosId: number;
  MedidasID: number | null;
  InventarioId: number | null;
  SolicitudesItemsCantidad: number;
  SolicitudItemsSR: string;
  SolicitudItemsComision: number;
  SolicitudItemsComisionTipo: string;
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
  ProveedorAuxiliar: string | null;
  items: CheckoutItem[];
}

export const getProviderAuxiliary = (storeId: string, otherLocation?: string): string | null => {
  if (storeId === "unknown") return "NoLoSe";
  if (storeId === "other" && otherLocation) return otherLocation;
  return null;
};
