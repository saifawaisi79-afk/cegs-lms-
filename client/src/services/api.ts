import axios from 'axios';
import { toast } from 'sonner';

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
    if (!error.response) {
      toast.error('Network Error: Server might be down or unreachable.', { duration: 5000 });
    } else if (error.response?.status === 401) {
      // If unauthorized on protected route, clean token
      const path = window.location.pathname;
      if (!path.includes('/login') && !path.includes('/verify-') && path !== '/') {
        localStorage.removeItem('cegs_token');
        localStorage.removeItem('cegs_user');
        
        // Dynamically import to avoid circular dependency
        import('../store/authStore.js').then((module) => {
          module.useAuthStore.getState().logout();
          window.location.href = '/login';
        }).catch(() => {
          window.location.href = '/login';
        });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
