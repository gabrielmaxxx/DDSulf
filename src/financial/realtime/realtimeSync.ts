import { costEngineService } from '../services/costEngineService';
import { tenantStorage } from '@/utils/storage';

/**
 * Robustly synchronizes offline draft snapshots when connectivity is restored
 */
export async function synchronizeOfflineFinancialData(): Promise<{ synchronizedCount: number; errors: any[] }> {
  const offlineSnapshots = JSON.parse(tenantStorage.getItem('financial_snapshots') || '[]');
  if (offlineSnapshots.length === 0) {
    return { synchronizedCount: 0, errors: [] };
  }

  let successCount = 0;
  const errorsList: any[] = [];
  const unsyncedBack: any[] = [];

  for (const snapshot of offlineSnapshots) {
    // If it has local offline flag, push to remote firestore
    if (snapshot.isOfflineDraft || !snapshot.id.startsWith('firestore_')) {
      try {
        await costEngineService.saveTransactionalSnapshot({
          ...snapshot,
          id: `firestore_sync_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
        });
        successCount++;
      } catch (err) {
        console.error('Falha ao sincronizar snapshot offline específico:', err);
        errorsList.push(err);
        unsyncedBack.push(snapshot);
      }
    } else {
      unsyncedBack.push(snapshot);
    }
  }

  // Refreshes the local queue with any unsynced leftovers
  tenantStorage.setItem('financial_snapshots', JSON.stringify(unsyncedBack));

  return {
    synchronizedCount: successCount,
    errors: errorsList
  };
}

/**
 * Attaches a window offline/online event observer to execute autoshadow updates
 */
export function registerRealtimeOnlineSyncObserver(onSyncCompleted?: (count: number) => void): () => void {
  const handler = async () => {
    if (navigator.onLine) {
      console.log('Conexão de rede detectada. Iniciando sincronização inteligente do motor de custos...');
      const { synchronizedCount } = await synchronizeOfflineFinancialData();
      if (synchronizedCount > 0 && onSyncCompleted) {
        onSyncCompleted(synchronizedCount);
      }
    }
  };

  try {
    window.addEventListener('online', handler);
  } catch {}

  return () => {
    try {
      window.removeEventListener('online', handler);
    } catch {}
  };
}
