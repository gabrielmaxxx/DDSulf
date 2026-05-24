/**
 * DDSulf SaaS Organizational Governance & Policy Enforcement Service
 * Configures and inspects high-integrity limits, discount bounds, and field protocol constraints.
 */

import { TenantGovernancePolicy } from '../types';

class GovernanceService {
  private policies: Map<string, TenantGovernancePolicy> = new Map();

  constructor() {
    // Seed standard compliance rules
    this.policies.set('ddsulf_matriz', {
      tenantId: 'ddsulf_matriz',
      maximumDiscountRate: 0.15, // Max 15% discount for non-admins without override permissions
      strictChecklistEnforcement: true, // Requires technicians to mark checklists prior to service completion
      allowOfflineDataCollection: true,
      alertOnLowStockPercentage: 20
    });

    this.policies.set('dedetizadora_serra', {
      tenantId: 'dedetizadora_serra',
      maximumDiscountRate: 0.10, // Max 10%
      strictChecklistEnforcement: false,
      allowOfflineDataCollection: true,
      alertOnLowStockPercentage: 10
    });
  }

  /**
   * Retrieves active governance configuration for a tenant with fallback configurations
   */
  public getPolicy(tenantId: string): TenantGovernancePolicy {
    const fallback: TenantGovernancePolicy = {
      tenantId,
      maximumDiscountRate: 0.05,
      strictChecklistEnforcement: false,
      allowOfflineDataCollection: true,
      alertOnLowStockPercentage: 15
    };

    return this.policies.get(tenantId) || fallback;
  }

  /**
   * Modifies the corporate policy variables after authority confirmation
   */
  public updatePolicy(tenantId: string, policy: Partial<Omit<TenantGovernancePolicy, 'tenantId'>>): TenantGovernancePolicy {
    const existing = this.getPolicy(tenantId);
    const updated = { ...existing, ...policy };
    this.policies.set(tenantId, updated);
    return updated;
  }

  /**
   * Business Logic: Validates if a discount proposal violates maximum discount rates
   */
  public validateDiscount(tenantId: string, requestedDiscount: number, hasOverridePermission: boolean): {
    approved: boolean;
    reason?: string;
  } {
    const policy = this.getPolicy(tenantId);
    
    if (requestedDiscount <= policy.maximumDiscountRate) {
      return { approved: true };
    }

    if (hasOverridePermission) {
      return { 
        approved: true, 
        reason: 'Desconto acima do limite permitido foi aprovado por autorização explícita de gerente.' 
      };
    }

    return { 
      approved: false, 
      reason: `Desconto de ${(requestedDiscount * 100).toFixed(0)}% viola o teto de ${(policy.maximumDiscountRate * 100).toFixed(0)}% definido para a empresa.`
    };
  }
}

export const governanceService = new GovernanceService();
export default governanceService;
