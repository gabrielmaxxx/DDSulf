import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { HistoricalTrendPoint } from '../types';
import { Card } from '@/components/ui/card';
import { PieChart } from 'lucide-react';

interface PremiumLineChartProps {
  data: HistoricalTrendPoint[];
}

export function PremiumLineChart({ data }: PremiumLineChartProps) {
  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-6 sm:p-8 space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Rendimento e Eficiência</h4>
          <h3 className="text-lg font-black text-slate-900">Evolução de Margem Líquida</h3>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <PieChart className="size-4 text-slate-600" />
        </div>
      </div>

      <div className="h-[180px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis 
              dataKey="date" 
              stroke="#94A3B8" 
              fontSize={9} 
              fontWeight="bold" 
              tickLine={false} 
              axisLine={false} 
              dy={6}
            />
            <YAxis 
              stroke="#94A3B8" 
              fontSize={9} 
              fontWeight="bold" 
              tickLine={false} 
              axisLine={false} 
              dx={-5}
              domain={[0, 100]}
              tickFormatter={(val) => `${val}%`}
            />
            <Tooltip
              contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', padding: '8px 12px' }}
              labelStyle={{ fontSize: '10px', color: '#64748B', fontWeight: 'bold' }}
              itemStyle={{ fontSize: '11px', fontWeight: '900', color: '#0F172A' }}
              formatter={(value: any) => [`${Number(value).toFixed(1)}%`]}
            />
            <Line 
              type="monotone" 
              dataKey="marginPercent" 
              name="Margem"
              stroke="#0284C7" 
              strokeWidth={3} 
              dot={{ stroke: '#0284C7', strokeWidth: 2, r: 3, fill: '#FFFFFF' }}
              activeDot={{ r: 5, strokeWidth: 0, fill: '#0F172A' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

export default PremiumLineChart;
