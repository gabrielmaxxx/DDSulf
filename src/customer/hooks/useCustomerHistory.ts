/**
 * Custom React Hook: useCustomerHistory
 * Maps structural historical logs, timelines and ratings completions.
 */

import { useState, useEffect } from 'react';
import { ServiceHistoryItem } from '../types';
import { CustomerRelationshipService } from '../services/customerService';

export function useCustomerHistory(customerId?: string) {
  const [history, setHistory] = useState<ServiceHistoryItem[]>([]);

  const reload = () => {
    const list = CustomerRelationshipService.getHistory();
    if (customerId) {
      setHistory(list.filter(h => h.customerId === customerId));
    } else {
      setHistory(list);
    }
  };

  useEffect(() => {
    reload();
    const unsub = CustomerRelationshipService.subscribe(reload);
    return () => unsub();
  }, [customerId]);

  const updateSatisfactionScore = (historyId: string, score: number) => {
    CustomerRelationshipService.reportNewSatisfactionScore(historyId, score);
  };

  return {
    history,
    updateSatisfactionScore
  };
}

export default useCustomerHistory;
