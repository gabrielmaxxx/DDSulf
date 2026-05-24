import React from 'react';
import { MarginIntelligenceAlert } from '@/financial/profitability/types';
import { AlertCircle, AlertTriangle, CheckSquare, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkflowAlertsProps {
  alerts: MarginIntelligenceAlert[];
}

export function WorkflowAlerts({ alerts }: WorkflowAlertsProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-3">
      {alerts.map(a => {
        const isError = a.level === 'error';
        const isWarning = a.level === 'warning';
        const isSuccess = a.level === 'success';

        return (
          <div
            key={a.id}
            className={cn(
              "p-4.5 rounded-2xl border flex gap-3.5 transition-all animate-in fade-in slide-in-from-top-2 duration-300",
              isError 
                ? "bg-rose-50 border-rose-200 text-rose-950" 
                : isWarning 
                  ? "bg-amber-50 border-amber-200 text-amber-950" 
                  : "bg-emerald-50 border-emerald-200 text-emerald-950"
            )}
          >
            {/* Visual Icons */}
            <div className="flex-shrink-0 mt-0.5">
              {isError && <AlertCircle className="size-5 text-rose-600 animate-pulse" />}
              {isWarning && <AlertTriangle className="size-5 text-amber-600" />}
              {isSuccess && <CheckSquare className="size-5 text-emerald-600" />}
            </div>

            {/* Inner description content */}
            <div className="space-y-1.5 flex-1">
              <span className="text-xs font-black uppercase tracking-wider block">{a.title}</span>
              <p className="text-xs font-medium leading-relaxed text-black/85">{a.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                {a.financialWeight && (
                  <div className="text-[10px] font-bold">
                    <span className="opacity-60 block">Impacto Comercial:</span>
                    <span className={cn(isError ? "text-rose-700" : isWarning ? "text-amber-700" : "text-emerald-700")}>
                      {a.financialWeight}
                    </span>
                  </div>
                )}
                {a.correctiveGuidance && (
                  <div className="text-[10px] font-bold">
                    <span className="opacity-60 block">Diretriz de Correção:</span>
                    <span className="text-gray-900 block font-semibold">{a.correctiveGuidance}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
