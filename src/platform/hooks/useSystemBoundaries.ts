/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { integrationGovernanceService } from '../services/integrationGovernanceService';
import { SystemContract } from '../types';

export function useSystemBoundaries() {
  const [activeContracts, setActiveContracts] = useState<SystemContract[]>([]);

  const loadContracts = useCallback(() => {
    setActiveContracts(integrationGovernanceService.getActiveContracts());
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const validateWorkspaceLeak = useCallback((tenantId: string, currentPayload: Record<string, any>) => {
    return integrationGovernanceService.evaluateTenantSanity(tenantId, currentPayload);
  }, []);

  const registerNewContract = useCallback((contract: Omit<SystemContract, 'id'>) => {
    const fresh = integrationGovernanceService.registerIntegrationContract(contract);
    loadContracts();
    return fresh;
  }, [loadContracts]);

  return {
    activeContracts,
    validateWorkspaceLeak,
    registerNewContract
  };
}
