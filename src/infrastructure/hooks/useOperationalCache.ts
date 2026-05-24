/**
 * Custom React Hook: useOperationalCache
 * Encapsule client-side and stale-while-revalidate caches mechanisms.
 */

import { useState } from 'react';
import { CacheService, MonitoringService } from '../services/infrastructureServices';

export function useOperationalCache() {
  const [cacheHits, setCacheHits] = useState(0);

  const getOrPerform = async <T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 30000
  ): Promise<T> => {
    const started = performance.now();
    const cached = CacheService.get<T>(key);
    if (cached) {
      setCacheHits(prev => prev + 1);
      MonitoringService.logQuery(key, 0, 0, true, performance.now() - started);
      return cached;
    }

    const fresh = await fetcher();
    CacheService.set(key, fresh, ttlMs);
    MonitoringService.logQuery(key, 1, 0, false, performance.now() - started);
    return fresh;
  };

  return {
    getOrPerform,
    cacheHits,
    invalidateCache: (key: string) => CacheService.invalidate(key),
    clearAllCache: () => CacheService.clear()
  };
}

export default useOperationalCache;
