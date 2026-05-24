import { useMemo } from 'react';
import { evaluateOperationalViability } from '../viability/viabilityEngine';

export interface UseOperationalViabilityParams {
  netMarginPercent: number;
  totalProductCost: number;
  logisticsCost: number;
  laborCost: number;
  indirectOverhead: number;
  targetPrice: number;
}

export function useOperationalViability(params: UseOperationalViabilityParams) {
  return useMemo(() => {
    return evaluateOperationalViability({
      netMarginPercent: params.netMarginPercent,
      totalProductCost: params.totalProductCost,
      logisticsCost: params.logisticsCost,
      laborCost: params.laborCost,
      indirectOverhead: params.indirectOverhead,
      targetPrice: params.targetPrice
    });
  }, [params]);
}
