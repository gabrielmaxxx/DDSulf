/**
 * Custom React Hook: useOrganizationalContext
 * Aggregates all organizational sub-properties into a single consolidated workspace configuration context.
 */

import { useOrganizational } from '../providers/OrganizationalProvider';
import { useRoleAccess } from './useRoleAccess';
import { usePermissions } from './usePermissions';
import { useTenantBranding } from './useTenantBranding';
import { useWorkspace } from './useWorkspace';

export function useOrganizationalContext() {
  const { isLoading, availableTenants, switchTenant } = useOrganizational();
  const { activeWorkspace, workspaces, switchWorkspace } = useWorkspace();
  const { role, hierarchyLevel, isAdmin, isManager, isCommercial } = useRoleAccess();
  const { permissions, hasPermission } = usePermissions();
  const { brand } = useTenantBranding();
  const { activeTenant } = useOrganizational();

  return {
    isLoading,
    tenant: activeTenant,
    workspace: activeWorkspace,
    role,
    hierarchyLevel,
    permissions,
    brand,
    availableWorkspaces: workspaces,
    availableTenants,
    featureFlags: activeTenant?.activeFeatures || [],
    isAdmin,
    isManager,
    isCommercial,
    hasPermission,
    switchTenant,
    switchWorkspace,
  };
}

export default useOrganizationalContext;
