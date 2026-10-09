import { create } from 'zustand';
import { IUser, UserRole } from '../types/index.js';
import api from '../services/api.js';

interface AuthState {
  user: IUser | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: IUser, token: string) => void;
  logout: () => void;
  fetchCurrentUser: () => Promise<void>;
  switchRoleDemo: (role: UserRole) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: JSON.parse(localStorage.getItem('cegs_user') || 'null'),
  token: localStorage.getItem('cegs_token'),
  role: (JSON.parse(localStorage.getItem('cegs_user') || 'null')?.role as UserRole) || null,
  isAuthenticated: !!localStorage.getItem('cegs_token'),
  isLoading: false,

  setAuth: (user: IUser, token: string) => {
    localStorage.setItem('cegs_token', token);
    localStorage.setItem('cegs_user', JSON.stringify(user));
    set({
      user,
      token,
      role: user.role,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('cegs_token');
    localStorage.removeItem('cegs_user');
    set({
      user: null,
      token: null,
      role: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  fetchCurrentUser: async () => {
    try {
      const token = localStorage.getItem('cegs_token');
      if (!token) return;

      set({ isLoading: true });
      const res = await api.get('/auth/me');
      if (res.data?.success) {
        const user = res.data.user;
        localStorage.setItem('cegs_user', JSON.stringify(user));
        set({
          user,
          role: user.role,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (err) {
      localStorage.removeItem('cegs_token');
      localStorage.removeItem('cegs_user');
      set({ user: null, token: null, role: null, isAuthenticated: false, isLoading: false });
    }
  },

  switchRoleDemo: async (role: UserRole) => {
    try {
      set({ isLoading: true });
      const emailMap = {
        student: 'student@careerexpertglobal.com',
        mentor: 'mentor@careerexpertglobal.com',
        admin: 'admin@careerexpertglobal.com',
      };

      const res = await api.post('/auth/login', {
        email: emailMap[role],
        password: 'Password123!',
      });

      if (res.data?.success) {
        localStorage.setItem('cegs_token', res.data.token);
        localStorage.setItem('cegs_user', JSON.stringify(res.data.user));
        set({
          user: res.data.user,
          token: res.data.token,
          role: res.data.user.role,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    } catch (err) {
      set({ isLoading: false });
      console.error('Failed to quick-switch demo role:', err);
    }
  },
}));
