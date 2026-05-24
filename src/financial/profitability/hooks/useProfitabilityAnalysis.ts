import { useMemo } from 'react';
import { EnvironmentType, OperationalComplexity, Recurrence } from '@/types/database';
import { useMarginIntelligence } from './useMarginIntelligence';
import { calculateDetailedOperationalMargins } from '../margin/marginEngine';
import { auditMarginAlerts } from '../alerts/alertSystem';

export interface UseProfitabilityAnalysisParams {
  sellingPrice: number;
  directCosts: number;
  indirectCosts: number;
  displacementKm: number;
  complexity: OperationalComplexity;
  environment: EnvironmentType;
  recurrence: Recurrence;
}

export function useProfitabilityAnalysis(params: UseProfitabilityAnalysisParams) {
  const { marginConfig, loading: loadingConfig } = useMarginIntelligence();

  const yields = useMemo(() => {
    return calculateDetailedOperationalMargins({
      sellingPrice: params.sellingPrice,
      directCosts: params.directCosts,
      indirectCosts: params.indirectCosts,
      displacementKm: params.displacementKm,
      complexity: params.complexity,
      environment: params.environment,
      recurrence: params.recurrence,
      config: marginConfig
    });
  }, [params, marginConfig]);

  const alerts = useMemo(() => {
    return auditMarginAlerts(yields, params.sellingPrice, params.displacementKm);
  }, [yields, params.sellingPrice, params.displacementKm]);

  return {
    yields,
    alerts,
    loadingConfig
  };
}
