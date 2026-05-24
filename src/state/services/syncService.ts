import { useOfflineStore } from '../offline/store';
import { useRealtimeStore } from '../realtime/store';
import { SyncStatus } from '../types';

export class SyncService {
  private static instance: SyncService;
  private isProcessing = false;

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Initialize browser listeners for connectivity
  public initializeListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.log('[SyncService] Connection recovered. Executing queue reconciliation...');
      useRealtimeStore.getState().setOnlineStatus(true);
      this.processQueue();
    });

    window.addEventListener('offline', () => {
      console.warn('[SyncService] Device is offline. Offline queue is now active.');
      useRealtimeStore.getState().setOnlineStatus(false);
    });
  }

  // Process the sync queue
  public async processQueue(): Promise<void> {
    const isOnline = useRealtimeStore.getState().isOnline;
    if (!isOnline || this.isProcessing) return;

    const { syncQueue, dequeueTask, incrementRetryCount, moveToFailedHistory } = useOfflineStore.getState();
    if (syncQueue.length === 0) return;

    this.isProcessing = true;
    useRealtimeStore.getState().setSyncing(true);
    console.log(`[SyncService] Processing ${syncQueue.length} pending local tasks...`);

    for (const task of syncQueue) {
      if (task.retryCount >= 5) {
        console.error(`[SyncService] Task ${task.id} exceeded max retries. Moving to historical logs.`);
        moveToFailedHistory(task.id);
        continue;
      }

      try {
        // Mocking database write synchronization delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // In production, we'd fire actual writes:
        // doc(db, task.collection, task.documentId) etc.
        console.log(`[SyncService] Successfully synchronized Task ${task.id} (${task.action} in ${task.collection})`);
        
        dequeueTask(task.id);
      } catch (err: any) {
        console.error(`[SyncService] Failed to process Task ${task.id}:`, err);
        incrementRetryCount(task.id, err?.message || 'Erro desconhecido');
        // Stop sequential queue execution if we encounter a true server/connection error
        break;
      }
    }

    this.isProcessing = false;
    useRealtimeStore.getState().setSyncing(false);
  }
}

export const syncService = SyncService.getInstance();
