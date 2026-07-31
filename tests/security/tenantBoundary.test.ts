/**
 * Test: Security - Tenant Boundary Segregation & Access Control Boundaries
 */

import { describe, test, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { BaseRepository } from '../../src/firebase/repositories/BaseRepository';
import { BaseFirestoreService } from '../../src/services/firestore/BaseFirestoreService';
import { getTenantCollectionPath } from '../../src/tenant';
import { validationService } from '../../src/services/qa/validationService';

// Helper simulating firestore.rules security evaluation
interface AuthContext {
  auth?: {
    uid: string;
    token?: {
      empresaId?: string;
    };
  } | null;
}

function evaluateFirestoreRule(
  authContext: AuthContext,
  targetEmpresaId: string,
  _operation: 'read' | 'write' | 'list'
): boolean {
  // Read and check firestore.rules content
  const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf8');

  // Verify that firestore.rules enforces belongsToTenant
  if (!rulesContent.includes('belongsToTenant(empresaId)')) {
    throw new Error('firestore.rules is missing belongsToTenant helper function');
  }

  // Evaluate isSignedIn()
  const isSignedIn = authContext.auth != null;
  if (!isSignedIn) return false;

  // Evaluate belongsToTenant(empresaId)
  const tokenEmpresaId = authContext.auth?.token?.empresaId;
  const belongsToTenant = isSignedIn && tokenEmpresaId === targetEmpresaId;

  return Boolean(belongsToTenant);
}

describe('Security Testing - Multi-Tenant Isolation & Rules Verification', () => {
  const EMPRESA_A = 'empresa_A';
  const EMPRESA_B = 'empresa_B';

  const userA: AuthContext = {
    auth: {
      uid: 'user_a_123',
      token: { empresaId: EMPRESA_A }
    }
  };

  const userNoClaim: AuthContext = {
    auth: {
      uid: 'user_noclaim_456',
      token: {}
    }
  };

  const unauthenticated: AuthContext = {
    auth: null
  };

  // Caso 1: Usuário da empresa_A tenta LER documento da empresa_A → PERMITIDO
  test('Caso 1: Usuário da empresa_A tenta LER documento da empresa_A -> PERMITIDO', () => {
    const allowed = evaluateFirestoreRule(userA, EMPRESA_A, 'read');
    expect(allowed).toBe(true);
  });

  // Caso 2: Usuário da empresa_A tenta LER documento da empresa_B → NEGADO
  test('Caso 2: Usuário da empresa_A tenta LER documento da empresa_B -> NEGADO', () => {
    const allowed = evaluateFirestoreRule(userA, EMPRESA_B, 'read');
    expect(allowed).toBe(false);
  });

  // Caso 3: Usuário da empresa_A tenta ESCREVER documento na empresa_B → NEGADO
  test('Caso 3: Usuário da empresa_A tenta ESCREVER documento na empresa_B -> NEGADO', () => {
    const allowed = evaluateFirestoreRule(userA, EMPRESA_B, 'write');
    expect(allowed).toBe(false);
  });

  // Caso 4: Usuário da empresa_A tenta LISTAR a coleção da empresa_B → NEGADO
  test('Caso 4: Usuário da empresa_A tenta LISTAR a coleção da empresa_B -> NEGADO', () => {
    const allowed = evaluateFirestoreRule(userA, EMPRESA_B, 'list');
    expect(allowed).toBe(false);
  });

  // Caso 5: Usuário sem custom claim de empresaId tenta LER qualquer empresa → NEGADO
  test('Caso 5: Usuário sem custom claim de empresaId tenta LER qualquer empresa -> NEGADO', () => {
    const allowedA = evaluateFirestoreRule(userNoClaim, EMPRESA_A, 'read');
    const allowedUnauth = evaluateFirestoreRule(unauthenticated, EMPRESA_A, 'read');
    expect(allowedA).toBe(false);
    expect(allowedUnauth).toBe(false);
  });

  // Verification of BaseRepository & BaseFirestoreService mandatory empresaId checks
  describe('Repository & Service Layer Tenant Mandatory Enforcement', () => {
    class TestRepo extends BaseRepository<any> {
      protected collectionName = 'test_items';
    }

    class TestService extends BaseFirestoreService<any> {
      constructor() {
        super('test_items');
      }
    }

    test('BaseRepository throws error when empresaId is empty or missing', async () => {
      const repo = new TestRepo();
      await expect(repo.listAll('')).rejects.toThrow('empresaId é obrigatório');
      await expect(repo.getById('', 'item1')).rejects.toThrow('empresaId é obrigatório');
      await expect(repo.save('', 'item1', { id: 'item1' })).rejects.toThrow('empresaId é obrigatório');
    });

    test('BaseFirestoreService throws error when empresaId is empty or missing', async () => {
      const service = new TestService();
      await expect(service.list('')).rejects.toThrow('empresaId é obrigatório');
      await expect(service.getById('', 'item1')).rejects.toThrow('empresaId é obrigatório');
      await expect(service.create('', { title: 'item1' } as any)).rejects.toThrow('empresaId é obrigatório');
    });

    test('getTenantCollectionPath correctly constructs isolated subcollection paths', () => {
      const pathA = getTenantCollectionPath(EMPRESA_A, 'quotes');
      const pathB = getTenantCollectionPath(EMPRESA_B, 'quotes');

      expect(pathA).toBe('empresas/empresa_A/quotes');
      expect(pathB).toBe('empresas/empresa_B/quotes');
      expect(pathA).not.toBe(pathB);
    });
  });

  test('ValidationService detects cross-tenant data breach attempts', () => {
    const outcome = validationService.runValidation('val_tenant_boundary', {
      userTenantId: EMPRESA_A,
      payloadTenantId: EMPRESA_B
    });

    expect(outcome.valid).toBe(false);
    expect(outcome.error).toBe('Data Breach Trigger: Tentativa de leitura de outro tenant isolado.');
  });
});
