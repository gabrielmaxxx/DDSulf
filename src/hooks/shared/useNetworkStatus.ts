import { useEffect } from 'react';
import { useRealtimeStore } from '@/store/useRealtimeStore';

export function useNetworkStatus() {
  const isOnline = useRealtimeStore((state) => state.isOnline);
  const setOnlineStatus = useRealtimeStore((state) => state.setOnlineStatus);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);

  return {
    isOnline,
    isOffline: !isOnline
  };
}

export default useNetworkStatus;
