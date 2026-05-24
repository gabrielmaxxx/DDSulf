import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Quote } from '@/types/database';
import { Card } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';

interface RhythmPieChartProps {
  quotes: Quote[];
}

export function RhythmPieChart({ quotes }: RhythmPieChartProps) {
  // Aggregate environment types
  const environmentMap = quotes.reduce((acc, q) => {
    acc[q.environmentType] = (acc[q.environmentType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(environmentMap).map(([name, value]) => ({
    name,
    value
  })).slice(0, 5); // top 5 environments

  const colors = ['#0F172A', '#0284C7', '#F59E0B', '#10B981', '#EC4899'];

  return (
    <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl p-6 sm:p-8 space-y-4 font-sans">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Análise de Segmento</h4>
          <h3 className="text-lg font-black text-slate-900">Origem de Ambientes</h3>
        </div>
        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl">
          <ShieldCheck className="size-4 text-slate-600" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="h-[150px] w-[150px] relative">
          {data.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-400 font-extrabold uppercase tracking-widest text-center">
              Vazio
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0', padding: '6px 10px', fontSize: '10px' }}
                  itemStyle={{ fontWeight: 'bold', color: '#0F172A' }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="flex-1 space-y-2 w-full">
          {data.map((item, index) => {
            const total = data.reduce((sum, d) => sum + d.value, 0);
            const percentage = total > 0 ? ((item.value / total) * 100).toFixed(0) : '0';
            return (
              <div key={item.name} className="flex items-center justify-between text-xs font-bold text-slate-600">
                <div className="flex items-center gap-2">
                  <div className="size-2.5 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                  <span className="truncate max-w-[120px]">{item.name}</span>
                </div>
                <span className="font-mono text-[11px] bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{percentage}%</span>
              </div>
            );
          })}
          {data.length === 0 && (
            <div className="text-xs text-slate-400 text-center py-4">Sem informações para mapear.</div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default RhythmPieChart;
