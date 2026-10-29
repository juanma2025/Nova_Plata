import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import { useStore } from './useStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (userUpdates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      login: (user) => {
        useStore.getState().clearAllData();
        set({ user, isAuthenticated: true });
        useStore.getState().fetchFinancialData();
      },
      logout: () => {
        try {
          localStorage.removeItem('access_token');
          localStorage.removeItem('nova-plata-finances');
          localStorage.removeItem('mi-plata-auth');
          sessionStorage.clear();
        } catch {
          // ignore
        }
        useStore.getState().clearAllData();
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (updates) => set((state) => ({ user: state.user ? { ...state.user, ...updates } : null })),
    }),
    { name: 'mi-plata-auth' }
  )
);
