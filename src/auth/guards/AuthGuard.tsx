import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginScreen } from '../components/LoginScreen';
import { AuthLoading } from '../components/AuthLoading';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Higher-Order Route Protection Guard to wrap sensitive client UI sections
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}

export default AuthGuard;
