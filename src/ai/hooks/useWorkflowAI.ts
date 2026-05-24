/**
 * Custom React Hook: useWorkflowAI
 * Tracks queue delays, empty work checklist indicators, and workflow block ages.
 */

import { useContextualInsights } from './useContextualInsights';
import { SystemCoreContext } from '../types';
import { AIContextEngine } from '../context';

export function useWorkflowAI(customContext?: SystemCoreContext) {
  const context = customContext || AIContextEngine.getCachedContext();
  const { insights } = useContextualInsights(context);

  // Focus only on workflow and risk categories
  const workflowInsights = insights.filter(
    i => i.category === 'workflow' || i.category === 'risk'
  );

  const syncLatencyStatus = (context.metrics?.syncLatencyMs || 0) > 4000
    ? 'Latência Elevada'
    : 'Conectividade Estável';

  return {
    workflowInsights,
    syncLatencyMs: context.metrics?.syncLatencyMs || 0,
    syncLatencyStatus,
    stalledDraftsCount: context.metrics?.stalledDraftsCount || 0
  };
}

export default useWorkflowAI;
