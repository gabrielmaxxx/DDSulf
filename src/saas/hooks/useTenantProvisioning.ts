/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback } from 'react';
import { provisioningService } from '../services/provisioningService';
import { SubscriptionPlanTier } from '../types';

export function useTenantProvisioning() {
  const [provisioning, setProvisioning] = useState(false);

  const startTenantProvisionSequence = useCallback(async (
    name: string,
    slug: string,
    email: string,
    tier: SubscriptionPlanTier = SubscriptionPlanTier.TRIAL
  ) => {
    setProvisioning(true);
    try {
      const result = await provisioningService.provisionNewTenant(name, slug, email, tier);
      return result;
    } finally {
      setProvisioning(false);
    }
  }, []);

  return {
    provisioning,
    startTenantProvisionSequence
  };
}
