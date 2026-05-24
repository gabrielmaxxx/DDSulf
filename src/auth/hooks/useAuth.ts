import { useAuthContext } from '../providers/AuthProvider';

export function useAuth() {
  const { 
    user, 
    role, 
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
