import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api';

let inMemoryToken: string | null = null;

export const getAccessToken = (): string | null => inMemoryToken;

export const setAccessToken = (token: string | null): void => {
  inMemoryToken = token;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (inMemoryToken && config.headers) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise: Promise<string | null> | null = null;

const runRefresh = async (retryOnRace = true): Promise<string | null> => {
  try {
    const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
    if (res.data?.success && res.data?.accessToken) {
      const newToken = res.data.accessToken;
      setAccessToken(newToken);
      const { useAuthStore } = await import('../store/authStore.js');
      useAuthStore.getState().setToken(newToken);
      return newToken;
    }
    return null;
  } catch (err: any) {
    if (retryOnRace && err?.response?.data?.code === 'REFRESH_RACE') {
      await new Promise((r) => setTimeout(r, 300));
      return runRefresh(false);
    }
    return null;
  }
};

export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      if (typeof navigator !== 'undefined' && 'locks' in navigator && (navigator as any).locks?.request) {
        return await (navigator as any).locks.request('cegs_refresh_lock', async () => {
          return await runRefresh(true);
        });
      } else {
        return await runRefresh(true);
      }
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      toast.error('Network Error: Server might be down or unreachable.', { duration: 5000 });
      return Promise.reject(error);
    }

    const status = error.response.status;
    const responseData = error.response.data;

    // Handle forced password change required
    if (status === 403 && responseData?.code === 'PASSWORD_CHANGE_REQUIRED') {
      if (typeof window !== 'undefined' && window.location.pathname !== '/change-password') {
        window.location.href = '/change-password';
      }
      return Promise.reject(error);
    }

    // Handle token expired (or 401 on authenticated call)
    const isAuthRoute = originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh');
    if (status === 401 && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          return api(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh completely failed
      }

      // Logout and redirect to login
      const { useAuthStore } = await import('../store/authStore.js');
      useAuthStore.getState().clearAuth();
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
