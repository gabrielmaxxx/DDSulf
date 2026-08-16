import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { AuthLoading } from '../components/AuthLoading';

interface SuperAdminGuardProps {
  children: React.ReactNode;
}

/**
 * Frontend Guard for Super-Admin exclusively.
 * Ensures the logged in account possesses the isSuperAdmin custom claim.
 */
export function SuperAdminGuard({ children }: SuperAdminGuardProps) {
  const { isAuthenticated, loading, isSuperAdmin, user, role } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  const isAuthorized = isSuperAdmin || user?.isSuperAdmin || role === 'master' || user?.role === 'master';

  if (!isAuthenticated || !isAuthorized) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default SuperAdminGuard;
