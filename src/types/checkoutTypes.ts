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

// Add helper function to get provider auxiliary value
export const getProviderAuxiliary = (location: string | undefined): string | null => {
  if (!location) return null;
  if (location === "NoLoSe") return "NoLoSe";
  if (location === "other") return location;
  return null;
};
