import React from 'react';
import { 
  Percent, 
  Clock, 
  Users, 
  FileUp, 
  Sparkles, 
  Sparkle, 
  AlertTriangle,
  ArrowRight,
  Briefcase
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { FileUpload, UploadedFile } from '@/components/FileUpload';
import { Quote } from '@/store';
import { Button } from '@/components/ui/button';

export interface FinancialDetailedAnalysisProps {
  profitabilityByService: Array<{
    id: string;
    name: string;
    revenue: number;
    costs: number;
    margin: number;
    qty: number;
  }>;
  serviceRankings: {
    highest: { id: string; name: string; margin: number } | null;
    lowest: { id: string; name: string; margin: number } | null;
  };
  operationalGuaranteeMetrics: {
    qty: number;
    cost: number;
    productsConsumed: string | number;
    hoursSpent: string | number;
    revWastePercent: number;
  };
  warrantyQuotes: Quote[];
  defaultDelinquentClients: Array<{
    id: string;
    name: string;
    value: number;
    daysOverdue: number;
    details: string;
  }>;
  totalDelinquencyVolume: number;
  onOpenClientDetails: (clientId: string) => void;
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
  financialInsightsMessages: Array<{
    type: 'critical' | 'attention' | 'positive';
    text: string;
  }>;
  onNavigateToServicos?: () => void;
}

export function FinancialDetailedAnalysis({
  profitabilityByService,
  serviceRankings,
  operationalGuaranteeMetrics,
  warrantyQuotes,
  defaultDelinquentClients,
  totalDelinquencyVolume,
  onOpenClientDetails,
  uploadedFiles,
  onFilesChange,
  financialInsightsMessages,
  onNavigateToServicos
}: FinancialDetailedAnalysisProps) {
  return (
    <div className="space-y-4 text-left" id="secao-analises">
      <div className="flex items-center justify-between pt-2">
        <h3 className="text-base font-black uppercase text-slate-700 tracking-wider font-display">
          Análises e Avaliações Estratégicas
        </h3>
        <span className="text-[11px] font-semibold text-slate-400">
          5 módulos de aprofundamento analítico
        </span>
      </div>

      {/* 1. Rentabilidade por Serviço (Default Open so operators see critical margin stats) */}
      <CollapsibleSection
        title="Rentabilidade por Tipo de Inseticidas / Serviços"
        description="Margens líquidas calculadas após descontar compras de insumos e tempo técnico rural."
        icon={Percent}
        badge={`${profitabilityByService.length} serviços`}
        defaultOpen={true}
        variant="card"
        headerActions={
          onNavigateToServicos && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onNavigateToServicos}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-[#1B3A2D] border-[#1B3A2D]/20 hover:bg-[#1B3A2D]/5 h-8 px-3 rounded-xl cursor-pointer"
            >
              <span>Ver DRE Completo</span>
              <ArrowRight className="size-3.5" />
            </Button>
          )
        }
      >
        <div className="space-y-4 pt-1">
          {serviceRankings.highest && serviceRankings.lowest && (
            <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
              <div className="bg-emerald-50/50 border border-emerald-150 rounded-xl p-3">
                <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest block">
                  Líder em Margem
                </span>
                <h5 className="font-extrabold text-slate-900 mt-1">{serviceRankings.highest.name}</h5>
                <span className="font-mono text-emerald-700 font-extrabold block text-sm mt-0.5">
                  {serviceRankings.highest.margin.toFixed(2)}%
                </span>
              </div>
              <div className="bg-amber-50/50 border border-amber-150 rounded-xl p-3">
                <span className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest block">
                  Margem Crítica (Diluição)
                </span>
                <h5 className="font-extrabold text-slate-900 mt-1">{serviceRankings.lowest.name}</h5>
                <span className="font-mono text-amber-700 font-extrabold block text-sm mt-0.5">
                  {serviceRankings.lowest.margin.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {/* Split Grid for Table and Bar Chart side-by-side */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-2">
            {/* Left: Table */}
            <div className="xl:col-span-7 overflow-x-auto">
              <table className="w-full text-xs font-sans">
                <thead>
                  <tr className="bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-2.5 px-3 text-left">Canal / Serviço</th>
                    <th className="py-2.5 px-3 text-right">Faturamento</th>
                    <th className="py-2.5 px-3 text-right">Custos Diretos</th>
                    <th className="py-2.5 px-3 text-right">Margem Pura</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profitabilityByService.map((srv) => {
                    const isHighest = serviceRankings.highest?.id === srv.id;
                    const isLowest = serviceRankings.lowest?.id === srv.id;
                    return (
                      <tr key={srv.id} className="hover:bg-slate-50/30 font-medium">
                        <td className="py-3 px-3">
                          <div className="space-y-0.5">
                            <p className="font-semibold text-slate-800">{srv.name}</p>
                            <p className="text-[10px] text-slate-400">{srv.qty} execuções no período</p>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          R$ {srv.revenue.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-slate-500">
                          R$ {srv.costs.toLocaleString('pt-BR')}
                        </td>
                        <td className="py-3 px-3 text-right font-mono">
                          <span
                            className={`px-2 py-0.5 rounded-lg border font-bold ${
                              isHighest
                                ? 'bg-[#EBFDF5] border-emerald-250 text-emerald-800'
                                : isLowest
                                ? 'bg-rose-50 border-rose-200 text-rose-800'
                                : 'bg-slate-50 border-slate-200 text-slate-700'
                            }`}
                          >
                            {srv.margin.toFixed(2)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Right: Bar Chart */}
            <div className="xl:col-span-5 bg-[#FAF9F5]/70 border border-slate-200/55 p-5 rounded-2xl flex flex-col justify-between">
              <div className="space-y-1 mb-4 text-left">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                  Comparativo de Margem da Carteira
                </h4>
                <p className="text-[11px] text-slate-500 leading-normal">
                  Representação visual do aproveitamento líquido real por tipo de atendimento.
                </p>
              </div>

              <div className="h-[210px] w-full" id="rentabilidade-chart-holder">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={profitabilityByService}
                    margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" />
                    <XAxis
                      dataKey="name"
                      stroke="#6B6B5F"
                      style={{ fontSize: '9px', fontWeight: 'bold' }}
                    />
                    <YAxis
                      stroke="#6B6B5F"
                      style={{ fontSize: '9px' }}
                      tickFormatter={(val) => `${val}%`}
                      domain={[0, 100]}
                    />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Margem de Lucro']}
                      contentStyle={{
                        borderRadius: '12px',
                        borderColor: '#E8E6E1',
                        backgroundColor: '#FFF',
                        fontSize: '11px',
                        textAlign: 'left',
                      }}
                    />
                    <Bar dataKey="margin" radius={[4, 4, 0, 0]} barSize={26}>
                      {profitabilityByService.map((entry, index) => {
                        const isHighest = serviceRankings.highest?.id === entry.id;
                        const isLowest = serviceRankings.lowest?.id === entry.id;
                        let fillColor = '#A8CDB8';
                        if (isHighest) fillColor = '#1B3A2D';
                        if (isLowest) fillColor = '#C1361A';
                        return <Cell key={`cell-${index}`} fill={fillColor} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-col gap-2.5 text-[10.5px] text-slate-600 border-t border-slate-200/50 pt-3 mt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block size-2 rounded-xs" style={{ backgroundColor: '#1B3A2D' }} />
                    <span className="font-medium text-slate-500">Maior Margem (Performance Top)</span>
                  </div>
                  <span className="font-bold text-slate-800">{serviceRankings.highest?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block size-2 rounded-xs" style={{ backgroundColor: '#C1361A' }} />
                    <span className="font-medium text-slate-500">Menor Desempenho (Alerta/Gargalo)</span>
                  </div>
                  <span className="font-bold text-slate-800">{serviceRankings.lowest?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-block size-2 rounded-xs" style={{ backgroundColor: '#A8CDB8' }} />
                    <span className="font-medium text-slate-500">Outros Procedimentos Padrão</span>
                  </div>
                  <span className="text-slate-400 font-medium">Margem Saudável</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      {/* 2. Garantias - Retornos */}
      <CollapsibleSection
        title="Análise de Qualidade Operacional e Garantias"
        description="Acompanhamento de chamados de re-visitas sem faturamento que consomem reagentes e horas extras."
        icon={Clock}
        badge={`${operationalGuaranteeMetrics.qty} retornos`}
        defaultOpen={false}
        variant="card"
      >
        <div className="space-y-4 pt-1">
          <div className="grid gap-3 sm:grid-cols-4 text-center">
            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4">
              <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">
                Qtde Retornos
              </span>
              <h4 className="text-2xl font-black font-semibold text-[#141410] font-mono mt-1">
                {operationalGuaranteeMetrics.qty}
              </h4>
            </div>

            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4">
              <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">
                Custo Gerado
              </span>
              <h4 className="text-xl font-black font-mono text-rose-700 mt-1.5">
                R$ {operationalGuaranteeMetrics.cost}
              </h4>
            </div>

            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4">
              <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">
                Químicos Cons.
              </span>
              <h4 className="text-xl font-black font-semibold text-slate-800 font-mono mt-1.5">
                {operationalGuaranteeMetrics.productsConsumed}
              </h4>
            </div>

            <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4">
              <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">
                Horas Gastas
              </span>
              <h4 className="text-xl font-black font-semibold text-slate-800 font-mono mt-1.5">
                {operationalGuaranteeMetrics.hoursSpent}
              </h4>
            </div>
          </div>

          <div className="bg-[#FFFDEB] border border-[#FFE9A3] p-4 rounded-2xl text-xs space-y-1 text-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-amber-800">
              <AlertTriangle className="size-3.5" />
              <span>Impacto de Retornos sobre Receitas Totais</span>
            </div>
            <p className="leading-relaxed opacity-95">
              Garantias operacionais e re-dedetizações custaram{' '}
              <span className="font-bold underline text-[#C1361A]">
                R$ {operationalGuaranteeMetrics.cost.toLocaleString('pt-BR')}
              </span>{' '}
              ao caixa corporativo este mês. Isso causou vazamento de faturamento bruto equivalente a{' '}
              <span className="font-bold">{operationalGuaranteeMetrics.revWastePercent.toFixed(2)}%</span>.
            </p>
          </div>

          {warrantyQuotes.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-3 space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block">
                Lista de Atendimentos em Garantia ({warrantyQuotes.length})
              </span>
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                {warrantyQuotes.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-slate-800 block truncate">{q.client.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {q.service.serviceType || q.service.pestType || 'Retorno de Garantia'} •{' '}
                        {q.createdAt.slice(0, 10)}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-rose-700 block font-mono">
                        R${' '}
                        {(q.returnCost || q.costs?.total || 180).toLocaleString('pt-BR', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                      <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                        Garantia OS #{q.parentQuoteId || q.id}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* 3. Inadimplência / Contas em Atraso */}
      <CollapsibleSection
        title="Carteira de Recebíveis em Atraso (Cobrança Ativa)"
        description="Visualização de faturamentos de serviços confirmados em atraso com duplicata em cobrança."
        icon={Users}
        badge={`R$ ${totalDelinquencyVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em atraso`}
        defaultOpen={false}
        variant="card"
      >
        <div className="overflow-x-auto pt-1">
          <table className="w-full text-xs font-sans">
            <thead>
              <tr className="bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3">Cliente Operador</th>
                <th className="py-2.5 px-3 text-right font-semibold">Duplicata R$</th>
                <th className="py-2.5 px-3 text-center">Inadimplente</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {defaultDelinquentClients.map((cli) => (
                <tr key={cli.id} className="hover:bg-slate-50/30">
                  <td className="py-3 px-3">
                    <div className="space-y-0.5">
                      <p className="font-bold text-slate-800">{cli.name}</p>
                      <p className="text-[10px] text-slate-400">{cli.details}</p>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-extrabold text-[#C1361A]">
                    R$ {cli.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-lg">
                      {cli.daysOverdue} dias
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onOpenClientDetails(cli.id)}
                      className="px-3 py-1.5 bg-[#FAF9F5] border border-slate-200 rounded-lg hover:border-[#1B3A2D] hover:bg-[#1B3A2D] hover:text-white transition-all text-[10.5px] font-black uppercase tracking-wider cursor-pointer"
                    >
                      Abrir Cliente
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* 4. Documentos Fiscais */}
      <CollapsibleSection
        title="Lançamento de Boletos, Contratos e Notas Fiscais"
        description="Organize sua central de furos de caixa rurais anexando arquivos operacionais no painel."
        icon={FileUp}
        badge={`${uploadedFiles.length} documentos`}
        defaultOpen={false}
        variant="card"
      >
        <div className="pt-2">
          <FileUpload files={uploadedFiles} onFilesChange={onFilesChange} maxFiles={6} />
        </div>
      </CollapsibleSection>

      {/* 5. PestFlow Advanced Financial Advisor (IA Insights) */}
      <CollapsibleSection
        title="PestFlow Advanced Financial Advisor"
        description="Gatilhos operacionais interpretados pela IA baseados nos furos do Plano de Contas."
        icon={Sparkles}
        badge="IA Ativa"
        defaultOpen={false}
        variant="card"
        className="border-[#2D6A4F]/40"
      >
        <div className="bg-[#1B3A2D] text-white p-5 rounded-2xl border border-[#2D6A4F] shadow-sm">
          <div className="flex items-center gap-2.5 border-b border-[#2D6A4F] pb-3 mb-3">
            <div className="p-1.5 bg-white/10 rounded-lg">
              <Sparkles className="size-4 text-yellow-400" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-black uppercase tracking-widest text-[#A8CDB8]">
                Diagnósticos e Recomendações em Tempo Real
              </h4>
              <p className="text-[10.5px] text-emerald-150/80">
                Cruzamento de despesas fixas, CMV de pesticidas e prazos médios de recebimento.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 text-left text-xs font-sans">
            {financialInsightsMessages.map((ins, index) => (
              <div
                key={index}
                className="bg-white/5 border border-white/10 p-3 rounded-xl leading-relaxed flex gap-2.5 items-start"
              >
                <Sparkle
                  className={`size-3 shrink-0 mt-0.5 ${
                    ins.type === 'critical'
                      ? 'text-red-400'
                      : ins.type === 'attention'
                      ? 'text-yellow-400'
                      : 'text-emerald-400'
                  }`}
                />
                <p className="opacity-95 text-[11px] leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
