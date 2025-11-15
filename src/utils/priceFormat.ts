/**
 * Formats a number as a price with thousands separator (dot) and decimals (comma)
 * Example: 1234.56 -> "1.234,56"
 */
export const formatPrice = (price: number): string => {
  // Ensure we always have 2 decimal places
  const formattedPrice = price.toLocaleString('es-UY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formattedPrice;
};
