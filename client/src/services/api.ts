import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cegs_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized on protected route, clean token
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/verify-certificate')) {
        localStorage.removeItem('cegs_token');
        localStorage.removeItem('cegs_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
