/**
 * Hook to manage canary weights, multi-environment parameters, and deployment gates.
 */

import { useState, useEffect } from 'react';
import { deploymentService } from '../services/deploymentService';
import { DeploymentRecord, EnvironmentType } from '../types';

export function useDeploymentGovernance() {
  const [history, setHistory] = useState<DeploymentRecord[]>([]);

  useEffect(() => {
    setHistory(deploymentService.getHistory());
  }, []);

  const changeCanaryWeight = (id: string, weight: number) => {
    deploymentService.setCanaryWeight(id, weight);
    setHistory(deploymentService.getHistory());
  };

  const registerNewDeployment = (version: string, environment: EnvironmentType, isolation: DeploymentRecord['tenantIsolationLevel'] = 'isolated') => {
    const record = deploymentService.registerDeployment({
      version,
      environment,
      status: 'healthy',
      commitSha: Math.random().toString(16).substring(2, 10),
      triggeredBy: 'gabriel.max@ddsulf.com.br',
      buildDurationMs: 95000,
      unresolvedErrorsCount: 0,
      canaryWeight: 10,
      tenantIsolationLevel: isolation
    });
    setHistory(deploymentService.getHistory());
    return record;
  };

  return {
    history,
    changeCanaryWeight,
    registerNewDeployment,
    refreshGovHistory: () => setHistory(deploymentService.getHistory())
  };
}
