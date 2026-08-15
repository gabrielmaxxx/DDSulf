import { UserProfile, UserRole, UserPermissionsSchema, ModulePermissionActions } from '@/types/database';

export type Role = UserRole;

export type PermissionAction = 'view' | 'edit' | 'delete' | 'read' | 'write' | 'update' | 'admin';
export type PermissionModule = 
  | 'agenda'
  | 'orcamentos'
  | 'estoque'
  | 'pops'
  | 'financeiro'
  | 'ia'
  | 'contratos'
  | 'dashboard'
  | 'calculator'
  | 'financial'
  | 'inventory'
  | 'clients'
  | 'quotes'
  | string;

export interface AuthSession {
  user: UserProfile | null;
  role: Role | null;
  empresaId: string | null;
  isSuperAdmin?: boolean;
  empresaSuspensa?: boolean;
  permissions: UserPermissionsSchema;
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrated: boolean;
}

export interface AuthError {
  code: string;
  message: string;
  timestamp: string;
}
