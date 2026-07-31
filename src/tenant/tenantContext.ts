/**
 * Camada de Contexto Multi-Tenant para PestFlow
 */

import { auth } from '../firebase/config';

export const DEFAULT_EMPRESA_ID = 'ddsulf';

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
 * Obtém o ID do tenant ativo a partir do parâmetro fornecido, do token de autenticação ou de sessão
 */
export function getActiveTenantId(passedEmpresaId?: string): string {
  if (passedEmpresaId && typeof passedEmpresaId === 'string' && passedEmpresaId.trim()) {
    return passedEmpresaId.trim();
  }
  const user = auth.currentUser;
  if (user && (user as any).empresaId) {
    return (user as any).empresaId;
  }
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('pestflow_tenant_id');
    if (stored && stored.trim()) return stored.trim();
  }
  return 'ddsulf';
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
 */
export function getTenantCollectionPath(empresaId?: string, collectionName?: string): string {
  if (collectionName) {
    const activeTenant = getActiveTenantId(empresaId);
    return `empresas/${activeTenant}/${collectionName}`;
  } else {
    const activeTenant = getActiveTenantId();
    return `empresas/${activeTenant}/${empresaId}`;
  }
}
