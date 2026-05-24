/**
 * Custom React Hook: useAIRecommendations
 * Coordinates dismissed statuses, impact estimates, and prioritized recommendations lists.
 */

import { useState, useEffect } from 'react';
import { AIRecommendation, SystemCoreContext } from '../types';
import { AIOrchestrationService } from '../services/aiOrchestrationService';
import { AIContextEngine } from '../context';

export function useAIRecommendations(customContext?: SystemCoreContext) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  useEffect(() => {
    const context = customContext || AIContextEngine.getCachedContext();
    setRecommendations(AIOrchestrationService.getLiveRecommendations(context));
  }, [customContext]);

  const dismissRecommendation = (id: string) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const activeRecommendations = recommendations.filter(
    r => !dismissedIds.includes(r.id)
  );

  return {
    recommendations: activeRecommendations,
    dismissRecommendation,
    totalCount: activeRecommendations.length
  };
}

export default useAIRecommendations;
