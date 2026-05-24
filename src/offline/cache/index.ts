/**
 * DDSulf High-Performance Local Cache Governance System
 * Handles TTL (Time-to-Live) checks, snapshot cache caches, and local data hydration.
 */

import { DDSulfIndexedDB, STORES } from '../persistence/indexedDb';

export interface CacheEntry<T = any> {
  id: string; // matches collection name
  docs: T[];
  cachedAt: number;
  ttlMs: number;
}

export class CacheService {
  private static DEFAULT_TTL = 1000 * 60 * 15; // 15 Minutes default TTL

  /**
   * Persists a list of Firestore document snapshots into local cache
   */
  public static async cacheCollection<T>(collectionName: string, docs: T[], customTtlMs?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      id: collectionName,
      docs,
      cachedAt: Date.now(),
      ttlMs: customTtlMs || this.DEFAULT_TTL
    };
    await DDSulfIndexedDB.put(STORES.SNAPSHOTS_CACHE, entry);
  }

  /**
   * Retrieves collection documents from local cache
   * Returns a tuple: [documents[], isStale]
   */
  public static async getCollection<T>(collectionName: string): Promise<[T[], boolean]> {
    try {
      const entry = await DDSulfIndexedDB.get<CacheEntry<T>>(STORES.SNAPSHOTS_CACHE, collectionName);
      if (!entry) {
        return [[], true];
      }

      const isStale = Date.now() - entry.cachedAt > entry.ttlMs;
      return [entry.docs, isStale];
    } catch {
      return [[], true];
    }
  }

  /**
   * Invalidates a specific collection cache item
   */
  public static async invalidate(collectionName: string): Promise<void> {
    await DDSulfIndexedDB.delete(STORES.SNAPSHOTS_CACHE, collectionName);
  }

  /**
   * Cleans up all expired cache schemas to save disk space
   */
  public static async pruneExpired(): Promise<void> {
    try {
      const all = await DDSulfIndexedDB.getAll<CacheEntry>(STORES.SNAPSHOTS_CACHE);
      for (const entry of all) {
        if (Date.now() - entry.cachedAt > entry.ttlMs) {
          await DDSulfIndexedDB.delete(STORES.SNAPSHOTS_CACHE, entry.id);
        }
      }
    } catch (err) {
      console.warn('[Cache Service] Expired items prune failed', err);
    }
  }
}
