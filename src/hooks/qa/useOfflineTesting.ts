/**
 * Hook: useOfflineTesting
 * Handles local PWA cached lists, offline mutation queue processing, and local database state inspection.
 */

import { useState } from 'react';
import { qaMonitoringService } from '@/services/qa/qaMonitoringService';
import { OfflineSyncSimulation } from '@/types/qa';

export function useOfflineTesting() {
  const [queue, setQueue] = useState<OfflineSyncSimulation[]>(() => qaMonitoringService.getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState(false);

  const mockAppendOfflineItem = (type: OfflineSyncSimulation['payloadType'], data: Record<string, any>) => {
    const fresh = qaMonitoringService.enqueueOfflineMutation(type, data);
    setQueue([...qaMonitoringService.getOfflineQueue()]);
    return fresh;
  };

  const executeBackgroundSync = async () => {
    setIsSyncing(true);
    const results = await qaMonitoringService.processOfflineGatewaySync();
    setQueue([...qaMonitoringService.getOfflineQueue()]);
    setIsSyncing(false);
    return results;
  };

  return {
    queue,
    isSyncing,
    mockAppendOfflineItem,
    executeBackgroundSync,
    queuedItemsCount: queue.filter(q => q.status === 'queued').length
  };
}
