import React from 'react';
import {
  X,
  History,
  Info,
  Beaker,
  FileText,
  HelpCircle,
  Activity,
  Package,
  Clock,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ExtendedPOP } from '../types';

interface POPsReadingDialogProps {
  readingPop: ExtendedPOP | null;
  onClose: () => void;
  isCompareMode: boolean;
  setIsCompareMode: (val: boolean) => void;
  selectedDiffVersion: string;
  setSelectedDiffVersion: (val: string) => void;
  isSuggestOpen: boolean;
  setIsSuggestOpen: (val: boolean) => void;
  suggestionProposal: string;
  setSuggestionProposal: (val: string) => void;
  onSuggestAlteration: () => void;
  agenda: any[];
  inventory: any;
  onNavigate: (path: string) => void;
}

export function POPsReadingDialog({
  readingPop,
  onClose,
  isCompareMode,
  setIsCompareMode,
  selectedDiffVersion,
  setSelectedDiffVersion,
  isSuggestOpen,
  setIsSuggestOpen,
  suggestionProposal,
  setSuggestionProposal,
  onSuggestAlteration,
  agenda,
  inventory,
  onNavigate,
}: POPsReadingDialogProps) {
  if (!readingPop) return null;

  const activeVersions = readingPop.versions || [
    { version: '1.0', date: readingPop.createdAt, change: 'Homologação primordial e publicação original.' },
  ];

  const readingMatchingAgenda = (agenda || []).filter(
    (e) =>
      e.title?.toLowerCase().includes((readingPop.pestType || '').toLowerCase()) ||
      e.title?.toLowerCase().includes((readingPop.category || '').toLowerCase())
  );

  const readingActiveProducts = (inventory?.products || []).filter((p: any) =>
    readingPop.requiredProducts?.some((req: any) => {
      const name = typeof req === 'string' ? req : req?.productName || '';
      return name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(name.toLowerCase());
    })
  );

  const recentAccesses = [
    { user: 'Marcio Souza (Técnico)', date: 'Segunda-feira, 14:12', client: 'Condomínio Spazio', action: 'Visualização' },
    { user: 'Roberto Dias (Diretor)', date: 'Ontem, 09:45', client: 'Revisão Técnica Corporativa', action: 'Revisão' },
  ];

  return (
    <Dialog open={!!readingPop} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        size="xl"
        showCloseButton={false}
        className="p-0 overflow-hidden max-w-5xl max-h-[92vh] flex flex-col gap-0 rounded-2xl border border-slate-250 shadow-2xl"
        id="reading-room-container"
      >
        <DialogTitle className="sr-only">{readingPop.name}</DialogTitle>
        <DialogDescription className="sr-only">
          Procedimento Operacional Padrão - {readingPop.category}
        </DialogDescription>

        {/* HEAD BAR */}
        <div className="bg-[#1B3A2D] text-white px-6 py-5 flex items-center justify-between pointer-events-auto" id="reading-room-header">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-sans font-extrabold tracking-widest text-emerald-300 uppercase">
                {readingPop.category} {readingPop.subcategory ? `> ${readingPop.subcategory}` : ''}
              </span>
              <span className="h-1 w-1 bg-white/40 rounded-full" />
              <span className="text-[10px] font-mono text-slate-300">Versão Ativa: {readingPop.version}</span>
            </div>
            <h3 className="font-extrabold text-white text-lg font-sans tracking-tight leading-tight">{readingPop.name}</h3>
          </div>
          <button
            onClick={() => {
              onClose();
              setIsCompareMode(false);
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
            id="btn-close-reader"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* DUAL-COLUMN CONTENT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto" id="reading-content-splitter">
          {/* MAIN PANEL (LEFT 70% / 8 columns) */}
          <div className="lg:col-span-8 p-6 space-y-6 border-r border-slate-100 min-h-[450px]" id="reader-primary-pane">
            {isCompareMode ? (
              /* HISTORICAL VERSION COMPARE SCREEN */
              <div className="space-y-4" id="version-diff-container">
                <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <History className="size-4 text-emerald-600" /> Comparando alterações da versão
                  </span>
                  <select
                    value={selectedDiffVersion}
                    onChange={(e) => setSelectedDiffVersion(e.target.value)}
                    className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[11px] font-semibold text-slate-700"
                  >
                    {activeVersions.map((v) => (
                      <option key={v.version} value={v.version}>
                        Versão {v.version}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rich side by side Diff simulator */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="simulated-diff-panels">
                  <div className="bg-red-50/70 rounded-xl p-4 border border-red-100 text-xs">
                    <span className="font-bold text-red-750 block border-b border-red-100 pb-1 mb-2">
                      Versão {selectedDiffVersion} anterior
                    </span>
                    <p className="font-medium text-slate-650 leading-relaxed font-sans line-through opacity-70">
                      No item 3. Pulverizar calda química de piretróides irritantes na pia com mangueira manual padrão sem regular bico difusor, concentrando defensivo bruto a 1.2%. Usar apenas botas.
                    </p>
                  </div>

                  <div className="bg-emerald-50/75 rounded-xl p-4 border border-emerald-100 text-xs">
                    <span className="font-bold text-[#1B3A2D] block border-b border-emerald-100 pb-1 mb-2">
                      Versão {readingPop.version} atualizada (Ativo)
                    </span>
                    <p className="font-medium text-slate-750 leading-relaxed font-sans">
                      No item 3.{' '}
                      <ins className="bg-emerald-150 text-[#1B3A2D] font-bold no-underline rounded px-0.5">
                        Substituir calda de piretróides por Bifentol 200SC residual,
                      </ins>{' '}
                      garantindo cobertura de rodapés perimetrais.{' '}
                      <ins className="bg-emerald-150 text-[#1B3A2D] font-bold no-underline rounded px-0.5">
                        Exigido uso obrigatório de máscara com cartucho químico de fita larga.
                      </ins>
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 text-slate-500 rounded-lg text-[11px] font-medium leading-relaxed flex items-start gap-2 border border-slate-150">
                  <Info className="size-4 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    As diferenças acima destacam as revisões e atualizações executadas pelo Gestor Técnico para fins de adequação de controle de qualidade e instruções da saúde pública de controle integrado.
                  </span>
                </div>
              </div>
            ) : (
              /* STANDARD TEXT READING VIEW & MINI DOCUMENT MOCK PREVIEWS */
              <div className="space-y-6" id="standard-manuscript-panel">
                <div className="prose prose-slate max-w-none text-left" id="markdown-instructions-scroll">
                  <div className="space-y-4">
                    <div className="p-5 bg-slate-50 border border-slate-150 rounded-xl space-y-4 font-sans text-xs">
                      <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                        <Beaker className="size-3.5 text-emerald-600" /> Dosagens e Insumos Químicos Regulamentados
                      </h4>
                      {readingPop.requiredProducts && readingPop.requiredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {readingPop.requiredProducts.map((p, pIdx) => (
                            <div key={pIdx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                              <span className="text-slate-600 font-medium truncate">{p.productName}</span>
                              <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">
                                {p.quantityPer100m2} {p.unit}/100m²
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-slate-400 italic">
                          Não há vinculação direta de insumos químicos para este POP administrativo, comercial ou financeiro.
                        </p>
                      )}
                    </div>

                    {/* Markdown render simulated area */}
                    <div
                      className="p-6 bg-white border border-slate-150 rounded-xl space-y-4 font-sans text-xs leading-relaxed max-h-[380px] overflow-y-auto whitespace-pre-wrap"
                      id="manuscript-rendered-box"
                    >
                      {readingPop.instructions}
                    </div>
                  </div>
                </div>

                {/* If file base64 is integrated */}
                {readingPop.fileUrl && (
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50-50 space-y-3 font-sans text-xs" id="file-attachments-preview-panel">
                    <span className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                      <FileText className="size-3.5 text-blue-500" /> Original do Anexo
                    </span>
                    <div className="bg-white border rounded-lg p-5 flex items-center justify-between text-left" id="attached-original-card">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-red-50 text-red-600 rounded">
                          <FileText className="size-6" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-800 text-[11px] max-w-[200px] truncate block">
                            {readingPop.fileName || 'diretriz_pop.pdf'}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">Documento Técnico Sanitário PDF</span>
                        </div>
                      </div>
                      <a
                        href={readingPop.fileUrl}
                        download={readingPop.fileName || 'diretriz_pop.pdf'}
                        className="px-3.5 py-1.5 bg-slate-50 border hover:bg-slate-100 text-slate-700 font-bold rounded-md"
                      >
                        Baixar Anexo
                      </a>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SIDE QUICK INFO TAB (RIGHT 30% / 4 columns) */}
          <div className="lg:col-span-4 p-6 space-y-6 bg-slate-50 shrink-0 font-sans text-xs text-slate-700 font-medium" id="reader-side-panel">
            <div className="space-y-3" id="quick-side-info-card">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-250 pb-2">Informações Rápidas</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-450 font-semibold">Categoria</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold">{readingPop.category}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-450 font-semibold">Status Ativo</span>
                  <span
                    className={`px-2 py-0.5 rounded text-white font-extrabold text-[10px] uppercase ${
                      readingPop.status === 'Ativo' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  >
                    {readingPop.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-450 font-semibold">Versão Atual</span>
                  <span className="font-mono font-bold text-slate-800">v{readingPop.version}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-450 font-semibold">Duração Padrão</span>
                  <span className="font-semibold text-slate-800">{readingPop.estimatedTimeHoursPer100m2} horas / 100m²</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-450 font-semibold">Revisado em</span>
                  <span className="font-semibold text-slate-800">{readingPop.lastRevision}</span>
                </div>
              </div>
            </div>

            {/* HISTORY TIMELINE */}
            <div className="space-y-4 pt-1" id="versions-history-timeline">
              <div className="flex items-center justify-between border-b border-slate-250 pb-2">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Controle de Versões</h4>
                <button
                  onClick={() => setIsCompareMode(!isCompareMode)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${
                    isCompareMode ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                  }`}
                  id="btn-trigger-compare-versions"
                >
                  {isCompareMode ? 'Fechar Comparador' : 'Comparar versões'}
                </button>
              </div>

              <div className="relative pl-3.5 border-l border-slate-200 ml-1.5 space-y-4" id="timeline-steps">
                {activeVersions.map((log, lIdx) => (
                  <div key={lIdx} className="relative" id={`timeline-item-${log.version}`}>
                    <div className="absolute -left-5 top-1.5 size-2 bg-emerald-600 rounded-full border border-white" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-semibold text-slate-400">
                        {log.date || '01/01/2026'} — v{log.version}
                      </span>
                      <p className="text-[11px] text-slate-800 font-medium leading-relaxed">{log.change}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SUGGEST REVISION INPUT BUTTON AREA (MODEL B FLOW PROCESS) */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3" id="suggestion-editor-card">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <HelpCircle className="size-4 text-emerald-600" /> Quer sugerir uma alteração?
              </span>
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                Se identificou melhorias práticas para as dosagens sanitárias de campo, insira o detalhamento para crivo técnico do Admin.
              </p>

              {isSuggestOpen ? (
                <div className="space-y-2.5" id="form-suggest-sub">
                  <textarea
                    rows={3}
                    value={suggestionProposal}
                    onChange={(e) => setSuggestionProposal(e.target.value)}
                    placeholder="Descreva seu adendo técnico aqui..."
                    className="w-full text-[11px] p-2 rounded-lg border border-slate-200 focus:outline-[#1B3A2D] leading-relaxed resize-none font-sans font-medium"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={onSuggestAlteration}
                      className="px-3 py-1.5 bg-[#1B3A2D] text-white text-[10px] font-bold rounded hover:bg-emerald-700"
                    >
                      Enviar Proposta
                    </button>
                    <button
                      onClick={() => setIsSuggestOpen(false)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded hover:bg-slate-200"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsSuggestOpen(true)}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
                  id="btn-propose-alteration"
                >
                  Sugerir Alteração
                </button>
              )}
            </div>

            {/* CONTEXT INTEGRATION PANELS */}
            <div className="space-y-4 pt-2" id="pop-reading-room-shortcuts">
              {/* RELATING SERVICES */}
              <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#1B3A2D] flex items-center gap-1.5 border-b border-slate-105 pb-1.5">
                  <Activity className="size-3.5 text-[#1B3A2D]" /> Serviços Relacionados ({readingMatchingAgenda.length})
                </h4>
                {readingMatchingAgenda.length > 0 ? (
                  <div className="space-y-2">
                    {readingMatchingAgenda.slice(0, 3).map((ev: any) => (
                      <div key={ev.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-150">
                        <span className="text-[10px] font-bold text-slate-700 truncate max-w-[150px]" title={ev.title}>
                          {ev.title}
                        </span>
                        <button
                          onClick={() => {
                            onClose();
                            onNavigate(`/agenda?eventId=${ev.id}`);
                          }}
                          className="text-[9px] bg-white border border-slate-200 hover:bg-[#1B3A2D] hover:text-white px-2 py-0.5 rounded font-semibold cursor-pointer transition-all leading-6"
                        >
                          Ver OS
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Sem OS vinculada recentemente.</p>
                )}
              </div>

              {/* RELATING PRODUCTS AND QUANTITIES */}
              <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#1B3A2D] flex items-center gap-1.5 border-b border-slate-105 pb-1.5">
                  <Package className="size-3.5 text-[#1B3A2D]" /> Produtos Relacionados ({readingActiveProducts.length})
                </h4>
                {readingActiveProducts.length > 0 ? (
                  <div className="space-y-2">
                    {readingActiveProducts.slice(0, 3).map((prod: any) => {
                      const isLow = prod.quantity <= prod.minQuantity;
                      return (
                        <div key={prod.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-150">
                          <div className="space-y-0.5 text-left truncate max-w-[140px]">
                            <span className="text-[10px] font-bold text-slate-700 block truncate">{prod.name}</span>
                            <span className={`text-[9px] font-bold block ${isLow ? 'text-red-600 animate-pulse font-extrabold' : 'text-emerald-700'}`}>
                              Qtd: {prod.quantity} {prod.unit}
                            </span>
                          </div>
                          <button
                            onClick={() => {
                              onClose();
                              onNavigate(`/inventory?search=${encodeURIComponent(prod.name)}`);
                            }}
                            className="text-[9px] bg-white border border-slate-200 hover:bg-[#1B3A2D] hover:text-white px-2 py-0.5 rounded font-semibold cursor-pointer transition-all leading-6"
                          >
                            Ver Estoque
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-slate-400 italic">Nenhum insumo de estoque associado.</p>
                )}
              </div>

              {/* RECENT ACCESS TRAILS */}
              <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 border-b border-slate-250 pb-1 flex items-center gap-1">
                  <Clock className="size-3" /> Últimos Acessos ao POP
                </h4>
                <div className="space-y-1.5">
                  {recentAccesses.map((acc, aIdx) => (
                    <div key={aIdx} className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-1 last:border-0">
                      <span className="font-semibold text-slate-700 truncate max-w-[120px]">{acc.user}</span>
                      <span className="text-[9px] text-[#1B3A2D] font-bold">
                        {acc.action} · <span className="text-slate-400 font-medium">{acc.date}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM FOOT ACTIONS */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-2.5" id="reading-room-footer">
          <button
            onClick={() => {
              onClose();
              setIsCompareMode(false);
            }}
            className="px-5 py-2.5 bg-[#1B3A2D] text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition"
          >
            Concluído a Leitura
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
