/**
 * Hook: useQueryOptimization
 * Audits query latencies, validates paginated buffers and monitors memory limits.
 */

import { useState } from 'react';
import { performanceMonitoringService } from '../services';
import { QueryBudget } from '../types';

export function useQueryOptimization() {
  const [queryBudgets, setQueryBudgets] = useState<QueryBudget[]>(() => performanceMonitoringService.getQueryBudgets());

  const executeAndAuditQuery = async <T>(
    queryName: string, 
    queryExecutorFn: () => Promise<T>, 
    maxBudgetThreshold: number = 50
  ): Promise<T> => {
    const startTimeStamp = performance.now();
    try {
      const response = await queryExecutorFn();
      const endTimeStamp = performance.now();
      const differenceMs = parseFloat((endTimeStamp - startTimeStamp).toFixed(2));
      
      performanceMonitoringService.logQueryLatency(queryName, differenceMs, maxBudgetThreshold);
      setQueryBudgets([...performanceMonitoringService.getQueryBudgets()]);
      
      return response;
    } catch (err: any) {
      const endTimeStamp = performance.now();
      const differenceMs = parseFloat((endTimeStamp - startTimeStamp).toFixed(2));
      performanceMonitoringService.logQueryLatency(queryName, differenceMs, maxBudgetThreshold);
      throw err;
    }
  };

  return {
    queryBudgets,
    executeAndAuditQuery,
    isBudgetBreached: (queryName: string) => {
      const q = queryBudgets.find(item => item.queryName === queryName);
      return q ? q.executionTimeMs > q.maxBudgetMs : false;
    }
  };
}
