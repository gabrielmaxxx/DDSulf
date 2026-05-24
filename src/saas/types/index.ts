/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum SubscriptionPlanTier {
  TRIAL = 'trial',
  STARTER = 'starter',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  PAUSED = 'paused',
  TRIALING = 'trialing',
}

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_PROVISION = 'pending_provision',
}

export enum UserRoleRBAC {
  OWNER = 'owner',
  ADMIN_ADMINISTRATOR = 'admin',
  SUPERVISOR = 'supervisor',
  FIELD_TECHNICAL = 'field_technical',
}

export interface TenantInfo {
  id: string;
  name: string;
  slug: string;
  status: TenantStatus;
  createdAt: number;
  contactEmail: string;
}

export interface SubscriptionDetail {
  tenantId: string;
  planId: string;
  planTier: SubscriptionPlanTier;
  status: SubscriptionStatus;
  priceAmount: number;
  currency: string;
  billingInterval: 'month' | 'year';
  currentPeriodStart: number;
  currentPeriodEnd: number;
  meteredQuotaLimits: {
    maxUsers: number;
    maxPopsCount: number;
    maxCalculationsPerMonth: number;
    aiFeaturesEnabled: boolean;
  };
  meteredUsageCurrent: {
    activeUsers: number;
    popsRecordedThisMonth: number;
    calculationsRunThisMonth: number;
  };
}

export interface OrganizationInfo {
  id: string;
  tenantId: string;
  legalName: string;
  tradeName: string;
  cnpj: string;
  branches: Array<{
    id: string;
    branchName: string;
    city: string;
    activeTechnicalsCount: number;
  }>;
}

export interface CommercialMetricSnapshot {
  mrrAmount: number;
  activeTenantsCount: number;
  trialConversionRate: number; // percentage
  churnRatePercent: number;
  avgLtvMs: number; // custom lifetime metric
}

export interface InvoiceDetail {
  id: string;
  tenantId: string;
  amount: number;
  dueDate: number;
  paidDate?: number;
  status: 'paid' | 'open' | 'overdue';
  paymentMethod: string;
}
