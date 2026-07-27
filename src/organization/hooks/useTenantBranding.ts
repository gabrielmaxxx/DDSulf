/**
 * Custom React Hook: useTenantBranding
 * Resolves custom themes, slogans and primary visual identities on a per-tenant scope.
 */

import { useOrganizational } from '../providers/OrganizationalProvider';
import { tenantService } from '../services';
import { TenantBranding } from '../types';

export function useTenantBranding() {
  const { activeTenant, switchTenant } = useOrganizational();

  const brand: TenantBranding = activeTenant?.branding || {
    primaryColor: '#111827',
    companySlogan: 'PestFlow'
  };

  /**
   * Modifies identity tokens inside local cache and db schemas
   */
  const updateVisualIdentity = async (updates: Partial<TenantBranding>) => {
    if (!activeTenant) return;
    await tenantService.updateBranding(activeTenant.id, updates);
    // Reload state or trigger trigger switch
    switchTenant(activeTenant.id);
  };

  return {
    brand,
    logoUrl: brand.logoUrl || '/brand/logo-full.svg',
    primaryColor: brand.primaryColor || '#111827',
    secondaryColor: brand.secondaryColor || '#6B7280',
    slogan: brand.companySlogan || '',
    updateBranding: updateVisualIdentity,
    hasCustomDomain: !!brand.customDomain
  };
}

export default useTenantBranding;
