/**
 * DDSulf Caching Engineering Infrastructure
 */

import { CachedQuery, CachePersistenceMode, SwrCacheOptions } from '../types';

class EnterpriseCachingEngine {
  private memoryMap = new Map<string, CachedQuery>();

  /**
   * Reads from multi-tiered cache with optimistic fallback and async validation callbacks
   */
  public async getOrFetchSWR<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: SwrCacheOptions
  ): Promise<T> {
    const cached = this.readFromTier(key, options.persistenceMode || 'memory');

    if (cached) {
      const { data, cachedAt } = cached;
      const isStale = Date.now() - cachedAt > options.staleAfterMs;
      const isExpired = Date.now() > cached.expiresAt;

      if (!isExpired) {
        if (isStale) {
          // Fire-and-forget update in background (Stale-While-Revalidate)
          this.triggerBackgroundRefetch(key, fetcher, options);
        }
        return data as T;
      }
    }

    // Cache miss or hard expiration
    const fresh = await fetcher();
    this.writeToTier(key, fresh, options);
    return fresh;
  }

  private readFromTier(key: string, mode: CachePersistenceMode): CachedQuery | null {
    if (mode === 'memory') {
      const current = this.memoryMap.get(key);
      if (!current) return null;
      if (Date.now() > current.expiresAt) {
        this.memoryMap.delete(key);
        return null;
      }
      return current;
    }

    // Local Storage Tier
    try {
      const persisted = localStorage.getItem(`ddsulf_cache_swr:${key}`);
      if (!persisted) return null;
      const parsed: CachedQuery = JSON.parse(persisted);
      if (Date.now() > parsed.expiresAt) {
        localStorage.removeItem(`ddsulf_cache_swr:${key}`);
        return null;
      }
      return parsed;
    } catch {
      return null;
    }
  }

  private writeToTier<T>(key: string, data: T, options: SwrCacheOptions): void {
    const expiresAt = Date.now() + options.ttlMs;
    const entry: CachedQuery = {
      key,
      data,
      cachedAt: Date.now(),
      expiresAt,
      hitsCount: 1
    };

    const mode = options.persistenceMode || 'memory';
    if (mode === 'memory') {
      this.memoryMap.set(key, entry);
    } else {
      try {
        localStorage.setItem(`ddsulf_cache_swr:${key}`, JSON.stringify(entry));
      } catch (err) {
        // Safe degrade storage to memory in case of quota limits
        this.memoryMap.set(key, entry);
      }
    }
  }

  private async triggerBackgroundRefetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    options: SwrCacheOptions
  ): Promise<void> {
    try {
      const fresh = await fetcher();
      this.writeToTier(key, fresh, options);
    } catch {
      // Suppress background failures, serving stale cache gracefully (Resilience pattern)
    }
  }

  /**
   * Evicts custom keys by pattern matching
   */
  public purge(prefix: string): number {
    let evictedCount = 0;
    
    // Purge memory
    for (const key of this.memoryMap.keys()) {
      if (key.startsWith(prefix)) {
        this.memoryMap.delete(key);
        evictedCount++;
      }
    }

    // Purge local storage
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const lKey = localStorage.key(i);
        if (lKey && lKey.startsWith(`ddsulf_cache_swr:${prefix}`)) {
          keysToRemove.push(lKey);
        }
      }
      keysToRemove.forEach(k => {
        localStorage.removeItem(k);
        evictedCount++;
      });
    } catch {}

    return evictedCount;
  }

  public getGlobalCacheCapacity(): { keysCount: number; memorySizeKb: number } {
    let size = this.memoryMap.size;
    return {
      keysCount: size,
      memorySizeKb: parseFloat((size * 0.72).toFixed(2))
    };
  }
}

export const cachingEngine = new EnterpriseCachingEngine();
export default cachingEngine;
