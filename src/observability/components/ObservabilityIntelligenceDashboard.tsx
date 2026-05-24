import React, { useState } from 'react';
import { 
  Activity, 
  Terminal, 
  Cpu, 
  Radio, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  Sparkles, 
  Database, 
  DollarSign, 
  List, 
  Layers, 
  Workflow, 
  Flame, 
  TrendingUp,
  Sliders,
  BellRing
} from 'lucide-react';
import { 
  useOperationalTelemetry, 
  useWorkflowTracing, 
  useRealtimeDiagnostics, 
  useSystemHealth, 
  useIncidentMonitoring, 
  useObservabilityAnalytics 
} from '../hooks';
import { OperationalDomain, TelemetrySeverity } from '../types';
import { PremiumGlassCard } from '@/design-system';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ObservabilityIntelligenceDashboard() {
  const [activeTab, setActiveTab] = useState<'status' | 'logs' | 'tracing' | 'incidents' | 'governance'>('status');

  // Load state and triggers from hooks
  const { events, emitTelemetryEvent, clearAllTelemetryHistory } = useOperationalTelemetry();
  const { completedTraces, activeSpansCount, executeWithProfilingSpan } = useWorkflowTracing();
  const { dbState, socketState, calibrateConnectionState, calibrateDatabaseState } = useRealtimeDiagnostics();
  const { healthScore, calibrateAIExplainabilityIndex } = useSystemHealth();
  const { incidents, unresolvedIncidents, logFailureIncident, resolveActiveIncident, clearAllIncidents } = useIncidentMonitoring();
  const { stats, trackReadOperation, trackWriteOperation, resetOperationalCounters } = useObservabilityAnalytics();

  // Simulation inputs
  const [mockLogTitle, setMockLogTitle] = useState('Autenticação Biométrica Residencial');
  const [mockLogDesc, setMockLogDesc] = useState('Técnico logou no aplicativo via reconhecimento facial na matriz Erechim.');
  const [mockLogDomain, setMockLogDomain] = useState<OperationalDomain>(OperationalDomain.SECURITY_DOOR);
  const [mockLogSeverity, setMockLogSeverity] = useState<TelemetrySeverity>(TelemetrySeverity.INFO);

  const [simTraceName, setSimTraceName] = useState('Carregar POPs de Dedetização de Térmitas');
  const [simTraceDomain, setSimTraceDomain] = useState<OperationalDomain>(OperationalDomain.CRM_WORKFLOW);
  const [isTracingSim, setIsTracingSim] = useState(false);

  // Trigger simulated trace/span profiling
  const handleRunTraceSimulation = async () => {
    setIsTracingSim(true);
    toast.info('Construindo cronograma de execução com span id...');

    // Simulate random duration representing actual processes
    const timeSpent = Math.floor(25 + Math.random() * 85);

    await executeWithProfilingSpan(simTraceName, simTraceDomain, async () => {
      await new Promise(resolve => setTimeout(resolve, timeSpent));
      return { success: true };
    }, { matchedRecordsCount: 14 });

    toast.success('Rastreabilidade finalizada. Trace gravado no histórico.');
    setIsTracingSim(false);
  };

  // Trigger manual simulation of an incident anomaly
  const handleRaiseSimulatedIncident = () => {
    logFailureIncident(
      OperationalDomain.OFFLINE_RECONCILIATION,
      TelemetrySeverity.CRITICAL,
      'Falha Crítica na Reconciliação do Almoxarifado',
      'Conflito insolúvel detectado no reorder buffer de fipronil líquido entre filiais de Erechim e Passo Fundo.',
      78
    );
    toast.error('Gatilho de Anomalia disparado! Alertas urgentes despachados para engenheiros.');
  };

  const handleEmitTelemetry = () => {
    emitTelemetryEvent(mockLogDomain, mockLogSeverity, mockLogTitle, mockLogDesc, { clientPlatform: 'Android 14 PDA' });
    toast.success('Evento de telemetria emitido!', {
      description: 'Mapeado com isolamento de tenant e identificador único.'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-600">

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] flex items-center gap-1.5">
            <Radio className="size-3.5 text-indigo-500 animate-pulse" /> DDSulf Telemetry Infrastructure (L-SLA)
          </span>
          <h2 className="text-4xl font-black text-black tracking-tight">Observabilidade & Telemetria Operacional</h2>
          <p className="text-gray-500 text-sm max-w-4xl font-semibold">Instrumentação total em tempo real para controle sanitário de pragas. Auditoria de transações, análise contextual de recomendações do Gemini, custos computacionais do Firestore e alertas em caso de anomalias.</p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={handleRaiseSimulatedIncident}
            className="bg-red-600 hover:bg-red-700 text-white font-bold h-11 px-5 rounded-xl uppercase text-xs tracking-wider flex items-center gap-1.5"
          >
            <Flame className="size-4 animate-bounce" /> Simular Incidente Crítico
          </Button>
          <Button 
            onClick={() => {
              resetOperationalCounters();
              toast.info('Contadores redefinidos!');
            }}
            className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200 border border-zinc-200 font-bold h-11 px-5 rounded-xl text-xs uppercase cursor-pointer"
          >
            Resetar Contadores
          </Button>
        </div>
      </div>

      {/* Stats Board */}
      <div className="grid gap-4 sm:grid-cols-4">
        
        <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Operational Health</span>
            <span className="text-[10px] text-emerald-600 font-mono font-bold">LSL OK</span>
          </div>
          <p className="text-3xl font-black text-black">{healthScore.overallScore}%</p>
          <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden mt-2">
            <div 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${healthScore.overallScore}%` }}
            />
          </div>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Tráfego Firestore Sanitário</span>
          <p className="text-3xl font-black text-[#4F46E5]">
            {stats.readsCount} <span className="text-xs text-zinc-400 font-mono">r</span> / {stats.writesCount} <span className="text-xs text-zinc-400 font-mono">w</span>
          </p>
          <span className="text-[9px] text-zinc-400 font-mono font-bold">Custo Estimado Real: ${stats.estimatedFirestorePriceUsd}</span>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">Anomalias Ativas</span>
          <p className={`text-3xl font-black ${unresolvedIncidents.length > 0 ? 'text-red-650 animate-pulse' : 'text-emerald-600'}`}>
            {unresolvedIncidents.length} incidentes
          </p>
          <span className="text-[9px] text-zinc-400 font-mono font-bold">Alertas Sanitários Monitorados</span>
        </div>

        <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-1 w-full">
          <span className="text-[10px] text-zinc-400 uppercase font-black tracking-wider">EXPLAINABILITY INDEX (IA)</span>
          <p className="text-3xl font-black text-zinc-900">{healthScore.aiExplainabilityScore}%</p>
          <span className="text-[9px] text-emerald-600 font-bold">Decisões Auditáveis em Conformidade</span>
        </div>

      </div>

      {/* Tabs navigation */}
      <div className="flex border-b border-gray-200 gap-1 pb-1 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('status')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'status' ? 'bg-zinc-900 text-white' : 'text-gray-400 hover:text-black'
          }`}
        >
          <Activity className="size-3.5" /> Painel de Diagnósticos
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'logs' ? 'bg-zinc-900 text-white' : 'text-gray-400 hover:text-black'
          }`}
        >
          <Terminal className="size-3.5" /> Streams de Telemetria
        </button>
        <button 
          onClick={() => setActiveTab('tracing')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'tracing' ? 'bg-zinc-900 text-white' : 'text-gray-400 hover:text-black'
          }`}
        >
          <Workflow className="size-3.5" /> Tracing de Workflows
        </button>
        <button 
          onClick={() => setActiveTab('incidents')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'incidents' ? 'bg-zinc-900 text-white' : 'text-gray-400 hover:text-black'
          }`}
        >
          <AlertTriangle className="size-3.5" /> Anomalias & Alertas
        </button>
        <button 
          onClick={() => setActiveTab('governance')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === 'governance' ? 'bg-zinc-900 text-white' : 'text-gray-400 hover:text-black'
          }`}
        >
          <Sliders className="size-3.5" /> Governança Telemétrica
        </button>
      </div>

      {/* STATUS TAB CONTENT */}
      {activeTab === 'status' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-8 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-black">Status de Canal & Sincronizadores</h3>
                <p className="text-xs text-gray-500">Acompanhe a integridade de rotinas na nuvem. Altere os seletores de calibração para observar os gatilhos.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase">Estabilidade WebSocket Realtime</span>
                  <div className="flex gap-1">
                    {['connected', 'unstable', 'disconnected'].map((state) => (
                      <button 
                        key={state}
                        onClick={() => calibrateConnectionState(state as any)}
                        className={`flex-1 text-[10px] font-black uppercase p-2 rounded-xl transition-all cursor-pointer ${
                          socketState === state 
                            ? state === 'connected' 
                              ? 'bg-emerald-600 text-white' 
                              : state === 'unstable' 
                                ? 'bg-amber-600 text-white' 
                                : 'bg-red-650 text-white'
                            : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                        }`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-3">
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase">Integridade Firestore Database</span>
                  <div className="flex gap-1">
                    {['optimal', 'degraded', 'critical'].map((state) => (
                      <button 
                        key={state}
                        onClick={() => calibrateDatabaseState(state as any)}
                        className={`flex-1 text-[10px] font-black uppercase p-2 rounded-xl transition-all cursor-pointer ${
                          dbState === state 
                            ? state === 'optimal' 
                              ? 'bg-emerald-600 text-white' 
                              : state === 'degraded' 
                                ? 'bg-amber-600 text-white' 
                                : 'bg-red-650 text-white'
                            : 'bg-zinc-100 text-zinc-400 hover:bg-zinc-200'
                        }`}
                      >
                        {state}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block mb-2">Simular Acúmulo de Tráfego Sanitário (Firestore)</span>
                <div className="flex gap-2">
                  <Button 
                    onClick={() => {
                      trackReadOperation(140);
                      toast.success('+140 Leituras Firestore gravadas.');
                    }}
                    className="flex-1 bg-white border hover:bg-zinc-50 text-zinc-900 font-bold h-10 text-xs rounded-xl"
                  >
                    Mocador de Leituras (+140 reads)
                  </Button>
                  <Button 
                    onClick={() => {
                      trackWriteOperation(35);
                      toast.success('+35 Escritas Firestore gravadas.');
                    }}
                    className="flex-1 bg-white border hover:bg-zinc-50 text-zinc-900 font-bold h-10 text-xs rounded-xl"
                  >
                    Mocador de Escritas (+35 writes)
                  </Button>
                </div>
              </div>
            </PremiumGlassCard>
          </div>

          <div className="md:col-span-4 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Cpu className="size-4 text-indigo-500 animate-spin" />
                <h4 className="text-xs font-black uppercase tracking-widest text-black">IA Explainability Control</h4>
              </div>

              <p className="text-xs text-zinc-500 font-semibold leading-relaxed">
                A IA do DDSulf precisa ser interpretativa para validações de engenharia química. Arraste o medidor para calibrar a taxa de audição e acurácia.
              </p>

              <div className="space-y-2">
                <input 
                  type="range" 
                  min="50" 
                  max="100" 
                  value={healthScore.aiExplainabilityScore} 
                  onChange={(e) => calibrateAIExplainabilityIndex(parseInt(e.target.value))}
                  className="w-full text-indigo-500 h-1 bg-zinc-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-black uppercase">
                  <span>Auditável</span>
                  <span>Acurácia: {healthScore.aiExplainabilityScore}%</span>
                </div>
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

      {/* STREAMS OF TELEMETRY TAB CONTENT */}
      {activeTab === 'logs' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-7 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <h3 className="text-lg font-black text-black">Emissor de Telecomunicações e Telemetria</h3>
                  <p className="text-xs text-gray-500">Adicione novas linhas de log mapeando o contexto sanitário de imediato.</p>
                </div>
                <Button 
                  onClick={() => {
                    clearAllTelemetryHistory();
                    toast.success('Histórico de Telemetria esvaziado.');
                  }}
                  className="bg-red-650 hover:bg-red-700 text-white h-8 text-xs font-bold"
                >
                  Limpar Logs
                </Button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">Título do Evento</label>
                  <input 
                    type="text" 
                    value={mockLogTitle} 
                    onChange={(e) => setMockLogTitle(e.target.value)}
                    className="w-full text-xs p-3.5 bg-gray-50 border border-gray-200 rounded-2xl font-bold font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 font-extrabold uppercase">Descrição Detalhada</label>
                  <textarea 
                    value={mockLogDesc} 
                    onChange={(e) => setMockLogDesc(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-3.5 bg-gray-50 border border-gray-200 rounded-2xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Domínio Operacional</label>
                    <select 
                      value={mockLogDomain}
                      onChange={(e) => setMockLogDomain(e.target.value as any)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      {Object.values(OperationalDomain).map(dom => (
                        <option key={dom} value={dom}>{dom}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Gravidade</label>
                    <select 
                      value={mockLogSeverity}
                      onChange={(e) => setMockLogSeverity(e.target.value as any)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl"
                    >
                      {Object.values(TelemetrySeverity).map(sev => (
                        <option key={sev} value={sev}>{sev}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button 
                  onClick={handleEmitTelemetry}
                  className="w-full bg-black hover:bg-zinc-900 text-white text-xs uppercase tracking-wider font-bold h-11 rounded-xl"
                >
                  Emitir Registro de Telemetria
                </Button>
              </div>
            </PremiumGlassCard>
          </div>

          <div className="md:col-span-5 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">Histórico de Eventos Recentes (Telemetry Stream)</span>
              
              <div className="space-y-3.5 max-h-[380px] overflow-y-auto pr-1">
                {events.map((evt) => (
                  <div key={evt.id} className="p-3.5 bg-zinc-50 border border-zinc-100 rounded-2xl space-y-1 text-xs">
                    <div className="flex justify-between items-center">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        evt.severity === TelemetrySeverity.CRITICAL 
                          ? 'bg-red-100 text-red-700' 
                          : evt.severity === TelemetrySeverity.WARNING 
                            ? 'bg-amber-100 text-amber-700' 
                            : 'bg-indigo-100 text-indigo-700'
                      }`}>
                        {evt.severity}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400 font-semibold">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                    </div>

                    <h4 className="font-extrabold text-zinc-900">{evt.title}</h4>
                    <p className="text-zinc-500 text-[11px] leading-relaxed">{evt.description}</p>
                    <span className="text-[9px] font-mono text-zinc-400 font-bold uppercase block pt-1 border-t border-zinc-150">Domínio: {evt.domain}</span>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

      {/* TRACING TAB CONTENT */}
      {activeTab === 'tracing' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-8 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-lg font-black text-black">Rastreabilidade Analítica de Execução (Tracing Panel)</h3>
                <p className="text-xs text-gray-500">Mapeie transações críticas registrando tempos de resposta de forma individualizada com identificadores únicos (trace metrics).</p>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Nome da Transação</label>
                    <input 
                      type="text" 
                      value={simTraceName} 
                      onChange={(e) => setSimTraceName(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl font-bold font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 font-extrabold uppercase">Categoria Dominial</label>
                    <select 
                      value={simTraceDomain}
                      onChange={(e) => setSimTraceDomain(e.target.value as any)}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs"
                    >
                      {Object.values(OperationalDomain).map(dom => (
                        <option key={dom} value={dom}>{dom}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button 
                  disabled={isTracingSim}
                  onClick={handleRunTraceSimulation}
                  className="w-full bg-[#4F46E5] text-white hover:bg-indigo-500 h-11 rounded-xl font-bold text-xs uppercase tracking-wider"
                >
                  Registrar & Tracear Transação
                </Button>

                <div className="space-y-3">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-wider block">Histórico de Transações Completadas ({completedTraces.length})</span>
                  
                  <div className="space-y-2">
                    {completedTraces.map((trace) => (
                      <div key={trace.spanId} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl flex items-center justify-between text-xs font-semibold">
                        <div className="space-y-1">
                          <span className="font-extrabold text-zinc-900">{trace.name}</span>
                          <div className="flex items-center gap-1.5 text-[9px] font-mono text-zinc-400 uppercase font-black">
                            <span>trace: {trace.traceId}</span>
                            <span>•</span>
                            <span>span: {trace.spanId}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[#4F46E5] font-black">{trace.durationMs}ms</p>
                          <span className="text-[9px] text-emerald-600 font-mono uppercase font-black">{trace.status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </PremiumGlassCard>
          </div>

          <div className="md:col-span-4 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex items-center gap-1.5 border-b border-gray-100 pb-2">
                <Clock className="size-4 text-emerald-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-black">Observabilidade Concorrente</h4>
              </div>

              <div className="p-3.5 bg-zinc-900 text-zinc-400 rounded-2xl font-mono text-[11px] space-y-1.5">
                <p className="text-amber-500 font-bold">CONCURRENT METERS</p>
                <p>Spans Ativos em Espera: <span className="text-white">{activeSpansCount} spans</span></p>
                <p>Protocolo de Rede: <span className="text-emerald-400">gRPC Web / HTTP2</span></p>
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

      {/* INCIDENTS TAB CONTENT */}
      {activeTab === 'incidents' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-8 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <div>
                  <h3 className="text-lg font-black text-black">Centro de Incidentes & Chamados de SLA</h3>
                  <p className="text-xs text-gray-500">Mapeamento de anomalias com cálculo automático de severidade sanitária.</p>
                </div>
                <Button 
                  onClick={() => {
                    clearAllIncidents();
                    toast.success('Hstórico de anomalias redefinido.');
                  }}
                  className="bg-red-650 hover:bg-red-700 text-white h-8 text-xs font-bold"
                >
                  Expurgar Alertas
                </Button>
              </div>

              <div className="space-y-3.5">
                {incidents.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-xs italic">
                    <ShieldCheck className="size-8 text-emerald-500 mx-auto mb-2" />
                    <span>Nenhuma anomalia sanitária registrada no momento. DDSulf operacional operando em perfeito estado.</span>
                  </div>
                ) : (
                  incidents.map((inc) => (
                    <div key={inc.id} className="p-4 bg-zinc-50 border border-zinc-150 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                      <div className="space-y-1 my-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            inc.status === 'resolved' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {inc.status}
                          </span>
                          <span className="font-extrabold text-zinc-900">{inc.title}</span>
                        </div>
                        <p className="text-gray-500 text-[11px] leading-relaxed">{inc.description}</p>
                        <p className="text-[10px] text-indigo-600 font-mono font-bold uppercase">Domínio: {inc.domain} • Peso de Impacto: {inc.impactScore}/100</p>
                      </div>

                      {inc.status === 'unresolved' && (
                        <Button 
                          onClick={() => {
                            resolveActiveIncident(inc.id);
                            toast.success('Incidente sanitário equacionado e finalizado!');
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-4 rounded-xl text-[11px] uppercase tracking-wider shrink-0"
                        >
                          Resolver SLA
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </PremiumGlassCard>
          </div>

          <div className="md:col-span-4 space-y-4">
            <PremiumGlassCard className="space-y-4 bg-red-50/50 border border-red-100 text-red-900 p-5 rounded-3xl">
              <div className="flex items-center gap-2 border-b border-red-200 pb-2">
                <BellRing className="size-4 text-red-650" />
                <h4 className="text-xs font-black uppercase tracking-widest text-red-700">Canal de Alertas Urgentes</h4>
              </div>

              <p className="text-xs text-red-800 leading-relaxed font-semibold">
                Qualquer falha de reconciliação offline ou de limite de dosagem química acima das referências do Ministério da Saúde desencadeia chamados emergenciais automáticos via SQS sanitário.
              </p>
            </PremiumGlassCard>
          </div>

        </div>
      )}

      {/* GOVERNANCE TAB CONTENT */}
      {activeTab === 'governance' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-12 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="border-b border-gray-100 pb-2">
                <h3 className="text-lg font-black text-black">Governança Telemétrica & Auditoria</h3>
                <p className="text-xs text-gray-500">Estruturação de dados auditáveis em conformidade com as diretivas federais de controle de pragas urbanas.</p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3 text-xs leading-relaxed font-semibold text-gray-550 p-1">
                <div className="space-y-2 p-4 bg-zinc-50 rounded-2xl">
                  <span className="font-extrabold text-black block text-sm">Norma de Resolução</span>
                  <p>Todos os limites de processamento em dispositivos de campo operam sem consumo cumulativo de conexão móvel. O cache local RAM preserva dados contra downloads desnecessários.</p>
                </div>

                <div className="space-y-2 p-4 bg-zinc-50 rounded-2xl">
                  <span className="font-extrabold text-black block text-sm">Rastreamento de Tenant Context</span>
                  <p>Cada empresa operando na franquia DDSulf possui orquestradores isolados que evitam colisões de dados ou visibilidade de anotações químicas entre os técnicos.</p>
                </div>

                <div className="space-y-2 p-4 bg-zinc-50 rounded-2xl">
                  <span className="font-extrabold text-black block text-sm">Seletividade Sanitária</span>
                  <p>A arquitetura arquiva apenas eventos com dados agregados úteis, promovendo economia fiscal e total transparência aos órgãos de vigilância sanitária regionais.</p>
                </div>
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

    </div>
  );
}

export default ObservabilityIntelligenceDashboard;
