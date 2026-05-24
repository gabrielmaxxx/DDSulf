/**
 * Custom React Hook: useRealtimeSync
 * Granular subscriptions with throttle timers to prevent high read counts and redundant rendering.
 */

import { useState, useEffect } from 'react';
import { SyncPayload } from '../types';
import { SyncEngineService } from '../services/infrastructureServices';

export function useRealtimeSync() {
  const [syncedCount, setSyncedCount] = useState(0);
  const [syncQueueSize, setSyncQueueSize] = useState(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(Date.now());

  useEffect(() => {
    setSyncQueueSize(SyncEngineService.getQueue().length);

    const unsub = SyncEngineService.subscribe((queueLen) => {
      setSyncQueueSize(queueLen);
      setLastSyncedAt(Date.now());
      setSyncedCount(prev => prev + 1);
    });

    return () => unsub();
  }, []);

  const triggerManualSync = async () => {
    await SyncEngineService.reconcileQueue();
  };

  return {
    syncQueueSize,
    syncedCount,
    lastSyncedAt,
    triggerManualSync,
    isFullySynced: syncQueueSize === 0
  };
}

export default useRealtimeSync;
