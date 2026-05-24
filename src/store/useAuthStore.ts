import { create } from 'zustand';
import { UserProfile, UserRole } from '@/types/database';

export interface AuthState {
  user: UserProfile | null;
  role: UserRole | null;
  isLoading: boolean;
  error: string | null;
  setAuth: (user: UserProfile | null, role: UserRole | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  isLoading: false,
  error: null,
  setAuth: (user, role) => set({ user, role, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error, isLoading: false }),
  logout: () => set({ user: null, role: null, isLoading: false, error: null }),
}));

export default useAuthStore;
