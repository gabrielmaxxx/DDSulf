/**
 * Camada de Contexto Multi-Tenant para PestFlow
 */

export interface TenantContext {
  empresaId: string;
  role?: string;
  uid?: string;
  isSuperAdmin?: boolean;
}

export interface Empresa {
  id?: string;
  nome: string;
  cnpj?: string;
  criadoEm?: string;
  status: 'ativa' | 'inativa' | 'trial';
}

/**
 * Extrai o contexto do tenant exclusivamente a partir de req.tenantContext (populado pelo middleware via token com custom claim)
 */
export function getTenantContext(req?: any): TenantContext {
  const context = req?.tenantContext;
  if (!context || !context.empresaId) {
    throw new Error('TenantContext ausente ou token sem claim de empresaId.');
  }
  return context;
}

/**
 * Constrói o caminho de coleção Firestore isolado por empresa (/empresas/{empresaId}/{collectionName})
 * Exige estritamente empresaId e collectionName como parâmetros obrigatórios.
 */
export function getTenantCollectionPath(empresaId: string, collectionName: string): string {
  if (!empresaId || typeof empresaId !== 'string' || !empresaId.trim()) {
    throw new Error('empresaId é obrigatório para getTenantCollectionPath.');
  }
  if (!collectionName || typeof collectionName !== 'string' || !collectionName.trim()) {
    throw new Error('collectionName é obrigatório para getTenantCollectionPath.');
  }
  return `empresas/${empresaId.trim()}/${collectionName.trim()}`;
}
