import React from 'react';
import { Card } from '@/components/ui/card';
import { OperationalSnapshot } from '../types';
import { Calendar, CheckSquare, Clock, ShieldAlert, Sparkles, Navigation, Activity } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface OperationalPanelProps {
  snapshot: OperationalSnapshot;
  isOnline: boolean;
  activeSubscriptions: number;
}

export function OperationalPanel({ snapshot, isOnline, activeSubscriptions }: OperationalPanelProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 w-full font-sans">
      {/* 1. Services in field */}
      <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden group">
        <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
          <Navigation className="size-5 text-slate-700 group-hover:text-white" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Serviços em Campo</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-slate-950">{snapshot.activeServicesCount.toString().padStart(2, '0')}</h4>
            <span className="text-[9px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded-md">Ativos</span>
          </div>
        </div>
      </Card>

      {/* 2. Pending Allocation */}
      <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden group">
        <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
          <Calendar className="size-5 text-slate-700 group-hover:text-white" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Pendente de Alocação</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-slate-950">{snapshot.pendingAllocationCount.toString().padStart(2, '0')}</h4>
            <span className="text-[9px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded-md">Espera</span>
          </div>
        </div>
      </Card>

      {/* 3. Retrabalho - Quality rates */}
      <Card className={cn(
        "border-slate-200/60 shadow-sm rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden",
        snapshot.reworkRatePercent > 5 ? "bg-rose-50/10 border-rose-100" : "bg-white"
      )}>
        <div className={cn(
          "p-3 rounded-2xl border",
          snapshot.reworkRatePercent > 5 
            ? "bg-rose-100 border-rose-200 text-rose-600" 
            : "bg-slate-50 border-slate-100 text-slate-700"
        )}>
          <ShieldAlert className="size-5" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400 font-black">Taxa de Retrabalho</p>
          <div className="flex items-baseline gap-2">
            <h4 className={cn(
              "text-2xl font-black",
              snapshot.reworkRatePercent > 5 ? "text-rose-600" : "text-slate-950"
            )}>{snapshot.reworkRatePercent.toFixed(1)}%</h4>
            <span className="text-[9px] text-slate-400 font-bold">Máx 5%</span>
          </div>
        </div>
      </Card>

      {/* 4. Speed of execution / average response */}
      <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-5 flex items-center gap-4 relative overflow-hidden group">
        <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl group-hover:bg-slate-900 group-hover:text-white transition-all">
          <Clock className="size-5 text-slate-700 group-hover:text-white" />
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] uppercase font-black tracking-wider text-slate-400">Tempo de Resposta</p>
          <div className="flex items-baseline gap-2">
            <h4 className="text-2xl font-black text-slate-950">{snapshot.avgResponseTimeHours.toFixed(1)}h</h4>
            <span className="text-[9px] bg-sky-50 text-sky-600 font-bold px-1.5 py-0.5 rounded-md">Excelente</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default OperationalPanel;
