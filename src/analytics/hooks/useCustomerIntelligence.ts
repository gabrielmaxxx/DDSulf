/**
 * Hook: useCustomerIntelligence
 * Manages customer health, risk segments, and churn mitigation workflows.
 */

import { useState } from 'react';
import { customerIntelligenceService, CustomerSegmentStats } from '../services/customerIntelligenceService';
import { ChurnRiskIndicator } from '../types';

export function useCustomerIntelligence() {
  const [churnRisks, setChurnRisks] = useState<ChurnRiskIndicator[]>(() =>
    customerIntelligenceService.getChurnRiskList()
  );
  const [segmentStats] = useState<CustomerSegmentStats[]>(() =>
    customerIntelligenceService.getSegmentStats()
  );

  const resolveRiskThreat = (customerId: string) => {
    customerIntelligenceService.remediateChurnRisk(customerId);
    setChurnRisks(customerIntelligenceService.getChurnRiskList());
  };

  const highRiskCustomersCount = churnRisks.filter(c => c.riskScore > 65).length;
  const averageLTVOverall = Math.round(
    segmentStats.reduce((sum, s) => sum + s.averageLTV, 0) / segmentStats.length
  );

  return {
    churnRisks,
    segmentStats,
    highRiskCustomersCount,
    averageLTVOverall,
    resolveRiskThreat
  };
}
