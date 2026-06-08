import React, { useState } from 'react';
import { Quote } from '@/store/systemStore';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar, Clock, User, FileText, ChevronRight } from 'lucide-react';

interface AgendarServicoModalProps {
  quote: Quote;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scheduledDate: string, scheduledTime: string, technician: string) => void;
}

export function AgendarServicoModal({ quote, isOpen, onClose, onConfirm }: AgendarServicoModalProps) {
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('08:00');
  const [scheduledTechnician, setScheduledTechnician] = useState('');
  const [notes, setNotes] = useState('');

  // Sugestões rápidas de horário
  const quickTimes = ['08:00', '09:00', '10:00', '14:00'];

  // Obtém a data de hoje no formato YYYY-MM-DD local
  const todayStr = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

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
    if (!scheduledDate || !scheduledTechnician.trim()) return;
    onConfirm(scheduledDate, scheduledTime, scheduledTechnician.trim());
  };

  const isFormValid = scheduledDate !== '' && scheduledTechnician.trim() !== '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg bg-white rounded-[28px] border border-[#EBEBE5] shadow-2xl p-0 overflow-hidden" showCloseButton={true}>
        {/* Modal Header */}
        <DialogHeader className="p-6 border-b border-[#EBEBE2] bg-[#FAF9F5] text-left">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-[#E3EFE5] text-[#1B3A2D] rounded-xl flex items-center justify-center">
              <Calendar className="size-5" />
            </div>
            <div>
              <DialogTitle className="font-display font-black text-lg text-[#141410] tracking-tight leading-none">
                Agendar serviço — {quote.client?.name || 'Cliente'}
              </DialogTitle>
              <p className="text-xs text-[#706F65] mt-1">Defina as condições de agendamento de OS do orçamento aprovado</p>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 text-left">
          <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
            
            {/* Direct visual brief of the budget (Read-only as requested) */}
            <div className="bg-[#FAF8F5] border border-[#EBEBE5] rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-start text-xs border-b border-[#EBEBE5]/60 pb-2">
                <div>
                  <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider">Cliente</span>
                  <strong className="text-[#141410] text-sm block mt-0.5">{quote.client?.name || 'Cliente Não Informado'}</strong>
                  {quote.client?.address && <span className="text-[11px] text-[#706F65] block mt-0.5">{quote.client.address}</span>}
                </div>
                <div className="text-right">
                  <span className="block text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider">Valor do Orçamento </span>
                  <strong className="text-base font-display font-black text-[#2D6A4F] block mt-0.5">
                    R$ {(quote.pricing?.finalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-[#706F65]">
                <div>
                  <strong className="font-semibold text-[#141410]">Tipo de Serviço:</strong> {getServiceTypeText(quote.service?.serviceType)}
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

            {/* Config Fields */}
            <div className="space-y-4">
              
              {/* Data do serviço */}
              <div>
                <Label htmlFor="scheduledDate" className="block text-[11px] font-mono font-bold text-[#706F65] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 pointer-events-none">
                  <Calendar className="size-3.5 text-slate-400" />
                  Data do Serviço <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="date"
                  id="scheduledDate"
                  min={todayStr}
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full h-11 border border-[#EBEBE5] rounded-xl text-xs text-[#141410] px-4 outline-none focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F] bg-[#FAF9F5] transition-all"
                  required
                />
              </div>

              {/* Horário e Sugestões rápidas */}
              <div>
                <Label htmlFor="scheduledTime" className="block text-[11px] font-mono font-bold text-[#706F65] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 pointer-events-none">
                  <Clock className="size-3.5 text-slate-400" />
                  Horário <span className="text-red-500">*</span>
                </Label>
                <div className="space-y-2">
                  <Input
                    type="time"
                    id="scheduledTime"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full h-11 border border-[#EBEBE5] rounded-xl text-xs text-[#141410] px-4 outline-none focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F] bg-[#FAF9F5] transition-all"
                    required
                  />
                  
                  {/* Sugestões rápidas de horário */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {quickTimes.map((time) => (
                      <button
                        type="button"
                        key={time}
                        onClick={() => setScheduledTime(time)}
                        className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold transition-all cursor-pointer ${
                          scheduledTime === time
                            ? 'bg-[#1B3A2D] text-white border-[#1B3A2D]'
                            : 'bg-white text-slate-600 border-[#E8E6E1] hover:bg-slate-50'
                        }`}
                      >
                        {time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Técnico responsável */}
              <div>
                <Label htmlFor="scheduledTechnician" className="block text-[11px] font-mono font-bold text-[#706F65] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 pointer-events-none">
                  <User className="size-3.5 text-slate-400" />
                  Técnico Responsável <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="text"
                  id="scheduledTechnician"
                  placeholder="Nome do técnico"
                  value={scheduledTechnician}
                  onChange={(e) => setScheduledTechnician(e.target.value)}
                  className="w-full h-11 border border-[#EBEBE5] rounded-xl text-xs text-[#141410] px-4 outline-none focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F] bg-[#FAF9F5] transition-all"
                  required
                />
              </div>

              {/* Observações da equipe */}
              <div>
                <Label htmlFor="notes" className="block text-[11px] font-mono font-bold text-[#706F65] uppercase tracking-wider mb-1.5 flex items-center gap-1.5 pointer-events-none">
                  <FileText className="size-3.5 text-slate-400" />
                  Observações para a equipe <span className="text-xs text-slate-400 font-normal lowercase">(opcional)</span>
                </Label>
                <textarea
                  id="notes"
                  rows={2}
                  placeholder="Ex: Utilizar EPI completo, atenção ao pet de estimação no local..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full resize-none border border-[#EBEBE5] rounded-xl text-xs text-[#141410] p-4 outline-none focus:ring-2 focus:ring-[#2D6A4F]/10 focus:border-[#2D6A4F] bg-[#FAF9F5] transition-all"
                />
              </div>

            </div>

          </div>

          {/* Modal Footer (Actions) */}
          <div className="p-4 bg-[#FAF9F5] border-t border-[#EBEBE1] flex justify-end gap-3.5">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-4 h-11 bg-white border border-[#EBEBE5] text-[#706F65] hover:text-[#141410] text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid}
              className={`px-5 h-11 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 ${
                isFormValid 
                  ? 'bg-[#1B3A2D] hover:bg-[#2D6A4F] cursor-pointer shadow-xs' 
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed opacity-60'
              }`}
            >
              Confirmar agendamento <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
