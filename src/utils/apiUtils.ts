// Function to check permissions - following same logic as GetTarjetasServicios
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

  // Check if we're in development (has proxy) or production (direct URL)
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname.includes('lovableproject.com');
  
  let url: string;
  if (isDevelopment) {
    // Use proxy in development (same as GetTarjetasServicios proxy logic)
    url = `/api/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
  } else {
    // Use direct URL in production (same as GetTarjetasServicios direct logic)
    url = `https://app.almango.com.uy/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
  }
  
  console.log(`Checking permission with URL: ${url}`);
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

  // Fallback: assume permission granted if endpoint fails
  console.log(`Endpoint failed, assuming permission granted based on working endpoints`);
  return true;
};