import { Role, PermissionAction, PermissionModule } from '../types';
import { UserProfile, UserPermissionsSchema } from '@/types/database';

export const PESTFLOW_MODULES = [
  'agenda',
  'orcamentos',
  'estoque',
  'pops',
  'financeiro',
  'ia',
  'contratos'
] as const;

/**
 * Normalizes legacy or alternative module names to Phase 3 canonical names
 */
export function normalizeModule(moduleName: string): string {
  const lower = moduleName.toLowerCase();
  switch (lower) {
    case 'calculator':
    case 'quotes':
      return 'orcamentos';
    case 'inventory':
      return 'estoque';
    case 'financial':
      return 'financeiro';
    case 'ai':
      return 'ia';
    case 'clients':
      return 'contratos';
    case 'dashboard':
      return 'agenda';
    default:
      return lower;
  }
}

/**
 * Normalizes action names ('read', 'write', 'update' -> 'view', 'edit', 'delete')
 */
export function normalizeAction(actionName: string): 'view' | 'edit' | 'delete' {
  const lower = actionName.toLowerCase();
  if (lower === 'read' || lower === 'view') return 'view';
  if (lower === 'write' || lower === 'update' || lower === 'edit') return 'edit';
  if (lower === 'delete') return 'delete';
  return 'view';
}

/**
 * Evaluates whether a user has permission for a specific module x action.
 * Master role ALWAYS bypasses all module permission checks.
 */
export function evaluatePermission(
  user: UserProfile | null,
  role: Role | null,
  module: PermissionModule,
  action: PermissionAction
): boolean {
  const effectiveRole = user?.role || role;

  // Master role bypass (and admin fallback)
  if (effectiveRole === 'master' || effectiveRole === 'admin') {
    return true;
  }

  if (!user || !user.permissions) {
    return false; // Deny by default if permissions object is not present
  }

  const canonicalModule = normalizeModule(module);
  const canonicalAction = normalizeAction(action);

  const modulePerms = user.permissions[canonicalModule];
  if (!modulePerms) {
    return false; // Deny by default if module is missing
  }

  return modulePerms[canonicalAction] === true;
}

export function hasPermission(
  role: Role | null,
  module: PermissionModule,
  action: PermissionAction,
  user?: UserProfile | null
): boolean {
  return evaluatePermission(user || null, role, module, action);
}

export function hasAllPermissions(
  role: Role | null,
  checks: Array<{ module: PermissionModule; action: PermissionAction }>,
  user?: UserProfile | null
): boolean {
  return checks.every(check => evaluatePermission(user || null, role, check.module, check.action));
}

export function hasAnyPermission(
  role: Role | null,
  checks: Array<{ module: PermissionModule; action: PermissionAction }>,
  user?: UserProfile | null
): boolean {
  return checks.some(check => evaluatePermission(user || null, role, check.module, check.action));
}
