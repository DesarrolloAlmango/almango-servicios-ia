
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

/**
 * Converts a numeric time slot code to a readable time range
 */
export const formatTimeSlot = (turno: string): string => {
  switch (turno) {
    case "1":
      return "08:00 - 12:00";
    case "2":
      return "12:00 - 16:00";
    case "3":
      return "16:00 - 20:00";
    default:
      return `Turno ${turno}`;
  }
};

/**
 * Formats location information for display
 */
export const formatLocationInfo = (departmentId?: string, locationId?: string, departments: any[] = [], municipalities: Record<string, any[]> = {}): string => {
  if (!departmentId || !locationId || !departments || !municipalities[departmentId]) {
    return "";
  }

  const department = departments.find(d => d.id === departmentId);
  const municipality = municipalities[departmentId].find(m => m.id === locationId);
  
  if (!department || !municipality) {
    return "";
  }

  return `${department.name}, ${municipality.name}`;
};
