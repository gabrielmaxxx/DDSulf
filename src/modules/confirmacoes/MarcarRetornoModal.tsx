import React, { useState, useMemo, useEffect } from 'react';
import { Quote, useSystemStore } from '@/store/systemStore';
import { 
  RotateCcw, 
  X, 
  AlertTriangle, 
  DollarSign, 
  FileText,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';

interface MarcarRetornoModalProps {
  quote: Quote;
  onConfirm: (cost: number, notes: string) => void;
  onClose: () => void;
}

export function MarcarRetornoModal({ quote, onConfirm, onClose }: MarcarRetornoModalProps) {
  const { settings, financial } = useSystemStore();

  const costPerKm = settings?.operationalGoals?.costPerKm ?? 2.5;
  const laborPerHour = financial?.variableCosts?.laborPerHour ?? 25;
  const distanceKm = quote.service?.distanceKm ?? 0;

  // Rule: (distanceKm * 2 * costPerKm) + (1 hora de MO)
  const defaultCalculatedCost = useMemo(() => {
    const cost = (distanceKm * 2 * costPerKm) + laborPerHour;
    return parseFloat(cost.toFixed(2));
  }, [distanceKm, costPerKm, laborPerHour]);

  const [returnCost, setReturnCost] = useState<string>(String(defaultCalculatedCost));
  const [returnNotes, setReturnNotes] = useState('');
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);

  // Localization utilities for visual representation
  const getServiceTypeText = (val?: string): string => {
    if (!val) return 'Serviço operacional';
    const v = val.toLowerCase().trim();
    if (v === 'dedetizacao' || v === 'dedetização') return 'Dedetização';
    if (v === 'desratizacao' || v === 'desratização') return 'Desratização';
    if (v === 'descupinizacao' || v === 'descupinização') return 'Descupinização';
    if (v === 'sanitizacao' || v === 'sanitização') return 'Sanitização Corretiva';
    if (v === 'controle_integrado' || v === 'controle integrado') return 'CIP (Controle Integrado de Pragas)';
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  const getPestText = (val?: string): string => {
    if (!val) return 'Múltiplas pragas';
    const v = val.toLowerCase().trim();
    if (v === 'baratas') return 'Controle de Baratas';
    if (v === 'ratos') return 'Controle de Roedores';
    if (v === 'cupins') return 'Controle de Cupins';
    if (v === 'mosquitos' || v === 'mosquito' || v.includes('mosquito')) return 'Mosquitos/Dengue';
    if (v === 'formigas') return 'Controle de Formigas';
    if (v === 'escorpioes' || v === 'escorpiões') return 'Escorpiões';
    if (v === 'aranhas') return 'Aranhas e aracnídeos';
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasConfirmedCheckbox) return;
    const parsedCost = parseFloat(returnCost);
    onConfirm(isNaN(parsedCost) ? 0 : parsedCost, returnNotes.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[28px] border border-[#EBEBE5] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
        id="marcar-retorno-modal-container"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#EBEBE2] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <div className="size-10 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl flex items-center justify-center">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-[#141410]" id="return-modal-title">Registrar Retorno Técnico</h3>
              <p className="text-xs text-[#706F65]">Orçamento original #{quote.id}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#706F65] hover:text-[#141410] transition-colors cursor-pointer"
            id="btn-close-return-modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 space-y-5 text-left max-h-[60vh] overflow-y-auto">
            
            {/* Visual Read-Only Original Quote summary */}
            <div className="bg-[#FAF8F5] border border-[#EBEBE5] rounded-2xl p-4 space-y-2">
              <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest">Contrato Vinculado</span>
              <div className="flex justify-between items-start gap-4">
                <div>
                  <strong className="text-sm text-[#141410] block">{quote.client?.name || 'Cliente Não Informado'}</strong>
                  <span className="text-xs text-[#706F65] block">{quote.client?.address}</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-[#2D6A4F] bg-[#E3EFE5] px-2.5 py-1 rounded-md uppercase">
                    #{quote.id}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-[#EBEBE5]/60 grid grid-cols-2 gap-2 text-[11px] text-[#706F65]">
                <div>
                  <strong className="font-semibold text-[#141410]">Tipo:</strong> {getServiceTypeText(quote.service?.serviceType)}
                </div>
                <div>
                  <strong className="font-semibold text-[#141410]">Praga-Alvo:</strong> {getPestText(quote.service?.pestType)}
                </div>
                {distanceKm > 0 && (
                  <div className="col-span-2 text-[10px] font-mono text-slate-400">
                    DISTÂNCIA: {distanceKm} Km (Deslocamento Ida/Volta: {distanceKm * 2} Km)
                  </div>
                )}
              </div>
            </div>

            {/* Direct Explanation Banner */}
            <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl flex gap-3 text-xs leading-relaxed text-sky-900">
              <AlertTriangle className="size-5 text-sky-700 shrink-0 mt-0.5" />
              <div>
                <p>
                  O retorno gratuito é um custo para a empresa. Ele <strong>NÃO gera receita</strong> e <strong>NÃO baixa o estoque</strong> novamente. O custo será registrado no financeiro para controle de rentabilidade real.
                </p>
              </div>
            </div>

            {/* Form Fields: Cost estimated and Notes */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#706F65] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <DollarSign className="size-3.5 text-slate-400" />
                  Custo Estimado do Retorno (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#706F65]">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={returnCost}
                    onChange={(e) => setReturnCost(e.target.value)}
                    className="w-full h-11 border border-[#EBEBE5] rounded-xl text-xs text-[#141410] pl-10 pr-4 outline-none focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F] bg-[#FAF9F5] transition-all"
                    id="modal-input-return-cost"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Estoque + Deslocamento estimado ({distanceKm * 2} Km × R$ {costPerKm.toFixed(2)}) + Mão de obra (1 hora × R$ {laborPerHour.toFixed(2)}): <strong>R$ {defaultCalculatedCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong>
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-[#706F65] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="size-3.5 text-slate-400" />
                  Observações / Justificativa Técnica
                </label>
                <textarea
                  rows={3}
                  placeholder="Informe detalhadamente os motivos ou pragas encontradas para a reincidência técnica..."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  className="w-full resize-none border border-[#EBEBE5] rounded-xl text-xs text-[#141410] p-4 outline-none focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F] bg-[#FAF9F5] transition-all"
                  id="modal-input-return-notes"
                  required
                />
              </div>
            </div>

            {/* Confirmation checkbox */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <input
                type="checkbox"
                id="checkbox-confirm-retorno"
                checked={hasConfirmedCheckbox}
                onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
                className="size-4.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500 mt-0.5 cursor-pointer"
              />
              <label 
                htmlFor="checkbox-confirm-retorno" 
                className="text-xs font-semibold text-amber-900 select-none cursor-pointer leading-relaxed text-left"
              >
                Confirmo que este é um retorno gratuito dentro da garantia
              </label>
            </div>

          </div>

          {/* Modal Footer actions */}
          <div className="p-4 bg-[#FAF9F5] border-t border-[#EBEBE1] flex justify-end gap-3.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-[#EBEBE5] text-[#706F65] hover:text-[#141410] text-xs font-bold rounded-xl transition-all cursor-pointer"
              id="return-modal-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!hasConfirmedCheckbox}
              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
                hasConfirmedCheckbox 
                  ? 'bg-amber-600 hover:bg-amber-750 cursor-pointer shadow-xs' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
              }`}
              id="btn-return-submit-real-action"
            >
              <RotateCcw className="size-4" /> Registrar Retorno
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
}
