/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { governanceService } from '../services/governanceService';
import { ModuleOwnership, TechnicalDebtItem } from '../types';

export function usePlatformGovernance() {
  const [ownerships, setOwnerships] = useState<ModuleOwnership[]>([]);
  const [debtItems, setDebtItems] = useState<TechnicalDebtItem[]>([]);
  const [complianceScore, setComplianceScore] = useState(100);

  const loadGovernanceData = useCallback(() => {
    const activeOwnerships = governanceService.getModulesOwnership();
    const activeDebt = governanceService.getTechnicalDebt();
    const computedScore = governanceService.compilePlatformComplianceScore();

    setOwnerships(activeOwnerships);
    setDebtItems(activeDebt);
    setComplianceScore(computedScore);
  }, []);

  useEffect(() => {
    loadGovernanceData();
  }, [loadGovernanceData]);

  const updateDebtStatus = useCallback((id: string, status: 'pending' | 'in_progress' | 'resolved') => {
    governanceService.updateTechnicalDebtStatus(id, status);
    loadGovernanceData();
  }, [loadGovernanceData]);

  const registerNewDebt = useCallback((item: Omit<TechnicalDebtItem, 'id'>) => {
    governanceService.registerTechnicalDebt(item);
    loadGovernanceData();
  }, [loadGovernanceData]);

  return {
    ownerships,
    debtItems,
    complianceScore,
    updateDebtStatus,
    registerNewDebt,
    reloadGovernance: loadGovernanceData
  };
}
