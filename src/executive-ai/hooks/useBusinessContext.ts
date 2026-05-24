/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { businessContextService } from '../services/businessContextService';
import { BoardLevelSnapshot } from '../types';

export function useBusinessContext() {
  const [snapshot, setSnapshot] = useState<BoardLevelSnapshot>(() => 
    businessContextService.getBoardSnapshot()
  );

  const refreshSnapshot = useCallback(() => {
    setSnapshot({ ...businessContextService.getBoardSnapshot() });
  }, []);

  const setSafetyIndex = useCallback((val: number) => {
    businessContextService.updateSafetyIndex(val);
    refreshSnapshot();
  }, [refreshSnapshot]);

  const reserveAssets = useCallback((amountBrl: number) => {
    businessContextService.recordContingentAssetTransfer(amountBrl);
    refreshSnapshot();
  }, [refreshSnapshot]);

  return {
    snapshot,
    setSafetyIndex,
    reserveAssets,
    refreshSnapshot
  };
}
