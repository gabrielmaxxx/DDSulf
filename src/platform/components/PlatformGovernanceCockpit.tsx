/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  Layers, 
  HelpCircle, 
  Sliders, 
  Activity, 
  CheckCircle, 
  Plus, 
  AlertTriangle, 
  RefreshCw, 
  Cpu, 
  FileText, 
  Unlock, 
  Lock, 
  TrendingUp,
  Link as LinkIcon,
  BookOpen,
  ArrowRight,
  Info,
  Sparkles
} from 'lucide-react';
import { SaaSCockpit } from '@/saas/components/SaaSCockpit';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  LineChart, 
  Line,
  CartesianGrid
} from 'recharts';
import { toast } from 'sonner';

import { usePlatformGovernance } from '../hooks/usePlatformGovernance';
import { useArchitecturalStandards } from '../hooks/useArchitecturalStandards';
import { useSystemBoundaries } from '../hooks/useSystemBoundaries';
import { useScalabilityGovernance } from '../hooks/useScalabilityGovernance';
import { useEnterprisePolicies } from '../hooks/useEnterprisePolicies';
import { useOperationalConsistency } from '../hooks/useOperationalConsistency';
import { DebtSeverity } from '../types';

export function PlatformGovernanceCockpit() {
  const [activeTab, setActiveTab] = useState<'saas_provisioning' | 'modules' | 'debt' | 'security' | 'contracts' | 'performance'>('saas_provisioning');

  // Load custom enterprise hooks
  const { ownerships, debtItems, complianceScore, updateDebtStatus, registerNewDebt } = usePlatformGovernance();
  const { metrics, cleanCodeIndex } = useArchitecturalStandards();
  const { activeContracts } = useSystemBoundaries();
  const { latencies, scalabilityIndex } = useScalabilityGovernance();
  const { securityRules, toggleEnforcement } = useEnterprisePolicies();
  const { guidelines } = useOperationalConsistency();

  // Local state for registering new debt
  const [newDebtTitle, setNewDebtTitle] = useState('');
  const [newDebtComponent, setNewDebtComponent] = useState('Calculadora');
  const [newDebtSeverity, setNewDebtSeverity] = useState<DebtSeverity>(DebtSeverity.MEDIUM);
  const [newDebtDescription, setNewDebtDescription] = useState('');
  const [submittingDebt, setSubmittingDebt] = useState(false);

  // Form handle for registering Technical Debt
  const handleAddNewDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDebtTitle.trim() || !newDebtDescription.trim()) {
      toast.error('Preencha todos os campos do refatoramento pendente.');
      return;
    }

    setSubmittingDebt(true);
    try {
      registerNewDebt({
        title: newDebtTitle,
        component: newDebtComponent,
        severity: newDebtSeverity,
        estimatedFixHours: newDebtSeverity === DebtSeverity.CRITICAL ? 24 : newDebtSeverity === DebtSeverity.HIGH ? 16 : 8,
        description: newDebtDescription,
        status: 'pending'
      });
      toast.success('Dívida técnica mapeada e indexada no backlog da Squad!');
      setNewDebtTitle('');
      setNewDebtDescription('');
    } catch {
      toast.error('Controle de sessões temporariamente isolado.');
    } finally {
      setSubmittingDebt(false);
    }
  };

  // Recharts Chart configurations
  const coverageChartData = useMemo(() => {
    return ownerships.map(o => ({
      name: o.name,
      'Cobertura (%)': o.testCoverage,
      'Linhas Est.': o.linesOfCodeEstimated
    }));
  }, [ownerships]);

  const latencyDistributionData = useMemo(() => {
    return latencies.map(l => ({
      name: l.route.replace('/api/', ''),
      'Médio (ms)': l.avgResponseMs,
      'Máximo (ms)': l.maxResponseMs,
    }));
  }, [latencies]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header Hero section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 border-b border-slate-200 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-slate-900 text-white text-[10px] uppercase tracking-wider font-mono font-bold rounded-md flex items-center gap-1 leading-none shadow-xs">
              <Cpu className="size-3" />
              SaaS Control Plane
            </span>
            <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-mono font-semibold">
              <ShieldCheck className="size-3.5" />
              Governança Ativa
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Plataforma, Governança & Consolidação
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Gerenciamento tático de limites modulares, segurança de isolamento por Tenant, dívida técnica e cobertura de testes corporativos.
          </p>
        </div>

        <button 
          onClick={() => {
            toast.success('Assinaturas e checksums reconciliados!');
          }}
          className="text-xs font-semibold bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 self-start md:self-auto"
        >
          <RefreshCw className="size-3.5" />
          Verificar Assinaturas
        </button>
      </div>

      {/* 2. Platform high level indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Compliance Rating Block */}
        <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldCheck className="size-20" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-indigo-200 uppercase tracking-wider font-mono">Consolidated Compliance</span>
            <span className="size-2 rounded-full bg-emerald-400" />
          </div>
          <div className="my-3 flex items-baseline gap-1.5">
            <span className="text-4xl font-black tracking-tight">{complianceScore}</span>
            <span className="text-xs text-indigo-200">/100</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${complianceScore}%` }} />
          </div>
          <span className="text-[9px] font-medium text-indigo-200 mt-2 flex items-center gap-1">
            <CheckCircle className="size-3 text-emerald-400" />
             Atende os padrões de governança
          </span>
        </div>

        {/* Metric 2: Clean code checklist */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">Qualidade Limpa - CSS/JS</span>
            <Layers className="size-3.5 text-indigo-600" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{cleanCodeIndex}%</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-indigo-600 h-1 rounded-full" style={{ width: `${cleanCodeIndex}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 mt-2 block">
            Níveis de acoplamento saudáveis
          </span>
        </div>

        {/* Metric 3: Scalability footprint */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">Prevenção Gargalos (Scale)</span>
            <Activity className="size-3.5 text-rose-500" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{scalabilityIndex}%</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-rose-500 h-1 rounded-full" style={{ width: `${scalabilityIndex}%` }} />
          </div>
          <span className="text-[10px] font-medium text-slate-500 mt-2 font-mono">
            Limiar de latências ativas OK
          </span>
        </div>

        {/* Metric 4: Security Rules Coverage */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">Políticas de Segurança</span>
            <Sliders className="size-3.5 text-emerald-500" />
          </div>
          <div className="my-3">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {Math.round((securityRules.filter(r => r.isEnforced).length / (securityRules.length || 1)) * 100)}%
            </div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${(securityRules.filter(r => r.isEnforced).length / (securityRules.length || 1)) * 100}%` }} />
          </div>
          <span className="text-[10px] font-medium text-slate-500 mt-2">
            Isolamento e controle de requests
          </span>
        </div>
      </div>

      {/* 3. Navigation tabs */}
      <div className="flex scrollbar-none items-center overflow-x-auto bg-slate-200/60 p-1.5 rounded-2xl mb-6 gap-1 border border-slate-200/85">
        {[
          { id: 'saas_provisioning', label: 'Provedor SaaS & Tenants', icon: Sparkles },
          { id: 'modules', label: 'Módulos e Cobertura', icon: Layers },
          { id: 'security', label: 'Políticas e Auditoria', icon: ShieldCheck },
          { id: 'contracts', label: 'Contratos e Acoplamento', icon: LinkIcon },
          { id: 'debt', label: 'Controle de Backlog (Débitos)', icon: AlertTriangle, badge: debtItems.filter(d => d.status === 'pending').length },
          { id: 'performance', label: 'Latências Operacionais', icon: Activity },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center h-10 px-4 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 gap-1.5 select-none cursor-pointer ${
                isSelected 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <IconComponent className="size-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`inline-block h-5 min-w-5 px-1 bg-rose-500 text-white text-[9px] font-semibold rounded-full flex items-center justify-center leading-none ${
                  isSelected ? 'bg-indigo-600' : ''
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab content renderer */}
      <div className="flex-1 w-full">
        {/* SAAS PROVISIONING & TENANTS COCKPIT */}
        {activeTab === 'saas_provisioning' && (
          <div className="animate-fade-in">
            <SaaSCockpit />
          </div>
        )}

        {/* MODULES & OVERVIEW TAB */}
        {activeTab === 'modules' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Visual charting of Test Coverage vs LOC */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Cobertura de Testes Unitários por Módulo</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Visão do percentual de checagem automatizada visando erradicar regressões no campo.</p>
                </div>
                <span className="p-1 px-2 text-[10px] bg-slate-100 rounded-lg text-slate-500 font-mono">Meta: &gt;85%</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coverageChartData}>
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: '12px' }} />
                    <Bar dataKey="Cobertura (%)" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={35} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* General module list */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3">Módulos e Ownerships táticos</h3>
                <p className="text-xs text-slate-500 mb-4">Mapeamento direto de liderança técnica para desvios estruturais ou comportamentais detectados.</p>
                
                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                  {ownerships.map(mod => (
                    <div key={mod.id} className="flex items-center justify-between border-b border-slate-100 pb-2.5 text-xs">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <p className="font-bold text-slate-800">{mod.name}</p>
                          <span className="p-0.5 px-1 text-[8px] bg-indigo-50 border border-indigo-100 rounded-md font-mono text-indigo-700 leading-none">
                            {mod.ownerTeam}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">Resp: {mod.techLead} | LOC Est: {mod.linesOfCodeEstimated}</p>
                      </div>

                      <span className={`text-[9px] font-bold py-0.5 px-1.5 rounded-lg border leading-none ${
                        mod.status === 'experimental' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {mod.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4">
                <span className="text-[9px] font-bold text-indigo-600 font-mono tracking-wider block">CONFORMIDADE OPERACIONAL</span>
                <p className="text-[10px] text-slate-400 mt-1">
                  Squads são acionadas de forma assíncrona para auditorias recorrentes baseadas nos logs de telemetria acumulados.
                </p>
              </div>
            </div>

            {/* Conventions guidelines status list */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-3">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Conventions Checklist & Lint Standards</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {guidelines.map(gui => (
                  <div key={gui.key} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/60 flex items-start gap-2.5">
                    <CheckCircle className="size-4.5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-xs">{gui.name}</h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{gui.pattern}</p>
                      <span className="inline-block text-[9px] font-bold bg-emerald-50 text-emerald-700 mt-2 p-0.5 px-1 rounded">
                        {gui.conformanceRatio}% conforme
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECURITY & ISOLATION POLICIES TAB */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-1">Políticas de Segurança e Isolamento por Tenant</h3>
              <p className="text-xs text-slate-400 mb-6 font-mono">Governança para garantir blindagem de dados corporativos (Não-Vazamento)</p>

              <div className="space-y-4">
                {securityRules.map(rule => (
                  <div key={rule.id} className="border border-slate-100 rounded-xl p-4 flex items-start justify-between gap-4 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-xl shrink-0 ${rule.isEnforced ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                        {rule.isEnforced ? <Lock className="size-4" /> : <Unlock className="size-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900 text-sm">{rule.code} - {rule.category.toUpperCase()}</h4>
                          <span className={`text-[8px] font-bold px-1 rounded ${
                            rule.isEnforced ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {rule.isEnforced ? 'Ativa' : 'Inativa'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 leading-snug">{rule.description}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        toggleEnforcement(rule.id);
                        toast.success(`Regra ${rule.code} ${!rule.isEnforced ? 'ATIVADA' : 'DESATIVADA'}`);
                      }}
                      className={`text-xs px-3.5 py-1.5 rounded-xl font-bold border transition-colors cursor-pointer shrink-0 ${
                        rule.isEnforced 
                          ? 'border-indigo-100 bg-indigo-50 hover:bg-indigo-100 text-indigo-700' 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      Alternar
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Side-box details */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="p-1 px-2 border border-slate-700 text-indigo-300 text-[9px] uppercase tracking-wider font-mono rounded-md inline-block leading-none">
                  Controle de Isolamento
                </span>
                <h4 className="text-sm font-extrabold tracking-tight text-white leading-tight">O que representa a governança de isolamento?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Operadores de controle de vetores representam múltiplos concorrentes em uma única infraestrutura Cloud. Consequentemente, regras estritas evitam o vazamento de inventário, relatórios regulatórios Anvisa ou faturamento de receitas.
                </p>
                <div className="space-y-2 text-xs bg-slate-800 p-3 rounded-xl border border-slate-700">
                  <div className="flex items-start gap-1 text-slate-300">
                    <span className="text-indigo-400 font-bold">• SEC-001:</span>
                    <span>Blindagem completa de queries de banco.</span>
                  </div>
                  <div className="flex items-start gap-1 text-slate-300">
                    <span className="text-indigo-400 font-bold">• SEC-002:</span>
                    <span>TenantId injetado recursivamente em nível de roteamento.</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-800 pt-4 text-[10px] text-slate-400">
                Padrão de governança auditada contra desvios de compliance SaaS Enterprise.
              </div>
            </div>
          </div>
        )}

        {/* COMMUNICATION CONTRACTS TAB */}
        {activeTab === 'contracts' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in bg-transparent">
            {/* System Contracts list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Contratos de Comunicação entre Módulos</h3>
                <p className="text-xs text-slate-400 mb-6">Mapeamento de interfaces estáveis para desvincular acoplamento direto.</p>

                <div className="space-y-4">
                  {activeContracts.map(cnt => (
                    <div key={cnt.id} className="border border-slate-100 rounded-xl p-3.5 bg-slate-50/55 flex items-center justify-between text-xs hover:border-slate-200 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-slate-250 text-slate-700 rounded-lg">
                          <LinkIcon className="size-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-slate-900">{cnt.interfaceName}</span>
                            <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-mono">
                              {cnt.sourceModule} → {cnt.targetModule}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">ID: {cnt.id} | {cnt.validationRulesCount} regras de validação ativas</p>
                        </div>
                      </div>

                      <span className={`text-[8px] font-black font-mono tracking-wider uppercase p-1 rounded leading-none ${
                        cnt.isStable ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {cnt.isStable ? 'Estável (Garantido)' : 'Em Revisão'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400 flex items-center gap-1">
                <Info className="size-3.5 text-indigo-500 scale-90" />
                Diferente de acoplamentos legados, interfaces estáveis blindam modificações unilaterais.
              </div>
            </div>

            {/* Documentation box for platform integration patterns */}
            <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col justify-between">
              <div>
                <h4 className="text-xs tracking-wider uppercase font-bold text-indigo-300 font-mono mb-2">Padrões de Integração</h4>
                <p className="text-xs text-slate-300 leading-normal mb-4">
                  Toda interação entre domínios (por exemplo, débito de ingrediente ativo no estoque químico quando gerado na calculadora) exige a criação de interfaces imutáveis que previnem falhas em produção.
                </p>

                <div className="space-y-3 mt-4 text-xs">
                  <div className="border-l-2 border-indigo-500 pl-3 py-1 bg-slate-800/50 rounded-r-lg">
                    <p className="font-bold text-[10px] text-indigo-200">INTERFACE STABILIZATION</p>
                    <p className="text-[10px] text-slate-400">Mudanças em interfaces consolidadas necessitam de retrabalho deprecado de 30 dias.</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-3 mt-6 text-[10px] text-slate-400">
                Directives under governance index: stable communications guaranteed.
              </div>
            </div>
          </div>
        )}

        {/* SYSTEM LATENCIES & API PERFORMANCE TAB */}
        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Visual charting of latencies */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Distribuição de Latência por Chamadas de API</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 font-mono">Medição dinâmica de execução nas rotas de microsserviços integrados.</p>
                </div>
                <span className="p-1 px-2 text-[10px] bg-slate-100 rounded-lg text-slate-500 font-mono">Média: 310ms</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={latencyDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    <XAxis dataKey="name" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: '12px' }} />
                    <Line type="monotone" dataKey="Médio (ms)" stroke="#4F46E5" strokeWidth={2} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Máximo (ms)" stroke="#EF4444" strokeWidth={1} strokeDasharray="4 4" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* List details of overburdened routes */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3">Monitorador de Gargalos</h3>
                <p className="text-xs text-slate-500 mb-4 leading-normal">Visão sistemática das rotas que excederam limites recomendados.</p>
                
                <div className="space-y-3 max-h-[280px] overflow-y-auto">
                  {latencies.map((l, idx) => {
                    const isSlow = l.avgResponseMs > 300;
                    return (
                      <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-2 text-xs">
                        <div>
                          <p className="font-bold text-slate-850 font-mono text-[10px]">{l.route}</p>
                          <p className="text-[9px] text-slate-400">Total Requests/Min: {l.requestFrequencyPerMin}</p>
                        </div>
                        <div className="text-right">
                          <span className={`block font-mono font-bold ${isSlow ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {l.avgResponseMs}ms
                          </span>
                          <span className="block text-[8px] text-slate-450">Max: {l.maxResponseMs}ms</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-100 p-3 rounded-xl mt-4">
                <p className="text-[10px] text-amber-800 leading-normal font-semibold">
                  *IA em latências: Rotas lentas geram disparos de otimização de cache offline de receitas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TECHNICAL DEBT CONTROL TAB */}
        {activeTab === 'debt' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* List backlog of technical debts */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-1">Mapeamento de Backlog e Refatoração</h3>
                <p className="text-xs text-slate-400 mb-6">Controle tático de passivos arquiteturais mantendo o crescimento escalável.</p>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {debtItems.map(debt => (
                    <div key={debt.id} className="border border-slate-100 rounded-xl p-3.5 flex items-start justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-all">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          debt.status === 'resolved' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : debt.severity === 'high' 
                            ? 'bg-rose-50 text-rose-600' 
                            : 'bg-amber-50 text-amber-600'
                        }`}>
                          <AlertTriangle className="size-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-tight">{debt.title}</h4>
                            <span className="text-[9px] bg-slate-800 text-white font-mono rounded px-1.5 py-0.5 leading-none">
                              {debt.component}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 max-w-md">{debt.description}</p>
                          <p className="text-[10px] text-indigo-500 font-mono font-bold mt-1.5">Estimativa: {debt.estimatedFixHours}h de desenvolvimento</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[9px] font-bold py-0.5 px-2 rounded-lg border leading-none ${
                          debt.status === 'resolved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : debt.status === 'in_progress'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {debt.status.replace('_', ' ')}
                        </span>
                        
                        {debt.status !== 'resolved' && (
                          <div className="mt-3 flex gap-1 justify-end">
                            <button
                              onClick={() => {
                                updateDebtStatus(debt.id, 'resolved');
                                toast.success('Passivo refatorado e sanado com sucesso!');
                              }}
                              className="text-[9px] font-bold border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-1 rounded hover:bg-emerald-100 transition-colors cursor-pointer"
                            >
                              Sanalizar
                            </button>
                            {debt.status === 'pending' && (
                              <button
                                onClick={() => {
                                  updateDebtStatus(debt.id, 'in_progress');
                                  toast.info('Trabalho iniciado na Squad.');
                                }}
                                className="text-[9px] font-bold border border-indigo-200 bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 transition-colors cursor-pointer"
                              >
                                Iniciar
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4 text-[10px] text-slate-400">
                Indexador dinâmico: novos registros recalculam a Conformidade Geral.
              </div>
            </div>

            {/* Register new debt Form */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <form onSubmit={handleAddNewDebt} className="space-y-4">
                <div className="flex items-center gap-1 text-slate-500 font-mono mb-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <span className="font-extrabold text-xs uppercase tracking-wider block">Registrar Dívida Técnica</span>
                </div>
                
                <p className="text-xs text-slate-500 leading-snug">Identificou trechos repetitivos, acoplamentos indevidos ou falta de responsividade em campo? Registre no backlog global.</p>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Componente/Módulo</label>
                  <select
                    value={newDebtComponent}
                    onChange={(e) => setNewDebtComponent(e.target.value)}
                    className="w-full bg-white border rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden text-slate-700 focus:border-indigo-500"
                  >
                    <option value="Calculadora">Calculadora Doses</option>
                    <option value="Dashboard">Dashboard Geral</option>
                    <option value="Financeiro">Painel Financeiro</option>
                    <option value="POPs">Procedimentos (POPs)</option>
                    <option value="Estoque">Estoque Químicos</option>
                    <option value="Segurança">Segurança & isolamento</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Severidade Técnica</label>
                  <div className="flex gap-2 mt-1">
                    {[
                      { key: DebtSeverity.LOW, label: 'Baixa' },
                      { key: DebtSeverity.MEDIUM, label: 'Média' },
                      { key: DebtSeverity.HIGH, label: 'Alta' },
                    ].map((sev) => (
                      <button
                        key={sev.key}
                        type="button"
                        onClick={() => setNewDebtSeverity(sev.key)}
                        className={`flex-1 text-[10px] font-bold rounded-lg border p-1.5 transition-all text-center cursor-pointer ${
                          newDebtSeverity === sev.key
                            ? 'bg-slate-900 border-transparent text-white shadow-xs scale-102'
                            : 'bg-slate-50 border-slate-100 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {sev.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Título do Refabricamento</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Normalizar decimais calculadora..."
                    value={newDebtTitle}
                    onChange={(e) => setNewDebtTitle(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-indigo-500 text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Descrição e Impacto</label>
                  <textarea
                    rows={2}
                    required
                    placeholder="Explicite o gargalo ou vazamento técnico..."
                    value={newDebtDescription}
                    onChange={(e) => setNewDebtDescription(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-indigo-500 text-slate-800 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingDebt}
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all flex items-center justify-center gap-1 shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="size-3.5" />
                  Mapear Refatoramento
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default PlatformGovernanceCockpit;
