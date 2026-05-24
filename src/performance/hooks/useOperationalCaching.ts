/**
 * useOperationalCaching hook
 */

import { useCallback } from 'react';
import { cachingEngine } from '../caching';
import { cachingOrchestrationService } from '../services';

export function useOperationalCaching(tenantId?: string) {
  
  /**
   * Safe fetch with SWR TTL capabilities bound by multi-tenant credentials
   */
  const fetchSWR = useCallback(async <T>(
    queryKey: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000,
    staleAfterMs: number = 30 * 1000
  ): Promise<T> => {
    // Isolate key namespace by tenant Id to protect cross-organization leaks
    const fullyScopeKey = tenantId ? `tenant:${tenantId}:${queryKey}` : `global:${queryKey}`;
    
    // Register details in orchestration service metadata
    cachingOrchestrationService.registerEntry(fullyScopeKey, tenantId ? 'isolation_tenant' : 'global', tenantId);

    return cachingEngine.getOrFetchSWR(fullyScopeKey, fetcher, {
      ttlMs,
      staleAfterMs,
      persistenceMode: tenantId ? 'memory' : 'local_storage' // Protect tenant records in memory only
    });
  }, [tenantId]);

  /**
   * Invalidates a custom cache namespace
   */
  const invalidateKey = useCallback((queryKey: string) => {
    const fullyScopeKey = tenantId ? `tenant:${tenantId}:${queryKey}` : `global:${queryKey}`;
    cachingEngine.purge(fullyScopeKey);
  }, [tenantId]);

  /**
   * Force vacuums all cached databases for safety
   */
  const forceVacuumTenant = useCallback(() => {
    if (tenantId) {
      cachingOrchestrationService.purgeTenantCache(tenantId);
    }
  }, [tenantId]);

  return {
    fetchSWR,
    invalidateKey,
    forceVacuumTenant,
    cacheOverview: cachingEngine.getGlobalCacheCapacity()
  };
}
