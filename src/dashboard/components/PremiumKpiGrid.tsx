import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { DashboardKPI } from '../types';

interface KpiCardProps {
  kpi: DashboardKPI;
  icon: LucideIcon;
}

export function KpiCard({ kpi, icon: Icon }: KpiCardProps) {
  const isUp = kpi.trendDirection === 'up';
  const isDown = kpi.trendDirection === 'down';
  
  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="bg-white border border-slate-200/60 shadow-sm rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between font-sans h-[154px] group"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
          {kpi.title}
        </span>
        <div className="p-2 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-slate-950 group-hover:text-white transition-all">
          <Icon className="size-4 text-slate-510 group-hover:text-white" />
        </div>
      </div>

      <div className="space-y-1.5 self-start w-full">
        <h3 className="text-3xl font-black text-slate-950 tracking-tightest leading-none">
          {kpi.value}
        </h3>
        
        <div className="flex items-center justify-between w-full">
          <p className="text-[10px] text-slate-405 font-bold truncate max-w-[140px]">
            {kpi.description}
          </p>
          
          {kpi.changePercent !== undefined && (
            <div className={cn(
              "flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[10px] font-black leading-none",
              isUp && "bg-emerald-50 text-emerald-600",
              isDown && "bg-rose-50/70 text-rose-600",
              !isUp && !isDown && "bg-slate-100 text-slate-600"
            )}>
              {isUp && <TrendingUp className="size-3" />}
              {isDown && <TrendingDown className="size-3" />}
              <span>{isUp ? '+' : ''}{kpi.changePercent}%</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Visual top accent border based on status */}
      {kpi.status === 'success' && <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />}
      {kpi.status === 'warning' && <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />}
      {kpi.status === 'error' && <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />}
    </motion.div>
  );
}

interface PremiumKpiGridProps {
  kpis: DashboardKPI[];
  icons: Record<string, LucideIcon>;
}

export function PremiumKpiGrid({ kpis, icons }: PremiumKpiGridProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 w-full">
      {kpis.map((kpi, idx) => {
        const matchingIcon = icons[kpi.key] || icons['default'];
        return (
          <motion.div
            key={kpi.key}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
          >
            <KpiCard kpi={kpi} icon={matchingIcon} />
          </motion.div>
        );
      })}
    </div>
  );
}

export default PremiumKpiGrid;
