import React from 'react';
import { useFilterStore } from '@/store/useFilterStore';
import { PestType } from '@/types/database';
import { Bug, Compass, Filter, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface OperationalFilterProps {
  onClear: () => void;
}

const pests: Array<{ key: PestType | 'All'; label: string }> = [
  { key: 'All', label: 'Todas Pragas' },
  { key: 'Baratas', label: 'Baratas' },
  { key: 'Cupins', label: 'Cupins' },
  { key: 'Ratos', label: 'Ratos' },
  { key: 'Formigas', label: 'Formigas' }
];

export function OperationalFilter({ onClear }: OperationalFilterProps) {
  const { pestFilter, setPestFilter } = useFilterStore();

  return (
    <div className="flex flex-wrap items-center gap-3 w-full font-sans">
      <div className="flex items-center gap-2 text-slate-400 bg-slate-50 border border-slate-200/50 rounded-xl px-3 py-2 text-xs font-bold leading-none select-none">
        <Filter className="size-3.5 text-slate-550" />
        <span className="uppercase tracking-widest text-[9px] font-black text-slate-600">Filtrar Operação</span>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
        {pests.map((p) => {
          const isActive = (p.key === 'All' && !pestFilter) || (pestFilter === p.key);
          return (
            <button
              key={p.key}
              onClick={() => setPestFilter(p.key === 'All' ? null : p.key as PestType)}
              className={cn(
                "h-9 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer border flex items-center gap-2 select-none",
                isActive
                  ? "bg-slate-900 border-transparent text-white shadow-md active:scale-95"
                  : "bg-white border-slate-200 text-slate-650 hover:bg-slate-50 hover:border-slate-300"
              )}
            >
              <Bug className="size-3" />
              {p.label}
            </button>
          );
        })}
      </div>

      {(pestFilter) && (
        <button
          onClick={onClear}
          className="h-9 px-3 border border-dashed border-rose-200 text-rose-600 bg-rose-50/20 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
        >
          <RefreshCw className="size-3 animate-spin duration-1000" />
          Limpar Filtro
        </button>
      )}
    </div>
  );
}

export default OperationalFilter;
