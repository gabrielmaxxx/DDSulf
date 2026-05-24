/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { Check, X, ShieldAlert, Sparkles, TrendingUp, Hand, HardHat } from 'lucide-react';
import { useExecutiveRecommendations } from '../hooks/useExecutiveRecommendations';
import { RecommendationSeverity, RecommendationStatus, RecommendationCategory } from '../types';

export function DecisionEvaluator() {
  const { recommendations, approve, reject, transitionToImplemented } = useExecutiveRecommendations();

  // Stats calculation
  const pendingCount = recommendations.filter(r => r.status === 'pending_supervision').length;
  const approvedCount = recommendations.filter(r => r.status === 'approved').length;
  
  const estimatedSurplusBrl = recommendations
    .filter(r => r.status === 'approved' || r.status === 'implemented')
    .reduce((sum, r) => sum + r.estimatedImpactBrl, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="size-11 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/25">
            <Hand className="size-5.5" />
          </div>
          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Aprovações Pendentes</span>
            <span className="text-xl font-bold text-slate-100">{pendingCount} Reclamações</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="size-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/25">
            <TrendingUp className="size-5.5" />
          </div>
          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Impacto de Retomada Estimado</span>
            <span className="text-xl font-bold text-slate-100">R$ {estimatedSurplusBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="size-11 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 shrink-0 border border-sky-500/25">
            <HardHat className="size-5.5" />
          </div>
          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Supervisão Ativa</span>
            <span className="text-xl font-bold text-slate-100">Human-In-The-Loop</span>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => {
          const isPending = rec.status === RecommendationStatus.PENDING_SUPERVISION;
          const isApproved = rec.status === RecommendationStatus.APPROVED;
          const isRejected = rec.status === RecommendationStatus.REJECTED;
          const isImplemented = rec.status === RecommendationStatus.IMPLEMENTED;

          return (
            <div 
              key={rec.id} 
              className={`p-6 bg-slate-900 rounded-3xl border transition-all duration-300 relative ${
                isApproved 
                  ? 'border-emerald-500/30 bg-slate-900/80 shadow-lg shadow-emerald-500/5' 
                  : isRejected 
                  ? 'border-rose-950/40 opacity-70'
                  : isImplemented
                  ? 'border-indigo-500/20 bg-slate-900/50'
                  : 'border-slate-800/80'
              }`}
            >
              {/* Top Row: Category + Impact */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4 border-b border-slate-800/60 pb-4">
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase tracking-widest border ${
                    rec.severity === RecommendationSeverity.HIGH 
                      ? 'bg-rose-500/15 text-rose-400 border-rose-950' 
                      : rec.severity === RecommendationSeverity.MEDIUM 
                      ? 'bg-amber-500/15 text-amber-400 border-amber-950' 
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-950'
                  }`}>
                    {rec.severity} priority
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold uppercase tracking-wider bg-slate-950 px-2.5 py-0.5 rounded-md border border-slate-800/40">
                    {rec.category}
                  </span>
                </div>

                <div className="flex items-center gap-5 font-mono text-xs">
                  <div className="text-left sm:text-right">
                    <span className="block text-[8px] text-slate-500 uppercase tracking-widest leading-none mb-1">Impacto Financeiro Líquido</span>
                    <span className="font-bold text-emerald-400 font-sans">R$ {rec.estimatedImpactBrl.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  
                  <div className="text-left sm:text-right border-l border-slate-800/80 pl-5">
                    <span className="block text-[8px] text-slate-500 uppercase tracking-widest leading-none mb-1">Confiança AI</span>
                    <span className="font-bold text-sky-400">{rec.confidenceScorePercent}%</span>
                  </div>
                </div>
              </div>

              {/* Title & Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  {rec.title}
                  {isImplemented && <span className="text-[9px] font-mono uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-950 px-1.5 py-0.5 rounded">Implementada</span>}
                  {isApproved && <span className="text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-950 px-1.5 py-0.5 rounded">Aprovada por Board</span>}
                  {isRejected && <span className="text-[9px] font-mono uppercase bg-rose-500/10 text-rose-400 border border-rose-950 px-1.5 py-0.5 rounded">Arquivada</span>}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed max-w-4xl">{rec.description}</p>
              </div>

              {/* Evidences / Actions Detail Boxes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 bg-slate-950/40 border border-slate-950 p-4 rounded-2xl">
                <div className="space-y-1.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider font-mono">Evidência e Acoplamento</span>
                  <p className="text-[11px] text-slate-300 font-mono leading-normal bg-slate-950 p-2.5 rounded-lg border border-slate-8s00">{rec.evidenceWorkflow}</p>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider font-mono">Ação Remediativa Consensual</span>
                  <p className="text-[11px] text-slate-200 leading-relaxed font-sans bg-slate-950 p-2.5 rounded-lg border border-slate-800">{rec.remedyActionStep}</p>
                </div>
              </div>

              {/* Flow Approval Footer Controls */}
              <div className="flex justify-between items-center mt-5 pt-4 border-t border-slate-800/40">
                <div className="text-[10px] font-mono text-slate-500">
                  {isApproved && rec.approvedBy && (
                    <span>Aprovado por <strong className="text-emerald-400">{rec.approvedBy}</strong> em {new Date(rec.approvedAt || 0).toLocaleDateString()}</span>
                  )}
                  {isPending && (
                    <span className="flex items-center gap-1.5"><ShieldAlert className="size-3.5 text-amber-400" /> Aguardando deliberação de Diretor Executivo</span>
                  )}
                  {isRejected && <span>Arquivada e removida das prioridades operacionais</span>}
                  {isImplemented && <span>Decisão incorporada com sucesso ao pipeline da filial</span>}
                </div>

                <div className="flex gap-2">
                  {isPending && (
                    <>
                      <button
                        onClick={() => reject(rec.id)}
                        className="px-3 py-1.5 hover:bg-slate-800 text-rose-400 hover:text-rose-300 text-[10px] uppercase font-bold rounded-lg border border-transparent hover:border-slate-800 transition-colors"
                      >
                        Recusar
                      </button>
                      <button
                        onClick={() => approve(rec.id, 'Diretor Gabriel Max')}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Check className="size-3.5 stroke-[3px]" /> Aprovar
                      </button>
                    </>
                  )}

                  {isApproved && (
                    <button
                      onClick={() => transitionToImplemented(rec.id)}
                      className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-slate-50 text-[10px] uppercase font-bold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Check className="size-3.5 stroke-[3px]" /> Registrar Execução
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default DecisionEvaluator;
