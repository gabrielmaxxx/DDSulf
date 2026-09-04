import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { toast } from 'sonner';

interface QuickMoveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'entrada' | 'saida';
  onTypeChange: (type: 'entrada' | 'saida') => void;
  defaultProductId?: string;
  products: any[];
  onConfirm: (data: {
    productId: string;
    type: 'entrada' | 'saida';
    quantity: number;
    reason: string;
    lot: string;
    expiryDate: string;
    origin: 'Serviço' | 'Retorno' | 'Perda';
  }) => void;
}

export function QuickMoveDialog({
  open,
  onOpenChange,
  type,
  onTypeChange,
  defaultProductId,
  products,
  onConfirm,
}: QuickMoveDialogProps) {
  const [prodId, setProdId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('');
  const [lot, setLot] = useState('LT-PADRAO');
  const [expiryDate, setExpiryDate] = useState('');
  const [origin, setOrigin] = useState<'Serviço' | 'Retorno' | 'Perda'>('Serviço');

  useEffect(() => {
    if (open) {
      if (defaultProductId) {
        setProdId(defaultProductId);
      } else if (products.length > 0 && !prodId) {
        setProdId(products[0].id);
      }
      setQuantity(1);
      setReason('');
      setLot('LT-PADRAO');
      setExpiryDate('');
      setOrigin('Serviço');
    }
  }, [open, defaultProductId, products]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodId) {
      toast.error('Escolha um insumo para movimentar.');
      return;
    }
    const targetProduct = products.find((p) => p.id === prodId);
    if (!targetProduct) return;

    if (type === 'saida' && targetProduct.quantity < quantity) {
      toast.error(
        `Quantidade insuficiente em estoque. Saldo atual: ${targetProduct.quantity} ${targetProduct.unit}`
      );
      return;
    }

    onConfirm({
      productId: prodId,
      type,
      quantity,
      reason,
      lot,
      expiryDate,
      origin,
    });
  };

  const selectedProduct = products.find((p) => p.id === prodId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="sm" className="p-0 overflow-hidden rounded-3xl border-slate-200">
        <div className="p-5 bg-[#1B3A2D] text-white flex items-center justify-between text-left">
          <div>
            <DialogHeader>
              <DialogTitle className="text-base font-extrabold uppercase tracking-tight font-display text-white flex items-center gap-2">
                {type === 'entrada' ? (
                  <>
                    <ArrowUpRight className="size-4 text-emerald-400" />
                    Registrar Incremento de Estoque
                  </>
                ) : (
                  <>
                    <ArrowDownLeft className="size-4 text-rose-400" />
                    Registrar Saída / Baixa
                  </>
                )}
              </DialogTitle>
              <DialogDescription className="text-[11px] text-[#A8CDB8] mt-0.5">
                Efetue a alteração operacional imediata.
              </DialogDescription>
            </DialogHeader>
          </div>
        </div>

        {/* Toggle between Entrada and Saida */}
        <div className="px-6 pt-3">
          <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => onTypeChange('entrada')}
              className={`py-1.5 rounded-lg text-center font-bold uppercase transition-all cursor-pointer text-[10px] flex items-center justify-center gap-1 ${
                type === 'entrada'
                  ? 'bg-[#1B3A2D] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <ArrowUpRight className="size-3 text-emerald-400" /> Entrada
            </button>
            <button
              type="button"
              onClick={() => onTypeChange('saida')}
              className={`py-1.5 rounded-lg text-center font-bold uppercase transition-all cursor-pointer text-[10px] flex items-center justify-center gap-1 ${
                type === 'saida'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <ArrowDownLeft className="size-3 text-rose-200" /> Saída
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 pt-3 space-y-4 text-xs font-semibold text-slate-700 text-left"
        >
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black text-slate-450 block">
              Selecione o Insumo
            </span>
            <select
              value={prodId}
              onChange={(e) => setProdId(e.target.value)}
              className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              required
            >
              <option value="">-- Escolha da lista --</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Saldo: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Quantidade {selectedProduct ? `(${selectedProduct.unit})` : ''}
              </span>
              <input
                type="number"
                min="0.001"
                step="ANY"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseFloat(e.target.value) || 1)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-bold text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Lote
              </span>
              <input
                type="text"
                value={lot}
                onChange={(e) => setLot(e.target.value)}
                placeholder="LOTE-MOV"
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
          </div>

          {type === 'saida' && (
            <div className="space-y-1" id="outflow-origin-group">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Origem da Saída
              </span>
              <select
                value={origin}
                onChange={(e) => setOrigin(e.target.value as any)}
                className="w-full h-10 px-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
                required
              >
                <option value="Serviço">Serviço (Consumo em Atendimento)</option>
                <option value="Retorno">Retorno (Sobra ou Ajuste de Carga)</option>
                <option value="Perda">Perda (Dano, Vencimento ou Descarte)</option>
              </select>
            </div>
          )}

          {type === 'entrada' && (
            <div className="space-y-1">
              <span className="text-[9px] uppercase font-black text-slate-450 block">
                Data de Validade (Opcional)
              </span>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
              />
            </div>
          )}

          <div className="space-y-1">
            <span className="text-[9px] uppercase font-black text-slate-450 block">
              Motivo / Finalidade
            </span>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: Nota Fiscal nº 3929 ou Retirada Equipe Alfa"
              className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D]"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="text-slate-400 font-bold uppercase hover:text-slate-700 text-[10px] cursor-pointer"
            >
              Cancelar
            </button>
            <Button
              type="submit"
              className="bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/95 font-black uppercase text-[10px] py-2 px-4 rounded-xl cursor-pointer"
            >
              Confirmar Transação
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
