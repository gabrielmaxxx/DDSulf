/**
 * Multi-Tenant Isolated Storage Engine for PestFlow
 * Ensures all local caches, queues, and offline states are strictly
 * partitioned by active empresaId (tenant ID) using the pattern:
 * pestflow_${empresaId}_${key}
 */

import { StateStorage } from 'zustand/middleware';

export function getActiveEmpresaId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('pestflow_tenant_id') || '';
}

export function getTenantStorageKey(key: string, customEmpresaId?: string): string {
  const empresaId = (customEmpresaId || getActiveEmpresaId() || 'sandbox').trim().toLowerCase();
  // Strip redundant legacy prefixes if present
  const cleanKey = key.replace(/^(pestflow_|ddsulf_|PESTFLOW_|DDSULF_)/i, '');
  return `pestflow_${empresaId}_${cleanKey}`;
}

export const tenantStorage = {
  getEmpresaId: (): string => getActiveEmpresaId(),
  getItem: (key: string, customEmpresaId?: string): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(getTenantStorageKey(key, customEmpresaId));
  },
  setItem: (key: string, value: string, customEmpresaId?: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(getTenantStorageKey(key, customEmpresaId), value);
  },
  removeItem: (key: string, customEmpresaId?: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(getTenantStorageKey(key, customEmpresaId));
  },
  clearTenant: (customEmpresaId?: string): void => {
    tenantStorage.clearCurrentTenant(customEmpresaId);
  },
  clearCurrentTenant: (customEmpresaId?: string): void => {
    if (typeof window === 'undefined') return;
    const empresaId = (customEmpresaId || getActiveEmpresaId()).trim().toLowerCase();
    if (!empresaId) return;
    const prefix = `pestflow_${empresaId}_`;
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) {
        toRemove.push(k);
      }
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  }
};

/**
 * Custom StateStorage adapter for Zustand persist middleware
 * Dynamically resolves the active tenant's namespace at read/write time
 */
export const tenantZustandStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const key = getTenantStorageKey(name);
    return localStorage.getItem(key);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return;
    const key = getTenantStorageKey(name);
    localStorage.setItem(key, value);
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return;
    const key = getTenantStorageKey(name);
    localStorage.removeItem(key);
  },
};
