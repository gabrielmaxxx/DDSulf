import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './components/LoginScreen';
import { AuthLoading } from './components/AuthLoading';

/**
 * LoginPage component that displays the login view and handles 
 * automatic redirection for already authenticated users.
 */
export function LoginPage() {
  const { isAuthenticated, loading, isSuperAdmin, role, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return <AuthLoading />;
  }

  // If user is already authenticated, redirect to destination or dashboard/superadmin
  if (isAuthenticated) {
    const isSuper = isSuperAdmin || user?.isSuperAdmin || role === 'master' || user?.role === 'master';
    const fromPath = (location.state as { from?: { pathname?: string } })?.from?.pathname;

    if (fromPath && fromPath !== '/login') {
      return <Navigate to={fromPath} replace />;
    }

    if (isSuper) {
      return <Navigate to="/superadmin" replace />;
    }

    return <Navigate to="/" replace />;
  }

  return <LoginScreen />;
}

export default LoginPage;
