import React from 'react';
import { Card } from '@/components/ui/card';
import { Quote } from '@/types/database';
import { MapPin, ArrowUpRight } from 'lucide-react';

interface ActiveJobsDensityProps {
  quotes: Quote[];
}

export function ActiveJobsDensity({ quotes }: ActiveJobsDensityProps) {
  // Extract regions or top clients
  const topJobs = quotes.slice(0, 3);
  
  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Logística Recente</h4>
          <h3 className="text-lg font-black text-slate-900">Ordens Críticas em Foco</h3>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl">
          <MapPin className="size-4 text-slate-500" />
        </div>
      </div>

      <div className="space-y-3.5">
        {topJobs.map((job) => (
          <div key={job.id} className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-slate-100/50 transition-colors">
            <div className="size-9 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 select-none">
              {job.pestType[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-black uppercase tracking-widest text-slate-950 truncate">{job.clientName || 'Cliente Residencial'}</p>
              <p className="text-[9.5px] font-bold text-slate-450 leading-none mt-0.5 truncate">{job.pestType} • {job.environmentType}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-xs font-black text-slate-950">R$ {job.suggestedPrice.toLocaleString()}</p>
              <p className="text-[8.5px] font-bold text-emerald-600 uppercase tracking-widest flex items-center justify-end gap-0.5 mt-0.5">
                <ArrowUpRight className="size-2.5" />
                {job.estimatedMargin}%
              </p>
            </div>
          </div>
        ))}
        {topJobs.length === 0 && (
          <p className="text-xs text-slate-450 text-center py-4 font-bold uppercase tracking-widest">Sem tarefas cadastradas</p>
        )}
      </div>
    </Card>
  );
}

export default ActiveJobsDensity;
