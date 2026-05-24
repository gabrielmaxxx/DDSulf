/**
 * Custom React Hook: useRelationshipInsights
 * Computes warning signals, loyalty highlights, and proactive actions metrics.
 */

import { useState, useEffect } from 'react';
import { CustomerRelationshipInsight } from '../types';
import { CustomerRelationshipService } from '../services/customerService';

export function useRelationshipInsights() {
  const [insights, setInsights] = useState<CustomerRelationshipInsight[]>([]);

  const reload = () => {
    setInsights(CustomerRelationshipService.calculateInsights());
  };

  useEffect(() => {
    reload();
    const unsub = CustomerRelationshipService.subscribe(reload);
    return () => unsub();
  }, []);

  return {
    insights,
    highRiskCount: insights.filter(i => i.impactLevel === 'high').length,
    mediumRiskCount: insights.filter(i => i.impactLevel === 'medium').length
  };
}

export default useRelationshipInsights;
