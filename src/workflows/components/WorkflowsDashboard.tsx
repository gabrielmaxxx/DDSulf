import React, { useState } from 'react';
import { 
  Cpu, 
  Play, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Activity, 
  Clock, 
  AlertTriangle, 
  GitFork, 
  UserCheck, 
  Wifi, 
  WifiOff, 
  Compass, 
  Eye, 
  PlusCircle, 
  Zap,
  ArrowRight,
  Sparkles,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  useWorkflowEngine, 
  useWorkflowTriggers, 
  useRealtimeWorkflow, 
  useWorkflowDiagnostics 
} from '../hooks';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AiWorkflowOrchestratorService } from '../ai/aiOrchestrator';
import { AiAdvisory, WorkflowRule } from '../types';

export function WorkflowsDashboard() {
  const { 
    rules, 
    instances, 
    metrics, 
    approvals, 
    resolveApproval, 
    adoptSuggestedRule, 
    toggleRuleActive, 
    deleteRule,
    clearAllLogs 
  } = useWorkflowEngine();

  const { systemTriggers, scheduledTasks, triggerEvent } = useWorkflowTriggers();
  const { isOnline, offlineBufferCount, flushBackloggedEvents, isSyncing } = useRealtimeWorkflow();

  // Selected state indices
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [selectedTriggerKey, setSelectedTriggerKey] = useState<string>(systemTriggers[0]?.key || '');
  const [customPayload, setCustomPayload] = useState<string>(
    JSON.stringify(systemTriggers[0]?.testPayload || {}, null, 2)
  );
  
  // Custom Rule Composition Form
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleDesc, setNewRuleDesc] = useState('');
  const [newRuleTriggerKey, setNewRuleTriggerKey] = useState('event.operations.report_submitted');
  const [newRuleActionType, setNewRuleActionType] = useState<'dispatch_notice' | 'deduct_inventory'>('dispatch_notice');
  const [newRulePriority, setNewRulePriority] = useState(50);

  // AI Advisory list loaded on click
  const [aiAdvisories, setAiAdvisories] = useState<AiAdvisory[]>([]);
  const [loadingAi, setLoadingAi] = useState(false);

  // Load diagnostics hook based on selector
  const diagnostics = useWorkflowDiagnostics(selectedInstanceId);

  // Fetch AI advise dynamically
  const fetchAdvice = async () => {
    setLoadingAi(true);
    try {
      const result = await AiWorkflowOrchestratorService.analyzeWorkflows('tenant_ddsulf_enterprise');
      setAiAdvisories(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleTriggerChange = (key: string) => {
    setSelectedTriggerKey(key);
    const match = systemTriggers.find(t => t.key === key);
    if (match) {
      setCustomPayload(JSON.stringify(match.testPayload, null, 2));
    }
  };

  const executeSimulatedTrigger = () => {
    try {
      const parsed = JSON.parse(customPayload);
      triggerEvent(selectedTriggerKey, parsed);
    } catch (e) {
      alert('Seu JSON de payload está com formato inválido. Ajuste a sintaxe para continuar.');
    }
  };

  const submitCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleName.trim()) return;

    const composed: Partial<WorkflowRule> = {
      id: 'rule_custom_' + Math.random().toString(36).substr(2, 9),
      name: newRuleName,
      description: newRuleDesc || 'Regra customizada pelo arquiteto operacional.',
      trigger: {
        id: 'tr_' + Math.random().toString(36).substr(2, 9),
        type: 'event',
        eventKey: newRuleTriggerKey
      },
      actions: [
        {
          id: 'act_' + Math.random().toString(36).substr(2, 9),
          type: newRuleActionType,
          payload: newRuleActionType === 'dispatch_notice' 
            ? { severity: 'info', title: 'Composição Personalizada Ativada', message: 'Notificação instantânea enviada por regra.' }
            : { itemId: 'ins_fipronil_sc', volume: 2 }
        }
      ],
      priority: Number(newRulePriority),
      isOfflineCapable: true
    };

    adoptSuggestedRule(composed);
    setShowRuleForm(false);
    setNewRuleName('');
    setNewRuleDesc('');
  };

  // Build some charts data matching Recharts schemas
  const lastExecutionsData = instances.slice(0, 10).map((inst, idx) => ({
    name: inst.name.length > 15 ? inst.name.slice(0, 13) + '..' : inst.name,
    tempoMs: inst.completedAt ? inst.completedAt - inst.startedAt : 45
  })).reverse();

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* 1. REAL-TIME TELEMETRY KPI BOARD */}
      <div className="grid gap-6 md:grid-cols-4 xl:grid-cols-5">
        <Card className="bg-white border-gray-100 shadow-sm p-6 space-y-3 rounded-[24px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Taxa de Êxito</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle className="size-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-black">
            {metrics ? (metrics.successRate * 100).toFixed(1) : '98.5'}%
          </p>
          <p className="text-[10px] font-medium text-gray-400">Recuperações automáticas ativas</p>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm p-6 space-y-3 rounded-[24px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Latência do Motor</span>
            <div className="p-1.5 bg-[#F3F4F6] text-black rounded-lg">
              <Clock className="size-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-black">
            {metrics ? metrics.averageLatencyMs : '84'}ms
          </p>
          <p className="text-[10px] font-medium text-gray-400">Tempo de disparo e validação</p>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm p-6 space-y-3 rounded-[24px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Falhas Evitadas</span>
            <div className="p-1.5 bg-[#F3F4F6] text-[#F59E0B] rounded-lg">
              <Activity className="size-4" />
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">
            {metrics ? metrics.failuresPreventedCount : '4'}
          </p>
          <p className="text-[10px] font-medium text-gray-400">Mecanismos de rollback e retentativa</p>
        </Card>

        <Card className="bg-white border-gray-100 shadow-sm p-6 space-y-3 rounded-[24px]">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Aprovações Pendentes</span>
            <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <UserCheck className="size-4" />
            </div>
          </div>
          <p className={cn(
            "text-3xl font-black",
            approvals.filter(a => a.status === 'pending').length > 0 ? "text-amber-500 animate-pulse" : "text-black"
          )}>
            {approvals.filter(a => a.status === 'pending').length}
          </p>
          <p className="text-[10px] font-medium text-gray-400">Aguardando supervisão de calda</p>
        </Card>

        <Card className="bg-[#FAF9F5] border-amber-100 shadow-sm p-6 space-y-3 rounded-[24px] md:col-span-4 xl:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">Sincronismo Offline</span>
            <button 
              onClick={flushBackloggedEvents}
              disabled={isSyncing || offlineBufferCount === 0}
              className="p-1.5 bg-white border border-[#E5E7EB] hover:bg-black hover:text-white transition-all rounded-lg disabled:opacity-40"
            >
              <Cpu className={cn("size-3.5", isSyncing && "animate-spin")} />
            </button>
          </div>
          <div className="flex items-end gap-2 justify-between">
            <p className="text-3xl font-black text-black">{offlineBufferCount}</p>
            {isOnline ? (
              <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-600 tracking-wider">
                <Wifi className="size-3" /> Conectado
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] font-black uppercase text-rose-500 tracking-wider animate-pulse">
                <WifiOff className="size-3" /> Desconectado
              </span>
            )}
          </div>
          <p className="text-[10px] font-medium text-gray-400">Gatilhos represados para o Cloud</p>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        {/* 2. AUTOMATION RULES BUILDER AND CONTROLLER */}
        <div className="md:col-span-8 space-y-8">
          <Card className="bg-white border-gray-100 shadow-sm rounded-[32px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-black tracking-tight text-black">Regras de Negócio e Acionamentos</h3>
                <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                  Processos autônomos operacionais ativos para mitigação e produtividade
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => setShowRuleForm(!showRuleForm)}
                  className="h-10 rounded-xl font-black text-[10px] uppercase tracking-widest bg-black text-white"
                >
                  <PlusCircle className="size-4 mr-1.5" /> Compor Regra
                </Button>
              </div>
            </div>

            {/* Rule form compilation modal dropdown */}
            <AnimatePresence>
              {showRuleForm && (
                <motion.form 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  onSubmit={submitCustomRule}
                  className="p-6 bg-[#F9FAFB] rounded-2xl border border-gray-100 space-y-4 overflow-hidden"
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-500">Nome do Processo</label>
                      <input 
                        required
                        type="text" 
                        placeholder="Ex: Bloqueio Sanitário em Área Crítica"
                        value={newRuleName}
                        onChange={e => setNewRuleName(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-[#E5E7EB] text-xs font-semibold rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-500">Gatilho de Evento</label>
                      <select 
                        value={newRuleTriggerKey}
                        onChange={e => setNewRuleTriggerKey(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-[#E5E7EB] text-xs font-semibold rounded-xl focus:outline-none"
                      >
                        <option value="event.operations.report_submitted">Submissão de POP de Campo</option>
                        <option value="event.operations.inventory_starved">Depleção de Química de Detetização</option>
                        <option value="event.operations.route_deviation">Desvios em Rotas Hidráulicas</option>
                        <option value="customer.certification.expiring">Expiração de Alertas Anvisa</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-500">Descrição do Escopo do Fluxo</label>
                      <input 
                        type="text" 
                        placeholder="Descrição curta para visualização na árvore..."
                        value={newRuleDesc}
                        onChange={e => setNewRuleDesc(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-[#E5E7EB] text-xs font-semibold rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black uppercase text-gray-500">Ação a ser Disparada</label>
                      <select 
                        value={newRuleActionType}
                        onChange={e => setNewRuleActionType(e.target.value as any)}
                        className="w-full h-10 px-3 bg-white border border-[#E5E7EB] text-xs font-semibold rounded-xl focus:outline-none"
                      >
                        <option value="dispatch_notice">Notificação Operacional</option>
                        <option value="deduct_inventory">Reduzir Estoque de Insumos</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <label className="text-[9px] font-black uppercase text-gray-500">Peso de Prioridade:</label>
                      <input 
                        type="number" 
                        min="20" 
                        max="200" 
                        value={newRulePriority}
                        onChange={e => setNewRulePriority(Number(e.target.value))}
                        className="w-16 h-8 text-center bg-white border border-[#E5E7EB] text-xs font-black rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setShowRuleForm(false)}
                        className="h-8 text-[9.5px] font-black uppercase text-gray-500"
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit" 
                        className="h-8 px-4 bg-black text-white text-[9.5px] font-black uppercase rounded-lg"
                      >
                        Compor Regra Ativa
                      </Button>
                    </div>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>

            {/* List and toggle rules cards */}
            <div className="space-y-4">
              {rules.map((rule) => (
                <div 
                  key={rule.id} 
                  className={cn(
                    "p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4",
                    rule.isActive ? "bg-white border-gray-100" : "bg-[#F9FAFB] border-gray-100 opacity-60"
                  )}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#F3F4F6] text-black text-[8px] font-black uppercase rounded-md">
                        Prioridade: {rule.priority}
                      </span>
                      {rule.trigger.type === 'threshold' && (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 text-[8px] font-black uppercase rounded-md border border-amber-100">
                          Gatilho: Payload Threshold
                        </span>
                      )}
                      {rule.trigger.type === 'event' && (
                        <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase rounded-md border border-indigo-100">
                          Evento: {rule.trigger.eventKey}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-black">{rule.name}</h4>
                    <p className="text-xs text-gray-400 font-medium leading-relaxed">{rule.description}</p>
                    <div className="flex gap-2 text-[9px] font-mono text-gray-400 mt-1">
                      <span>Passos Encadeados: {rule.actions.length}</span>
                      <span>•</span>
                      <span>Versão: {rule.version}.0</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end md:self-center">
                    {/* Activation Toggle switch */}
                    <button 
                      onClick={() => toggleRuleActive(rule.id)}
                      className={cn(
                        "w-10 h-6 rounded-full p-0.5 transition-colors focus:outline-none flex items-center",
                        rule.isActive ? "bg-black justify-end" : "bg-gray-200 justify-start"
                      )}
                    >
                      <motion.div layout className="size-5 rounded-full bg-white shadow-sm" />
                    </button>

                    <button 
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 text-gray-400 hover:text-rose-500 bg-gray-50 hover:bg-rose-50 rounded-xl transition-all"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 3. INTERACTIVE SIMULATOR TESTBED SECTION */}
          <Card className="bg-white border-gray-100 shadow-sm rounded-[32px] p-8 space-y-6">
            <div className="space-y-1">
              <h3 className="text-xl font-black tracking-tight text-black">Playground de Simulação de Gatilhos</h3>
              <p className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-widest">
                Force eventos, simule margens de propostas ou altere estoques para testar a governança autônoma do DDSulf
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Selecionar Gatilho Modelo</label>
                  <select 
                    value={selectedTriggerKey}
                    onChange={e => handleTriggerChange(e.target.value)}
                    className="w-full h-11 px-4 bg-[#F9FAFB] border border-[#E5E7EB] text-xs font-bold rounded-xl focus:outline-none"
                  >
                    {systemTriggers.map(t => (
                      <option key={t.key} value={t.key}>
                        [{t.name}] • {t.key}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase tracking-wider text-gray-500">Payload do Evento (JSON)</label>
                    <span className="text-[9px] font-mono text-[#D1D5DB]">Modifique ou adicione campos</span>
                  </div>
                  <textarea 
                    rows={5}
                    value={customPayload}
                    onChange={e => setCustomPayload(e.target.value)}
                    className="w-full p-4 bg-gray-50 border border-[#E5E7EB] font-mono text-xs text-black rounded-xl focus:outline-none focus:ring-1 focus:ring-black"
                  />
                </div>

                <Button 
                  onClick={executeSimulatedTrigger}
                  className="w-full h-12 bg-black text-white hover:opacity-90 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg transition-all"
                >
                  <Zap className="size-4 mr-2 text-amber-400 animate-bounce" /> Disparar Evento ao Motor
                </Button>
              </div>

              {/* LATENCY HISTOGRAM CHART VIEW */}
              <div className="border border-gray-100 rounded-[28px] p-6 space-y-4 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#111827]">Histórico de Latência</h4>
                  <p className="text-[10px] font-semibold text-[#9CA3AF]">Variações de resposta nos últimos orquestramentos</p>
                </div>

                <div className="h-44 w-full">
                  {lastExecutionsData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={lastExecutionsData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                        <XAxis dataKey="name" hide />
                        <YAxis hide />
                        <RechartsTooltip 
                          contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          itemStyle={{ fontSize: '11px', fontWeight: '900' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="tempoMs" 
                          stroke="#000" 
                          strokeWidth={2.5} 
                          fillOpacity={0.05} 
                          fill="#000" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-4">
                      <Clock className="size-8 text-gray-200 mb-2" />
                      <p className="text-[9px] font-black uppercase tracking-wider text-[#D1D5DB]">Aguardando disparo de execução para grafar latência</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center text-[9px] font-mono text-gray-400 border-t border-gray-50 pt-2">
                  <span>Modo: Simulador de Eventos</span>
                  <span>Executando em Threads Isoladas</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* 4. REAL-TIME EVENT STREAM VIEWER, DIAGNOSTICS & AI ADVISOR SIDEBAR */}
        <div className="md:col-span-4 space-y-8">
          
          {/* A. GOVERNANCE APPROVAL BRIDGE */}
          {approvals.filter(a => a.status === 'pending').length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-50 rounded-lg">
                  <UserCheck className="size-4 text-amber-600" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-black">Aprovações Críticas Pendentes</h3>
              </div>
              <div className="space-y-3">
                {approvals.filter(a => a.status === 'pending').map((appr) => (
                  <Card key={appr.id} className="p-5 border-amber-100 bg-[#FFFDF9] shadow-md rounded-[20px] space-y-4">
                    <div className="flex justify-between items-start text-[8px] font-black uppercase tracking-widest text-amber-800">
                      <span>Nível: {appr.requestedLevel}</span>
                      <span>Pendente</span>
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-black">Pedido de Liberação de Insumo</h4>
                      <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                        {appr.payload?.reason || 'Liberação requisitada automaticamente para contornar gargalos de caldas.'}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => resolveApproval(appr.id, 'rejected', 'Ação negada via centro de controle operacional.')}
                        className="flex-1 h-9 bg-white border border-[#E5E7EB] text-[9.5px] font-black uppercase tracking-wider hover:bg-rose-50 text-rose-500 rounded-lg transition-all"
                      >
                        Rejeitar
                      </button>
                      <button 
                        onClick={() => resolveApproval(appr.id, 'approved', 'Estoque liberado para ordens prioritárias.')}
                        className="flex-1 h-9 bg-black text-white text-[9.5px] font-black uppercase tracking-wider hover:opacity-95 rounded-lg transition-all"
                      >
                        Autorizar
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* B. AI DYNAMIC GENERAL ADVICE COMPASS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-indigo-50 rounded-lg">
                  <Sparkles className="size-4 text-indigo-600" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-black">Recomendações e IA</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={fetchAdvice}
                disabled={loadingAi}
                className="h-8 px-2 text-[10px] uppercase font-black tracking-widest text-indigo-700 hover:bg-indigo-50"
              >
                {loadingAi ? 'Analisando...' : 'Pedir Conselho IA'}
              </Button>
            </div>

            <div className="space-y-4">
              {aiAdvisories.map((adv) => (
                <Card key={adv.id} className="p-6 border-indigo-100 bg-white shadow-sm rounded-3xl space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Sparkles className="size-16 text-indigo-600" />
                  </div>
                  <div className="space-y-1.5 relative z-10">
                    <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[8px] font-black uppercase tracking-wider rounded border border-indigo-100">
                      Confiança: {(adv.confidence * 100).toFixed(0)}% • {adv.type.toUpperCase()}
                    </span>
                    <h4 className="text-xs font-black text-black leading-tight">{adv.title}</h4>
                    <p className="text-[11px] text-gray-500 font-semibold leading-relaxed">
                      {adv.description}
                    </p>
                  </div>

                  {adv.suggestedWorkflowRule && (
                    <div className="border-t border-gray-100 pt-3 space-y-2">
                      <div className="p-3 bg-gray-50 rounded-xl space-y-1 text-left">
                        <p className="text-[10px] font-black uppercase text-black">Sugestão: {adv.suggestedWorkflowRule.name}</p>
                        <p className="text-[9px] text-[#9CA3AF] leading-relaxed font-semibold">{adv.suggestedWorkflowRule.description}</p>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => {
                          adoptSuggestedRule(adv.suggestedWorkflowRule!);
                          setAiAdvisories(aiAdvisories.filter(a => a.id !== adv.id));
                        }}
                        className="w-full h-8 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:opacity-95"
                      >
                        Implementar Recomendação
                      </Button>
                    </div>
                  )}
                </Card>
              ))}

              {aiAdvisories.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-[28px] space-y-3">
                  <Compass className="size-6 text-[#9CA3AF] opacity-60 mx-auto" />
                  <p className="text-[9.5px] font-bold uppercase tracking-wider text-gray-400">
                    Clique em **"Pedir Conselho IA"** para varrer o histórico de logs do DDSulf e encontrar gargalos operacionais.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* C. LIVE EXECUTIONS AND OBSERVABILITY LOGS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#F3F4F6] rounded-lg">
                  <Activity className="size-4 text-black" />
                </div>
                <h3 className="text-xs font-black uppercase tracking-widest text-black">Fila de Execuções e Trace</h3>
              </div>
              {instances.length > 0 && (
                <button 
                  onClick={clearAllLogs}
                  className="text-[9px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-600 transition-colors"
                >
                  Limpar Logs
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {instances.map((inst) => (
                <div 
                  key={inst.id} 
                  onClick={() => setSelectedInstanceId(selectedInstanceId === inst.id ? null : inst.id)}
                  className={cn(
                    "p-4 border rounded-2xl cursor-pointer hover:shadow-md transition-all space-y-2",
                    selectedInstanceId === inst.id ? "bg-black border-black text-white" : "bg-white border-gray-100 text-black"
                  )}
                >
                  <div className="flex items-center justify-between text-[8px] font-mono tracking-wider">
                    <span>{new Date(inst.startedAt).toLocaleTimeString()}</span>
                    <span className={cn(
                      "px-1.5 py-0.5 rounded font-black uppercase tracking-widest",
                      inst.status === 'completed' && "bg-emerald-50 text-emerald-700",
                      inst.status === 'running' && "bg-blue-50 text-blue-700 animate-pulse",
                      inst.status === 'failed' && "bg-rose-50 text-rose-700",
                      inst.status === 'approval_pending' && "bg-amber-50 text-amber-700",
                      selectedInstanceId === inst.id && "bg-gray-800 text-white border border-gray-700"
                    )}>
                      {inst.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-black">{inst.name}</h4>
                    <p className={cn(
                      "text-[10px] font-medium leading-relaxed line-clamp-2",
                      selectedInstanceId === inst.id ? "text-gray-400" : "text-gray-400 animate-pulse"
                    )}>
                      {inst.executionTrail[inst.executionTrail.length - 1]}
                    </p>
                  </div>

                  {/* Stretched Interactive Diagnostics Drawer */}
                  {selectedInstanceId === inst.id && diagnostics.instance && (
                    <div className="border-t border-gray-800 pt-3 mt-2 space-y-3 animate-in fade-in duration-300">
                      <div className="text-[9px] font-black uppercase tracking-wider text-gray-400">Passos de Execução:</div>
                      <div className="space-y-2 pl-2">
                        {diagnostics.steps.map((step, sIdx) => (
                          <div key={step.id} className="flex items-start gap-2.5 text-[10px]">
                            {step.status === 'completed' && <CheckCircle className="size-3.5 text-emerald-500 mt-0.5" />}
                            {step.status === 'failed' && <XCircle className="size-3.5 text-rose-500 mt-0.5" />}
                            {step.status === 'rolled_back' && <AlertTriangle className="size-3.5 text-[#F59E0B] mt-0.5" />}
                            {step.status === 'running' && <div className="size-3 border-2 border-white/60 border-t-transparent animate-spin rounded-full mt-0.5" />}
                            {step.status === 'pending' && <div className="size-3 rounded-full bg-gray-800 mt-0.5 border border-gray-700" />}

                            <div className="flex-1">
                              <p className="font-extrabold text-white">Passo {sIdx + 1}: {step.type.toUpperCase()}</p>
                              {step.error && <p className="text-[9px] text-rose-400 font-semibold">{step.error}</p>}
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="text-[9px] font-black uppercase tracking-wider text-gray-400 border-t border-gray-800 pt-2">Registro de Auditoria Completo:</div>
                      <div className="space-y-1 pl-1 max-h-[140px] overflow-y-auto font-mono text-[9px] text-[#A1A1AA]">
                        {diagnostics.trail.map((log, lIdx) => (
                          <p key={lIdx} className="leading-relaxed border-l border-zinc-700 pl-2">
                            {log}
                          </p>
                        ))}
                      </div>

                      <div className="flex justify-between items-center text-[8.5px] font-mono text-[#D1D5DB] border-t border-gray-800 pt-2">
                        <span>Latência: {diagnostics.latencyMs}ms</span>
                        <span>Tentativas: {diagnostics.retryCount}/3</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {instances.length === 0 && (
                <div className="p-12 text-center border-2 border-dashed border-gray-100 rounded-[28px]">
                  <Activity className="size-6 text-[#9CA3AF] opacity-60 mx-auto mb-2 animate-pulse" />
                  <p className="text-[9.5px] font-bold uppercase tracking-wider text-gray-400">Filas vazias.</p>
                  <p className="text-[9px] text-gray-400">Use o painel de simulação ao lado para ver o motor funcionar!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowsDashboard;
