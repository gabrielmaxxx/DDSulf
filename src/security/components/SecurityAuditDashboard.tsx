import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Terminal, 
  Activity, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Play, 
  RefreshCw, 
  Eye, 
  Unlock, 
  Clock, 
  Building,
  User,
  ShieldAlert,
  HelpCircle,
  FileCheck2,
  AlertOctagon,
  ChevronsRight
} from 'lucide-react';
import { 
  useAuthorization, 
  useAuditTrail, 
  useOperationalSecurity, 
  useSecureWorkflow, 
  useComplianceMonitoring, 
  auditService
} from '../../security';
import { useTenant } from '@/organization';
import { PremiumGlassCard } from '@/design-system';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function SecurityAuditDashboard() {
  const { tenant } = useTenant();
  const { role, permissions, isSuperUser } = useAuthorization();
  const { logs, logEvent } = useAuditTrail();
  const { runWorkflow } = useSecureWorkflow();
  const { incidents, openThreatsCount, escalateSafetyIncident, resolveIncident, grantConsent, hasConsented } = useComplianceMonitoring();
  const { auditChemicalUse, verifyCertification } = useOperationalSecurity();

  // Selected State
  const [selectedLog, setSelectedLog] = useState<any>(null);
  
  // Interactive Simulator inputs
  const [simProduct, setSimProduct] = useState('Deltametrina 25CE');
  const [simQty, setSimQty] = useState('10'); // Safe (< 50)
  const [customThreatTitle, setCustomThreatTitle] = useState('');
  const [customThreatDesc, setCustomThreatDesc] = useState('');

  // Settle Interactive workflows (e.g., Financial override bypass validation)
  const handleSimulateCriticalFinancialAction = async () => {
    const result = await runWorkflow({
      permissionRequired: 'write:margin-override',
      workflowName: 'margin_override_override',
      resourceType: 'financial',
      payload: {
        item: 'Desconto extraordinário para indústria de alimentos',
        discountProposed: '22%'
      },
      execute: async () => {
        // Double down on transaction success
        return { trxId: `TX_${Math.floor(Math.random() * 900000)}`, status: 'processed' };
      }
    });

    if (result.success) {
      toast.success(`SUCESSO OPERACIONAL: Transação financeira crítica processada de forma auditável e segura! (ID: ${result.data?.trxId})`);
    } else {
      toast.error(`BLOQUEIO DE SEGURANÇA: ${result.error}`);
    }
  };

  const handleSimulateSafeFinancialAction = async () => {
    const result = await runWorkflow({
      permissionRequired: 'write:financial',
      workflowName: 'add_expense_record',
      resourceType: 'financial',
      payload: {
        expenseName: 'Manutenção de Atomizadores',
        value: 450.00
      },
      execute: async () => {
        return { dbRegistered: true };
      }
    });

    if (result.success) {
      toast.success('Lançamento operacional registrado com absoluto compliance auditável!');
    } else {
      toast.error(`Falha no lançamento: ${result.error}`);
    }
  };

  const handleChemicalAuditSimulation = () => {
    const qtyNum = parseFloat(simQty);
    if (isNaN(qtyNum) || qtyNum <= 0) {
      toast.error('Informe uma litragem de dosagem química válida.');
      return;
    }

    const test = auditChemicalUse(simProduct, qtyNum);
    if (!test.isValid) {
      toast.error(`BLOQUEIO DE COMPLIANCE: ${test.reason}`);
    } else if (test.requiresDoubleCheck) {
      toast.warning(`DOSAGEM ALTA DETECTADA: ${test.reason}. Registrado pendente de co-autorização.`);
    } else {
      toast.success(`DOSAGEM AUTORIZADA: Concentração dentro dos limites de segurança ambiental.`);
    }
  };

  const throwSecurityThreatAlert = () => {
    if (!customThreatTitle.trim() || !customThreatDesc.trim()) {
      toast.error('Favor preencher o título e descrição simplificada do incidente cibernético.');
      return;
    }
    escalateSafetyIncident(customThreatTitle.trim(), customThreatDesc.trim(), 'critical');
    toast.success('Alerta de segurança SecOps escalado! Notificações enviadas aos canais integrados.');
    setCustomThreatTitle('');
    setCustomThreatDesc('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-600">
      
      {/* Title block */}
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#DC2626]">DDSulf Security Ops Centric Shield & Auditing</span>
        <h2 className="text-3xl font-black text-black">Segurança, Auditoria & LGPD</h2>
        <p className="text-gray-500 text-sm max-w-3xl">Painel militar de monitoramento de integridades da plataforma. Acompanhe logs imutáveis, mitigue ameaças de login de borda, e realize conformidade de dosagem química.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        
        {/* Quick status display cards (Upper row) */}
        <div className="md:col-span-4 space-y-4">
          
          {/* Active SecOps Clearances details */}
          <PremiumGlassCard className="space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <ShieldCheck className="size-24 text-indigo-900" />
            </div>

            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <ShieldCheck className="size-4 text-emerald-600" />
              <h4 className="text-xs font-black uppercase tracking-widest text-black">Clearance Nível de Acesso</h4>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between font-bold text-gray-500">
                <span>Cargo Operador:</span>
                <span className="text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded uppercase font-mono tracking-wider">{role}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-500 mt-1.5">
                <span>Canais de Transações:</span>
                <span className="text-neutral-900">{isSuperUser ? 'Liberados (Matriz)' : 'Nível Restrito'}</span>
              </div>
            </div>

            <div className="bg-zinc-900 text-zinc-300 rounded-xl p-3 font-mono text-[9px] space-y-1">
              <p className="font-bold text-zinc-500 border-b border-zinc-800 pb-1 uppercase tracking-wider">Permissões Alocadas</p>
              <div className="grid grid-cols-2 gap-1 pt-1 text-zinc-400">
                {permissions.map((p) => (
                  <span key={p} className="flex items-center gap-1">
                    <span className="size-1 bg-indigo-500 rounded-full" />
                    {p.split(':')[1]}
                  </span>
                ))}
              </div>
            </div>
          </PremiumGlassCard>

          {/* Privacy and LGPD indicators */}
          <PremiumGlassCard className="space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <FileCheck2 className="size-4 text-emerald-600" />
              <h4 className="text-xs font-black uppercase tracking-widest text-black">Termos de Privacidade LGPD</h4>
            </div>

            <p className="text-[11px] text-gray-400 leading-normal">Configure os consentimentos de IA de recomendação preditiva ativa para o escopo do usuário atual no DDSulf:</p>
            
            <div className="space-y-2 pt-1.5">
              <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <h5 className="text-[11px] font-bold text-black leading-tight">Processamento Inteligente de IA</h5>
                  <p className="text-[9px] text-gray-400">Cruza históricos para sugerir dosagens</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={hasConsented('ai_processing')}
                  onChange={(e) => grantConsent('ai_processing', e.target.checked)}
                  className="size-4 accent-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 border border-gray-100 rounded-xl">
                <div>
                  <h5 className="text-[11px] font-bold text-black leading-tight">Telemetria de Localização Remota</h5>
                  <p className="text-[9px] text-gray-400">Rastreamento de aplicação em campo por GPS</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={hasConsented('telemetry_tracking')}
                  onChange={(e) => grantConsent('telemetry_tracking', e.target.checked)}
                  className="size-4 accent-emerald-500"
                />
              </div>
            </div>
          </PremiumGlassCard>

          {/* Active threat intelligence counts block */}
          <PremiumGlassCard className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <AlertTriangle className="size-4 text-amber-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-black">Mitigação de Incidentes SecOps</h4>
            </div>

            <div className="flex justify-between items-center bg-[#FEF2F2] border border-[#FEE2E2] rounded-xl p-3">
              <div className="space-y-0.5">
                <p className="text-[10px] font-mono font-black text-red-800 uppercase tracking-wider">Desvios de Borda Ativos</p>
                <p className="text-2xl font-black text-red-900">{openThreatsCount}</p>
              </div>
              <ShieldAlert className="size-8 text-red-500 animate-pulse shrink-0" />
            </div>

            {/* Simulated Active Security tickets */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {incidents.map((inc) => (
                <div key={inc.id} className={`p-2.5 rounded-xl border text-xs space-y-1.5 ${
                  inc.resolved ? 'bg-gray-50 border-gray-150 opacity-60' : 'bg-[#FFFBEB] border-amber-200'
                }`}>
                  <div className="flex justify-between items-start gap-1">
                    <span className="font-bold text-neutral-900 leading-tight">{inc.title}</span>
                    <span className={`text-[8px] font-bold uppercase px-1 rounded font-mono ${
                      inc.severity === 'critical' ? 'bg-red-200 text-red-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {inc.severity}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-normal">{inc.description}</p>
                  
                  {!inc.resolved ? (
                    <Button 
                      onClick={() => {
                        resolveIncident(inc.id, 'Auditado do SecOps e classificado como falso positivo.');
                        toast.success('Incidente mitigado com sucesso!');
                      }}
                      className="h-6 w-full text-[9px] font-bold uppercase tracking-wider bg-zinc-900 hover:bg-neutral-800 text-white rounded-md"
                    >
                      Classificar e Resolver
                    </Button>
                  ) : (
                    <p className="text-[9px] text-emerald-600 font-bold italic">Resolvido: {inc.resolutionNotes}</p>
                  )}
                </div>
              ))}
            </div>
          </PremiumGlassCard>

        </div>

        {/* Central columns: Audit trail live stream logs */}
        <div className="md:col-span-8 space-y-6">

          {/* Secure transaction simulation center */}
          <PremiumGlassCard className="space-y-4">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
              <Terminal className="size-4 text-indigo-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-[#0F172A]">Simulador de Atividades Críticas Auditáveis</h4>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed font-semibold">
              Dispare procedimentos administrativos abaixo e veja em tempo real as barreiras de controle contra fraudes e registro involuntário.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {/* Financial block wrapper */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">Validação Financeira</span>
                <div className="space-y-2">
                  <Button 
                    onClick={handleSimulateSafeFinancialAction}
                    className="w-full text-left justify-start h-9 text-xs font-bold leading-none bg-indigo-50 border border-indigo-100 text-indigo-900 hover:bg-indigo-100 rounded-lg flex items-center"
                  >
                    <Play className="size-3 mr-1" /> Fluxo Financeiro Comum
                  </Button>
                  <Button 
                    onClick={handleSimulateCriticalFinancialAction}
                    className="w-full text-left justify-start h-9 text-xs font-bold leading-none bg-red-50 border border-red-100 text-red-900 hover:bg-red-100 rounded-lg flex items-center"
                  >
                    <ShieldCheck className="size-3 mr-1" /> Substituir Margem de Lucro 
                  </Button>
                </div>
              </div>

              {/* Chemical block wrapper */}
              <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-3">
                <span className="text-[9px] font-mono font-bold text-gray-400 uppercase">Segurança Química de Campo</span>
                
                <div className="space-y-2 text-xs">
                  <input 
                    type="text" 
                    value={simProduct}
                    onChange={(e) => setSimProduct(e.target.value)}
                    className="w-full p-1.5 bg-white border border-gray-200 rounded text-neutral-800"
                    placeholder="Nome do Químico"
                  />
                  <div className="flex items-center gap-1.5">
                    <input 
                      type="number" 
                      value={simQty}
                      onChange={(e) => setSimQty(e.target.value)}
                      className="w-20 p-1.5 bg-white border border-gray-200 rounded text-neutral-800"
                      placeholder="Dose (Lts)"
                    />
                    <span className="text-[10px] text-gray-400">litros diluídos</span>
                  </div>
                  
                  <Button 
                    onClick={handleChemicalAuditSimulation}
                    className="w-full h-8 bg-zinc-900 text-white rounded font-bold text-[10px] uppercase tracking-wider hover:bg-neutral-800"
                  >
                    Auditar Dosagem Ativa
                  </Button>
                </div>
              </div>
            </div>
          </PremiumGlassCard>

          {/* Incident escalations trigger panel */}
          <PremiumGlassCard className="space-y-3 bg-[#FCECEE]/20 border border-red-100">
            <h4 className="text-xs font-black text-[#991B1B] uppercase tracking-widest flex items-center gap-1.5Packed">
              <AlertOctagon className="size-4 shrink-0" />
              Escalação de Ameaças em Tempo Real (SecOps Panel)
            </h4>
            <div className="grid gap-2 sm:grid-cols-2">
              <input 
                type="text" 
                placeholder="Título do Incidente (ex: Phishing Interno)"
                value={customThreatTitle}
                onChange={(e) => setCustomThreatTitle(e.target.value)}
                className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl"
              />
              <input 
                type="text" 
                placeholder="Descrição detalhada e anomalia"
                value={customThreatDesc}
                onChange={(e) => setCustomThreatDesc(e.target.value)}
                className="text-xs p-2.5 bg-white border border-gray-200 rounded-xl"
              />
            </div>
            <Button 
              onClick={throwSecurityThreatAlert}
              className="w-full h-9 bg-red-600 text-white hover:bg-red-500 text-xs font-black uppercase tracking-widest rounded-lg"
            >
              Forçar Escalação de Ameaça Segurança
            </Button>
          </PremiumGlassCard>

          {/* Immutable Live Audit Trail Flow */}
          <PremiumGlassCard className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-black uppercase tracking-widest text-[#0E172C]">DDSulf Forensic Log Stream</h4>
                  <span className="size-2 bg-emerald-500 rounded-full animate-ping" />
                </div>
                <p className="text-[10px] text-gray-400">Rastreabilidade offline de eventos críticos de controle sanitário e corporativo.</p>
              </div>
              
              <p className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2.5 py-1 rounded-xl font-bold">
                Conectado com Sandbox: {tenant?.name || 'Incompleto'}
              </p>
            </div>

            {/* Logs List representation */}
            <div className="grid gap-3 md:grid-cols-12">
              
              <div className="md:col-span-12 space-y-2 max-h-96 overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-3xl">
                    Nenhum log extraído para o escopo desta simulação. Redirecione ações de teste para gerar históricos de telemetria.
                  </div>
                ) : (
                  logs.map((log) => {
                    const isHighRisk = (log.anomalyScore ?? 0) > 0.4;
                    return (
                      <div 
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`p-3 rounded-2xl border text-xs cursor-pointer transition-all flex flex-col sm:flex-row justify-between items-start gap-4 hover:border-indigo-400 ${
                          selectedLog?.id === log.id ? 'bg-indigo-50/50 border-indigo-200 ring-2 ring-indigo-100' : 'bg-gray-50/50 border-gray-100'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className={`p-1.5 rounded-lg shrink-0 ${
                            isHighRisk ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-indigo-600'
                          }`}>
                            <Activity className="size-4 shrink-0" />
                          </span>
                          
                          <div className="space-y-0.5">
                            <h5 className="font-bold text-gray-900 leading-tight">{log.action}</h5>
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-400">
                              <span className="font-bold text-gray-500">{log.userName} ({log.userRole.toUpperCase()})</span>
                              <span>•</span>
                              <span className="font-mono">{new Date(log.timestamp).toLocaleTimeString()}</span>
                              {log.resourceId && (
                                <>
                                  <span>•</span>
                                  <span className="bg-gray-100 text-gray-600 px-1 rounded text-[8px] font-mono">{log.resourceId}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-end gap-2 shrink-0 self-stretch sm:self-auto justify-between">
                          <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full font-mono ${
                            log.status === 'success' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {log.status === 'success' ? 'authorized' : 'alert_fail'}
                          </span>
                          
                          <span className="text-[10px] text-gray-500 font-bold font-mono">
                            Risco: {log.anomalyScore !== undefined ? (log.anomalyScore * 100).toFixed(0) : 0}%
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Selected Metadata payload drawer inspect */}
            {selectedLog && (
              <div className="p-4 bg-zinc-950 text-indigo-400 border border-zinc-800 rounded-3xl font-mono text-xs space-y-3">
                <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400 uppercase font-black tracking-widest text-[9px]">Inspecionar Carga Útil Criptografada (E2E)</span>
                  <button onClick={() => setSelectedLog(null)} className="text-zinc-500 hover:text-white">fechar [x]</button>
                </div>
                <div className="space-y-1 text-[10px]">
                  <p className="text-zinc-300 font-bold text-indigo-300">Log UUID: <span className="text-white">{selectedLog.id}</span></p>
                  <p className="text-zinc-300">Timestamp ISO: <span className="text-indigo-200">{selectedLog.timestamp}</span></p>
                  <p className="text-zinc-300">Operador: <span className="text-indigo-200">{selectedLog.userName} &lt;{selectedLog.userId}&gt;</span></p>
                  <p className="text-zinc-300">Heurística AnomalyScore: <span className="text-red-400 font-bold">{selectedLog.anomalyScore}</span></p>
                  {selectedLog.payload && (
                    <div className="mt-3 bg-zinc-900/50 p-2 border border-zinc-800 rounded-lg">
                      <p className="text-zinc-500 font-bold border-b border-zinc-850 pb-1 mb-1 font-mono uppercase text-[8px]">Propriedades de Auditoria:</p>
                      <pre className="text-zinc-300 text-[10px] leading-tight overflow-x-auto whitespace-pre-wrap">
                        {JSON.stringify(selectedLog.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </PremiumGlassCard>

        </div>
      </div>
    </div>
  );
}

export default SecurityAuditDashboard;
