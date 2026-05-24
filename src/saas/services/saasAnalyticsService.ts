/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { tenantService } from './tenantService';
import { subscriptionService } from './subscriptionService';
import { billingService } from './billingService';
import { CommercialMetricSnapshot } from '../types';

export class SaasAnalyticsService {
  /**
   * Compiles global commercial figures based on active subscriptions
   */
  public compileCommercialAnalytics(): CommercialMetricSnapshot {
    const tenants = tenantService.getTenants();
    const subs = subscriptionService.getSubscriptions();
    const invoices = billingService.getInvoices();

    // 1. Calculate active MRR amount
    const activeMRR = subs
      .filter(s => s.status === 'active' || s.status === 'past_due')
      .reduce((sum, s) => sum + s.priceAmount, 0);

    // 2. Count Active Tenants
    const activeTenants = tenants.filter(t => t.status === 'active').length;

    // 3. Simple Trial conversion estimation
    const trialConvertedAmount = subs.filter(s => s.planTier !== 'trial').length;
    const totalSaaSLog = subs.length || 1;
    const conversionRatio = Math.round((trialConvertedAmount / totalSaaSLog) * 100);

    // 4. Overdue invoice penalties represent current churn
    const unpaidOverdueCount = invoices.filter(i => i.status === 'overdue').length;
    const totalInvoicesCount = invoices.length || 1;
    const rawChurn = Math.round((unpaidOverdueCount / totalInvoicesCount) * 4);

    return {
      mrrAmount: activeMRR,
      activeTenantsCount: activeTenants,
      trialConversionRate: conversionRatio,
      churnRatePercent: Math.max(1, rawChurn),
      avgLtvMs: activeMRR * 12
    };
  }
}

export const saasAnalyticsService = new SaasAnalyticsService();
export default saasAnalyticsService;
