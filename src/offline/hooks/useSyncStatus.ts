/**
 * Unified high-level indicator hook reporting general network and outbox statuses
 */

import { useConnectivity } from './useConnectivity';
import { useSyncQueue } from './useSyncQueue';

export function useSyncStatus() {
  const connectivity = useConnectivity();
  const queue = useSyncQueue();

  return {
    isOnline: connectivity.isOnline,
    latencyMs: connectivity.latencyMs,
    mode: connectivity.mode,
    backlogCount: queue.backlogCount,
    isSyncing: queue.isSyncing,
    forceSync: queue.syncNow,
    clearBacklog: queue.clearQueue
  };
}

export default useSyncStatus;
