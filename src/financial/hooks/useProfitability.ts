import { useState, useMemo } from 'react';
import { calculateProfitability } from '../profitability/profitabilityEngine';
import { ProfitabilityMetrics } from '../types';

export function useProfitability(initialExecutionCost: number = 100) {
  const [executionCost, setExecutionCost] = useState<number>(initialExecutionCost);
  const [targetPrice, setTargetPrice] = useState<number>(250);
  const [minimumMarginPercent, setMinimumMarginPercent] = useState<number>(35.0);
  const [targetMarginPercent, setTargetMarginPercent] = useState<number>(55.0);
  const [taxRate, setTaxRate] = useState<number>(0.09);

  const metrics: ProfitabilityMetrics = useMemo(() => {
    return calculateProfitability(
      executionCost,
      targetPrice,
      minimumMarginPercent,
      targetMarginPercent,
      taxRate
    );
  }, [
    executionCost,
    targetPrice,
    minimumMarginPercent,
    targetMarginPercent,
    taxRate
  ]);

  return {
    executionCost,
    setExecutionCost,
    targetPrice,
    setTargetPrice,
    minimumMarginPercent,
    setMinimumMarginPercent,
    targetMarginPercent,
    setTargetMarginPercent,
    taxRate,
    setTaxRate,
    metrics
  };
}
