import React from 'react';
import { Package, RefreshCw, AlertTriangle, ArrowUpRight, ArrowDownRight, Archive, ShieldAlert } from 'lucide-react';

interface ProductCardProps {
  id: string;
  name: string;
  quantityAvailable: number;
  minimumStock: number;
  unit: string;
  category: string;
  onModifyClick?: () => void;
}

export function ProductCard({
  id,
  name,
  quantityAvailable,
  minimumStock,
  unit,
  category,
  onModifyClick
}: ProductCardProps) {
  const isUnderstock = quantityAvailable <= minimumStock;

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      isUnderstock 
        ? 'border-rose-200 bg-rose-50/10' 
        : 'border-slate-200/50 bg-white hover:border-slate-300'
    }`}>
      <div className="flex justify-between items-start gap-3">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
            {category}
          </span>
          <h4 className="text-sm font-bold text-slate-900 leading-snug tracking-tight">
            {name}
          </h4>
        </div>

        {isUnderstock && (
          <div className="size-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0 border border-rose-200/40">
            <ShieldAlert className="size-4 animate-bounce" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block">DISPONÍVEL</span>
          <div className="flex items-baseline gap-1">
            <span className={`text-base font-black font-mono ${isUnderstock ? 'text-rose-600' : 'text-slate-900'}`}>
              {quantityAvailable}
            </span>
            <span className="text-[10px] font-bold text-slate-400">{unit}</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-400 font-bold block">ESTOQUE MÍNIMO</span>
          <span className="text-xs font-semibold text-slate-600 font-mono">
            {minimumStock} {unit}
          </span>
        </div>
      </div>

      {isUnderstock && (
        <div className="mt-3 leading-none p-2 rounded-lg bg-rose-50 border border-rose-100/50 flex items-center gap-1.5 text-[10px] text-rose-700 font-medium">
          <AlertTriangle className="size-3.5" />
          <span>Reposição necessária - abaixo do estoque mínimo.</span>
        </div>
      )}

      {onModifyClick && (
        <button
          onClick={onModifyClick}
          className="mt-4 w-full h-8 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all text-[10px] font-bold text-slate-700 flex items-center justify-center gap-1 cursor-pointer"
        >
          <RefreshCw className="size-3" />
          Registrar Movimentação
        </button>
      )}
    </div>
  );
}

// 2. Stock Movement Card representational audit log
interface StockMovementCardProps {
  productName: string;
  type: 'Entrada' | 'Saída';
  quantity: number;
  unit: string;
  createdAt: string;
  technicianName?: string;
}

export function StockMovementCard({
  productName,
  type,
  quantity,
  unit,
  createdAt,
  technicianName
}: StockMovementCardProps) {
  const isInput = type === 'Entrada';

  return (
    <div className="p-3.5 rounded-xl border border-slate-100 bg-white flex items-center justify-between gap-4 font-sans text-xs">
      <div className="flex items-center gap-3">
        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 border ${
          isInput 
            ? 'bg-emerald-50 border-emerald-100 text-emerald-600' 
            : 'bg-slate-50 border-slate-150 text-slate-500'
        }`}>
          {isInput ? <ArrowUpRight className="size-4" /> : <ArrowDownRight className="size-4" />}
        </div>
        
        <div className="space-y-0.5">
          <h5 className="font-bold text-slate-800 leading-snug">{productName}</h5>
          <span className="text-[10px] text-slate-400 font-medium block">
            {new Date(createdAt).toLocaleString('pt-BR')} {technicianName ? `por ${technicianName}` : ''}
          </span>
        </div>
      </div>

      <div className={`font-mono font-bold whitespace-nowrap text-right ${
        isInput ? 'text-emerald-600' : 'text-slate-600'
      }`}>
        {isInput ? '+' : '-'} {quantity} {unit}
      </div>
    </div>
  );
}
