import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Check,
} from 'lucide-react';
import { EmpresaWithUserCount } from '@/services/superadmin/superAdminService';

export interface FinancialStatusFormData {
  status: 'em_dia' | 'atrasado';
  dataVencimento: string;
  dataUltimoPagamento: string;
  observacoes: string;
}

export interface FinancialStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empresa: EmpresaWithUserCount | null;
  onSubmit: (data: FinancialStatusFormData) => Promise<void>;
  isSubmitting: boolean;
}

export function FinancialStatusDialog({
  open,
  onOpenChange,
  empresa,
  onSubmit,
  isSubmitting,
}: FinancialStatusDialogProps) {
  const [finStatusVal, setFinStatusVal] = useState<'em_dia' | 'atrasado'>('em_dia');
  const [finVencimento, setFinVencimento] = useState('');
  const [finUltimoPgto, setFinUltimoPgto] = useState('');
  const [finObs, setFinObs] = useState('');

  useEffect(() => {
    if (empresa && open) {
      setFinStatusVal(empresa.financeiro?.status || 'em_dia');
      setFinVencimento(empresa.financeiro?.dataVencimento || '');
      setFinUltimoPgto(empresa.financeiro?.dataUltimoPagamento || '');
      setFinObs(empresa.financeiro?.observacoes || '');
    }
  }, [empresa, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      status: finStatusVal,
      dataVencimento: finVencimento,
      dataUltimoPagamento: finUltimoPgto,
      observacoes: finObs,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        size="md"
        className="bg-slate-900 border-slate-800 text-slate-100 p-6 space-y-5 rounded-3xl shadow-2xl [&_[data-slot=dialog-close]]:text-slate-400 [&_[data-slot=dialog-close]]:hover:text-white [&_[data-slot=dialog-close]]:hover:bg-slate-800"
      >
        <DialogHeader className="border-b border-slate-800 pb-3 flex flex-row items-center gap-2.5 space-y-0">
          <div className="size-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <CreditCard className="size-4" />
          </div>
          <div>
            <DialogTitle className="text-sm font-black text-white">Controle Financeiro</DialogTitle>
            <DialogDescription className="text-[10px] text-slate-400">
              {empresa?.nome || 'Empresa'}
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-bold mb-1">Status da Mensalidade</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFinStatusVal('em_dia')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                  finStatusVal === 'em_dia'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <CheckCircle2 className="size-4" />
                Em Dia
              </button>
              <button
                type="button"
                onClick={() => setFinStatusVal('atrasado')}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-bold cursor-pointer transition-all ${
                  finStatusVal === 'atrasado'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertTriangle className="size-4" />
                Atrasado
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-bold mb-1">Data de Vencimento</label>
              <input
                type="date"
                value={finVencimento}
                onChange={(e) => setFinVencimento(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-bold mb-1">Último Pagamento</label>
              <input
                type="date"
                value={finUltimoPgto}
                onChange={(e) => setFinUltimoPgto(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-bold mb-1">Observações Internas</label>
            <textarea
              rows={3}
              placeholder="Histórico de contato, negociação ou cobrança..."
              value={finObs}
              onChange={(e) => setFinObs(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="size-3.5 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Check className="size-3.5" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default FinancialStatusDialog;
