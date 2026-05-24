/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TenantInfo, TenantStatus } from '../types';

const TENANTS_STORAGE_KEY = 'ddsulf_saas_tenants';

export class TenantService {
  private tenantsList: TenantInfo[] = [];

  constructor() {
    this.initializeDefaultTenants();
  }

  private initializeDefaultTenants() {
    try {
      const saved = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (saved) {
        this.tenantsList = JSON.parse(saved);
      } else {
        this.tenantsList = [
          {
            id: 'tenant_matriz_sul',
            name: 'DDSulf Controladores Associados LTDA',
            slug: 'ddsulf-matriz',
            status: TenantStatus.ACTIVE,
            createdAt: Date.now() - 365 * 86450000,
            contactEmail: 'contato@ddsulfmatriz.com.br'
          },
          {
            id: 'tenant_bio_sanear',
            name: 'Bio Sanear Controle Ambiental S/S',
            slug: 'biosanear',
            status: TenantStatus.ACTIVE,
            createdAt: Date.now() - 120 * 86450000,
            contactEmail: 'operacao@biosanear.com.br'
          },
          {
            id: 'tenant_agro_defensivos',
            name: 'Agro Campo Vetores e Pragas S.A.',
            slug: 'agrodefesa-sul',
            status: TenantStatus.ACTIVE,
            createdAt: Date.now() - 45 * 86450000,
            contactEmail: 'suporte@agrodefensivossul.com'
          },
          {
            id: 'tenant_novo_trial',
            name: 'Insetos Fora Dedetizadora Rural (Trial)',
            slug: 'insetosfora-trial',
            status: TenantStatus.PENDING_PROVISION,
            createdAt: Date.now(),
            contactEmail: 'gabrielmax0100@gmail.com'
          }
        ];
        this.persist();
      }
    } catch {
      // Offline fallback
    }
  }

  private persist() {
    try {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(this.tenantsList));
    } catch (e) {
      console.warn('Tenant offline storage full or inaccessible:', e);
    }
  }

  public getTenants(): TenantInfo[] {
    return this.tenantsList;
  }

  public registerTenant(tenant: Omit<TenantInfo, 'id' | 'createdAt'>): TenantInfo {
    const newTenant: TenantInfo = {
      ...tenant,
      id: `tenant_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      createdAt: Date.now()
    };
    this.tenantsList.unshift(newTenant);
    this.persist();
    return newTenant;
  }

  public updateTenantStatus(id: string, status: TenantStatus) {
    const t = this.tenantsList.find(item => item.id === id);
    if (t) {
      t.status = status;
      this.persist();
    }
  }

  public getTenantById(id: string): TenantInfo | undefined {
    return this.tenantsList.find(t => t.id === id);
  }
}

export const tenantService = new TenantService();
export default tenantService;
