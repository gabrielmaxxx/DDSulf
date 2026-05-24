import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import { usePermissions } from './usePermissions';
import { PermissionModule, PermissionAction } from '../types';

export function useProtectedRoute(
  requiredModule?: PermissionModule,
  requiredAction: PermissionAction = 'read',
  redirectPath: string = '/login'
) {
  const { isAuthenticated, loading } = useAuth();
  const { can } = usePermissions();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;

    if (!isAuthenticated) {
      navigate(redirectPath);
      return;
    }

    if (requiredModule && !can(requiredModule, requiredAction)) {
      navigate('/unauthorized');
    }
  }, [isAuthenticated, loading, requiredModule, requiredAction, redirectPath, navigate, can]);

  return {
    isAuthorized: isAuthenticated && (!requiredModule || can(requiredModule, requiredAction)),
    loading
  };
}

export default useProtectedRoute;
