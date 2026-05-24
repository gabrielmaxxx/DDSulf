import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoricalTrendPoint } from '../types';
import { TrendingUp, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface AdaptiveAreaChartProps {
  data: HistoricalTrendPoint[];
  title?: string;
  subtitle?: string;
}

export function AdaptiveAreaChart({ data, title = "Evolução do Faturamento", subtitle = "Histórico operacional e receita acumulada" }: AdaptiveAreaChartProps) {
  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-6 sm:p-8 space-y-6 overflow-hidden relative font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-2 bg-slate-900 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Performance Direct</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">{title}</h3>
          <p className="text-xs text-slate-500 font-bold">{subtitle}</p>
        </div>
        
        <div className="bg-slate-50 border border-slate-200/50 p-1.5 rounded-xl flex items-center space-x-1.5 self-start sm:self-center">
          <div className="px-3 py-1.5 bg-white rounded-lg shadow-sm flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-slate-950" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-900">Receita</span>
          </div>
          <div className="px-3 py-1.5 flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-slate-400" />
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500">Custos</span>
          </div>
        </div>
      </div>

      <div className="h-[280px] sm:h-[320px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0F172A" stopOpacity={0.08} />
                <stop offset="95%" stopColor="#0F172A" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="gradientCosts" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94A3B8" stopOpacity={0.05} />
                <stop offset="95%" stopColor="#94A3B8" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748B" 
              fontSize={10} 
              fontWeight="bold" 
              tickLine={false} 
              axisLine={false} 
              dy={10} 
            />
            <YAxis 
              stroke="#64748B" 
              fontSize={10} 
              fontWeight="bold" 
              tickLine={false} 
              axisLine={false} 
              dx={-5}
              tickFormatter={(val) => `R$ ${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip 
              contentStyle={{ 
                borderRadius: '16px', 
                border: '1px solid #E2E8F0', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', 
                padding: '12px 14px' 
              }}
              labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#64748B', marginBottom: '4px' }}
              itemStyle={{ fontSize: '12px', fontWeight: '900', padding: '2px 0' }}
              formatter={(value: any) => [`R$ ${Number(value).toLocaleString()}`]}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              name="Faturamento"
              stroke="#000000" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#gradientRevenue)" 
              animationDuration={1500}
            />
            <Area 
              type="monotone" 
              dataKey="costs" 
              name="Custo Operacional"
              stroke="#94A3B8" 
              strokeWidth={2} 
              fillOpacity={1} 
              fill="url(#gradientCosts)" 
              animationDuration={1500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="absolute top-0 right-0 p-10 opacity-3 pointer-events-none">
        <TrendingUp className="size-48 text-slate-900" />
      </div>
    </Card>
  );
}

export default AdaptiveAreaChart;
