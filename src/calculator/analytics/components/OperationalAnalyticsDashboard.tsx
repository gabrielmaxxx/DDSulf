import React, { useState } from 'react';
import { useHistoricalMetrics } from '../hooks/useHistoricalMetrics';
import { useOperationalIntelligence } from '../hooks/useOperationalIntelligence';
import { HistoricalComparisonSystem } from './HistoricalComparisonSystem';
import { ForecastPanel } from './ForecastPanel';
import { AIReadyPreview } from './AIReadyPreview';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  Cell
} from 'recharts';
import { 
  Building2, 
  ShieldAlert, 
  Coins, 
  Timer, 
  TrendingUp, 
  Zap, 
  Sparkles, 
  Lightbulb, 
  GitMerge, 
  Grid3X3, 
  ChevronRight,
  Target,
  ArrowRight,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export function OperationalAnalyticsDashboard() {
  const [activeSubTab, setActiveSubTab] = useState<'kpis' | 'compare' | 'forecast' | 'aiready'>('kpis');
  
  const { metrics, loading: metricsLoading, refreshMetrics } = useHistoricalMetrics();
  const { insights, forecasts, loading: intelLoading, refreshIntelligence } = useOperationalIntelligence();

  const handleManualRefresh = () => {
    refreshMetrics();
    refreshIntelligence();
    toast.success('Métricas operacionais recomputadas dinamicamente!');
  };

  const loading = metricsLoading || intelLoading;

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4">
        <RefreshCw className="size-8 mx-auto text-slate-400 animate-spin" />
        <p className="text-sm font-bold text-slate-500">Compilando Snapshots de Inteligência...</p>
        <p className="text-xs text-slate-450 max-w-sm mx-auto font-medium">Reagrupando fluxos de custos de deslocamento, químicos, equipes e margens financeiras em tempo real.</p>
      </div>
    );
  }

  // Prepares charts content
  const marginChartData = metrics ? Object.entries(metrics.margemPorTipoPraga).map(([name, value]) => ({
    name,
    margem: value
  })) : [];

  const freqChartData = metrics ? Object.entries(metrics.frequenciaOperacional).map(([name, count]) => ({
    name,
    instalacoes: count
  })) : [];

  // Recharts color palette
  const COLORS = ['#0f172a', '#475569', '#10b981', '#6366f1', '#f59e0b', '#3b82f6', '#ec4899'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Operational Intelligence Engine</h2>
          <p className="text-slate-500 font-medium text-xs sm:text-sm">
            Auditoria avançada de orçamentos, rendimento de químicos, margens, detecção de vazamentos financeiros e IA preditiva.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono bg-emerald-500/10 text-emerald-600 font-black px-2.5 py-1 rounded-md uppercase">
            ● Firestore Sync Active
          </span>
          <button
            type="button"
            onClick={handleManualRefresh}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors cursor-pointer"
          >
            <RefreshCw className="size-3.5" /> Recalcular
          </button>
        </div>
      </div>

      {/* Internal Navigation Subtabs */}
      <div className="border-b border-slate-100 pb-px">
        <nav className="flex gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('kpis')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'kpis'
                ? 'border-black text-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Grid3X3 className="size-4" /> Desempenho & KPIs
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('compare')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'compare'
                ? 'border-black text-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <GitMerge className="size-4" /> Comparar Versões
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('forecast')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'forecast'
                ? 'border-black text-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <TrendingUp className="size-4" /> Projeções Sazonais
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('aiready')}
            className={`flex items-center gap-2 px-5 py-3 border-b-2 text-xs font-black uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'aiready'
                ? 'border-black text-black'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            <Sparkles className="size-4" /> AI-Ready Structures
          </button>
        </nav>
      </div>

      {/* Dynamic Sub-tab Render */}
      <div className="space-y-8 animate-in fade-in duration-300">
        
        {activeSubTab === 'compare' && <HistoricalComparisonSystem />}
        {activeSubTab === 'forecast' && <ForecastPanel />}
        {activeSubTab === 'aiready' && <AIReadyPreview />}

        {activeSubTab === 'kpis' && (
          <>
            {/* KPI STATS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              
              {/* Stat 1: Total Profitability */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">PestFlow Gross Margin</span>
                  <div className="bg-emerald-500/10 p-1 rounded-lg text-emerald-600">
                    <Coins className="size-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-slate-500 font-bold">Lucratividade de Cotações</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-slate-900">
                      R$ {metrics?.lucratividadeTotal.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 px-1 rounded-sm font-bold">
                      +14.8%
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat 2: Avg Margin */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Operating Efficiency</span>
                  <div className="bg-black text-white p-1 rounded-lg">
                    <Target className="size-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-slate-500 font-bold">Margem Operacional Média</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-slate-900">
                      {metrics?.margemMediaPercent}%
                    </span>
                    <span className="text-[9px] font-mono bg-emerald-50 text-emerald-600 px-1 rounded-sm font-bold">
                      Target Met
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat 3: Avg Ticket */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Commercial Size</span>
                  <div className="bg-slate-100 p-1 rounded-lg text-slate-600">
                    <Building2 className="size-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-slate-500 font-bold">Ticket Médio de Serviços</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-slate-900">
                      R$ {metrics?.ticketMedio.toLocaleString('pt-BR')}
                    </span>
                    <span className="text-[9px] font-mono text-slate-450 font-bold">
                      SaaS High-Tier
                    </span>
                  </div>
                </div>
              </div>

              {/* Stat 4: Quote Speed */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex flex-col justify-between h-32">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Workflow Velocity</span>
                  <div className="bg-violet-500/10 p-1 rounded-lg text-violet-500">
                    <Timer className="size-4" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xs text-slate-500 font-bold">Tempo Elaboração de Proposta</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-xl font-black text-slate-900">
                      ~ {metrics?.tempoMedioOrcamentoSegundos}s
                    </span>
                    <span className="text-[9px] font-mono bg-violet-50 text-violet-600 px-1 rounded-sm font-bold">
                      Optimal
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* MAIN ANALYTICS VISUALIZATIONS CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Chart 1: Margins by Pest Type */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Taxa de Margem por Tipo de Praga</h3>
                  <p className="text-xs text-slate-500 font-medium">Margem bruta média extraída das cotações divididas por família biológica.</p>
                </div>

                <div className="h-60 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marginChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff' }}
                        itemStyle={{ fontSize: 11 }}
                        labelStyle={{ fontSize: 10, color: '#94a3b8' }}
                        formatter={(v: any) => [`${v}%`, 'Margem Média']}
                      />
                      <Bar dataKey="margem" radius={[8, 8, 0, 0]} maxBarSize={30}>
                        {marginChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Operational Frequency by Pest */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900">Frequência Operacional</h3>
                  <p className="text-xs text-slate-500 font-medium">Volume total de visitas e orçamentos calculados para controle de pragas.</p>
                </div>

                <div className="h-60 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={freqChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '10px', color: '#fff' }}
                        itemStyle={{ fontSize: 11 }}
                        labelStyle={{ fontSize: 10, color: '#94a3b8' }}
                        formatter={(v: any) => [`${v} orçamentos`, 'Cotações Realizadas']}
                      />
                      <Bar dataKey="instalacoes" radius={[8, 8, 0, 0]} maxBarSize={30}>
                        {freqChartData.map((entry, index) => (
                          <Cell key={`cell-freq-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* TWO-COLUMN LOWER SECTION: INSIGHTS CARD & WORKFLOW DEVIATION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Column 1 & 2: Operational Insights (Anomaly detectors) */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5 px-1">
                  <Lightbulb className="size-4 text-amber-500" /> Insights & Recomendações de Segurança
                </h3>

                <div className="space-y-4">
                  {insights.map((ins) => (
                    <div 
                      key={ins.id}
                      className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs transition-transform hover:translate-y-[-1px]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`size-2.5 rounded-full ${
                            ins.type === 'chemical_efficiency' 
                              ? 'bg-red-500' 
                              : ins.type === 'margin_leakage' 
                                ? 'bg-amber-400' 
                                : 'bg-indigo-400'
                          }`} />
                          <h4 className="text-xs font-black text-slate-900">{ins.title}</h4>
                        </div>

                        {ins.impactValue > 0 && (
                          <span className="text-[10px] font-black font-mono uppercase bg-rose-50 text-rose-600 px-2.5 py-1 rounded-md">
                            Desperdício: R$ {ins.impactValue}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 font-semibold mt-2.5 leading-relaxed">
                        {ins.message}
                      </p>

                      {/* Evidence Pill layout */}
                      <div className="flex flex-wrap gap-2 mt-4">
                        {ins.evidence.map((ev, eidx) => (
                          <span key={`${ins.id}-ev-${eidx}`} className="text-[10px] text-slate-500 font-bold bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                            {ev.key}: <span className="text-slate-850 font-extrabold">{ev.value}</span>
                          </span>
                        ))}
                        <span className="text-[10px] text-violet-500 font-extrabold bg-violet-500/5 px-2 py-1 rounded-lg font-mono ml-auto">
                          Confiança {(ins.confidence * 100).toFixed(0)}%
                        </span>
                      </div>

                      {/* Suggested action */}
                      <div className="border-t border-slate-100 pt-3 mt-3 flex items-start gap-1.5">
                        <Zap className="size-3 text-amber-500 mt-0.5 shrink-0" />
                        <span className="text-[11px] text-slate-650 font-bold">
                          Sugerido: <span className="text-slate-800 font-normal">{ins.suggestedAction}</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Workflow dropouts / Speed indicators */}
              <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <GitMerge className="size-3.5" /> Funil e Abandono do Workflow
                </h3>

                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500">Conversão do Assistido</span>
                    <span className="text-lg font-black text-slate-900 block mt-0.5">88%</span>
                    <span className="text-[10px] text-slate-400 font-semibold">22 terminados de 25 começados</span>
                  </div>
                  <div className="w-16 h-16 rounded-full border-4 border-emerald-500/10 border-t-emerald-500 flex items-center justify-center font-mono font-black text-xs text-slate-850">
                    88%
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tempo Médio Estimado nas Etapas</h4>
                  
                  {/* Step list for top bottlenecks */}
                  <div className="space-y-2 max-h-56 overflow-y-auto">
                    <div className="flex justify-between items-center text-xs p-2 bg-slate-50/50 rounded-xl">
                      <span className="font-bold text-slate-600">Etapa 4: Dimensionar Área</span>
                      <span className="font-mono text-slate-500 font-bold">25s (Crítico)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2 bg-slate-50/50 rounded-xl">
                      <span className="font-bold text-slate-600">Etapa 10: Insumos Químicos</span>
                      <span className="font-mono text-slate-500 font-bold">35s (Alto)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2 bg-slate-50/50 rounded-xl">
                      <span className="font-bold text-slate-600">Etapa 11: Escolher Descontos</span>
                      <span className="font-mono text-slate-500 font-bold">30s (Alto)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs p-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-100">
                      <span className="font-bold text-slate-450">Outras Etapas</span>
                      <span className="font-mono text-slate-400">~ 18s cada</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-slate-100 p-4 rounded-2xl flex items-center justify-between text-xs cursor-pointer hover:bg-black transition-colors" onClick={() => setActiveSubTab('aiready')}>
                  <div className="space-y-0.5">
                    <span className="font-bold block">Integrar com Chatbot IA</span>
                    <span className="text-[10px] text-slate-400 font-medium">Habilitar piloto automático no WhatsApp</span>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </div>
              </div>

            </div>
          </>
        )}

      </div>

    </div>
  );
}
