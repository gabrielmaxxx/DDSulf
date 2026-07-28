import React, { useState } from 'react';
import { Quote, useSystemStore } from '@/store/systemStore';
import { 
  CheckCircle2, 
  X, 
  PackageCheck, 
  AlertCircle,
  User,
  FileText
} from 'lucide-react';
import { motion } from 'motion/react';

interface ConfirmacaoServicoModalProps {
  quote: Quote;
  onConfirm: (confirmedBy: string, notes: string) => void;
  onClose: () => void;
}

export function ConfirmacaoServicoModal({ quote, onConfirm, onClose }: ConfirmacaoServicoModalProps) {
  const [confirmedBy, setConfirmedBy] = useState('');
  const [serviceNotes, setServiceNotes] = useState('');
  const [hasConfirmedCheckbox, setHasConfirmedCheckbox] = useState(false);

  // Localization logic inside the modal for styling
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
    onConfirm(confirmedBy.trim(), serviceNotes.trim());
  };

  const { employees } = useSystemStore();
  const activeTechnicians = (employees || []).filter(e => e.active);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-[28px] border border-[#EBEBE5] w-full max-w-lg overflow-hidden shadow-2xl flex flex-col"
        id="confirmacion-modal-real-content"
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-[#EBEBE2] bg-[#FAF9F5] flex items-center justify-between">
          <div className="flex items-center gap-3 text-left">
            <div className="size-10 bg-[#E3EFE5] text-[#2D6A4F] rounded-xl flex items-center justify-center">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <h3 className="font-display font-black text-lg text-[#141410]" id="confirmacion-modal-title">Confirmar Execução</h3>
              <p className="text-xs text-[#706F65]">Orçamento ID #{quote.id}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#706F65] hover:text-[#141410] transition-colors cursor-pointer"
            id="btn-close-modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1">
          <div className="p-6 space-y-5 text-left max-h-[60vh] overflow-y-auto">
            
            {/* Visual read-only brief of the budget */}
            <div className="bg-[#FAF8F5] border border-[#EBEBE5] rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start text-xs border-b border-[#EBEBE5]/60 pb-2">
                <div>
                  <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase">Cliente</span>
                  <strong className="text-[#141410] text-sm block mt-0.5">{quote.client?.name || 'Cliente Não Informado'}</strong>
                  {quote.client?.address && <span className="text-[11px] text-[#706F65] block mt-0.5">{quote.client.address}</span>}
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase">Valor Final</span>
                  <strong className="text-base font-display font-black text-[#2D6A4F] block mt-0.5">
                    R$ {(quote.pricing?.finalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#706F65]">
                <div>
                  <strong className="font-semibold text-[#141410]">Serviço:</strong> {getServiceTypeText(quote.service?.serviceType)}
                </div>
                <div>
                  <strong className="font-semibold text-[#141410]">Praga-Alvo:</strong> {getPestText(quote.service?.pestType)}
                </div>
                {quote.service?.areaM2 && (
                  <div>
                    <strong className="font-semibold text-[#141410]">Área Operativa:</strong> {quote.service.areaM2} m²
                  </div>
                )}
                {quote.service?.distanceKm && (
                  <div>
                    <strong className="font-semibold text-[#141410]">Deslocamento:</strong> {quote.service.distanceKm} Km
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields: Técnico Responsável and Observações */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#706F65] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <User className="size-3.5 text-slate-400" />
                  Responsável Técnico / Aplicador <span className="text-xs text-slate-400 font-normal lowercase">(opcional)</span>
                </label>
                <select
                  value={confirmedBy}
                  onChange={(e) => setConfirmedBy(e.target.value)}
                  className="w-full h-11 border border-[#EBEBE5] rounded-xl text-xs text-[#141410] px-4 outline-none focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F] bg-[#FAF9F5] transition-all cursor-pointer font-medium"
                  id="modal-input-confirmed-by"
                >
                  <option value="">Selecione o técnico responsável...</option>
                  {activeTechnicians.map((emp) => (
                    <option key={emp.id} value={emp.name}>
                      {emp.name} ({emp.role.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-mono font-bold text-[#706F65] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <FileText className="size-3.5 text-slate-400" />
                  Laudo / Observações de Atendimento <span className="text-xs text-slate-400 font-normal lowercase">(opcional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Instâncias identificadas em campo, técnicas empregadas ou recomendações preventivas transmitidas ao cliente..."
                  value={serviceNotes}
                  onChange={(e) => setServiceNotes(e.target.value)}
                  className="w-full resize-none border border-[#EBEBE5] rounded-xl text-xs text-[#141410] p-4 outline-none focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F] bg-[#FAF9F5] transition-all"
                  id="modal-input-service-notes"
                />
              </div>
            </div>

            {/* Dynamic Checkbox - Required validation */}
            <div className="bg-[#E3EFE5]/40 border border-[#2D6A4F]/20 rounded-2xl p-4 flex items-start gap-3">
              <input
                type="checkbox"
                id="checkbox-confirm-realizado"
                checked={hasConfirmedCheckbox}
                onChange={(e) => setHasConfirmedCheckbox(e.target.checked)}
                className="size-4.5 rounded border-gray-300 text-[#2D6A4F] focus:ring-[#2D6A4F] mt-0.5 cursor-pointer"
              />
              <label 
                htmlFor="checkbox-confirm-realizado" 
                className="text-xs font-semibold text-[#1B3A2D] select-none cursor-pointer leading-relaxed text-left"
              >
                Confirmo que o serviço foi realizado e os produtos foram utilizados
              </label>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[10px] text-amber-800 leading-relaxed flex gap-2">
              <AlertCircle className="size-4 text-amber-700 shrink-0 mt-0.5" />
              <p>
                <strong>Aviso de Impacto no Sistema:</strong> Ao confirmar, o estoque dará baixa automática e definitiva de todos os itens associados ao POP e o valor de <strong>R$ {(quote.pricing?.finalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</strong> constará formalmente como receita líquida realizada.
              </p>
            </div>

          </div>

          {/* Modal Actions Footer */}
          <div className="p-4 bg-[#FAF9F5] border-t border-[#EBEBE1] flex justify-end gap-3.5 mt-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-[#EBEBE5] text-[#706F65] hover:text-[#141410] text-xs font-bold rounded-xl transition-all cursor-pointer"
              id="confirm-modal-cancel"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!hasConfirmedCheckbox}
              className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 ${
                hasConfirmedCheckbox 
                  ? 'bg-[#1B3A2D] hover:bg-[#2D6A4F] cursor-pointer' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
              }`}
              id="btn-confirm-executar"
            >
              <PackageCheck className="size-4" /> Confirmar Execução
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
}
