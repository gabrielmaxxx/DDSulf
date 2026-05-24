/**
 * Hook: useDeploymentHealth
 */

import { useState, useEffect } from 'react';
import { deploymentService } from '../services/deploymentService';
import { DeploymentRecord } from '../types';

export function useDeploymentHealth() {
  const [history, setHistory] = useState<DeploymentRecord[]>([]);

  useEffect(() => {
    setHistory(deploymentService.getHistory());
  }, []);

  const triggerMockDeploy = (version: string) => {
    const fresh = deploymentService.registerDeployment({
      version,
      environment: 'production',
      status: 'healthy',
      commitSha: Math.random().toString(16).substring(2, 10),
      triggeredBy: 'github-actions-manual',
      buildDurationMs: 104000 + Math.random() * 20000,
      unresolvedErrorsCount: 0,
      tenantIsolationLevel: 'isolated'
    });
    setHistory(deploymentService.getHistory());
    return fresh;
  };

  return {
    history,
    triggerMockDeploy,
    refreshHistory: () => setHistory(deploymentService.getHistory())
  };
}
