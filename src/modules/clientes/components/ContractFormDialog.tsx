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

interface ContractFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  title: string;
  setTitle: (v: string) => void;
  recurrent: number;
  setRecurrent: (v: number) => void;
  recurrency: number;
  setRecurrency: (v: number) => void;
  startDate: string;
  setStartDate: (v: string) => void;
  endDate: string;
  setEndDate: (v: string) => void;
  status: 'ativo' | 'vencido' | 'cancelado';
  setStatus: (v: 'ativo' | 'vencido' | 'cancelado') => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function ContractFormDialog({
  open,
  onOpenChange,
  mode,
  title,
  setTitle,
  recurrent,
  setRecurrent,
  recurrency,
  setRecurrency,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  status,
  setStatus,
  onSubmit,
}: ContractFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" id="dialog-contract-form">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Agendar Novo Contrato' : 'Editar Plano Recorrente'}
          </DialogTitle>
          <DialogDescription>
            Defina vigência, valores e a recorrência mensal de atendimento.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
              Título / Escopo do Contrato *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
                Valor Mensal (Recorrente)
              </label>
              <input
                type="number"
                required
                value={recurrent}
                onChange={(e) => setRecurrent(Number(e.target.value))}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-mono text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
                Frequência Cobrança
              </label>
              <select
                value={recurrency}
                onChange={(e) => setRecurrency(Number(e.target.value))}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1]/90 rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
              >
                <option value={1}>Todo Mês</option>
                <option value={2}>Bimestral (2 em 2 m)</option>
                <option value={3}>Trimestral (3 em 3 m)</option>
                <option value={6}>Semestral (6 em 6 m)</option>
                <option value={12}>Anual</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
                Início Vigência
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
                Fim Vigência
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
          </div>

          {mode === 'edit' && (
            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
                Status do Contrato
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410]"
              >
                <option value="ativo">Ativo e Regularizado</option>
                <option value="vencido">Vencido</option>
                <option value="cancelado">Cancelado pelo Cliente</option>
              </select>
            </div>
          )}

          <DialogFooter className="pt-4 border-t border-[#FAF9F6] flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141410] text-[10px] font-black uppercase tracking-wider rounded-lg"
            >
              Voltar
            </Button>
            <Button
              type="submit"
              className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-wider rounded-lg"
            >
              Salvar Compromisso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
