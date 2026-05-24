import React from 'react';
import { Card } from '@/components/ui/card';
import { Quote } from '@/types/database';
import { Activity, Clock, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

interface ProductivityTrackerProps {
  quotes: Quote[];
}

export function ProductivityTracker({ quotes }: ProductivityTrackerProps) {
  // Simple calculated indices
  const totalComplexityCount = quotes.filter(q => q.operationalComplexity === 'Complexo').length;
  const complexityRate = quotes.length > 0 ? (totalComplexityCount / quotes.length) * 100 : 0;
  
  const avgServiceTime = quotes.length > 0 
    ? quotes.reduce((acc, q) => acc + q.estimatedTime, 0) / quotes.length 
    : 0;

  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tempo & Complexidade</h4>
          <h3 className="text-lg font-black text-slate-900">Eficiência de Agendamentos</h3>
        </div>
        <div className="p-2 bg-slate-50 border border-slate-150 rounded-xl">
          <Activity className="size-4 text-slate-500" />
        </div>
      </div>

      <div className="space-y-4">
        {/* Estimated Duration rate bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5 uppercase tracking-widest text-[9.5px] font-black">
              <Clock className="size-3 text-slate-400" /> Duração Média
            </span>
            <span className="font-mono text-slate-950 font-black">{avgServiceTime.toFixed(1)} Horas</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((avgServiceTime / 8) * 100, 100)}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-slate-950 rounded-full"
            />
          </div>
        </div>

        {/* High complexity rates */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
            <span className="flex items-center gap-1.5 uppercase tracking-widest text-[9.5px] font-black">
              <ShieldCheck className="size-3 text-slate-400" /> Demanda de Alto Risco
            </span>
            <span className="font-mono text-slate-950 font-black">{complexityRate.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${complexityRate}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full bg-sky-650 rounded-full"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

export default ProductivityTracker;
