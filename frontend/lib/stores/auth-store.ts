import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { SystemName } from '@/lib/types/system';

export interface AppUser {
  id: number;
  email: string;
  name?: string | null;
}

interface AuthState {
  // State
  appToken: string | null;
  appRefreshToken: string | null;
  expiresIn: number | null; // seconds
  user: AppUser | null;
  systems: SystemName[]; // Systems that user has logged into
  isLoading: boolean;

  // Actions
  setAuth: (auth: {
    appToken: string;
    appRefreshToken: string;
    expiresIn: number;
    user: AppUser;
    systems: SystemName[];
  }) => void;
  updateAppToken: (update: {
    appToken: string;
    expiresIn: number;
    appRefreshToken?: string;
  }) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      appToken: null,
      appRefreshToken: null,
      expiresIn: null,
      user: null,
      systems: [],
      isLoading: false,

      // Actions
      setAuth: (auth) =>
        set({
          appToken: auth.appToken,
          appRefreshToken: auth.appRefreshToken,
          expiresIn: auth.expiresIn,
          user: auth.user,
          systems: auth.systems,
        }),

      updateAppToken: (update) =>
        set((state) => ({
          appToken: update.appToken,
          expiresIn: update.expiresIn,
          appRefreshToken: update.appRefreshToken ?? state.appRefreshToken,
        })),

      clearAuth: () =>
        set({
          appToken: null,
          appRefreshToken: null,
          expiresIn: null,
          user: null,
          systems: [],
        }),

      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
