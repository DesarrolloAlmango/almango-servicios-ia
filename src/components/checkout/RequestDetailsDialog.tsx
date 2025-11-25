import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatTimeSlot, formatLocationInfo } from "@/utils/timeUtils";
import { CheckoutData } from "@/types/checkoutTypes";
import { calculateTotalWithDiscounts } from "@/utils/discountUtils";
interface RequestDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  requestData: CheckoutData | null;
  serviceId: number | null;
  departments: Array<{
    id: string;
    name: string;
  }>;
  municipalities: Record<string, Array<{
    id: string;
    name: string;
  }>>;
}
const RequestDetailsDialog: React.FC<RequestDetailsDialogProps> = ({
  isOpen,
  onClose,
  requestData,
  serviceId,
  departments,
  municipalities
}) => {
  // Format price with thousands separator (dot) and decimals (comma)
  const formatPrice = (price: number): string => {
    return price.toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };
  const getFormaDePago = (metodoPagoId: number): string => {
    switch (metodoPagoId) {
      case 1:
        return "Pago al profesional";
      case 4:
        return "Mercado Pago";
      default:
        return `Método de pago ${metodoPagoId}`;
    }
  };
  const calcularTotal = (items: any[], costoZona: number = 0): number => {
    const itemsTotal = items.reduce((total, item) => total + item.PrecioFinal, 0);
    return itemsTotal + costoZona;
  };

  // Convert checkout data to cart items for discount calculation
  const getCartItemsFromRequestData = (requestData: CheckoutData) => {
    return requestData.Level1.map(item => ({
      id: `${item.RubrosId}-${item.ProductoID}-${item.DetalleID}`,
      name: item.ProductName || `Producto ${item.ProductoID}`,
      price: item.Precio,
      quantity: item.Cantidad,
      image: "",
      serviceCategory: requestData.serviceName || `Servicio ${item.RubrosId}`,
      serviceId: item.RubrosId.toString(),
      categoryId: item.ProductoID?.toString(),
      productId: item.DetalleID?.toString()
    }));
  };
  return <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalle de la Solicitud</DialogTitle>
        </DialogHeader>
        
        {requestData && <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Nombre</p>
                    <p className="text-lg">{requestData.Nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Teléfono</p>
                    <p className="text-lg">{requestData.Telefono}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg">{requestData.Mail || "No especificado"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Dirección</p>
                  <p className="text-lg">{requestData.Direccion}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Departamento</p>
                    <p className="text-lg">
                      {requestData.DepartamentoNombre || departments.find(d => d.id === requestData.DepartamentoId?.toString())?.name || "No especificado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Localidad</p>
                    <p className="text-lg">
                      {requestData.MunicipioNombre || (requestData.DepartamentoId && municipalities[requestData.DepartamentoId.toString()]?.find(m => m.id === requestData.MunicipioId?.toString())?.name) || "No especificado"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Detalles de la Instalación</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Fecha</p>
                    <p className="text-lg">
                      {format(new Date(requestData.FechaInstalacion), "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Turno</p>
                    <p className="text-lg">{formatTimeSlot(requestData.TurnoInstalacion)}</p>
                  </div>
                </div>
                {requestData.Comentario && <div>
                    <p className="text-sm font-medium text-muted-foreground">Comentarios</p>
                    <p className="text-lg">{requestData.Comentario}</p>
                  </div>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Servicios Solicitados</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descripción</TableHead>
                      <TableHead className="text-center">Cantidad</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requestData.Level1.map((item, index) => <TableRow key={index}>
                        <TableCell className="font-medium">
                          {item.ProductName}
                          {formatLocationInfo(requestData.DepartamentoId?.toString(), requestData.MunicipioId?.toString(), departments, municipalities)}
                        </TableCell>
                        <TableCell className="text-center">{item.Cantidad}</TableCell>
                        <TableCell className="text-right">${formatPrice(item.Precio)}</TableCell>
                        <TableCell className="text-right">${formatPrice(item.PrecioFinal)}</TableCell>
                      </TableRow>)}
                  </TableBody>
                  <TableFooter>
                    {(() => {
                      const cartItems = getCartItemsFromRequestData(requestData);
                      const subtotal = requestData.Level1.reduce((sum, item) => sum + item.PrecioFinal, 0);
                      const totalsWithDiscounts = calculateTotalWithDiscounts(cartItems, subtotal, requestData.CostoXZona);
                      
                      return (
                        <>
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-medium">Subtotal</TableCell>
                            <TableCell className="text-right font-medium">
                              ${formatPrice(totalsWithDiscounts.subtotal)}
                            </TableCell>
                          </TableRow>
                          
                          {/* Mostrar descuentos */}
                          {totalsWithDiscounts.discounts.map((discount, index) => (
                            <TableRow key={`discount-${index}`}>
                              <TableCell colSpan={3} className="text-right text-green-600">
                                {discount.description}
                              </TableCell>
                              <TableCell className="text-right text-green-600">
                                -${formatPrice(discount.amount)}
                              </TableCell>
                            </TableRow>
                          ))}
                          
                          {/* Costo zona */}
                          {requestData.CostoXZona > 0 && (
                            <TableRow>
                              <TableCell colSpan={3} className="text-right text-blue-600">
                                Adicional por zona
                              </TableCell>
                              <TableCell className="text-right text-blue-600">
                                +${formatPrice(requestData.CostoXZona)}
                              </TableCell>
                            </TableRow>
                          )}
                          
                          <TableRow>
                            <TableCell colSpan={3} className="text-right font-bold text-lg">Total</TableCell>
                            <TableCell className="text-right font-bold text-lg">
                              ${formatPrice(totalsWithDiscounts.total)}
                            </TableCell>
                          </TableRow>
                        </>
                      );
                    })()}
                  </TableFooter>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Información de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Forma de Pago</p>
                    <p className="text-lg font-medium">
                      {getFormaDePago(requestData.MetodoPagosID)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Estado</p>
                    <p className={`text-lg font-medium ${requestData.MetodoPagosID === 1 ? "text-blue-600" : requestData.SolicitudPagada === "S" ? "text-green-600" : "text-yellow-600"}`}>
                      {requestData.MetodoPagosID === 1 ? "Pago en el domicilio" : requestData.SolicitudPagada === "S" ? "PAGADO" : "PENDIENTE"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <DialogFooter>
              <Button onClick={onClose}>
                Cerrar
              </Button>
            </DialogFooter>
          </div>}
      </DialogContent>
    </Dialog>;
};
export default RequestDetailsDialog;