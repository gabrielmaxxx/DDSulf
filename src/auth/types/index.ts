import { UserProfile, UserRole } from '@/types/database';

export type Role = UserRole;

export type PermissionAction = 'read' | 'write' | 'update' | 'delete' | 'admin';
export type PermissionModule = 'dashboard' | 'calculator' | 'financial' | 'inventory' | 'pops' | 'ai' | 'clients' | 'quotes';

export interface UserPermission {
  module: PermissionModule;
  actions: PermissionAction[];
}

export interface AuthSession {
  user: UserProfile | null;
  role: Role | null;
  permissions: UserPermission[];
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  timestamp: string;
}
