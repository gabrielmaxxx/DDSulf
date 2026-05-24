import React, { useState } from 'react';
import { 
  TrendingUp, 
  BarChart3, 
  DollarSign, 
  Activity, 
  Sparkles, 
  Filter, 
  CheckCircle, 
  Building2, 
  Thermometer, 
  Scale, 
  Layers, 
  AlertCircle, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  User,
  Sliders,
  RefreshCw,
  Plus,
  ShieldAlert,
  FileSpreadsheet,
  Download,
  Users,
  BadgeAlert,
  Flame,
  Zap,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar 
} from 'recharts';
import { 
  useOperationalKPIs, 
  useFinancialAnalytics, 
  useRealtimeMetrics, 
  useForecasting, 
  useDecisionInsights,
  useAnalyticsContext,
  useCustomerIntelligence,
  useReporting,
  useAnomalyDetection
} from '../hooks';
import { toast } from 'sonner';
import { motion } from 'motion/react';

export function BusinessIntelligenceDashboard() {
  const { activeTenantId, changeTenantContext } = useAnalyticsContext();

  // Fetch state engines from custom DDSulf hooks
  const { kpis, adjustKPIValue } = useOperationalKPIs();
  const { servicesProfitability, applyFinancialDelta, getDilutionCostStructure } = useFinancialAnalytics();
  const { pulse } = useRealtimeMetrics();
  const { revenueForecast, pestActivity } = useForecasting();
  const { insights, executeApplyDecision, createCustomAdvisoryTrigger } = useDecisionInsights();
  const { churnRisks, segmentStats, averageLTVOverall, resolveRiskThreat } = useCustomerIntelligence();
  const { reports, compileNewReport, getCsvData, incrementDownload } = useReporting();
  const { anomalies, runSystemScan, forceInjectAnomaly } = useAnomalyDetection();

  // Tab navigation states
  const [activeSegment, setActiveSegment] = useState<'kpis' | 'financials' | 'demands' | 'customers' | 'decisions' | 'reports'>('kpis');

  // Dilution simulation variables
  const [dilutionPesticideKg, setDilutionPesticideKg] = useState<number>(15);
  const [dilutionWaterLiters, setDilutionWaterLiters] = useState<number>(400);
  const [dilutionCostKg, setDilutionCostKg] = useState<number>(65);

  // Dynamic input values for calibrating a KPI
  const [editingKpiKey, setEditingKpiKey] = useState<string | null>(null);
  const [editingKpiValue, setEditingKpiValue] = useState<number>(0);

  // Custom simulation trigger variables
  const [newInsightTitle, setNewInsightTitle] = useState('Anormalidade de Dosagem Fipronil');
  const [newInsightDesc, setNewInsightDesc] = useState('Consumo de fipronil ultrapassou 12% do previsto para o lote rural em Erechim.');
  const [newInsightAction, setNewInsightAction] = useState('Ajustar taxa de aspersão mecânica para 2.4 litros por hora aérea.');
  const [newInsightCategory, setNewInsightCategory] = useState<'anomaly' | 'profitability' | 'scheduling' | 'pesticide'>('anomaly');
  const [newInsightScore, setNewInsightScore] = useState<number>(85);

  // Custom report drafting variables
  const [draftReportName, setDraftReportName] = useState('Consumo de Fipronil vs Sazonalidade de Solo');
  const [draftReportScope, setDraftReportScope] = useState<'financial' | 'chemical' | 'regulatory' | 'operational'>('chemical');

  // Custom anomaly injection variables
  const [injectMetricKey, setInjectMetricKey] = useState('temperature_sensor_graneleiro');
  const [injectValue, setInjectValue] = useState(48.2);
  const [injectExpected, setInjectExpected] = useState(38.0);
  const [injectSource, setInjectSource] = useState('Termosensor Silo PF B-12');
  const [injectSeverity, setInjectSeverity] = useState<'low' | 'medium' | 'critical'>('critical');
  const [injectRemedy, setInjectRemedy] = useState('Estabilizar vargens aéreas e acionar aspersão mecânica com fipronil diluído.');

  // Calculation summaries
  const calculatedDilution = getDilutionCostStructure(dilutionPesticideKg, dilutionWaterLiters, dilutionCostKg);

  const handleKPIEditSubmit = (key: string) => {
    adjustKPIValue(key, editingKpiValue);
    setEditingKpiKey(null);
    toast.success('KPI calibrado com sucesso e indexado ao orquestrador operacional.');
  };

  const handleAddCustomInsight = () => {
    createCustomAdvisoryTrigger(
      newInsightCategory,
      newInsightTitle,
      newInsightDesc,
      newInsightAction,
      newInsightScore
    );
    toast.success('Insight operacional gerado!', {
      description: 'Acoplado às rotinas de auditoria com nível de criticidade mapeado.'
    });
  };

  const handleCreateReport = () => {
    if (!draftReportName.trim()) {
      toast.error('O título do relatório não pode estar vazio');
      return;
    }
    compileNewReport(draftReportName, draftReportScope);
    setDraftReportName('');
    toast.success('Relatório e Snapshot Analítico compilados com sucesso!');
  };

  const handleSimulateCSV = (scope: string, title: string) => {
    const rawCSV = getCsvData(scope);
    const blob = new Blob([rawCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_snapshot.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Download do snapshot analítico iniciado!');
  };

  const handleInjectAnomaly = () => {
    forceInjectAnomaly(
      injectMetricKey,
      injectSource,
      injectValue,
      injectExpected,
      injectSeverity,
      injectRemedy
    );
    toast.success('Inconsistência operacional injetada!', {
      description: 'Isolador de anomalias detectou o desvio e alimentou o roteador de IA com nível crítico.'
    });
  };

  // Convert raw pestactivity values to Recharts payload
  const pestChartData = pestActivity.months.map((m, idx) => ({
    month: m,
    Cupins: pestActivity.cupins[idx],
    Baratas: pestActivity.baratas[idx],
    Roedores: pestActivity.roedores[idx],
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      
      {/* Header section with Tenant isolator context */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-100 pb-6">
        <div className="space-y-1">
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#4F46E5] flex items-center gap-1.5 leading-none">
            <Activity className="size-3 text-indigo-500 animate-pulse" /> DDSulf Enterprise BI Network
          </span>
          <h1 className="text-4xl font-extrabold text-black tracking-tight" id="bi-dashboard-title">
            Business Intelligence & Operational Engine
          </h1>
          <p className="text-gray-500 text-sm max-w-4xl font-semibold">
            Central de tomada de decisões, auditoria química e previsões financeiras estruturadas. Monitore a rampa de lucratividade, sazonalidade de pragas agrícolas rurais e simulação inteligente de formulações diluídas.
          </p>
        </div>

        {/* Multi-Tenant Context Isolator Box */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-2xl flex items-center gap-3.5 self-stretch lg:self-auto" id="tenant-isolator-box">
          <Building2 className="size-5 text-zinc-400 shrink-0" />
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-400 font-black uppercase tracking-wider block leading-none">Contexto de Empresa (Multi-Tenant)</span>
            <select 
              id="tenant-context-select"
              value={activeTenantId}
              onChange={(e) => {
                changeTenantContext(e.target.value);
                toast.success(`Contexto isolado alternado para: ${e.target.value.toUpperCase()}`);
              }}
              className="text-xs font-bold text-zinc-800 bg-transparent border-none p-0 focus:outline-none focus:ring-0 cursor-pointer pr-5"
            >
              <option value="tenant_erechim_premium">DDSulf Erechim S/A (HQ)</option>
              <option value="tenant_passofundo_rural">DDSulf Passo Fundo (Silos & Grãos)</option>
              <option value="tenant_santamaria_agro">DDSulf Santa Maria (Culturas Mistas)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Real-Time Pulse Telemetry bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-zinc-900 text-zinc-400 rounded-3xl font-mono text-xs" id="bi-telemetry-bar">
        <div className="space-y-1 border-r border-zinc-800 pr-4">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Carga Química em Trânsito</span>
          <p className="text-lg font-black text-white">{pulse.activeCrowsKg} kg</p>
          <span className="text-[9px] text-[#4F46E5] font-black">Aspersão Ativa Local</span>
        </div>

        <div className="space-y-1 md:border-r border-zinc-800 md:px-4">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Técnicos em Operação</span>
          <p className="text-lg font-black text-white">{pulse.liveOperatorCount} ativos</p>
          <span className="text-[9px] text-emerald-500 font-bold">Rastreamento GPS OK</span>
        </div>

        <div className="space-y-1 border-r border-zinc-800 pr-4 md:px-4">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Hectares Tratados Hoje</span>
          <p className="text-lg font-black text-white">{pulse.unpavedHectaresTreated} ha</p>
          <span className="text-[9px] text-amber-500 font-bold">Eficiência Térmica</span>
        </div>

        <div className="space-y-1 md:pl-4">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Taxa de Throughput</span>
          <p className="text-lg font-black text-emerald-400">{pulse.estimatedThroughputRatio}%</p>
          <span className="text-[9px] text-zinc-500 font-bold">Limite SLA Garantido</span>
        </div>
      </div>

      {/* Navigation Tabs control */}
      <div className="flex border-b border-gray-200 gap-1 pb-1 overflow-x-auto scrollbar-none" id="bi-tabs-bar">
        <button 
          id="tab-kpis"
          onClick={() => setActiveSegment('kpis')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSegment === 'kpis' ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-zinc-50'
          }`}
        >
          <BarChart3 className="size-3.5" /> Métricas e Governança
        </button>
        <button 
          id="tab-financials"
          onClick={() => setActiveSegment('financials')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSegment === 'financials' ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-zinc-50'
          }`}
        >
          <DollarSign className="size-3.5" /> Rentabilidade & Custos Diluídos
        </button>
        <button 
          id="tab-demands"
          onClick={() => setActiveSegment('demands')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSegment === 'demands' ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-zinc-50'
          }`}
        >
          <TrendingUp className="size-3.5" /> Sazonalidade & Heatmaps
        </button>
        <button 
          id="tab-customers"
          onClick={() => setActiveSegment('customers')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSegment === 'customers' ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-zinc-50'
          }`}
        >
          <Users className="size-3.5" /> Churn & CLV
        </button>
        <button 
          id="tab-decisions"
          onClick={() => setActiveSegment('decisions')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSegment === 'decisions' ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-zinc-50'
          }`}
        >
          <Sparkles className="size-3.5" /> IA & Anomalias
        </button>
        <button 
          id="tab-reports"
          onClick={() => setActiveSegment('reports')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
            activeSegment === 'reports' ? 'bg-black text-white' : 'text-gray-400 hover:text-black hover:bg-zinc-50'
          }`}
        >
          <FileSpreadsheet className="size-3.5" /> Relatórios & Exportações
        </button>
      </div>

      {/* SEGMENT 1: METRICS AND MANUAL KPI GOVERNANCE CALIBRATION */}
      {activeSegment === 'kpis' && (
        <div className="space-y-6 animate-in fade-in duration-300" id="section-kpis">
          
          {/* Quick scan trigger bar for auditing KPIs */}
          <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs font-bold text-indigo-900">
            <div className="flex items-center gap-2">
              <ShieldAlert className="size-4 text-indigo-600 animate-bounce" />
              <span>Verificador de Auditoria de KPIs Ativo</span>
            </div>
            <button 
              onClick={() => {
                runSystemScan();
                toast.success('Varredura analítica de KPIs concluída de acordo com as metas operacionais.');
              }}
              className="px-4 py-2 bg-indigo-600 text-white font-black uppercase text-[10px] rounded-xl hover:bg-indigo-700 cursor-pointer"
            >
              Executar Varredura Geral
            </button>
          </div>

          {/* Card board for overall metrics */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map((kpi) => (
              <div 
                key={kpi.key}
                className="p-6 bg-white border border-gray-150 rounded-2xl space-y-4 hover:border-gray-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider block">{kpi.category} kpi</span>
                    <span className={`inline-flex items-center gap-0.5 text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      kpi.changePercent >= 0 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {kpi.changePercent >= 0 ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
                      {Math.abs(kpi.changePercent)}%
                    </span>
                  </div>

                  <h3 className="font-extrabold text-[#1F2937] text-sm leading-tight">{kpi.name}</h3>
                  <p className="text-zinc-500 text-[11px] leading-relaxed font-semibold">{kpi.description}</p>
                </div>

                <div className="pt-4 border-t border-gray-150 flex items-center justify-between">
                  {editingKpiKey === kpi.key ? (
                    <div className="flex gap-1.5 w-full">
                      <input 
                        type="number" 
                        step="0.1"
                        value={editingKpiValue}
                        onChange={(e) => setEditingKpiValue(parseFloat(e.target.value) || 0)}
                        className="w-full text-xs p-1.5 bg-gray-50 border border-gray-200 rounded-lg font-bold font-mono focus:outline-none focus:border-black"
                      />
                      <button 
                        onClick={() => handleKPIEditSubmit(kpi.key)}
                        className="bg-zinc-900 text-white font-bold px-3 py-1.5 rounded-lg text-[10px] uppercase cursor-pointer shrink-0"
                      >
                        Salvar
                      </button>
                      <button 
                        onClick={() => setEditingKpiKey(null)}
                        className="bg-gray-100 hover:bg-gray-200 text-zinc-500 font-bold px-2 py-1.5 rounded-lg text-[10px] uppercase cursor-pointer"
                      >
                        X
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-2xl font-black text-black">
                        {kpi.unit === 'currency' ? `R$ ${kpi.value.toLocaleString()}` : `${kpi.value}%`}
                      </p>
                      <button 
                        onClick={() => {
                          setEditingKpiKey(kpi.key);
                          setEditingKpiValue(kpi.value);
                        }}
                        className="text-[10px] font-black uppercase text-[#4F46E5] hover:underline cursor-pointer flex items-center gap-1"
                      >
                        <Sliders className="size-3" /> Calibrar
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* SLA dynamic charts for actual vs forecast projections */}
          <div className="p-6 bg-white border border-gray-150 rounded-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-lg font-extrabold text-black">Previsão Demanda Financeira Anual (Forecast Engine)</h3>
                <p className="text-xs text-gray-500">Curva comparativa de orçamento mensal computada pelo algoritmo preditivo contra faturamentos reais gerados pelas rotas.</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 font-black uppercase text-xs">Modelo: SARIMA ARIMA Multi-Tenant</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueForecast}>
                  <defs>
                    <linearGradient id="gradientActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="gradientForecast" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="period" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickFormatter={(v) => `R$ ${v / 1000}k`} tickLine={false} />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toLocaleString()}`, 'Valor']} />
                  <Legend iconType="circle" />
                  <Area type="monotone" dataKey="actualValue" name="Lucro Real Executado" stroke="#4F46E5" strokeWidth={3} fillOpacity={1} fill="url(#gradientActual)" />
                  <Area type="monotone" dataKey="forecastedValue" name="Projeção Preditiva DDSulf" stroke="#818CF8" strokeDasharray="5 5" fillOpacity={1} fill="url(#gradientForecast)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 2: FINANCIAL MARGINS & DILUTION SIMULATOR */}
      {activeSegment === 'financials' && (
        <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in duration-300" id="section-financials">
          
          {/* Services margin split bar-chart */}
          <div className="lg:col-span-8 p-6 bg-white border border-gray-150 rounded-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-black">Rentabilidade por Modalidade de Controle</h3>
                <p className="text-xs text-gray-500">Mapeamento preciso de faturamento vs custo total químicos e operacionais por linha de combate.</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 font-mono">L-SLA MÍNIMO 60%</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={servicesProfitability} barSize={25}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="serviceName" stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} />
                  <Tooltip formatter={(v) => `R$ ${v.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="revenue" name="Receitas Agrárias" fill="#1F2937" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="costTotal" name="Custos Químicos Totais" fill="#EF4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Quick offset increment panel for testing numbers */}
            <div className="pt-2">
              <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block mb-3">Incrementar Faturamento de Teste (SaaS simulation)</span>
              <div className="flex flex-wrap gap-2">
                {servicesProfitability.map((srv) => (
                  <button
                    key={srv.serviceId}
                    onClick={() => {
                      applyFinancialDelta(srv.serviceId, 15000, 3200);
                      toast.success(`Faturamento de ${srv.serviceName} incrementado em +R$15.000.`);
                    }}
                    className="text-[10px] px-3 py-2 bg-zinc-50 border hover:bg-zinc-100 rounded-xl font-bold text-zinc-800 transition-all cursor-pointer"
                  >
                    + R$ 15k ({srv.serviceId.split('_')[1]})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DILUTION EFFECT MODEL (Interactive math sandbox) */}
          <div className="lg:col-span-4 p-6 bg-zinc-50 border border-zinc-150 rounded-3xl space-y-6">
            <div className="border-b border-gray-200 pb-3">
              <span className="text-[10px] text-[#4F46E5] font-black uppercase tracking-widest block leading-none mb-1">DDSulf Lab Simulator</span>
              <h3 className="text-lg font-black text-black">Simulador de Custos de Diluição</h3>
              <p className="text-xs text-zinc-500 leading-relaxed font-semibold">Regule a proporção dos ativos químicos versus veículo aquoso para calcular os coeficientes de precificação sugeridos.</p>
            </div>

            <div className="space-y-4 text-xs font-semibold text-zinc-600">
              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-[700]">Densidade Concentrado Ativo</span>
                  <span className="font-mono text-black">{dilutionPesticideKg} Kg</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="100" 
                  value={dilutionPesticideKg}
                  onChange={(e) => setDilutionPesticideKg(parseInt(e.target.value) || 1)}
                  className="w-full text-zinc-900 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-[700]">Volume Água (Veículo)</span>
                  <span className="font-mono text-black">{dilutionWaterLiters} L</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="2000" 
                  step="50"
                  value={dilutionWaterLiters}
                  onChange={(e) => setDilutionWaterLiters(parseInt(e.target.value) || 50)}
                  className="w-full text-zinc-900 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold">
                  <span className="text-zinc-[700]">Preço de Custo Ingrediente Ativo</span>
                  <span className="font-mono text-black">R$ {dilutionCostKg}/Kg</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="500" 
                  step="5"
                  value={dilutionCostKg}
                  onChange={(e) => setDilutionCostKg(parseInt(e.target.value) || 10)}
                  className="w-full text-zinc-900 h-1 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Calculations return screen */}
            <div className="p-4 bg-zinc-900 text-zinc-400 rounded-2xl font-mono text-xs space-y-1.5 leading-relaxed">
              <p className="text-amber-500 font-bold uppercase tracking-wider text-[10px]">Métricas do Diluído Sugerido</p>
              <div className="flex justify-between">
                <span>Volume Resultante:</span>
                <span className="text-white font-bold">{calculatedDilution.combinedVolumeLiters} Litros</span>
              </div>
              <div className="flex justify-between">
                <span>Custo Médio p/ Litro:</span>
                <span className="text-emerald-400 font-bold">R$ {calculatedDilution.costPerLiter}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-zinc-800">
                <span>Preço Venda Recomendado:</span>
                <span className="text-indigo-400 font-bold font-mono">R$ {calculatedDilution.recommendedSalesPriceMulti}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 3: PEST SEASONALITY HEATMAP CHART */}
      {activeSegment === 'demands' && (
        <div className="space-y-6 animate-in fade-in duration-300" id="section-demands">
          <div className="p-6 bg-white border border-gray-150 rounded-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-black">Atividade Demanda de Pragas por Clima Regional (Heatmap Matrix)</h3>
                <p className="text-xs text-gray-500">Estimativas de proliferação biológica no solo baseadas nas médias de temperatura sazonal do sul brasileiro.</p>
              </div>
              <span className="text-[10px] font-mono text-zinc-400 font-black uppercase text-xs">Taxa de Acurácia Biológica: 94.6%</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={pestChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Cupins" name="Cupins de Madeira" stroke="#F59E0B" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Baratas" name="Baratas Domésticas" stroke="#EF4444" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Roedores" name="Roedores Urbanos/Silos" stroke="#10B981" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 bg-zinc-50 border border-gray-150 rounded-2xl flex items-start gap-4 text-xs font-semibold text-zinc-650">
            <Thermometer className="size-5 text-indigo-500 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1">
              <h4 className="text-black font-extrabold block">Orientação Sanitária Baseada no Trácito Meteorológico</h4>
              <p>Períodos de calor e umidade combinados elevam a proliferação biológica de cupins estruturais em até 360%. Nossas estimativas preditivas calculam automaticamente buffers de segurança no armazenamento de fipronil líquido para as revendas Erechim, Passo Fundo e Santa Maria sem risco de obsolescência química.</p>
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 4: CUSTOMER INTELLIGENCE & LTV / CHURN RISK */}
      {activeSegment === 'customers' && (
        <div className="space-y-6 animate-in fade-in duration-300" id="section-customers">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="p-6 bg-white border border-gray-150 rounded-2xl space-y-2">
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase block font-mono">Média Geral de LTV</span>
              <p className="text-3xl font-black text-black">R$ {averageLTVOverall.toLocaleString()}</p>
              <p className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                <ArrowUpRight className="size-3" /> +14.2% em relação ao trimestre anterior
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-150 rounded-2xl space-y-2">
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase block font-mono">Taxa Médio de Retenção</span>
              <p className="text-3xl font-black text-black">93.1%</p>
              <p className="text-xs text-indigo-500 font-semibold">Parâmetro de excelência corporativa</p>
            </div>

            <div className="p-6 bg-white border border-gray-150 rounded-2xl space-y-2">
              <span className="text-[10px] text-zinc-400 font-extrabold uppercase block font-mono">Faturamento Médio Anual</span>
              <p className="text-3xl font-black text-[#4F46E5]">R$ {reports.length > 0 ? '78.200' : '0'}</p>
              <p className="text-xs text-zinc-500 font-semibold">Base de contratos corporativos rurais</p>
            </div>
          </div>

          <div className="p-6 bg-white border border-gray-150 rounded-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-bold text-black flex items-center gap-2">
                <BadgeAlert className="size-5 text-amber-500" /> Auditoria Preditiva de Risco de Churn (Modelo Machine-Learning)
              </h3>
              <p className="text-xs text-gray-500">Mapeamento dinâmico que analisa dias desde o último contato e propõe ações de faturamento preventivas.</p>
            </div>

            <div className="divide-y divide-gray-100">
              {churnRisks.map((c) => (
                <div key={c.customerId} className="py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-black">{c.customerName}</span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        c.riskScore > 75 
                          ? 'bg-red-50 text-red-700' 
                          : c.riskScore > 40 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        Risco: {c.riskScore}%
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-semibold">
                      Contrato: R$ {c.contractValue.toLocaleString()} | Última atividade de campo: <span className="text-zinc-700 font-bold">{c.lastActivityDays} dias atrás</span>
                    </p>
                    <p className="text-[11px] text-[#4F46E5] font-bold flex items-center gap-1 pt-0.5">
                      <Zap className="size-3 shrink-0 text-indigo-500" /> Ação imediata: {c.predictedAction}
                    </p>
                  </div>

                  {c.riskScore > 30 && (
                    <button 
                      onClick={() => {
                        resolveRiskThreat(c.customerId);
                        toast.success(`Ação de mitigação de churn agendada para: ${c.customerName}`);
                      }}
                      className="px-4 py-2 bg-zinc-900 text-white hover:bg-black font-black uppercase tracking-wider text-[10px] rounded-xl cursor-pointer"
                    >
                      Mitigar Risco
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SEGMENT 5: AI DECISION ENGINE MATRIX AND RAW TRIGGER SIMULATOR */}
      {activeSegment === 'decisions' && (
        <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in duration-300" id="section-decisions">
          
          {/* List of active insights anomaly-oriented */}
          <div className="lg:col-span-8 p-6 bg-white border border-gray-150 rounded-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h3 className="text-lg font-extrabold text-black">Sugestões de Produtividade & Alertas de Auditoria (AI Advisory)</h3>
              <p className="text-xs text-gray-500">Módulos interpretativos acionados em tempo real de acordo com as flutuações de insumos ou do andamento das safras regionais.</p>
            </div>

            <div className="space-y-3.5">
              {insights.map((ins) => (
                <div 
                  key={ins.id}
                  className={`p-4 border rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs font-semibold leading-relaxed transition-all ${
                    ins.isApplied 
                      ? 'bg-gray-50 border-gray-200 text-gray-400 opacity-60' 
                      : 'bg-indigo-50/50 border-indigo-100 text-[#4F46E5]'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        ins.isApplied ? 'bg-zinc-200 text-zinc-600' : 'bg-indigo-150 text-indigo-700'
                      }`}>
                        {ins.category} • {ins.score}% relevância
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 font-bold">{new Date(ins.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <h4 className={`text-sm font-extrabold ${ins.isApplied ? 'text-zinc-500' : 'text-zinc-900'}`}>{ins.title}</h4>
                    <p className="text-zinc-500 text-[11px] font-semibold">{ins.description}</p>
                    <p className="text-[#4F46E5] text-[11px] font-bold mt-1.5 flex items-center gap-1">
                      <Scale className="size-3.5" /> Recomendação: {ins.actionSuggested}
                    </p>
                  </div>

                  {!ins.isApplied && (
                    <button 
                      onClick={() => {
                        executeApplyDecision(ins.id);
                        toast.success('Diretiva de IA executada com sucesso.');
                      }}
                      className="bg-[#4F46E5] hover:bg-indigo-600 text-white font-black text-[10px] uppercase tracking-wider py-2 px-4 rounded-xl shrink-0 cursor-pointer"
                    >
                      Aplicar Ação
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Trigger simulator for testing anomalies */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* INJECT ANOMALY FORM */}
            <div className="p-6 bg-zinc-50 border border-zinc-150 rounded-3xl space-y-4">
              <div className="border-b border-gray-200 pb-2 flex items-center gap-1.5">
                <ShieldAlert className="size-4 text-red-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-black">Injetor de Anomalias Reais</h4>
              </div>

              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Chave do Parâmetro Técnico</label>
                  <input 
                    type="text" 
                    value={injectMetricKey} 
                    onChange={(e) => setInjectMetricKey(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-bold font-mono focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Valor Medido</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={injectValue} 
                      onChange={(e) => setInjectValue(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-bold font-mono focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Esperado (SLA)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={injectExpected} 
                      onChange={(e) => setInjectExpected(parseFloat(e.target.value) || 0)}
                      className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-bold font-mono focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Mapeador de Local (Origem)</label>
                  <input 
                    type="text" 
                    value={injectSource} 
                    onChange={(e) => setInjectSource(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Remediação Imediata (Roteador)</label>
                  <input 
                    type="text" 
                    value={injectRemedy} 
                    onChange={(e) => setInjectRemedy(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>

                <button 
                  onClick={handleInjectAnomaly}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-black uppercase tracking-wider h-11 rounded-xl cursor-pointer"
                >
                  Injetar Outlier Técnico
                </button>
              </div>
            </div>

            {/* ADVISORY NODE TRIGGER SIMULATOR */}
            <div className="p-6 bg-zinc-50 border border-zinc-150 rounded-3xl space-y-4">
              <div className="border-b border-gray-200 pb-2 flex items-center gap-1.5">
                <Sliders className="size-4 text-indigo-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-black">Gatilho de Auditoria de IA</h4>
              </div>

              <div className="space-y-3.5 text-xs font-semibold">
                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Título do Insight</label>
                  <input 
                    type="text" 
                    value={newInsightTitle} 
                    onChange={(e) => setNewInsightTitle(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-bold font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase mb-1 block">Diretriz Recomendada</label>
                  <input 
                    type="text" 
                    value={newInsightAction} 
                    onChange={(e) => setNewInsightAction(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-xl font-semibold focus:outline-none"
                  />
                </div>

                <button 
                  onClick={handleAddCustomInsight}
                  className="w-full bg-zinc-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-wider h-11 rounded-xl cursor-pointer"
                >
                  Acoplar Diretriz de IA
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* SEGMENT 6: REPORTING ENGINE & EXPORT SNAPSHOTS */}
      {activeSegment === 'reports' && (
        <div className="grid gap-6 lg:grid-cols-12 animate-in fade-in duration-300" id="section-reports">
          
          <div className="lg:col-span-8 p-6 bg-white border border-gray-150 rounded-2xl space-y-4">
            <div className="border-b border-gray-100 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-extrabold text-black">Relatórios e Certificados Sanitários de Conformidade</h3>
                <p className="text-xs text-gray-500">Snapshots arquivados e gerados sob demandas contábeis ou de averiguação da Vigilância.</p>
              </div>
              <span className="text-[10px] font-extrabold px-3 py-1 bg-zinc-100 border rounded-full text-zinc-500 font-mono">SUPORTE OFFLINE OK</span>
            </div>

            <div className="divide-y divide-gray-100">
              {reports.map((rep) => (
                <div key={rep.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-zinc-400">{rep.code}</span>
                      <span className="font-extrabold text-sm text-black">{rep.title}</span>
                    </div>
                    <p className="text-xs text-zinc-500 font-semibold flex flex-wrap gap-2">
                      <span>Categoria: <strong className="text-zinc-700 capitalize">{rep.scope}</strong></span>
                      <span>•</span>
                      <span>Emitido por: <strong>{rep.issuedBy}</strong></span>
                      <span>•</span>
                      <span>Data: {new Date(rep.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Tamanho: <strong>{rep.fileSize}</strong></span>
                    </p>
                  </div>

                  <button 
                    onClick={() => {
                      incrementDownload(rep.id);
                      handleSimulateCSV(rep.scope, rep.title);
                    }}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-black uppercase text-[10px] rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Download className="size-3.5 text-zinc-500" /> Exportar ({rep.downloadCount})
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 p-6 bg-zinc-50 border border-zinc-150 rounded-3xl space-y-4">
            <div className="border-b border-gray-200 pb-2">
              <span className="text-[10px] text-[#4F46E5] font-black uppercase tracking-wider block mb-1">DDSulf Snapshot Builder</span>
              <h4 className="text-xs font-black uppercase tracking-widest text-black">Compilar Novo Snapshot</h4>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase mt-1 block">Título do Relatório</label>
                <input 
                  type="text" 
                  value={draftReportName} 
                  onChange={(e) => setDraftReportName(e.target.value)}
                  placeholder="e.g. Balanço Trimestral Silos Trigo"
                  className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl font-medium focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-gray-400 font-extrabold uppercase mt-1 block">Escopo Normativo</label>
                <select 
                  value={draftReportScope} 
                  onChange={(e) => setDraftReportScope(e.target.value as any)}
                  className="w-full text-xs p-3 bg-white border border-gray-200 rounded-xl font-bold focus:outline-none focus:ring-0 cursor-pointer"
                >
                  <option value="chemical">Controle de Substâncias Químicas</option>
                  <option value="financial">Auditoria Contábil Agrícola</option>
                  <option value="regulatory">Vigilância Sanitária e POPs</option>
                  <option value="operational">Desempenho e Roteirização de Turno</option>
                </select>
              </div>

              <button 
                onClick={handleCreateReport}
                className="w-full bg-zinc-900 hover:bg-black text-white text-[11px] font-black uppercase tracking-wider h-11 rounded-xl cursor-pointer"
              >
                Gerar Snapshot Assinado
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}

export default BusinessIntelligenceDashboard;
