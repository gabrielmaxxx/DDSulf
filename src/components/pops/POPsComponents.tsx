import React, { useState } from 'react';
import { ShieldCheck, BookOpen, Clock, AlertTriangle, CheckSquare, Square, ChevronRight } from 'lucide-react';

interface POPCardProps {
  id: string;
  title: string;
  pestType: string;
  environmentType: string;
  recommendedProducts: string[];
  checklist: string[];
  onSelect?: () => void;
}

export function POPCard({
  id,
  title,
  pestType,
  environmentType,
  recommendedProducts,
  checklist,
  onSelect
}: POPCardProps) {
  return (
    <div 
      onClick={onSelect}
      className={`p-5 rounded-2xl border border-slate-200/50 bg-white hover:border-slate-300 transition-all ${
        onSelect ? 'cursor-pointer hover:shadow-md hover:shadow-slate-100/30 active:scale-[0.995]' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded font-mono">
              {pestType}
            </span>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded font-mono">
              {environmentType}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900 leading-snug tracking-tight pt-1">
            {title}
          </h4>
        </div>

        <div className="size-8 rounded-lg bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm border border-slate-800">
          <BookOpen className="size-4" />
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-50 space-y-2.5">
        <div>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Produtos Recomendados</span>
          <div className="flex flex-wrap gap-1 mt-1">
            {recommendedProducts.map(p => (
              <span key={p} className="text-[10px] bg-slate-50 border border-slate-200/30 text-slate-600 font-semibold px-2 py-0.5 rounded-lg">
                {p}
              </span>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span className="flex items-center gap-1">
            <CheckSquare className="size-3.5 text-slate-400" />
            {checklist.length} diretrizes de segurança
          </span>
          {onSelect && (
            <span className="text-slate-900 flex items-center gap-0.5 font-bold hover:translate-x-0.5 transition-all text-[10px]">
              Visualizar POP
              <ChevronRight className="size-3" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// 2. Technician Interactive POP Checklist
interface POPChecklistProps {
  checklistItems: string[];
}

export function POPChecklist({ checklistItems }: POPChecklistProps) {
  const [checkedStates, setCheckedStates] = useState<Record<number, boolean>>({});

  const toggleCheck = (idx: number) => {
    setCheckedStates(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  return (
    <div className="space-y-2">
      {checklistItems.map((item, idx) => {
        const isChecked = !!checkedStates[idx];

        return (
          <div 
            key={idx}
            onClick={() => toggleCheck(idx)}
            className={`p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
              isChecked 
                ? 'bg-emerald-50/25 border-emerald-100 text-slate-500 line-through' 
                : 'bg-white border-slate-200/50 text-slate-800 hover:border-slate-300'
            }`}
          >
            <div className="mt-0.5 shrink-0 select-none">
              {isChecked ? (
                <ShieldCheck className="size-4.5 text-emerald-500" />
              ) : (
                <Square className="size-4.5 text-slate-350" />
              )}
            </div>
            
            <span className="text-xs font-medium leading-relaxed font-sans">
              {item}
            </span>
          </div>
        );
      })}
    </div>
  );
}
