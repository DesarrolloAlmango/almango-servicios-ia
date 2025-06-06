
export const getTimeSlotNumber = (timeSlot: string): string => {
  switch (timeSlot) {
    case "08:00 - 12:00":
      return "1";
    case "12:00 - 16:00":
      return "2";
    case "16:00 - 20:00":
      return "3";
    case "08:00 - 14:00": // Saturday morning slot
      return "1";
    case "14:00 - 20:00": // Saturday afternoon slot
      return "2";
    default:
      return "1"; // Default fallback
  }
};
