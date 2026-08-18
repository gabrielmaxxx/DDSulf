/**
 * Custom React Hook: useOfflineQueue
 * Sincronizador de ações offline e escrita em buffer.
 */

import { useState, useEffect } from 'react';
import { SyncEngineService } from '../services/infrastructureServices';
import { SyncPayload } from '../types';
import { tenantStorage } from '@/utils/storage';

export function useOfflineQueue() {
  const [offlineOperations, setOfflineOperations] = useState<SyncPayload[]>([]);

  const reload = () => {
    setOfflineOperations(SyncEngineService.getQueue());
  };

  useEffect(() => {
    reload();
    const unsub = SyncEngineService.subscribe(() => {
      reload();
    });
    return () => unsub();
  }, []);

  const pushToBuffer = (collection: string, docId: string, operation: 'create' | 'update' | 'delete', data: Record<string, any>) => {
    SyncEngineService.enqueue({
      collection,
      docId,
      operation,
      data
    });
  };

  return {
    offlineOperations,
    hasPendingOperations: offlineOperations.length > 0,
    pushToBuffer,
    clearBuffer: () => {
      tenantStorage.removeItem('infra_sync_queue');
      reload();
    }
  };
}

export default useOfflineQueue;
