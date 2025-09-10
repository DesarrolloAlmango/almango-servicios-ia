// Utility function to get the correct API base URL for different environments
export const getApiBaseUrl = (): string => {
  // In development, use the proxy
  if (import.meta.env.DEV) {
    return '/api';
  }
  
  // In production, check if we're on the same domain as the API
  const currentHost = window.location.hostname;
  if (currentHost.includes('almango.com.uy')) {
    // If we're on the same domain, use relative path
    return '/WebAPI';
  }
  
  // Otherwise, use the full URL
  return 'https://app.almango.com.uy/WebAPI';
};

// Function to check permissions with proper error handling and fallback
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

  const baseUrl = getApiBaseUrl();
  const endpoint = baseUrl.includes('/WebAPI') ? '' : '/WebAPI';
  const url = `${baseUrl}${endpoint}/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
  
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

    if (!response.ok) {
      console.warn(`Permission check failed:`, response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    console.log(`Permission check result:`, data);
    return data.Permiso === true;
  } catch (error) {
    console.error(`Error checking permission:`, error);
    return false;
  }
};
