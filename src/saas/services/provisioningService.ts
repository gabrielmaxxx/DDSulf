/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { tenantService } from './tenantService';
import { subscriptionService } from './subscriptionService';
import { TenantStatus, SubscriptionPlanTier, SubscriptionStatus } from '../types';

export class ProvisioningService {
  /**
   * Performs high-fidelity provision sequence of multi-tenant infrastructure
   */
  public async provisionNewTenant(
    name: string, 
    slug: string, 
    email: string, 
    initialTier: SubscriptionPlanTier = SubscriptionPlanTier.TRIAL
  ): Promise<{ tenantId: string; subId: string }> {
    
    // 1. Create Tenant Metadata Block
    const freshTenant = tenantService.registerTenant({
      name,
      slug: slug.toLowerCase().replace(/\s+/g, '-'),
      status: TenantStatus.ACTIVE,
      contactEmail: email
    });

    // 2. Provision Custom Subscription & Quotas bounds
    const baseQuota = this.generateQuotaPreset(initialTier);
    const subRecord = subscriptionService.getSubscriptions();

    const newSubRecord = {
      tenantId: freshTenant.id,
      planId: `plan_${initialTier}_new_${Date.now()}`,
      planTier: initialTier,
      status: initialTier === SubscriptionPlanTier.TRIAL ? SubscriptionStatus.TRIALING : SubscriptionStatus.ACTIVE,
      priceAmount: initialTier === SubscriptionPlanTier.ENTERPRISE ? 1899.0 : initialTier === SubscriptionPlanTier.PROFESSIONAL ? 649.0 : initialTier === SubscriptionPlanTier.STARTER ? 249.0 : 0.0,
      currency: 'BRL',
      billingInterval: 'month' as const,
      currentPeriodStart: Date.now(),
      currentPeriodEnd: Date.now() + 30 * 86400000,
      meteredQuotaLimits: baseQuota,
      meteredUsageCurrent: {
        activeUsers: 1,
        popsRecordedThisMonth: 0,
        calculationsRunThisMonth: 0
      }
    };

    subRecord.unshift(newSubRecord);
    try {
      localStorage.setItem('ddsulf_saas_subscriptions', JSON.stringify(subRecord));
    } catch {
      // offline silent error
    }

    return {
      tenantId: freshTenant.id,
      subId: newSubRecord.planId
    };
  }

  private generateQuotaPreset(tier: SubscriptionPlanTier) {
    switch (tier) {
      case SubscriptionPlanTier.ENTERPRISE:
        return { maxUsers: 150, maxPopsCount: 2000, maxCalculationsPerMonth: 10000, aiFeaturesEnabled: true };
      case SubscriptionPlanTier.PROFESSIONAL:
        return { maxUsers: 25, maxPopsCount: 600, maxCalculationsPerMonth: 2500, aiFeaturesEnabled: true };
      case SubscriptionPlanTier.STARTER:
        return { maxUsers: 5, maxPopsCount: 150, maxCalculationsPerMonth: 500, aiFeaturesEnabled: false };
      case SubscriptionPlanTier.TRIAL:
      default:
        return { maxUsers: 2, maxPopsCount: 20, maxCalculationsPerMonth: 50, aiFeaturesEnabled: true };
    }
  }
}

export const provisioningService = new ProvisioningService();
export default provisioningService;
