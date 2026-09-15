import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar, Clock } from 'lucide-react';
import { AgendaEvent } from '@/store/systemStore';

interface ServiceOrderDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: AgendaEvent | null;
  onSignExecution?: (service: AgendaEvent) => void;
}

export function ServiceOrderDetailDialog({
  open,
  onOpenChange,
  service,
  onSignExecution,
}: ServiceOrderDetailDialogProps) {
  if (!service) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" id="dialog-service-order-detail">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[8px] font-black bg-[#1B3A2D] text-white px-2 py-0.5 rounded-md uppercase tracking-wider">
              Ordem de Serviço
            </span>
          </div>
          <DialogTitle>
            Nº OS-{service.id}
          </DialogTitle>
          <DialogDescription>
            Informações detalhadas de execução e agendamento da ordem técnica.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 font-sans text-xs text-left">
          <div className="space-y-1">
            <label className="text-[9px] font-black uppercase text-slate-400">
              Cliente Assistido
            </label>
            <p className="text-[#141410] text-sm font-bold font-display uppercase tracking-tight">
              {service.clientName}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block pb-0.5">
                Tipo de Atividade
              </label>
              <span className="px-2.5 py-1 bg-indigo-50 text-indigo-850 border border-indigo-100 rounded-md font-bold text-[10px] uppercase">
                {service.type.toUpperCase()}
              </span>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400 block pb-0.5">
                Status Execução
              </label>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                service.status === 'realizado' 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                  : 'bg-amber-100 text-amber-800'
              }`}>
                {service.status === 'realizado' ? '• Realizado' : '• Programado'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400">
                Data Agendamento
              </label>
              <p className="font-bold text-slate-800 pt-0.5 flex items-center gap-1">
                <Calendar className="size-3.5 text-slate-400" /> {service.date}
              </p>
            </div>
            <div>
              <label className="text-[9px] font-black uppercase text-slate-400">
                Horário Previsto
              </label>
              <p className="font-bold text-slate-800 pt-0.5 flex items-center gap-1">
                <Clock className="size-3.5 text-slate-400" /> {service.time || 'Grade Flexível'}
              </p>
            </div>
          </div>

          <div className="space-y-1 border-t border-slate-100 pt-3">
            <label className="text-[9px] font-black uppercase text-slate-400 block">
              Indicações e Observações Técnicas
            </label>
            <p className="p-3 bg-slate-50 border border-[#E8E6E1]/50 italic rounded-lg text-slate-600 font-medium font-sans leading-relaxed">
              "{service.notes || 'Nenhuma nota especial anexa por parte da equipe técnica.'}"
            </p>
          </div>

          <DialogFooter className="pt-4 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141410] text-[9px] font-black uppercase tracking-wider rounded-lg"
            >
              Fechar Detalhes
            </Button>
            {service.status !== 'realizado' && onSignExecution && (
              <Button
                type="button"
                onClick={() => onSignExecution(service)}
                className="px-4 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[9px] font-black uppercase tracking-wider rounded-lg"
              >
                Assinar Conclusão
              </Button>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
