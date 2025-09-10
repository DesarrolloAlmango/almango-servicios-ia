// Function to check permissions - always tries endpoint first
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

  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  
  // Choose URL based on environment
  const url = isDevelopment 
    ? `/api/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`
    : `https://app.almango.com.uy/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
  
  console.log(`Executing permission check (${isDevelopment ? 'dev' : 'prod'}): ${url}`);

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
      console.log(`Permission check successful:`, data);
      return data.Permiso === true;
    } else {
      console.warn(`Permission endpoint returned ${response.status}`);
    }
  } catch (error) {
    console.warn(`Permission endpoint failed:`, error);
  }

  // Fallback only if the endpoint fails
  console.log(`Endpoint failed, using fallback: granting permission for nivel0: ${nivel0}`);
  return true;
};
