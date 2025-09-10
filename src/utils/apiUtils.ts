// Function to check permissions - using exact same logic as GetTarjetasServicios
export const checkPermission = async (
  commerceId: string,
  nivel0: string,
  nivel1: string = '0',
  nivel2: string = '0',
  nivel3: string = '0'
): Promise<boolean> => {
  // Validate commerceId
  if (!commerceId || commerceId === ':commerceId') {
    console.warn(`Invalid commerceId provided: ${commerceId}`);
    return false;
  }

  // Check if we're in development environment
  const isDevelopment = window.location.hostname === 'localhost' || 
                       window.location.hostname.includes('lovableproject.com');
  
  let url: string;
  
  if (isDevelopment) {
    // Development: use proxy (same as other endpoints that work)
    url = `/api/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
  } else {
    // Production: use direct URL (exactly like GetTarjetasServicios)
    url = `https://app.almango.com.uy/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
  }
  
  console.log(`Checking permission with URL: ${url}`);
  console.log(`Parameters - commerceId: ${commerceId}, nivel0: ${nivel0}, nivel1: ${nivel1}, nivel2: ${nivel2}, nivel3: ${nivel3}`);

  try {
    // Simple fetch call - exactly like GetTarjetasServicios does
    const response = await fetch(url);

    if (response.ok) {
      const data = await response.json();
      console.log(`Permission check result:`, data);
      return data.Permiso === true;
    }

    console.warn(`Request failed with status: ${response.status}`);
    throw new Error(`HTTP error! Status: ${response.status}`);
  } catch (error) {
    console.error(`Request failed:`, error);
    
    // Only fallback if there's an actual error
    console.log(`Endpoint failed, assuming permission granted`);
    return true;
  }
};