/**
 * Camada de Contexto Multi-Tenant para PestFlow
 */

export interface TenantContext {
  empresaId: string;
  role?: string;
  uid?: string;
  isSuperAdmin?: boolean;
}

export interface EmpresaFinanceiro {
  status: 'em_dia' | 'atrasado';
  dataVencimento?: string;
  dataUltimoPagamento?: string;
  observacoes?: string;
}

export interface Empresa {
  empresaId: string;
  id?: string;
  nome: string;
  cnpj?: string;
  criadoEm?: string;
  ativa: boolean;
  financeiro?: EmpresaFinanceiro;
  plano?: string;
  status?: 'ativa' | 'inativa' | 'trial';
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

/**
 * Valida se um identificador de tenant segue o padrão seguro de identificador (apenas letras, números, hífens e underscores)
 */
export function validateEmpresaId(empresaId: string): boolean {
  if (!empresaId || typeof empresaId !== 'string') return false;
  const trimmed = empresaId.trim();
  if (trimmed.length < 2 || trimmed.length > 64) return false;
  // Bloquear path traversal e caracteres perigosos
  return /^[a-zA-Z0-9_-]+$/.test(trimmed);
}

