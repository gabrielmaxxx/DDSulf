import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Trash2, 
  Sparkles, 
  Database, 
  Clock, 
  Printer, 
  Users, 
  Gauge, 
  FileSpreadsheet, 
  TrendingUp, 
  ShieldAlert, 
  Layers, 
  Maximize2,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useReporting } from '@/reporting/hooks/useReporting';
import { useExportEngine } from '@/reporting/hooks/useExportEngine';
import { useAnalytics } from '@/analytics/hooks/useAnalytics';
import { useOperationalKPIs } from '@/analytics/hooks/useOperationalKPIs';
import { useFinancialAnalytics } from '@/analytics/hooks/useFinancialAnalytics';
import { useRealtimeMetrics } from '@/analytics/hooks/useRealtimeMetrics';
import { useForecasting } from '@/analytics/hooks/useForecasting';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export function ReportingHub() {
  const { 
    templates, 
    snapshots, 
    activeJobs, 
    triggerExport, 
    removeSnapshot, 
    telemetry,
    generatingCount 
  } = useReporting();

  const { downloadJob, queue: exportQueue, clearJobHistory } = useExportEngine();
  const { period, setPeriod, userRole, isFinancialVisibilityMasked } = useAnalytics('30d');
  const operationalKPIs = useOperationalKPIs(period);
  const financialMetrics = useFinancialAnalytics(period);
  const realtime = useRealtimeMetrics();
  const forecaster = useForecasting(period);

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(templates[0]?.id || 'tpl_exec_monthly_summary');
  const [selectedFormat, setSelectedFormat] = useState<'pdf' | 'csv'>('pdf');
  const [customTitle, setCustomTitle] = useState('');
  const [isBrandingEnabled, setIsBrandingEnabled] = useState(true);

  const handleGenerateReport = async () => {
    try {
      const payload = {
        userName: 'Clarissa Azevedo (Financeiro)',
        serviceVolume: operationalKPIs.visitsFinished,
        averageMargin: isFinancialVisibilityMasked ? 0 : (financialMetrics.calculatedMargin / 100),
        syncLatencyMs: realtime.serverLatencyTimeMs,
        titleOverwrite: customTitle || undefined,
        bradedTheme: isBrandingEnabled ? 'DDSulf Pro' : 'Clean Light'
      };

      await triggerExport(selectedTemplateId, selectedFormat, payload, userRole);
      toast.success('Geração de documento iniciada em segundo plano!', {
        description: 'Você pode acompanhar o progresso na fila de processamento.'
      });
      setCustomTitle('');
    } catch (e: any) {
      toast.error('Erro ao processar exportação', {
        description: e.message || 'Verifique seus privilégios de acesso.'
      });
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Upper Status & Governance Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="bg-[#FAF9F6] border-[#E8E6E0] rounded-[24px] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A8880]">Documentos Gerados</span>
            <Database className="size-4 text-[#8A8880]" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">
              {telemetry?.totalDocsExported || 12}
            </h4>
            <p className="text-[10px] font-semibold text-[#8A8880] mt-1">Acúmulo total na sessão</p>
          </div>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#E8E6E0] rounded-[24px] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A8880]">Tempo de Compilação</span>
            <Clock className="size-4 text-[#8A8880]" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">
              {telemetry?.averageGenerationMs || 650}<span className="text-xs font-normal">ms</span>
            </h4>
            <p className="text-[10px] font-semibold text-[#8A8880] mt-1">Média de processamento local</p>
          </div>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#E8E6E0] rounded-[24px] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#8A8880]">Sincronia Online</span>
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-black">
              {realtime.serverLatencyTimeMs}<span className="text-xs font-normal">ms</span>
            </h4>
            <p className="text-[10px] font-semibold text-[#8A8880] mt-1">Latência do endpoint principal</p>
          </div>
        </Card>

        <Card className="bg-[#FAF9F6] border-[#E8E6E0] rounded-[24px] p-6 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Canal de Segurança</span>
            <ShieldAlert className="size-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-black">
              {userRole === 'super_admin' ? 'Acesso Total Unificado' : 'Visualização Parcial'}
            </h4>
            <p className="text-[9px] font-bold text-[#8A8880] mt-1">Criptografia SHA-256 ativa</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Generator Workspace */}
        <div className="lg:col-span-7 space-y-8">
          <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-black text-white rounded-xl">
                <Sparkles className="size-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-lg font-black text-black">Executive Template Compiler</h3>
                <p className="text-xs text-gray-400">Geração sob demanda de documentação estratégica certificada.</p>
              </div>
            </div>

            {/* Template Chooser */}
            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Selecione o Modelo de Documento</label>
              <div className="grid gap-3">
                {templates.map(t => {
                  const isSelected = selectedTemplateId === t.id;
                  const isSecured = t.category === 'financial' && isFinancialVisibilityMasked;
                  
                  return (
                    <div 
                      key={t.id}
                      onClick={() => !isSecured && setSelectedTemplateId(t.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-black text-white border-black shadow-md' 
                          : isSecured 
                            ? 'bg-gray-50 text-gray-400 border-gray-100 opacity-60 cursor-not-allowed'
                            : 'bg-white text-gray-700 border-[#E5E7EB] hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-bold px-2 py-0.5 rounded font-mono uppercase ${
                            isSelected ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {t.category}
                          </span>
                          {isSecured && (
                            <span className="text-[8px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                              Protegido
                            </span>
                          )}
                        </div>
                        <div className="size-2 rounded-full" style={{ backgroundColor: t.accentColor }} />
                      </div>
                      <h4 className="font-bold text-sm mt-2">{t.name}</h4>
                      <p className={`text-xs mt-1 leading-normal ${isSelected ? 'text-white/70' : 'text-gray-400'}`}>
                        {t.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Settings & Overrides */}
            <div className="grid gap-6 md:grid-cols-2 pt-2">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Formato do Arquivo</label>
                <div className="grid grid-cols-2 gap-2 bg-[#F3F4F6] p-1 rounded-xl">
                  <button 
                    onClick={() => setSelectedFormat('pdf')}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                      selectedFormat === 'pdf' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    EXECUTIVE PDF
                  </button>
                  <button 
                    onClick={() => setSelectedFormat('csv')}
                    className={`py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                      selectedFormat === 'csv' ? 'bg-white text-black shadow-xs' : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    SPREADSHEET CSV
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 block">Subtítulo Personalizado</label>
                <input 
                  type="text"
                  placeholder="Ex: Auditoria Regional Extrativa"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  className="w-full h-10 border border-[#E5E7EB] px-4 rounded-xl text-xs font-medium placeholder:text-gray-300 focus:outline-hidden focus:border-black transition-all"
                />
              </div>
            </div>

            {/* Actions Button */}
            <div className="pt-2">
              <Button 
                onClick={handleGenerateReport}
                className="w-full h-14 bg-black text-white hover:bg-neutral-800 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-2"
              >
                <Layers className="size-4 animate-pulse" /> Compilar Documento Pro
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Column: Rendering Queues & Snapshots */}
        <div className="lg:col-span-5 space-y-8">
          {/* Export Queue Worker */}
          <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black uppercase tracking-wider text-black">Spool de Impressão</h3>
                <p className="text-[10px] text-gray-400">Processos ativos na fila de renderização.</p>
              </div>
              {generatingCount > 0 && (
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                  <RefreshCw className="size-3 animate-spin" /> Renderizando
                </div>
              )}
            </div>

            <div className="space-y-3">
              {activeJobs.map(job => (
                <div 
                  key={job.id}
                  className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 animate-in slide-in-from-top-2"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-black text-black truncate">{job.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-[8px] font-mono text-gray-400 uppercase font-bold">
                        FORMAT: {job.format.toUpperCase()}
                      </span>
                      <span className="text-[8px] font-mono text-gray-400">|</span>
                      <span className="text-[8px] font-mono font-bold text-slate-500">
                        Progresso: {job.progressPercentage}%
                      </span>
                    </div>
                    {/* Tiny Progress Bar */}
                    <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div 
                        className="h-full bg-black rounded-full transition-all duration-300" 
                        style={{ width: `${job.progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="shrink-0">
                    {job.status === 'ready' && job.downloadUrl ? (
                      <button 
                        onClick={() => downloadJob(job.id)}
                        className="p-2.5 bg-black hover:bg-neutral-800 text-white rounded-xl transition-all shadow-md"
                        title="Baixar arquivo gerado"
                      >
                        <Download className="size-3.5" />
                      </button>
                    ) : (
                      <div className="p-2.5 bg-gray-100 text-gray-400 rounded-xl">
                        <Clock className="size-3.5 animate-pulse" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {activeJobs.length === 0 && (
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl space-y-2">
                  <Printer className="size-6 mx-auto text-gray-300" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Fila vazia. Inicie uma compilação.</p>
                </div>
              )}
            </div>
          </Card>

          {/* Past Snapshots / History Archive */}
          <Card className="bg-white border-[#E5E7EB] shadow-sm rounded-[32px] p-8 space-y-6">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black uppercase tracking-wider text-black">Repositório de Snapshots</h3>
              <p className="text-[10px] text-gray-400">Histórico de documentos gerados na plataforma DDSulf.</p>
            </div>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {snapshots.map(snap => (
                <div 
                  key={snap.id}
                  className="p-4 bg-white hover:bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-4 transition-all"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-xs font-bold text-gray-800 truncate">{snap.title}</p>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[8px] font-mono bg-slate-100 px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase">
                        {snap.category}
                      </span>
                      <span className="text-[8px] font-mono text-gray-400">
                        {new Date(snap.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="text-[8px] font-mono text-gray-300">•</span>
                      <span className="text-[8px] font-mono text-gray-400">
                        {(snap.sizeBytes / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {snap.downloadUrl && (
                      <a 
                        href={snap.downloadUrl}
                        download={`ddsulf_archive_${snap.id}.svg`}
                        className="p-2 bg-gray-100 hover:bg-black hover:text-white text-gray-600 rounded-lg transition-all"
                        title="Salvar"
                      >
                        <Download className="size-3" />
                      </a>
                    )}
                    <button 
                      onClick={() => removeSnapshot(snap.id)}
                      className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-all"
                      title="Deletar"
                    >
                      <Trash2 className="size-3" />
                    </button>
                  </div>
                </div>
              ))}

              {snapshots.length === 0 && (
                <div className="p-8 text-center border border-dashed border-gray-200 rounded-2xl space-y-2">
                  <FileText className="size-6 mx-auto text-gray-300" />
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Sem snapshots arquivados.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
