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

interface NewReturnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientName: string;
  reason: string;
  setReason: (v: string) => void;
  date: string;
  setDate: (v: string) => void;
  cost: number;
  setCost: (v: number) => void;
  notes: string;
  setNotes: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function NewReturnDialog({
  open,
  onOpenChange,
  clientName,
  reason,
  setReason,
  date,
  setDate,
  cost,
  setCost,
  notes,
  setNotes,
  onSubmit,
}: NewReturnDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" id="dialog-new-return">
        <DialogHeader>
          <DialogTitle>
            Registrar Chamado Retorno: {clientName}
          </DialogTitle>
          <DialogDescription>
            Insira justificativas de reinfestação reportados pelo cliente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-500 uppercase">
              Motivo Relatado pelo Cliente
            </label>
            <input 
              type="text" 
              required 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs" 
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase font-semibold">
                Data Solicitada
              </label>
              <input 
                type="date" 
                required 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-slate-550" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-500 uppercase">
                Custo Frota/Deslocamento
              </label>
              <input 
                type="number" 
                required 
                value={cost} 
                onChange={(e) => setCost(Number(e.target.value))} 
                className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-mono" 
              />
            </div>
          </div>

          <div className="space-y-1 font-sans">
            <label className="text-[10px] font-black text-slate-500 uppercase">
              Histórico e Observações
            </label>
            <textarea 
              rows={2} 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-2.5 text-xs text-slate-600" 
            />
          </div>

          <DialogFooter className="pt-4 border-t border-[#FAF9F6] flex justify-end gap-2.5">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              className="px-4 py-2 bg-slate-100 uppercase text-[9px] font-black rounded-lg"
            >
              Voltar
            </Button>
            <Button 
              type="submit" 
              className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white uppercase text-[9px] font-black rounded-lg"
            >
              Gerar OS de Retorno
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
