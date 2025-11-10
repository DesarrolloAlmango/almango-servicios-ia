/**
 * Formats a number as a price with thousands separator (dot) and decimals (comma)
 * Example: 1234.56 -> "1.234,56"
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};
