import { NetworkHealthState, OfflineMutationTask } from '../types';
import { offlineQueue } from '../offline/offlineQueue';
import { eventBus } from '../events/eventBus';
import { db } from '../../firebase';
import { doc, writeBatch, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export class SyncEngine {
  private static instance: SyncEngine;
  private networkState: NetworkHealthState = {
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    latencyMs: 30,
    dataSaverMode: false,
    lastConnectedTime: new Date().toISOString(),
  };
  private isSynchronizing = false;
  private listenersAttached = false;

  public static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  /**
   * Safe network and tab visibility monitoring
   */
  public initialize(): void {
    if (this.listenersAttached || typeof window === 'undefined') return;

    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));

    // Monitor visibility state to reduce mobile data usage on inactive background tabs
    document.addEventListener('visibilitychange', () => {
      this.networkState.dataSaverMode = document.visibilityState === 'hidden';
      if (document.visibilityState === 'visible' && this.networkState.isOnline) {
        // Force backlog processing on returning to active browser view
        this.processBacklog();
      }
    });

    this.listenersAttached = true;
    this.checkLatency();
    this.processBacklog();
  }

  public getHealth(): NetworkHealthState {
    return { ...this.networkState };
  }

  private async handleNetworkChange(isOnline: boolean): Promise<void> {
    this.networkState.isOnline = isOnline;
    if (isOnline) {
      this.networkState.lastConnectedTime = new Date().toISOString();
      this.checkLatency();
      eventBus.publish('sync:network_changed', { isOnline, latencyMs: this.networkState.latencyMs });
      this.processBacklog();
    } else {
      eventBus.publish('sync:network_changed', { isOnline, latencyMs: -1 });
    }
  }

  /**
   * Continuous background check to determine true server latency rounds
   */
  private async checkLatency(): Promise<void> {
    if (!this.networkState.isOnline) return;
    const start = Date.now();
    try {
      // Small fast handshake
      await fetch('/api/health', { method: 'HEAD' }).catch(() => {});
      this.networkState.latencyMs = Date.now() - start;
    } catch {
      this.networkState.latencyMs = 150; // Fallback estimate
    }
  }

  /**
   * Process pending operations in the offline queue (optimized using batching keys)
   */
  public async processBacklog(): Promise<void> {
    if (this.isSynchronizing || !this.networkState.isOnline) return;
    this.isSynchronizing = true;

    try {
      const backlog = await offlineQueue.getQueue();
      if (backlog.length === 0) {
        this.isSynchronizing = false;
        return;
      }

      console.log(`%c🔄 [SyncEngine] Syncing backlog of ${backlog.length} local operations...`, 'color: #3b82f6;');

      for (const task of backlog) {
        if (task.retryCount > 6) {
          console.warn(`[SyncEngine] Dropping unrecoverable task ${task.id} due to excessive retries.`);
          eventBus.publish('sync:error_encountered', { taskId: task.id, collection: task.collectionName, error: 'Maximum retry backoff exceeded.' });
          await offlineQueue.dequeue(task.id);
          continue;
        }

        try {
          // Execute Firestore Mutation
          await this.executeMutation(task);
          await offlineQueue.dequeue(task.id);
        } catch (err: any) {
          console.error(`[SyncEngine] Failed syncing task ${task.id}:`, err);
          await offlineQueue.failTask(task.id, err?.message || 'Unknown Firestore error');
          
          // Publish failure telemetry to warn administrative monitors
          eventBus.publish('sync:error_encountered', {
            taskId: task.id,
            collection: task.collectionName,
            error: err?.message || 'Write permission/validation exception',
          });

          // Break sequence on general connection loss to retry later
          break;
        }
      }

      // Re-evaluate remaining queue size
      const currentQueue = await offlineQueue.getQueue();
      if (currentQueue.length === 0) {
        eventBus.publish('sync:backlog_reconciled', { count: backlog.length });
      }
    } catch (e) {
      console.error('[SyncEngine] Critical backlog worker failed:', e);
    } finally {
      this.isSynchronizing = false;
    }
  }

  /**
   * Maps an offline task entity back to a real Firestore transaction or set update operation
   */
  private async executeMutation(task: OfflineMutationTask): Promise<void> {
    const docRef = doc(db, task.collectionName, task.documentId);

    switch (task.action) {
      case 'CREATE':
      case 'UPDATE':
        // Merge allows partial updates to coexist safely
        await setDoc(docRef, task.payload, { merge: true });
        break;
      case 'DELETE':
        await deleteDoc(docRef);
        break;
      default:
        throw new Error(`Unsupported transaction action: ${task.action}`);
    }
  }
}

export const syncEngine = SyncEngine.getInstance();
