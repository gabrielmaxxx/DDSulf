/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { useOrganizationalReadiness } from '../hooks/useOrganizationalReadiness';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from 'recharts';
import { ShieldAlert, Cpu, Heart, AlertTriangle } from 'lucide-react';

export function TransformationIntelligence() {
  const { readiness, changeResistance } = useOrganizationalReadiness();

  // Generated projection based on currently modified resistance values
  const simulatedAduseData = [
    { month: 'Set', index: 30 + (100 - readiness.resistanceFactorPercent) * 0.4 },
    { month: 'Out', index: 45 + (100 - readiness.resistanceFactorPercent) * 0.45 },
    { month: 'Nov', index: 60 + (100 - readiness.resistanceFactorPercent) * 0.5 },
    { month: 'Dez', index: 78 + (100 - readiness.resistanceFactorPercent) * 0.55 },
    { month: 'Jan', index: 88 + (100 - readiness.resistanceFactorPercent) * 0.6 }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Resistance Control */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Resistência Técnica Operacional</label>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold tracking-tight text-white">{readiness.resistanceFactorPercent}%</span>
            <span className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
              readiness.resistanceFactorPercent > 50 
                ? 'bg-rose-500/10 text-rose-400 border border-rose-950' 
                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-950'
            }`}>
              {readiness.resistanceFactorPercent > 50 ? 'Risco Elevado' : 'Estabilidade'}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => changeResistance(-5)}
              className="flex-1 h-9 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 transition-colors uppercase"
            >
              Mitigar Fator -5%
            </button>
            <button
              onClick={() => changeResistance(5)}
              className="flex-1 h-9 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 transition-colors uppercase"
            >
              Elevar Fator +5%
            </button>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">Representa fricção do time de campo contra novos padrões de preenchimento de laudos.</p>
        </div>

        {/* Health score result */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Capacidade e Saúde Geral</label>
          <div className="flex items-center gap-2 text-indigo-400">
            <Heart className="size-5 fill-indigo-400/20" />
            <span className="text-2xl font-bold tracking-tight text-slate-100">{readiness.overallHealthScore}% Score</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-normal">
            Calculado combinando fardo de resistência técnica, taxa de staff treinado e certificação de sincronismo offline PWA.
          </p>
        </div>

        {/* Dynamic warning banner */}
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between">
          <div className="flex items-center gap-2 text-amber-400 font-mono text-[9px] font-bold uppercase tracking-widest">
            <ShieldAlert className="size-4" /> Diagnóstico Predictivo AI
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-2">
            {readiness.overallHealthScore > 75 
              ? 'Conectividade e adoção saudáveis. Os gargalos de sincronia offline diminuíram substancialmente.' 
              : 'Alerta: Baixa capacitação operacional identificada. Priorize treinamentos de calculadora estequiométrica.'}
          </p>
        </div>
      </div>

      {/* Maturity projection chart */}
      <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4">
        <div>
          <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-widest">Curva Projetada de Maturidade (Maturity Curve)</h4>
          <p className="text-[10px] text-slate-400">Previsão e escala da adoção completa do DDSulf ao longo dos próximos trimestres de operação.</p>
        </div>

        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={simulatedAduseData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" opacity={0.4} />
              <XAxis dataKey="month" stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" />
              <YAxis stroke="#64748B" fontSize={10} fontFamily="JetBrains Mono" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#090D16', borderColor: '#1E293B', borderRadius: '12px' }}
                labelStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', color: '#94A3B8' }}
                itemStyle={{ fontSize: '11px', color: '#E2E8F0' }}
                formatter={(value: any) => [`${Number(value).toFixed(0)}% de Escopo`]}
              />
              <Line type="monotone" dataKey="index" name="Índice de Adoção" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
export default TransformationIntelligence;
