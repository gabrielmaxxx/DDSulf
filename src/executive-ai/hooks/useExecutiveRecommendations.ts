/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { recommendationService } from '../services/recommendationService';
import { ExecutiveRecommendation } from '../types';

export function useExecutiveRecommendations() {
  const [recommendations, setRecommendations] = useState<ExecutiveRecommendation[]>(() =>
    recommendationService.getRecommendations()
  );

  const refreshRecommendations = useCallback(() => {
    setRecommendations([...recommendationService.getRecommendations()]);
  }, []);

  const approve = useCallback((id: string, reviewer: string) => {
    const success = recommendationService.approveRecommendation(id, reviewer);
    if (success) {
      refreshRecommendations();
    }
    return success;
  }, [refreshRecommendations]);

  const reject = useCallback((id: string) => {
    const success = recommendationService.rejectRecommendation(id);
    if (success) {
      refreshRecommendations();
    }
    return success;
  }, [refreshRecommendations]);

  const transitionToImplemented = useCallback((id: string) => {
    const success = recommendationService.transitionToImplemented(id);
    if (success) {
      refreshRecommendations();
    }
    return success;
  }, [refreshRecommendations]);

  return {
    recommendations,
    approve,
    reject,
    transitionToImplemented,
    refreshRecommendations
  };
}
