/**
 * Custom React Hook: useRoleAccess
 * Resolves role classifications, descriptions, and hierarchy power rankings.
 */

import { useAuth } from '@/contexts/AuthContext';
import { rbacService } from '../services';
import { UserRoleType } from '../types';

export function useRoleAccess() {
  const { role: authRole, user } = useAuth();
  
  const activeRole: UserRoleType = (user?.role || authRole || 'operator') as UserRoleType;
  const roleConfig = rbacService.getRoleInfo(activeRole);

  /**
   * Evaluates if current user's authority level is higher than subject credentials
   */
  const canModifyUserWithRole = (subjectRole: UserRoleType): boolean => {
    return rbacService.canActionsAffectUser(activeRole, subjectRole);
  };

  return {
    role: activeRole,
    roleDetails: roleConfig,
    isAdmin: activeRole === 'admin',
    isManager: activeRole === 'manager',
    isCommercial: activeRole === 'commercial',
    isOperator: activeRole === 'operator',
    isTechnician: activeRole === 'technician',
    canModifyUserWithRole,
    hierarchyLevel: roleConfig.hierarchyLevel
  };
}

export default useRoleAccess;
