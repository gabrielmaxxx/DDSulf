import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  Activity, 
  RefreshCw, 
  AlertOctagon, 
  ShieldAlert, 
  Signal, 
  Zap, 
  CheckCircle,
  TrendingUp,
  Server,
  Network
} from 'lucide-react';
import { 
  usePerformanceMonitoring, 
  useRealtimeSync, 
  useOfflineQueue, 
  useResilience, 
  useOperationalCache 
} from '@/infrastructure';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';

export function InfrastructureMonitor() {
  const { snapshot, aggregatedReads, aggregatedWrites, cacheRatio } = usePerformanceMonitoring();
  const { syncQueueSize, syncedCount, lastSyncedAt, triggerManualSync, isFullySynced } = useRealtimeSync();
  const { offlineOperations, pushToBuffer, clearBuffer } = useOfflineQueue();
  const { reports, systemHealth, simulateSafeRecovery } = useResilience();
  const { clearAllCache } = useOperationalCache();

  const [simulatedDocId, setSimulatedDocId] = useState('doc_001');

  const handleSimulateOfflineWrite = () => {
    pushToBuffer('services_checklist', 'checklist_' + Math.random().toString(36).substr(2, 9), 'create', {
      timestamp: Date.now(),
      status: 'pending_sync',
      operator: 'Rodrigo Antunes'
    });
    toast.success('Escrita offline bufferizada com sucesso!', {
      description: 'Salvo em localStorage. Será reconciliado quando a rede estabilizar.'
    });
  };

  const handleSimulateCrash = () => {
    simulateSafeRecovery(
      'FirebaseStorageController',
      'ERR_CONNECTION_TIMEOUT: Firestore remote endpoint reached maximum timeout boundary.'
    );
    toast.warning('Exceção capturada e isolada pelo ErrorBoundary!', {
      description: 'O sistema permaneceu totalmente operacional em modo degradado.'
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-[#9CA3AF]">Backbone Observability & Telemetry</span>
        <h2 className="text-3xl font-black text-black">Infraestrutura Enterprise & Performance</h2>
        <p className="text-gray-500 text-sm max-w-3xl">Painel de telemetria em tempo real para auditoria de conexões de banco, latência de rede, e buffers de escrita offline do PestFlow.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-white border-[#E5E7EB] rounded-3xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">FPS do Renderizador</span>
            <Cpu className="size-4 text-emerald-500" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">{snapshot.fps} <span className="text-sm font-normal text-gray-400">FPS</span></h4>
            <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden mt-2">
              <div className="h-full bg-emerald-500" style={{ width: `${(snapshot.fps / 60) * 100}%` }} />
            </div>
          </div>
        </Card>

        <Card className="bg-white border-[#E5E7EB] rounded-3xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Latência do Firestore</span>
            <Signal className="size-4 text-indigo-500" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">{snapshot.apiLatencyMs} <span className="text-sm font-normal text-gray-400">ms</span></h4>
            <p className="text-[9px] font-bold text-[#10B981] mt-1">Conexão direta HTTP2/Pipelined</p>
          </div>
        </Card>

        <Card className="bg-white border-[#E5E7EB] rounded-3xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Escritas Pendentes</span>
            <Database className="size-4 text-amber-500" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">{syncQueueSize} <span className="text-sm font-normal text-gray-400">no buffer</span></h4>
            <p className="text-[9px] font-bold text-gray-400 mt-1">Filas resilientes em localStorage</p>
          </div>
        </Card>

        <Card className="bg-white border-[#E5E7EB] rounded-3xl p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Taxa de Acerto (Cache)</span>
            <Zap className="size-4 text-indigo-500" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">{cacheRatio}%</h4>
            <p className="text-[9px] font-bold text-indigo-600 mt-1">Evita queries redundantes no Firestore</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8 space-y-6">
          {/* Operations & Control Console */}
          <Card className="bg-white border-[#E5E7EB] rounded-[32px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-black">Ações de Resiliência & Sandbox</h3>
                <p className="text-xs text-gray-400">Teste as capacidades nativas de offline-first, isolamento de bugs e sincronismo sem perdas.</p>
              </div>
              <Server className="size-5 text-gray-400" />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <Button 
                onClick={handleSimulateOfflineWrite}
                className="h-14 bg-black hover:bg-neutral-800 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col justify-center gap-1 active:scale-95 transition-all"
              >
                <span>Simular Escrita Offline</span>
                <span className="text-[8px] opacity-60 font-mono">Buffer em localStorage</span>
              </Button>

              <Button 
                onClick={handleSimulateCrash}
                variant="outline"
                className="h-14 border-[#E5E7EB] hover:bg-rose-50 hover:text-rose-600 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col justify-center gap-1 active:scale-95 transition-all"
              >
                <span>Provocar Timeout IA</span>
                <span className="text-[8px] opacity-60 font-mono">Isolar Exceção</span>
              </Button>

              <Button 
                onClick={() => {
                  clearAllCache();
                  toast.success('Histórico de Cache SWR invalidado!');
                }}
                variant="outline"
                className="h-14 border-[#E5E7EB] hover:bg-gray-50 rounded-2xl font-black text-[10px] uppercase tracking-widest flex flex-col justify-center gap-1 active:scale-95 transition-all"
              >
                <span>Limpar Cache SWR</span>
                <span className="text-[8px] opacity-60 font-mono">Nivelar Queries</span>
              </Button>
            </div>

            {/* Offline write queue table */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase text-black tracking-wider">Buffer de Filas Ativo ({offlineOperations.length})</h4>
                {offlineOperations.length > 0 && (
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={triggerManualSync}
                      className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-black uppercase tracking-widest"
                    >
                      Processar Lote
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={clearBuffer}
                      className="h-8 border-[#E5E7EB] hover:bg-gray-50 rounded-lg text-[9px] font-black uppercase tracking-widest"
                    >
                      Esvaziar
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                {offlineOperations.map(op => (
                  <div key={op.docId} className="p-4 bg-gray-50 border border-[#F3F4F6] rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <span className="font-mono text-[9px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded mr-2 uppercase font-bold">
                        {op.operation}
                      </span>
                      <span className="font-semibold text-gray-800 mr-2">{op.collection}</span>
                      <span className="text-gray-400 font-mono">Ref: {op.docId}</span>
                    </div>
                    <span className="text-amber-600 font-bold font-mono text-[10px] animate-pulse">● Aguardando Rede</span>
                  </div>
                ))}

                {offlineOperations.length === 0 && (
                  <div className="p-8 text-center border border-dashed border-gray-100 rounded-2xl">
                    <CheckCircle className="size-5 mx-auto text-emerald-500 mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Fila limpa e sincronizada com Cloud Run / Firestore</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
          {/* Health Status card */}
          <Card className="bg-black text-white rounded-[32px] p-8 space-y-6 relative overflow-hidden">
            <div className="relative z-10 space-y-4">
              <span className="text-[9px] font-bold bg-white/20 px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                Estado da Infraestrutura
              </span>
              <h3 className="text-2xl font-black">
                {systemHealth === 'healthy' ? 'Sistema Nominal' : 'Modo Degradado'}
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-medium">
                Mapeamento do motor de conexões de banco e tolerância a falhas. Isolamento inteligente e retenção do tráfego do Cloud Run ativados.
              </p>
              <div className="flex items-center gap-3 pt-2 text-[10px] font-mono font-black text-emerald-400">
                <Network className="size-4" />
                <span>Consumo de Firestore: {aggregatedReads + aggregatedWrites} reads/writes</span>
              </div>
            </div>
            <div className="absolute -bottom-12 -right-12 size-48 bg-emerald-500/10 rounded-full blur-[40px]" />
          </Card>

          {/* Realtime Crash reporting trace info */}
          <Card className="bg-white border-[#E5E7EB] rounded-3xl p-6 space-y-4">
            <h4 className="text-xs font-black uppercase text-black tracking-widest">Tracing Diagnóstico Ativo</h4>
            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
              {reports.map(rep => (
                <div key={rep.id} className="p-3 bg-rose-50 border border-rose-100 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-[9px] font-black text-rose-700 uppercase">
                    <span>Módulo: {rep.module}</span>
                    <span className="font-mono">{new Date(rep.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-[10px] text-rose-900 leading-tight font-medium">{rep.errorMessage}</p>
                </div>
              ))}

              {reports.length === 0 && (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <Activity className="size-4 mx-auto text-gray-300 animate-pulse" />
                  <p className="text-[9px] font-bold uppercase tracking-wider">Nenhum evento crítico registrado.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
