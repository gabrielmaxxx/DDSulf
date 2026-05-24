import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Quote } from '@/types/database';
import { Card } from '@/components/ui/card';
import { Activity } from 'lucide-react';

interface ComparativeBarChartProps {
  quotes: Quote[];
}

export function ComparativeBarChart({ quotes }: ComparativeBarChartProps) {
  // Aggregate count by Pest Type
  const distribution = quotes.reduce((acc, q) => {
    acc[q.pestType] = (acc[q.pestType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(distribution).map(([name, count]) => ({
    name,
    count
  })).sort((a,b) => b.count - a.count);

  // Elite colors sequence representation
  const colors = ['#0F172A', '#334155', '#475569', '#64748B', '#94A3B8', '#CBD5E1'];

  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-6 sm:p-8 space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Rastreabilidade Comercial</h4>
          <h3 className="text-lg font-black text-slate-900">Demanda por Tipo de Praga</h3>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <Activity className="size-4 text-slate-600" />
        </div>
      </div>

      <div className="h-[200px] w-full">
        {chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-widest">
            Nenhuma informação registrada
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis 
                dataKey="name" 
                stroke="#94A3B8" 
                fontSize={9} 
                fontWeight="black" 
                tickLine={false} 
                axisLine={false} 
                dy={6}
              />
              <YAxis 
                stroke="#94A3B8" 
                fontSize={10} 
                fontWeight="bold" 
                tickLine={false} 
                axisLine={false} 
                dx={-5}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', padding: '8px 12px' }}
                itemStyle={{ fontSize: '11px', fontWeight: '900', color: '#0F172A' }}
                labelStyle={{ fontSize: '10px', color: '#64748B', fontWeight: 'bold' }}
              />
              <Bar dataKey="count" name="Serviços" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export default ComparativeBarChart;
