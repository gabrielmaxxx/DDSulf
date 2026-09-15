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

interface ProductWithStock {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  availableQty: number;
  costPerUnit: number;
  totalCost: number;
  isInsufficient: boolean;
}

interface PopDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  matchedPop: any;
  productsWithStockCosts: ProductWithStock[];
  estimatedHours: number;
}

export function PopDetailDialog({
  open,
  onOpenChange,
  matchedPop,
  productsWithStockCosts,
  estimatedHours
}: PopDetailDialogProps) {
  if (!matchedPop) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md" className="space-y-4">
        <DialogHeader>
          <span className="text-[10px] font-black uppercase text-emerald-700 tracking-widest block">
            Procedimento Operacional Padrão (POP)
          </span>
          <DialogTitle className="text-base font-black text-slate-900">
            {matchedPop.name}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            Parâmetros técnicos regulatórios e insumos recomendados para este procedimento.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3.5 max-h-[360px] overflow-y-auto pr-1 text-xs leading-relaxed">
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Descritivo da Praga Alvo</span>
            <p className="font-semibold text-slate-700 mt-1">{matchedPop.pestType || 'Controle Técnico'}</p>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Produtos Químicos Obrigatórios</span>
            <div className="grid gap-2 mt-1.5">
              {productsWithStockCosts.length > 0 ? (
                productsWithStockCosts.map((p, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-150 rounded-lg">
                    <div>
                      <p className="font-extrabold text-slate-800">{p.productName}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Qtd Usada: {p.quantity} {p.unit} ({p.availableQty} em estoque)
                      </p>
                    </div>
                    <span className={`text-[10px] font-bold ${p.isInsufficient ? 'text-red-600' : 'text-emerald-700'}`}>
                      {p.isInsufficient ? 'Sem Estoque' : 'Em Estoque ✓'}
                    </span>
                  </div>
                ))
              ) : (
                <p className="italic text-slate-500 text-[11px]">Nenhum produto químico associado.</p>
              )}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-bold uppercase text-slate-400">Tempo de Atendimento Estimado</span>
            <p className="font-semibold text-slate-700 mt-1">{estimatedHours} Hora(s) de dedicação técnica.</p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 text-xs font-bold rounded-xl cursor-pointer"
          >
            Fechar POP
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
