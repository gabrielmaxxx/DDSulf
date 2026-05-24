import { useAuth } from './useAuth';

export function useSession() {
  const { user, isAuthenticated, loading, logout } = useAuth();

  return {
    session: user ? {
      id: user.uid,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    } : null,
    isAuthenticated,
    isLoading: loading,
    logout
  };
}

export default useSession;
