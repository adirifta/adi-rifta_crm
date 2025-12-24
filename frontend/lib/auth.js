import { jwtDecode } from 'jwt-decode';

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.log('No token found');
    return false;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    
    if (decoded.exp < currentTime) {
      console.log('Token expired');
      clearAuthData();
      return false;
    }
    
    console.log('Token valid');
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    clearAuthData();
    return false;
  }
};

export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    return user.role;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};

export const logout = () => {
  console.log('Logging out...');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getToken = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

export const getUser = () => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
};