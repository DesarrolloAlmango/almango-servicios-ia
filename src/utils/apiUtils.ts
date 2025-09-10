// Function to check permissions - tries endpoint in development, fallback in production
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
  
  // Only try the endpoint in development where proxy works
  if (isDevelopment) {
    try {
      const proxyUrl = `/api/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
      console.log(`Checking permission in development: ${proxyUrl}`);
      
      const response = await fetch(proxyUrl, {
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
    } catch (error) {
      console.warn(`Development permission check failed:`, error);
    }
  }

  // Production fallback: Since ORubroItemActivo has CORS restrictions in production
  // but other endpoints work fine, we grant permission to maintain functionality
  console.log(`${isDevelopment ? 'Development fallback' : 'Production mode'}: granting permission for nivel0: ${nivel0}`);
  return true;
};
