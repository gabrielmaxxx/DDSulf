import React, { useState } from 'react';
import { 
  Building2, 
  Map, 
  Key, 
  Settings, 
  CheckCircle2, 
  XOctagon, 
  AlertTriangle,
  Flame, 
  Users, 
  Database, 
  Calendar,
  Lock,
  Compass,
  Zap,
  HelpCircle,
  TrendingDown,
  UserCheck,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { 
  useTenant, 
  useWorkspace, 
  usePermissions, 
  useRoleAccess, 
  useTenantBranding, 
  useOrganizationalContext,
  tenantService,
  governanceService,
  Tenant
} from '../../organization';
import { PremiumGlassCard } from '@/design-system';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SaaSAdminShowcase() {
  const { 
    tenant, 
    workspace, 
    role, 
    permissions, 
    brand, 
    availableWorkspaces, 
    availableTenants, 
    isLoading, 
    featureFlags, 
    switchTenant, 
    switchWorkspace 
  } = useOrganizationalContext();

  const { hasFeature, isUsageAllowed } = useTenant();
  const { createNewWorkspace } = useWorkspace();
  const { hasPermission } = usePermissions();
  const { isManager, isAdmin } = useRoleAccess();

  // Onboarding local state
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newCompanyId, setNewCompanyId] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanySubdomain, setNewCompanySubdomain] = useState('');
  const [newCompanyPlan, setNewCompanyPlan] = useState<'essentials' | 'professional' | 'enterprise_grade'>('professional');

  // Interactive Governance / Safe checks simulation state
  const [simulationTargetTenant, setSimulationTargetTenant] = useState('ddsulf_matriz');
  const [simulationPermission, setSimulationPermission] = useState<'write:financial' | 'write:margin-override' | 'use:ai-orchestrator'>('write:margin-override');
  const [discountPercent, setDiscountPercent] = useState('12');

  const handleCreateWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      toast.error('Por favor, informe o nome do workspace.');
      return;
    }
    try {
      await createNewWorkspace(newWorkspaceName.trim());
      setNewWorkspaceName('');
      toast.success('Workspace operacional provisionado com isolamento contextual!');
    } catch (err: any) {
      toast.error(`Falha no setup do workspace: ${err.message}`);
    }
  };

  const handleOnboardNewCompany = async () => {
    if (!newCompanyId.trim() || !newCompanyName.trim() || !newCompanySubdomain.trim()) {
      toast.error('Preencha os dados de onboarding organizacional do novo tenant.');
      return;
    }
    try {
      const added = await tenantService.onboardingNewTenant({
        id: newCompanyId.trim().toLowerCase(),
        name: newCompanyName.trim(),
        subdomain: newCompanySubdomain.trim().toLowerCase(),
        plan: newCompanyPlan,
        adminEmail: 'contato@' + newCompanySubdomain.trim() + '.com.br'
      });
      toast.success(`SaaS Tenant "${added.name}" ativado com isolamento no cluster Firestore!`);
      switchTenant(added.id);
      setNewCompanyId('');
      setNewCompanyName('');
      setNewCompanySubdomain('');
    } catch (err: any) {
      toast.error(`Erro no onboarding corporativo: ${err.message}`);
    }
  };

  const runTenantGateCheck = () => {
    if (!tenant) return;
    const sameTenant = tenant.id === simulationTargetTenant;
    const permissionAllowed = hasPermission(simulationPermission);

    if (!sameTenant) {
      toast.error(
        `ACESSO BLOQUEADO: Violação de Cross-Tenant Sandbox! Operador logado no tenant "${tenant.name}" tentou disparar ações no contexto "${simulationTargetTenant}".`
      );
    } else if (!permissionAllowed) {
      toast.warning(
        `ACESSO PROIBIDO: O cargo atual "${role.toUpperCase()}" não possui a permissão "${simulationPermission}" ativada nas políticas de RBAC.`
      );
    } else {
      toast.success(
        `ACESSO CONCEDIDO: Ação validada pelo Gateway de Segurança. Audit log registrado.`
      );
    }
  };

  const checkDiscountGovernance = () => {
    if (!tenant) return;
    const rate = parseFloat(discountPercent) / 100;
    const hasOverride = hasPermission('write:margin-override');
    const result = governanceService.validateDiscount(tenant.id, rate, hasOverride);

    if (result.approved) {
      toast.success(`POLÍTICA DE MARGEM COMPATÍVEL: ${result.reason || 'Desconto aprovado.'}`);
    } else {
      toast.error(`INFRAÇÃO DE COMPLIANCE: ${result.reason}`);
    }
  };

  if (isLoading || !tenant) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-600">
      
      {/* Upper header section */}
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">DDSulf Global Tenant & Workspace Isolation Gate</span>
        <h2 className="text-3xl font-black text-black">Governança Multi-Tenant & SaaS</h2>
        <p className="text-gray-500 text-sm max-w-3xl">Ponto central de controle corporativo para switches de empresas, conformidade operacional de campo, regras de desconto e isolamento de banco de dados.</p>
      </div>

      {/* Corporate Switcher Dashboard Grid */}
      <div className="grid gap-6 md:grid-cols-12">
        
        {/* Active Context Selector (Sidebar position) */}
        <div className="md:col-span-4 space-y-6">
          <PremiumGlassCard className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Building2 className="size-4 text-indigo-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-black">SaaS Tenant Ativo</h4>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Selecionar Empresa</label>
              <select 
                value={tenant.id}
                onChange={(e) => switchTenant(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:border-indigo-500"
              >
                {availableTenants.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1">
                <p className="text-[10px] font-bold text-indigo-800 uppercase tracking-wider">Subdomínio Isolado</p>
                <p className="text-xs font-mono font-bold text-indigo-900">{tenant.subdomain}.ddsulf.com.br</p>
              </div>
            </div>
          </PremiumGlassCard>

          <PremiumGlassCard className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Map className="size-4 text-indigo-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-black">Workspace de Trabalho</h4>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Mudar Escritório Virtual</label>
              <select 
                value={workspace?.id || ''}
                onChange={(e) => switchWorkspace(e.target.value)}
                className="w-full text-xs font-bold p-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-hidden focus:border-indigo-500"
              >
                {availableWorkspaces.map((w) => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>

              <div className="pt-2 space-y-2">
                <input 
                  type="text"
                  placeholder="Nome do Novo Escritório / Filial"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full placeholder:text-gray-400 text-xs p-2 bg-gray-50 border border-gray-200 rounded-lg text-black bg-white focus:outline-hidden"
                />
                <Button 
                  onClick={handleCreateWorkspace}
                  className="w-full h-9 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-neutral-800"
                >
                  <Plus className="size-3 mr-1" /> Criar Workspace
                </Button>
              </div>
            </div>
          </PremiumGlassCard>
        </div>

        {/* Content details Column */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Tenant Plan & Quotas Limits Monitor */}
          <PremiumGlassCard className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                    tenant.plan === 'enterprise_grade' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    Plano {tenant.plan.replace('_', ' ')}
                  </span>
                  <span className="size-2 bg-emerald-500 rounded-full" />
                </div>
                <h3 className="text-lg font-black text-black">{tenant.name}</h3>
              </div>
              <p className="text-xs text-gray-400">Ativação SaaS: {new Date(tenant.createdAt).toLocaleDateString()}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* Limit Block 1 */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Capacidade Usuários</span>
                  <Users className="size-4 text-gray-300" />
                </div>
                <p className="text-xl font-black text-black mt-2">{tenant.limits.maxUsers}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Limite Máximo do Core</p>
              </div>

              {/* Limit Block 2 */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Agendamentos / Mês</span>
                  <Calendar className="size-4 text-gray-300" />
                </div>
                <p className="text-xl font-black text-black mt-2">{tenant.limits.maxSchedulesPerMonth}</p>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Mensal Quota</p>
              </div>

              {/* Limit Block 3 */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl relative overflow-hidden">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Armazenamento Cloud</span>
                  <Database className="size-4 text-gray-300" />
                </div>
                <p className="text-xl font-black text-black mt-2">
                  {(tenant.limits.maxStorageBytes / 1073741824).toFixed(0)} GB
                </p>
                <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Alocação de Imagens</p>
              </div>
            </div>

            {/* Feature Flags Checklist */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase font-mono block">Módulos Inteligentes do Contrato {tenant.plan === 'enterprise_grade' ? '(Enterprise Habilitados)' : '(Básicos)'}</span>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  hasFeature('ai_negotiator') ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900 font-bold' : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <Zap className="size-4 shrink-0" />
                    Robô IA Negociador Comercial
                  </span>
                  <span className="text-[9px] font-mono uppercase">{hasFeature('ai_negotiator') ? 'Ativo' : 'Bloqueado'}</span>
                </div>

                <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  hasFeature('margin_guard') ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900 font-bold' : 'bg-gray-100 border-gray-200 text-gray-400'
                }`}>
                  <span className="flex items-center gap-1.5">
                    <Lock className="size-4 shrink-0" />
                    Margin Guard Proteção Ativa
                  </span>
                  <span className="text-[9px] font-mono uppercase">{hasFeature('margin_guard') ? 'Ativo' : 'Bloqueado'}</span>
                </div>
              </div>
            </div>
          </PremiumGlassCard>

          {/* Cross-Tenant Live Security Sandbox Gate */}
          <PremiumGlassCard className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-black">SaaS Security Sandbox Simulator</h3>
              <p className="text-xs text-gray-400">Verifique em tempo real as barreiras contra vazamentos cross-tenant de base de dados e autorizações RBAC.</p>
            </div>

            <div className="p-4 bg-zinc-900 rounded-3xl border border-zinc-800 text-zinc-300 grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Painel Operacional</h4>
                
                <div className="space-y-1 text-xs">
                  <p className="font-bold flex justify-between">
                    <span>Organização Logada:</span> 
                    <span className="text-white bg-zinc-800 px-2 py-0.5 rounded text-[10px]">{tenant.name}</span>
                  </p>
                  <p className="font-bold flex justify-between mt-1">
                    <span>Cargo Autenticado:</span> 
                    <span className="text-indigo-400 font-mono text-[10px]">{role.toUpperCase()} (Clearance: {permissions.length})</span>
                  </p>
                </div>

                <div className="border-t border-zinc-800 pt-3 space-y-2">
                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Empresa Alvo do Endpoint</label>
                    <select 
                      value={simulationTargetTenant}
                      onChange={(e) => setSimulationTargetTenant(e.target.value)}
                      className="w-full text-xs font-bold p-1.5 bg-zinc-850 text-white border border-zinc-700 rounded-lg"
                    >
                      <option value="ddsulf_matriz">DDSulf Matriz Erechim</option>
                      <option value="dedetizadora_serra">Dedetizadora Serra Gaúcha</option>
                      <option value="outside_tenant_hacker">Empresa Estranha #412 (Hacker)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-bold text-zinc-500 uppercase block mb-1">Ação Requerida</label>
                    <select 
                      value={simulationPermission}
                      onChange={(e) => setSimulationPermission(e.target.value as any)}
                      className="w-full text-xs font-bold p-1.5 bg-zinc-850 text-white border border-zinc-700 rounded-lg"
                    >
                      <option value="write:margin-override">Substituir Margem Mínima (write:margin-override)</option>
                      <option value="write:financial">Adicionar Despesa Fixa (write:financial)</option>
                      <option value="use:ai-orchestrator">Orquestrar IA Avançada (use:ai-orchestrator)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex flex-col justify-between space-y-4">
                <div className="p-3.5 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center gap-3">
                  <Lock className="size-8 text-indigo-400 shrink-0" />
                  <div>
                    <h5 className="text-[11px] font-black text-white leading-tight uppercase tracking-wider">Gateway Ativo de Isolamento</h5>
                    <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">Dispare a chamada para simular a segurança server-side do Firestore Rules.</p>
                  </div>
                </div>

                <Button 
                  onClick={runTenantGateCheck}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl"
                >
                  Confirmar Acesso ao Cloud Engine
                </Button>
              </div>
            </div>
          </PremiumGlassCard>

          {/* Governance Rules (Discount Enforcer sandbox) */}
          <PremiumGlassCard className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <TrendingDown className="size-4 text-emerald-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-black">Conformidade de Desconto de Linha de Campo</h4>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              O limite de desconto definido em contrato varia por plano. Insira um desconto simulado abaixo para testar o enforce do <span className="text-indigo-600 font-bold">governanceService</span> do DDSulf.
            </p>

            <div className="flex gap-2 items-center">
              <input 
                type="number"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                placeholder="Exemplo 12 para 12%"
                className="w-24 text-xs font-bold p-2 bg-gray-50 border border-gray-200 rounded-lg text-black bg-white focus:outline-hidden"
              />
              <span className="text-xs font-bold">%</span>
              <Button 
                onClick={checkDiscountGovernance}
                className="h-9 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg"
              >
                Validar Desconto
              </Button>
            </div>
          </PremiumGlassCard>

          {/* Multi-Tenant Business Onboarding Provisioner Form */}
          <PremiumGlassCard className="space-y-4 bg-[#F9FAFB]/50">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <UserCheck className="size-4 text-indigo-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-black">Provisionamento Onboarding Automatizado (SaaS Scalability)</h4>
            </div>

            <p className="text-xs text-gray-400">
              Expansão do DDSulf. Crie um novo Tenant isolado instantaneamente no sistema simulado.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <input 
                type="text"
                placeholder="ID Interno Único (ex: ddsulf_pelotas)"
                value={newCompanyId}
                onChange={(e) => setNewCompanyId(e.target.value)}
                className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl text-black"
              />
              <input 
                type="text"
                placeholder="Nome Fantasia Completo"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl text-black"
              />
              <input 
                type="text"
                placeholder="Subdomínio (ex: pelotas)"
                value={newCompanySubdomain}
                onChange={(e) => setNewCompanySubdomain(e.target.value)}
                className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl text-black"
              />
              <select 
                value={newCompanyPlan}
                onChange={(e) => setNewCompanyPlan(e.target.value as any)}
                className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl text-black"
              >
                <option value="essentials">Essentials Plan (Básico)</option>
                <option value="professional">Professional Plan (Intermediário)</option>
                <option value="enterprise_grade">Enterprise Grade (Corporativo)</option>
              </select>
            </div>

            <Button 
              onClick={handleOnboardNewCompany}
              className="w-full h-11 bg-black text-white hover:bg-neutral-800 text-xs font-black uppercase tracking-widest rounded-xl transition-all"
            >
              Ativar Novo Tenant & Onboard
            </Button>
          </PremiumGlassCard>

        </div>
      </div>
    </div>
  );
}

export default SaaSAdminShowcase;
