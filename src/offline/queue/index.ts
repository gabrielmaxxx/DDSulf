/**
 * DDSulf Offline Operations Queue Service
 * Manages FIFO mutation pipelines, retries, and atomic transaction serialization.
 */

import { DDSulfIndexedDB, STORES } from '../persistence/indexedDb';
import { OfflineMutation, OfflineMutationType } from '../types';

export class OfflineQueueService {
  private static generateUUID(): string {
    if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }
    return 'mut_' + Date.now() + '_' + Math.floor(Math.random() * 1000000);
  }

  /**
   * Pushes a tactical mutation work unit into the IndexedDB local-first buffer
   */
  public static async enqueue<T>(
    collection: string,
    targetId: string,
    type: OfflineMutationType,
    payload: Partial<T>
  ): Promise<OfflineMutation<T>> {
    const id = this.generateUUID();
    const mutation: OfflineMutation<T> = {
      id,
      collection,
      targetId,
      type,
      payload,
      timestamp: Date.now(),
      retryCount: 0,
      status: 'pending',
      clientId: 'ddsulf_client_pwa'
    };

    await DDSulfIndexedDB.put(STORES.MUTATIONS_QUEUE, mutation);
    console.log(`%c[Offline Queue] Mutation Registered: ${collection}/${targetId} [${type.toUpperCase()}]`, 'color: #3b82f6;');
    return mutation;
  }

  /**
   * Retrieves pending mutations, returning them strictly sorted by ascending client execution timestamp
   */
  public static async getPending(): Promise<OfflineMutation[]> {
    const list = await DDSulfIndexedDB.getAll<OfflineMutation>(STORES.MUTATIONS_QUEUE);
    return list
      .filter(item => item.status === 'pending' || item.status === 'failed')
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Sets mutation transaction state to syncing before dispatching updates
   */
  public static async markSyncing(id: string): Promise<void> {
    const item = await DDSulfIndexedDB.get<OfflineMutation>(STORES.MUTATIONS_QUEUE, id);
    if (item) {
      item.status = 'syncing';
      item.lastAttemptAt = Date.now();
      await DDSulfIndexedDB.put(STORES.MUTATIONS_QUEUE, item);
    }
  }

  /**
   * Removes transaction item upon successful Cloud synchrony integration
   */
  public static async dequeue(id: string): Promise<void> {
    await DDSulfIndexedDB.delete(STORES.MUTATIONS_QUEUE, id);
    console.log(`%c[Offline Queue] Dequeued successfully synchronized mutation: ${id}`, 'color: #10b981;');
  }

  /**
   * Escalates fail trackers and stores contextual messages for subsequent diagnostic sessions
   */
  public static async markFailed(id: string, errorMessage: string): Promise<void> {
    const item = await DDSulfIndexedDB.get<OfflineMutation>(STORES.MUTATIONS_QUEUE, id);
    if (item) {
      item.status = 'failed';
      item.retryCount += 1;
      item.error = errorMessage;
      await DDSulfIndexedDB.put(STORES.MUTATIONS_QUEUE, item);
      console.warn(`[Offline Queue] Sync attempt failed for ${id}. Error: ${errorMessage}. Retries: ${item.retryCount}`);
    }
  }

  /**
   * Wipes out whole outstanding queue during disaster recovery manual commands
   */
  public static async clearQueue(): Promise<void> {
    await DDSulfIndexedDB.clear(STORES.MUTATIONS_QUEUE);
  }
}
