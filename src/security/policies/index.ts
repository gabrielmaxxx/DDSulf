/**
 * DDSulf Declarative System-wide Security Policies Config
 * Restricts sensitive administrative transactions under remote, hazardous, or high-risk contexts.
 */

import { SecurityPolicy } from '../types';

export const SYSTEM_SECURITY_POLICIES: SecurityPolicy[] = [
  {
    id: 'policy_bulk_export_financial',
    module: 'financial',
    action: 'export',
    allowedRoles: ['super_admin', 'financeiro'],
    requiresMfa: true,
    requiresOnline: true
  },
  {
    id: 'policy_recalculate_pricing',
    module: 'calculator',
    action: 'recalculate',
    allowedRoles: ['super_admin', 'admin', 'financeiro'],
    requiresMfa: false,
    requiresOnline: false // Allowed offline, buffered dynamically in sync outbox queue
  },
  {
    id: 'policy_delete_quotes',
    module: 'quotes',
    action: 'delete',
    allowedRoles: ['super_admin', 'admin'],
    requiresMfa: true,
    requiresOnline: true
  },
  {
    id: 'policy_manage_erp_users',
    module: 'dashboard',
    action: 'manage_users',
    allowedRoles: ['super_admin', 'admin'],
    requiresMfa: true,
    requiresOnline: true
  }
];

export class SecurityPoliciesService {
  /**
   * Assesses if active request complies with current operational policies
   */
  public static validateActionPolicy(
    policyId: string,
    role: string,
    isOnline: boolean
  ): { allowed: boolean; reason?: string } {
    const policy = SYSTEM_SECURITY_POLICIES.find(p => p.id === policyId);
    if (!policy) return { allowed: true }; // Pass-through if no specialized security policy configured

    const hasRole = policy.allowedRoles.includes(role as any);
    if (!hasRole) {
      return { allowed: false, reason: 'Papel de usuário possui nível hierárquico insuficiente.' };
    }

    if (policy.requiresOnline && !isOnline) {
      return { allowed: false, reason: 'Esta transação financeira exige canal de conexão ativa e segura (online).' };
    }

    return { allowed: true };
  }
}
