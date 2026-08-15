import { useAuthContext } from '../providers/AuthProvider';

export function useAuth() {
  const { 
    user, 
    role, 
    empresaId,
    isSuperAdmin,
    empresaSuspensa,
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
    isSuperAdmin: Boolean(isSuperAdmin || user?.isSuperAdmin),
    empresaSuspensa: Boolean(empresaSuspensa),
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
