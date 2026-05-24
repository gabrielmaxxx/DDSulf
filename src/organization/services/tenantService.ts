/**
 * DDSulf Tenant Management Enterprise Infrastructure Service
 * Handles multi-tenant company onboarding, configuration and quota/limits enforcement.
 */

import { Tenant, TenantLimits, TenantBranding } from '../types';

class TenantService {
  private tenantsCache: Map<string, Tenant> = new Map();

  constructor() {
    // Seed standard mock database for multi-tenant simulation
    const seedTenants: Tenant[] = [
      {
        id: 'ddsulf_matriz',
        name: 'DDSulf Matriz Erechim',
        subdomain: 'erechim',
        plan: 'enterprise_grade',
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
        updatedAt: '2026-05-23T00:00:00Z',
        limits: {
          maxUsers: 100,
          maxSchedulesPerMonth: 5000,
          maxStorageBytes: 1099511627776, // 1TB
          maxWorkspaces: 10,
          allowCustomBranding: true,
          allowPredictiveAI: true,
        },
        branding: {
          logoUrl: undefined,
          primaryColor: '#4F46E5', // Nordic Indigo
          secondaryColor: '#10B981', // Nordic Mint Green
          companySlogan: 'DDSulf — Inteligência em Controle Ambiental',
        },
        activeFeatures: ['ai_negotiator', 'margin_guard', 'advanced_analytics', 'offline_mode'],
      },
      {
        id: 'dedetizadora_serra',
        name: 'Dedetizadora Serra Gaúcha Ltda',
        subdomain: 'serragaucha',
        plan: 'essentials',
        status: 'active',
        createdAt: '2026-03-15T12:00:00Z',
        updatedAt: '2026-05-23T12:00:00Z',
        limits: {
          maxUsers: 5,
          maxSchedulesPerMonth: 120,
          maxStorageBytes: 10737418240, // 10GB
          maxWorkspaces: 1,
          allowCustomBranding: false,
          allowPredictiveAI: false,
        },
        branding: {
          logoUrl: undefined,
          primaryColor: '#1F2937', // Obsidian Gray
          secondaryColor: '#DC2626', // Warm Red
          companySlogan: 'Protegendo sua família com responsabilidade.',
        },
        activeFeatures: ['offline_mode'],
      }
    ];

    seedTenants.forEach(t => this.tenantsCache.set(t.id, t));
  }

  /**
   * Retrieves tenant configuration by its ID, supporting offline cache values
   */
  public async getTenantById(tenantId: string): Promise<Tenant | null> {
    return this.tenantsCache.get(tenantId) || null;
  }

  /**
   * Validates if a tenant is allowed to perform a feature operation or if they are bounded by limits.
   */
  public async checkFeatureLimit(tenantId: string, limitKey: keyof TenantLimits, currentValue: number): Promise<boolean> {
    const tenant = await this.getTenantById(tenantId);
    if (!tenant) return false;

    const limit = tenant.limits[limitKey];
    if (typeof limit === 'number') {
      return currentValue < limit;
    }
    if (typeof limit === 'boolean') {
      return limit;
    }
    return false;
  }

  /**
   * Performs dynamic multi-tenant company onboarding setup inside the database
   */
  public async onboardingNewTenant(params: {
    id: string;
    name: string;
    subdomain: string;
    plan: Tenant['plan'];
    adminEmail: string;
  }): Promise<Tenant> {
    // Deduplicate
    if (this.tenantsCache.has(params.id)) {
      throw new Error(`Empresa (ID: ${params.id}) já cadastrada no cluster DDSulf.`);
    }

    const limits: TenantLimits = 
      params.plan === 'enterprise_grade' 
        ? { maxUsers: 250, maxSchedulesPerMonth: 10000, maxStorageBytes: 5497558138880, maxWorkspaces: 30, allowCustomBranding: true, allowPredictiveAI: true }
        : params.plan === 'professional'
        ? { maxUsers: 20, maxSchedulesPerMonth: 1000, maxStorageBytes: 107374182400, maxWorkspaces: 5, allowCustomBranding: true, allowPredictiveAI: false }
        : { maxUsers: 5, maxSchedulesPerMonth: 100, maxStorageBytes: 5368709120, maxWorkspaces: 1, allowCustomBranding: false, allowPredictiveAI: false };

    const newTenant: Tenant = {
      id: params.id,
      name: params.name,
      subdomain: params.subdomain,
      plan: params.plan,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      limits,
      branding: {
        primaryColor: '#111827',
        companySlogan: `Operação Inteligente - ${params.name}`
      },
      activeFeatures: params.plan === 'enterprise_grade' ? ['advanced_analytics', 'ai_negotiator'] : []
    };

    this.tenantsCache.set(newTenant.id, newTenant);
    return newTenant;
  }

  /**
   * Updates Tenant details in real-time
   */
  public async updateBranding(tenantId: string, branding: Partial<TenantBranding>): Promise<Tenant> {
    const tenant = this.tenantsCache.get(tenantId);
    if (!tenant) throw new Error(`Incapaz de localizar o tenant de ID: ${tenantId}`);

    tenant.branding = { ...tenant.branding, ...branding };
    tenant.updatedAt = new Date().toISOString();
    this.tenantsCache.set(tenantId, tenant);
    return tenant;
  }
}

export const tenantService = new TenantService();
export default tenantService;
