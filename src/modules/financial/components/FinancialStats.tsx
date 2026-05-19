import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Info } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface StatsProps {
  metrics: {
    totalRevenue: number;
    totalCost: number;
    netProfit: number;
    margin: number;
  };
}

export function FinancialStats({ metrics }: StatsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-4">
      <StatCard 
        label="Faturamento Bruto" 
        value={`R$ ${metrics.totalRevenue.toLocaleString('pt-BR')}`} 
        icon={DollarSign}
        type="revenue"
      />
      <StatCard 
        label="Custos Operacionais" 
        value={`R$ ${metrics.totalCost.toLocaleString('pt-BR')}`} 
        icon={TrendingDown}
        type="cost"
      />
      <StatCard 
        label="Lucro Líquido" 
        value={`R$ ${metrics.netProfit.toLocaleString('pt-BR')}`} 
        icon={TrendingUp}
        type="profit"
      />
      <StatCard 
        label="Margem Média" 
        value={`${metrics.margin.toFixed(1)}%`} 
        icon={PieChart}
        type="margin"
      />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, type }: { label: string, value: string, icon: any, type: string }) {
  const colors = {
    revenue: "text-emerald-600 bg-emerald-50",
    cost: "text-rose-600 bg-rose-50",
    profit: "text-blue-600 bg-blue-50",
    margin: "text-black bg-gray-100"
  }[type] || "text-black bg-gray-100";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E5E7EB] p-6 rounded-3xl shadow-sm space-y-4"
    >
      <div className="flex items-center justify-between">
        <div className={cn("p-3 rounded-2xl", colors)}>
          <Icon className="size-5" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#ECFDF5] px-2 py-1 rounded-full">
          <TrendingUp className="size-3" /> 8%
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-[10px] font-black text-[#9CA3AF] uppercase tracking-[0.2em]">{label}</div>
        <div className="text-2xl font-black text-black tracking-tight">{value}</div>
      </div>
      <div className="pt-2 flex items-center gap-1 text-[#9CA3AF]">
         <Info className="size-3" />
         <span className="text-[9px] font-bold uppercase tracking-widest">Baseado em dados reais</span>
      </div>
    </motion.div>
  );
}
