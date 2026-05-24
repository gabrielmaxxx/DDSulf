import { useEffect } from 'react';
import { useRealtimeStore } from '@/store/useRealtimeStore';

export interface SubscriptionConfig {
  subscribeFn: (callback: (data: any) => void) => () => void;
  onUpdate: (data: any) => void;
  enabled?: boolean;
}

export function useRealtime({ subscribeFn, onUpdate, enabled = true }: SubscriptionConfig) {
  const { incrementActiveSubscriptions, decrementActiveSubscriptions } = useRealtimeStore();

  useEffect(() => {
    if (!enabled) return;

    incrementActiveSubscriptions();
    const unsubscribe = subscribeFn(onUpdate);

    return () => {
      unsubscribe();
      decrementActiveSubscriptions();
    };
  }, [subscribeFn, onUpdate, enabled, incrementActiveSubscriptions, decrementActiveSubscriptions]);
}

export default useRealtime;
