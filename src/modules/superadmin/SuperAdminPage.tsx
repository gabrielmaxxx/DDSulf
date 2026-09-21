import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  PlusCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  superAdminService,
  DashboardMetrics,
  EmpresaWithUserCount,
} from '@/services/superadmin/superAdminService';
import { useAuth } from '@/auth/hooks/useAuth';
import { HeaderMetric, HeaderMetricGroup } from '@/components/HeaderMetric';
import {
  SuperAdminTabs,
  SuperAdminDashboardTab,
  SuperAdminEmpresasTab,
  CreateEmpresaDialog,
  CreateTenantFormData,
  FinancialStatusDialog,
  FinancialStatusFormData,
  EditEmpresaDialog,
  EditEmpresaFormData,
  MasterLoginDialog,
  MasterLoginFormData,
} from './components';

export function SuperAdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'empresas'>('dashboard');

  // Data states
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [empresas, setEmpresas] = useState<EmpresaWithUserCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ativas' | 'suspensas'>('all');
  const [finFilter, setFinFilter] = useState<'all' | 'em_dia' | 'atrasado'>('all');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isFinModalOpen, setIsFinModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isMasterModalOpen, setIsMasterModalOpen] = useState(false);
  const [selectedEmpresa, setSelectedEmpresa] = useState<EmpresaWithUserCount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load Data
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [dashData, empresasData] = await Promise.all([
        superAdminService.getDashboard(),
        superAdminService.listEmpresas(),
      ]);
      setMetrics(dashData);
      setEmpresas(empresasData);
    } catch (err: any) {
      console.error('Erro ao carregar dados super-admin:', err);
      toast.error(err.message || 'Erro ao carregar dados do painel super-admin.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered companies
  const filteredEmpresas = useMemo(() => {
    return empresas.filter((emp) => {
      const matchesSearch =
        emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empresaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.cnpj && emp.cnpj.includes(searchTerm));

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'ativas'
          ? emp.ativa !== false
          : emp.ativa === false;

      const matchesFin =
        finFilter === 'all'
          ? true
          : finFilter === 'em_dia'
          ? emp.financeiro?.status === 'em_dia' || !emp.financeiro?.status
          : emp.financeiro?.status === 'atrasado';

      return matchesSearch && matchesStatus && matchesFin;
    });
  }, [empresas, searchTerm, statusFilter, finFilter]);

  // Calculated Header Metrics
  const activeCount = useMemo(() => {
    if (metrics?.empresasAtivas !== undefined) return metrics.empresasAtivas;
    return empresas.filter((e) => e.ativa !== false).length;
  }, [metrics, empresas]);

  const suspendedCount = useMemo(() => {
    if (metrics?.empresasSuspensas !== undefined) return metrics.empresasSuspensas;
    return empresas.filter((e) => e.ativa === false).length;
  }, [metrics, empresas]);

  const pendingCount = useMemo(() => {
    if (metrics?.empresasAtrasadas !== undefined) return metrics.empresasAtrasadas;
    return empresas.filter((e) => e.financeiro?.status === 'atrasado').length;
  }, [metrics, empresas]);

  // Toggle company active
  const handleToggleAtiva = async (emp: EmpresaWithUserCount) => {
    const newStatus = !emp.ativa;
    try {
      await superAdminService.toggleAtiva(emp.empresaId, newStatus);
      toast.success(
        newStatus
          ? `Empresa '${emp.nome}' reativada com sucesso.`
          : `Empresa '${emp.nome}' suspensa com sucesso.`
      );
      setEmpresas((prev) =>
        prev.map((e) => (e.empresaId === emp.empresaId ? { ...e, ativa: newStatus } : e))
      );
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar ativação da empresa.');
    }
  };

  // Open Financial Modal
  const handleOpenFinModal = (emp: EmpresaWithUserCount) => {
    setSelectedEmpresa(emp);
    setIsFinModalOpen(true);
  };

  // Save Financial Status
  const handleSaveFin = async (formData: FinancialStatusFormData) => {
    if (!selectedEmpresa) return;
    setIsSubmitting(true);
    try {
      await superAdminService.updateFinanceiro(selectedEmpresa.empresaId, formData);
      toast.success('Status financeiro atualizado com sucesso.');
      setIsFinModalOpen(false);
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar dados financeiros.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEditModal = (emp: EmpresaWithUserCount) => {
    setSelectedEmpresa(emp);
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (formData: EditEmpresaFormData) => {
    if (!selectedEmpresa) return;
    setIsSubmitting(true);
    try {
      await superAdminService.updateEmpresa(selectedEmpresa.empresaId, formData);
      toast.success('Dados cadastrais atualizados com sucesso.');
      setIsEditModalOpen(false);
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao atualizar dados da empresa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Master User Modal
  const handleOpenMasterModal = (emp: EmpresaWithUserCount) => {
    setSelectedEmpresa(emp);
    setIsMasterModalOpen(true);
  };

  // Save additional Master User
  const handleSaveMasterUser = async (formData: MasterLoginFormData) => {
    if (!selectedEmpresa) return;
    setIsSubmitting(true);
    try {
      await superAdminService.createInitialMasterUser({
        empresaId: selectedEmpresa.empresaId,
        login: formData.login,
        name: formData.name,
        senhaTemporaria: formData.senhaTemporaria,
      });
      toast.success(`Conta Master criada com sucesso para ${selectedEmpresa.nome}.`);
      setIsMasterModalOpen(false);
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar conta master.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Create Company & Initial Master
  const handleSubmitCreateTenant = async (formData: CreateTenantFormData) => {
    setIsSubmitting(true);
    try {
      // 1. Create Empresa Tenant
      await superAdminService.createEmpresa({
        empresaId: formData.empresaId,
        nome: formData.nome,
        cnpj: formData.cnpj,
        plano: formData.plano,
        financeiro: {
          status: formData.finStatus,
        },
      });

      // 2. Create Initial Master User
      await superAdminService.createInitialMasterUser({
        empresaId: formData.empresaId,
        login: formData.masterLogin,
        name: formData.masterNome,
        senhaTemporaria: formData.masterSenha,
      });

      toast.success(`Empresa '${formData.nome}' e Conta Master cadastradas com sucesso!`);
      setIsCreateModalOpen(false);
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao provisionar nova empresa.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16">
      {/* Top Banner / Super Admin Brand Header with HeaderMetrics */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6 lg:gap-8">
            <div className="flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black shrink-0">
                <ShieldAlert className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-black text-white tracking-wide">PestFlow Super-Admin</h1>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    Plataforma Central
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Gestão Global Multi-Tenant • Operador:{' '}
                  <span className="text-amber-400 font-semibold">{user?.name || 'Gabriel'}</span>
                </p>
              </div>
            </div>

            {/* Header Metrics sem borda nem fundo */}
            <HeaderMetricGroup
              id="header-metrics-superadmin"
              className="pt-2 lg:pt-0 border-t lg:border-t-0 lg:border-l border-slate-800 lg:pl-8 [&_.text-slate-900]:text-white [&_.text-slate-500]:text-slate-400"
            >
              <HeaderMetric
                id="metric-superadmin-ativas"
                label="Empresas Ativas"
                value={String(activeCount)}
                delta={{ value: 'Operação normal', direction: 'up' }}
              />
              <HeaderMetric
                id="metric-superadmin-suspensas"
                label="Empresas Suspensas"
                value={String(suspendedCount)}
                delta={
                  suspendedCount > 0
                    ? { value: `${suspendedCount} bloqueada(s)`, direction: 'down' }
                    : { value: 'Nenhuma suspensa', direction: 'neutral' }
                }
              />
              <HeaderMetric
                id="metric-superadmin-pendencias"
                label="Pendências Financeiras"
                value={String(pendingCount)}
                delta={
                  pendingCount > 0
                    ? { value: `${pendingCount} em atraso`, direction: 'down' }
                    : { value: '100% em dia', direction: 'up' }
                }
              />
            </HeaderMetricGroup>
          </div>

          <div className="flex items-center gap-2 self-start xl:self-auto shrink-0">
            <button
              id="btn-superadmin-refresh"
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
              Atualizar
            </button>
            <button
              id="btn-superadmin-nova-empresa"
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-600/30 cursor-pointer"
            >
              <PlusCircle className="size-4" />
              Nova Empresa
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="size-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <p className="text-sm font-bold text-slate-400">Carregando dados da plataforma...</p>
          </div>
        ) : (
          <SuperAdminTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            empresasCount={empresas.length}
            dashboardContent={<SuperAdminDashboardTab metrics={metrics} />}
            empresasContent={
              <SuperAdminEmpresasTab
                empresas={filteredEmpresas}
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                finFilter={finFilter}
                onFinFilterChange={setFinFilter}
                onToggleAtiva={handleToggleAtiva}
                onOpenFinModal={handleOpenFinModal}
                onOpenEditModal={handleOpenEditModal}
                onOpenMasterModal={handleOpenMasterModal}
              />
            }
          />
        )}
      </main>

      {/* Modals converted to official Dialogs */}
      <CreateEmpresaDialog
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSubmit={handleSubmitCreateTenant}
        isSubmitting={isSubmitting}
      />

      <FinancialStatusDialog
        open={isFinModalOpen}
        onOpenChange={setIsFinModalOpen}
        empresa={selectedEmpresa}
        onSubmit={handleSaveFin}
        isSubmitting={isSubmitting}
      />

      <EditEmpresaDialog
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        empresa={selectedEmpresa}
        onSubmit={handleSaveEdit}
        isSubmitting={isSubmitting}
      />

      <MasterLoginDialog
        open={isMasterModalOpen}
        onOpenChange={setIsMasterModalOpen}
        empresa={selectedEmpresa}
        onSubmit={handleSaveMasterUser}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default SuperAdminPage;
