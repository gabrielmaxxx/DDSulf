/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { tenantService } from '../services/tenantService';
import { TenantInfo } from '../types';

export function useTenantContext() {
  const [currentTenant, setCurrentTenant] = useState<TenantInfo | null>(null);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);

  useEffect(() => {
    const list = tenantService.getTenants();
    setTenants(list);
    
    // Default to first active tentant if none set
    if (list.length > 0) {
      setCurrentTenant(list[0]);
    }
  }, []);

  const switchTenant = useCallback((tenantId: string) => {
    const match = tenantService.getTenantById(tenantId);
    if (match) {
      setCurrentTenant(match);
    }
  }, []);

  return {
    currentTenant,
    tenants,
    switchTenant
  };
}
