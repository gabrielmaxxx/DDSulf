/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Network, 
  Workflow, 
  GitFork, 
  RefreshCw, 
  ShieldCheck, 
  Brain, 
  Terminal, 
  Activity, 
  Server, 
  Database, 
  AlertTriangle, 
  BookOpen, 
  CheckCircle, 
  Cpu, 
  LogOut, 
  RotateCcw, 
  Play, 
  Wifi, 
  WifiOff, 
  FileText,
  Clock
} from 'lucide-react';
import { useEventBus } from './hooks/useEventBus';
import { useOperationalEvents } from './hooks/useOperationalEvents';
import { useRealtimeSynchronization } from './hooks/useRealtimeSynchronization';
import { useWorkflowOrchestration } from './hooks/useWorkflowOrchestration';
import { useIntegrationTelemetry } from './hooks/useIntegrationTelemetry';
import { useConsistencyValidation } from './hooks/useConsistencyValidation';
import { eventBusService } from './services/eventBusService';
import { messagingService } from './services/messagingService';
import { OperationalEventType, SystemModuleName } from './types';

export function IntegrationCockpit() {
  const [activeView, setActiveView] = useState<'stream' | 'orchestration' | 'sync' | 'consistency' | 'telemetry' | 'governance'>('stream');
  
  // Custom states
  const [offlineSimMode, setOfflineSimMode] = useState<boolean>(false);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Hook references
  const { history, offlineQueue, publishEvent, clearBusHistory, refreshState } = useEventBus();
  const { generateMockWorkflowTrigger, lastReceivedEvent } = useOperationalEvents();
  const { isOnline, syncOfflineQueue, queuedEventsCount, syncingNow } = useRealtimeSynchronization();
  const { workflows, resetWorkflows } = useWorkflowOrchestration();
  const { logs } = useIntegrationTelemetry();
  const { issues, scanning, scanResult, resolveIssue, runReconciliation } = useConsistencyValidation();

  // Multi-tenant selection
  const [tenantId, setTenantId] = useState<string>(() => eventBusService.getTenantId());

  const handleTenantChange = (newTenant: string) => {
    eventBusService.changeTenantContext(newTenant);
    setTenantId(newTenant);
    refreshState();
  };

  const handleSimulateNormalEvent = async (type: 'calculator' | 'stock' | 'pops' | 'ai') => {
    await generateMockWorkflowTrigger(type);
    refreshState();
  };

  const triggerIntegrationReset = () => {
    clearBusHistory();
    resetWorkflows();
    messagingService.clearAll();
    window.location.reload();
  };

  const activeEventData = history.find(e => e.id === selectedEventId);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Platform Header Profile */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-900 bg-slate-950/85">
        <div className="flex gap-4 items-center">
          <div className="size-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-[24px] flex items-center justify-center shadow-lg shrink-0 border border-emerald-400/20">
             <Network className="size-7 text-white" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight text-white">Event Engine & Integration Fabric</h1>
            <div className="flex items-center gap-2">
               <span className={`size-2 rounded-full ${isOnline && !offlineSimMode ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-bounce'}`} />
               <p className="text-[9px] font-mono font-black uppercase tracking-widest text-slate-400">
                 {isOnline && !offlineSimMode 
                   ? 'DDSulf Enterprise Fabric: Online Sync' 
                   : 'DDSulf Local Mode: Cache Conectivity enqueued'}
               </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Metrics */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tenant Context Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl h-11 px-3 flex items-center gap-2">
            <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider">Tenant:</span>
            <select
              value={tenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="bg-transparent border-none text-[11px] font-mono font-bold text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="tenant_porto_alegre_01" className="bg-slate-950 text-slate-200">POA Regional Sur</option>
              <option value="tenant_pelotas_02" className="bg-slate-950 text-slate-200">Pelotas Fruticultura</option>
              <option value="tenant_caxias_03" className="bg-slate-950 text-slate-200">Caxias Vinícola</option>
            </select>
          </div>

          <button
            onClick={triggerIntegrationReset}
            className="h-11 px-4 bg-slate-900 hover:bg-slate-850 hover:text-rose-400 text-slate-400 border border-slate-800 rounded-2xl text-[10px] uppercase font-bold tracking-wider transition-all flex items-center gap-2 cursor-pointer"
            title="Reset Fabric States"
          >
            <RotateCcw className="size-3.5" /> Reconfigurar Barramento
          </button>
        </div>
      </header>

      {/* Network / Connectivity Status Banner */}
      <div className={`p-4 rounded-3xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 ${
        offlineSimMode 
          ? 'bg-amber-950/20 border-amber-500/40 text-amber-400' 
          : 'bg-emerald-950/10 border-emerald-500/30 text-emerald-400'
      }`}>
        <div className="flex items-center gap-3">
          {offlineSimMode ? (
            <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/25">
              <WifiOff className="size-5 text-amber-400" />
            </div>
          ) : (
            <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/25">
              <Wifi className="size-5 text-emerald-400" />
            </div>
          )}

          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-slate-100">
              {offlineSimMode ? 'Simulador de Rede: Offline Desconectado' : 'Conectividade do Fabric: Online'}
            </h4>
            <p className="text-[11px] text-slate-400 leading-normal max-w-2xl">
              {offlineSimMode 
                ? 'Todos os eventos gerados agora serão retidos na fila offline integrada (IndexedDB/WebSQL). Reconecte para publicar as ordens de dose de pragas e calcular laudos.' 
                : 'Tráfego assíncrono instantâneo via WebSocket / Firestore Streams ativo. Eventos são roteados em tempo de execução para os microsserviços.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setOfflineSimMode(!offlineSimMode)}
          className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider border duration-200 shrink-0 ${
            offlineSimMode 
              ? 'bg-emerald-500 hover:bg-emerald-450 text-slate-950 border-emerald-500' 
              : 'bg-amber-500/10 hover:bg-amber-500/15 text-amber-400 border-amber-950'
          }`}
        >
          {offlineSimMode ? 'Simular Rede Online' : 'Simular Queda de Rede'}
        </button>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex scrollbar-none items-center overflow-x-auto bg-slate-950 p-1.5 rounded-2xl gap-1 border border-slate-900">
        {[
          { id: 'stream', label: 'Event Stream', icon: Activity },
          { id: 'orchestration', label: 'Orquestrador de Fluxos', icon: GitFork },
          { id: 'sync', label: 'Sincronizador PWA', icon: RefreshCw },
          { id: 'consistency', label: 'Integridade & Saneamento', icon: ShieldCheck },
          { id: 'telemetry', label: 'Vigilância & Logs', icon: Terminal },
          { id: 'governance', label: 'Padrões de Governança', icon: BookOpen }
        ].map((tab) => {
          const isActive = activeView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center gap-2.5 h-11 px-4 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-slate-50 shadow-md border border-slate-850' 
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <tab.icon className={`size-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Workspace Panels */}
      <div className="w-full bg-slate-950/40 p-6 rounded-3xl border border-slate-900 min-h-[480px]">
        {/* 1. EVENT STREAM VIEW */}
        {activeView === 'stream' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="size-4.5 text-emerald-400" />
                  Barramento Instantâneo de Mensagens (Operational Event Stream)
                </h3>
                <p className="text-xs text-slate-400">Publique eventos para engatilhar pipelines de orquestração de defensivos sem acoplamento direto.</p>
              </div>

              {/* Quick simulator buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleSimulateNormalEvent('calculator')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-[10px] text-slate-200 hover:text-slate-100 font-bold uppercase rounded-lg border border-slate-800 transition-colors"
                >
                  Dosagem Calculada
                </button>
                <button
                  onClick={() => handleSimulateNormalEvent('pops')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-[10px] text-slate-200 hover:text-slate-100 font-bold uppercase rounded-lg border border-slate-800 transition-colors"
                >
                  Novo POP Anvisa
                </button>
                <button
                  onClick={() => handleSimulateNormalEvent('stock')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-[10px] text-slate-200 hover:text-slate-100 font-bold uppercase rounded-lg border border-slate-800 transition-colors"
                >
                  Estoque Alerta
                </button>
                <button
                  onClick={() => handleSimulateNormalEvent('ai')}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-850 text-[10px] text-zinc-300 hover:text-slate-100 font-bold uppercase rounded-lg border border-slate-800 transition-colors"
                >
                  Anomalia AI
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Event Table List */}
              <div className="lg:col-span-2 space-y-3">
                {history.length === 0 ? (
                  <div className="p-12 text-center rounded-3xl border border-dashed border-slate-850 bg-slate-950/30">
                    <Clock className="size-8 text-slate-650 mx-auto mb-2" />
                    <p className="text-xs font-mono text-slate-500">Nenhum evento registrado no barramento atual para o tenant {tenantId}. Use os simuladores acima.</p>
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto scrollbar-thin">
                    {history.map((ev) => {
                      const isSelected = selectedEventId === ev.id;
                      return (
                        <div 
                          key={ev.id}
                          onClick={() => setSelectedEventId(ev.id)}
                          className={`p-4 bg-slate-900 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                            isSelected 
                              ? 'border-emerald-500/40 bg-slate-900 shadow-md shadow-emerald-500/5' 
                              : 'border-slate-850 hover:border-slate-800 bg-slate-900/60'
                          }`}
                        >
                          <div className="space-y-1.5 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Event Name Tag */}
                              <span className="text-[10px] font-mono text-emerald-400 font-black bg-slate-950 px-2 py-0.5 rounded border border-emerald-950">
                                {ev.eventName}
                              </span>

                              {/* Source Module */}
                              <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest bg-slate-800 px-1.5 py-0.5 rounded">
                                {ev.sourceModule}
                              </span>

                              {/* Multi tenant validation tag */}
                              <span className="text-[8px] font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">
                                {ev.tenantId.replace('tenant_', '')}
                              </span>
                            </div>

                            <p className="text-[10px] font-mono text-slate-500 truncate max-w-[340px]">
                              CorrelationId: {ev.correlationId}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 font-mono text-[9px] text-slate-500">
                            <span>{new Date(ev.timestamp).toLocaleTimeString()}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Event payload detail panel */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-6.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sky-400 font-bold text-[10px] uppercase mb-4">
                    <Server className="size-4" />
                    <span>Detalhe do Payload do Evento</span>
                  </div>

                  {activeEventData ? (
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Audit ID do Registro</span>
                        <p className="text-xs font-mono font-bold text-slate-200">{activeEventData.id}</p>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">TraceParent Standard Header</span>
                        <p className="text-xs font-mono text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-850 leading-relaxed font-semibold">
                          {activeEventData.traceParent}
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Mensagem JSON Estruturada</span>
                        <pre className="text-[10px] font-mono text-emerald-400 bg-slate-950 p-4 rounded-xl border border-slate-850 overflow-x-auto max-h-[180px] leading-relaxed">
                          {JSON.stringify(activeEventData.payload, null, 2)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 bg-slate-950/45 rounded-2xl border border-slate-850 border-dashed text-[11px] text-slate-500 italic text-center">
                      Nenhum evento selecionado no stream para depuração de de-para. Clique em alguma linha para carregar informações de auditoria de rastro.
                    </div>
                  )}
                </div>

                <div className="border-t border-slate-850/80 pt-4 mt-6">
                  <span className="text-[8px] font-mono text-slate-500 uppercase">Estilo de arquitetura de dados Linear & Stripe</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. ORCHESTRATION PIPELINES */}
        {activeView === 'orchestration' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Workflow className="size-4.5 text-emerald-400" />
                DDSulf Enterprise Orchestration Engine
              </h3>
              <p className="text-xs text-slate-400">Ativação coordenada de regras operacionais em pipelines de fluxo de trabalho multi-módulo em tempo real.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {workflows.map((wf) => {
                const isCompleted = wf.status === 'completed';
                const isExecuting = wf.status === 'executing';

                return (
                  <div 
                    key={wf.id}
                    className={`p-6 bg-slate-900 border rounded-3xl space-y-5 flex flex-col justify-between ${
                      isExecuting 
                        ? 'border-emerald-500/40 bg-slate-900 shadow-md shadow-emerald-500/5' 
                        : 'border-slate-850 bg-slate-900/40'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                          isCompleted 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-950/50' 
                            : isExecuting 
                            ? 'bg-sky-500/10 text-sky-400 border border-sky-950/30' 
                            : 'bg-slate-800 text-slate-500'
                        }`}>
                          {wf.status}
                        </span>

                        <span className="text-[9px] font-mono text-slate-550">
                          Trigger: {wf.triggerEvent}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200">{wf.workflowName}</h4>

                      {/* Display Steps Progress */}
                      <div className="space-y-2.5 pt-2">
                        {wf.steps.map((step, sIdx) => {
                          return (
                            <div 
                              key={step.stepId}
                              className={`p-3 bg-slate-950 rounded-xl border flex items-center justify-between gap-3 ${
                                step.executed 
                                  ? 'border-emerald-500/20 text-emerald-400' 
                                  : 'border-slate-900 text-slate-500'
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={`size-4 rounded-full flex items-center justify-center font-mono text-[8px] font-extrabold ${
                                  step.executed ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {sIdx + 1}
                                </span>
                                <span className="text-[11px] truncate leading-relaxed">
                                  {step.actionDescription}
                                </span>
                              </div>

                              <span className="text-[8px] font-mono uppercase bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">
                                {step.targetModule}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-850/40 flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">Fluxo acionado pelo Barramento</span>

                      {/* Simulators */}
                      <button
                        onClick={async () => {
                          const cid = `corr_orch_${Math.random().toString(36).substring(4)}`;
                          await eventBusService.publish(wf.triggerEvent, { syntheticTrigger: true }, SystemModuleName.INTEGRATION, cid);
                          refreshState();
                        }}
                        disabled={isExecuting}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-450 disabled:bg-slate-800 text-slate-950 disabled:text-slate-550 font-black text-[9px] uppercase rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="size-3 fill-slate-950" /> Executar Fluxo
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. PWA SYNC VIEW */}
        {activeView === 'sync' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-slate-900 border border-slate-850 rounded-3xl p-6.5">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center gap-2 text-amber-400">
                  <RefreshCw className="size-5" />
                  <h4 className="text-sm font-bold text-slate-100">Fila Offline e Sincronismo Resiliente</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-2xl">
                  Durante a aspersão em áreas rurais sem sinal gaúcho 4G/LTE, o DDSulf retém e ordena os eventos em um buffer seguro de banco de dados offline local. Após o restabelecimento, o motor de sincronismo reproduz os eventos de forma idêntica e orquestrada.
                </p>
              </div>

              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Enfileirados Offline</span>
                  <span className="text-2xl font-bold text-amber-400 block">{queuedEventsCount} Eventos</span>
                </div>
                
                <button
                  onClick={async () => {
                    await syncOfflineQueue();
                    refreshState();
                  }}
                  disabled={syncingNow || queuedEventsCount === 0}
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 disabled:text-slate-550 font-black text-[10px] uppercase rounded-xl tracking-wider transition-colors"
                >
                  {syncingNow ? 'Sincronizando...' : 'Sincronizar'}
                </button>
              </div>
            </div>

            {/* Offline queue list */}
            {queuedEventsCount === 0 ? (
              <div className="p-12 text-center border border-dashed border-slate-850 rounded-3xl bg-slate-950/20">
                <CheckCircle className="size-8 text-emerald-500 opacity-60 mx-auto mb-2" />
                <p className="text-xs font-mono text-slate-500">Mural de integridade limpo. Nenhum evento retido offline.</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">Espera Estocástica Residual</h4>
                <div className="space-y-2">
                  {offlineQueue.map((oq) => (
                    <div key={oq.id} className="p-4 bg-slate-900 border border-amber-950/60 rounded-2xl flex items-center justify-between gap-4">
                      <div className="space-y-1">
                        <span className="text-[9px] font-mono text-amber-400 font-bold bg-amber-500/10 border border-amber-950 px-2 py-0.5 rounded">
                          {oq.eventName}
                        </span>
                        <div className="flex gap-4 font-mono text-[9px] text-zinc-550 mt-1">
                          <span>CorrelationId: {oq.correlationId}</span>
                          <span>Timestamp Original: {new Date(oq.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>

                      <span className="text-[8px] font-mono text-amber-400 font-semibold uppercase animate-pulse">
                        Retido offline
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 4. INTEGRITY & CONSISTENCY SCORES */}
        {activeView === 'consistency' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Scan controller */}
              <div className="p-5.5 bg-slate-900 border border-slate-850 rounded-3xl space-y-4">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Reconciliação e Deparação</label>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 leading-normal">
                    Inspecione os contratos de mensageria para conferir correspondência organizacional perfeita e mitigar leaks de multi-tenant.
                  </span>
                </div>

                <button
                  onClick={runReconciliation}
                  disabled={scanning}
                  className="w-full h-10 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-xl text-[10px] font-black text-slate-200 transition-colors uppercase tracking-wider cursor-pointer"
                >
                  {scanning ? 'Escaneando contratos...' : 'Executar Varredura Geral'}
                </button>
              </div>

              {/* Status overall */}
              <div className="p-5.5 bg-slate-900 border border-slate-850 rounded-3xl space-y-3">
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Score de Integridade Geral</label>
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck className="size-5 text-emerald-400" />
                  <span className="text-2xl font-bold tracking-tight text-white">99.8%</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">Certificado após análise de isolamento criptográfico de multi-tenant no nível do Barramento.</p>
              </div>

              {/* Scan output logs */}
              <div className="p-5.5 bg-slate-900 border border-slate-850 rounded-3xl flex flex-col justify-between">
                <div className="flex items-center gap-2 text-sky-400 font-mono text-[9px] font-bold uppercase tracking-widest">
                  <Cpu className="size-4" /> Diagnóstico Predictivo do Fabric
                </div>
                {scanResult ? (
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-850 text-[10px] font-mono text-slate-350 leading-relaxed mt-2">
                    {scanResult.details} Inconsistências: {scanResult.count}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-2">
                    Execute a varredura para calibrar o depara estocástico e detectar vazamento de logs órfãos.
                  </p>
                )}
              </div>
            </div>

            {/* Inconsistency issues report list */}
            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Pendências de Saneamento</h4>
              <div className="space-y-2.5">
                {issues.map((iss) => (
                  <div 
                    key={iss.id}
                    className={`p-4 bg-slate-900/50 rounded-2xl border transition-all flex items-start gap-4 ${
                      iss.resolved 
                        ? 'border-emerald-500/20 bg-slate-900/35' 
                        : 'border-slate-850 bg-slate-900'
                    }`}
                  >
                    <div className="pt-0.5 shrink-0">
                      {iss.resolved ? (
                        <CheckCircle className="size-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="size-5 text-rose-450" />
                      )}
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono text-slate-500 uppercase">Fator: {iss.type.replace('_', ' ')}</span>
                        {iss.resolved ? (
                          <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 rounded">
                            Reconciliado
                          </span>
                        ) : (
                          <button
                            onClick={() => resolveIssue(iss.id)}
                            className="px-2.5 py-1 bg-slate-950 text-slate-300 hover:text-slate-100 border border-slate-850 text-[9px] font-bold rounded-md uppercase cursor-pointer"
                          >
                            Resolver pendência
                          </button>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed">{iss.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. VIGILANCE TELEMETRY & LOGS */}
        {activeView === 'telemetry' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Terminal className="size-4.5 text-emerald-400" />
                Vigilância de Campo & Rastreamento Telemetria
              </h3>
              <p className="text-xs text-slate-400">Logs detalhados de tráfego, de-para de dados e análise de eventos DDSulf.</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-3xl border border-slate-900">
              <div className="max-h-[380px] overflow-y-auto scrollbar-thin space-y-2 font-mono text-[11px]">
                {logs.map((log) => (
                  <div key={log.id} className="p-2 border-b border-slate-950 hover:bg-slate-900/40 flex items-start gap-3">
                    <span className="text-slate-500 shrink-0">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                    <span className={`shrink-0 font-bold uppercase tracking-wider ${
                      log.type === 'error' ? 'text-rose-400' : log.type === 'warning' ? 'text-amber-400' : 'text-sky-450'
                    }`}>
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-emerald-400 font-semibold shrink-0">[{log.module}]</span>
                    <span className="text-slate-300 flex-1">{log.message}</span>
                    <span className="text-slate-500 select-none hidden sm:inline text-[9px] shrink-0">CID: {log.correlationId}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. GOVERNANCE STANDARD */}
        {activeView === 'governance' && (
          <div className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="size-4.5 text-emerald-400" />
                DDSulf Event Architecture & Integration standards (v1.2.0)
              </h3>
              <p className="text-xs text-slate-400">Manual operacional de especificação de eventos baseados em barramento para programadores gaúchos.</p>
            </div>

            <div className="p-6 bg-slate-900/60 rounded-3xl border border-slate-850 space-y-5 text-xs text-slate-300 leading-relaxed font-sans max-w-4xl">
              <div>
                <h4 className="text-sm font-bold text-slate-100 mb-2">1. Estruturação e Desacoplamento Estrito</h4>
                <p className="mb-2">Nenhum módulo do sistema DDSulf (Calculadora, Estoque, Financeiro, POPs, IA) possui permissão para chamar rotinas internas de outro de forma síncrona. Toda comunicação é propagada unicamente publicando objetos de evento via <code className="text-emerald-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">EventBusService</code>.</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100 mb-2">2. Esquemas de Integridade e Isolamento Multi-Tenant</h4>
                <p className="mb-2">Cada evento trafegado obrigatoriamente contém a chave organizacional correspondente <code className="text-emerald-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">tenantId</code>. O barramento de eventos rejeita mensagens com divergência de locação organizacional para mitigar leaks de privacidade financeira ou de registros sanitários entre filiais gaúchas.</p>
              </div>

              <div>
                <h4 className="text-sm font-bold text-slate-100 mb-2">3. Monitoramento de Rastro (Tracing & Correlation ID)</h4>
                <p>Todas as orquestrações de fluxo de trabalho de ponta a ponta utilizam <code className="text-emerald-400 font-mono bg-slate-950 px-1.5 py-0.5 rounded">correlationId</code> injetados na origem. O TraceID segue o padrão corporativo para que qualquer auditor possa depurar gargalos de sincronismo rural.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
export default IntegrationCockpit;
