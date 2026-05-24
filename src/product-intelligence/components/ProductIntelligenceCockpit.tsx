/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Activity, 
  Zap, 
  AlertCircle, 
  Smile, 
  RefreshCw, 
  BarChart3, 
  Sliders, 
  ShieldAlert, 
  Info, 
  Play, 
  Send, 
  CheckCircle2, 
  Eye, 
  TrendingUp, 
  ChevronRight, 
  ThumbsUp, 
  Check, 
  User, 
  Wifi, 
  WifiOff,
  Sparkles,
  Search,
  Filter,
  CheckCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { toast } from 'sonner';

import { telemetryService } from '../services/telemetryService';
import { useBehaviorAnalytics } from '../hooks/useBehaviorAnalytics';
import { useFrictionDetection } from '../hooks/useFrictionDetection';
import { useFeatureAdoption } from '../hooks/useFeatureAdoption';
import { useProductInsights } from '../hooks/useProductInsights';
import { useContinuousImprovement } from '../hooks/useContinuousImprovement';
import { TelemetryEvent, FrictionEvent, OperationalFeedback, OperationalArea, TelemetryEventName } from '../types';

export function ProductIntelligenceCockpit() {
  const [activeTab, setActiveTab] = useState<'overview' | 'telemetry' | 'friction' | 'funnels' | 'rollouts' | 'insights' | 'feedback'>('overview');
  
  // Custom intelligence hooks
  const { trackAction, startWorkflow, completeWorkflow } = useBehaviorAnalytics();
  const { trackFormError, trackPerformanceLatency } = useFrictionDetection();
  const { flags, updateFlag, getVariant, isFeatureEnabled } = useFeatureAdoption();
  const { insights, loading: loadingInsights, refreshInsights, toggleInsightImplemented } = useProductInsights();
  const { healthScore, submitContextualFeedback, recomputeScore } = useContinuousImprovement();

  // Local state for dashboard rendering
  const [rawEvents, setRawEvents] = useState<TelemetryEvent[]>([]);
  const [frictionEvents, setFrictionEvents] = useState<FrictionEvent[]>([]);
  const [feedbackList, setFeedbackList] = useState<OperationalFeedback[]>([]);
  const [loadingDb, setLoadingDb] = useState(false);
  const [consoleFilter, setConsoleFilter] = useState<string>('');
  
  // Local feedback form inputs
  const [feedbackArea, setFeedbackArea] = useState<OperationalArea>(OperationalArea.DASHBOARD);
  const [feedbackRating, setFeedbackRating] = useState<number>(5);
  const [feedbackText, setFeedbackText] = useState<''>('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  // Load telemetry snapshots compiled from firestore records
  const loadDatabaseRecords = async () => {
    setLoadingDb(true);
    try {
      const [evts, frics, feeds] = await Promise.all([
        telemetryService.getRecentTelemetryEvents(60),
        telemetryService.getRecentFrictionEvents(30),
        telemetryService.getFeedbackEntries(20)
      ]);
      setRawEvents(evts);
      setFrictionEvents(frics);
      setFeedbackList(feeds);
    } catch {
      toast.error('Ocorreu ao sincronizar registros do Firestore. Exibindo buffer offline.');
    } finally {
      setLoadingDb(false);
    }
  };

  useEffect(() => {
    loadDatabaseRecords();
  }, []);

  const handleManualSync = async () => {
    trackAction('manual_telemetry_sync', 'Sincronizar Telemetria');
    const toastId = toast.loading('Reconciliando eventos de telemetria pendentes...');
    if (navigator.onLine) {
      await telemetryService.syncOfflineQueues();
      await recomputeScore();
      await refreshInsights();
      await loadDatabaseRecords();
      toast.dismiss(toastId);
      toast.success('Bancos sincronizados e métricas otimizadas!');
    } else {
      toast.dismiss(toastId);
      toast.error('Você está sem conexão com a internet. Telemetria mantida em buffer.');
    }
  };

  // 1. Chart Compiling / Analytics Calculations
  const eventTimelineData = useMemo(() => {
    // Group active telemetry timeline coordinates
    const hourlyLogs: Record<string, number> = {};
    const reversed = [...rawEvents].reverse();
    reversed.forEach(ev => {
      const date = new Date(ev.timestamp);
      const label = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
      hourlyLogs[label] = (hourlyLogs[label] || 0) + 1;
    });

    return Object.entries(hourlyLogs).map(([time, count]) => ({ time, eventos: count }));
  }, [rawEvents]);

  const frictionAreaBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      dashboard: 0,
      calculator: 0,
      financial: 0,
      pops: 0,
      stocks: 0,
      ai_assistant: 0
    };
    frictionEvents.forEach(f => {
      counts[f.area] = (counts[f.area] || 0) + 1;
    });
    return Object.entries(counts).map(([name, valor]) => ({ name: name.toUpperCase(), valor }));
  }, [frictionEvents]);

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#EF4444'];

  const filteredConsoleEvents = useMemo(() => {
    if (!consoleFilter) return rawEvents;
    const lower = consoleFilter.toLowerCase();
    return rawEvents.filter(e => 
      e.name.toLowerCase().includes(lower) || 
      e.userId.toLowerCase().includes(lower) || 
      e.userRole?.toLowerCase().includes(lower) ||
      JSON.stringify(e.metadata).toLowerCase().includes(lower)
    );
  }, [rawEvents, consoleFilter]);

  // Handle local feedback submitting
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

    setSubmittingFeedback(true);
    startWorkflow('submit_operational_feedback', { area: feedbackArea });
    
    const success = await submitContextualFeedback(
      feedbackArea, 
      feedbackRating, 
      feedbackText
    );

    if (success) {
      toast.success('Feedback operacional salvo! Ele já orienta nossa IA operacional.');
      setFeedbackText('');
      completeWorkflow('submit_operational_feedback');
      loadDatabaseRecords();
    } else {
      toast.error('Conexão instável. Feedback salvo em cache.');
    }
    setSubmittingFeedback(false);
  };

  // Simulating Test User Attrition Actions
  const runRageClickSimulator = () => {
    toast.info('Simulando clique de raiva na tela atual...');
    // Log multiple consecutive friction operations instantly
    for (let i = 0; i < 6; i++) {
      telemetryService.trackFriction(
        'rage_click',
        OperationalArea.CALCULATOR,
        'high',
        { simulation: true, latencyMs: 310 },
        'calc-dosing',
        'btn-calc-error-rage'
      );
    }
    telemetryService.trackEvent('friction_rage_click', {
      targetId: 'calc-dosing',
      area: OperationalArea.CALCULATOR
    });
    setTimeout(() => {
      loadDatabaseRecords();
      refreshInsights();
      recomputeScore();
      toast.success('Simulação concluída! Fricção computada no cockpit.');
    }, 1000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-900 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Dynamic Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between py-6 border-b border-slate-200 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 px-1.5 bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-mono font-bold rounded-md flex items-center gap-1 leading-none shadow-xs">
              <Zap className="size-3 fill-white" />
              SaaS Intelligence Engine
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Active
            </div>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 mt-1">
            Product Intelligence Cockpit
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mapeamento comportamental profundo, otimização de UX contínua e telemetria operacional.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          {/* Diagnostic utilities */}
          <button 
            onClick={runRageClickSimulator}
            className="text-xs font-mono font-bold border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1"
          >
            <ShieldAlert className="size-3.5 text-rose-600" />
            Simular Fricção (Rage)
          </button>

          <button 
            onClick={handleManualSync}
            disabled={loadingDb}
            className="text-xs font-semibold bg-slate-900 hover:bg-black text-white px-3.5 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loadingDb ? 'animate-spin' : ''}`} />
            Sincronizar Cockpit
          </button>
        </div>
      </div>

      {/* 2. Top-level Performance Indicators & Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {/* Unified Score block */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-5 rounded-2xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="size-20" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider font-mono">Product Health Rating</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          </div>
          <div className="my-3 flex items-baseline gap-2">
            <span className="text-4xl font-black tracking-tight">{healthScore.overallScore}</span>
            <span className="text-xs text-indigo-200 mt-1">/100</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
            <div className="bg-indigo-400 h-1.5 rounded-full" style={{ width: `${healthScore.overallScore}%` }} />
          </div>
          <span className="text-[9px] font-medium text-indigo-200 mt-2 flex items-center gap-1 font-mono">
            <TrendingUp className="size-3 text-emerald-400" />
            Eficiência Geral Ampliada (+2%)
          </span>
        </div>

        {/* Dimension: Engagement */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">Engajamento de Técnicos</span>
            <User className="size-3.5" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{healthScore.dimensions.engagement}%</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-emerald-500 h-1 rounded-full" style={{ width: `${healthScore.dimensions.engagement}%` }} />
          </div>
          <span className="text-[10px] font-medium text-emerald-600 mt-2 font-mono">
            92% de consistência diária
          </span>
        </div>

        {/* Dimension: Completion Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">Taxa de Conclusão</span>
            <CheckCircle2 className="size-3.5 text-slate-400" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{healthScore.dimensions.completionRate}%</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${healthScore.dimensions.completionRate}%` }} />
          </div>
          <span className="text-[10px] font-medium text-slate-500 mt-2 font-mono">
            Fornos, dosagens & POPs
          </span>
        </div>

        {/* Dimension: Friction Index */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">Friction Shield Index</span>
            <ShieldAlert className="size-3.5 text-rose-500" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">{healthScore.dimensions.frictionIndex}%</div>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1">
            <div className="bg-rose-500 h-1 rounded-full" style={{ width: `${healthScore.dimensions.frictionIndex}%` }} />
          </div>
          <span className="text-[10px] font-semibold text-rose-600 mt-2 font-mono">
            {100 - healthScore.dimensions.frictionIndex}% atrito detectado
          </span>
        </div>

        {/* Dynamic connectivity indicator */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono text-slate-500">DDSulf Connectivity</span>
            {navigator.onLine ? <Wifi className="size-4 text-emerald-500" /> : <WifiOff className="size-4 text-amber-500" />}
          </div>
          <div className="my-2">
            <div className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-1">
              Offline-Ready
            </div>
            <div className="text-[9px] font-mono text-slate-400 mt-0.5">
              Eventos pendentes: {rawEvents.filter(e => e.isOffline).length} 
            </div>
          </div>
          <div className="text-[9px] font-bold py-1 bg-emerald-50 text-emerald-700 text-center rounded-lg leading-none font-mono">
            AUTO-SYNC ATIVO
          </div>
        </div>
      </div>

      {/* 3. Tab navigation bar */}
      <div className="flex scrollbar-none items-center overflow-x-auto bg-slate-200/60 p-1.5 rounded-2xl mb-6 gap-1 border border-slate-200/85">
        {[
          { id: 'overview', label: 'Panorama Geral', icon: BarChart3 },
          { id: 'insights', label: 'IA Otimização', icon: Sparkles, badge: insights.filter(i => !i.isImplemented).length },
          { id: 'telemetry', label: 'Log de Eventos', icon: Activity },
          { id: 'friction', label: 'Matriz de Atrito', icon: ShieldAlert, badge: frictionEvents.filter(f => f.severity === 'high').length },
          { id: 'funnels', label: 'Fisica de Funis', icon: TrendingUp },
          { id: 'rollouts', label: 'A/B Rollouts', icon: Sliders },
          { id: 'feedback', label: 'Feedback de Campo', icon: Smile },
        ].map((tab) => {
          const IconComponent = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                trackAction(`toggle_cockpit_tab_${tab.id}`, 'Mudar guia cockpit');
              }}
              className={`flex items-center h-10 px-4 rounded-xl text-xs font-bold tracking-tight transition-all shrink-0 gap-1.5 select-none ${
                isSelected 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <IconComponent className="size-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`inline-block size-4.5 text-[8px] font-black font-mono rounded-full text-center flex items-center justify-center leading-none ${
                  isSelected ? 'bg-indigo-600 text-white' : 'bg-rose-500 text-white animate-pulse'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. Tab dynamic contents templates */}
      <div className="flex-1 w-full flex flex-col">
        {/* TAB: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Visual charting line chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Frequência e Saturação de Telemetria</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Eventos em tempo real processados recursivamente para calibragem</p>
                </div>
                <span className="p-1 px-2 text-[10px] bg-slate-100 rounded-lg text-slate-500 font-mono">Live Sync: Ativo</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={eventTimelineData}>
                    <defs>
                      <linearGradient id="eventColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="time" stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                    <Area type="monotone" dataKey="eventos" name="Ações do Usuário" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#eventColor)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Friction radar breakdown chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Pontos de Atrito por Funcionalidades</h3>
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={frictionAreaBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="valor"
                    >
                      {frictionAreaBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Pie Legends */}
              <div className="space-y-1.5 mt-2">
                {frictionAreaBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <span className="size-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span>{item.name.toLowerCase()}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{item.valor} atritos</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions overview list & Diagnostic tools */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest mb-3 font-mono">Sinais Gerais Recentes</h4>
                <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
                  {rawEvents.slice(0, 4).map((evt) => (
                    <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="size-2 rounded-full bg-indigo-500" />
                        <div>
                          <p className="font-bold text-slate-800">{evt.name}</p>
                          <p className="text-[9px] font-mono text-slate-400">UserId: {evt.userId.slice(0, 9)}... ({evt.userRole})</p>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400">
                        {new Date(evt.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-extrabold text-xs text-slate-400 uppercase tracking-widest mb-3 font-mono">Rollouts Ativos</h4>
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {flags.map((flag) => (
                    <div key={flag.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-2.5 text-xs bg-slate-50/55">
                      <div>
                        <p className="font-bold text-slate-800">{flag.name}</p>
                        <p className="text-[9px] font-mono text-indigo-500 font-semibold uppercase mt-0.5">
                          Variante: {getVariant(flag.id)}
                        </p>
                      </div>
                      <span className={`p-1 px-2 text-[9px] font-bold font-mono uppercase rounded-md leading-none ${
                        flag.isEnabled ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {flag.isEnabled ? 'Rollout Ativo' : 'Oculto'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: DYNAMIC AI INSIGHTS */}
        {activeTab === 'insights' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Top Insight header summary */}
            <div className="lg:col-span-3 bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-indigo-600 rounded-xl text-white shadow-md">
                  <Sparkles className="size-5 fill-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">IA Otimizadora e Recomendações Contínuas</h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Análise holística automatizada gerada por Heurísticas de Produto nos logs e comportamentos reais capturados.
                  </p>
                </div>
              </div>
              <button 
                onClick={refreshInsights}
                className="text-xs font-bold leading-none bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-3 flex items-center gap-1 shadow-sm shrink-0 self-start md:self-auto"
              >
                <RefreshCw className="size-3" />
                Recalcular IA
              </button>
            </div>

            {loadingInsights ? (
              <div className="lg:col-span-3 py-10 text-center">
                <RefreshCw className="size-8 mx-auto animate-spin text-slate-400 mb-2" />
                <p className="text-xs font-mono text-slate-500">Calculando árvore de comportamentos e tendências...</p>
              </div>
            ) : insights.length === 0 ? (
              <div className="lg:col-span-3 py-10 bg-white border rounded-2xl text-center">
                <Smile className="size-8 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-mono text-slate-500">Nenhuma fricção preocupante detectada até o momento. Excelente UX!</p>
              </div>
            ) : (
              insights.map(item => (
                <div 
                  key={item.id} 
                  className={`bg-white border p-5 rounded-2xl shadow-xs flex flex-col justify-between transition-all hover:shadow-md relative ${
                    item.isImplemented ? 'border-emerald-200 bg-emerald-50/10 opacity-75' : 'border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-3.5">
                      <span className={`text-[9px] font-black font-mono tracking-widest uppercase p-1 px-2 rounded-md border leading-none ${
                        item.severity === 'warning' 
                          ? 'bg-rose-50 border-rose-100 text-rose-700' 
                          : 'bg-indigo-50 border-indigo-100 text-indigo-700'
                      }`}>
                        {item.severity === 'warning' ? 'Ação Corretiva' : 'Ação de Otimização'}
                      </span>
                      <div className="flex items-center gap-0.5" title="Impact Score">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span 
                            key={i} 
                            className={`size-1.5 rounded-full ${
                              i < item.impactScore ? 'bg-indigo-600' : 'bg-slate-200'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-tight mb-2 flex items-start gap-1.5">
                      {item.isImplemented && <CheckCircle className="size-4 text-emerald-500 shrink-0 mt-0.5" />}
                      <span>{item.title}</span>
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mb-4">{item.description}</p>
                    
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl mb-4">
                      <span className="text-[9px] font-bold text-indigo-600 font-mono uppercase block mb-1">MÉV_RECOMENDADO</span>
                      <p className="text-xs italic text-slate-600">"{item.recommendedChange}"</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      toggleInsightImplemented(item.id);
                      toast.success(item.isImplemented ? 'Otimização desmarcada!' : 'Simulação de otimização aplicada!');
                    }}
                    className={`text-xs font-bold py-2 px-3 rounded-xl border transition-all flex items-center justify-center gap-1.5 ${
                      item.isImplemented
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-slate-900 hover:bg-black text-white border-transparent'
                    }`}
                  >
                    {item.isImplemented ? (
                      <>
                        <Check className="size-3.5 stroke-[3]" />
                        Ativado no Sistema
                      </>
                    ) : (
                      <>
                        <Play className="size-3 fill-white" />
                        Simular Implementação
                      </>
                    )}
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB: RECENT TELEMETRY EVENTS STREAM */}
        {activeTab === 'telemetry' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs animate-fade-in flex flex-col overflow-hidden max-w-full">
            <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm">Fluxo de Telemetria Geral (Console)</h3>
                <p className="text-xs text-slate-400 mt-0.5">Logs brutos de tráfego, cliques e fluxos compilados em formato de console</p>
              </div>

              {/* Filtering text */}
              <div className="relative">
                <Search className="size-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Pesquisar logs..."
                  value={consoleFilter}
                  onChange={(e) => setConsoleFilter(e.target.value)}
                  className="pl-9 pr-4 py-1.5 border border-slate-200 rounded-xl text-xs w-full md:w-64 focus:outline-hidden focus:border-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Scrolling console frame list */}
            <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 font-mono text-xs text-slate-600">
              {filteredConsoleEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-400">Nenhum evento correspondente ao filtro de pesquisa.</div>
              ) : (
                filteredConsoleEvents.map((evt) => (
                  <div key={evt.id} className="p-3.5 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div className="flex items-start gap-3">
                      <span className={`size-2 rounded-full mt-1.5 shrink-0 ${
                        evt.name.includes('friction') 
                          ? 'bg-rose-500 animate-pulse' 
                          : evt.name.includes('workflow') 
                          ? 'bg-indigo-500' 
                          : 'bg-emerald-500'
                      }`} />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900">{evt.name}</span>
                          <span className="p-0.5 px-1 bg-slate-100 text-[9px] rounded text-slate-500 uppercase tracking-widest leading-none font-bold">
                            {evt.userRole || 'Operador'}
                          </span>
                          {evt.isOffline && (
                            <span className="p-0.5 px-1 bg-amber-50 text-amber-700 text-[8px] rounded border border-amber-200 leading-none">
                              Offline Buffered
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">
                          Session: {evt.sessionId} | User: {evt.userId}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg border max-w-xl truncate mt-1">
                          Payload: {JSON.stringify(evt.metadata)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-[10px] text-slate-400 shrink-0 font-mono self-end md:self-center">
                      <span className="block">{new Date(evt.timestamp).toLocaleDateString()}</span>
                      <span className="block font-semibold mt-0.5">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB: FRICTION DETECTION & EXPOSURES */}
        {activeTab === 'friction' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in bg-transparent">
            {/* Left side list */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
              <h3 className="font-extrabold text-slate-900 text-sm mb-4">Sinais de Impedimento Operacional</h3>
              
              <div className="divide-y divide-slate-100 overflow-y-auto max-h-[420px]">
                {frictionEvents.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">Nenhuma fricção alarmada até o momento. Interface limpa e reativa!</div>
                ) : (
                  frictionEvents.map(evt => (
                    <div key={evt.id} className="py-3.5 flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-start gap-2.5">
                        <div className={`p-2 rounded-xl mt-0.5 leading-none shrink-0 ${
                          evt.severity === 'high' 
                            ? 'bg-rose-50 text-rose-600 border border-rose-100' 
                            : 'bg-amber-50 text-amber-600 border border-amber-100'
                        }`}>
                          <ShieldAlert className="size-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-slate-800 text-xs sm:text-sm capitalize">{evt.type.replace('_', ' ')}</h4>
                            <span className="text-[8px] uppercase tracking-wider font-bold bg-slate-900 text-white font-mono px-1.5 py-0.5 rounded leading-none">
                              {evt.area}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 max-w-md">{evt.context.errorDetails || 'Detectada anomalia ou repetição excessiva em elemento visual da interface.'}</p>
                          <p className="text-[9px] font-mono text-slate-400 mt-1">Selector Target: {evt.selector || evt.elementId || 'unknown_node'}</p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[9px] font-bold py-1 px-2 rounded-lg border ${
                          evt.severity === 'high' ? 'bg-rose-50 text-rose-700 border-rose-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                        }`}>
                          {evt.severity.toUpperCase()}
                        </span>
                        <span className="block text-[8px] text-slate-400 mt-2 font-mono">
                          {new Date(evt.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Friction Heat explanation */}
            <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <span className="p-1 px-2 border border-slate-700 text-slate-300 text-[9px] uppercase tracking-wider font-mono rounded-md inline-block leading-none">
                  Gestor de Fricção (DDSulf Shield)
                </span>
                <h4 className="text-base font-extrabold tracking-tight">O que é a Matriz de Atrito?</h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Técnicos de controle de pragas operam no campo, muitas vezes sob estresse físico, calor ou com luvas de proteção. Cliques errados ou ações que requerem esforço repetitivo diminuem drasticamente a produtividade.
                </p>
                <div className="space-y-2 text-xs bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <div className="flex items-start gap-1 text-rose-300 font-bold">
                    <span>• Rage click detector:</span>
                    <span className="text-slate-300 font-normal">Sinaliza cliques contínuos acima de 5 por segundo.</span>
                  </div>
                  <div className="flex items-start gap-1 text-amber-300 font-bold">
                    <span>• Repeat Error:</span>
                    <span className="text-slate-300 font-normal">Sinaliza que o usuário está errando preenchimentos de input seguidamente.</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 border-t border-slate-800 pt-4">
                <span className="text-[10px] font-mono text-indigo-300 block mb-1">MÉTRICA DE CONTINGÊNCIA</span>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  A IA utiliza esses registros de cliques redundantes para autogerar as recomendações na aba Otimizador.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: FUNNEL AND FLOW ANALYTICS */}
        {activeTab === 'funnels' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Onboarding Funnel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Funil 1: Cadastro & Ativação</h3>
                <span className="text-[10px] text-emerald-600 font-mono font-bold">92% Conversão</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { step: '1. Convite e Registro', val: 100, label: '100% de Iniciados' },
                  { step: '2. Login & Seleção Licença', val: 96, label: '96% de Conversão' },
                  { step: '3. Ativação Primeiro Técnico', val: 92, label: '92% de Ativação Geral' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.step}</span>
                      <span className="font-mono text-slate-500">{item.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-2 overflow-hidden">
                      <div className="bg-emerald-500 h-2 rounded-lg" style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Workflow Dosing calculate Funnel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Funil 2: Cálculo de Misturas</h3>
                <span className="text-[10px] text-indigo-600 font-mono font-bold">85% Conversão</span>
              </div>

              <div className="space-y-4">
                {[
                  { step: '1. Abrir Calculadora', val: 100, label: '100%' },
                  { step: '2. Digitar Áreas & Pragas', val: 89, label: '89%' },
                  { step: '3. Gerar Dosagem Mestre', val: 85, label: '85%' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.step}</span>
                      <span className="font-mono text-slate-500">{item.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-2 overflow-hidden">
                      <div className="bg-indigo-500 h-2 rounded-lg" style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* POP Execution Inspection Funnel */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 text-sm">Funil 3: Execução de POPs</h3>
                <span className="text-[10px] text-amber-600 font-mono font-bold">78% Conversão</span>
              </div>

              <div className="space-y-4">
                {[
                  { step: '1. Detalhar POP Técnico', val: 100, label: '100% lidos' },
                  { step: '2. Checklist EPI Ativo', val: 86, label: '86% confirmados' },
                  { step: '3. Envio de foto Anvisa', val: 78, label: '78% concluídos' },
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.step}</span>
                      <span className="font-mono text-slate-500">{item.val}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-lg h-2 overflow-hidden">
                      <div className="bg-amber-500 h-2 rounded-lg" style={{ width: `${item.val}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB: EXPERIMENTATION ROLLOUTS */}
        {activeTab === 'rollouts' && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm animate-fade-in flex flex-col">
            <h3 className="font-extrabold text-slate-950 text-sm mb-1">A/B Testing & Soft Features Rollout</h3>
            <p className="text-xs text-slate-400 mb-6">Controle liberação de módulos experimentais em tempo real para grupos selecionados de inquilinos</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {flags.map((flag) => (
                <div key={flag.id} className="border border-slate-100 rounded-2xl p-4 shadow-3xs flex flex-col justify-between bg-slate-50/45 hover:border-slate-200/90 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="font-mono tracking-tight font-black text-slate-400 text-[10px]">FLAG: {flag.id.toUpperCase()}</span>
                      <button
                        onClick={() => {
                          updateFlag(flag.id, !flag.isEnabled);
                          toast.success(`${flag.name} ${!flag.isEnabled ? 'ativado' : 'desativado'}`);
                        }}
                        className={`size-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                          flag.isEnabled 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                        }`}
                      >
                        <Sliders className="size-4" />
                      </button>
                    </div>

                    <h4 className="font-extrabold text-slate-900 text-sm leading-snug mb-1">{flag.name}</h4>
                    <p className="text-xs text-slate-500 leading-normal mb-4">Defina se este recurso experimental deve ser exibido para os operadores de campo em testes de atrito.</p>
                  </div>

                  <div className="border-t border-slate-200/50 pt-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400 font-mono uppercase text-[9px]">Variante A/B</span>
                    <select
                      value={getVariant(flag.id)}
                      onChange={(e) => {
                        updateFlag(flag.id, flag.isEnabled, e.target.value as any);
                        toast.success('Variante de teste atualizada!');
                      }}
                      className="bg-white border rounded-lg px-2 py-1 text-xs font-semibold focus:outline-hidden text-slate-700"
                    >
                      <option value="control">Control (Padrão)</option>
                      <option value="variant_a">Variant A (Otimizada)</option>
                      <option value="variant_b">Variant B (IA-Enhanced)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: OPERATIONAL CONTEXT EVALUATION FEEDBACK */}
        {activeTab === 'feedback' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            {/* Left submission box */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                <div className="flex items-center gap-1.5 text-indigo-600 mb-2">
                  <Smile className="size-5 fill-indigo-100" />
                  <span className="font-extrabold text-xs uppercase tracking-widest font-mono">Feedback Hub DDSulf</span>
                </div>
                
                <h4 className="text-sm font-extrabold text-slate-800">Enviar Diagnóstico do Operador</h4>
                <p className="text-xs text-slate-500 leading-snug">Preencha um diário de campo diretamente. Nosso analisador usa as anotações do técnico para moldar novos templates.</p>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider">Módulo Operacional</label>
                  <select
                    value={feedbackArea}
                    onChange={(e) => setFeedbackArea(e.target.value as any)}
                    className="w-full bg-white border rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-indigo-500 font-semibold text-slate-700"
                  >
                    <option value={OperationalArea.DASHBOARD}>Dashboard Geral</option>
                    <option value={OperationalArea.CALCULATOR}>Calculadora Doses</option>
                    <option value={OperationalArea.FINANCIAL}>Painel Financeiro</option>
                    <option value={OperationalArea.POPS}>Procedimentos (POPs)</option>
                    <option value={OperationalArea.STOCKS}>Estoque Químicos</option>
                    <option value={OperationalArea.AI_ASSISTANT}>Chat de IA Operacional</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Nota de Satisfação (1-5)</label>
                  <div className="flex gap-2.5 mt-1">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setFeedbackRating(num);
                          trackAction(`feedback_satisfaction_rating_${num}`, 'Avaliar nota operação');
                        }}
                        className={`size-8 text-xs font-black rounded-lg transition-transform hover:scale-105 cursor-pointer flex items-center justify-center border ${
                          feedbackRating === num
                            ? 'bg-slate-900 text-white border-transparent'
                            : 'bg-slate-50 border-slate-100 text-slate-600'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Relato de Campo do Técnico</label>
                  <textarea
                    rows={3}
                    placeholder="Ex: Tive dificuldades ao carregar o PDF da receita agrária sem internet."
                    value={feedbackText}
                    onChange={(e: any) => setFeedbackText(e.target.value)}
                    className="w-full border rounded-xl p-2.5 text-xs focus:outline-hidden focus:border-indigo-500 text-slate-700 bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingFeedback || !feedbackText.trim()}
                  className="w-full h-10 font-bold bg-slate-900 hover:bg-black text-white rounded-xl transition-all shadow-xs flex items-center justify-center gap-1 md:gap-1.5 cursor-pointer disabled:opacity-40 select-none text-xs"
                >
                  <Send className="size-3 text-white fill-white" />
                  <span>{submittingFeedback ? 'Enviando...' : 'Despachar Diagnóstico'}</span>
                </button>
              </form>
            </div>

            {/* Right feedback entries list queue */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="font-extrabold text-slate-950 text-sm mb-4">Últimos Diários de Engenharia Recebidos</h3>
              
              <div className="divide-y divide-slate-100 max-h-[420px] overflow-y-auto">
                {feedbackList.length === 0 ? (
                  <div className="py-10 text-center text-slate-400">Nenhum feedback recebido ainda. Envie o formulário ao lado de teste!</div>
                ) : (
                  feedbackList.map(item => (
                    <div key={item.id} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-800">{item.userName}</span>
                          <span className="p-0.5 px-1 bg-indigo-50 text-[8px] rounded border border-indigo-100 text-indigo-700 leading-none uppercase font-mono">
                            {item.area}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Smile 
                                key={i} 
                                className={`size-3 ${
                                  i < item.rating ? 'text-indigo-500 fill-indigo-500' : 'text-slate-200'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-slate-600 italic bg-slate-50/50 p-2 rounded-lg border leading-relaxed capitalize-first">"{item.feedbackText}"</p>
                        
                        {item.systemResponse && (
                          <div className="flex items-start gap-1.5 bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-100 text-[11px] mt-1.5 leading-relaxed">
                            <span className="font-bold text-[9px] bg-emerald-600 text-white p-0.5 rounded px-1 shrink-0 uppercase tracking-widest font-mono">Resposta IA</span>
                            <span>{item.systemResponse}</span>
                          </div>
                        )}
                      </div>

                      <div className="text-right text-[10px] text-slate-400 shrink-0 font-mono">
                        <span className="block capitalize">{item.userRole}</span>
                        <span className="block mt-2">{new Date(item.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
