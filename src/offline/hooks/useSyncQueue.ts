/**
 * React state hook and controls for Outbox Sync Queue buffers
 */

import { useState, useEffect } from 'react';
import { OfflineQueueService } from '../queue';
import { SyncEngineService } from '../sync';
import { OfflineMutation } from '../types';

export interface SyncQueueControls {
  pendingMutations: OfflineMutation[];
  backlogCount: number;
  isSyncing: boolean;
  syncNow: () => Promise<boolean>;
  refreshQueue: () => Promise<void>;
  clearQueue: () => Promise<void>;
}

export function useSyncQueue(): SyncQueueControls {
  const [pending, setPending] = useState<OfflineMutation[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const refreshQueue = async () => {
    const list = await OfflineQueueService.getPending();
    setPending(list);
  };

  useEffect(() => {
    refreshQueue();

    // Polling triggers updates when background transfers complete
    const interval = setInterval(() => {
      refreshQueue();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const syncNow = async () => {
    setIsSyncing(true);
    try {
      const success = await SyncEngineService.syncNow();
      await refreshQueue();
      return success;
    } finally {
      setIsSyncing(false);
    }
  };

  const clearQueue = async () => {
    await OfflineQueueService.clearQueue();
    await refreshQueue();
  };

  return {
    pendingMutations: pending,
    backlogCount: pending.length,
    isSyncing,
    syncNow,
    refreshQueue,
    clearQueue
  };
}

export default useSyncQueue;
