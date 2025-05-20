
import { TarjetaServicio } from "../types";

export const fetchTarjetasServicios = async (): Promise<TarjetaServicio[]> => {
  try {
    const response = await fetch("/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios");
    if (!response.ok) {
      throw new Error("Error al obtener las tarjetas de servicios");
    }
    const data = await response.json();
    console.log("Datos de la API sin procesar:", data);
    const parsedData = JSON.parse(data.SDTTarjetasServiciosJson);
    console.log("Datos de servicios parseados:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error fetching services:", error);
    throw error;
  }
};

export const fetchTarjetasMudanza = async (): Promise<TarjetaServicio[]> => {
  try {
    const response = await fetch("/api/AlmangoAPINETFrameworkSQLServer/APIAlmango/GetTarjetasServicios2");
    if (!response.ok) {
      throw new Error("Error al obtener las tarjetas de servicios de mudanza");
    }
    const data = await response.json();
    console.log("Datos de mudanza sin procesar:", data);
    const parsedData = JSON.parse(data.SDTTarjetasServiciosJson);
    console.log("Datos de servicios de mudanza parseados:", parsedData);
    return parsedData;
  } catch (error) {
    console.error("Error fetching mudanza services:", error);
    throw error;
  }
};
