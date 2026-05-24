/**
 * DDSulf Organization & Multi-Tenant SaaS TypeScript Foundation Types
 */

export interface Tenant {
  id: string; // Dynamic isolation id (e.g., 'ddsulf_matriz')
  name: string; // Legal company name
  subdomain?: string;
  plan: 'essentials' | 'professional' | 'enterprise_grade';
  status: 'active' | 'suspended' | 'trialing';
  createdAt: string;
  updatedAt: string;
  limits: TenantLimits;
  branding: TenantBranding;
  activeFeatures: string[]; // Active feature-flag IDs (e.g., 'ai_negotiator', 'margin_guard')
}

export interface TenantLimits {
  maxUsers: number;
  maxSchedulesPerMonth: number;
  maxStorageBytes: number;
  maxWorkspaces: number;
  allowCustomBranding: boolean;
  allowPredictiveAI: boolean;
}

export interface TenantBranding {
  logoUrl?: string;
  primaryColor?: string; // Optional custom UI token override
  secondaryColor?: string;
  companySlogan?: string;
  customDomain?: string;
}

export interface OrganizationNode {
  id: string;
  tenantId: string;
  parentId: string | null; // Hierarchy structure
  name: string;
  type: 'headquarters' | 'branch_office' | 'department' | 'team';
  city?: string;
  state?: string;
  managerUid?: string;
}

export interface Workspace {
  id: string; // Workspace isolation id
  tenantId: string;
  name: string; // name (e.g., "Operação Erechim Centro", "Filial Passo Fundo")
  status: 'active' | 'inactive';
  createdAt: string;
}

export type Permission =
  | 'read:financial'
  | 'write:financial'
  | 'write:margin-override' // Proteção de Margem Financeira
  | 'read:analytics'
  | 'write:ops-schedule'
  | 'read:ops-schedule'
  | 'manage:inventory'
  | 'use:ai-orchestrator' // Governança de IA
  | 'manage:users'
  | 'manage:workspaces'
  | 'manage:tenant-settings';

export type UserRoleType = 'admin' | 'manager' | 'commercial' | 'technician' | 'operator';

export interface Role {
  name: UserRoleType;
  description: string;
  permissions: Permission[];
  hierarchyLevel: number; // For authority checks
}

export interface UserOrganizationContext {
  userId: string;
  tenantId: string;
  activeWorkspaceId: string;
  role: UserRoleType;
  permissions: Permission[];
  branding: TenantBranding;
  features: string[]; // List of active module identifiers
}

export interface TenantGovernancePolicy {
  tenantId: string;
  maximumDiscountRate: number; // Margin safety
  strictChecklistEnforcement: boolean; // POP execution safety
  allowOfflineDataCollection: boolean;
  alertOnLowStockPercentage: number;
}
