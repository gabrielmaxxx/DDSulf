/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionDetail, SubscriptionPlanTier } from '../types';

export function useSubscriptionLifecycle(tenantId?: string) {
  const [activeSub, setActiveSub] = useState<SubscriptionDetail | null>(null);

  const reloadSubscription = useCallback(() => {
    if (!tenantId) return;
    const s = subscriptionService.getSubscriptionForTenant(tenantId);
    if (s) {
      setActiveSub({ ...s });
    }
  }, [tenantId]);

  useEffect(() => {
    reloadSubscription();
  }, [reloadSubscription]);

  const upgradePlan = useCallback((tier: SubscriptionPlanTier) => {
    if (!tenantId) return false;
    const success = subscriptionService.upgradePlan(tenantId, tier);
    if (success) {
      reloadSubscription();
    }
    return success;
  }, [tenantId, reloadSubscription]);

  const verifyQuotaAvailable = useCallback((metric: 'users' | 'pops' | 'calculations') => {
    if (!tenantId) return false;
    return subscriptionService.checkLimitCompliant(tenantId, metric);
  }, [tenantId]);

  return {
    activeSub,
    upgradePlan,
    verifyQuotaAvailable,
    reloadSubscription
  };
}
