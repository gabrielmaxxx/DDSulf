/**
 * Custom React Hook: useContextualInsights
 * Feeds dashboards with real-time operational alerts, confidences, and actionable improvements.
 */

import { useState, useEffect } from 'react';
import { AIInsight, SystemCoreContext } from '../types';
import { AIOrchestrationService } from '../services/aiOrchestrationService';
import { AIContextEngine } from '../context';

export function useContextualInsights(customContext?: SystemCoreContext) {
  const [insights, setInsights] = useState<AIInsight[]>([]);

  useEffect(() => {
    const context = customContext || AIContextEngine.getCachedContext();
    setInsights(AIOrchestrationService.getLiveInsights(context));

    // Listen to local context updates or system triggers if needed
    const interval = setInterval(() => {
      const refreshedCtx = customContext || AIContextEngine.getCachedContext();
      setInsights(AIOrchestrationService.getLiveInsights(refreshedCtx));
    }, 10000); // Poll local context every 10s for reactive dashboards

    return () => clearInterval(interval);
  }, [customContext]);

  return {
    insights,
    hasCriticalAlerts: insights.some(i => i.impact === 'critical'),
    insightsCount: insights.length
  };
}

export default useContextualInsights;
