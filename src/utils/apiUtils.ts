// Function to check permissions - MUST execute endpoint always
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

  // ALWAYS execute the endpoint - no environment checks
  // Try proxy first (for development), then direct URL (for production)
  
  // Strategy 1: Try proxy
  const proxyUrl = `/api/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
  console.log(`Attempting proxy URL: ${proxyUrl}`);
  console.log(`Parameters - commerceId: ${commerceId}, nivel0: ${nivel0}, nivel1: ${nivel1}, nivel2: ${nivel2}, nivel3: ${nivel3}`);

  try {
    const response = await fetch(proxyUrl);
    if (response.ok) {
      const data = await response.json();
      console.log(`Permission check result (proxy):`, data);
      return data.Permiso === true;
    }
    console.warn(`Proxy failed with status: ${response.status}`);
  } catch (error) {
    console.warn(`Proxy request failed:`, error);
  }

  // Strategy 2: Try direct URL 
  const directUrl = `https://app.almango.com.uy/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
  console.log(`Attempting direct URL: ${directUrl}`);
  
  try {
    const response = await fetch(directUrl);
    if (response.ok) {
      const data = await response.json();
      console.log(`Permission check result (direct):`, data);
      return data.Permiso === true;
    }
    console.warn(`Direct URL failed with status: ${response.status}`);
  } catch (error) {
    console.warn(`Direct URL request failed:`, error);
  }

  // If both fail, return true as fallback
  console.log(`Both attempts failed, assuming permission granted`);
  return true;
};