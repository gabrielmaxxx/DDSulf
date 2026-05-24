/**
 * Custom React Hook: useWorkflowAnalytics
 * Feeds automation dashboard screens with telemetry, success scores, and latency rates.
 */

import { useWorkflowEngine } from './useWorkflowEngine';

export function useWorkflowAnalytics() {
  const { metrics, instances } = useWorkflowEngine();

  // Aggregate standard data sets or provide default fallbacks
  const successRate = metrics?.successRate !== undefined ? metrics.successRate : 1.0;
  const averageLatencyMs = metrics?.averageLatencyMs !== undefined ? metrics.averageLatencyMs : 180;
  const totalTriggered = metrics?.totalTriggered !== undefined ? metrics.totalTriggered : 0;

  // Identify bottlenecks: Find ruleIds with the highest failure rates
  const calculateBottlenecks = () => {
    const errorMap: Record<string, { count: number; name: string }> = {};

    instances.forEach(i => {
      if (i.status === 'failed') {
        if (!errorMap[i.ruleId]) {
          errorMap[i.ruleId] = { count: 0, name: i.name };
        }
        errorMap[i.ruleId].count++;
      }
    });

    return Object.entries(errorMap)
      .map(([ruleId, details]) => ({
        ruleId,
        name: details.name,
        failuresCount: details.count
      }))
      .sort((a, b) => b.failuresCount - a.failuresCount);
  };

  return {
    successRate,
    averageLatencyMs,
    totalTriggered,
    bottlenecks: calculateBottlenecks(),
    hasBottlenecks: calculateBottlenecks().length > 0
  };
}

export default useWorkflowAnalytics;
