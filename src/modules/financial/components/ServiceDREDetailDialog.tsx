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
import { Quote, useSystemStore, calcularDREPorOS } from '@/store';
import { formatBRL, formatPercent, formatDate } from '@/utils/format';

interface ServiceDREDetailDialogProps {
  quote: Quote | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceDREDetailDialog({
  quote,
  open,
  onOpenChange
}: ServiceDREDetailDialogProps) {
  if (!quote) return null;

  const state = useSystemStore.getState();
  const breakdown = quote.dreBreakdown || calcularDREPorOS(quote, state);
  const receita = Number(quote.pricing?.finalPrice) || 0;
  const custoVariavel = Number(breakdown.variableCost) || Number(quote.costs?.total) || 0;
  const custoFixoShare = Number(breakdown.fixedCostShare) || 0;
  const custoTotal = Number(breakdown.totalCost) || (custoVariavel + custoFixoShare);
  const lucroLiquido = Number(breakdown.netMargin) ?? (receita - custoTotal);
  const margemPct = Number(breakdown.netMarginPercent) ?? (receita > 0 ? (lucroLiquido / receita) * 100 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg" className="p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-100">
              Demonstrativo de Resultado da OS
            </span>
          </div>
          <DialogTitle className="mt-1 text-base font-extrabold text-slate-800">
            DRE do Serviço: OS #{quote.id}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {quote.client?.name} — {quote.service?.serviceType}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          {/* Detailed Table */}
          <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl p-4 space-y-2.5 text-xs font-mono">
            <div className="flex justify-between items-center py-1 border-b border-slate-200/80">
              <span className="font-sans font-bold text-slate-700">Receita Bruta do Serviço</span>
              <span className="font-black text-slate-900">{formatBRL(receita)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/80 text-rose-700">
              <span className="font-sans font-medium text-slate-600">
                (-) Custo Variável Direto (Produtos + MO + Transp.)
              </span>
              <span>- {formatBRL(custoVariavel)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/80 text-rose-700">
              <span className="font-sans font-medium text-slate-600">
                (-) Rateio de Custos Fixos Operacionais
              </span>
              <span>- {formatBRL(custoFixoShare)}</span>
            </div>

            <div className="flex justify-between items-center py-1 border-b border-slate-200/80 font-bold text-slate-800">
              <span className="font-sans font-bold text-slate-700">(=) Custo Total do Serviço</span>
              <span className="text-rose-700">{formatBRL(custoTotal)}</span>
            </div>

            <div className="flex justify-between items-center pt-2 font-black text-sm">
              <span className="font-sans text-slate-900">(=) Lucro Operacional Líquido</span>
              <span className={lucroLiquido >= 0 ? 'text-emerald-700' : 'text-rose-600'}>
                {formatBRL(lucroLiquido)} ({formatPercent(margemPct)})
              </span>
            </div>
          </div>

          {/* Products Used Info */}
          {quote.productsUsed && quote.productsUsed.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <h4 className="text-[10px] font-black uppercase text-slate-500 tracking-wider font-sans">
                Insumos Consumidos do Estoque
              </h4>
              <div className="space-y-1 bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-mono">
                {quote.productsUsed.map((p, idx) => (
                  <div key={idx} className="flex justify-between text-[#141410]">
                    <span>{p.productName}</span>
                    <span className="font-bold">
                      {p.quantity} {p.unit}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Service metadata */}
          <div className="grid grid-cols-2 gap-3 pt-2 text-[11px] text-slate-600 font-sans border-t border-slate-100">
            <div>
              <span className="font-bold block text-slate-800">Técnico Designado</span>
              {quote.scheduledTechnician || 'Não informado'}
            </div>
            <div>
              <span className="font-bold block text-slate-800">Data de Confirmação</span>
              {quote.confirmedAt
                ? formatDate(quote.confirmedAt.substring(0, 10))
                : quote.scheduledDate
                ? formatDate(quote.scheduledDate)
                : 'N/A'}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
