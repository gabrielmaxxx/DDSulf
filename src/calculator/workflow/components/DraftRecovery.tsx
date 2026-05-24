import React from 'react';
import { WorkflowDraft } from '../types';
import { useQuoteDraft } from '../hooks/useQuoteDraft';
import { Sparkles, Calendar, Trash2 } from 'lucide-react';

interface DraftRecoveryProps {
  onLoadDraft: (draft: WorkflowDraft) => void;
  onNewWorkflow: () => void;
}

export function DraftRecovery({ onLoadDraft, onNewWorkflow }: DraftRecoveryProps) {
  const { draftList, deleteDraft } = useQuoteDraft();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-3.5 py-4">
        <div className="inline-flex p-3 bg-indigo-50 border border-indigo-100 rounded-2xl text-indigo-600 mb-2">
          <Sparkles className="size-6 animate-pulse" />
        </div>
        <h2 className="text-3xl font-black text-black tracking-tight">DDSulf Pricing Portal</h2>
        <p className="text-sm font-semibold text-gray-500 max-w-md mx-auto leading-relaxed">
          Inicie um novo orçamento calibrado por algoritmo financeiro ou continue rascunhos salvos em campo off-line.
        </p>
      </div>

      {/* Main choice panel split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {/* Opt A: New Workflow */}
        <div
          onClick={onNewWorkflow}
          className="bg-black text-white hover:bg-zinc-900 border border-black p-6 rounded-[32px] space-y-6 shadow-md transition-all cursor-pointer group hover:scale-[1.02]"
        >
          <div className="space-y-2">
            <span className="text-[9px] font-black tracking-widest text-[#9CA3AF] uppercase">Fórmula Direta</span>
            <h3 className="text-xl font-black">Nova Calibração Comercial</h3>
            <p className="text-xs text-gray-300 leading-relaxed font-medium">
              Abrir o fluxo assistido de 13 etapas para compor o preço técnico ponderado por químicos, riscos logísticos e impostos.
            </p>
          </div>
          <div className="inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 font-bold text-xs rounded-xl transition-all">
            Iniciar do Zero
          </div>
        </div>

        {/* Opt B: Select draft or default onboarding templates */}
        <div className="bg-white border border-gray-200 p-6 rounded-[32px] space-y-5 shadow-sm">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-gray-950">Drafts & Rascunhos</h3>
            <p className="text-xs text-gray-400 font-semibold leading-relaxed">
              Registros retidos em memória local para re-execução física offline.
            </p>
          </div>

          {draftList.length === 0 ? (
            <div className="p-8 border border-dashed border-gray-200 rounded-2xl text-center space-y-2.5">
              <span className="text-xs font-bold text-gray-400 block">Nenhum rascunho pendente no cachê.</span>
              <p className="text-[10px] text-gray-400 leading-normal font-semibold">
                Qualquer rascunho preenchido em campo é retido para evitar perdas físicas de dados.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[190px] overflow-y-auto pr-1">
              {draftList.map(draft => (
                <div
                  key={draft.id}
                  className="p-3 bg-gray-50 hover:bg-gray-100 border border-gray-150 rounded-xl flex items-center justify-between gap-3 transition-colors cursor-pointer"
                >
                  <div 
                    onClick={() => onLoadDraft(draft)}
                    className="flex-1 min-w-0 space-y-0.5"
                  >
                    <span className="text-xs font-black text-black block truncate leading-tight">
                      {draft.state.clientName || 'Incompleto'}
                    </span>
                    <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-semibold">
                      <Calendar className="size-3" />
                      <span>{new Date(draft.timestamp).toLocaleDateString('pt-BR')} {new Date(draft.timestamp).toLocaleTimeString('pt-BR')}</span>
                      <span>•</span>
                      <span>Etapa {draft.state.currentStep}/13</span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteDraft(draft.id)}
                    className="p-2 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-100"
                    title="Excluir rascunho"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
