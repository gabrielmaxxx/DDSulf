/**
 * Hook: useDecisionInsights
 * Allows acknowledging automated BI recommendations, logging anomalies, and injecting new decision parameters.
 */

import { useState } from 'react';
import { decisionEngineService } from '../services/decisionEngineService';
import { DecisionInsight } from '../types';

export function useDecisionInsights() {
  const [insights, setInsights] = useState<DecisionInsight[]>(() => decisionEngineService.getInsights());

  const executeApplyDecision = (id: string) => {
    decisionEngineService.applyInsight(id);
    setInsights(decisionEngineService.getInsights());
  };

  const createCustomAdvisoryTrigger = (
    category: 'anomaly' | 'profitability' | 'scheduling' | 'pesticide',
    title: string,
    description: string,
    action: string,
    score: number
  ) => {
    decisionEngineService.triggerInsight(category, title, description, action, score);
    setInsights(decisionEngineService.getInsights());
  };

  return {
    insights,
    unappliedInsights: insights.filter(i => !i.isApplied),
    appliedInsights: insights.filter(i => i.isApplied),
    executeApplyDecision,
    createCustomAdvisoryTrigger
  };
}
