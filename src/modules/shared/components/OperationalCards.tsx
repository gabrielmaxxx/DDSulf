import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  description?: string;
  type?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

export function KpiCard({ label, value, icon: Icon, trend, description, type = 'neutral', className }: KpiCardProps) {
  const isPositive = trend && trend > 0;
  
  const typeStyles = {
    neutral: "bg-white text-black border-[#E5E7EB]",
    success: "bg-emerald-50 text-emerald-900 border-emerald-100",
    warning: "bg-amber-50 text-amber-900 border-amber-100",
    error: "bg-rose-50 text-rose-900 border-rose-100",
    info: "bg-blue-50 text-blue-900 border-blue-100"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={cn(
        "border p-6 rounded-[32px] shadow-sm space-y-4 hover:shadow-md transition-all group",
        typeStyles[type || 'neutral'],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className={cn(
          "p-3 rounded-2xl transition-colors",
          type === 'neutral' ? "bg-[#F3F4F6] group-hover:bg-black group-hover:text-white" : "bg-white/50"
        )}>
          <Icon className="size-5" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full",
            isPositive ? "bg-[#ECFDF5] text-[#10B981]" : "bg-rose-50 text-rose-600"
          )}>
            {isPositive ? <TrendingUp className="size-3" /> : <TrendingDown className="size-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <div className="text-[10px] font-black opacity-40 uppercase tracking-[0.2em]">{label}</div>
        <div className="text-3xl font-black tracking-tightest">{value}</div>
      </div>

      {description && (
        <p className="text-[10px] font-bold opacity-40 uppercase tracking-widest leading-relaxed">
          {description}
        </p>
      )}
    </motion.div>
  );
}

export function InsightCard({ insight }: { insight: { type: 'success' | 'warning' | 'info' | 'error', pattern: string, confidence: number, dataPoints: number } }) {
  const icons = {
    success: "✅",
    warning: "⚠️",
    info: "💡",
    error: "🚨"
  };

  const colors = {
    success: "border-emerald-100 bg-emerald-50 text-emerald-900",
    warning: "border-amber-100 bg-amber-50 text-amber-900",
    info: "border-blue-100 bg-blue-50 text-blue-800",
    error: "border-rose-100 bg-rose-50 text-rose-900"
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className={cn(
        "p-6 rounded-2xl border flex items-start gap-4",
        colors[insight.type] || colors.info
      )}
    >
      <div className="text-2xl mt-1">{icons[insight.type]}</div>
      <div className="space-y-1">
        <p className="font-bold text-sm leading-tight">{insight.pattern}</p>
        <div className="flex items-center gap-3">
           <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Confiança: {(insight.confidence * 100).toFixed(0)}%</span>
           <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Base: {insight.dataPoints} pts</span>
        </div>
      </div>
    </motion.div>
  );
}
