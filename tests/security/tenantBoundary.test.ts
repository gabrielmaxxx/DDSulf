/**
 * Test: Security - Tenant Boundary Segregation & Access Control Boundaries
 */

import { describe, test, expect } from 'vitest';
import { validationService } from '../../src/services/qa/validationService';

describe('Security Testing - Cloud-Sec Tenant Segregations', () => {

  test('Reject query requests where user tenant token is mismatched from document data tenant', () => {
    const outcome = validationService.runValidation('val_tenant_boundary', {
      userTenantId: 'ddsulf_matriz',
      payloadTenantId: 'ddsulf_erechim_franquia' // mismatched tenant ID
    });

    expect(outcome.valid).toBe(false);
    expect(outcome.error).toBe('Data Breach Trigger: Tentativa de leitura de outro tenant isolado.');
  });

  test('Approve queries matching tenant boundaries exactly', () => {
    const outcome = validationService.runValidation('val_tenant_boundary', {
      userTenantId: 'ddsulf_matriz',
      payloadTenantId: 'ddsulf_matriz' // matching tenant ID
    });

    expect(outcome.valid).toBe(true);
  });

});
