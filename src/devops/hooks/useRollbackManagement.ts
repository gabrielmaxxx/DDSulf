/**
 * Hook to execute rapid deployment restoration, edge-routing traffic mitigation, and fallback logging.
 */

import { useState } from 'react';
import { rollbackService } from '../services/rollbackService';

export function useRollbackManagement() {
  const [loading, setLoading] = useState(false);

  const executeImmediateRollback = (faultyId: string, author: string = 'gabriel.max@ddsulf.com.br') => {
    setLoading(true);
    try {
      const outcome = rollbackService.triggerAutomaticRollback(faultyId, author);
      return outcome;
    } finally {
      setLoading(false);
    }
  };

  return {
    executeImmediateRollback,
    isRollbackProcessing: loading
  };
}
