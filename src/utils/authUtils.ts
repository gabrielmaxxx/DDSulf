/**
 * Utilitários de Autenticação Sintética e Validação de Tenant para PestFlow
 */

export function validateEmpresaId(empresaId: string): boolean {
  if (!empresaId || typeof empresaId !== 'string') return false;
  const clean = empresaId.trim();
  if (clean.length === 0 || clean.length > 128) return false;
  return /^[a-zA-Z0-9_-]+$/.test(clean);
}

export function buildSyntheticEmail(login: string, empresaId: string): string {
  const cleanLogin = login.trim().toLowerCase();
  const cleanEmpresa = empresaId.trim().toLowerCase();
  return `${cleanLogin}@${cleanEmpresa}.pestflow.internal`;
}
