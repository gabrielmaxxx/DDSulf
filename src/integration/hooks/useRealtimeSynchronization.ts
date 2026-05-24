/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { eventBusService } from '../services/eventBusService';
import { useEventBus } from './useEventBus';

export function useRealtimeSynchronization() {
  const { offlineQueue, syncOfflineQueue } = useEventBus();
  const [onlineStatus, setOnlineStatus] = useState<boolean>(() => navigator.onLine);
  const [syncingNow, setSyncingNow] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const triggerManualSync = useCallback(async () => {
    if (syncingNow) return { syncedCount: 0, resolvedConflicts: false };
    setSyncingNow(true);
    
    // add small realistic UI delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const result = await syncOfflineQueue();
    setSyncingNow(false);
    return result;
  }, [syncOfflineQueue, syncingNow]);

  return {
    isOnline: onlineStatus,
    syncOfflineQueue: triggerManualSync,
    queuedEventsCount: offlineQueue.length,
    syncingNow
  };
}
export default useRealtimeSynchronization;
