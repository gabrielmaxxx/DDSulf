import { useMemo } from 'react';
import { processRiskAnalysis } from '../viability/viabilityEngine';

export interface UseFinancialRiskParams {
  netMarginPercent: number;
  displacementKm: number;
  chemicalWasteSafetyCost: number;
  urgencyLevel: 'Normal' | 'Urgente' | 'Emergencial';
}

export function useFinancialRisk(params: UseFinancialRiskParams) {
  return useMemo(() => {
    return processRiskAnalysis({
      netMarginPercent: params.netMarginPercent,
      displacementKm: params.displacementKm,
      chemicalWasteSafetyCost: params.chemicalWasteSafetyCost,
      urgencyLevel: params.urgencyLevel
    });
  }, [params]);
}
