/**
 * DDSulf Contract Schema Specifications (v1.2.0)
 * SPDX-License-Identifier: Apache-2.0
 */

export const EventComplianceSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'OperationalEventContract',
  type: 'object',
  required: ['id', 'eventName', 'version', 'sourceModule', 'tenantId', 'payload', 'timestamp', 'correlationId'],
  properties: {
    id: {
      type: 'string',
      pattern: '^ev_[a-zA-Z0-9_\\-]+$'
    },
    eventName: {
      type: 'string',
      enum: ['pesticide.calculated', 'pop.saved_anvisa', 'stock.low', 'ai.anomaly_detected']
    },
    version: {
      type: 'string',
      const: '1.2.0'
    },
    sourceModule: {
      type: 'string',
      enum: ['DASHBOARD', 'CALCULATOR', 'FINANCIAL', 'POPS', 'STOCK', 'AI', 'INTEGRATION']
    },
    tenantId: {
      type: 'string',
      pattern: '^tenant_[a-zA-Z0-9_]+$'
    },
    payload: {
      type: 'object'
    },
    timestamp: {
      type: 'number'
    },
    correlationId: {
      type: 'string',
      minLength: 5
    }
  }
};

export function validateContract(payload: any): { valid: boolean; errors?: string[] } {
  const errors: string[] = [];
  
  if (!payload.id || !payload.id.startsWith('ev_')) {
    errors.push('Id do evento deve conter prefixo "ev_" para auditoria.');
  }
  
  if (payload.version !== '1.2.0') {
    errors.push(`Contrato quebrado: versão de dados ${payload.version} é incompatível com o core 1.2.0.`);
  }

  if (!payload.tenantId || !payload.tenantId.startsWith('tenant_')) {
    errors.push('Isolamento organizacional quebrado: falta o cabeçalho multi-tenant seguro.');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
