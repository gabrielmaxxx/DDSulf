import React from 'react';
import { DashboardTimePeriod } from '../types';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface TimeRangeFilterProps {
  activePeriod: DashboardTimePeriod;
  onPeriodChange: (period: DashboardTimePeriod) => void;
}

const periods: Array<{ key: DashboardTimePeriod; label: string }> = [
  { key: 'today', label: 'Hoje' },
  { key: 'weekly', label: 'Semanal' },
  { key: 'monthly', label: 'Mensal' },
  { key: 'quarterly', label: 'Trimestral' },
  { key: 'annual', label: 'Anual' },
  { key: 'all', label: 'Histórico' }
];

export function TimeRangeFilter({ activePeriod, onPeriodChange }: TimeRangeFilterProps) {
  return (
    <div className="bg-slate-100/80 backdrop-blur-md p-1 rounded-2xl flex items-center space-x-1 border border-slate-200/50 w-full overflow-x-auto scrollbar-none md:w-auto">
      {periods.map((period) => {
        const isActive = activePeriod === period.key;
        return (
          <button
            key={period.key}
            onClick={() => onPeriodChange(period.key)}
            className={cn(
              "relative px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider select-none transition-all cursor-pointer whitespace-nowrap duration-300",
              isActive 
                ? "text-slate-900 drop-shadow-sm font-black" 
                : "text-slate-500 hover:text-slate-900 font-bold"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activePeriodIndicator"
                className="absolute inset-0 bg-white rounded-xl shadow-sm z-0"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{period.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export default TimeRangeFilter;
