/**
 * DDSulf Deployment & Release Governance Service
 * Manages virtual rollout states, environment parameters, and multi-tenant feature toggling.
 */

import { DeploymentRecord, EnvironmentType } from '../types';

class DeploymentService {
  private history: DeploymentRecord[] = [];

  constructor() {
    this.seedDefaultDeployments();
  }

  private seedDefaultDeployments() {
    this.history = [
      {
        id: 'dep_304',
        version: 'v2.4.1',
        environment: 'production',
        status: 'healthy',
        commitSha: '6fb9a12c',
        triggeredBy: 'github-actions',
        deployedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
        buildDurationMs: 114000,
        unresolvedErrorsCount: 0,
        canaryWeight: 100,
        tenantIsolationLevel: 'isolated',
      },
      {
        id: 'dep_303',
        version: 'v2.4.0',
        environment: 'production',
        status: 'rolled_back',
        commitSha: '1a4bc89e',
        triggeredBy: 'github-actions',
        deployedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
        buildDurationMs: 121000,
        unresolvedErrorsCount: 14,
        canaryWeight: 0,
        tenantIsolationLevel: 'isolated',
      },
      {
        id: 'dep_dev_109',
        version: 'v2.5.0-alpha.3',
        environment: 'development',
        status: 'healthy',
        commitSha: '9c8d10ee',
        triggeredBy: 'gabriel.max@ddsulf.com.br',
        deployedAt: new Date().toISOString(),
        buildDurationMs: 78000,
        unresolvedErrorsCount: 2,
        canaryWeight: 100,
        tenantIsolationLevel: 'shared',
      }
    ];
  }

  public getHistory(env?: EnvironmentType): DeploymentRecord[] {
    if (env) {
      return this.history.filter(d => d.environment === env);
    }
    return this.history;
  }

  public registerDeployment(record: Omit<DeploymentRecord, 'id' | 'deployedAt'>): DeploymentRecord {
    const full: DeploymentRecord = {
      id: `dep_${Math.floor(100 + Math.random() * 900)}`,
      deployedAt: new Date().toISOString(),
      ...record
    };
    this.history.unshift(full);
    return full;
  }

  public updateStatus(id: string, status: DeploymentRecord['status']) {
    const record = this.history.find(d => d.id === id);
    if (record) {
      record.status = status;
      if (status === 'rolled_back' || status === 'unhealthy') {
        record.canaryWeight = 0;
      }
    }
  }

  public setCanaryWeight(id: string, weight: number) {
    const record = this.history.find(d => d.id === id);
    if (record) {
      record.canaryWeight = Math.min(100, Math.max(0, weight));
    }
  }
}

export const deploymentService = new DeploymentService();
export default deploymentService;
