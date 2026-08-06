import { useAuth } from './useAuth';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '../permissions';
import { PermissionModule, PermissionAction } from '../types';

export function usePermissions() {
  const { role, user } = useAuth();

  const can = (module: PermissionModule, action: PermissionAction): boolean => {
    return hasPermission(role, module, action, user);
  };

  const canAll = (checks: Array<{ module: PermissionModule; action: PermissionAction }>): boolean => {
    return hasAllPermissions(role, checks, user);
  };

  const canAny = (checks: Array<{ module: PermissionModule; action: PermissionAction }>): boolean => {
    return hasAnyPermission(role, checks, user);
  };

  return {
    can,
    canAll,
    canAny,
    role,
    user
  };
}

export default usePermissions;
