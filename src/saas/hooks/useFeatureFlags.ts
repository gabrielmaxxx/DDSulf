/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { subscriptionService } from '../services/subscriptionService';
import { SubscriptionPlanTier } from '../types';

export function useFeatureFlags(tenantId?: string) {
  const [flags, setFlags] = useState({
    enablePwaOfflineSync: true,
    enableGeminiPrecomputations: false,
    enableFinancialProAnalisys: false,
    enableDetailedPopsAudit: false,
  });

  const loadFeatureFlags = useCallback(() => {
    if (!tenantId) return;
    const sub = subscriptionService.getSubscriptionForTenant(tenantId);
    if (!sub) return;

    const tier = sub.planTier;
    setFlags({
      enablePwaOfflineSync: true, // all plans have basic offline support
      enableGeminiPrecomputations: tier === SubscriptionPlanTier.ENTERPRISE || tier === SubscriptionPlanTier.PROFESSIONAL,
      enableFinancialProAnalisys: tier === SubscriptionPlanTier.ENTERPRISE || tier === SubscriptionPlanTier.PROFESSIONAL,
      enableDetailedPopsAudit: tier === SubscriptionPlanTier.ENTERPRISE,
    });
  }, [tenantId]);

  useEffect(() => {
    loadFeatureFlags();
  }, [loadFeatureFlags]);

  return {
    flags,
    reloadFlags: loadFeatureFlags
  };
}
