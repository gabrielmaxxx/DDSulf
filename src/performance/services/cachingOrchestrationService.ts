/**
 * DDSulf Caching Orchestration Service
 * Controls multi-tenant tenant-key isolation, automated stale cache-invalidation cycles, and local storage limits.
 */

import { cachingEngine } from '../caching';
import { CacheEntryMeta } from '../types';

class CachingOrchestrationService {
  private registeredKeys = new Map<string, CacheEntryMeta>();

  /**
   * Safe registers a cached item with contextual multi-tenant credentials
   */
  public registerEntry(
    key: string,
    scope: CacheEntryMeta['scope'],
    tenantId?: string,
    sizeBytes: number = 250
  ): void {
    this.registeredKeys.set(key, {
      key,
      scope,
      tenantId,
      persistentMode: scope === 'global' ? 'local_storage' : 'memory',
      sizeBytes,
      lastAccessed: Date.now()
    });
  }

  /**
   * Invalidates all cached datasets belonging to a specific organization/tenant
   */
  public purgeTenantCache(tenantId: string): number {
    let count = 0;
    this.registeredKeys.forEach((meta, key) => {
      if (meta.tenantId === tenantId || key.includes(tenantId)) {
        cachingEngine.purge(key);
        this.registeredKeys.delete(key);
        count++;
      }
    });
    return count;
  }

  /**
   * Memory watchdog: if client cache exceeds 1MB, executes vacuum flush to preserve browser memory fairness
   */
  public inspectCacheLimits(maxSizeBytes: number = 1024 * 1024): { breached: boolean; freedBytes: number } {
    let totalBytes = 0;
    this.registeredKeys.forEach(meta => {
      totalBytes += meta.sizeBytes;
    });

    if (totalBytes > maxSizeBytes) {
      // Evict oldest 50% accessed entries
      const sorted = Array.from(this.registeredKeys.values()).sort((a, b) => a.lastAccessed - b.lastAccessed);
      const halfCount = Math.ceil(sorted.length / 2);
      let freed = 0;

      for (let i = 0; i < halfCount; i++) {
        const item = sorted[i];
        cachingEngine.purge(item.key);
        this.registeredKeys.delete(item.key);
        freed += item.sizeBytes;
      }

      return { breached: true, freedBytes: freed };
    }

    return { breached: false, freedBytes: 0 };
  }

  public getCacheInventory() {
    return Array.from(this.registeredKeys.values());
  }
}

export const cachingOrchestrationService = new CachingOrchestrationService();
export default cachingOrchestrationService;
