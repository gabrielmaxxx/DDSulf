import React from 'react';
import { usePermissions } from '../hooks/usePermissions';
import { PermissionModule, PermissionAction } from '../types';

interface PermissionGuardProps {
  children: React.ReactNode;
  module?: PermissionModule;
  modulo?: PermissionModule;
  action?: PermissionAction;
  acao?: PermissionAction;
  fallback?: React.ReactNode;
}

/**
 * =========================================================================
 * FRONTEND UI GATE (CAMADA 3 — APENAS UX / VISIBILIDADE DE INTERFACE)
 * 
 * ATENÇÃO DE SEGURANÇA:
 * Esta camada e este componente servem EXCLUSIVAMENTE para melhorar a UX
 * (esconder botões, menus e rotas que o usuário não pode acessar).
 * 
 * A SEGURANÇA REAL E INVIOLÁVEL DA APLICAÇÃO É GARANTIDA NAS CAMADAS 1 E 2:
 * 1. Firestore Rules (firestore.rules) — Impede leitura/escrita não autorizada no banco
 * 2. Express Backend Middleware (requirePermission em server.ts) — Bloqueia rotas de API
 * 
 * Esconder um elemento de UI não previne chamadas diretas de API; a proteção
 * de verdade já está implementada no backend e nas regras do banco.
 * =========================================================================
 */
export function PermissionGuard({
  children,
  module,
  modulo,
  action = 'view',
  acao,
  fallback = null
}: PermissionGuardProps) {
  const { can } = usePermissions();

  const targetModule = modulo || module || 'agenda';
  const targetAction = acao || action || 'view';

  if (!can(targetModule, targetAction)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export const RequirePermission = PermissionGuard;
export default PermissionGuard;
