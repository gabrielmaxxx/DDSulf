import { OfflineMutationTask, SyncAction } from '../types';
import { generateUUID } from '../utils';

export class OfflineQueueManager {
  private static instance: OfflineQueueManager;
  private dbName = 'ddsulf_offline_db';
  private storeName = 'mutations_queue';
  private dbVersion = 1;

  public static getInstance(): OfflineQueueManager {
    if (!OfflineQueueManager.instance) {
      OfflineQueueManager.instance = new OfflineQueueManager();
    }
    return OfflineQueueManager.instance;
  }

  /**
   * Helper to initialize IndexedDB connection asynchronously
   */
  private getIDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not available in this environment.'));
        return;
      }

      const request = window.indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error || new Error('Failed to open IndexedDB'));
      };
    });
  }

  /**
   * Safe Fallback: Save task to LocalStorage if IndexedDB fails
   */
  private setLocalStorageFallback(tasks: OfflineMutationTask[]): void {
    try {
      localStorage.setItem('ddsulf_offline_fallback', JSON.stringify(tasks));
    } catch (e) {
      console.error('[OfflineQueue] LocalStorage fallback write failed:', e);
    }
  }

  private getLocalStorageFallback(): OfflineMutationTask[] {
    try {
      const val = localStorage.getItem('ddsulf_offline_fallback');
      return val ? JSON.parse(val) : [];
    } catch {
      return [];
    }
  }

  /**
   * Queue a new transaction mutation
   */
  public async enqueue(
    collectionName: string,
    documentId: string,
    action: SyncAction,
    payload: any,
    priority = 1
  ): Promise<OfflineMutationTask> {
    const task: OfflineMutationTask = {
      id: generateUUID('tsk'),
      collectionName,
      documentId,
      action,
      payload: JSON.parse(JSON.stringify(payload)),
      timestamp: new Date().toISOString(),
      retryCount: 0,
      priority,
    };

    try {
      const db = await this.getIDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.add(task);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[OfflineQueue] IndexedDB enqueue failed, sliding to LocalStorage fallback.', err);
      const tasks = this.getLocalStorageFallback();
      tasks.push(task);
      this.setLocalStorageFallback(tasks);
    }

    if (process.env.NODE_ENV !== 'production') {
      console.log(`%c📥 [OfflineQueue] Mutation Enqueued [${action}]: ${collectionName}/${documentId}`, 'color: #f59e0b;');
    }

    return task;
  }

  /**
   * Retrieve all queued tasks ordered by Priority (descending) and Timestamp (ascending)
   */
  public async getQueue(): Promise<OfflineMutationTask[]> {
    let tasks: OfflineMutationTask[] = [];

    try {
      const db = await this.getIDB();
      tasks = await new Promise<OfflineMutationTask[]>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch {
      tasks = this.getLocalStorageFallback();
    }

    // Sort: Priority descending, then timestamp ascending
    return tasks.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });
  }

  /**
   * Delete a task from the offline queue upon successful remote sync
   */
  public async dequeue(taskId: string): Promise<void> {
    try {
      const db = await this.getIDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(taskId);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      const tasks = this.getLocalStorageFallback();
      const updated = tasks.filter((t) => t.id !== taskId);
      this.setLocalStorageFallback(updated);
    }
  }

  /**
   * Update task retry metrics and record errors
   */
  public async failTask(taskId: string, errorMessage: string): Promise<void> {
    try {
      const db = await this.getIDB();
      const task = await new Promise<OfflineMutationTask>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(taskId);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });

      if (task) {
        task.retryCount += 1;
        task.lastError = errorMessage;

        await new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(this.storeName, 'readwrite');
          const store = transaction.objectStore(this.storeName);
          const request = store.put(task);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    } catch {
      const tasks = this.getLocalStorageFallback();
      const updated = tasks.map((t) => {
        if (t.id === taskId) {
          return { ...t, retryCount: t.retryCount + 1, lastError: errorMessage };
        }
        return t;
      });
      this.setLocalStorageFallback(updated);
    }
  }

  /**
   * Fully purge the queue
   */
  public async clearQueue(): Promise<void> {
    try {
      const db = await this.getIDB();
      await new Promise<void>((resolve, reject) => {
        const transaction = db.transaction(this.storeName, 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch {
      this.setLocalStorageFallback([]);
    }
  }
}

export const offlineQueue = OfflineQueueManager.getInstance();
