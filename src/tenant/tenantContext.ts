/**
 * Camada de Contexto Multi-Tenant para PestFlow
 */

export const DEFAULT_EMPRESA_ID = 'ddsulf';

export interface TenantContext {
  empresaId: string;
}

export interface Empresa {
  id?: string;
  nome: string;
  cnpj?: string;
  criadoEm?: string;
  status: 'ativa' | 'inativa' | 'trial';
}

/**
 * Extrai o contexto do tenant a partir de requisição Express ou fallback
 */
export function getTenantContext(req?: any): TenantContext {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  const headerValue = req?.headers?.['x-empresa-id'] || req?.headers?.['x-tenant-id'];
  const empresaId = typeof headerValue === 'string' && headerValue.trim().length > 0
    ? headerValue.trim()
    : DEFAULT_EMPRESA_ID;

  return { empresaId };
}

/**
 * Constrói o caminho de coleção Firestore isolado por empresa (/empresas/{empresaId}/{collectionName})
 */
export function getTenantCollectionPath(empresaId: string = DEFAULT_EMPRESA_ID, collectionName: string): string {
  // TODO(fase-2): substituir por empresaId extraído do custom claim do token
  const activeTenant = empresaId && empresaId.trim().length > 0 ? empresaId.trim() : DEFAULT_EMPRESA_ID;
  return `empresas/${activeTenant}/${collectionName}`;
}
