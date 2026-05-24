/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Sparkles, 
  BrainCircuit, 
  ShieldCheck, 
  LineChart, 
  Activity, 
  Hand,
  TrendingDown,
  Percent,
  TrendingUp,
  AlertTriangle,
  Building,
  Target
} from 'lucide-react';
import { useStrategicInsights } from '../hooks/useStrategicInsights';
import { StrategicCopilot } from '../copilots/StrategicCopilot';
import { MultiFactorReasoning } from '../reasoning/MultiFactorReasoning';
import { DemandForecasting } from '../forecasting/DemandForecasting';
import { DecisionEvaluator } from '../recommendations/DecisionEvaluator';
import { AIGovernanceStandard } from '../governance/AIGovernanceStandard';

export function ExecutiveCockpit() {
  const [activeSubTab, setActiveSubTab] = useState<'copilot' | 'forecast' | 'evaluation' | 'reasoning' | 'governance'>('copilot');
  const { mrr, safetyIndex, contingentAssets, efficiency, alerts } = useStrategicInsights();

  const subTabs = [
    { id: 'copilot', label: 'Copiloto de Decisão (Chat)', icon: BrainCircuit },
    { id: 'forecast', label: 'Projeção Preditiva (Forecast)', icon: LineChart },
    { id: 'evaluation', label: 'Filtro de Diretrizes (Aprovações)', icon: Hand },
    { id: 'reasoning', label: 'Raciocínio Multi-Fator', icon: Target },
    { id: 'governance', label: 'Governança & Explicabilidade', icon: ShieldCheck }
  ] as const;

  return (
    <div className="space-y-6">
      {/* 1. Header Information Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">MRR Total Ativo</span>
            <span className="text-xl font-bold tracking-tight text-emerald-400 font-sans">
              R$ {mrr.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="size-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-990">
            <TrendingUp className="size-4.5" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Segurança Regulatória</span>
            <span className="text-xl font-bold tracking-tight text-sky-400 font-sans">
              {safetyIndex.toFixed(1)}%
            </span>
          </div>
          <div className="size-9 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-990">
            <ShieldCheck className="size-4.5" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Ativos de Reserva</span>
            <span className="text-xl font-bold tracking-tight text-indigo-400 font-sans">
              R$ {contingentAssets.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="size-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-990">
            <Building className="size-4.5" />
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800/80 rounded-3xl flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Eficiência Geral</span>
            <span className="text-xl font-bold tracking-tight text-teal-400 font-sans">
              {(efficiency * 100).toFixed(0)}%
            </span>
          </div>
          <div className="size-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 border border-teal-990">
            <Percent className="size-4.5" />
          </div>
        </div>
      </div>

      {/* 2. Critical Strategic Warnings Block */}
      {alerts.length > 0 && (
        <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-3 items-start md:items-center">
          <div className="flex items-center gap-2 text-rose-400 font-mono text-[10px] font-bold uppercase tracking-wider shrink-0 bg-rose-500/10 px-3 py-1.5 rounded-lg border border-rose-950">
            <AlertTriangle className="size-4" /> Alertas de Board
          </div>
          <div className="flex-1 text-[11px] text-slate-300 font-sans leading-relaxed space-y-1">
            {alerts.slice(0, 2).map((alert, idx) => (
              <p key={idx} className="flex items-center gap-2">
                <span className="size-1 rounded-full bg-rose-500 select-none" /> {alert}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* 3. Sub-Navigation Tabs */}
      <div className="flex scrollbar-none items-center overflow-x-auto bg-slate-950 p-1.5 rounded-2xl gap-1 border border-slate-900">
        {subTabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`flex items-center gap-2.5 h-10 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-slate-50 shadow-md border border-slate-800' 
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <tab.icon className={`size-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Sub-Tab Content Rendering */}
      <div className="w-full">
        {activeSubTab === 'copilot' && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <StrategicCopilot tenantId="tenant_001_poa" />
          </div>
        )}

        {activeSubTab === 'forecast' && (
          <div className="animate-in fade-in zoom-in-95 duration-200 bg-slate-950 p-6 rounded-3xl border border-slate-900 shadow-xl">
            <DemandForecasting />
          </div>
        )}

        {activeSubTab === 'evaluation' && (
          <div className="animate-in fade-in zoom-in-95 duration-200">
            <DecisionEvaluator />
          </div>
        )}

        {activeSubTab === 'reasoning' && (
          <div className="animate-in fade-in zoom-in-95 duration-200 bg-slate-950 p-6 rounded-3xl border border-slate-900 shadow-xl">
            <MultiFactorReasoning />
          </div>
        )}

        {activeSubTab === 'governance' && (
          <div className="animate-in fade-in zoom-in-95 duration-200 bg-slate-950 p-6 rounded-3xl border border-slate-900 shadow-xl">
            <AIGovernanceStandard />
          </div>
        )}
      </div>
    </div>
  );
}
export default ExecutiveCockpit;
