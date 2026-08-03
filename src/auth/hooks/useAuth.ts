import { useAuthContext } from '../providers/AuthProvider';

export function useAuth() {
  const { 
    user, 
    role, 
    empresaId,
    isLoading, 
    isHydrated, 
    isAuthenticated,
    loginWithGoogle,
    loginWithEmail,
    logout,
    updateProfileState
  } = useAuthContext();

  return {
    user,
    role,
    empresaId: empresaId || user?.empresaId || '',
    loading: isLoading,
    isHydrated,
    isAuthenticated,
    loginWithGoogle,
    loginWithEmail,
    logout,
    updateProfileState
  };
}

export default useAuth;
