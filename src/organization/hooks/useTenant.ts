/**
 * Custom React Hook: useTenant
 * Exposes current company details, active plans, subscription quotas, and feature flags checks.
 */

import { useOrganizational } from '../providers/OrganizationalProvider';
import { TenantLimits } from '../types';

export function useTenant() {
  const { activeTenant, availableTenants, isLoading, switchTenant, activeFeatures } = useOrganizational();

  /**
   * Evaluates if a given feature ID (e.g. 'ai_negotiator') is unlocked on the current SaaS subscription
   */
  const hasFeature = (featureId: string): boolean => {
    if (!activeTenant) return false;
    return activeFeatures.includes(featureId);
  };

  /**
   * Checks if current usage metrics exceed set plan values
   */
  const isUsageAllowed = (metricKey: keyof TenantLimits, currentValue: number): boolean => {
    if (!activeTenant) return false;
    const limitVal = activeTenant.limits[metricKey];
    if (typeof limitVal === 'number') {
      return currentValue < limitVal;
    }
    return !!limitVal;
  };

  return {
    tenant: activeTenant,
    availableTenants,
    isLoading,
    switchTenant,
    hasFeature,
    isUsageAllowed,
    limits: activeTenant?.limits || null,
    plan: activeTenant?.plan || 'essentials'
  };
}

export default useTenant;
