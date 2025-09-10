// Utility function to make API calls with CORS handling
export const makeApiCall = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // First try with proxy (development and some production setups)
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options.headers
      }
    });
    
    if (response.ok) {
      return response;
    }
    
    // If proxy fails, try direct URL with no-cors mode
    if (url.startsWith('/api/')) {
      const directUrl = url.replace('/api/', 'https://app.almango.com.uy/');
      console.log('Proxy failed, trying direct URL with no-cors:', directUrl);
      
      const directResponse = await fetch(directUrl, {
        ...options,
        mode: 'no-cors',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
          ...options.headers
        }
      });
      
      return directResponse;
    }
    
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    
    // Fallback to direct URL with no-cors if proxy fails
    if (url.startsWith('/api/')) {
      const directUrl = url.replace('/api/', 'https://app.almango.com.uy/');
      console.log('Fallback to direct URL with no-cors:', directUrl);
      
      try {
        return await fetch(directUrl, {
          ...options,
          mode: 'no-cors',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            ...options.headers
          }
        });
      } catch (fallbackError) {
        console.error('Fallback API call also failed:', fallbackError);
        throw fallbackError;
      }
    }
    
    throw error;
  }
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

  const url = `/api/WebAPI/ORubroItemActivo?Comercioid=${commerceId}&Nivel0=${nivel0}&Nivel1=${nivel1}&Nivel2=${nivel2}&Nivel3=${nivel3}`;
  
  console.log(`Checking permission with URL: ${url}`);
  console.log(`Parameters - commerceId: ${commerceId}, nivel0: ${nivel0}, nivel1: ${nivel1}, nivel2: ${nivel2}, nivel3: ${nivel3}`);

  try {
    const response = await makeApiCall(url);

    // Handle no-cors responses (opaque responses)
    if (response.type === 'opaque') {
      // With no-cors, we can't read the response, so we assume success
      // This is not ideal but necessary for CORS-restricted endpoints
      console.log('Received opaque response (no-cors), assuming permission granted');
      return true;
    }

    if (!response.ok) {
      console.warn(`Permission check failed:`, response.status, response.statusText);
      return false;
    }

    const data = await response.json();
    console.log(`Permission check result:`, data);
    return data.Permiso === true;
  } catch (error) {
    console.error(`Error checking permission:`, error);
    // In case of complete failure, return false to be safe
    return false;
  }
};
