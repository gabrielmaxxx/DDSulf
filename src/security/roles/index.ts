/**
 * DDSulf Enterprise RBAC Role Configurations Matrix
 * Implements granular operational rules, hierarchy tiers, and sensitive field blocks.
 */

import { RoleDef, UserRole } from '../types';

export const ROLE_LADDER: Record<UserRole, RoleDef> = {
  super_admin: {
    key: 'super_admin',
    label: 'Super Administrador',
    hierarchy: 100,
    allowedModules: ['dashboard', 'calculator', 'financial', 'inventory', 'pops', 'ai', 'clients', 'quotes', 'services'],
    allowedActions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'recalculate', 'manage_users', 'access_financials', 'access_analytics'],
    restrictedFields: []
  },
  admin: {
    key: 'admin',
    label: 'Administrador ERP',
    hierarchy: 80,
    allowedModules: ['dashboard', 'calculator', 'financial', 'inventory', 'pops', 'ai', 'clients', 'quotes', 'services'],
    allowedActions: ['view', 'create', 'edit', 'delete', 'export', 'approve', 'recalculate', 'manage_users', 'access_financials', 'access_analytics'],
    restrictedFields: []
  },
  financeiro: {
    key: 'financeiro',
    label: 'Diretor Financeiro & Contábil',
    hierarchy: 60,
    allowedModules: ['dashboard', 'calculator', 'financial', 'clients', 'quotes'],
    allowedActions: ['view', 'edit', 'export', 'recalculate', 'access_financials', 'access_analytics'],
    restrictedFields: []
  },
  gestor_operacional: {
    key: 'gestor_operacional',
    label: 'Gestor Logístico & Operações',
    hierarchy: 50,
    allowedModules: ['dashboard', 'inventory', 'pops', 'clients', 'services'],
    allowedActions: ['view', 'create', 'edit', 'approve', 'access_analytics'],
    // Operations managers cannot see overall pricing margin models of business
    restrictedFields: ['suggestedPrice', 'estimatedMargin', 'estimatedCost', 'amount']
  },
  comercial: {
    key: 'comercial',
    label: 'Comercial & Vendas',
    hierarchy: 40,
    allowedModules: ['calculator', 'clients', 'quotes', 'dashboard'],
    allowedActions: ['view', 'create', 'edit', 'access_analytics'],
    // Commercial representatives see sales price but cannot inspect base margin / exact product costs
    restrictedFields: ['estimatedMargin', 'estimatedCost']
  },
  tecnico: {
    key: 'tecnico',
    label: 'Técnico de Campo',
    hierarchy: 20,
    allowedModules: ['pops', 'clients', 'services'],
    allowedActions: ['view', 'edit'], // Edit here allows execution updates
    // High field safety: no financial numbers exposed to external mobile terminals
    restrictedFields: [
      'suggestedPrice', 
      'estimatedMargin', 
      'estimatedCost', 
      'amount', 
      'unitCost', 
      'actualCost',
      'costPerHour',
      'costPerKm'
    ]
  },
  visualizador: {
    key: 'visualizador',
    label: 'Visualizador de Leitura',
    hierarchy: 10,
    allowedModules: ['dashboard', 'pops', 'clients'],
    allowedActions: ['view'],
    restrictedFields: [
      'suggestedPrice', 
      'estimatedMargin', 
      'estimatedCost', 
      'amount', 
      'unitCost', 
      'actualCost'
    ]
  }
};

/**
 * Checks hierarchy height between two roles (safety gates against self-promotion escalations)
 */
export function hasHigherAuthority(userRole: UserRole, targetRole: UserRole): boolean {
  const userScore = ROLE_LADDER[userRole]?.hierarchy || 0;
  const targetScore = ROLE_LADDER[targetRole]?.hierarchy || 0;
  return userScore > targetScore;
}
