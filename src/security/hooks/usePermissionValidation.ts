/**
 * Hook: usePermissionValidation
 * Syntactic checking of a single target resource's permission.
 */

import { usePermissions } from '@/organization';
import { Permission } from '@/organization/types';

export function usePermissionValidation() {
  const { hasPermission, assertExecution } = usePermissions();

  return {
    validatePermission: (perm: Permission) => hasPermission(perm),
    validateTenantResourceAccess: (targetTenantId: string, perm: Permission) => assertExecution(targetTenantId, perm)
  };
}

export default usePermissionValidation;
