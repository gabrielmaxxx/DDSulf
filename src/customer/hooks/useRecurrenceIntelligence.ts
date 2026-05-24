/**
 * Custom React Hook: useRecurrenceIntelligence
 * Generates predictions scores for overdue cycles and alerts teams of commercial retention spaces.
 */

import { useState, useEffect } from 'react';
import { RecurrenceOpportunity } from '../types';
import { CustomerRelationshipService } from '../services/customerService';

export function useRecurrenceIntelligence() {
  const [opportunities, setOpportunities] = useState<RecurrenceOpportunity[]>([]);

  const reload = () => {
    setOpportunities(CustomerRelationshipService.calculateRecurrenceOpportunities());
  };

  useEffect(() => {
    reload();
    const unsub = CustomerRelationshipService.subscribe(reload);
    return () => unsub();
  }, []);

  return {
    opportunities,
    totalOverdueContracts: opportunities.length,
    estimatedMissedRevenue: opportunities.reduce((acc, curr) => acc + curr.estimatedRevenue, 0)
  };
}

export default useRecurrenceIntelligence;
