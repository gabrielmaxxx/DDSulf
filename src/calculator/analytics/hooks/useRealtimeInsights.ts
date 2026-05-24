import { useMemo } from 'react';
import { analyticsService } from '../services/analyticsService';
import { PricingInputs, PricingBreakdown } from '../../types';

export function useRealtimeInsights(inputs: PricingInputs, breakdown: PricingBreakdown) {
  const realtimeSnap = useMemo(() => {
    return analyticsService.getRealtimeProfitability(inputs, breakdown);
  }, [inputs, breakdown]);

  const aiReadyContext = useMemo(() => {
    return analyticsService.getAIReadyFormat(inputs, breakdown);
  }, [inputs, breakdown]);

  return {
    realtimeSnap,
    aiReadyContext
  };
}
