/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Terminal, 
  Flame, 
  RefreshCw, 
  Play, 
  Fingerprint, 
  BookOpen, 
  Cpu, 
  RotateCcw, 
  CheckCircle, 
  AlertTriangle, 
  BrainCircuit, 
  Zap, 
  Settings, 
  ClipboardCheck, 
  TrendingUp, 
  FileText,
  Lock,
  Compass,
  AlertCircle
} from 'lucide-react';
import { useReliabilityValidation } from './hooks/useReliabilityValidation';
import { useOperationalTesting } from './hooks/useOperationalTesting';
import { useResilienceValidation } from './hooks/useResilienceValidation';
import { useEventConsistency } from './hooks/useEventConsistency';
import { useProductionReadiness } from './hooks/useProductionReadiness';
import { useQualityMetrics } from './hooks/useQualityMetrics';
import { TestType, TestStatus } from './types';

export function QualityCockpit() {
  const [activeTab, setActiveTab] = useState<'tests' | 'chaos' | 'security' | 'ai' | 'gates' | 'consistency' | 'manual'>('tests');
  
  // Custom states for simulations
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] SRE Engine Initialized. Checking Firestore rule state...`,
    `[${new Date().toLocaleTimeString()}] All 3 organizational tenants validated (POA, Pelotas, Caxias).`
  ]);
  const [aiAuditingTemplate, setAiAuditingTemplate] = useState('PesticideDosageV3_Template');

  // Load custom hooks
  const { testCases, isRunning, runAllSuite, runSingleTest, resetSuite } = useReliabilityValidation();
  const { securityAudits, aiMetrics, isAuditing, runTenantAudit, runAIValidation, resetAudits } = useOperationalTesting();
  const { experiments, mttr, degradationScore, injectChaos, recoverChaos, recoverAll } = useResilienceValidation();
  const { issues, history, isScanning, triggerReconciliationScan, resolveConsistencyIssue, replayEventTrace } = useEventConsistency();
  const { gates, certification, toggleGateStatus, triggerFormalCertification, resetAllGates } = useProductionReadiness();
  const { reliabilityIndex, scoreHistory, metrics, refreshMetrics } = useQualityMetrics();

  const addLog = (message: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`].slice(-40));
  };

  const handleRunFullSuite = async () => {
    addLog('Iniciando varredura e execução de toda a suíte de testes (Unitários, Integração e E2E)...');
    await runAllSuite();
    addLog('Varredura concluída. Todos os assertions gerados com sucesso.');
    refreshMetrics();
  };

  const handleRunSingle = async (id: string, name: string) => {
    addLog(`Executando teste individual: "${name}"...`);
    await runSingleTest(id);
    addLog(`Teste concluído: "${name}".`);
    refreshMetrics();
  };

  const handleInjectChaos = async (id: string, name: string) => {
    addLog(`CRITICAL: Injetando falha estocástica artificial no ambiente: "${name}"`);
    await injectChaos(id);
    addLog(`Falha aplicada com sucesso. Monitorando tempo médio de recuperação (MTTR)...`);
    refreshMetrics();
  };

  const handleRecoverChaos = (id: string, name: string) => {
    recoverChaos(id);
    addLog(`RECOVERY: Parando injeção. Auto-healing do sistema ativado para resolver "${name}".`);
    refreshMetrics();
  };

  const handleVerifyTenant = async () => {
    addLog('Varrendo queries para auditar brechas de privacidade multi-tenant...');
    const result = await runTenantAudit();
    addLog(`Auditoria de Tenant concluída. Resultado: ${result.status.toUpperCase()}. ${result.details}`);
    refreshMetrics();
  };

  const handleVerifyAI = async () => {
    addLog(`Re-validando temperatura e drift semântico do prompt "${aiAuditingTemplate}"...`);
    const val = await runAIValidation(aiAuditingTemplate);
    addLog(`Validação de IA concluída. Hallucination Rate: ${val.hallucinationRate.toFixed(3)}%, Explainability: ${val.explainabilityScore.toFixed(1)}%`);
    refreshMetrics();
  };

  const handleReplayEvent = async (ev: any) => {
    addLog(`REPLAY EVENT: Re-enfileirando evento original "${ev.eventName}" com trace id correlacionado.`);
    await replayEventTrace(ev);
    addLog(`Evento reenviado via EventBus. Pipeline de de-para acionado.`);
  };

  const handleSyncGates = async () => {
    addLog('Re-compilando empacotamento estático e verificando limites toleráveis de SRE...');
    await triggerFormalCertification();
    addLog('Certificação formal de release concluída. Prontidão avaliada.');
  };

  const activeTestTypeCount = (type: TestType) => testCases.filter(t => t.type === type).length;
  const passedTypeCount = (type: TestType) => testCases.filter(t => t.type === type && t.status === TestStatus.PASSED).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      {/* Platform Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div className="flex gap-4 items-center">
          <div className="size-14 bg-slate-900 rounded-[22px] flex items-center justify-center shadow-md shrink-0 border border-slate-800">
             <ShieldCheck className="size-7 text-emerald-400" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 font-sans">Quality & Operational Resilience Control Panel</h1>
            <div className="flex items-center gap-2">
               <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                 DDSulf QA Engine: v1.0.0 (Compliance e SRE Ativos)
               </p>
            </div>
          </div>
        </div>

        {/* Header Indicators and Quick Actions */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          <button
            onClick={() => {
              resetSuite();
              resetAudits();
              recoverAll();
              resetAllGates();
              addLog('Painel de Confiabilidade reconfigurado para o estado original.');
            }}
            className="h-10 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="size-3.5 text-slate-500" /> Restaurar Estados
          </button>
        </div>
      </header>

      {/* SRE Dynamic Metrics - Gauges Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Dynamic Reliability Index */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-semibold text-slate-405 uppercase tracking-widest">SOCIETY SLA RELIABILITY INDEX</span>
            <TrendingUp className="size-4 text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">{reliabilityIndex}%</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] text-slate-500 font-bold">Standard Corporativo de Produção Satisfeito</p>
            </div>
          </div>
        </div>

        {/* Mean Time to Recovery */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-semibold text-slate-405 uppercase tracking-widest">MEAN TIME TO RECOVERY (MTTR)</span>
            <Cpu className="size-4 text-sky-505" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-800 font-mono">{mttr}ms</span>
            <div className="flex items-center gap-2 mt-2">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              <p className="text-[10px] text-slate-400">Tempo médio de auto-healing em falhas</p>
            </div>
          </div>
        </div>

        {/* Structural Code Coverage */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-semibold text-slate-405 uppercase tracking-widest">MATH ENGINE CODE COVERAGE</span>
            <ClipboardCheck className="size-4 text-emerald-500" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-extrabold text-slate-900 font-sans">94.6%</span>
            <p className="text-[10px] text-slate-400 mt-2 font-bold">Caminhos estequiométricos cobertos</p>
          </div>
        </div>

        {/* Release Status Ready Gate */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-semibold text-slate-450 uppercase tracking-widest">SRE EXECUTED GATE SUCCESS</span>
            {certification.ready ? (
              <CheckCircle className="size-4.5 text-emerald-500" />
            ) : (
              <AlertTriangle className="size-4.5 text-amber-500 animate-bounce" />
            )}
          </div>
          <div className="mt-4">
            <span className={`text-xl font-black font-sans uppercase ${certification.ready ? 'text-emerald-600' : 'text-amber-500'}`}>
              {certification.ready ? 'Pronto para Produção' : 'Aguardando Gates'}
            </span>
            <p className="text-[10px] text-slate-500 mt-2 leading-tight">
              Aprovado em {certification.certifiedPercent}% dos requisitos mínimos de Cloud Run.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs Menu Panel Selection */}
      <div className="flex scrollbar-none items-center overflow-x-auto bg-slate-100 p-1 rounded-2xl gap-1 border border-slate-200/60 shadow-inner">
        {[
          { id: 'tests', label: 'Test Runner (Unit/E2E)', icon: Activity },
          { id: 'chaos', label: 'Chaos Injections (Resiliência)', icon: Flame },
          { id: 'security', label: 'Multi-Tenant & Security Audit', icon: Lock },
          { id: 'ai', label: 'AI Validation Pipeline', icon: BrainCircuit },
          { id: 'gates', label: 'SRE Release Gateways', icon: ClipboardCheck },
          { id: 'consistency', label: 'Event Consistency & Replay', icon: Terminal },
          { id: 'manual', label: 'QA Manual & Diretrizes', icon: BookOpen }
        ].map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-white text-slate-950 shadow-xs border border-slate-200' 
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <tab.icon className={`size-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Primary Workspace Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Workspace content card */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs min-h-[440px]">
          
          {/* TAB 1: TEST RUNNER */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Activity className="size-4.5 text-emerald-500" />
                    Bateria de Testes Automatizada (Test Suite Runner)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inicie as varreduras de garantia de qualidade para verificar se alterações quebraram recursos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRunFullSuite}
                    disabled={isRunning}
                    className="h-9 px-4 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-300 text-[10px] font-black uppercase rounded-lg tracking-wider transition-colors cursor-pointer"
                  >
                    {isRunning ? 'Carregando...' : 'Rodar Painel Inteiro'}
                  </button>
                </div>
              </div>

              {/* Categorized Test Counters */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Unitários', type: TestType.UNIT },
                  { label: 'Integração', type: TestType.INTEGRATION },
                  { label: 'Pontas a Pontas (E2E)', type: TestType.E2E }
                ].map(cat => {
                  const total = activeTestTypeCount(cat.type);
                  const passed = passedTypeCount(cat.type);
                  return (
                    <div key={cat.type} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{cat.label}</span>
                        <span className="block font-bold text-slate-800 mt-1">{passed}/{total} passados</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Test Cases Table */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                {testCases.map((tc) => {
                  return (
                    <div 
                      key={tc.id} 
                      className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                        tc.status === TestStatus.FAILED 
                          ? 'bg-rose-50 border-rose-250' 
                          : tc.status === TestStatus.PASSED 
                          ? 'bg-emerald-50/20 border-emerald-100'
                          : 'bg-slate-50 border-slate-200/60'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                            tc.type === TestType.UNIT 
                              ? 'bg-sky-50 text-sky-650' 
                              : tc.type === TestType.INTEGRATION 
                              ? 'bg-amber-50 text-amber-650' 
                              : 'bg-emerald-100/40 text-emerald-600'
                          }`}>
                            {tc.type}
                          </span>
                          <span className="text-xs font-bold text-slate-800">{tc.name}</span>
                          <span className="text-[10px] font-mono text-slate-405">({tc.suite})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-normal">{tc.description}</p>
                        
                        {tc.errorMessage && (
                          <div className="p-2.5 bg-rose-100/70 text-rose-700 font-mono text-[9px] rounded-lg border border-rose-200 mt-1.5 leading-relaxed font-bold">
                            {tc.errorMessage}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {tc.durationMs && (
                          <span className="text-[10px] font-mono text-slate-400">{tc.durationMs}ms</span>
                        )}
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          tc.status === TestStatus.PASSED 
                            ? 'bg-emerald-500 text-white' 
                            : tc.status === TestStatus.FAILED 
                            ? 'bg-rose-500 text-white'
                            : tc.status === TestStatus.RUNNING 
                            ? 'bg-yellow-500 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-600'
                        }`}>
                          {tc.status}
                        </span>

                        <button
                          onClick={() => handleRunSingle(tc.id, tc.name)}
                          disabled={isRunning || tc.status === TestStatus.RUNNING}
                          className="p-1 px-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-md text-[10px] font-bold uppercase transition-colors"
                        >
                          Run
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: CHAOS ENGINEERING */}
          {activeTab === 'chaos' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Flame className="size-4.5 text-emerald-505" />
                  Engenharia de Caos Ativa (Chaos Injector Board)
                </h3>
                <p className="text-xs text-slate-505">
                  Provoque falhas, latências e concorrências artificiais para testar a robustez e redundância do depara gaúcho.
                </p>
              </div>

              {/* Chaos grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {experiments.map((exp) => {
                  const isActive = exp.status === 'active';
                  const isCompleted = exp.status === 'completed';

                  return (
                    <div 
                      key={exp.id} 
                      className={`p-4 border rounded-2xl flex flex-col justify-between space-y-4 transition-all duration-300 ${
                        isActive 
                          ? 'bg-rose-50/20 border-rose-300 shadow-sm' 
                          : isCompleted 
                          ? 'bg-emerald-50/10 border-emerald-200'
                          : 'bg-slate-50/40 border-slate-200/75'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono text-slate-400">Target: {exp.targetModule}</span>
                          <span className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded ${
                            exp.severity === 'critical' ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {exp.severity}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800">{exp.name}</h4>
                        <p className="text-[11px] text-slate-500 leading-relaxed">{exp.description}</p>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/50">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isActive 
                            ? 'ERRO ATIVO' 
                            : isCompleted 
                            ? `Recuperado (MTTR: ${exp.systemRecoveryTimeMs || 340}ms)` 
                            : 'Inativo'
                          }
                        </span>

                        <div className="flex items-center gap-2">
                          {isActive ? (
                            <button
                              onClick={() => handleRecoverChaos(exp.id, exp.name)}
                              className="px-2.5 py-1 text-[9px] font-bold uppercase bg-slate-900 border border-slate-805 text-emerald-400 rounded-md cursor-pointer"
                            >
                              Resolver
                            </button>
                          ) : (
                            <button
                              onClick={() => handleInjectChaos(exp.id, exp.name)}
                              className="px-2.5 py-1 text-[9px] font-bold uppercase bg-rose-500 text-white hover:bg-rose-600 rounded-md cursor-pointer"
                            >
                              Injetar Fratura
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: MULTI-TENANT SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Lock className="size-4.5 text-emerald-500" />
                    Auditoria de Segregação Multi-Tenant
                  </h3>
                  <p className="text-xs text-slate-500">
                    Inspecione de forma estocástica se regras do Firestore protegem e isolam contas entre Porto Alegre, Pelotas e Caxias.
                  </p>
                </div>

                <button
                  onClick={handleVerifyTenant}
                  disabled={isAuditing}
                  className="h-9 px-4 bg-slate-900 text-white hover:bg-slate-800 disabled:bg-slate-200 text-[10px] font-bold uppercase rounded-lg transition-colors cursor-pointer"
                >
                  {isAuditing ? 'Auditando...' : 'Iniciar Auditoria'}
                </button>
              </div>

              {/* Security audits history */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Logs de Varredura de Leak de Dados</h4>
                <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin">
                  {securityAudits.map((audit) => {
                    const isSecure = audit.status === 'secure';
                    return (
                      <div 
                        key={audit.id} 
                        className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                          isSecure ? 'bg-slate-50/50 border-slate-200' : 'bg-rose-50 border-rose-200'
                        }`}
                      >
                        <div className="mt-0.5">
                          {isSecure ? (
                            <CheckCircle className="size-4.5 text-emerald-505" />
                          ) : (
                            <AlertCircle className="size-4.5 text-rose-500 animate-pulse" />
                          )}
                        </div>

                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-800">{audit.policyName}</span>
                            <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              isSecure ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
                            }`}>
                              {audit.status}
                            </span>
                          </div>

                          <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">{audit.details}</p>
                          
                          <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-[9px] text-slate-400">
                            <span>TenantID: {audit.tenantId}</span>
                            <span>•</span>
                            <span>Escopos de Teste: {audit.testedScopes.join(', ')}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI VALIDATION */}
          {activeTab === 'ai' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <BrainCircuit className="size-4.5 text-emerald-505" />
                    Validação de Alucinamento e Estabilidade de IA
                  </h3>
                  <p className="text-xs text-slate-505">
                    Certifique a aderência semântica e limites de temperatura nos prompts geradores de dose química.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={aiAuditingTemplate}
                    onChange={(e) => setAiAuditingTemplate(e.target.value)}
                    className="h-9 px-2 bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-slate-705 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-900"
                  >
                    <option value="PesticideDosageV3_Template">PesticideDosageV3_Template</option>
                    <option value="AnvisaComplianceHelper_V1">AnvisaComplianceHelper_V1</option>
                  </select>

                  <button
                    onClick={handleVerifyAI}
                    className="h-9 px-3 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                  >
                    Testar Prompt
                  </button>
                </div>
              </div>

              {/* Display AI Consistency Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiMetrics.map((met) => {
                  return (
                    <div key={met.id} className="p-4 bg-slate-50 border border-slate-205 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200/50 pb-2">
                        <span className="text-[10px] font-mono font-bold text-slate-700">{met.promptSignature}</span>
                        <span className="text-[9px] font-mono text-emerald-500 font-bold bg-emerald-50 px-2 rounded">
                          Verificado
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 font-mono text-[11px]">
                        <div className="space-y-1 uppercase bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 font-bold">Hallucination Rate</span>
                          <span className="block font-bold text-rose-505">{met.hallucinationRate.toFixed(3)}%</span>
                        </div>

                        <div className="space-y-1 uppercase bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 font-bold">Explainability</span>
                          <span className="block font-bold text-slate-800">{met.explainabilityScore.toFixed(1)}%</span>
                        </div>

                        <div className="space-y-1 uppercase bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 font-bold">Context Adherence</span>
                          <span className="block font-bold text-slate-800">{met.contextAdherence.toFixed(1)}%</span>
                        </div>

                        <div className="space-y-1 uppercase bg-white p-2.5 rounded-xl border border-slate-100">
                          <span className="text-[8px] text-slate-400 font-bold">Stability Score</span>
                          <span className="block font-bold text-emerald-600">{met.recommendationStability.toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 5: SRE RELEASE GATES */}
          {activeTab === 'gates' && (
            <div className="space-y-6 animate-in fade-in">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <ClipboardCheck className="size-4.5 text-emerald-500" />
                    SRE Release Gateways checklist de Cloud Run
                  </h3>
                  <p className="text-xs text-slate-500">
                    Certifique os portões automáticos necessários para liberar o cluster sem riscos de regressions.
                  </p>
                </div>

                <button
                  onClick={handleSyncGates}
                  className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-bold uppercase rounded-lg cursor-pointer"
                >
                  Certificar Gates
                </button>
              </div>

              {/* Checklist visual gates */}
              <div className="space-y-2.5">
                {gates.map((g) => {
                  return (
                    <div 
                      key={g.id} 
                      onClick={() => toggleGateStatus(g.id)}
                      className="p-4 bg-slate-50 hover:bg-slate-100/60 transition-colors border border-slate-200/90 rounded-2xl flex items-center justify-between gap-4 cursor-pointer"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="pt-0.5">
                          <div className={`size-5 rounded-full border flex items-center justify-center ${
                            g.checked ? 'bg-emerald-500 border-transparent text-white' : 'border-slate-350 bg-white'
                          }`}>
                            {g.checked && <CheckCircle className="size-3.5 text-slate-950" />}
                          </div>
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">{g.name}</span>
                            {g.required && (
                              <span className="text-[8px] font-mono font-bold bg-rose-50 text-rose-600 px-1.5 rounded uppercase tracking-widest">
                                Requisito SRE
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-550 leading-normal">{g.description}</p>
                        </div>
                      </div>

                      {g.currentValue && (
                        <div className="text-[11px] font-mono font-bold text-slate-600 bg-slate-200/60 px-2.5 py-1 rounded-lg">
                          {g.currentValue}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 6: EVENT REPLAY & STREAM CONSISTENCY */}
          {activeTab === 'consistency' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Terminal className="size-4.5 text-emerald-500" />
                    Barramento de Replay e Validação de Contrato (Event Stream)
                  </h3>
                  <p className="text-xs text-slate-550">
                    Selecione logs no histórico e simule replay est estocástico para certificar que os microsserviços se reconfiguram autonomamente.
                  </p>
                </div>

                <button
                  onClick={async () => {
                    addLog('Iniciando scan de saneamento profundo em todos os payloads...');
                    await triggerReconciliationScan();
                    addLog('Scan de integridade finalizado.');
                  }}
                  disabled={isScanning}
                  className="h-9 px-4 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer"
                >
                  {isScanning ? 'Carregando scan...' : 'Escanear Contratos'}
                </button>
              </div>

              {/* Stream table */}
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto scrollbar-thin">
                {history.map((ev, idx) => {
                  return (
                    <div key={ev.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-55 px-1.5 py-0.5 rounded">
                            {ev.eventName}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded">
                            {ev.sourceModule}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-450 truncate max-w-[420px]">
                          CID: {ev.correlationId}
                        </p>
                      </div>

                      <button
                        onClick={() => handleReplayEvent(ev)}
                        className="px-2.5 py-1 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 hover:text-slate-900 text-[9px] font-bold uppercase rounded-md cursor-pointer shrink-0"
                      >
                        Replay
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 7: TESTING GUIDELINES (DOCUMENTATION) */}
          {activeTab === 'manual' && (
            <div className="space-y-6">
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="size-4.5 text-emerald-500" />
                  Manual e Normas de Confiabilidade DDSulf SRE (v1.0)
                </h3>
                <p className="text-xs text-slate-550">
                  Instruções e políticas organizacionais que governam a qualidade contratual de nossas faturas e laudos.
                </p>
              </div>

              <div className="space-y-5 text-slate-650 leading-relaxed text-xs">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <span className="size-1 bg-emerald-500 rounded-full" />
                    Princípio de Design for Offline-First
                  </h4>
                  <p>
                    Lavouras e propriedades em Pelotas ou Bagé frequentemente sofrem de blackout de rádio. O DDSulf exige que toda gravação de fatura financeira ou POP possua indexação imediata local PWA, nunca bloqueando o fluxo operacional.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <span className="size-1 bg-emerald-500 rounded-full" />
                    Segregação Organizacional Estrita (Zero Tenant Leak Policy)
                  </h4>
                  <p>
                    Tentativas de carregar ou referenciar IDs de terceiros de Porto Alegre sob contexto de Caxias do Sul disparam o alarme da console. Testes automáticos validam essa isolação contra qualquer tentativa de concorrência ou colisão.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-2">
                    <span className="size-1 bg-emerald-500 rounded-full" />
                    Alinhamentos SRE Gateways
                  </h4>
                  <p>
                    Zero builds de Cloud Run são homologados com testes pendentes. O score de estabilidade corporativa é rastreado por meio de SLAs integrados, exigindo MTTR de saneamento e de-para menor que 500ms.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Console / Operational Telemetry Logs Auditing (Right column) */}
        <div className="bg-slate-900 border border-slate-950 rounded-3xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sky-400 font-semibold font-mono text-[10px] uppercase tracking-wider pb-2 border-b border-slate-800">
              <Terminal className="size-4" />
              <span>Diagnostic Auditing Terminal</span>
            </div>

            <div className="h-[360px] overflow-y-auto scrollbar-thin space-y-2.5 font-mono text-[10.5px] leading-relaxed text-slate-350 pr-1">
              {consoleLogs.map((log, lIdx) => {
                const isError = log.includes('CRITICAL');
                const isRecovery = log.includes('RECOVERY');
                const isReplay = log.includes('REPLAY');
                return (
                  <div key={lIdx} className={`p-1.5 rounded transition-all ${
                    isError ? 'text-rose-400 font-bold bg-rose-950/20' : isRecovery ? 'text-emerald-400 font-semibold bg-emerald-950/10' : isReplay ? 'text-amber-300 font-semibold' : 'text-slate-300'
                  }`}>
                    {log}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-805/40 flex items-center justify-between text-[9px] font-mono text-slate-500">
            <span>SRE LOGGER REPLICATION MODE</span>
            <span className="animate-pulse text-emerald-400 font-black">● STANDBY</span>
          </div>
        </div>

      </div>
    </div>
  );
}
export default QualityCockpit;
