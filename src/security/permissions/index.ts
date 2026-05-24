/**
 * DDSulf Realtime Verification & Permission Evaluator
 */

import { UserRole, PermissionAction, SecurityModule } from '../types';
import { ROLE_LADDER } from '../roles';

export class PermissionEvaluator {
  /**
   * Assesses if a role is authorized to perform action on a specific module
   */
  public static can(
    role: UserRole | undefined | null,
    action: PermissionAction,
    module: SecurityModule
  ): boolean {
    if (!role) return false;

    const def = ROLE_LADDER[role];
    if (!def) return false;

    // Super Admin override
    if (role === 'super_admin') return true;

    // Check module permission
    const hasModule = def.allowedModules.includes(module);
    if (!hasModule) return false;

    // Check specific action permission
    const hasAction = def.allowedActions.includes(action);
    return hasAction;
  }

  /**
   * Safe data scrubber that recursively masks sensitive financial fields 
   * for lower-privileged roles (e.g. technicians, consultants)
   */
  public static sanitizeData<T extends Record<string, any>>(
    role: UserRole | undefined | null,
    data: T
  ): Partial<T> {
    if (!role || !data) return {};
    if (role === 'super_admin' || role === 'admin') return { ...data };

    const def = ROLE_LADDER[role];
    const restricted = def?.restrictedFields || [];

    if (restricted.length === 0) return { ...data };

    const sanitized = { ...data } as Record<string, any>;
    for (const key of restricted) {
      if (key in sanitized) {
        sanitized[key] = '[RESTRITO]';
      }
    }

    return sanitized as Partial<T>;
  }

  /**
   * Scrub an array of record entries
   */
  public static sanitizeList<T extends Record<string, any>>(
    role: UserRole | undefined | null,
    list: T[]
  ): Array<Partial<T>> {
    if (!list) return [];
    return list.map(item => this.sanitizeData(role, item));
  }
}
