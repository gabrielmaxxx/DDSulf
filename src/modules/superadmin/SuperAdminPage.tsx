import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldAlert, 
  Building2, 
  Users, 
  DollarSign, 
  CalendarDays, 
  FileSpreadsheet, 
  PlusCircle, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Search, 
  Filter, 
  Edit3, 
  CreditCard, 
  Power, 
  UserPlus, 
  Activity, 
  Layers, 
  ArrowUpRight, 
  Check, 
  X,
  Lock,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { superAdminService, DashboardMetrics, EmpresaWithUserCount } from '@/services/superadmin/superAdminService';
import { useAuth } from '@/auth/hooks/useAuth';

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

  // Form states - Create Tenant & Master
  const [createStep, setCreateStep] = useState<1 | 2>(1);
  const [formEmpresaId, setFormEmpresaId] = useState('');
  const [formNome, setFormNome] = useState('');
  const [formCnpj, setFormCnpj] = useState('');
  const [formPlano, setFormPlano] = useState('standard');
  const [formFinStatus, setFormFinStatus] = useState<'em_dia' | 'atrasado'>('em_dia');
  const [formMasterLogin, setFormMasterLogin] = useState('');
  const [formMasterNome, setFormMasterNome] = useState('');
  const [formMasterSenha, setFormMasterSenha] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states - Financial
  const [finStatusVal, setFinStatusVal] = useState<'em_dia' | 'atrasado'>('em_dia');
  const [finVencimento, setFinVencimento] = useState('');
  const [finUltimoPgto, setFinUltimoPgto] = useState('');
  const [finObs, setFinObs] = useState('');

  // Form states - Edit
  const [editNome, setEditNome] = useState('');
  const [editCnpj, setEditCnpj] = useState('');
  const [editPlano, setEditPlano] = useState('standard');

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
    return empresas.filter(emp => {
      const matchesSearch = 
        emp.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.empresaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.cnpj && emp.cnpj.includes(searchTerm));

      const matchesStatus = 
        statusFilter === 'all' ? true :
        statusFilter === 'ativas' ? emp.ativa !== false :
        emp.ativa === false;

      const matchesFin = 
        finFilter === 'all' ? true :
        finFilter === 'em_dia' ? emp.financeiro?.status === 'em_dia' || !emp.financeiro?.status :
        emp.financeiro?.status === 'atrasado';

      return matchesSearch && matchesStatus && matchesFin;
    });
  }, [empresas, searchTerm, statusFilter, finFilter]);

  // Toggle company active
  const handleToggleAtiva = async (emp: EmpresaWithUserCount) => {
    const newStatus = !emp.ativa;
    try {
      await superAdminService.toggleAtiva(emp.empresaId, newStatus);
      toast.success(newStatus ? `Empresa '${emp.nome}' reativada com sucesso.` : `Empresa '${emp.nome}' suspensa com sucesso.`);
      setEmpresas(prev => prev.map(e => e.empresaId === emp.empresaId ? { ...e, ativa: newStatus } : e));
      loadData(true);
    } catch (err: any) {
      toast.error(err.message || 'Erro ao alterar ativação da empresa.');
    }
  };

  // Open Financial Modal
  const handleOpenFinModal = (emp: EmpresaWithUserCount) => {
    setSelectedEmpresa(emp);
    setFinStatusVal(emp.financeiro?.status || 'em_dia');
    setFinVencimento(emp.financeiro?.dataVencimento || '');
    setFinUltimoPgto(emp.financeiro?.dataUltimoPagamento || '');
    setFinObs(emp.financeiro?.observacoes || '');
    setIsFinModalOpen(true);
  };

  // Save Financial Status
  const handleSaveFin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresa) return;
    setIsSubmitting(true);
    try {
      await superAdminService.updateFinanceiro(selectedEmpresa.empresaId, {
        status: finStatusVal,
        dataVencimento: finVencimento,
        dataUltimoPagamento: finUltimoPgto,
        observacoes: finObs,
      });
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
    setEditNome(emp.nome);
    setEditCnpj(emp.cnpj || '');
    setEditPlano(emp.plano || 'standard');
    setIsEditModalOpen(true);
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresa) return;
    if (!editNome.trim()) {
      toast.error('Informe o nome da empresa.');
      return;
    }
    setIsSubmitting(true);
    try {
      await superAdminService.updateEmpresa(selectedEmpresa.empresaId, {
        nome: editNome.trim(),
        cnpj: editCnpj.trim(),
        plano: editPlano,
      });
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
    setFormMasterLogin('');
    setFormMasterNome('');
    setFormMasterSenha('');
    setIsMasterModalOpen(true);
  };

  // Save additional Master User
  const handleSaveMasterUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmpresa) return;
    if (!formMasterLogin.trim() || !formMasterSenha.trim()) {
      toast.error('Preencha login e senha temporária.');
      return;
    }
    setIsSubmitting(true);
    try {
      await superAdminService.createInitialMasterUser({
        empresaId: selectedEmpresa.empresaId,
        login: formMasterLogin.trim(),
        name: formMasterNome.trim() || formMasterLogin.trim(),
        senhaTemporaria: formMasterSenha,
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

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setCreateStep(1);
    setFormEmpresaId('');
    setFormNome('');
    setFormCnpj('');
    setFormPlano('standard');
    setFormFinStatus('em_dia');
    setFormMasterLogin('master');
    setFormMasterNome('');
    setFormMasterSenha('');
    setIsCreateModalOpen(true);
  };

  // Submit Create Company & Initial Master
  const handleSubmitCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (createStep === 1) {
      if (!formEmpresaId.trim() || !formNome.trim()) {
        toast.error('Identificador e Nome da Empresa são obrigatórios.');
        return;
      }
      setCreateStep(2);
      return;
    }

    if (!formMasterLogin.trim() || !formMasterSenha.trim()) {
      toast.error('Login e Senha da Conta Master são obrigatórios.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create Empresa Tenant
      const cleanEmpresaId = formEmpresaId.trim().toLowerCase();
      await superAdminService.createEmpresa({
        empresaId: cleanEmpresaId,
        nome: formNome.trim(),
        cnpj: formCnpj.trim(),
        plano: formPlano,
        financeiro: {
          status: formFinStatus,
        },
      });

      // 2. Create Initial Master User
      await superAdminService.createInitialMasterUser({
        empresaId: cleanEmpresaId,
        login: formMasterLogin.trim(),
        name: formMasterNome.trim() || formNome.trim(),
        senhaTemporaria: formMasterSenha,
      });

      toast.success(`Empresa '${formNome}' e Conta Master cadastradas com sucesso!`);
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
      {/* Top Banner / Super Admin Brand Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black">
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
                Gestão Global Multi-Tenant • Operador: <span className="text-amber-400 font-semibold">{user?.name || 'Gabriel'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-amber-600/30 cursor-pointer"
            >
              <PlusCircle className="size-4" />
              Nova Empresa
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-2 border-t border-slate-800/60 pt-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'dashboard'
                ? 'text-amber-400 border-amber-500 bg-slate-800/40'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Activity className="size-4" />
            Visão Geral da Plataforma
          </button>
          <button
            onClick={() => setActiveTab('empresas')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-all border-b-2 flex items-center gap-2 cursor-pointer ${
              activeTab === 'empresas'
                ? 'text-amber-400 border-amber-500 bg-slate-800/40'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Building2 className="size-4" />
            Empresas Cadastradas ({empresas.length})
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center space-y-4">
            <div className="size-12 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
            <p className="text-sm font-bold text-slate-400">Carregando dados da plataforma...</p>
          </div>
        ) : activeTab === 'dashboard' ? (
          /* =========================================================================
             DASHBOARD TAB
             ========================================================================= */
          <div className="space-y-6">
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Empresas */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Total de Empresas</span>
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                    <Building2 className="size-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{metrics?.totalEmpresas || 0}</span>
                  <span className="text-xs font-semibold text-emerald-400">
                    {metrics?.empresasAtivas || 0} ativas
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span>Suspensas:</span>
                  <span className="font-bold text-rose-400">{metrics?.empresasSuspensas || 0}</span>
                </div>
              </div>

              {/* Status Financeiro */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Saúde Financeira</span>
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="size-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-emerald-400">{metrics?.empresasEmDia || 0}</span>
                  <span className="text-xs font-semibold text-slate-400">em dia</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span>Mensalidades em atraso:</span>
                  <span className={`font-bold ${(metrics?.empresasAtrasadas || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {metrics?.empresasAtrasadas || 0}
                  </span>
                </div>
              </div>

              {/* Usuários Totais */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Usuários na Plataforma</span>
                  <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                    <Users className="size-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">{metrics?.totalUsuarios || 0}</span>
                  <span className="text-xs font-semibold text-purple-400">contas</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span>Média por empresa:</span>
                  <span className="font-bold text-slate-200">
                    {metrics?.totalEmpresas ? ((metrics.totalUsuarios || 0) / metrics.totalEmpresas).toFixed(1) : 0}
                  </span>
                </div>
              </div>

              {/* Serviços Executados */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-bold uppercase tracking-wider">Volume Operacional</span>
                  <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                    <CalendarDays className="size-5" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-amber-400">{metrics?.totalServicos || 0}</span>
                  <span className="text-xs font-semibold text-slate-400">serviços</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span>Orçamentos no funil:</span>
                  <span className="font-bold text-slate-200">{metrics?.totalOrcamentos || 0}</span>
                </div>
              </div>
            </div>

            {/* Platform Analytics Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Distribution by Plan */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Layers className="size-4 text-amber-400" />
                  Distribuição por Planos
                </h3>
                <div className="space-y-3">
                  {Object.entries(metrics?.distribuicaoPlanos || {}).map(([plano, count]) => {
                    const total = metrics?.totalEmpresas || 1;
                    const percent = Math.round((count / total) * 100);
                    return (
                      <div key={plano} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="capitalize text-slate-300">{plano}</span>
                          <span className="text-slate-400">{count} empresas ({percent}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {Object.keys(metrics?.distribuicaoPlanos || {}).length === 0 && (
                    <p className="text-xs text-slate-500 py-4 text-center">Nenhum dado de planos disponível.</p>
                  )}
                </div>
              </div>

              {/* Monthly Volume */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
                <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-emerald-400" />
                  Métricas Agregadas por Período
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-400">Serviços por Mês</span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {Object.entries(metrics?.servicosPorMes || {}).length > 0 ? (
                        Object.entries(metrics?.servicosPorMes || {}).map(([mes, qtd]) => (
                          <div key={mes} className="flex justify-between items-center text-xs py-1 border-b border-slate-800/40">
                            <span className="font-mono text-slate-300">{mes}</span>
                            <span className="font-bold text-amber-400">{qtd} serviços</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">Nenhum serviço registrado ainda.</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-slate-400">Orçamentos por Mês</span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                      {Object.entries(metrics?.orcamentosPorMes || {}).length > 0 ? (
                        Object.entries(metrics?.orcamentosPorMes || {}).map(([mes, qtd]) => (
                          <div key={mes} className="flex justify-between items-center text-xs py-1 border-b border-slate-800/40">
                            <span className="font-mono text-slate-300">{mes}</span>
                            <span className="font-bold text-emerald-400">{qtd} orçamentos</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500">Nenhum orçamento registrado ainda.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* =========================================================================
             EMPRESAS TAB (TENANT MANAGEMENT)
             ========================================================================= */
          <div className="space-y-4">
            {/* Filter Bar */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full md:w-80">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar empresa, ID ou CNPJ..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              {/* Filter Selectors */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e: any) => setStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todas</option>
                    <option value="ativas">Ativas</option>
                    <option value="suspensas">Suspensas</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Financeiro:</span>
                  <select
                    value={finFilter}
                    onChange={(e: any) => setFinFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Todos</option>
                    <option value="em_dia">Em Dia</option>
                    <option value="atrasado">Atrasado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Companies List */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Empresa (Tenant)</th>
                      <th className="py-3.5 px-4">CNPJ</th>
                      <th className="py-3.5 px-4">Plano</th>
                      <th className="py-3.5 px-4">Usuários</th>
                      <th className="py-3.5 px-4">Status Financeiro</th>
                      <th className="py-3.5 px-4">Acesso / Ativa</th>
                      <th className="py-3.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredEmpresas.map((emp) => {
                      const isAtiva = emp.ativa !== false;
                      const isEmDia = emp.financeiro?.status === 'em_dia' || !emp.financeiro?.status;

                      return (
                        <tr key={emp.empresaId} className="hover:bg-slate-800/40 transition-colors">
                          {/* Nome e ID */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="size-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-amber-400 shrink-0">
                                {emp.nome.substring(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-bold text-white block text-sm">{emp.nome}</span>
                                <span className="font-mono text-[10px] text-slate-400">ID: {emp.empresaId}</span>
                              </div>
                            </div>
                          </td>

                          {/* CNPJ */}
                          <td className="py-4 px-4 font-mono text-slate-400">
                            {emp.cnpj || '—'}
                          </td>

                          {/* Plano */}
                          <td className="py-4 px-4">
                            <span className="inline-block px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-slate-800 text-amber-300 border border-amber-500/20">
                              {emp.plano || 'standard'}
                            </span>
                          </td>

                          {/* Total Usuários */}
                          <td className="py-4 px-4 font-bold text-slate-200">
                            {emp.totalUsuarios || 0}
                          </td>

                          {/* Status Financeiro */}
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                                isEmDia
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              }`}>
                                <span className={`size-1.5 rounded-full ${isEmDia ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                                {isEmDia ? 'Em Dia' : 'Atrasado'}
                              </span>
                              {emp.financeiro?.dataVencimento && (
                                <span className="block text-[10px] text-slate-500 font-mono">
                                  Venc: {emp.financeiro.dataVencimento}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Ativação Switch */}
                          <td className="py-4 px-4">
                            <button
                              onClick={() => handleToggleAtiva(emp)}
                              className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                isAtiva
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                              }`}
                              title={isAtiva ? 'Clique para suspender' : 'Clique para reativar'}
                            >
                              <Power className="size-3" />
                              {isAtiva ? 'Ativa' : 'Suspensa'}
                            </button>
                          </td>

                          {/* Ações */}
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenFinModal(emp)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                                title="Gerenciar Status Financeiro"
                              >
                                <CreditCard className="size-4 text-emerald-400" />
                              </button>
                              <button
                                onClick={() => handleOpenEditModal(emp)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                                title="Editar Cadastro"
                              >
                                <Edit3 className="size-4 text-blue-400" />
                              </button>
                              <button
                                onClick={() => handleOpenMasterModal(emp)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                                title="Criar Conta Master"
                              >
                                <UserPlus className="size-4 text-amber-400" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}

                    {filteredEmpresas.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                          Nenhuma empresa encontrada com os filtros selecionados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
         MODAL 1: CADASTRAR NOVA EMPRESA (+ CONTA MASTER)
         ========================================================================= */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Building2 className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Cadastrar Nova Empresa</h3>
                    <span className="text-[10px] text-slate-400">Etapa {createStep} de 2</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitCreateTenant} className="space-y-4 text-xs">
                {createStep === 1 ? (
                  /* STEP 1: Dados da Empresa */
                  <div className="space-y-3">
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Identificador do Tenant (empresaId) *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: minha-empresa, dedetizadora-sul"
                        value={formEmpresaId}
                        onChange={(e) => setFormEmpresaId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Apenas letras minúsculas, números e hífen. Usado no isolamento do banco.
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">
                        Razão Social / Nome da Empresa *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Dedetizadora Exemplo e Controle de Pragas"
                        value={formNome}
                        onChange={(e) => setFormNome(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-300 font-bold mb-1">CNPJ</label>
                        <input
                          type="text"
                          placeholder="00.000.000/0001-00"
                          value={formCnpj}
                          onChange={(e) => setFormCnpj(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                        />
                      </div>

                      <div>
                        <label className="block text-slate-300 font-bold mb-1">Plano Inicial</label>
                        <select
                          value={formPlano}
                          onChange={(e) => setFormPlano(e.target.value)}
                          className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                        >
                          <option value="standard">Standard</option>
                          <option value="professional">Professional</option>
                          <option value="enterprise">Enterprise</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Status Financeiro Inicial</label>
                      <select
                        value={formFinStatus}
                        onChange={(e: any) => setFormFinStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      >
                        <option value="em_dia">Em Dia (Regular)</option>
                        <option value="atrasado">Atrasado (Pendente)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  /* STEP 2: Conta Master Inicial */
                  <div className="space-y-3">
                    <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-[11px] text-amber-200">
                      Agora configure o usuário <strong>Master</strong> que administrará a empresa <strong>{formNome}</strong>.
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Login do Gestor Master *</label>
                      <input
                        type="text"
                        placeholder="Ex: master, admin, gabriel"
                        value={formMasterLogin}
                        onChange={(e) => setFormMasterLogin(e.target.value.toLowerCase().trim())}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        O email de autenticação gerado será: <span className="font-mono text-slate-300">{formMasterLogin || 'login'}@{formEmpresaId}.pestflow.local</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Nome Completo do Gestor</label>
                      <input
                        type="text"
                        placeholder="Ex: João da Silva"
                        value={formMasterNome}
                        onChange={(e) => setFormMasterNome(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Senha Temporária Inicial *</label>
                      <input
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formMasterSenha}
                        onChange={(e) => setFormMasterSenha(e.target.value)}
                        required
                        className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                  {createStep === 2 ? (
                    <button
                      type="button"
                      onClick={() => setCreateStep(1)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                    >
                      Voltar
                    </button>
                  ) : (
                    <div />
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="size-3.5 animate-spin" />
                        Processando...
                      </>
                    ) : createStep === 1 ? (
                      <>
                        Próximo (Conta Master)
                        <ChevronRight className="size-3.5" />
                      </>
                    ) : (
                      <>
                        <Check className="size-3.5" />
                        Finalizar Cadastro
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
         MODAL 2: GESTÃO FINANCEIRA DO TENANT
         ========================================================================= */}
      <AnimatePresence>
        {isFinModalOpen && selectedEmpresa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Controle Financeiro</h3>
                    <span className="text-[10px] text-slate-400">{selectedEmpresa.nome}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsFinModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveFin} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Status da Mensalidade</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFinStatusVal('em_dia')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                        finStatusVal === 'em_dia'
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <CheckCircle2 className="size-4" />
                      Em Dia
                    </button>
                    <button
                      type="button"
                      onClick={() => setFinStatusVal('atrasado')}
                      className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                        finStatusVal === 'atrasado'
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <AlertTriangle className="size-4" />
                      Atrasado
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Data de Vencimento</label>
                    <input
                      type="date"
                      value={finVencimento}
                      onChange={(e) => setFinVencimento(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Último Pagamento</label>
                    <input
                      type="date"
                      value={finUltimoPgto}
                      onChange={(e) => setFinUltimoPgto(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Observações Internas</label>
                  <textarea
                    rows={3}
                    placeholder="Histórico de contato, negociação ou cobrança..."
                    value={finObs}
                    onChange={(e) => setFinObs(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsFinModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                    Salvar Alterações
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
         MODAL 3: EDITAR CADASTRO DA EMPRESA
         ========================================================================= */}
      <AnimatePresence>
        {isEditModalOpen && selectedEmpresa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                    <Edit3 className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Editar Dados da Empresa</h3>
                    <span className="text-[10px] text-slate-400">ID: {selectedEmpresa.empresaId}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nome / Razão Social *</label>
                  <input
                    type="text"
                    value={editNome}
                    onChange={(e) => setEditNome(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">CNPJ</label>
                  <input
                    type="text"
                    value={editCnpj}
                    onChange={(e) => setEditCnpj(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Plano</label>
                  <select
                    value={editPlano}
                    onChange={(e) => setEditPlano(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="standard">Standard</option>
                    <option value="professional">Professional</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                    Salvar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
         MODAL 4: CRIAR CONTA MASTER ADICIONAL
         ========================================================================= */}
      <AnimatePresence>
        {isMasterModalOpen && selectedEmpresa && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <UserPlus className="size-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Criar Conta Master</h3>
                    <span className="text-[10px] text-slate-400">{selectedEmpresa.nome}</span>
                  </div>
                </div>
                <button
                  onClick={() => setIsMasterModalOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveMasterUser} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Login do Gestor *</label>
                  <input
                    type="text"
                    placeholder="Ex: gestor, admin2"
                    value={formMasterLogin}
                    onChange={(e) => setFormMasterLogin(e.target.value.toLowerCase().trim())}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Email gerado: <span className="font-mono text-slate-300">{formMasterLogin || 'login'}@{selectedEmpresa.empresaId}.pestflow.local</span>
                  </p>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Ex: Roberto Alcantara"
                    value={formMasterNome}
                    onChange={(e) => setFormMasterNome(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Senha Temporária *</label>
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formMasterSenha}
                    onChange={(e) => setFormMasterSenha(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsMasterModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all shadow-md shadow-amber-600/30 flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? <RefreshCw className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
                    Criar Master
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SuperAdminPage;
