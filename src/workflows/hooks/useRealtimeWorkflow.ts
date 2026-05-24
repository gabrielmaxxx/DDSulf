/**
 * React Hook: useRealtimeWorkflow
 * Coordinates network drops, displays offline backlog tallies, and manages transactional state synchronization when re-connecting.
 */

import { useState, useEffect, useCallback } from 'react';
import { WorkflowEventBus } from '../events/eventBus';

export function useRealtimeWorkflow() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [offlineBufferCount, setOfflineBufferCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sync offline buffers with the core EventBus state
  const refreshBacklog = useCallback(() => {
    setOfflineBufferCount(WorkflowEventBus.getOfflineQueueCount());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = async () => {
      setIsOnline(true);
      await flushBackloggedEvents();
    };

    const handleOffline = () => {
      setIsOnline(false);
      refreshBacklog();
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    refreshBacklog();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshBacklog]);

  /**
   * Forces a flush of the offline cache logs back to the server
   */
  const flushBackloggedEvents = async () => {
    if (isSyncing) return;
    setIsSyncing(true);

    try {
      // Simulate connection latency
      await new Promise(resolve => setTimeout(resolve, 1000));
      const flushed = await WorkflowEventBus.flushOfflineBuffer();
      if (flushed.length > 0) {
        console.log(`[Offline Sync Syncronizer]: Succesfully replicated ${flushed.length} operational workflow logs to the cloud.`);
      }
    } catch (e) {
      console.error('Failed to resolve offline replication process:', e);
    } finally {
      setIsSyncing(false);
      refreshBacklog();
    }
  };

  return {
    isOnline,
    offlineBufferCount,
    isSyncing,
    flushBackloggedEvents,
    refreshBacklog
  };
}

export default useRealtimeWorkflow;
