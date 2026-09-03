/**
 * Unit & Integration Test: Tenant Isolation & Security Boundary Verification
 * PestFlow Multi-Tenant Architecture
 */

import { describe, test, expect, beforeEach, beforeAll } from 'vitest';
import { BaseRepository } from '@/firebase/repositories/BaseRepository';
import { BaseFirestoreService } from '@/services/firestore/BaseFirestoreService';
import { getTenantCollectionPath, validateEmpresaId } from '@/tenant';
import { tenantStorage, getTenantStorageKey } from '@/utils/storage';
import { validationService } from '@/services/qa/validationService';

// Polyfill window & localStorage for Node test environment
beforeAll(() => {
  let store: Record<string, string> = {};
  const mockStorage = {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    key: (index: number) => Object.keys(store)[index] ?? null,
    get length() {
      return Object.keys(store).length;
    }
  };

  if (typeof global.window === 'undefined') {
    (global as any).window = global;
  }
  (global as any).localStorage = mockStorage;
  if (typeof window !== 'undefined') {
    (window as any).localStorage = mockStorage;
  }
});

describe('PestFlow Multi-Tenant Isolation Tests', () => {
  const TENANT_ALPHA = 'empresa_alpha';
  const TENANT_BETA = 'empresa_beta';

  beforeEach(() => {
    localStorage.clear();
  });

  test('Validates tenant ID format correctly', () => {
    expect(validateEmpresaId('empresa_alpha')).toBe(true);
    expect(validateEmpresaId('empresa-123')).toBe(true);
    expect(validateEmpresaId('../malicious')).toBe(false);
    expect(validateEmpresaId('')).toBe(false);
  });

  test('Constructs strict isolated tenant path structure', () => {
    const alphaPath = getTenantCollectionPath(TENANT_ALPHA, 'quotes');
    const betaPath = getTenantCollectionPath(TENANT_BETA, 'quotes');

    expect(alphaPath).toBe('empresas/empresa_alpha/quotes');
    expect(betaPath).toBe('empresas/empresa_beta/quotes');
    expect(alphaPath).not.toEqual(betaPath);
  });

  test('BaseRepository rejects unauthorized requests without tenant ID', async () => {
    class MockRepo extends BaseRepository<any> {
      protected collectionName = 'test_entities';
    }

    const repo = new MockRepo();
    await expect(repo.listAll('')).rejects.toThrow('empresaId é obrigatório');
    await expect(repo.getById('', 'item-123')).rejects.toThrow('empresaId é obrigatório');
    await expect(repo.save('', 'item-123', { name: 'Item Test' })).rejects.toThrow('empresaId é obrigatório');
    await expect(repo.delete('', 'item-123')).rejects.toThrow('empresaId é obrigatório');
  });

  test('BaseFirestoreService rejects unauthorized requests without tenant ID', async () => {
    class MockService extends BaseFirestoreService<any> {
      constructor() {
        super('test_entities');
      }
    }

    const service = new MockService();
    await expect(service.list('')).rejects.toThrow('empresaId é obrigatório');
    await expect(service.getById('', 'item-123')).rejects.toThrow('empresaId é obrigatório');
    await expect(service.create('', { name: 'Item Test' } as any)).rejects.toThrow('empresaId é obrigatório');
    await expect(service.update('', 'item-123', { name: 'Updated' })).rejects.toThrow('empresaId é obrigatório');
    await expect(service.hardDelete('', 'item-123')).rejects.toThrow('empresaId é obrigatório');
    await expect(service.softDelete('', 'item-123')).rejects.toThrow('empresaId é obrigatório');
  });

  test('tenantStorage prefixes keys with active tenant ID to isolate cache', () => {
    tenantStorage.setItem('user_settings', JSON.stringify({ theme: 'dark' }), TENANT_ALPHA);
    tenantStorage.setItem('user_settings', JSON.stringify({ theme: 'light' }), TENANT_BETA);

    const alphaRaw = tenantStorage.getItem('user_settings', TENANT_ALPHA);
    const betaRaw = tenantStorage.getItem('user_settings', TENANT_BETA);

    expect(JSON.parse(alphaRaw || '{}').theme).toBe('dark');
    expect(JSON.parse(betaRaw || '{}').theme).toBe('light');

    // Verify raw storage keys are prefixed
    const alphaKey = getTenantStorageKey('user_settings', TENANT_ALPHA);
    const betaKey = getTenantStorageKey('user_settings', TENANT_BETA);
    expect(alphaKey).toBe('pestflow_empresa_alpha_user_settings');
    expect(betaKey).toBe('pestflow_empresa_beta_user_settings');
    expect(localStorage.getItem(alphaKey)).toContain('dark');
    expect(localStorage.getItem(betaKey)).toContain('light');
  });

  test('clearCurrentTenant wipes only the designated tenant namespace', () => {
    tenantStorage.setItem('cache_1', 'alpha_data', TENANT_ALPHA);
    tenantStorage.setItem('cache_1', 'beta_data', TENANT_BETA);

    tenantStorage.clearCurrentTenant(TENANT_ALPHA);

    expect(tenantStorage.getItem('cache_1', TENANT_ALPHA)).toBeNull();
    expect(tenantStorage.getItem('cache_1', TENANT_BETA)).toBe('beta_data');
  });

  test('validationService flags cross-tenant data breach attempts', () => {
    const breachAttempt = validationService.runValidation('val_tenant_boundary', {
      userTenantId: TENANT_ALPHA,
      payloadTenantId: TENANT_BETA
    });

    expect(breachAttempt.valid).toBe(false);
    expect(breachAttempt.error).toContain('Data Breach Trigger');
  });
});
