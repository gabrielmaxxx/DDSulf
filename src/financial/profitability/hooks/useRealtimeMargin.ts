import { useState, useMemo } from 'react';
import { EnvironmentType, OperationalComplexity, PestType, Recurrence } from '@/types/database';
import { useProfitabilityAnalysis } from './useProfitabilityAnalysis';
import { evaluateOperationalViability, processRiskAnalysis } from '../viability/viabilityEngine';
import { formulateDecisionSupport } from '../decision/decisionEngine';

export interface UseRealtimeMarginParams {
  sellingPrice: number;
  directCosts: number;
  indirectCosts: number;
  displacementKm: number;
  complexity: OperationalComplexity;
  environment: EnvironmentType;
  pestType: PestType;
  recurrence: Recurrence;
  chemicalWasteSafetyCost: number;
  urgencyLevel: 'Normal' | 'Urgente' | 'Emergencial';
}

export function useRealtimeMargin(initialParams: UseRealtimeMarginParams) {
  const [params, setParams] = useState<UseRealtimeMarginParams>(initialParams);

  // Profitability and Margins evaluations
  const { yields, alerts, loadingConfig } = useProfitabilityAnalysis({
    sellingPrice: params.sellingPrice,
    directCosts: params.directCosts,
    indirectCosts: params.indirectCosts,
    displacementKm: params.displacementKm,
    complexity: params.complexity,
    environment: params.environment,
    recurrence: params.recurrence
  });

  // Viability calculations
  const viability = useMemo(() => {
    return evaluateOperationalViability({
      netMarginPercent: yields.netMarginPercent,
      totalProductCost: params.directCosts * 0.4, // estimated raw chemical ratio
      logisticsCost: params.displacementKm * 1.85,
      laborCost: params.directCosts * 0.5,
      indirectOverhead: params.indirectCosts,
      targetPrice: params.sellingPrice
    });
  }, [yields.netMarginPercent, params, yields]);

  // Risk profile metrics
  const risk = useMemo(() => {
    return processRiskAnalysis({
      netMarginPercent: yields.netMarginPercent,
      displacementKm: params.displacementKm,
      chemicalWasteSafetyCost: params.chemicalWasteSafetyCost,
      urgencyLevel: params.urgencyLevel
    });
  }, [yields.netMarginPercent, params]);

  // Decision recommendation formulary
  const decision = useMemo(() => {
    return formulateDecisionSupport({
      netMarginPercent: yields.netMarginPercent,
      environment: params.environment,
      complexity: params.complexity,
      pest: params.pestType,
      recurrence: params.recurrence,
      breakEvenThresholdPrice: yields.breakEvenThresholdPrice,
      currentProposedPrice: params.sellingPrice
    });
  }, [yields.netMarginPercent, params, yields.breakEvenThresholdPrice]);

  return {
    params,
    setParams,
    yields,
    alerts,
    viability,
    risk,
    decision,
    loadingConfig
  };
}
