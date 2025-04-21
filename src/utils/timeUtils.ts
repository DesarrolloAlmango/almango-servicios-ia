
/**
 * Converts a readable time slot string to a numeric format for the API
 */
export const getTimeSlotNumber = (timeSlot: string): string => {
  switch (timeSlot) {
    case "Mañana (8:00 - 12:00)":
      return "1";
    case "Tarde (13:00 - 17:00)":
      return "2";
    case "Noche (18:00 - 21:00)":
      return "3";
    default:
      return "1"; // Default to morning if not specified
  }
};
