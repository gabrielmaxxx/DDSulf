import { useAuth } from './useAuth';
import { useFirebaseState } from '@/firebase/providers';

export function useSession() {
  const { user, loading, isAuthenticated } = useAuth();
  const { isOnline } = useFirebaseState();

  const sessionUptime = user?.lastLogin 
    ? Math.floor((Date.now() - new Date(user.lastLogin).getTime()) / 1000)
    : 0;

  return {
    user,
    loading,
    isAuthenticated,
    isOnline,
    sessionUptime,
    lastLogin: user?.lastLogin || null,
    deviceId: typeof window !== 'undefined' ? (window.navigator?.userAgent || 'Unknown Device') : 'Server Node'
  };
}

export default useSession;
