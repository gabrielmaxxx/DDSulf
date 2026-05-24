/**
 * Hook: useOperationalPerformance
 * Performs background queue scheduling of operational math/ledger updates to keep main UI cycles extremely fast.
 */

import { useState } from 'react';
import { optimizationService } from '../services';

export function useOperationalPerformance() {
  const [pendingTasksCount, setPendingTasksCount] = useState(() => optimizationService.getPendingTasksCount());

  const scheduleDeferredOperationalCalculation = (task: () => void) => {
    optimizationService.enqueueIdleTask(() => {
      task();
      setPendingTasksCount(optimizationService.getPendingTasksCount());
    });
    setPendingTasksCount(optimizationService.getPendingTasksCount());
  };

  return {
    pendingTasksCount,
    scheduleDeferredOperationalCalculation,
    clearDeferredProcessingTasks: () => {
      optimizationService.clearQueue();
      setPendingTasksCount(0);
    }
  };
}
