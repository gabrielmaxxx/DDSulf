/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  CreditCard, 
  Sparkles, 
  Users, 
  Activity, 
  Globe, 
  Plus, 
  ArrowUpRight, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  RotateCw, 
  SlidersHorizontal, 
  LayoutGrid, 
  Briefcase, 
  MapPin, 
  ShieldAlert, 
  TrendingUp, 
  Percent, 
  Send,
  ExternalLink,
  ChevronRight,
  Sparkle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  BarChart, 
  Bar,
  CartesianGrid 
} from 'recharts';
import { toast } from 'sonner';

import { useTenantContext } from '../hooks/useTenantContext';
import { useSubscriptionLifecycle } from '../hooks/useSubscriptionLifecycle';
import { useFeatureFlags } from '../hooks/useFeatureFlags';
import { useOrganizationManagement } from '../hooks/useOrganizationManagement';
import { useCommercialScaling } from '../hooks/useCommercialScaling';
import { useTenantProvisioning } from '../hooks/useTenantProvisioning';
import { SubscriptionPlanTier, TenantStatus } from '../types';

export function SaaSCockpit() {
  const [activeTab, setActiveTab] = useState<'tenants' | 'billing' | 'onboarding' | 'branches'>('tenants');

  // Load custom enterprise SaaS hooks
  const { currentTenant, tenants, switchTenant } = useTenantContext();
  const { activeSub, upgradePlan, verifyQuotaAvailable } = useSubscriptionLifecycle(currentTenant?.id);
  const { flags } = useFeatureFlags(currentTenant?.id);
  const { organization, addBranch } = useOrganizationManagement(currentTenant?.id);
  const { analytics, invoices, collectPendingInvoice } = useCommercialScaling(currentTenant?.id);
  const { startTenantProvisionSequence } = useTenantProvisioning();

  // Local state for Tenant provision form
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantSlug, setNewTenantSlug] = useState('');
  const [newTenantEmail, setNewTenantEmail] = useState('');
  const [newTenantTier, setNewTenantTier] = useState<SubscriptionPlanTier>(SubscriptionPlanTier.TRIAL);
  const [creatingTenant, setCreatingTenant] = useState(false);

  // Local state for branch form
  const [branchName, setBranchName] = useState('');
  const [branchCity, setBranchCity] = useState('');

  // Handle Tenant Provisioning
  const handleProvisionTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName || !newTenantSlug || !newTenantEmail) {
      toast.error('Preencha as informações do inquilino para prosseguir.');
      return;
    }

    setCreatingTenant(true);
    try {
      await startTenantProvisionSequence(
        newTenantName,
        newTenantSlug,
        newTenantEmail,
        newTenantTier
      );
      toast.success(`Inquilino ${newTenantName} provisionado e isolado em produção!`);
      setNewTenantName('');
      setNewTenantSlug('');
      setNewTenantEmail('');
      
      // Delay to update local context list
      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch {
      toast.error('Erro na contingência DNS/Firebase.');
    } finally {
      setCreatingTenant(false);
    }
  };

  // Handle adding custom branch (White-label Multi-unit test)
  const handleAddBranch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchName || !branchCity) {
      toast.error('Preencha os dados da filial.');
      return;
    }

    addBranch(branchName, branchCity);
    toast.success(`Filial ${branchName} adicionada com sucesso!`);
    setBranchName('');
    setBranchCity('');
  };

  // Calculate quota ratios for visualization
  const quotaRatio = useMemo(() => {
    if (!activeSub) return { users: 0, pops: 0, calculations: 0 };
    return {
      users: Math.round((activeSub.meteredUsageCurrent.activeUsers / activeSub.meteredQuotaLimits.maxUsers) * 100),
      pops: Math.round((activeSub.meteredUsageCurrent.popsRecordedThisMonth / activeSub.meteredQuotaLimits.maxPopsCount) * 100),
      calculations: Math.round((activeSub.meteredUsageCurrent.calculationsRunThisMonth / activeSub.meteredQuotaLimits.maxCalculationsPerMonth) * 100)
    };
  }, [activeSub]);

  // Historical MRR values for visualization
  const mrrChartData = [
    { month: 'Dez', MRR: 45000, Clientes: 12 },
    { month: 'Jan', MRR: 52000, Clientes: 15 },
    { month: 'Fev', MRR: 59000, Clientes: 18 },
    { month: 'Mar', MRR: 71000, Clientes: 22 },
    { month: 'Abr', MRR: 88000, Clientes: 28 },
    { month: 'Mai', MRR: analytics.mrrAmount, Clientes: analytics.activeTenantsCount }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 border-b border-slate-200 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-mono font-bold rounded-md flex items-center gap-1 leading-none">
              <Building2 className="size-3" />
              SaaS Operational Plan
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-500 font-mono">
              <Globe className="size-3.5 text-slate-400" />
              Multi-tenant Orchestrator
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Plataforma Comercial e Provimento SaaS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Onboarding acelerado, escalabilidade de faturamento, franquias white-label e controle isolado de cotas de licenças corporativas.
          </p>
        </div>

        {/* Selected tenant switcher dropdown */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Inquilino Contextual:</label>
          <select
            value={currentTenant?.id || ''}
            onChange={(e) => {
              switchTenant(e.target.value);
              toast.info(`Contexto SaaS alternado para: ${e.target.value}`);
            }}
            className="bg-white border text-xs font-semibold p-2 rounded-xl text-slate-700 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            {tenants.map(t => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Top-level SaaS analytics scoreboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">MRR Recorrência</span>
            <DollarSign className="size-4 text-emerald-500" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              R$ {analytics.mrrAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Faturamento de assinaturas em produção</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-600">
            <TrendingUp className="size-3.5" />
            +18% este mês
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">Inquilinos Ativos</span>
            <Building2 className="size-4 text-indigo-500" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{analytics.activeTenantsCount}</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Empresas isoladas no Firestore</p>
          </div>
          <div className="text-[10px] text-indigo-600 font-bold font-mono">
            Proporção Trial 1:3
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">LTV Estimado (Vida útil)</span>
            <Sparkle className="size-4 text-indigo-600" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
              R$ {analytics.avgLtvMs.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Projeção anual de retenção local</p>
          </div>
          <div className="text-[10px] text-slate-500 font-medium">
            Retenção média 11.2 meses
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">Churrate (Inadimplência)</span>
            <Percent className="size-4 text-rose-500" />
          </div>
          <div className="my-3">
            <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{analytics.churnRatePercent}%</div>
            <p className="text-[10px] text-slate-400 mt-0.5">Contas canceladas ou suspensas</p>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-rose-600 font-bold">
            <ShieldAlert className="size-3.5" />
            1 fatura em atraso ativa
          </div>
        </div>
      </div>

      {/* 3. Segmented control tabs */}
      <div className="flex scrollbar-none items-center overflow-x-auto bg-slate-200/60 p-1.5 rounded-2xl mb-6 gap-1 border border-slate-200/85">
        {[
          { id: 'tenants', label: 'Quotas de Inquilino', icon: SlidersHorizontal },
          { id: 'billing', label: 'Billing & Invoices', icon: CreditCard },
          { id: 'onboarding', label: 'Provisionar Novo', icon: Plus },
          { id: 'branches', label: 'Filiais e White-Label', icon: Globe },
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center h-10 px-4 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 gap-1.5 select-none cursor-pointer ${
                isSelected 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab content renderer */}
      <div className="flex-1 w-full">
        {/* TAB 1: TENANTS QUOTAS & PLANS */}
        {activeTab === 'tenants' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in bg-transparent">
            {/* Left columns: current plan detail, upgrades and meters */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 mb-5 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider font-mono">Plano Contratual Ativo</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <h3 className="font-extrabold text-slate-900 text-lg">
                      {activeSub ? activeSub.planTier.toUpperCase() : 'Buscando plano...'}
                    </h3>
                    <span className={`text-[9px] font-bold py-0.5 px-2 rounded-full border leading-none ${
                      activeSub?.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                    }`}>
                      {activeSub ? activeSub.status.toUpperCase() : ''}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs text-slate-400">Preço Mensal:</p>
                  <p className="font-black text-slate-800 text-lg leading-tight">
                    R$ {activeSub ? activeSub.priceAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                  </p>
                </div>
              </div>

              {/* Progress bars representing quota usage */}
              {activeSub && (
                <div className="space-y-5 mb-6">
                  <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono mb-3">Limites de Quotas de Uso</h4>
                  
                  {/* Quota 1: Active technical workers */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Usuários Ativos</span>
                      <span className="text-slate-800">{activeSub.meteredUsageCurrent.activeUsers} / {activeSub.meteredQuotaLimits.maxUsers}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${quotaRatio.users > 80 ? 'bg-rose-500' : 'bg-indigo-600'}`} 
                        style={{ width: `${quotaRatio.users}%` }} 
                      />
                    </div>
                  </div>

                  {/* Quota 2: POPs recorded */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Laudos de Campo (POPs) / mês</span>
                      <span className="text-slate-800">{activeSub.meteredUsageCurrent.popsRecordedThisMonth} / {activeSub.meteredQuotaLimits.maxPopsCount}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${quotaRatio.pops > 80 ? 'bg-rose-500' : 'bg-emerald-600'}`} 
                        style={{ width: `${quotaRatio.pops}%` }} 
                      />
                    </div>
                  </div>

                  {/* Quota 3: Calculations run */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Cálculos de Doses químicos / mês</span>
                      <span className="text-slate-800">{activeSub.meteredUsageCurrent.calculationsRunThisMonth} / {activeSub.meteredQuotaLimits.maxCalculationsPerMonth}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${quotaRatio.calculations > 80 ? 'bg-rose-500' : 'bg-amber-600'}`} 
                        style={{ width: `${quotaRatio.calculations}%` }} 
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Fast upgrades trigger boxes */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono mb-3">Upgrade de Licenciamento Tático</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { tier: SubscriptionPlanTier.STARTER, name: 'Starter Plan', price: 'R$ 249', desc: 'Até 5 usuários, s/ IA' },
                    { tier: SubscriptionPlanTier.PROFESSIONAL, name: 'Professional', price: 'R$ 649', desc: 'Até 25 usuários, c/ IA' },
                    { tier: SubscriptionPlanTier.ENTERPRISE, name: 'Enterprise Pro', price: 'R$ 1899', desc: 'Até 150 usuários, c/ IA' },
                  ].map(option => {
                    const isCurrent = activeSub?.planTier === option.tier;
                    return (
                      <button
                        key={option.tier}
                        disabled={isCurrent}
                        onClick={() => {
                          const done = upgradePlan(option.tier);
                          if (done) {
                            toast.success(`Upgraded para o plano ${option.name}!`);
                          } else {
                            toast.error('Erro de upgrade transacional.');
                          }
                        }}
                        className={`border rounded-2xl p-4 text-left cursor-pointer transition-all ${
                          isCurrent 
                            ? 'border-indigo-200 bg-indigo-50/50 scale-102 cursor-default' 
                            : 'border-slate-200 bg-white hover:border-slate-350 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-[10px] font-bold text-indigo-600 font-mono tracking-wider">{option.name}</span>
                        <p className="font-extrabold text-slate-900 text-md.5 mt-1">{option.price}<span className="text-[10px] text-slate-400 font-medium">/mês</span></p>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-snug">{option.desc}</p>
                        <div className="mt-4 flex items-center justify-between">
                          <span className={`text-[10px] font-bold ${isCurrent ? 'text-indigo-600' : 'text-slate-800'}`}>
                            {isCurrent ? 'Plano Atual ✓' : 'Ativar Upgrade'}
                          </span>
                          <ArrowUpRight className="size-3.5 text-slate-400" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right side: dynamic feature flags based on plans (Premium features gating demo) */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="p-0.5 px-2 bg-indigo-600 rounded text-indigo-100 text-[10px] uppercase font-mono font-bold tracking-wider leading-none">
                  Habilitações Tecnológicas
                </span>
                <h4 className="font-extrabold text-white text-md tracking-tight mt-2.5">Feature Gating Ativo:</h4>
                <p className="text-xs text-slate-300 leading-normal mt-1">Conforme as diretrizes SaaS, recursos como IA só são injetados recursivamente com planos estáveis.</p>

                <div className="mt-5 space-y-4">
                  <div className="flex items-start gap-2.5 text-xs">
                    <CheckCircle2 className="size-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-white">Cache Offline Sincronizado</p>
                      <p className="text-[10px] text-slate-400">Navegação e persistência garantidos em subsolos.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs">
                    <div className={`p-0.5 rounded ${flags.enableGeminiPrecomputations ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {flags.enableGeminiPrecomputations ? <CheckCircle2 className="size-4.5" /> : <AlertCircle className="size-4.5" />}
                    </div>
                    <div>
                      <p className={`font-bold ${flags.enableGeminiPrecomputations ? 'text-white' : 'text-slate-400 line-through'}`}>Precomputações Inteligentes Gemini</p>
                      <p className="text-[10px] text-slate-400">Inteligência preditiva na calculadora.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs">
                    <div className={`p-0.5 rounded ${flags.enableFinancialProAnalisys ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {flags.enableFinancialProAnalisys ? <CheckCircle2 className="size-4.5" /> : <AlertCircle className="size-4.5" />}
                    </div>
                    <div>
                      <p className={`font-bold ${flags.enableFinancialProAnalisys ? 'text-white' : 'text-slate-400 line-through'}`}>Faturamento Expandido Pro</p>
                      <p className="text-[10px] text-slate-400">Projeção financeira analítica.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 mt-6 text-[10px] text-slate-400 leading-normal font-mono">
                Isolated context guidelines compliant: Tenant {currentTenant?.slug} verified.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: BILLING & INVOICES */}
        {activeTab === 'billing' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Visual historical charts of SaaS scaling MRR */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Crescimento de Recorrência Mensal (MRR)</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Visão macro de aceleração e expansão comercial nos últimos meses.</p>
                </div>
                <span className="p-1 px-2 bg-slate-100 rounded text-slate-600 text-xs font-mono font-bold">R$ {analytics.mrrAmount.toLocaleString('pt-BR')}</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mrrChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="MRR" stroke="#4F46E5" fillOpacity={0.12} fill="#4F46E5" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List entries of invoices */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3">Invoices do Inquilino</h3>
                <p className="text-xs text-slate-500 mb-4 leading-normal">Relatórios financeiros e controle de adimplemento recorrente.</p>

                <div className="space-y-4 max-h-[290px] overflow-y-auto pr-1">
                  {invoices.map(inv => (
                    <div key={inv.id} className="border border-slate-100 rounded-xl p-3 flex justify-between items-center text-xs hover:border-slate-200 transition-all bg-slate-50/60">
                      <div>
                        <p className="font-bold text-slate-800">R$ {inv.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{inv.id} | Vencto: {new Date(inv.dueDate).toLocaleDateString('pt-BR')}</p>
                      </div>

                      <div className="text-right">
                        <span className={`text-[8px] font-black font-mono tracking-wider uppercase p-1 rounded inline-block leading-none ${
                          inv.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                            : inv.status === 'overdue'
                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {inv.status}
                        </span>

                        {inv.status !== 'paid' && (
                          <button
                            onClick={() => {
                              collectPendingInvoice(inv.id);
                              toast.success('Faturamento quitado e liberado!');
                            }}
                            className="block text-[9px] font-bold border border-emerald-250 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded mt-2 ml-auto cursor-pointer leading-none"
                          >
                            Pagar Pix ➔
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400 leading-normal">
                Transações de faturamento em conformidade com as regras brasileiras Anvisa/Vigilância.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PROVISIONING NEW TENANT */}
        {activeTab === 'onboarding' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Form to provision new SaaS Tenant */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
              <h3 className="font-bold text-slate-800 text-sm mb-1">Provisionamento Automatizado</h3>
              <p className="text-xs text-slate-400 mb-6 font-mono">Processamento de isolamento virtual e container setup</p>

              <form onSubmit={handleProvisionTenant} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Nome Legal do Inquilino</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Agro Defesa Dedetizações"
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Slug (Domínio SaaS dedicado)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: agrodefesa"
                    value={newTenantSlug}
                    onChange={(e) => setNewTenantSlug(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">E-mail Administrativo Contato</label>
                  <input
                    type="email"
                    required
                    placeholder="Ex: adm@agrodefesa.com"
                    value={newTenantEmail}
                    onChange={(e) => setNewTenantEmail(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Preset do Plano de Entrada</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
                    {[
                      { key: SubscriptionPlanTier.TRIAL, label: 'Trial Gratuito' },
                      { key: SubscriptionPlanTier.STARTER, label: 'Starter 5 users' },
                      { key: SubscriptionPlanTier.PROFESSIONAL, label: 'Professional' },
                      { key: SubscriptionPlanTier.ENTERPRISE, label: 'Enterprise' },
                    ].map(tier => (
                      <button
                        key={tier.key}
                        type="button"
                        onClick={() => setNewTenantTier(tier.key)}
                        className={`text-[10px] font-bold rounded-lg border p-2.5 transition-all cursor-pointer text-center ${
                          newTenantTier === tier.key
                            ? 'bg-slate-900 border-transparent text-white shadow-xs'
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {tier.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 mt-4">
                  <button
                    type="submit"
                    disabled={creatingTenant}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    Provisionar Inquilino Dedicado
                  </button>
                </div>
              </form>
            </div>

            {/* List of all tenants records */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3">Tabela de Clientes</h3>
                <p className="text-xs text-slate-500 mb-4">Empresas e agências atualmente configuradas em nível tático.</p>

                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {tenants.map(t => (
                    <div key={t.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
                      <div>
                        <p className="font-bold text-slate-800">{t.name}</p>
                        <p className="text-[9px] text-slate-400 mt-0.5">Slug: {t.slug}.ddsulf.com | {t.contactEmail}</p>
                      </div>

                      <span className={`text-[8px] font-black font-mono tracking-wider uppercase p-1 rounded leading-none ${
                        t.status === TenantStatus.ACTIVE ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-2.5 mt-4 text-[10px] text-slate-400 leading-tight">
                Processo em conformidade com as regras de Onboarding comercial de filiais.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: WHITE-LABEL FRANCHISES & SUB-ORGANIZATIONAL BRANCHES */}
        {activeTab === 'branches' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* List branches/franchises under the current Tenant organization context */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Unidades e Filiais Organizacionais</h3>
                  <p className="text-xs text-slate-400 mt-0.5 leading-snug">Multi-unidades e filiais configuradas para o faturamento fiscal segregado de {organization?.tradeName}.</p>
                </div>
                <span className="p-1 px-1.5 bg-slate-900 text-white text-[10px] uppercase font-mono font-bold rounded">
                  CNPJ: {organization?.cnpj}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organization?.branches.map((branch, index) => (
                  <div key={branch.id || index} className="border border-slate-150 rounded-2xl p-4 bg-slate-50/50 hover:border-slate-300 transition-all flex flex-col justify-between">
                    <div>
                      <div className="p-1.5 bg-white text-slate-700 border border-slate-100 rounded-lg inline-block shadow-xs mb-3">
                        <MapPin className="size-4" />
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-xs leading-snug">{branch.branchName}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">{branch.city}</p>
                    </div>

                    <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[11px] font-semibold text-slate-600">
                      <span>Técnicos em campo:</span>
                      <span className="font-bold text-slate-800">{branch.activeTechnicalsCount}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Form to add a new physical branch */}
              <div className="border-t border-slate-150 pt-5 mt-6">
                <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider font-mono mb-3">Adicionar Nova Filial / Base Operacional</h4>
                <form onSubmit={handleAddBranch} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Nome da Base</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Filial Gravataí"
                      value={branchName}
                      onChange={(e) => setBranchName(e.target.value)}
                      className="w-full border rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Cidade - UF</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Gravataí - RS"
                      value={branchCity}
                      onChange={(e) => setBranchCity(e.target.value)}
                      className="w-full border rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  <div className="flex items-end">
                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="size-4" />
                      Registrar Filial
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Side-box details: brand customizations standards (SaaS White-label setup) */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <span className="p-0.5 px-2 bg-indigo-600 rounded text-indigo-100 text-[10px] uppercase font-mono font-bold tracking-wider leading-none">
                  SaaS White-Labeling
                </span>
                <h4 className="font-extrabold text-white text-md tracking-tight mt-2.5">Customizações Regionais:</h4>
                <p className="text-xs text-slate-300 leading-normal mt-1">Todas as contas corporativas do DDSulf Enterprise suportam white-labeling estruturado.</p>

                <div className="space-y-3.5 mt-5">
                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-bold text-indigo-300 font-mono tracking-wider uppercase">BRAND LOGOTYPE & THEMES</p>
                    <p className="text-[10px] text-slate-400 mt-1">Carregamento e injeção automática de logotipos e cores da franquia nos PDFs estáticos emitidos.</p>
                  </div>

                  <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-800">
                    <p className="text-[10px] font-bold text-indigo-300 font-mono tracking-wider uppercase">REGIONAL COMPLIANCE RULES</p>
                    <p className="text-[10px] text-slate-400 mt-1">Assinaturas e cabeçalhos de auditoria técnica são adaptados à vigilância sanitária nacional.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 mt-6 text-[10px] text-slate-400 font-mono">
                Commercial scaling indices guaranteed: premium deployment active.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SaaSCockpit;
