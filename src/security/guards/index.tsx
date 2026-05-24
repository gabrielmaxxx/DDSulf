/**
 * DDSulf React Action, Layout, and Financial Information Guards
 * Supports custom fallbacks and inline privilege elevation prompts.
 */

import React from 'react';
import { ShieldAlert, EyeOff } from 'lucide-react';
import { UserRole, PermissionAction, SecurityModule } from '../types';
import { PermissionEvaluator } from '../permissions';

interface GuardProps {
  role: UserRole | undefined | null;
  module: SecurityModule;
  action?: PermissionAction;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Secures nested button actions, navigation tabs, or text snippets
 */
export function PermissionGuard({
  role,
  module,
  action = 'view',
  fallback,
  children
}: GuardProps) {
  const isAllowed = PermissionEvaluator.can(role, action, module);

  if (isAllowed) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  // Generic clean premium authorization restriction banner
  return null;
}

interface FinancialGuardProps {
  role: UserRole | undefined | null;
  fallbackText?: string;
  children: React.ReactNode;
}

/**
 * Protective shield safeguarding overall margins, base operational rates and client financial calculations
 */
export function FinancialGuard({
  role,
  fallbackText = '•••',
  children
}: FinancialGuardProps) {
  const canAccessFinancials = 
    role === 'super_admin' || 
    role === 'admin' || 
    role === 'financeiro';

  if (canAccessFinancials) {
    return <>{children}</>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono text-xs cursor-not-allowed group relative" title="Campo restrito ao setor financeiro">
      <EyeOff className="w-3 h-3 text-neutral-500" />
      <span>{fallbackText}</span>
    </span>
  );
}

interface RoleGuardProps {
  userRole: UserRole | undefined | null;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export function RoleGuard({
  userRole,
  allowedRoles,
  fallback,
  children
}: RoleGuardProps) {
  const hasAccess = userRole && allowedRoles.includes(userRole);

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback !== undefined) {
    return <>{fallback}</>;
  }

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 text-center max-w-sm mx-auto my-8">
      <ShieldAlert className="w-10 h-10 text-amber-500 mx-auto mb-3" />
      <h3 className="text-sm font-semibold text-neutral-100">Acesso Restrito</h3>
      <p className="text-xs text-neutral-400 mt-1">Este módulo requer privilégios administrativos adicionais.</p>
    </div>
  );
}
export default PermissionGuard;
