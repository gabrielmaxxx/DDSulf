/**
 * DDSulf High-Performance Offline Mutation Engine
 * Implements optimistic local-first caching, queuing writes, and instant state replication.
 */

import { OfflineQueueService } from '../queue';
import { CacheService } from '../cache';

export class OfflineMutationEngine {
  /**
   * Optimistically creates a document, registers a write, and hydrates local store cache
   */
  public static async createDoc<T extends { id?: string }>(
    collectionName: string,
    targetId: string,
    data: T
  ): Promise<T> {
    const docWithId = { id: targetId, ...data } as T;

    // 1. Buffer the mutation to IndexedDB Outbox to play back later
    await OfflineQueueService.enqueue<T>(collectionName, targetId, 'create', docWithId);

    // 2. Hydrate local Cache immediately so the UI is updated instantly
    const [cachedList] = await CacheService.getCollection<T>(collectionName);
    
    // Uniqueness guard
    const updatedList = cachedList.filter(item => item.id !== targetId);
    updatedList.unshift(docWithId);

    await CacheService.cacheCollection(collectionName, updatedList);
    return docWithId;
  }

  /**
   * Optimistically updates an existing document, merges local cache, and enqueues changes
   */
  public static async updateDoc<T extends { id?: string }>(
    collectionName: string,
    targetId: string,
    data: Partial<T>
  ): Promise<void> {
    // 1. Buffer update mutation to standard outbox
    await OfflineQueueService.enqueue<T>(collectionName, targetId, 'update', data);

    // 2. Perform optimistic update directly in cache layer
    const [cachedList] = await CacheService.getCollection<T>(collectionName);
    const updatedList = cachedList.map(item => {
      if (item.id === targetId) {
        return { ...item, ...data };
      }
      return item;
    });

    await CacheService.cacheCollection(collectionName, updatedList);
  }

  /**
   * Optimistically deletes a document, purges it from cache, and queues deletion
   */
  public static async deleteDoc<T extends { id?: string }>(
    collectionName: string,
    targetId: string
  ): Promise<void> {
    // 1. Buffer delete request to database
    await OfflineQueueService.enqueue<any>(collectionName, targetId, 'delete', {});

    // 2. Prune out of local cache immediately
    const [cachedList] = await CacheService.getCollection<T>(collectionName);
    const filteredList = cachedList.filter(item => item.id !== targetId);

    await CacheService.cacheCollection(collectionName, filteredList);
  }
}
