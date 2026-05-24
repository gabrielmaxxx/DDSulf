/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { telemetryService } from '../services/telemetryService';
import { ProductHealthScore, OperationalArea } from '../types';

export function useContinuousImprovement() {
  const [healthScore, setHealthScore] = useState<ProductHealthScore>({
    timestamp: Date.now(),
    overallScore: 88,
    dimensions: {
      engagement: 92,
      completionRate: 85,
      frictionIndex: 90,
      adoptionRate: 84
    }
  });
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Dynamically compile active metrics score based on recorded events
  const computeHealthScore = useCallback(async () => {
    try {
      const frictionEvents = await telemetryService.getRecentFrictionEvents(40);
      const telemetryEvents = await telemetryService.getRecentTelemetryEvents(150);

      const rageCount = frictionEvents.filter(f => f.type === 'rage_click').length;
      const errorCount = frictionEvents.filter(f => f.type === 'repeat_error').length;
      
      // Calculate Friction Penalty: Base 100, -5 per rage click, -2 per error
      const computedFrictionIndex = Math.max(50, 100 - (rageCount * 5) - (errorCount * 2));

      // Calculate Funnel Completion Rate: Ratio of workflow_complete over workflow_start
      const starts = telemetryEvents.filter(e => e.name === 'workflow_start').length;
      const completes = telemetryEvents.filter(e => e.name === 'workflow_complete').length;
      const computedCompletionRate = starts > 0 ? Math.min(100, Math.round((completes / starts) * 100)) : 85;

      // Calculate Feature Adoption and Engagement index
      const totalActivities = telemetryEvents.length;
      const engagementScore = totalActivities > 100 ? 98 : Math.min(100, Math.max(70, totalActivities * 2));
      
      // Compute final weight-balanced index
      const overall = Math.round(
        (engagementScore * 0.25) + 
        (computedCompletionRate * 0.3) + 
        (computedFrictionIndex * 0.25) + 
        (84 * 0.2) // adoption weight baseline
      );

      setHealthScore({
        timestamp: Date.now(),
        overallScore: overall,
        dimensions: {
          engagement: engagementScore,
          completionRate: computedCompletionRate,
          frictionIndex: computedFrictionIndex,
          adoptionRate: 84
        }
      });
    } catch {
      // Retain baseline state if any initialization error or empty DB occurs
    }
  }, []);

  useEffect(() => {
    computeHealthScore();
  }, [computeHealthScore]);

  // Form submit operations linking with product improvements
  const submitContextualFeedback = useCallback(async (
    area: OperationalArea,
    rating: number,
    feedbackText: string,
    associatedFrictionId?: string
  ): Promise<boolean> => {
    setSubmittingFeedback(true);
    try {
      await telemetryService.submitFeedback(area, rating, feedbackText, associatedFrictionId);
      // Re-trigger dynamic metrics recalculations
      await computeHealthScore();
      return true;
    } catch (e) {
      console.error('Failed to dispatch user feedback telemetry', e);
      return false;
    } finally {
      setSubmittingFeedback(false);
    }
  }, [computeHealthScore]);

  return {
    healthScore,
    submittingFeedback,
    submitContextualFeedback,
    recomputeScore: computeHealthScore
  };
}
