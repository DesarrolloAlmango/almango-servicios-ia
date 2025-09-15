import { CartItem } from "@/pages/Servicios";

export interface DiscountInfo {
  percentage: number;
  amount: number;
  itemCount: number;
  description: string;
}

/**
 * Calcula el descuento para productos del rubro id = 1
 * - 3-4 productos: 10% de descuento
 * - 5-9 productos: 15% de descuento  
 * - 10+ productos: 20% de descuento
 */
export const calculateRubro1Discount = (cartItems: CartItem[]): DiscountInfo | null => {
  // Filtrar productos del rubro 1
  const rubro1Items = cartItems.filter(item => item.serviceId === "1");
  
  if (rubro1Items.length < 3) {
    return null; // No hay descuento si hay menos de 3 productos
  }

  // Calcular la suma total de productos del rubro 1
  const totalAmount = rubro1Items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalQuantity = rubro1Items.reduce((sum, item) => sum + item.quantity, 0);
  
  let percentage = 0;
  let description = "";

  if (totalQuantity >= 10) {
    percentage = 20;
    description = "Descuento 20% por 10+ productos del rubro";
  } else if (totalQuantity >= 5) {
    percentage = 15;
    description = "Descuento 15% por 5+ productos del rubro";
  } else if (totalQuantity >= 3) {
    percentage = 10;
    description = "Descuento 10% por 3+ productos del rubro";
  }

  const discountAmount = Math.round(totalAmount * (percentage / 100));

  return {
    percentage,
    amount: discountAmount,
    itemCount: totalQuantity,
    description
  };
};

/**
 * Calcula el total con descuentos aplicados
 */
export const calculateTotalWithDiscounts = (cartItems: CartItem[], baseTotal: number, zoneCost: number = 0): {
  subtotal: number;
  discounts: DiscountInfo[];
  total: number;
} => {
  const discounts: DiscountInfo[] = [];
  
  // Aplicar descuento del rubro 1
  const rubro1Discount = calculateRubro1Discount(cartItems);
  if (rubro1Discount) {
    discounts.push(rubro1Discount);
  }

  const totalDiscountAmount = discounts.reduce((sum, discount) => sum + discount.amount, 0);
  const finalTotal = baseTotal - totalDiscountAmount + zoneCost;

  return {
    subtotal: baseTotal,
    discounts,
    total: Math.max(0, finalTotal) // Asegurar que el total no sea negativo
  };
};