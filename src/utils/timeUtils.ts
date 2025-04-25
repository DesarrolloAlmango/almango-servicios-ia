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

/**
 * Converts a numeric time slot code to a readable time range
 */
export const formatTimeSlot = (turno: string): string => {
  switch (turno) {
    case "1":
      return "Mañana (8:00 - 12:00)";
    case "2":
      return "Tarde (13:00 - 17:00)";
    case "3":
      return "Noche (18:00 - 21:00)";
    default:
      return `Turno ${turno}`;
  }
};
