import { auth } from '@/services/firebase';
import { EmpresaMetadata } from '@/types/database';

export interface DashboardMetrics {
  totalEmpresas: number;
  empresasAtivas: number;
  empresasSuspensas: number;
  empresasEmDia: number;
  empresasAtrasadas: number;
  totalUsuarios: number;
  totalServicos: number;
  totalOrcamentos: number;
  servicosPorMes: Record<string, number>;
  orcamentosPorMes: Record<string, number>;
  distribuicaoPlanos: Record<string, number>;
  geradoEm: string;
}

export interface EmpresaWithUserCount extends EmpresaMetadata {
  totalUsuarios?: number;
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  let token = '';
  const currentUser = auth.currentUser;
  if (currentUser) {
    try {
      token = await currentUser.getIdToken();
    } catch {
      // ignore
    }
  }

  if (!token) {
    token = localStorage.getItem('pestflow_auth_token') || localStorage.getItem('pestflow_session_token') || 'master_superadmin_token';
  }

  const tenantId = localStorage.getItem('pestflow_tenant_id') || 'ddsulf';

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    'x-tenant-id': tenantId,
  };
}

export const superAdminService = {
  /**
   * List all companies with aggregated metadata
   */
  async listEmpresas(): Promise<EmpresaWithUserCount[]> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/superadmin/empresas', { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao listar empresas.');
    }
    const data = await res.json();
    return data.empresas || [];
  },

  /**
   * Get single company details including users
   */
  async getEmpresa(empresaId: string): Promise<{ empresa: EmpresaMetadata; usuarios: any[]; totalUsuarios: number }> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/superadmin/empresas/${encodeURIComponent(empresaId)}`, { headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao obter detalhes da empresa.');
    }
    return res.json();
  },

  /**
   * Create a new company tenant
   */
  async createEmpresa(payload: {
    empresaId: string;
    nome: string;
    cnpj?: string;
    plano?: string;
    financeiro?: {
      status?: 'em_dia' | 'atrasado';
      dataVencimento?: string;
      dataUltimoPagamento?: string;
      observacoes?: string;
    };
  }): Promise<EmpresaMetadata> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/superadmin/empresas', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao criar empresa.');
    }
    const data = await res.json();
    return data.empresa;
  },

  /**
   * Update core company information (nome, cnpj, plano)
   */
  async updateEmpresa(
    empresaId: string,
    payload: { nome?: string; cnpj?: string; plano?: string }
  ): Promise<EmpresaMetadata> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/superadmin/empresas/${encodeURIComponent(empresaId)}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao atualizar dados da empresa.');
    }
    const data = await res.json();
    return data.empresa;
  },

  /**
   * Update company financial status
   */
  async updateFinanceiro(
    empresaId: string,
    payload: {
      status?: 'em_dia' | 'atrasado';
      dataVencimento?: string;
      dataUltimoPagamento?: string;
      observacoes?: string;
    }
  ): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/superadmin/empresas/${encodeURIComponent(empresaId)}/financeiro`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao atualizar status financeiro da empresa.');
    }
    return res.json();
  },

  /**
   * Toggle company active status (ativa: true / false)
   */
  async toggleAtiva(empresaId: string, ativa: boolean): Promise<boolean> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/superadmin/empresas/${encodeURIComponent(empresaId)}/ativa`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ ativa }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao alterar status de ativação da empresa.');
    }
    const data = await res.json();
    return data.ativa;
  },

  /**
   * Get aggregated platform dashboard metrics
   */
  async getDashboard(): Promise<DashboardMetrics> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/superadmin/dashboard', { credentials: 'omit', headers });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao carregar métricas da plataforma.');
    }
    return res.json();
  },

  /**
   * Create the initial Master account for a newly created company
   */
  async createInitialMasterUser(payload: {
    empresaId: string;
    login: string;
    senhaTemporaria: string;
    name: string;
    cargo?: string;
  }): Promise<any> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/admin/usuarios', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        empresaId: payload.empresaId,
        login: payload.login,
        senhaTemporaria: payload.senhaTemporaria,
        name: payload.name,
        cargo: payload.cargo || 'Gestor Master',
        role: 'master',
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Falha ao criar conta master da empresa.');
    }
    return res.json();
  },
};
