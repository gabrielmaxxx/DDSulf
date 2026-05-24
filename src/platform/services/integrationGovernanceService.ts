/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SystemContract } from '../types';

export class IntegrationGovernanceService {
  private activeContracts: SystemContract[] = [];

  constructor() {
    this.initializeIntegrationContracts();
  }

  private initializeIntegrationContracts() {
    this.activeContracts = [
      { id: 'cnt_telemetry_to_auth', sourceModule: 'Telemetry', targetModule: 'Auth', interfaceName: 'AuthTokenMetadata', isStable: true, validationRulesCount: 4 },
      { id: 'cnt_calc_to_stock', sourceModule: 'Calculadora', targetModule: 'Estoque', interfaceName: 'ChemicalDeductionResponse', isStable: true, validationRulesCount: 6 },
      { id: 'cnt_ai_to_pops', sourceModule: 'AI Platform', targetModule: 'POPs', interfaceName: 'PopsSafetyGuideline', isStable: false, validationRulesCount: 2 },
      { id: 'cnt_dashboard_to_fin', sourceModule: 'Dashboard', targetModule: 'Financeiro', interfaceName: 'FinancialSummarySnapshot', isStable: true, validationRulesCount: 5 },
    ];
  }

  public getActiveContracts(): SystemContract[] {
    return this.activeContracts;
  }

  public registerIntegrationContract(contract: Omit<SystemContract, 'id'>): SystemContract {
    const newContract: SystemContract = {
      ...contract,
      id: `cnt_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`
    };
    this.activeContracts.push(newContract);
    return newContract;
  }

  /**
   * Scans if any target dependency violates pure multi-tenant data boundaries.
   */
  public evaluateTenantSanity(tenantId: string, currentPayload: Record<string, any>): boolean {
    // If tenantId exists inside nested properties, it must MATCH root segment
    const deeplyInjectedTenant = currentPayload.tenantId || currentPayload.metadata?.tenantId;
    if (deeplyInjectedTenant && deeplyInjectedTenant !== tenantId) {
      console.error(`SaaS Platform Leak blocked: payload tenant ${deeplyInjectedTenant} does not match contextual tenant ${tenantId}`);
      return false;
    }
    return true;
  }
}

export const integrationGovernanceService = new IntegrationGovernanceService();
export default integrationGovernanceService;
