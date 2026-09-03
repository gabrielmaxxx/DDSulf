import React, { useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import {
  Shield,
  DollarSign,
  TrendingUp,
  BarChart2,
  BrainCircuit,
  RotateCcw,
  Send,
} from 'lucide-react';
import { ChatMessage } from '../types';

interface AICopilotoTabProps {
  isExecutive: boolean;
  mrrTotal: number;
  activeContractsCount: number;
  activeContractsRatio: number;
  operationalEfficiencyCoefficient: number;
  monthlySafetyIndexPercent: number;
  executiveMessages: ChatMessage[];
  executiveLoading: boolean;
  executiveInput: string;
  setExecutiveInput: (val: string) => void;
  onSendExecutiveQuery: (queryText?: string) => void;
}

export const AICopilotoTab: React.FC<AICopilotoTabProps> = ({
  isExecutive,
  mrrTotal,
  activeContractsCount,
  activeContractsRatio,
  operationalEfficiencyCoefficient,
  monthlySafetyIndexPercent,
  executiveMessages,
  executiveLoading,
  executiveInput,
  setExecutiveInput,
  onSendExecutiveQuery,
}) => {
  const executiveScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (executiveScrollRef.current) {
      executiveScrollRef.current.scrollTop = executiveScrollRef.current.scrollHeight;
    }
  }, [executiveMessages, executiveLoading]);

  if (!isExecutive) {
    return (
      <div className="bg-white border border-amber-200 rounded-3xl p-8 shadow-xs text-center">
        <div className="size-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
          <Shield className="size-7 text-amber-700" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Acesso Restrito ao Copiloto Executivo</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed font-sans">
          Este módulo é exclusivo para usuários com perfil de <strong>Diretoria, Master ou Administrador</strong>,
          pois consolida indicadores estratégicos de margem, MRR e saúde contratual da empresa.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left animate-fade-in">
      {/* STRATEGIC BOARD KPIS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-4 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              MRR Contratual
            </span>
            <DollarSign className="size-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black font-mono text-slate-900 mt-2">
            R$ {mrrTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[10.5px] text-slate-500 mt-0.5">{activeContractsCount} contratos ativos</p>
        </div>

        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-4 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Retenção de Base
            </span>
            <TrendingUp className="size-4 text-blue-600" />
          </div>
          <p className="text-lg font-black font-mono text-slate-900 mt-2">
            {activeContractsRatio.toFixed(1)}%
          </p>
          <p className="text-[10.5px] text-slate-500 mt-0.5">Contratos em vigência regular</p>
        </div>

        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-4 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Eficiência de Campo
            </span>
            <BarChart2 className="size-4 text-amber-600" />
          </div>
          <p className="text-lg font-black font-mono text-slate-900 mt-2">
            {(operationalEfficiencyCoefficient * 100).toFixed(1)}%
          </p>
          <p className="text-[10.5px] text-slate-500 mt-0.5">Taxa de conclusão de OS</p>
        </div>

        <div className="bg-white border border-[#E8E6E1] rounded-2xl p-4 shadow-3xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Conformidade Anvisa
            </span>
            <Shield className="size-4 text-emerald-600" />
          </div>
          <p className="text-lg font-black font-mono text-slate-900 mt-2">
            {monthlySafetyIndexPercent.toFixed(1)}%
          </p>
          <p className="text-[10.5px] text-slate-500 mt-0.5">POPs técnicos homologados</p>
        </div>
      </div>

      {/* COPILOTO EXECUTIVO CHAT WORKSPACE */}
      <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <BrainCircuit className="size-5 text-[#1B3A2D]" />
              <h3 className="text-sm font-bold text-slate-900">
                Sessão Estratégica com IA Executiva
              </h3>
            </div>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              Simulações de faturamento, negociação com fornecedores e expansão de rotas operacionais.
            </p>
          </div>
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-[10.5px] font-bold">
            🔒 Nível Diretoria / Sigiloso
          </span>
        </div>

        {/* PROMPT CHIPS */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            type="button"
            onClick={() =>
              onSendExecutiveQuery(
                'Analisar a margem operacional de todos os contratos corporativos e apontar quais estão abaixo do piso de 35%.'
              )
            }
            className="px-3 py-1.5 bg-[#FAF9F5] border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:border-[#1B3A2D] hover:bg-slate-50 transition-all cursor-pointer"
          >
            📊 Relatório Consolidado de Margem
          </button>
          <button
            type="button"
            onClick={() =>
              onSendExecutiveQuery(
                'Avaliar a eficiência do estoque de químicos e sugerir compras estratégicas para evitar ruptura.'
              )
            }
            className="px-3 py-1.5 bg-[#FAF9F5] border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:border-[#1B3A2D] hover:bg-slate-50 transition-all cursor-pointer"
          >
            📦 Auditoria de Insumos
          </button>
          <button
            type="button"
            onClick={() =>
              onSendExecutiveQuery(
                'Sugerir 3 ações prioritárias para aumentar a margem operacional média acima de 45%.'
              )
            }
            className="px-3 py-1.5 bg-[#FAF9F5] border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 hover:border-[#1B3A2D] hover:bg-slate-50 transition-all cursor-pointer"
          >
            🎯 Otimização de Margem
          </button>
        </div>

        {/* EXECUTIVE MESSAGES LIST */}
        <div ref={executiveScrollRef} className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
          {executiveMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[90%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#1B3A2D] text-white rounded-tr-xs'
                    : 'bg-[#FAF9F5] border border-[#E8E6E1] text-slate-800 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-1.5 border-b border-slate-200/50 pb-1">
                  <span className="font-bold flex items-center gap-1">
                    {msg.role === 'user' ? 'Diretoria / Gestão' : 'Copiloto Executivo IA'}
                  </span>
                  <span className="text-[9px] opacity-60 font-mono">{msg.timestamp}</span>
                </div>
                <div className="markdown-body">
                  <Markdown>{msg.content}</Markdown>
                </div>
                {msg.sources && (
                  <div className="flex gap-1.5 mt-2.5 pt-2 border-t border-slate-200/40 text-[9px] opacity-75">
                    <span>Fontes:</span>
                    {msg.sources.map((s, i) => (
                      <span key={i} className="px-1.5 py-0.5 bg-black/5 rounded font-mono">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {executiveLoading && (
            <div className="flex justify-start">
              <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4 text-xs text-slate-600 flex items-center gap-2">
                <RotateCcw className="size-4 animate-spin text-[#1B3A2D]" />
                <span>Compilando dados estratégicos e processando inteligência executiva...</span>
              </div>
            </div>
          )}
        </div>

        {/* INPUT BAR */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            value={executiveInput}
            onChange={(e) => setExecutiveInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                onSendExecutiveQuery();
              }
            }}
            placeholder="Pergunte ao Copiloto Executivo (ex: Qual impacto financeiro de reajustar contratos em 8%?)..."
            className="flex-1 rounded-xl border border-[#E8E6E1] px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]/15 focus:border-[#2D6A4F] bg-[#F7F6F3]"
          />
          <button
            type="button"
            onClick={() => onSendExecutiveQuery()}
            disabled={executiveLoading || !executiveInput.trim()}
            className="px-4 py-2.5 bg-[#1B3A2D] text-white rounded-xl text-xs font-bold hover:bg-[#2D6A4F] transition-all disabled:opacity-40 flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Send className="size-3.5" />
            <span>Consultar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
