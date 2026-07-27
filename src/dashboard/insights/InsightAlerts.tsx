import React from 'react';
import { Card } from '@/components/ui/card';
import { OperationalInsight, AnomalyLog } from '../types';
import { AlertTriangle, Lightbulb, Compass, Zap, Flame, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface InsightAlertsProps {
  insights: OperationalInsight[];
  anomalies: AnomalyLog[];
  onDismissAnomaly?: (id: string) => void;
}

export function InsightAlerts({ insights, anomalies, onDismissAnomaly }: InsightAlertsProps) {
  return (
    <div className="space-y-6 font-sans">
      {/* 1. Anomalies Header and List */}
      {anomalies.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-rose-600">
            <AlertTriangle className="size-4 shrink-0" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">Anomalias de Desempenho</h4>
          </div>
          <div className="grid gap-4">
            {anomalies.map((anom) => (
              <motion.div
                key={anom.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-rose-50/15 border border-rose-100 rounded-3xl p-5 flex gap-4 items-start"
              >
                <div className="p-2 bg-rose-150 text-rose-600 rounded-xl shrink-0 mt-0.5">
                  <Flame className="size-4 animate-bounce" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <h4 className="text-xs font-black text-rose-950 uppercase tracking-wide">{anom.title}</h4>
                  <p className="text-[11px] text-rose-900/80 leading-relaxed font-semibold">{anom.message}</p>
                </div>
                {onDismissAnomaly && (
                  <button
                    onClick={() => onDismissAnomaly(anom.id)}
                    className="text-[9px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-950 bg-rose-100/40 px-3 py-1.5 rounded-xl cursor-pointer"
                  >
                    Mapear
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Intelligence Recommendations suggestions */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-650">
          <Lightbulb className="size-4 text-indigo-600 shrink-0" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] leading-none">PestFlow Recomendações</h4>
        </div>
        <div className="grid gap-4">
          {insights.map((ins, idx) => {
            const isEfficiency = ins.category === 'efficiency';
            const isFinancial = ins.category === 'financial';
            const isQuality = ins.category === 'quality';

            return (
              <motion.div
                key={ins.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-[#4F46E5]">
                      <Zap className="size-3" />
                      <span>Otimização de {ins.category}</span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900">{ins.title}</h4>
                  </div>
                  {ins.impactPercent && (
                    <div className="bg-slate-900 text-white rounded-xl px-2.5 py-1 text-[10px] font-black font-mono">
                      +{ins.impactPercent}% Retorno
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-3">
                  {ins.recommendation}
                </p>

                <div className="flex items-center justify-between border-t border-slate-100 pt-3.5 mt-5">
                  <div className="flex items-center gap-1">
                    <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Confiança PestFlow IA</span>
                    <span className="text-[9.5px] text-emerald-600 font-black font-mono">{(ins.confidenceScore * 100).toFixed(0)}%</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{ins.associatedDataPoints} Amostras</span>
                </div>
              </motion.div>
            );
          })}

          {insights.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-slate-100 rounded-3xl space-y-3">
              <Compass className="size-6 text-slate-350 mx-auto animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-405">Coletando amostras para processamento de rotas e compras...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default InsightAlerts;
