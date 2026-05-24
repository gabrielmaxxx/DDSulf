import { useEffect } from 'react';
import { useAuth as useContextAuth } from '@/auth/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';

/**
 * Enterprise Auth hook bridging state indicators directly from central state
 */
export function useAuth() {
  const contextAuth = useContextAuth();
  const authStore = useAuthStore();

  useEffect(() => {
    if (contextAuth.user) {
      authStore.setAuth(contextAuth.user as any, contextAuth.role);
    } else {
      authStore.logout();
    }
  }, [contextAuth.user, contextAuth.role]);

  return {
    user: contextAuth.user,
    role: contextAuth.role,
    isAuthenticated: contextAuth.isAuthenticated,
    loading: contextAuth.loading,
    loginWithGoogle: contextAuth.loginWithGoogle,
    loginWithEmail: contextAuth.loginWithEmail,
    logout: contextAuth.logout
  };
}

export default useAuth;
