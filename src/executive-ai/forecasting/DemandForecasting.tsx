/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useOperationalForecasting } from '../hooks/useOperationalForecasting';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';
import { TrendingUp, Percent, ArrowUpRight, DollarSign, Activity } from 'lucide-react';

export function DemandForecasting() {
  const [baseRev, setBaseRev] = useState(96000);
  const [stabilityRate, setStabilityRate] = useState(92);
  const { forecastData } = useOperationalForecasting(baseRev);

  // Calculate stats based on forecast
  const lastMonthProj = forecastData[forecastData.length - 1];
  const deltaRevenuePercent = Math.round(
    ((lastMonthProj?.projectedRevenue - baseRev) / baseRev) * 100
  );

  return (
    <div className="space-y-6">
      {/* Parameters Header Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Base de Faturamento de Entrada</label>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-bold text-sm">R$</span>
            <input 
              type="number"
              value={baseRev}
              onChange={(e) => setBaseRev(Math.max(1000, parseInt(e.target.value) || 0))}
              className="w-full bg-slate-950 border border-slate-800 h-9 rounded-lg px-2 text-xs text-slate-100 outline-none focus:border-emerald-500/50 font-bold"
            />
          </div>
          <p className="text-[10px] text-slate-500">Representa o faturamento acumulado recorrente (MRR) inicial.</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Fidelidade de Contratos (%)</label>
          <div className="flex items-center gap-4">
            <input 
              type="range"
              min="50"
              max="100"
              value={stabilityRate}
              onChange={(e) => setStabilityRate(parseInt(e.target.value))}
              className="flex-1 accent-emerald-500 bg-slate-800 h-1 rounded-sm cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-emerald-400 px-2 py-0.5 rounded bg-slate-950 border border-slate-800">{stabilityRate}%</span>
          </div>
          <p className="text-[10px] text-slate-500">Mapeador de estabilidade histórica contra cancelamentos de subscrições.</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Cenário Conclusivo</span>
            <TrendingUp className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-xl font-bold font-sans text-slate-100 flex items-baseline gap-1.5">
            <span>+{deltaRevenuePercent}%</span>
            <span className="text-xs text-emerald-400 font-semibold font-mono">Alta Projetada</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2">Expansão de carteira esperada em até 6 meses com base na eficiência atual.</p>
        </div>
      </div>

      {/* Two-Column Chart Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Revenue Projection Case Area Chart */}
        <div className="lg:col-span-2 p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">Previsões Financeiras e Orçamentárias</h4>
              <p className="text-[10px] text-slate-400">Análise estocástica integrando piores e melhores cenários de captação comercial gaúcha.</p>
            </div>
            
            <div className="flex gap-4 font-mono text-[9px] font-bold text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500/30" /> Otimista
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-sky-500" /> Esperado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-rose-500/30" /> Pessimista
              </span>
            </div>
          </div>

          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOptimist" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorWorst" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.08}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.6} />
                <XAxis dataKey="periodLabel" stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090D16', borderColor: '#1E293B', borderRadius: '12px' }}
                  labelStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#94A3B8' }}
                  itemStyle={{ fontSize: '12px', color: '#E2E8F0' }}
                  formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR')}`]}
                />
                <Area type="monotone" dataKey="bestScenarioRevenue" name="Melhor Cenário" stroke="#10B981" strokeWidth={1} fillOpacity={1} fill="url(#colorOptimist)" />
                <Area type="monotone" dataKey="projectedRevenue" name="Projetado Médio" stroke="#0ea5e9" strokeWidth={2} fill="transparent" />
                <Area type="monotone" dataKey="worstScenarioRevenue" name="Pior Cenário" stroke="#EF4444" strokeWidth={1} fillOpacity={1} fill="url(#colorWorst)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Flow Predictors (Demand / Volume) */}
        <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
          <div>
            <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">Projeção de Demanda Física (POPs)</h4>
            <p className="text-[10px] text-slate-400">Volume estimado de procedimentos sanitários ativos no pipeline das equipes de campo.</p>
          </div>

          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.4} />
                <XAxis dataKey="periodLabel" stroke="#64748B" fontSize={9} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748B" fontSize={9} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#090D16', borderColor: '#1E293B', borderRadius: '12px' }}
                  labelStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#94A3B8' }}
                  itemStyle={{ fontSize: '11px', color: '#E2E8F0' }}
                />
                <Line type="monotone" dataKey="projectedPopsCount" name="POPs Estimados" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-2 mt-4 font-mono text-[10px] text-slate-400">
            <div className="flex items-center justify-between">
              <span>Média de Equipes Alocadas:</span>
              <span className="font-bold text-slate-200">22 Grupos</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Saturação Máxima de Capacidade:</span>
              <span className="font-bold text-slate-200">78%</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Custo de Overhead Projetado:</span>
              <span className="font-bold text-rose-400">R$ {lastMonthProj?.overheadEstimate.toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default DemandForecasting;
