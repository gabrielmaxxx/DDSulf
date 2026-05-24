import React, { useState } from 'react';
import { Calendar, FileText, Loader2, Sparkles } from 'lucide-react';
import { DashboardTimePeriod } from '../types';
import { TimeRangeFilter } from '../filters/TimeRangeFilter';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MetricsHeaderProps {
  activePeriod: DashboardTimePeriod;
  onPeriodChange: (period: DashboardTimePeriod) => void;
  isOnline: boolean;
  onGenerateReport?: () => Promise<void>;
}

export function MetricsHeader({
  activePeriod,
  onPeriodChange,
  isOnline,
  onGenerateReport
}: MetricsHeaderProps) {
  const [reportLoading, setReportLoading] = useState(false);
  const formattedDate = format(new Date(), "MMMM yyyy", { locale: ptBR });

  const handleReport = async () => {
    if (!onGenerateReport) return;
    setReportLoading(true);
    try {
      await onGenerateReport();
    } catch (e) {
      console.error(e);
    } finally {
      setReportLoading(false);
    }
  };

  return (
    <header className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 pb-6 font-sans">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2">
          <div className="relative flex size-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
            <span className={`relative inline-flex rounded-full size-2 ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
          </div>
          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
            {isOnline ? 'Sistema Ativo • Real-time Analytics' : 'Modo Offline Ativo'}
          </span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tightest text-slate-950">
          Inteligência Operacional
        </h1>
        <p className="text-lg sm:text-xl text-slate-500 font-medium max-w-2xl leading-normal">
          Visualização de alta densidade para decisões baseadas em lucratividade real.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
        <TimeRangeFilter activePeriod={activePeriod} onPeriodChange={onPeriodChange} />
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="h-11 px-4 rounded-xl border border-slate-200/60 bg-white text-slate-700 font-bold text-xs flex items-center gap-2 select-none uppercase tracking-widest whitespace-nowrap shadow-sm min-w-[140px] justify-center">
            <Calendar className="size-4 text-slate-500" />
            <span>{formattedDate}</span>
          </div>

          <button
            onClick={handleReport}
            disabled={reportLoading}
            className="h-11 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-950 text-white shadow-md hover:bg-black active:scale-95 transition-all w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {reportLoading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <FileText className="size-3.5" />
            )}
            <span>Gerar Executivo</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export default MetricsHeader;
