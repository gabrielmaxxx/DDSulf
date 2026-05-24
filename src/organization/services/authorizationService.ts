/**
 * DDSulf Operational Authorization & Tenant Evaluation Engine
 * Validates cross-tenant safety, role hierarchy permissions and operational access vectors.
 */

import { Permission, UserRoleType } from '../types';
import { rbacService } from './rbacService';
import { tenantService } from './tenantService';

class AuthorizationService {
  /**
   * Asserts if an operation should be blocked due to cross-tenant trespasses
   */
  public isAccessSameTenant(userTenantId: string, targetingResourceTenantId: string): boolean {
    if (!userTenantId || !targetingResourceTenantId) return false;
    return userTenantId === targetingResourceTenantId;
  }

  /**
   * Complete check verifying if a user can execute a specific permission on a resources context
   */
  public async canExecute(params: {
    userTenantId: string;
    targetTenantId?: string;
    userRole: UserRoleType;
    requiredPermission: Permission;
  }): Promise<{ approved: boolean; code: 'granted' | 'forbidden' | 'cross_tenant_violation' | 'inactive_tenant' }> {
    // 1. Cross-tenant leakage protection
    if (params.targetTenantId && !this.isAccessSameTenant(params.userTenantId, params.targetTenantId)) {
      return { approved: false, code: 'cross_tenant_violation' };
    }

    // 2. Tenant status verification
    const tenantDetails = await tenantService.getTenantById(params.userTenantId);
    if (!tenantDetails || tenantDetails.status !== 'active') {
      return { approved: false, code: 'inactive_tenant' };
    }

    // 3. Permission checks via rbac mapping
    const hasPermission = rbacService.hasPermission(params.userRole, params.requiredPermission);
    if (!hasPermission) {
      return { approved: false, code: 'forbidden' };
    }

    return { approved: true, code: 'granted' };
  }

  /**
   * Sync check variant (optimized for fast client UI rendering fallback or local evaluations)
   */
  public canExecuteSync(params: {
    userTenantId: string;
    targetTenantId?: string;
    userRole: UserRoleType;
    requiredPermission: Permission;
  }): boolean {
    if (params.targetTenantId && !this.isAccessSameTenant(params.userTenantId, params.targetTenantId)) {
      return false;
    }
    return rbacService.hasPermission(params.userRole, params.requiredPermission);
  }
}

export const authorizationService = new AuthorizationService();
export default authorizationService;
