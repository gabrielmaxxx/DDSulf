/**
 * DDSulf Caching Service
 * Manages query, optimistic updates, realtime stream caches, and AI response contexts.
 */

import { CachedQuery } from '../types';

class CacheService {
  private memoryCache = new Map<string, CachedQuery>();
  private defaultTTL = 10 * 60 * 1000; // 10 minutes default cache

  /**
   * Safe set item with dynamic expiration standard
   */
  public set(key: string, data: any, ttlMs: number = this.defaultTTL): void {
    const fresh: CachedQuery = {
      key,
      data,
      cachedAt: Date.now(),
      expiresAt: Date.now() + ttlMs,
      hitsCount: 1
    };
    this.memoryCache.set(key, fresh);
  }

  /**
   * Retrieves cache, if hit, increments diagnostic meter
   */
  public get(key: string): any | null {
    const entry = this.memoryCache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.memoryCache.delete(key);
      return null;
    }

    entry.hitsCount += 1;
    return entry.data;
  }

  /**
   * Invalidates custom patterns of query keys (e.g. invalidating 'tenant_matriz/*')
   */
  public invalidatePattern(prefix: string): number {
    let purged = 0;
    for (const key of this.memoryCache.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryCache.delete(key);
        purged++;
      }
    }
    return purged;
  }

  public clear(): void {
    this.memoryCache.clear();
  }

  public getCacheMetrics() {
    let hits = 0;
    let entriesCount = 0;
    for (const entry of this.memoryCache.values()) {
      entriesCount++;
      hits += entry.hitsCount;
    }
    return {
      totalCachedKeys: entriesCount,
      totalHitsAccrued: hits,
      memorySizeEstimateKb: parseFloat((entriesCount * 0.42).toFixed(2)) // mock sizes
    };
  }
}

export const cacheService = new CacheService();
export default cacheService;
