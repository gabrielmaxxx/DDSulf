import { useMemo } from 'react';
import { useHistoricalMetrics } from './useHistoricalMetrics';

export interface OperationalPatternCorrelation {
  pestType: string;
  typicalDensity: string; // e.g. "Alta", "Média"
  suggestedTechRatio: number; // technicians per 100m² typical
  hoursBenchmark: number;
}

export function useOperationalPatterns() {
  const { metrics, loading } = useHistoricalMetrics();

  const patternsList = useMemo<OperationalPatternCorrelation[]>(() => {
    if (!metrics) return [];

    const pests = Object.keys(metrics.frequenciaOperacional || {});
    return pests.map(pest => {
      // Determine typical operational constraints based on industry averages
      let typicalDensity = 'Média';
      let suggestedTechRatio = 0.5; // per 100m2
      let hoursBenchmark = 3.5;

      if (pest === 'Baratas') {
        typicalDensity = 'Alta';
        suggestedTechRatio = 0.8;
        hoursBenchmark = 3;
      } else if (pest === 'Cupins') {
        typicalDensity = 'Crítica';
        suggestedTechRatio = 1.5;
        hoursBenchmark = 10;
      } else if (pest === 'Ratos') {
        typicalDensity = 'Média';
        suggestedTechRatio = 0.6;
        hoursBenchmark = 5;
      }

      return {
        pestType: pest,
        typicalDensity,
        suggestedTechRatio,
        hoursBenchmark
      };
    });
  }, [metrics]);

  return {
    patterns: patternsList,
    loading
  };
}
