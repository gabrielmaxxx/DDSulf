import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../components/LoginScreen';
import { AuthLoading } from '../components/AuthLoading';
import { useSystemStore } from '@/store/systemStore';
import { CompanyLoginScreen } from '@/components/CompanyLoginScreen';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Higher-Order Route Protection Guard to wrap sensitive client UI sections
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { currentCompany } = useSystemStore();
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  // First requirement: Company must be authenticated (currentCompany should be set)
  if (!currentCompany) {
    return <CompanyLoginScreen />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

export default AuthGuard;
