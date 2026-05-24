import { useAuth } from './useAuth';
import { hasPermission, hasAllPermissions, hasAnyPermission } from '../permissions';
import { PermissionModule, PermissionAction } from '../types';

export function usePermissions() {
  const { role } = useAuth();

  const can = (module: PermissionModule, action: PermissionAction): boolean => {
    return hasPermission(role, module, action);
  };

  const canAll = (checks: Array<{ module: PermissionModule; action: PermissionAction }>): boolean => {
    return hasAllPermissions(role, checks);
  };

  const canAny = (checks: Array<{ module: PermissionModule; action: PermissionAction }>): boolean => {
    return hasAnyPermission(role, checks);
  };

  return {
    can,
    canAll,
    canAny,
    role
  };
}

export default usePermissions;
