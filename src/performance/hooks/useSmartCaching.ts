/**
 * Hook: useSmartCaching
 * Facilitates custom client-side cache lookups, saving local network Round-Trip-Times on large operational lists.
 */

import { useState } from 'react';
import { cacheService } from '../services';

export function useSmartCaching() {
  const [metrics, setMetrics] = useState(() => cacheService.getCacheMetrics());

  const cachePayloadUnderKey = (key: string, data: any, ttlMs?: number) => {
    cacheService.set(key, data, ttlMs);
    setMetrics(cacheService.getCacheMetrics());
  };

  const getCachedPayload = (key: string): any | null => {
    const data = cacheService.get(key);
    setMetrics(cacheService.getCacheMetrics());
    return data;
  };

  return {
    cacheMetrics: metrics,
    cachePayloadUnderKey,
    getCachedPayload,
    invalidateCachePrefix: (prefix: string) => {
      cacheService.invalidatePattern(prefix);
      setMetrics(cacheService.getCacheMetrics());
    },
    clearGlobalCache: () => {
      cacheService.clear();
      setMetrics(cacheService.getCacheMetrics());
    }
  };
}
