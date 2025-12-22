import { jwtDecode } from 'jwt-decode';

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  const token = localStorage.getItem('token');
  console.log('Token from localStorage:', token ? 'Exists' : 'Null');
  
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    console.log('Token expiry:', decoded.exp, 'Current time:', currentTime);
    
    if (decoded.exp < currentTime) {
      console.log('Token expired');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }
    
    console.log('User authenticated');
    return true;
  } catch (error) {
    console.error('Error decoding token:', error);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

export const getUserRole = () => {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  console.log('User data from localStorage:', userStr);
  
  if (!userStr) return null;
  
  try {
    const user = JSON.parse(userStr);
    console.log('User role:', user.role);
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