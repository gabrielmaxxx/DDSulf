/**
 * Custom React Hook: usePermissions
 * Examines access scopes based on mapped roles, preventing unauthorized executions.
 */

import { useOrganizational } from '../providers/OrganizationalProvider';
import { Permission } from '../types';
import { useAuth } from '@/contexts/AuthContext';
import { authorizationService } from '../services';

export function usePermissions() {
  const { permissions, activeTenant } = useOrganizational();
  const { role } = useAuth();

  /**
   * Verifies if current user is authorized to perform a permission action
   */
  const hasPermission = (required: Permission): boolean => {
    return permissions.includes(required);
  };

  /**
   * Complete check verifying same tenant identity + role boundaries before action executions
   */
  const assertExecution = (targetResourceTenantId: string, required: Permission): boolean => {
    if (!activeTenant) return false;
    
    return authorizationService.canExecuteSync({
      userTenantId: activeTenant.id,
      targetTenantId: targetResourceTenantId,
      userRole: (role || 'operator') as any,
      requiredPermission: required
    });
  };

  return {
    permissions,
    hasPermission,
    assertExecution,
    isAuthorizedToOverrideMargins: permissions.includes('write:margin-override'),
    isAuthorizedToAccessFinancials: permissions.includes('read:financial')
  };
}

export default usePermissions;
