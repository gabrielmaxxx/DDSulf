import React from 'react';
import { useOperationalIntelligence } from '../hooks/useOperationalIntelligence';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { TrendingUp, Sparkles, Box, ShieldAlert, BarChart3 } from 'lucide-react';

export function ForecastPanel() {
  const { forecasts, loading } = useOperationalIntelligence();

  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center border border-slate-100 rounded-3xl bg-white">
        <span className="text-xs text-slate-400 font-bold animate-pulse">Calculando Projeções Financeiras Sazonais...</span>
      </div>
    );
  }

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Visual Forecasting Chart */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="size-4 text-emerald-500" /> Tendência e Previsão Mensal (Próximo Trimestre)
            </h4>
            <p className="text-xs text-slate-500 font-medium">Projeções operacionais aplicando corretores de sazonalidade e médias de LTV.</p>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md flex items-center gap-1 font-mono">
            <Sparkles className="size-3" /> IA-Fitted Model
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecasts} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorProjecao" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.08}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="periodLabel" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={10} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(v) => `R$ ${v/1000}k`}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ fontSize: 11, fontWeight: 'bold' }}
                labelStyle={{ fontSize: 10, color: '#94a3b8', fontWeight: 'bold' }}
                formatter={(v: any) => [formatCurrency(Number(v)), '']}
              />
              <Area 
                name="Projeção Faturamento" 
                type="monotone" 
                dataKey="projecaoReceita" 
                stroke="#10b981" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorProjecao)" 
              />
              <Area 
                name="Custos Operacionais Estimados" 
                type="monotone" 
                dataKey="projecaoCustoOperacional" 
                stroke="#ef4444" 
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fillOpacity={1} 
                fill="url(#colorCusto)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex gap-4 justify-center text-xs font-bold pt-2 border-t border-slate-50">
          <div className="flex items-center gap-1.5 text-emerald-600">
            <span className="size-2 rounded-full bg-emerald-500" /> Projeções de Faturamento
          </div>
          <div className="flex items-center gap-1.5 text-red-500">
            <span className="size-2 rounded-full bg-red-400" /> Custos de Insumo Calculados
          </div>
        </div>
      </div>

      {/* Seasonality Insights & Logistics Warnings */}
      <div className="space-y-6">
        {/* Projections breakdown lists */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <BarChart3 className="size-3.5" /> Métricas e Fator de Demanda
          </h4>

          <div className="space-y-3.5">
            {forecasts.map((f, idx) => (
              <div key={`idx-${f.periodLabel}`} className="flex items-center justify-between p-3 bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100/50 rounded-2xl">
                <div>
                  <span className="text-xs font-black text-slate-800">{f.periodLabel}</span>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold mt-0.5">
                    <span>Fator Sazonal: <span className="text-slate-700 font-bold">{(f.fatorSazonalidade * 100).toFixed(0)}%</span></span>
                    <span>•</span>
                    <span className="text-emerald-600 font-bold">+{f.taxaCrescimentoPrevistaPercent}% crescimento</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-950 block">{formatCurrency(f.projecaoReceita)}</span>
                  <span className="text-[10px] text-slate-400 font-bold font-mono">Margem Ideal: {f.margemMediaEsperada}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chemicals Risk Shield Indicator */}
        <div className="bg-slate-900 text-white rounded-3xl p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="bg-amber-500/10 p-1.5 rounded-xl text-amber-500">
              <ShieldAlert className="size-4" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-300">Risco Sazonal de Insumos</h4>
          </div>

          <p className="text-xs text-slate-400 font-medium leading-relaxed">
            Durante os meses de pico sazonal (fator acima de 1.15), o consumo de químicos à base de <span className="text-slate-100 font-bold">Fipronil</span> e <span className="text-slate-100 font-bold">Deltametrina</span> acelera em até 35%. 
          </p>

          <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <Box className="size-3.5 text-amber-400" />
              <span className="text-slate-300 font-medium">Nível de Risco do Estoque:</span>
            </div>
            <span className="font-mono font-bold text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded-md text-[10px] uppercase">
              Médio Alert
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
