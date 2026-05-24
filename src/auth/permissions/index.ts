import { Role, UserPermission, PermissionAction, PermissionModule } from '../types';

/**
 * Static mapping of roles to permissions (ABAC security configuration)
 */
export const ROLE_PERMISSIONS: Record<Role, UserPermission[]> = {
  admin: [
    { module: 'dashboard', actions: ['read', 'write', 'update', 'delete', 'admin'] },
    { module: 'calculator', actions: ['read', 'write', 'update', 'delete', 'admin'] },
    { module: 'financial', actions: ['read', 'write', 'update', 'delete', 'admin'] },
    { module: 'inventory', actions: ['read', 'write', 'update', 'delete', 'admin'] },
    { module: 'pops', actions: ['read', 'write', 'update', 'delete', 'admin'] },
    { module: 'ai', actions: ['read', 'write', 'update', 'delete', 'admin'] },
    { module: 'clients', actions: ['read', 'write', 'update', 'delete', 'admin'] },
    { module: 'quotes', actions: ['read', 'write', 'update', 'delete', 'admin'] }
  ],
  manager: [
    { module: 'dashboard', actions: ['read', 'write', 'update'] },
    { module: 'calculator', actions: ['read', 'write', 'update', 'delete'] },
    { module: 'financial', actions: ['read', 'write', 'update'] },
    { module: 'inventory', actions: ['read', 'write', 'update', 'delete'] },
    { module: 'pops', actions: ['read', 'write', 'update', 'delete'] },
    { module: 'ai', actions: ['read', 'write', 'update'] },
    { module: 'clients', actions: ['read', 'write', 'update', 'delete'] },
    { module: 'quotes', actions: ['read', 'write', 'update', 'delete'] }
  ],
  commercial: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'calculator', actions: ['read', 'write', 'update'] },
    { module: 'financial', actions: [] }, // Financial completely restricted
    { module: 'inventory', actions: ['read'] },
    { module: 'pops', actions: ['read'] },
    { module: 'ai', actions: ['read', 'write'] },
    { module: 'clients', actions: ['read', 'write', 'update'] },
    { module: 'quotes', actions: ['read', 'write', 'update'] }
  ],
  technician: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'calculator', actions: ['read'] },
    { module: 'financial', actions: [] }, // Financial completely restricted
    { module: 'inventory', actions: ['read', 'write'] }, // Registering stock usage
    { module: 'pops', actions: ['read'] }, // Operational instructions
    { module: 'ai', actions: ['read', 'write'] }, // Operational assistance
    { module: 'clients', actions: ['read'] },
    { module: 'quotes', actions: ['read', 'update'] } // Executing, updating notes only
  ],
  operator: [
    { module: 'dashboard', actions: ['read'] },
    { module: 'calculator', actions: ['read', 'write'] },
    { module: 'financial', actions: [] },
    { module: 'inventory', actions: ['read'] },
    { module: 'pops', actions: ['read'] },
    { module: 'ai', actions: ['read'] },
    { module: 'clients', actions: ['read', 'write'] },
    { module: 'quotes', actions: ['read', 'write'] }
  ]
};

/**
 * Checks if a role has permission to carry out an action inside a module
 */
export function hasPermission(
  role: Role | null,
  module: PermissionModule,
  action: PermissionAction
): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;

  const modulePerm = permissions.find(p => p.module === module);
  if (!modulePerm) return false;

  // Admin access bypass
  if (modulePerm.actions.includes('admin')) return true;

  return modulePerm.actions.includes(action);
}

/**
 * Utility to verify multiple permissions (AND configuration)
 */
export function hasAllPermissions(
  role: Role | null,
  checks: Array<{ module: PermissionModule; action: PermissionAction }>
): boolean {
  return checks.every(check => hasPermission(role, check.module, check.action));
}

/**
 * Utility to verify multiple permissions (OR configuration)
 */
export function hasAnyPermission(
  role: Role | null,
  checks: Array<{ module: PermissionModule; action: PermissionAction }>
): boolean {
  return checks.some(check => hasPermission(role, check.module, check.action));
}
