/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SubscriptionDetail, SubscriptionPlanTier, SubscriptionStatus } from '../types';

const SUBS_STORAGE_KEY = 'ddsulf_saas_subscriptions';

export class SubscriptionService {
  private subscriptionRecords: SubscriptionDetail[] = [];

  constructor() {
    this.initializeDefaultSubscriptions();
  }

  private initializeDefaultSubscriptions() {
    try {
      const saved = localStorage.getItem(SUBS_STORAGE_KEY);
      if (saved) {
        this.subscriptionRecords = JSON.parse(saved);
      } else {
        this.subscriptionRecords = [
          {
            tenantId: 'tenant_matriz_sul',
            planId: 'plan_corporate_enterprise',
            planTier: SubscriptionPlanTier.ENTERPRISE,
            status: SubscriptionStatus.ACTIVE,
            priceAmount: 1899.00,
            currency: 'BRL',
            billingInterval: 'month',
            currentPeriodStart: Date.now() - 15 * 86400000,
            currentPeriodEnd: Date.now() + 15 * 86450000,
            meteredQuotaLimits: {
              maxUsers: 150,
              maxPopsCount: 2000,
              maxCalculationsPerMonth: 10000,
              aiFeaturesEnabled: true
            },
            meteredUsageCurrent: {
              activeUsers: 84,
              popsRecordedThisMonth: 642,
              calculationsRunThisMonth: 3450
            }
          },
          {
            tenantId: 'tenant_bio_sanear',
            planId: 'plan_professional_gold',
            planTier: SubscriptionPlanTier.PROFESSIONAL,
            status: SubscriptionStatus.ACTIVE,
            priceAmount: 649.00,
            currency: 'BRL',
            billingInterval: 'month',
            currentPeriodStart: Date.now() - 5 * 86400000,
            currentPeriodEnd: Date.now() + 25 * 86450000,
            meteredQuotaLimits: {
              maxUsers: 25,
              maxPopsCount: 600,
              maxCalculationsPerMonth: 2500,
              aiFeaturesEnabled: true
            },
            meteredUsageCurrent: {
              activeUsers: 19,
              popsRecordedThisMonth: 112,
              calculationsRunThisMonth: 690
            }
          },
          {
            tenantId: 'tenant_agro_defensivos',
            planId: 'plan_starter_silver',
            planTier: SubscriptionPlanTier.STARTER,
            status: SubscriptionStatus.PAST_DUE,
            priceAmount: 249.00,
            currency: 'BRL',
            billingInterval: 'month',
            currentPeriodStart: Date.now() - 32 * 86400000,
            currentPeriodEnd: Date.now() - 2 * 86400000,
            meteredQuotaLimits: {
              maxUsers: 5,
              maxPopsCount: 150,
              maxCalculationsPerMonth: 500,
              aiFeaturesEnabled: false
            },
            meteredUsageCurrent: {
              activeUsers: 4,
              popsRecordedThisMonth: 68,
              calculationsRunThisMonth: 210
            }
          },
          {
            tenantId: 'tenant_novo_trial',
            planId: 'plan_free_trial',
            planTier: SubscriptionPlanTier.TRIAL,
            status: SubscriptionStatus.TRIALING,
            priceAmount: 0.00,
            currency: 'BRL',
            billingInterval: 'month',
            currentPeriodStart: Date.now() - 4 * 86400000,
            currentPeriodEnd: Date.now() + 10 * 86450000,
            meteredQuotaLimits: {
              maxUsers: 2,
              maxPopsCount: 20,
              maxCalculationsPerMonth: 50,
              aiFeaturesEnabled: true
            },
            meteredUsageCurrent: {
              activeUsers: 1,
              popsRecordedThisMonth: 3,
              calculationsRunThisMonth: 14
            }
          }
        ];
        this.persist();
      }
    } catch {
      // Catch error
    }
  }

  private persist() {
    try {
      localStorage.setItem(SUBS_STORAGE_KEY, JSON.stringify(this.subscriptionRecords));
    } catch (e) {
      console.warn('Subscription storage full or offline error:', e);
    }
  }

  public getSubscriptions(): SubscriptionDetail[] {
    return this.subscriptionRecords;
  }

  public getSubscriptionForTenant(tenantId: string): SubscriptionDetail | undefined {
    return this.subscriptionRecords.find(s => s.tenantId === tenantId);
  }

  /**
   * Upgrades subscription level or tier representing the platform scale up
   */
  public upgradePlan(tenantId: string, newTier: SubscriptionPlanTier): boolean {
    const sub = this.subscriptionRecords.find(s => s.tenantId === tenantId);
    if (!sub) return false;

    sub.planTier = newTier;
    sub.currentPeriodStart = Date.now();
    sub.currentPeriodEnd = Date.now() + 30 * 86450000;
    sub.status = SubscriptionStatus.ACTIVE;

    if (newTier === SubscriptionPlanTier.ENTERPRISE) {
      sub.priceAmount = 1899.00;
      sub.meteredQuotaLimits = {
        maxUsers: 150,
        maxPopsCount: 2000,
        maxCalculationsPerMonth: 10000,
        aiFeaturesEnabled: true
      };
    } else if (newTier === SubscriptionPlanTier.PROFESSIONAL) {
      sub.priceAmount = 649.00;
      sub.meteredQuotaLimits = {
        maxUsers: 25,
        maxPopsCount: 600,
        maxCalculationsPerMonth: 2500,
        aiFeaturesEnabled: true
      };
    } else {
      sub.priceAmount = 249.00;
      sub.meteredQuotaLimits = {
        maxUsers: 5,
        maxPopsCount: 150,
        maxCalculationsPerMonth: 500,
        aiFeaturesEnabled: false
      };
    }

    this.persist();
    return true;
  }

  /**
   * Checks if an action is compliant with tenant metered usages or if quota limit applies
   */
  public checkLimitCompliant(tenantId: string, metric: 'users' | 'pops' | 'calculations'): boolean {
    const sub = this.getSubscriptionForTenant(tenantId);
    if (!sub) return false;

    if (metric === 'users') {
      return sub.meteredUsageCurrent.activeUsers < sub.meteredQuotaLimits.maxUsers;
    }
    if (metric === 'pops') {
      return sub.meteredUsageCurrent.popsRecordedThisMonth < sub.meteredQuotaLimits.maxPopsCount;
    }
    if (metric === 'calculations') {
      return sub.meteredUsageCurrent.calculationsRunThisMonth < sub.meteredQuotaLimits.maxCalculationsPerMonth;
    }

    return false;
  }
}

export const subscriptionService = new SubscriptionService();
export default subscriptionService;
