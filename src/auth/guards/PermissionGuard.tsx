import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionModule, PermissionAction } from '../types';

interface PermissionGuardProps {
  children: React.ReactNode;
  module: PermissionModule;
  action: PermissionAction;
  fallback?: React.ReactNode;
}

/**
 * Granular field or action-level authorization control wrapper
 */
export function PermissionGuard({ children, module, action, fallback = null }: PermissionGuardProps) {
  const { can } = usePermissions();

  if (!can(module, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export default PermissionGuard;
