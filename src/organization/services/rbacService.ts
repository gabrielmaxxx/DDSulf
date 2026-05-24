/**
 * DDSulf RBAC (Role-Based Access Control) Enterprise Service
 * Validates authority hierarchies, sets unified permissions schemas, and maps user profiles to capabilities.
 */

import { Role, Permission, UserRoleType } from '../types';

class RbacService {
  private rolesRegistry: Map<UserRoleType, Role> = new Map();

  constructor() {
    this.initializeRoles();
  }

  private initializeRoles() {
    // Definir as permissões estritas para cada cargo dentro do DDSulf SaaS
    this.rolesRegistry.set('admin', {
      name: 'admin',
      description: 'Administrador Geral da Organização (Acesso Total)',
      hierarchyLevel: 100,
      permissions: [
        'read:financial',
        'write:financial',
        'write:margin-override',
        'read:analytics',
        'write:ops-schedule',
        'read:ops-schedule',
        'manage:inventory',
        'use:ai-orchestrator',
        'manage:users',
        'manage:workspaces',
        'manage:tenant-settings'
      ]
    });

    this.rolesRegistry.set('manager', {
      name: 'manager',
      description: 'Gestor operacional de Filial ou Regionais DDSulf',
      hierarchyLevel: 80,
      permissions: [
        'read:financial',
        'write:financial',
        'read:analytics',
        'write:ops-schedule',
        'read:ops-schedule',
        'manage:inventory',
        'use:ai-orchestrator',
        'manage:users',
        'manage:workspaces'
      ]
    });

    this.rolesRegistry.set('commercial', {
      name: 'commercial',
      description: 'Consultor comercial e emissor de orçamentos ou propostas',
      hierarchyLevel: 50,
      permissions: [
        'read:financial',
        'read:analytics',
        'write:ops-schedule',
        'read:ops-schedule',
        'use:ai-orchestrator'
      ]
    });

    this.rolesRegistry.set('operator', {
      name: 'operator',
      description: 'Operador de call center, logística e triagem primária',
      hierarchyLevel: 30,
      permissions: [
        'read:ops-schedule',
        'write:ops-schedule',
        'manage:inventory'
      ]
    });

    this.rolesRegistry.set('technician', {
      name: 'technician',
      description: 'Técnico de aplicação operacional (In-loco / Pragas)',
      hierarchyLevel: 20,
      permissions: [
        'read:ops-schedule'
      ]
    });
  }

  /**
   * Retrieves role information with descriptive mappings
   */
  public getRoleInfo(role: UserRoleType): Role {
    const defaultRole: Role = {
      name: 'operator',
      description: 'Roles provisórios / Leitores',
      hierarchyLevel: 10,
      permissions: ['read:ops-schedule']
    };
    return this.rolesRegistry.get(role) || defaultRole;
  }

  /**
   * Evaluates if a specified role permission exists on the role definitions
   */
  public hasPermission(role: UserRoleType, permission: Permission): boolean {
    const roleConfig = this.rolesRegistry.get(role);
    if (!roleConfig) return false;
    return roleConfig.permissions.includes(permission);
  }

  /**
   * Prevents authority elevation or unauthorized modification of staff with equal or higher clearance level
   */
  public canActionsAffectUser(actorRole: UserRoleType, subjectRole: UserRoleType): boolean {
    const actor = this.rolesRegistry.get(actorRole);
    const subject = this.rolesRegistry.get(subjectRole);
    if (!actor || !subject) return false;

    return actor.hierarchyLevel > subject.hierarchyLevel;
  }
}

export const rbacService = new RbacService();
export default rbacService;
