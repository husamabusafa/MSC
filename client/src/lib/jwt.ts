// JWT utility functions for token management

export const getToken = (): string | null => {
  return localStorage.getItem('accessToken');
};

export const setToken = (token: string): void => {
  localStorage.setItem('accessToken', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('currentUser');
};

export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    return true; // If we can't parse the token, consider it expired
  }
};

export const getTokenPayload = (token: string): any | null => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    return null;
  }
};

export const isValidToken = (token: string): boolean => {
  if (!token) return false;
  
  try {
    const payload = getTokenPayload(token);
    if (!payload) return false;
    
    return !isTokenExpired(token);
  } catch (error) {
    return false;
  }
};

// Helper function to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return token ? isValidToken(token) : false;
}; 