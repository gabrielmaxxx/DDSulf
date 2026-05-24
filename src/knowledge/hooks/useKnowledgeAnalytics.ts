import { useState, useEffect, useCallback } from 'react';
import { DDSulfKnowledgeService } from '../services/knowledgeService';
import { KnowledgeAnalytics, ProcedureExecutionLog } from '../types';

export function useKnowledgeAnalytics() {
  const [metrics, setMetrics] = useState<KnowledgeAnalytics[]>([]);
  const [executions, setExecutions] = useState<ProcedureExecutionLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const service = DDSulfKnowledgeService.getInstance();

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const data = await service.getAnalyticsMetrics();
      const execs = service.getProcedureExecutions();
      setMetrics(data);
      setExecutions(execs);
    } catch (e) {
      console.error('Failed to resolve knowledge compliance statistics:', e);
    } finally {
      setLoading(false);
    }
  }, [service]);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  return {
    metrics,
    executions,
    refreshAnalytics: loadMetrics,
    loadingAnalytics: loading
  };
}
export default useKnowledgeAnalytics;
