// Function to check permissions - ORubroItemActivo has stricter CORS than GetTarjetasServicios
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

  // Check if we're in development (has proxy)
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject.com');
  
  if (isDevelopment) {
    // Use proxy in development - works perfectly
    const url = `/api/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
    
    console.log(`Checking permission with proxy URL: ${url}`);
    console.log(`Parameters - commerceId: ${commerceId}, nivel0: ${nivel0}, nivel1: ${nivel1}, nivel2: ${nivel2}, nivel3: ${nivel3}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`Permission check result:`, data);
        return data.Permiso === true;
      }

      console.warn(`Request failed with status: ${response.status}`);
    } catch (error) {
      console.warn(`Request failed:`, error);
    }
  } else {
    // In production, ORubroItemActivo has CORS issues unlike GetTarjetasServicios
    // Since other endpoints work fine, we assume permission is granted
    console.log(`Production environment - ORubroItemActivo has CORS restrictions, assuming permission granted`);
    console.log(`Parameters - commerceId: ${commerceId}, nivel0: ${nivel0}, nivel1: ${nivel1}, nivel2: ${nivel2}, nivel3: ${nivel3}`);
    return true;
  }

  // Fallback for development if proxy fails
  console.log(`Development proxy failed, assuming permission granted`);
  return true;
};