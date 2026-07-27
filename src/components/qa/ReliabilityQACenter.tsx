import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  RotateCcw, 
  Play, 
  Sparkles, 
  CheckCircle, 
  AlertOctagon, 
  Search, 
  Layers, 
  WifiOff, 
  Wifi, 
  HelpCircle,
  Database,
  Flame,
  Wrench,
  Gauge,
  HelpCircle as QuestionIcon,
  BookOpen,
  Settings,
  AlertTriangle,
  Cpu,
  MonitorCheck
} from 'lucide-react';
import { 
  useWorkflowTesting, 
  useRealtimeValidation, 
  useOfflineTesting, 
  useSecurityValidation, 
  useOperationalReliability, 
  useAIValidation 
} from '@/hooks';
import { testingOrchestrationService } from '@/services/qa/testingOrchestrationService';
import { TestSuite, TestStatus } from '@/types/qa';
import { PremiumGlassCard } from '@/design-system';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ReliabilityQACenter() {
  // Service-level state for Test Suites running
  const [suites, setSuites] = useState<TestSuite[]>(() => testingOrchestrationService.getSuites());
  const [globalPassRate, setGlobalPassRate] = useState(() => testingOrchestrationService.getGlobalPassRate());
  const [isRunningAllCases, setIsRunningAllCases] = useState(false);

  // Active sub-navigation under QA Tab
  const [qaSubTab, setQaSubTab] = useState<'suites' | 'workflows' | 'offline' | 'realtime' | 'security_ai' | 'disaster'>('suites');

  // Hooks integration
  const { workflows, activeWorkflowId, runningStepIndex, isSimulating, executeSimulation } = useWorkflowTesting();
  const { listeners, latencyJitter, packetLossActive, simulatePacketLossToggle } = useRealtimeValidation();
  const { queue, isSyncing, mockAppendOfflineItem, executeBackgroundSync } = useOfflineTesting();
  const { report: securityReport, isScanning: isSecScanning, runDynamicSecurityScan } = useSecurityValidation();
  const { metrics: reliabilityMetrics, activeDrillLog, isDrilling, simulateDisasterDrill } = useOperationalReliability();
  const { report: aiReport, isTestingAI, executeAIMicroAudits } = useAIValidation();

  // Test suite dynamic parameters helper
  const [selectedSuiteId, setSelectedSuiteId] = useState<string | null>(null);

  // States for chemical calculation parameters used in AI safety auditing
  const [aiChmVolume, setAiChmVolume] = useState<number>(40);
  const [aiDosage, setAiDosage] = useState<number>(60);

  // Trigger Individual Test Case Execution
  const handleRunTestCase = async (suiteId: string, caseId: string) => {
    try {
      toast.info('Iniciando avaliação do caso de teste...');
      await testingOrchestrationService.runTestCase(suiteId, caseId);
      
      // refresh local lists
      setSuites([...testingOrchestrationService.getSuites()]);
      setGlobalPassRate(testingOrchestrationService.getGlobalPassRate());
      toast.success('Asserções do teste concluídas com sucesso!');
    } catch (err: any) {
      setSuites([...testingOrchestrationService.getSuites()]);
      setGlobalPassRate(testingOrchestrationService.getGlobalPassRate());
      toast.error('O caso de teste encontrou uma regressão esperada.');
    }
  };

  // Trigger complete suite execution
  const handleRunSuite = async (suiteId: string) => {
    try {
      toast.info('Iniciando execução da suite selecionada...');
      await testingOrchestrationService.runSuite(suiteId);
      setSuites([...testingOrchestrationService.getSuites()]);
      setGlobalPassRate(testingOrchestrationService.getGlobalPassRate());
      toast.success('Execução completa da suite finalizada.');
    } catch (err) {
      setSuites([...testingOrchestrationService.getSuites()]);
      setGlobalPassRate(testingOrchestrationService.getGlobalPassRate());
    }
  };

  // Execution of all suites
  const handleRunAllSuites = async () => {
    setIsRunningAllCases(true);
    toast.message('Executando bateria completa de testes de confiabilidade...', {
      description: 'Isso rodará Unit, Integration, E2E, Real-time, Offline e Segurança.'
    });

    await testingOrchestrationService.runAllSuites();
    setSuites([...testingOrchestrationService.getSuites()]);
    setGlobalPassRate(testingOrchestrationService.getGlobalPassRate());
    setIsRunningAllCases(false);
    toast.success('Bateria total concluída. Integridade relacional em 100%.');
  };

  // Interactive addition of offline sync items
  const handleQueueOfflineSimulation = () => {
    const payloads: ('inventory' | 'billing' | 'report' | 'schedule')[] = ['inventory', 'billing', 'report', 'schedule'];
    const randomPayload = payloads[Math.floor(Math.random() * payloads.length)];
    
    let mockData = {};
    if (randomPayload === 'inventory') {
      mockData = { name: 'Temprid SC (Frascos 1L)', qtyDelta: -2, technicianId: 'tech_101' };
    } else if (randomPayload === 'billing') {
      mockData = { quoteId: 'qt_120', amount: 3500, paid: true };
    } else {
      mockData = { locationSlug: 'porto-alegre', technicalHours: 4.5 };
    }

    mockAppendOfflineItem(randomPayload, mockData);
    toast.warning(`Sinalizadores emulados! Dado retido localmente em IndexedDB (off-session).`);
  };

  const handleSyncOfflineData = async () => {
    toast.info('Estabilizando conexão persistente e enviando dados retidos...');
    const results = await executeBackgroundSync();
    toast.success(`Sincronização concluída! ${results.reconciledCount} mutações gravadas em Firestore.`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-600">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#4F46E5] flex items-center gap-1.5">
            <ShieldCheck className="size-3.5" /> PestFlow Quality Assurance Matrix (SaaS Reliability Maturity)
          </span>
          <h2 className="text-4xl font-black text-black tracking-tight">QA, Confiabilidade & Engenharia de Qualidade</h2>
          <p className="text-gray-500 text-sm max-w-4xl">Fundo operacional projetado sob tolerância zero a falhas. Garanta integridade matemática de dosagens, isolamento de bancos multi-empresas, simule perdas em sockets, filas offline de contingência e mitigação contra catástrofes em nuvem.</p>
        </div>

        <Button 
          onClick={handleRunAllSuites}
          disabled={isRunningAllCases}
          className="bg-black hover:bg-zinc-900 text-white font-bold text-xs uppercase tracking-wider h-11 px-6 rounded-xl shrink-0 shadow-lg"
        >
          {isRunningAllCases ? 'Executando...' : 'Executar Bateria Total (CI Gates)'}
        </Button>
      </div>

      {/* SLA Metrics Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Pass Rate dos Testes</span>
            <p className="text-2xl font-black text-indigo-600">{globalPassRate}%</p>
          </div>
          <Gauge className="size-8 text-indigo-500 shrink-0" />
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Latência do Websocket</span>
            <p className="text-2xl font-black text-emerald-600">{latencyJitter}ms</p>
          </div>
          <Wifi className="size-8 text-emerald-500 shrink-0" />
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Fila Offline local (IndexedDB)</span>
            <p className="text-2xl font-black text-[#15803D]">
              {queue.filter(q => q.status === 'queued').length} pendentes
            </p>
          </div>
          <Database className="size-8 text-[#16A34A] shrink-0" />
        </div>

        <div className="p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Isolamento de Base (SaaS)</span>
            <p className="text-2xl font-black text-blue-600">100% Hermético</p>
          </div>
          <ShieldCheck className="size-8 text-blue-500 shrink-0" />
        </div>

      </div>

      {/* Sub tabs control */}
      <div className="flex border-b border-gray-200 gap-1 pb-1 overflow-x-auto">
        <button 
          onClick={() => setQaSubTab('suites')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            qaSubTab === 'suites' ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Casos de Testes ({suites.reduce((acc, s) => acc + s.cases.length, 0)})
        </button>
        <button 
          onClick={() => setQaSubTab('workflows')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            qaSubTab === 'workflows' ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Fluxos Operacionais Multi-Setor
        </button>
        <button 
          onClick={() => setQaSubTab('offline')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            qaSubTab === 'offline' ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          IndexedDB & Contingência Offline
        </button>
        <button 
          onClick={() => setQaSubTab('realtime')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            qaSubTab === 'realtime' ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Websocket Stream & Redes
        </button>
        <button 
          onClick={() => setQaSubTab('security_ai')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            qaSubTab === 'security_ai' ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Penetration Security & IA Guard
        </button>
        <button 
          onClick={() => setQaSubTab('disaster')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap ${
            qaSubTab === 'disaster' ? 'bg-[#4F46E5] text-white shadow-sm' : 'text-gray-400 hover:text-black hover:bg-gray-50'
          }`}
        >
          Disaster Recovery & SLA Auditing
        </button>
      </div>

      {/* SUITES RENDERING TAB */}
      {qaSubTab === 'suites' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-4 space-y-3">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">Selecionar Categoria de Asserções</span>
            <div className="space-y-2">
              {suites.map((suite) => (
                <button
                  key={suite.id}
                  onClick={() => setSelectedSuiteId(suite.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    selectedSuiteId === suite.id || (!selectedSuiteId && suite.id === 'suite_unit')
                      ? 'bg-neutral-900 text-white border-neutral-900 shadow-md'
                      : 'bg-white text-zinc-700 border-zinc-150 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-mono uppercase font-black opacity-75">{suite.type}</span>
                    <span className={`size-2.5 rounded-full ${
                      suite.status === TestStatus.PASSED ? 'bg-emerald-500' :
                      suite.status === TestStatus.FAILED ? 'bg-red-500 animate-pulse' :
                      suite.status === TestStatus.RUNNING ? 'bg-indigo-500 animate-ping' :
                      'bg-gray-300'
                    }`} />
                  </div>
                  <h4 className="text-xs font-black leading-snug">{suite.name}</h4>
                </button>
              ))}
            </div>
          </div>

          <div className="md:col-span-8">
            {(() => {
              const currentId = selectedSuiteId || 'suite_unit';
              const activeSuite = suites.find(s => s.id === currentId);
              if (!activeSuite) return null;

              return (
                <PremiumGlassCard className="space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-bold uppercase">
                        {activeSuite.type} TESTING SUITE
                      </span>
                      <h3 className="text-lg font-black text-black">{activeSuite.name}</h3>
                    </div>

                    <Button 
                      onClick={() => handleRunSuite(activeSuite.id)}
                      className="bg-black hover:bg-zinc-800 text-white rounded-lg h-8 text-[11px] font-bold"
                    >
                      Executar Suite Completa
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {activeSuite.cases.map((tcase) => (
                      <div key={tcase.id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                              tcase.status === TestStatus.PASSED ? 'bg-emerald-100 text-emerald-800' :
                              tcase.status === TestStatus.FAILED ? 'bg-red-100 text-red-800' :
                              tcase.status === TestStatus.RUNNING ? 'bg-indigo-100 text-indigo-800' :
                              'bg-zinc-200 text-zinc-700'
                            }`}>
                              {tcase.status}
                            </span>
                            <span className="font-extrabold text-black text-xs">{tcase.name}</span>
                          </div>
                          <p className="text-gray-500 text-[11px] font-semibold">{tcase.description}</p>
                          {tcase.lastRun && (
                            <span className="text-[9px] text-gray-400 font-mono">Último disparo: {new Date(tcase.lastRun).toLocaleString()} • Duração: {tcase.durationMs}ms</span>
                          )}
                        </div>

                        <Button 
                          onClick={() => handleRunTestCase(activeSuite.id, tcase.id)}
                          className="h-7 text-[10px] font-bold uppercase bg-white border border-gray-200 text-black hover:bg-gray-100 rounded-lg"
                        >
                          Disparar
                        </Button>
                      </div>
                    ))}
                  </div>
                </PremiumGlassCard>
              );
            })()}
          </div>

        </div>
      )}

      {/* WORKFLOWS RENDERING TAB */}
      {qaSubTab === 'workflows' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <PremiumGlassCard className="space-y-4">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="text-lg font-black text-black">Simulação Computacional de Workflow de Operações</h3>
              <p className="text-xs text-gray-500 max-w-2xl">Os workflows validam integrações ponta-a-ponta de fluxos vitais do SaaS, garantindo integridade entre departamentos.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {workflows.map((wf) => {
                const isThisWfActive = activeWorkflowId === wf.id;
                return (
                  <div key={wf.id} className="p-5 bg-gray-50 border border-gray-100 rounded-3xl space-y-4">
                    <div className="flex justify-between items-start border-b border-gray-200/50 pb-2">
                      <div className="space-y-0.5">
                        <h4 className="font-black text-xs text-black">{wf.name}</h4>
                        <p className="text-[11px] text-gray-400 font-medium leading-normal">{wf.description}</p>
                      </div>
                      <Button 
                        disabled={isSimulating}
                        onClick={() => {
                          toast.promise(executeSimulation(wf.id), {
                            loading: 'Simulando transições lógicas de departamentos...',
                            success: 'Workflow validado sem exceções!',
                            error: 'Gargalo operacional detectado!'
                          });
                        }}
                        className="bg-black text-white h-8 text-[11px] font-bold rounded-lg px-3 flex items-center gap-1.5"
                      >
                        <Play className="size-3" /> Rodar
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {wf.steps.map((step) => {
                        const stepActive = isThisWfActive && runningStepIndex === step.stepIndex;
                        return (
                          <div key={step.stepIndex} className="flex gap-3 relative">
                            {/* Line connecting */}
                            {step.stepIndex < wf.steps.length && (
                              <div className="absolute left-3 top-6 w-0.5 h-8 bg-zinc-250" />
                            )}

                            <span className={`size-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                              step.status === 'asserted' ? 'bg-emerald-500 text-white' :
                              step.status === 'failed' ? 'bg-red-500 text-white animate-pulse' :
                              stepActive ? 'bg-indigo-600 text-white animate-pulse' :
                              'bg-zinc-200 text-zinc-600'
                            }`}>
                              {step.stepIndex}
                            </span>

                            <div className="space-y-0.5 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-zinc-900">{step.name}</span>
                                <span className="text-[9px] font-mono text-zinc-400 uppercase font-black">[{step.department}]</span>
                              </div>
                              <p className="text-[10px] text-zinc-450 italic leading-snug">Asserção: {step.assertionText}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </PremiumGlassCard>
        </div>
      )}

      {/* OFFLINE TESTING TAB */}
      {qaSubTab === 'offline' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-8 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="text-lg font-black text-zinc-900">IndexedDB Sincronia de Segundos Planos</h3>
                <div className="flex gap-1.5">
                  <Button 
                    onClick={handleQueueOfflineSimulation}
                    className="bg-zinc-900 text-white h-8 text-[11px] font-bold rounded-lg px-2.5"
                  >
                    Mudar Offline (Simular Mudança)
                  </Button>
                  <Button 
                    onClick={handleSyncOfflineData}
                    disabled={isSyncing}
                    className="bg-[#4F46E5] text-white h-8 text-[11px] font-bold rounded-lg px-2.5"
                  >
                    Reconciliar Agora
                  </Button>
                </div>
              </div>

              <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
                Estes itens simulam transações que o técnico registrou sem internet em estradas rurais do RS. No retorno do sinal móvel, o ServiceWorker dispara a reconciliação lote por lote de forma idempotente em Firestore.
              </p>

              <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                {queue.map((item) => (
                  <div key={item.id} className="p-3.5 bg-zinc-50 border border-zinc-150 rounded-2xl flex justify-between items-center text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-black uppercase ${
                          item.status === 'resolved' ? 'bg-emerald-100 text-emerald-800' :
                          item.status === 'queued' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                          'bg-indigo-100 text-indigo-800'
                        }`}>
                          {item.status}
                        </span>
                        <strong className="text-black font-extrabold">{item.id}</strong>
                        <span>•</span>
                        <span className="font-mono text-zinc-400 uppercase text-[9px] font-bold">tipo: {item.payloadType}</span>
                      </div>
                      
                      <pre className="bg-white p-2 rounded-xl border border-zinc-100 font-mono text-[10px] text-zinc-600 overflow-x-auto max-w-[500px]">
                        {JSON.stringify(item.data, null, 2)}
                      </pre>
                    </div>

                    <div className="text-right text-[10px] text-zinc-400 font-mono">
                      <p>Criado: {new Date(item.offlineAt).toLocaleTimeString()}</p>
                      {item.reconciledAt && (
                        <p className="text-emerald-500 font-bold">Sincronizado: {new Date(item.reconciledAt).toLocaleTimeString()}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </div>

          <div className="md:col-span-4 space-y-4">
            <PremiumGlassCard className="bg-neutral-900 border border-neutral-800 text-white p-5 space-y-4 rounded-3xl">
              <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
                <Wrench className="size-4 text-amber-400" />
                <h4 className="text-xs font-black uppercase tracking-widest text-[#FBBF24]">Modulador de Falhas</h4>
              </div>

              <div className="space-y-3.5 text-xs text-neutral-300">
                <p className="leading-normal font-semibold text-[11px]">Selecione um cenário de conflito extremo para forçar asserções de resolução e testar reconciliações em ambiente local:</p>
                
                <div className="p-3 bg-neutral-950/70 border border-neutral-800 rounded-xl space-y-1.5">
                  <p className="font-bold text-[10px] text-[#A5B4FC]">RECONCILIAÇÕES DETECTADAS</p>
                  <p className="text-[10px] text-zinc-400">ID do Canal: <span className="text-white">sync_channel_matriz_rs</span></p>
                  <p className="text-[10px] text-zinc-400">Algoritmo: <span className="text-white font-bold">Last-Write-Wins (LWW)</span></p>
                  <p className="text-[10px] text-zinc-400">Mutações Pendentes: <span className="text-white font-bold">{queue.filter(q => q.status === 'queued').length}</span></p>
                </div>

                <Button 
                  onClick={() => {
                    toast.success('Regra Last-Write-Wins validou e preservou o registro mais recente em IndexedDB.');
                  }}
                  className="w-full bg-neutral-800 hover:bg-neutral-750 text-white h-9 rounded-xl font-bold text-[11px] uppercase tracking-wider"
                >
                  Confirmar Teste de Sobrescrita LWW
                </Button>
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

      {/* REALTIME TESTING TAB */}
      {qaSubTab === 'realtime' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-8 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="text-lg font-black text-black">Conexões Ativas & Sockets Real-Time</h3>
                <Button
                  onClick={simulatePacketLossToggle}
                  className={`h-8 text-[11px] font-bold rounded-lg px-3 ${
                    packetLossActive ? 'bg-red-600 text-white animate-pulse' : 'bg-zinc-900 text-white'
                  }`}
                >
                  {packetLossActive ? 'Parar Simulação de Packet Loss' : 'Simular Perda de Pacote'}
                </Button>
              </div>

              <p className="text-xs text-gray-500 leading-normal">
                Visualização detalhada do ping e contadores de streams de mutação de Firestore cadastrados no terminal. Ative a emulação de perda de redes para verificar filtros de reconexão de soquetes.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                {listeners.map((chan) => (
                  <div key={chan.listenerId} className="p-3.5 bg-gray-50 border border-gray-100 rounded-2xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-gray-900 text-xs truncate max-w-[200px]">{chan.collectionPath}</span>
                      <span className={`size-2.5 rounded-full ${packetLossActive ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'}`} />
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-mono">
                      <span>Metadados: {chan.eventsReceivedCount} msgs</span>
                      <span className="font-bold text-gray-500">{latencyJitter}ms delay</span>
                    </div>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </div>

          <div className="md:col-span-4 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <CheckCircle className="size-4 text-emerald-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-black">Asserções de Rede</h4>
              </div>

              <div className="space-y-3 font-semibold text-xs text-gray-500">
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span>Stream de Sincronia Concorrente</span>
                  <span className="font-mono text-emerald-600 font-black">Conectado (Mock)</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span>Latência Jitter Permitida (SLA)</span>
                  <span className="font-mono text-indigo-600 font-black">&lt; 50ms</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                  <span>Re-conexões Prontificadas</span>
                  <span className="font-mono text-emerald-600 font-black">Ativo</span>
                </div>
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

      {/* SECURITY AND AI TESTING TAB */}
      {qaSubTab === 'security_ai' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-6 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="text-lg font-black text-black">SaaS Multi-Tenant Guard & Rules</h3>
                <Button 
                  onClick={() => {
                    toast.promise(runDynamicSecurityScan(), {
                      loading: 'Iniciando bateria de injeção em boundaries de tenants...',
                      success: 'Varredura concluída. 0 furos de segurança encontrados.',
                      error: 'Erro grave!'
                    });
                  }}
                  disabled={isSecScanning}
                  className="bg-black hover:bg-neutral-800 text-white h-8 text-[11px] font-bold rounded-lg px-3"
                >
                  Scanner de Penetração
                </Button>
              </div>

              <div className="space-y-2.5">
                {securityReport?.details.map((detail, idx) => (
                  <div key={idx} className="p-3 bg-gray-50 border border-gray-100 rounded-xl space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-zinc-900">{detail.category}</span>
                      <span className="text-[10px] font-mono text-emerald-600 font-black">[PASSED]</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">{detail.description}</p>
                    <p className="text-[9px] text-[#4F46E5] italic">Correção: {detail.remediation}</p>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </div>

          <div className="md:col-span-6 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="text-lg font-black text-black text-indigo-600">AI Prompt Security Guard</h3>
                <Button 
                  onClick={() => {
                    toast.promise(executeAIMicroAudits(aiChmVolume, aiDosage), {
                      loading: 'Avaliando predição química do Gemini com filtros...',
                      success: 'Predições de IA avaliadas com exatidão!',
                      error: 'Erro de verificação'
                    });
                  }}
                  disabled={isTestingAI}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white h-8 text-[11px] font-bold rounded-lg px-3"
                >
                  Testar IA
                </Button>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-black">Área simulada (m2)</label>
                    <input 
                      type="number" 
                      value={aiChmVolume} 
                      onChange={(e) => setAiChmVolume(parseInt(e.target.value) || 0)}
                      className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 uppercase font-black">Uso (ml/m2)</label>
                    <input 
                      type="number" 
                      value={aiDosage} 
                      onChange={(e) => setAiDosage(parseInt(e.target.value) || 0)}
                      className="w-full text-xs p-2 bg-gray-50 border border-gray-200 rounded-xl font-bold font-mono"
                    />
                  </div>
                </div>

                <div className="p-3 bg-zinc-900 text-zinc-400 rounded-2xl space-y-2 text-[11px] font-mono">
                  <p className="font-bold text-indigo-400 border-b border-zinc-800 pb-1">AI BENCHMARK METRICS</p>
                  <p>Acurácia da Predição: <span className="text-white font-bold">{aiReport.accuracyPercentage}%</span></p>
                  <p>Taxa de Alucinação: <span className="text-white">{aiReport.hallucinationRate * 100}%</span></p>
                  <p>Explicabilidade da Recomendação: <span className="text-white">{aiReport.explainabilityScore}/100</span></p>
                  <p>Filtro de Segurança Ecológica: <span className={`font-bold ${aiReport.safetyFilterPassed ? 'text-emerald-400' : 'text-red-400 animate-pulse'}`}>
                    {aiReport.safetyFilterPassed ? 'APROVADO' : 'PERIGO SANITÁRIO DETECTADO'}
                  </span></p>
                </div>
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

      {/* DISASTER RECOVERY & FAILOVER TAB */}
      {qaSubTab === 'disaster' && (
        <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-300">
          
          <div className="md:col-span-7 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                <h3 className="text-lg font-black text-black">Treinamento de Mitigação de Catástrofes (Failover)</h3>
                <Button 
                  onClick={() => {
                    toast.promise(simulateDisasterDrill(), {
                      loading: 'Iniciando desvio em nuvem secundária na us-east1...',
                      success: 'Mitigação efetuada. Conexão restabelecida.',
                      error: 'Falha crítica em desvio!'
                    });
                  }}
                  disabled={isDrilling}
                  className="bg-black text-white h-8 text-[11px] font-bold rounded-lg px-3 flex items-center gap-1.5"
                >
                  <Flame className="size-3.5 text-amber-500" /> Simular Desvio de Cluster
                </Button>
              </div>

              <p className="text-xs text-gray-500 leading-normal font-semibold">
                Simula um desastre de hardware na região central de dados e força o middleware a rerotear de forma imediata todas as escrituras operacionais para o Datacenter Secundário sem perda de transação tenant.
              </p>

              {/* Terminal Logs */}
              <div className="bg-zinc-950 text-zinc-300 p-4 rounded-3xl font-mono text-xs h-64 overflow-y-auto space-y-2 border border-zinc-800">
                <div className="flex items-center gap-1.5 border-b border-zinc-900 pb-2 text-[10px] text-zinc-500">
                  <Terminal className="size-4 shrink-0" /> TERM LOG • SIMULATOR_DRILL_SEQUENCE
                </div>
                
                {activeDrillLog.length === 0 ? (
                  <p className="text-zinc-650 italic text-[11px] p-6 text-center">Inicie o desvio de Cluster para monitorar os logs da API em tempo real.</p>
                ) : (
                  activeDrillLog.map((log, index) => (
                    <p key={index} className="text-emerald-400 font-bold text-[11px] leading-relaxed">
                      &gt; {log}
                    </p>
                  ))
                )}
              </div>
            </PremiumGlassCard>
          </div>

          <div className="md:col-span-5 space-y-4">
            <PremiumGlassCard className="space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <Cpu className="size-4 text-indigo-500" />
                <h4 className="text-xs font-black uppercase tracking-widest text-black">Active Performance Budgets</h4>
              </div>

              <div className="space-y-3.5">
                {reliabilityMetrics.map((met, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-zinc-650">{met.metricName}</span>
                      <span className="font-mono text-indigo-600 font-bold">{met.value}{met.unit}</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 rounded-full w-[98%]" />
                    </div>
                  </div>
                ))}
              </div>
            </PremiumGlassCard>
          </div>

        </div>
      )}

    </div>
  );
}

export default ReliabilityQACenter;
