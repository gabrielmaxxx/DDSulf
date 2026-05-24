import React, { useState, useEffect } from 'react';
import { 
  GitBranch, 
  Settings, 
  Activity, 
  Server, 
  Network, 
  Cpu, 
  RotateCcw, 
  Play, 
  Sparkles, 
  FileCode, 
  CheckCircle, 
  AlertOctagon, 
  CloudRain, 
  Terminal, 
  Tv, 
  Layers, 
  Fingerprint, 
  HelpCircle,
  Database,
  Wifi,
  Signal,
  Clock,
  Layers3,
  Flame,
  Wrench,
  Gauge,
  Lock,
  ArrowRight,
  TrendingUp,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  User,
  Info
} from 'lucide-react';
import { 
  useDeploymentHealth, 
  useOperationalMonitoring, 
  useReleaseTracking, 
  usePerformanceDiagnostics, 
  useRealtimeHealth, 
  useIncidentDetection,
  useDeploymentGovernance,
  useReleaseValidation,
  useInfrastructureHealth,
  useOperationalAutomation,
  useRollbackManagement,
  useProductionReadiness
} from '../hooks';
import { useTenant } from '@/organization';
import { PremiumGlassCard } from '@/design-system';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function DevOpsObservabilityHub() {
  const { tenant } = useTenant();
  
  // Custom hooks integrations
  const { history: generalHistory, triggerMockDeploy } = useDeploymentHealth();
  const { metrics, avgLatency } = useOperationalMonitoring();
  const { releases, getPromptTemplate, savePromptTemplate } = useReleaseTracking();
  const { benchmarks, engineRating } = usePerformanceDiagnostics();
  const { channels } = useRealtimeHealth();
  const { incidents, triggerErrorSimulation, resolveIncidentLog } = useIncidentDetection();

  // Advanced engineered hooks integrations
  const { history: govHistory, changeCanaryWeight, registerNewDeployment } = useDeploymentGovernance();
  const { pipelineRuns, triggerValidationRun, advanceValidationStep } = useReleaseValidation();
  const { resources, systemIntegrity, scaleResource, createCompositeIndex } = useInfrastructureHealth();
  const { triggers, securityLogs, toggleAutomationTrigger, executeTriggerWorkflowManually } = useOperationalAutomation();
  const { executeImmediateRollback, isRollbackProcessing } = useRollbackManagement();
  const { policies, togglePolicyCertification, isReadyForProductionLaunch } = useProductionReadiness();

  // Selected State
  type TabType = 'kpi' | 'pipeline' | 'rollout' | 'infrastructure' | 'security' | 'readiness' | 'prompts' | 'handbook';
  const [activeTab, setActiveTab] = useState<TabType>('kpi');
  
  const [selectedIncident, setSelectedIncident] = useState<any>(null);
  const [selectedPipelineRun, setSelectedPipelineRun] = useState<any>(null);

  // Prompt template states
  const [currentPromptKey, setCurrentPromptKey] = useState('pest_dosagem_v1');
  const [editingPrompt, setEditingPrompt] = useState('');
  const [editingPromptVer, setEditingPromptVer] = useState('');

  // Sandbox testing variables
  const [branchInput, setBranchInput] = useState('main');
  const [selectedTargetEnv, setSelectedTargetEnv] = useState<'production' | 'staging' | 'development'>('production');
  const [customIndexName, setCustomIndexName] = useState('geographic_coordinates_composite_key');
  const [errorMsgInput, setErrorMsgInput] = useState('');

  // Loaded setup template preview init
  useEffect(() => {
    const pm = getPromptTemplate(currentPromptKey);
    if (pm) {
      setEditingPrompt(pm.prompt);
      setEditingPromptVer(pm.version);
    }
  }, [currentPromptKey, getPromptTemplate]);

  // Set default selected pipeline run if available
  useEffect(() => {
    if (pipelineRuns.length > 0 && !selectedPipelineRun) {
      setSelectedPipelineRun(pipelineRuns[0]);
    } else if (pipelineRuns.length > 0) {
      const current = pipelineRuns.find(r => r.id === selectedPipelineRun.id);
      if (current) setSelectedPipelineRun(current);
    }
  }, [pipelineRuns, selectedPipelineRun]);

  const handleSimulateError = () => {
    if (!errorMsgInput.trim()) {
      toast.error('Informe a mensagem de erro para disparar o rastreio.');
      return;
    }
    triggerErrorSimulation(errorMsgInput.trim(), 'error');
    toast.warning('Exceção capturada e registrada nos logs de telemetria!');
    setErrorMsgInput('');
  };

  const handleManualRollback = (id: string) => {
    const res = executeImmediateRollback(id, 'gabriel.max@ddsulf.com.br');
    if (res.success) {
      toast.success(res.message);
    } else {
      toast.error(res.message);
    }
  };

  const handlePromptsDeployment = () => {
    savePromptTemplate(currentPromptKey, editingPromptVer, editingPrompt, 'gabriel.max@ddsulf.com.br');
    toast.success(`Prompt "${currentPromptKey}" atualizado com sucesso para ${editingPromptVer}! Novas chamadas ao Gemini usarão este template.`);
  };

  const forcePWAPurge = () => {
    toast.success('Processo PWA cache-invalidation disparado! Novo ServiceWorker se registrará no próximo ciclo.');
  };

  const handleTriggerPipeline = () => {
    const run = triggerValidationRun(branchInput.trim() || 'main', selectedTargetEnv);
    setSelectedPipelineRun(run);
    toast.success(`Esteira de integração iniciada sob ID ${run.id}!`);
  };

  const handleAdvanceStepSimulated = () => {
    if (!selectedPipelineRun) return;
    const res = advanceValidationStep(selectedPipelineRun.id);
    if (res) {
      if (res.status === 'success') {
        toast.success(`Esteira ${res.id} completada com aprovação total de SecOps!`);
      } else {
        toast.info(`Passo da esteira concluído com êxito.`);
      }
    }
  };

  const handleProvisionIndex = () => {
    if (!customIndexName.trim()) {
      toast.error('Informe o identificador do índice Firestore.');
      return;
    }
    createCompositeIndex(customIndexName.trim());
    toast.success(`Iniciada a provisão do índice composto no cluster multi-região ${customIndexName}!`);
  };

  const handleScaleResource = (id: string, dir: 'scale_up' | 'scale_down') => {
    scaleResource(id, dir);
    toast.success(`Operação de escalabilidade horizontal concluída para o nó de infraestrutura.`);
  };

  const handleRunWorkflow = (id: string) => {
    const outcome = executeTriggerWorkflowManually(id);
    if (outcome.success) {
      toast.success(outcome.message);
    } else {
      toast.error(outcome.message);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-600">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] bg-indigo-50 px-2.5 py-1 rounded-md font-mono">
            DDSulf DevOps Integration & Event Platform
          </span>
          <h2 className="text-3xl font-black text-black">Painel de Operações e Produção</h2>
          <p className="text-gray-500 text-sm max-w-3xl">
            Cockpit definitivo de orquestração de entregas, com canários de tráfego, automações de contenção, esteiras automatizadas e auditoria forense multi-tenant.
          </p>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={forcePWAPurge}
            className="bg-black hover:bg-zinc-950 text-white font-bold text-xs uppercase tracking-wider h-11 px-5 rounded-xl flex items-center gap-2 shrink-0 shadow-md transition-all active:scale-95"
          >
            <RotateCcw className="size-3.5" /> Forçar Invalidação PWA
          </Button>
        </div>
      </div>

      {/* Grid status rows */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Média Latência API</span>
            <p className="text-2xl font-black text-black">{avgLatency}ms</p>
          </div>
          <Gauge className="size-8 text-indigo-500 shrink-0" />
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Acurácia PWA Cache</span>
            <p className="text-2xl font-black text-emerald-600">
              {metrics.length > 0 ? metrics[metrics.length - 1].pwaCacheHits : 98}%
            </p>
          </div>
          <Activity className="size-8 text-emerald-500 shrink-0" />
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Integridade de Infra</span>
            <p className={`text-2xl font-black ${systemIntegrity.healthy ? 'text-emerald-700' : 'text-amber-600'}`}>
              {systemIntegrity.healthy ? '100% Saudável' : 'Degradação Confeccionada'}
            </p>
          </div>
          <Server className="size-8 text-indigo-600 shrink-0" />
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Eventos Ativos Sentry</span>
            <p className="text-2xl font-black text-red-600">
              {incidents.filter(i => !i.resolved).length}
            </p>
          </div>
          <Flame className="size-8 text-red-500 shrink-0 animate-pulse" />
        </div>

      </div>

      {/* Tabs navigation options */}
      <div className="flex border-b border-gray-200 gap-1 pb-1 overflow-x-auto scroller-hidden">
        <button 
          onClick={() => setActiveTab('kpi')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'kpi' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Monitor de Métricas
        </button>
        <button 
          onClick={() => setActiveTab('pipeline')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'pipeline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Esteiras de Integração ({pipelineRuns.filter(r => r.status === 'running').length} ativas)
        </button>
        <button 
          onClick={() => setActiveTab('rollout')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'rollout' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Lançamentos Canários & Rollback
        </button>
        <button 
          onClick={() => setActiveTab('infrastructure')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'infrastructure' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Infraestrutura & No-Code Indexes
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'security' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Automação & Forense SecOps
        </button>
        <button 
          onClick={() => setActiveTab('readiness')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap relative ${
            activeTab === 'readiness' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Maturidade & Checklist
          {!isReadyForProductionLaunch && (
            <span className="absolute top-1 right-1 size-2 bg-amber-500 rounded-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('prompts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'prompts' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Prompt-Ops
        </button>
        <button 
          onClick={() => setActiveTab('handbook')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            activeTab === 'handbook' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Manual de Engenharia
        </button>
      </div>

      {/* KPI & telemetry tab view */}
      {activeTab === 'kpi' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-8 space-y-6">
            <PremiumGlassCard className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#0C172E] flex items-center gap-1.5 font-mono">
                  <Signal className="size-4 text-emerald-500" /> Latência API Real-Time Stream (Live Jitter)
                </h4>
              </div>

              <div className="h-44 flex items-end gap-1 pt-4 pb-2 border-b border-gray-100 bg-gray-50/50 p-3 rounded-2xl">
                {metrics.map((m, idx) => {
                  const percent = Math.min(100, Math.max(10, (m.apiLatencyMs / 250) * 100));
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer">
                      <span className="text-[8px] font-mono text-gray-400 opacity-0 group-hover:opacity-100 transition-all font-bold">
                        {m.apiLatencyMs}ms
                      </span>
                      <div 
                        className={`w-full rounded-t-md transition-all ${
                          m.apiLatencyMs > 120 ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ height: `${percent}%` }}
                      />
                      <span className="text-[6px] text-gray-400 mt-1 uppercase">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }).split(':')[2]}s
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-xs text-gray-400 font-bold font-mono">
                <span>Leitura API: {metrics.length > 0 ? metrics[metrics.length - 1].firestoreReads : 0} ops/m</span>
                <span>Fila e Cache Sync s-worker: {metrics.length > 0 ? metrics[metrics.length - 1].pwaSyncQueueSize : 0} itens pendentes</span>
              </div>
            </PremiumGlassCard>

            <PremiumGlassCard className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <Network className="size-4 text-indigo-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-black font-mono">Conexões Sockets de Eventos Ativas</h4>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {channels.map((chan) => (
                  <div key={chan.name} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-xs truncate mr-1 font-sans">{chan.name}</span>
                      <span className="size-2 bg-emerald-500 rounded-full shrink-0" />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                      <span>{chan.type}</span>
                      <span className="font-bold text-emerald-700 font-mono">{chan.pingMs}ms latency</span>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </div>

          <div className="md:col-span-4 space-y-6">
            <PremiumGlassCard className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <Cpu className="size-4 text-indigo-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-black font-mono">Lighthouse Core Performance</h4>
              </div>

              <div className="space-y-3">
                {benchmarks.map((b) => (
                  <div key={b.metric} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-gray-600">{b.metric}</span>
                      <span className="font-mono text-emerald-600 font-bold">{b.value}</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full w-[94%]" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-zinc-950 text-emerald-400 p-3.5 rounded-xl font-mono text-[10px] text-center font-bold uppercase tracking-wider">
                👑 Rating: {engineRating}
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

      {/* EASTER / PIPELINES VIEW */}
      {activeTab === 'pipeline' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid gap-6 md:grid-cols-12">
            
            <div className="md:col-span-4 space-y-4">
              <PremiumGlassCard className="space-y-4">
                <div className="flex items-center gap-2 border-b border-gray-100 pb-1.5">
                  <Play className="size-4 text-indigo-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-black font-mono">Novo Build de Validação</h4>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Branch Repositório</label>
                    <input 
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono text-xs"
                      value={branchInput}
                      onChange={(e) => setBranchInput(e.target.value)}
                      placeholder="ex: main"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Ambiente Alvo</label>
                    <select
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-bold text-xs"
                      value={selectedTargetEnv}
                      onChange={(e: any) => setSelectedTargetEnv(e.target.value)}
                    >
                      <option value="production">Production Global</option>
                      <option value="staging">Staging Sandbox</option>
                      <option value="development">Development Cluster</option>
                    </select>
                  </div>

                  <Button
                    onClick={handleTriggerPipeline}
                    className="w-full h-10 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Disparar Pipeline Run
                  </Button>
                </div>
              </PremiumGlassCard>

              <PremiumGlassCard className="space-y-3">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest block">Lista de Execuções</span>
                <div className="space-y-2">
                  {pipelineRuns.map(run => (
                    <div 
                      key={run.id}
                      onClick={() => setSelectedPipelineRun(run)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex justify-between items-center ${
                        selectedPipelineRun?.id === run.id ? 'bg-indigo-50/50 border-indigo-200' : 'bg-gray-50/20 border-gray-100'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <p className="font-bold text-black font-mono">{run.id} ({run.branch})</p>
                        <p className="text-[10px] text-gray-400 capitalize">{run.environment} • {new Date(run.startedAt).toLocaleTimeString()}</p>
                      </div>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                        run.status === 'success' ? 'bg-emerald-100 text-emerald-800' :
                        run.status === 'failed' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                      }`}>
                        {run.status}
                      </span>
                    </div>
                  ))}
                </div>
              </PremiumGlassCard>
            </div>

            <div className="md:col-span-8 flex flex-col">
              {selectedPipelineRun ? (
                <PremiumGlassCard className="space-y-4 flex-1">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold font-mono text-gray-400 uppercase">Monitor da Esteira Ativa</span>
                      <h4 className="text-sm font-black text-black">
                        Run: {selectedPipelineRun.id} — Branch: <span className="font-mono">{selectedPipelineRun.branch}</span>
                      </h4>
                    </div>

                    {selectedPipelineRun.status === 'running' && (
                      <Button
                        onClick={handleAdvanceStepSimulated}
                        className="h-8 bg-black hover:bg-neutral-900 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg flex items-center gap-1"
                      >
                        <Play className="size-3" /> Avançar Passo do Build
                      </Button>
                    )}
                  </div>

                  <div className="space-y-3">
                    {selectedPipelineRun.steps.map((step: any) => (
                      <div key={step.id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-black text-xs font-sans">{step.name}</span>
                          <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                            step.status === 'passed' ? 'bg-emerald-100 text-emerald-800' :
                            step.status === 'failed' ? 'bg-rose-100 text-rose-800' :
                            step.status === 'running' ? 'bg-amber-100 text-amber-800 animate-pulse' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {step.status}
                          </span>
                        </div>

                        {/* Logs */}
                        <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 font-mono text-[10px] text-zinc-300 space-y-0.5 whitespace-pre-wrap leading-normal">
                          {step.logs.map((log: string, lIdx: number) => (
                            <p key={lIdx}>
                              <span className="text-indigo-400 select-none mr-2 font-bold">$</span>
                              {log}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </PremiumGlassCard>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-3xl h-full text-center text-gray-400">
                  <Terminal className="size-10 mb-2 text-gray-300" />
                  <p className="text-xs font-bold uppercase">Nenhuma esteira selecionada</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ROLLOUT & CANARY GATE */}
      {activeTab === 'rollout' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <PremiumGlassCard className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-100 pb-3">
              <div className="space-y-0.5">
                <h4 className="text-xs font-black uppercase tracking-widest text-black font-mono">
                  Gargalos de Prod & Desvios de Tráfego Canário
                </h4>
                <p className="text-[10px] text-gray-400 font-medium">Controle de escalonamento progressivo de rede e mitigação de picos de erros.</p>
              </div>
              
              <Button
                onClick={() => {
                  registerNewDeployment('v2.5.0-alpha.4', 'production', 'isolated');
                  toast.success('Novo deploy com peso inicial de 10% registrado para o cluster de produção.');
                }}
                className="bg-black text-white h-9 px-4 text-xs font-bold uppercase tracking-wider rounded-xl hover:opacity-90 active:scale-95"
              >
                Inaugurar Versão de Prod
              </Button>
            </div>

            <div className="space-y-4">
              {govHistory.filter(d => d.environment === 'production').map(dep => {
                const isRolleable = dep.status === 'healthy';
                return (
                  <div key={dep.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-black">{dep.version}</span>
                          <span className={`text-[9px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                            dep.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {dep.status}
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-800 font-mono font-bold px-1.5 py-0.5 rounded">
                            Isolamento: {dep.tenantIsolationLevel}
                          </span>
                        </div>
                        <div className="flex flex-wrap text-[11px] text-gray-400 gap-x-2.5">
                          <span>Commit Sha: <strong className="font-mono text-zinc-700">{dep.commitSha}</strong></span>
                          <span>•</span>
                          <span>Criado por: {dep.triggeredBy}</span>
                          <span>•</span>
                          <span>Build Time: {dep.buildDurationMs}ms</span>
                        </div>
                      </div>

                      {isRolleable && (
                        <Button
                          disabled={isRollbackProcessing}
                          onClick={() => handleManualRollback(dep.id)}
                          className="h-8 bg-red-600 hover:bg-red-500 text-white rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shrink-0 px-3 self-stretch sm:self-auto justify-center shadow-sm"
                        >
                          <RotateCcw className="size-3" /> Rollback Imediato
                        </Button>
                      )}
                    </div>

                    {isRolleable && dep.canaryWeight !== undefined && (
                      <div className="p-3 bg-white border border-gray-100 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs font-mono">
                          <span className="font-bold text-gray-500 font-sans">Canary Progressive Weights:</span>
                          <span className="text-indigo-600 font-extrabold">{dep.canaryWeight}% Tráfego</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <input 
                            type="range"
                            min="0"
                            max="100"
                            step="10"
                            value={dep.canaryWeight}
                            onChange={(e) => changeCanaryWeight(dep.id, parseInt(e.target.value))}
                            className="flex-1 accent-indigo-600 cursor-pointer"
                          />
                          <span className="text-[9px] font-bold text-gray-400 uppercase font-mono">Slider Controle</span>
                        </div>

                        <p className="text-[10px] text-gray-400 font-medium leading-none">
                          *A alteração de tráfego afeta em tempo real as consultas do gateway para os inquilinos no sul do Brasil.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </PremiumGlassCard>
        </div>
      )}

      {/* CLOUD INFRASTRUCTURE */}
      {activeTab === 'infrastructure' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid gap-6 md:grid-cols-12">
            
            <div className="md:col-span-8 space-y-4">
              <PremiumGlassCard className="space-y-4">
                <div className="border-b border-gray-100 pb-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-black font-mono flex items-center gap-1.5">
                    <Database className="size-4 text-indigo-500" /> Nós de Infraestrutura de Nuvem Autônomos
                  </h4>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {resources.map(res => (
                    <div key={res.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-extrabold text-xs text-black leading-tight truncate mr-1">{res.name}</span>
                          <span className={`text-[8px] font-mono font-bold px-1 py-0.5 rounded uppercase shrink-0 ${
                            res.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800 animate-pulse'
                          }`}>
                            {res.status}
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-400 font-sans leading-relaxed">
                          <p>Region: <span className="font-mono text-zinc-700">{res.region}</span></p>
                          <p>Tier Classification: <span className="text-indigo-600 font-mono font-bold">{res.tier}</span></p>
                        </div>
                      </div>

                      <div className="space-y-1.5 bg-white border border-gray-100 p-2.5 rounded-xl">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-gray-400">Current Load utilization:</span>
                          <span className="font-bold text-gray-700">{res.currentLoad}%</span>
                        </div>
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              res.currentLoad > 75 ? 'bg-amber-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${res.currentLoad}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-1.5 self-end">
                        <Button
                          onClick={() => handleScaleResource(res.id, 'scale_up')}
                          className="h-6 text-[9px] bg-zinc-950 text-white rounded font-bold font-sans uppercase px-2 hover:opacity-95"
                        >
                          Scale Up Capacity
                        </Button>
                        <Button
                          onClick={() => handleScaleResource(res.id, 'scale_down')}
                          className="h-6 text-[9px] bg-zinc-100 text-zinc-900 border border-slate-200 rounded font-semibold font-sans uppercase px-2 hover:text-black"
                        >
                          Scale Down
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </PremiumGlassCard>
            </div>

            <div className="md:col-span-4">
              <PremiumGlassCard className="space-y-4">
                <div className="border-b border-gray-100 pb-1.5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#B45309] font-mono flex items-center gap-1">
                    <Wrench className="size-4" /> Provisionar Índices Firestore
                  </h4>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <p className="text-gray-400 leading-relaxed font-medium">
                    Provedores de geo-referenciamento para faturamento exigem chaves compostas redundantes no sul de alta acurácia.
                  </p>

                  <div>
                    <label className="block text-[10px] text-gray-400 uppercase font-bold mb-1">Nome Identificador Índice Composto</label>
                    <input 
                      type="text"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 font-mono text-xs text-zinc-800"
                      value={customIndexName}
                      onChange={(e) => setCustomIndexName(e.target.value)}
                      placeholder="ex: geographic_coordinates_composite_key"
                    />
                  </div>

                  <Button
                    onClick={handleProvisionIndex}
                    className="w-full h-10 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:opacity-95"
                  >
                    Provisionar composto Firestore
                  </Button>
                </div>
              </PremiumGlassCard>
            </div>

          </div>
        </div>
      )}

      {/* FORENSE SEC OPS TRACKS */}
      {activeTab === 'security' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-4 space-y-6">
            <PremiumGlassCard className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <Flame className="size-4 text-red-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-black font-mono">Disparos de Alerta Sentry</h4>
              </div>

              <div className="space-y-3 text-xs leading-normal font-sans">
                <p className="text-gray-400 font-medium">Capture exceções críticas e logs de crash e simule tratamento offline do Service Worker.</p>
                <input 
                  type="text" 
                  value={errorMsgInput}
                  onChange={(e) => setErrorMsgInput(e.target.value)}
                  placeholder="ex: TypeError: Cannot read properties of undefined..."
                  className="w-full text-xs p-2.5 bg-gray-50 border border-gray-150 rounded-xl font-mono text-zinc-800"
                />
                <Button 
                  onClick={handleSimulateError}
                  className="w-full h-9 bg-red-600 hover:bg-red-500 text-white font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all"
                >
                  Disparar Sentry Crash
                </Button>
              </div>
            </PremiumGlassCard>

            <PremiumGlassCard className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <Settings className="size-4 text-indigo-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-black font-mono">Autocuras e Triggers de Produção</h4>
              </div>

              <div className="space-y-3">
                {triggers.map(trig => (
                  <div key={trig.id} className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col gap-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-extrabold text-xs text-black">{trig.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono text-indigo-600 uppercase font-bold">{trig.frequency} • {trig.type}</p>
                      </div>
                      <button
                        onClick={() => toggleAutomationTrigger(trig.id)}
                        className={`size-8 rounded-full flex items-center justify-center border font-mono font-bold text-[10px] ${
                          trig.active ? 'bg-indigo-600 border-indigo-700 text-white' : 'bg-gray-100 border-gray-200 text-gray-500'
                        }`}
                      >
                        {trig.active ? 'ON' : 'OFF'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-normal font-medium">{trig.description}</p>
                    <button
                      onClick={() => handleRunWorkflow(trig.id)}
                      className="text-[9px] bg-zinc-950 text-white rounded py-1 px-1.5 font-bold uppercase hover:bg-neutral-900"
                    >
                      Forçar execução
                    </button>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </div>

          <div className="md:col-span-8 flex flex-col space-y-6">
            <PremiumGlassCard className="space-y-4 flex-1">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-[#991B1B] flex items-center gap-1.5 font-mono">
                  <Fingerprint className="size-4" /> SecOps Auditoria Forense e Proteção Multi-Inquilinos
                </h4>
              </div>

              <div className="space-y-2.5">
                {securityLogs.map(log => (
                  <div key={log.id} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-xs space-y-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                      <div className="flex items-center gap-2 font-mono">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          log.status === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {log.status.toUpperCase()}
                        </span>
                        <span className="font-bold text-gray-800">{log.module}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono font-bold">{new Date(log.timestamp).toLocaleTimeString()} • IP: {log.ipAddress}</span>
                    </div>

                    <p className="font-bold text-zinc-900 font-sans">{log.action}</p>
                    <p className="text-[11px] text-gray-500 rounded font-medium">{log.details}</p>
                    <p className="text-[9px] text-[#4F46E5] font-mono font-bold uppercase tracking-wider mt-1 leading-none">Actor de rede: {log.actor}</p>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

      {/* READINESS & CHECKLIST TAB */}
      {activeTab === 'readiness' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <PremiumGlassCard className="space-y-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest">Controle de Governança de Lançamentos</span>
                <h4 className="text-lg font-black text-black flex items-center gap-1.5">
                  <ShieldCheck className="size-5 text-indigo-500" /> DDSulf Launch Certification Board (Pre-deployment policies)
                </h4>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-xl flex items-center gap-1.5 ${
                  isReadyForProductionLaunch ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                }`}>
                  <CircleCheckStatus value={isReadyForProductionLaunch} />
                  {isReadyForProductionLaunch ? 'Liberado para Produção' : 'Implantamento Retido'}
                </span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {policies.map(policy => (
                <div key={policy.code} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-3 justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-mono text-zinc-400 font-bold">{policy.code}</span>
                        <h5 className="font-extrabold text-xs text-black">{policy.title}</h5>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-normal font-semibold">{policy.description}</p>
                    </div>

                    <div className="bg-white border border-gray-100 p-2 rounded-xl text-[10px] font-mono text-gray-500 space-y-1">
                      <p className="font-bold text-indigo-500 uppercase">Critérios Obrigatórios:</p>
                      {policy.requirements.map((req, rIdx) => (
                        <p key={rIdx} className="flex items-center gap-1">
                          <span className="size-1 bg-zinc-400 rounded-full shrink-0" />
                          {req}
                        </p>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      togglePolicyCertification(policy.code);
                      if (!policy.certified) {
                        toast.success(`Política ${policy.code} devidamente auditada e autorizada.`);
                      }
                    }}
                    className={`size-6 rounded border flex items-center justify-center shrink-0 transition-all ${
                      policy.certified ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-white border-zinc-200'
                    }`}
                  >
                    {policy.certified && <CheckCircle className="size-4 shrink-0" />}
                  </button>
                </div>
              ))}
            </div>

            {!isReadyForProductionLaunch && (
              <div className="p-4 bg-amber-50 border border-amber-100 text-amber-900 text-xs rounded-2xl flex items-start gap-2 leading-relaxed">
                <Info className="size-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="font-semibold">
                  <p className="font-black uppercase tracking-wider text-amber-800">ATENÇÃO: Requisito de lançamento não auditado!</p>
                  <p>Por motivos de segurança cibernética e mitigação de picos de erro, releases de produção estão retidos até o checklist acima ser 100% verificado pelo Engenheiro de Confiabilidade Responsável.</p>
                </div>
              </div>
            )}
          </PremiumGlassCard>
        </div>
      )}

      {/* PROMPTS tab with gemini prompt templates release tracks */}
      {activeTab === 'prompts' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-12">
            <PremiumGlassCard className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-black flex items-center gap-1.5 font-mono">
                  <Sparkles className="size-4 text-indigo-500" /> Prompt-Ops: Governança & Versionamento de IA
                </h4>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                Controle o versionamento de chamadas do assistente de inteligência integrada de apoio ao controle ambiental. Implante mudanças de prompt sem tocar na esteira de produção ou reiniciar servidores.
              </p>

              <div className="grid gap-4 md:grid-cols-12">
                <div className="md:col-span-4 space-y-2">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">Selecione o Modelo Regulado</span>
                  <select 
                    value={currentPromptKey} 
                    onChange={(e) => setCurrentPromptKey(e.target.value)}
                    className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-bold font-sans"
                  >
                    <option value="pest_dosagem_v1">Recomendações Químicas Ambientais (v1.4.2)</option>
                  </select>

                  <div className="p-3 bg-zinc-950 text-zinc-400 rounded-xl space-y-1.5 text-[11px] font-mono border border-zinc-900">
                    <p className="font-bold text-indigo-400 border-b border-zinc-800 pb-1">METADADOS DE IA</p>
                    <p>Alias: <span className="text-white">gemini-2.5-flash</span></p>
                    <p>Limitação MaxTokens: <span className="text-white">2048</span></p>
                    <p>Explicação de rastro: <span className="text-white">Sim (Markdown)</span></p>
                  </div>
                </div>

                <div className="md:col-span-8 space-y-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Tag Versão Prompt</span>
                      <input 
                        type="text" 
                        value={editingPromptVer}
                        onChange={(e) => setEditingPromptVer(e.target.value)}
                        className="w-full text-xs p-2.5 bg-gray-50 border border-gray-200 rounded-xl font-mono text-zinc-850"
                        placeholder="Ex: v1.4.3"
                      />
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider block mb-1">Prompt Engenharia System Instructions</span>
                    <textarea 
                      rows={5}
                      value={editingPrompt}
                      onChange={(e) => setEditingPrompt(e.target.value)}
                      className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl font-mono leading-relaxed text-zinc-800"
                    />
                  </div>

                  <Button 
                    onClick={handlePromptsDeployment}
                    className="w-full h-11 bg-black text-white hover:bg-neutral-950 rounded-xl font-bold uppercase text-xs tracking-wider transition-all"
                  >
                    Implantar Versão de Prompt na Borda
                  </Button>
                </div>
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

      {/* CLIs HANDBOOK */}
      {activeTab === 'handbook' && (
        <div className="animate-in fade-in duration-350">
          <PremiumGlassCard className="bg-zinc-950 text-zinc-300 rounded-3xl p-5 border border-zinc-900 font-mono text-xs space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3 flex-wrap gap-2">
              <span className="text-[10px] text-indigo-400 uppercase font-black tracking-widest flex items-center gap-1.5 font-mono">
                <Terminal className="size-4 animate-pulse" /> shell-terminal: cat /src/devops/handbook/PRODUCTION_ENGINEERING.md
              </span>
              <span className="text-[8px] text-zinc-500 font-mono py-0.5 px-2 bg-zinc-900 rounded font-bold uppercase">READ-ONLY STREAM</span>
            </div>
            
            <div className="max-h-[500px] overflow-y-auto space-y-4 text-zinc-300 leading-relaxed text-[11px] pr-2">
              <p className="text-white font-extrabold text-sm border-b border-zinc-900 pb-1"># DDSulf Enterprise Production Engineering Handbook</p>
              <p>Version: <span className="text-indigo-400">v1.0.0-governed</span> • Status: <span className="text-emerald-400">BOARD-APPROVED</span></p>

              <div>
                <p className="text-indigo-300 font-bold text-[12px] mt-4">## 1. DevOps Governance & Architecture</p>
                <p className="mt-1">DDSulf incorporates an event-driven, multi-tenant sandbox methodology to protect the production layer against logical state corruption, unauthorized privilege escalations, and cross-organization leaks. All resources scale automatically in tier-based clusters.</p>
              </div>

              <div>
                <p className="text-indigo-300 font-bold text-[12px] mt-4">## 2. Release Standards & Compliance Semantic Gating</p>
                <p className="mt-1">No code commit enters production branches without passing through the complete Integration Pipeline. All modules must specify topo level named variables and skip any destructive destructuring imports.</p>
              </div>

              <div>
                <p className="text-indigo-300 font-bold text-[12px] mt-4">## 3. Web & Cross-Tenant Deployment Policies</p>
                <p className="mt-1">Deployments are executed under progressive canary fractions starting with 10% routing bounds to mitigate risk, progressively scaling to full production once latency stays beneath 120ms.</p>
              </div>

              <div>
                <p className="text-indigo-300 font-bold text-[12px] mt-4">## 4. Operational Troubleshooting & Emergency Fallback</p>
                <p className="mt-1">In event of anomaly detection, immediately de-route edge traffic to predecessor healthy bundles, invalidating local browser service workers and forcing update purging process.</p>
              </div>
            </div>
          </PremiumGlassCard>
        </div>
      )}

    </div>
  );
}

// Inline Sub-components
function CircleCheckStatus({ value }: { value: boolean }) {
  if (value) {
    return <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />;
  }
  return <AlertOctagon className="size-3.5 text-amber-700 shrink-0" />;
}

export default DevOpsObservabilityHub;
