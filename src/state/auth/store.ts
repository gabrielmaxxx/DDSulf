import { create } from 'zustand';
import { loggerMiddleware } from '../middleware/logger';
import { UserSession } from '../types';

export interface AuthStoreState {
  user: UserSession | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, role: UserSession['role']) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateUserSession: (session: Partial<UserSession>) => void;
}

export const useAuthStore = create<AuthStoreState>()(
  loggerMiddleware((set) => ({
    user: {
      uid: 'u_01',
      email: 'gabriel@ddsulf.com',
      displayName: 'Gabriel Max',
      role: 'admin',
      tenantId: 'ddsulf_tenant_sp_01',
      isVerified: true
    },
    isLoading: false,
    error: null,

    login: (email, role) => set({
      user: {
        uid: `u_${Math.random().toString(36).substring(2, 7)}`,
        email,
        displayName: email.split('@')[0],
        role,
        tenantId: 'ddsulf_tenant_sp_01',
        isVerified: true
      },
      error: null
    }),

    logout: () => set({ user: null, error: null }),

    setLoading: (isLoading) => set({ isLoading }),

    setError: (error) => set({ error, isLoading: false }),

    updateUserSession: (updates) => set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null
    }))
  }))
);
