import { useState, useEffect } from 'react';
import { RealtimeManager } from '../realtime/realtimeManager';
import { OperationalSnapshot } from '../types';
import { useRealtimeStore } from '@/store/useRealtimeStore';

export function useRealtimeKPIs() {
  const [snapshot, setSnapshot] = useState<OperationalSnapshot>({
    activeServicesCount: 4,
    pendingAllocationCount: 12,
    reworkRatePercent: 3.2,
    completedServicesCount: 41,
    avgResponseTimeHours: 2.8
  });

  const { isOnline, activeSubscriptionsCount } = useRealtimeStore();

  useEffect(() => {
    const manager = RealtimeManager.getInstance();
    
    manager.startSubscriptions(
      (updatedSnapshot) => {
        setSnapshot(updatedSnapshot);
      }
    );

    return () => {
      manager.stopSubscriptions();
    };
  }, []);

  return {
    snapshot,
    isOnline,
    activeSubscriptions: activeSubscriptionsCount
  };
}

export default useRealtimeKPIs;
