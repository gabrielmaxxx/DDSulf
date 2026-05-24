/**
 * Custom React Hook: useCustomerAnalytics
 * Handles customer cohort stats, NPS averages, and retention rates.
 */

import { useState, useEffect } from 'react';
import { SatisfactionMetrics } from '../types';
import { CustomerRelationshipService } from '../services/customerService';

export function useCustomerAnalytics() {
  const [metrics, setMetrics] = useState<SatisfactionMetrics>({
    averageNpsScore: 90,
    customerRetentionRate: 0.95,
    churnRatePrev30Days: 2.0,
    collectedFeedbacksCount: 3
  });

  const reload = () => {
    setMetrics(CustomerRelationshipService.getSatisfactionMetrics());
  };

  useEffect(() => {
    reload();
    const unsub = CustomerRelationshipService.subscribe(reload);
    return () => unsub();
  }, []);

  return {
    ...metrics,
    npsGrade: metrics.averageNpsScore >= 80 ? 'Excelente' : 'Sub-Meta'
  };
}

export default useCustomerAnalytics;
