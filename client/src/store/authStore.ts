import { create } from 'zustand';
import { IUser, UserRole } from '../types/index.js';
import api, { setAccessToken, refreshAccessToken } from '../services/api.js';

interface AuthState {
  user: IUser | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  setAuth: (user: IUser, token: string) => void;
  setToken: (token: string | null) => void;
  setUser: (user: IUser | null) => void;
  clearAuth: () => void;
  logout: (options?: { notifyChannel?: boolean }) => Promise<void>;
  bootstrap: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
}

const authChannel = typeof window !== 'undefined' && 'BroadcastChannel' in window
  ? new BroadcastChannel('cegs_auth_channel')
  : null;

export const useAuthStore = create<AuthState>((set, get) => {
  if (authChannel) {
    authChannel.onmessage = (event) => {
      if (event.data?.type === 'LOGOUT') {
        get().clearAuth();
        if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    };
  }

  return {
    user: null,
    token: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
    isInitializing: true,

    setAuth: (user: IUser, token: string) => {
      setAccessToken(token);
      set({
        user,
        token,
        role: user.role,
        isAuthenticated: true,
        isLoading: false,
        isInitializing: false,
      });
    },

    setToken: (token: string | null) => {
      setAccessToken(token);
      set({ token, isAuthenticated: !!token });
    },

    setUser: (user: IUser | null) => {
      set({
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
      });
    },

    clearAuth: () => {
      setAccessToken(null);
      set({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
      });
    },

    logout: async (options = { notifyChannel: true }) => {
      try {
        await api.post('/auth/logout');
      } catch (err) {
        // Ignore network / logout errors
      }
      setAccessToken(null);
      set({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
        isInitializing: false,
      });

      if (options.notifyChannel && authChannel) {
        authChannel.postMessage({ type: 'LOGOUT' });
      }
    },

    bootstrap: async () => {
      set({ isInitializing: true });
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          const res = await api.get('/auth/me');
          if (res.data?.success && res.data?.user) {
            const user = res.data.user;
            set({
              user,
              token: newToken,
              role: user.role,
              isAuthenticated: true,
              isInitializing: false,
              isLoading: false,
            });
            return;
          }
        }
      } catch (err) {
        // Session not active
      }
      setAccessToken(null);
      set({
        user: null,
        token: null,
        role: null,
        isAuthenticated: false,
        isInitializing: false,
        isLoading: false,
      });
    },

    fetchCurrentUser: async () => {
      try {
        set({ isLoading: true });
        const res = await api.get('/auth/me');
        if (res.data?.success && res.data?.user) {
          const user = res.data.user;
          set({
            user,
            role: user.role,
            isAuthenticated: true,
            isLoading: false,
          });
        }
      } catch (err) {
        set({ isLoading: false });
      }
    },
  };
});
