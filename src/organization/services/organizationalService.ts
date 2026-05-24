/**
 * DDSulf Organizational Hierarchy and Workspace Management Service
 * Coordinates headquarters, branch offices, operational sectors and independent visual workspaces.
 */

import { Workspace, OrganizationNode } from '../types';

class OrganizationalService {
  private workspacesCache: Map<string, Workspace[]> = new Map();
  private organizationNodesCache: Map<string, OrganizationNode[]> = new Map();

  constructor() {
    this.seedDefaultData();
  }

  private seedDefaultData() {
    // Seed standard workspaces for tenants
    this.workspacesCache.set('ddsulf_matriz', [
      {
        id: 'workspace_erechim',
        tenantId: 'ddsulf_matriz',
        name: 'Matriz Erechim (Operação e Admin)',
        status: 'active',
        createdAt: '2026-01-01T00:00:00Z',
      },
      {
        id: 'workspace_passofundo',
        tenantId: 'ddsulf_matriz',
        name: 'Sucursal Passo Fundo (Operação Local)',
        status: 'active',
        createdAt: '2026-02-15T00:00:00Z',
      }
    ]);

    this.workspacesCache.set('dedetizadora_serra', [
      {
        id: 'workspace_serra_unica',
        tenantId: 'dedetizadora_serra',
        name: 'Caxias do Sul (Sede Única)',
        status: 'active',
        createdAt: '2026-03-15T00:00:00Z',
      }
    ]);

    // Seed organizational structure tree nodes
    this.organizationNodesCache.set('ddsulf_matriz', [
      {
        id: 'node_hq_erechim',
        tenantId: 'ddsulf_matriz',
        parentId: null,
        name: 'Sede Administrativa Erechim',
        type: 'headquarters',
        city: 'Erechim',
        state: 'RS'
      },
      {
        id: 'node_branch_pf',
        tenantId: 'ddsulf_matriz',
        parentId: 'node_hq_erechim',
        name: 'Filial Central Passo Fundo',
        type: 'branch_office',
        city: 'Passo Fundo',
        state: 'RS'
      },
      {
        id: 'node_dept_comercial',
        tenantId: 'ddsulf_matriz',
        parentId: 'node_hq_erechim',
        name: 'Vendas Gaúchas Integradas',
        type: 'department'
      },
      {
        id: 'node_team_tecnicos_erechim',
        tenantId: 'ddsulf_matriz',
        parentId: 'node_hq_erechim',
        name: 'Equipe de Aplicação Solo Erechim',
        type: 'team'
      }
    ]);
  }

  /**
   * Retrieves all workspaces allocated to a specific corporate tenant
   */
  public async getWorkspaces(tenantId: string): Promise<Workspace[]> {
    return this.workspacesCache.get(tenantId) || [];
  }

  /**
   * Generates a new operating workspace for context switching
   */
  public async createWorkspace(tenantId: string, name: string): Promise<Workspace> {
    const list = this.workspacesCache.get(tenantId) || [];
    const id = `workspace_${Math.random().toString(36).substr(2, 9)}`;

    const newWorkspace: Workspace = {
      id,
      tenantId,
      name,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    list.push(newWorkspace);
    this.workspacesCache.set(tenantId, list);
    return newWorkspace;
  }

  /**
   * Fetches hierarchical units for corporate structural visualization
   */
  public async getOrganizationTree(tenantId: string): Promise<OrganizationNode[]> {
    return this.organizationNodesCache.get(tenantId) || [];
  }

  /**
   * Appends an organizational block to the corporate tree schema
   */
  public async addOrganizationNode(node: Omit<OrganizationNode, 'id'>): Promise<OrganizationNode> {
    const list = this.organizationNodesCache.get(node.tenantId) || [];
    const id = `node_${Math.random().toString(36).substr(2, 9)}`;

    const newNode: OrganizationNode = {
      id,
      ...node
    };

    list.push(newNode);
    this.organizationNodesCache.set(node.tenantId, list);
    return newNode;
  }
}

export const organizationalService = new OrganizationalService();
export default organizationalService;
