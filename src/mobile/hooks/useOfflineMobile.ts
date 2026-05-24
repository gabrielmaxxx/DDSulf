/**
 * Operational Offline Telemetry Hook for Field Technicians
 * Exposes direct flags for degraded connectivity or backlog counter thresholds.
 */

import { useState, useEffect } from 'react';
import { ConnectivityService } from '../../offline/connectivity';
import { OfflineQueueService } from '../../offline/queue';
import { SyncStatusState } from '../../firebase/hooks/useOfflineSync';

export function useOfflineMobile() {
  const [syncState, setSyncState] = useState<SyncStatusState>({
    isOnline: true,
    latencyMs: 15,
    backlogCount: 0
  });

  const checkQueueSize = async () => {
    try {
      const pending = await OfflineQueueService.getPending();
      return pending.length;
    } catch {
      return 0;
    }
  };

  useEffect(() => {
    const handleConnectivityChange = async (state: any) => {
      const bCount = await checkQueueSize();
      setSyncState({
        isOnline: state.isOnline,
        latencyMs: state.latencyMs,
        backlogCount: bCount
      });
    };

    // Listen to physical networking
    const unsubscribeConn = ConnectivityService.subscribe(handleConnectivityChange);

    // Setup micro-polling for draft queue ticks
    const interval = setInterval(async () => {
      const bCount = await checkQueueSize();
      setSyncState(prev => ({
        ...prev,
        backlogCount: bCount
      }));
    }, 6000);

    return () => {
      unsubscribeConn();
      clearInterval(interval);
    };
  }, []);

  return {
    ...syncState,
    isDegraded: syncState.isOnline && syncState.latencyMs > 500,
    hasPendingUploads: syncState.backlogCount > 0
  };
}

export default useOfflineMobile;
