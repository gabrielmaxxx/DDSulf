import { useState, useEffect, useCallback } from 'react';
import { analyticsService } from '../services/analyticsService';
import { OperationalIntelligenceInsight, ForecastingScenario } from '../types';

export function useOperationalIntelligence() {
  const [insights, setInsights] = useState<OperationalIntelligenceInsight[]>([]);
  const [forecasts, setForecasts] = useState<ForecastingScenario[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const updateIntelligence = useCallback(() => {
    setLoading(true);
    try {
      const liveInsights = analyticsService.getOperationalInsights();
      const liveForecasts = analyticsService.getForecastingScenarios();
      setInsights(liveInsights);
      setForecasts(liveForecasts);
    } catch (e) {
      console.error('Failed to update operational intelligence', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    updateIntelligence();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pestflow_analytics_snapshots') {
        updateIntelligence();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [updateIntelligence]);

  return { insights, forecasts, loading, refreshIntelligence: updateIntelligence };
}
