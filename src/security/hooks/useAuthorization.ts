/**
 * Hook: useAuthorization
 * Coordinates role-permission authorizations on client context wrappers.
 */

import { usePermissions, useRoleAccess } from '@/organization';
import { Permission } from '@/organization/types';

export function useAuthorization() {
  const { hasPermission, permissions } = usePermissions();
  const { role, isManager, isAdmin, hierarchyLevel } = useRoleAccess();

  /**
   * Asserts if users are cleared for highly privileged operations
   */
  const restrictTo = (requiredRoleHierarchy: number): boolean => {
    return hierarchyLevel >= requiredRoleHierarchy;
  };

  return {
    role,
    permissions,
    hasPermission,
    restrictTo,
    isSuperUser: isAdmin || isManager,
    hasFinancialPrivileges: hasPermission('read:financial') || hasPermission('write:financial')
  };
}

export default useAuthorization;
