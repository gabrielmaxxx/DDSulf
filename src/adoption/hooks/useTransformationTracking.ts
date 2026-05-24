/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { adoptionAnalyticsService } from '../services/adoptionAnalyticsService';
import { MigrationBatch } from '../types';

export function useTransformationTracking() {
  const [batches, setBatches] = useState<MigrationBatch[]>(() => adoptionAnalyticsService.getBatches());

  const startMigration = useCallback((systemName: string, recordsCount: number) => {
    const fresh = adoptionAnalyticsService.importNewBatch(systemName, recordsCount);
    setBatches([...adoptionAnalyticsService.getBatches()]);
    return fresh;
  }, []);

  const refreshBatches = useCallback(() => {
    setBatches([...adoptionAnalyticsService.getBatches()]);
  }, []);

  return {
    batches,
    startMigration,
    refreshBatches
  };
}
export default useTransformationTracking;
