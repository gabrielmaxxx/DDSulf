/**
 * Custom React Hook: useScalableQueries
 * Handles paginations, lazy incremental loadings, and monitors reads and writes metrics.
 */

import { useState } from 'react';
import { MonitoringService } from '../services/infrastructureServices';

interface ScalableQueryOptions {
  queryHash: string;
  pageSize?: number;
}

export function useScalableQueries<T>(options: ScalableQueryOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchIncrementalBatch = async (
    fetcher: (pageNumber: number, size: number) => Promise<T[]>,
    reset: boolean = false
  ) => {
    setLoading(true);
    const start = performance.now();
    try {
      const currentPage = reset ? 1 : page;
      const size = options.pageSize || 10;
      const batch = await fetcher(currentPage, size);

      const duration = performance.now() - start;

      // Simulate Firebase Optimization tracking
      MonitoringService.logQuery(
        options.queryHash,
        batch.length, // Estimated rows read counts
        0,
        false,
        duration
      );

      setData(prev => reset ? batch : [...prev, ...batch]);
      setPage(currentPage + 1);
      setHasMore(batch.length === size);
    } catch (err) {
      console.error('[ScalableQueries] Failed to fetch increment:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    hasMore,
    page,
    fetchIncrementalBatch,
    resetQuery: () => {
      setData([]);
      setPage(1);
      setHasMore(true);
    }
  };
}

export default useScalableQueries;
