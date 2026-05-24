import { useState, useEffect } from 'react';
import { useDashboardMetrics } from './useDashboardMetrics';
import { OperationalInsight, AnomalyLog } from '../types';

export function useOperationalInsights() {
  const { insights: rawInsights, anomalies: rawAnomalies, loading } = useDashboardMetrics('monthly');
  const [anomalies, setAnomalies] = useState<AnomalyLog[]>([]);

  useEffect(() => {
    if (rawAnomalies.length > 0) {
      setAnomalies(rawAnomalies);
    }
  }, [rawAnomalies]);

  const dismissAnomaly = (id: string) => {
    setAnomalies(prev => prev.filter(anom => anom.id !== id));
  };

  return {
    insights: rawInsights,
    anomalies,
    loading,
    dismissAnomaly
  };
}

export default useOperationalInsights;
