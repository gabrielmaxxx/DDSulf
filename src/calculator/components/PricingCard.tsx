import React from 'react';
import { FileText, Loader2, Sparkles, Check } from 'lucide-react';
import { PricingBreakdown, PricingInputs } from '../types';

interface PricingCardProps {
  breakdown: PricingBreakdown;
  inputs: PricingInputs;
  saving: boolean;
  onSave: () => void;
  recurrence: string;
}

export function PricingCard({
  breakdown,
  inputs,
  saving,
  onSave,
  recurrence
}: PricingCardProps) {
  const annualRecurrenceProjection = () => {
    let multiplier = 1;
    if (recurrence === 'Mensal') multiplier = 12;
    if (recurrence === 'Trimestral') multiplier = 4;
    if (recurrence === 'Semestral') multiplier = 2;

    const baseQuotePrice = breakdown.suggestedPrice;
    return baseQuotePrice * multiplier;
  };

  const getRecurrenceNote = () => {
    switch (recurrence) {
      case 'Mensal':
        return 'Contrato mensal com desconto de 20% incluso em prol de rotas fixas.';
      case 'Trimestral':
        return 'Contrato trimestral com desconto inteligente de 12% na operação recorrente.';
      case 'Semestral':
        return 'Contrato semestral com desconto estendido de 6%.';
      default:
        return 'Atendimento spot único. Sem descontos recorrentes inclusos.';
    }
  };

  return (
    <div className="bg-black text-white rounded-[32px] overflow-hidden shadow-2xl relative">
      <div className="p-8 md:p-12 space-y-8 relative z-10">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-white/50 uppercase tracking-[0.3em] block">
              Valor Final Sugerido
            </span>
            <div className="flex items-baseline gap-1 animate-in fade-in duration-700">
              <span className="text-xl font-bold opacity-60">R$</span>
              <span className="text-6xl md:text-7xl font-sans font-black tracking-tight text-white leading-none">
                {breakdown.suggestedPrice.toLocaleString('pt-BR')}
              </span>
              <span className="text-xs font-semibold bg-white/10 px-2 py-0.5 rounded ml-2 text-white/90">
                {recurrence === 'Único' ? 'À vista' : recurrence}
              </span>
            </div>
          </div>
          <div className="size-11 bg-white/10 rounded-2xl flex items-center justify-center">
            <Sparkles className="size-5 text-white animate-pulse" />
          </div>
        </div>

        {recurrence !== 'Único' && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4.5 space-y-1.5 leading-tight">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/55 block">
              Projeção Anual do Contrato
            </span>
            <span className="text-xl font-black block">
              R$ {annualRecurrenceProjection().toLocaleString('pt-BR')},00 / ano
            </span>
            <p className="text-[10px] text-white/40 font-medium">
              Garantia de faturamento operacional recorrente garantida.
            </p>
          </div>
        )}

        <div className="space-y-4 pt-4 border-t border-white/10">
          <p className="text-[10.5px] text-white/50 font-medium leading-relaxed italic">
            "{getRecurrenceNote()}"
          </p>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 bg-white text-black hover:bg-white/95 disabled:opacity-50 h-14 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              {saving ? (
                <Loader2 className="size-4 animate-spin text-black" />
              ) : (
                <FileText className="size-4 text-black" />
              )}
              Salvar Orçamento Oficial
            </button>
          </div>
        </div>
      </div>

      {/* Decorative premium ambient glow */}
      <div className="absolute -bottom-12 -right-12 size-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-12 -left-12 size-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
    </div>
  );
}
