/**
 * Unified Cache Keys and Governance Policies Service
 * Coordinates TanStack Query keys, TTL configurations, and local memory caches.
 */

export const CachePolicies = {
  ChemicalsList: {
    key: ['chemicals', 'list'] as const,
    staleTimeMs: 1000 * 60 * 15, // 15 minutes
    cacheTimeMs: 1000 * 60 * 60, // 1 hour
  },
  ActiveQuotes: {
    key: (tenantId: string) => ['quotes', tenantId, 'active'] as const,
    staleTimeMs: 1000 * 30, // 30 seconds
    cacheTimeMs: 1000 * 60 * 5, // 5 minutes
  },
  FinancialDashboard: {
    key: (period: string) => ['financials', 'dashboard', period] as const,
    staleTimeMs: 1000 * 60, // 1 minute
    cacheTimeMs: 1000 * 60 * 10, // 10 minutes
  },
  SeasonalTrends: {
    key: ['analytics', 'seasonality'] as const,
    staleTimeMs: 1000 * 60 * 60 * 2, // 2 hours
    cacheTimeMs: 1000 * 60 * 60 * 24, // 24 hours
  }
};

export class CacheService {
  private inMemoryCache_Map = new Map<string, { value: any; expiresAt: number }>();

  /**
   * Set simple in-memory generic cache value with custom TTL
   */
  public set(key: string, value: any, ttlMs: number): void {
    const expiresAt = Date.now() + ttlMs;
    this.inMemoryCache_Map.set(key, { value, expiresAt });
  }

  /**
   * Get dynamic cached client value if not expired
   */
  public get<T>(key: string): T | null {
    const cached = this.inMemoryCache_Map.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiresAt) {
      this.inMemoryCache_Map.delete(key);
      return null;
    }

    return cached.value as T;
  }

  /**
   * Remove specific cache entry
   */
  public invalidate(key: string): void {
    this.inMemoryCache_Map.delete(key);
  }

  /**
   * Clear all memory caches
   */
  public clearAllMemory(): void {
    this.inMemoryCache_Map.clear();
  }
}

export const cacheService = new CacheService();
