/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { ShieldCheck, TrendingUp, AlertCircle, Plus, Sparkles, Check } from 'lucide-react';
import { useDecisionIntelligence } from '../hooks/useDecisionIntelligence';
import { DecisionGoal } from '../types';

export function MultiFactorReasoning() {
  const { scenarios, registerScenario } = useDecisionIntelligence();
  const [showAdd, setShowAdd] = useState(false);

  // Form State
  const [goal, setGoal] = useState<DecisionGoal>(DecisionGoal.COST_REDUCTION);
  const [targetObjective, setTargetObjective] = useState('');
  const [computedRiskPercent, setComputedRiskPercent] = useState(25);
  const [suggestedPath, setSuggestedPath] = useState('');
  const [reasoningRationale, setReasoningRationale] = useState('');

  const [factorName1, setFactorName1] = useState('');
  const [factorWeight1, setFactorWeight1] = useState(0.8);
  const [factorState1, setFactorState1] = useState('');

  const [factorName2, setFactorName2] = useState('');
  const [factorWeight2, setFactorWeight2] = useState(0.5);
  const [factorState2, setFactorState2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetObjective || !suggestedPath || !reasoningRationale) return;

    const factorsRanked = [];
    if (factorName1) {
      factorsRanked.push({
        factorName: factorName1,
        impactWeight: factorWeight1,
        observedState: factorState1 || 'Normal'
      });
    }
    if (factorName2) {
      factorsRanked.push({
        factorName: factorName2,
        impactWeight: factorWeight2,
        observedState: factorState2 || 'Estável'
      });
    }

    if (factorsRanked.length === 0) {
      factorsRanked.push({
        factorName: 'Relação Custo/Benefício Regulatório',
        impactWeight: 0.8,
        observedState: 'Sob análise de impacto sanitário'
      });
    }

    registerScenario({
      goal,
      targetObjective,
      computedRiskPercent,
      factorsRanked,
      suggestedPath,
      reasoningRationale
    });

    // Reset Form
    setTargetObjective('');
    setSuggestedPath('');
    setReasoningRationale('');
    setFactorName1('');
    setFactorName2('');
    setShowAdd(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-400" />
            Raciocínio Multi-Fator & Cenários de Decisão
          </h3>
          <p className="text-xs text-slate-400">Modelagem autônoma de diretrizes com base em restrições regulatórias e limites corporativos.</p>
        </div>
        
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs rounded-xl flex items-center gap-2 transition-colors duration-200"
        >
          {showAdd ? 'Cancelar' : (
            <>
              <Plus className="size-3.5" />
              Propor Cenário
            </>
          )}
        </button>
      </div>

      {showAdd && (
        <form onSubmit={handleSubmit} className="p-6 bg-slate-900 rounded-3xl border border-slate-800 space-y-4 animate-in fade-in slide-in-from-top-3 duration-350">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Meta Corporativa</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as DecisionGoal)}
                className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-100 outline-none focus:border-emerald-500/50"
              >
                <option value={DecisionGoal.COST_REDUCTION}>Redução de Custos</option>
                <option value={DecisionGoal.REVENUE_EXPANSION}>Expansão Orçamentária</option>
                <option value={DecisionGoal.SAFETY_COMPLIANCE}>Segurança e Anvisa</option>
                <option value={DecisionGoal.ORGANIZATIONAL_SCALE}>Escala de Tenants</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Objetivo da Proposta</label>
              <input
                type="text"
                placeholder="Ex Nome: Teto para pesticidas organofosforados na regional Pelotas"
                value={targetObjective}
                onChange={(e) => setTargetObjective(e.target.value)}
                className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-100 outline-none focus:border-emerald-500/50"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Factor 1 */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-wider block">Fator de Impacto 1</span>
              <input
                type="text"
                placeholder="Ex Fator: Risco residual na silagem"
                value={factorName1}
                onChange={(e) => setFactorName1(e.target.value)}
                className="w-full h-9 bg-slate-900 border border-slate-800 rounded-lg px-2.5 text-xs text-slate-100 outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Estado: Crítico / Estável"
                  value={factorState1}
                  onChange={(e) => setFactorState1(e.target.value)}
                  className="w-full h-9 bg-slate-900 border border-slate-800 rounded-lg px-2.5 text-xs text-slate-100 outline-none text-[10px]"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Peso:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={factorWeight1}
                    onChange={(e) => setFactorWeight1(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500 bg-slate-800 h-1 rounded-sm"
                  />
                  <span className="text-[10px] font-mono font-bold text-emerald-400">{factorWeight1.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* Factor 2 */}
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
              <span className="text-[9px] font-bold font-mono text-emerald-400 uppercase tracking-wider block">Fator de Impacto 2</span>
              <input
                type="text"
                placeholder="Ex Fator: Custo de barreira mecânica secundária"
                value={factorName2}
                onChange={(e) => setFactorName2(e.target.value)}
                className="w-full h-9 bg-slate-900 border border-slate-800 rounded-lg px-2.5 text-xs text-slate-100 outline-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Estado: Aceitável / Elevado"
                  value={factorState2}
                  onChange={(e) => setFactorState2(e.target.value)}
                  className="w-full h-9 bg-slate-900 border border-slate-800 rounded-lg px-2.5 text-xs text-slate-100 outline-none text-[10px]"
                />
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono">Peso:</span>
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    value={factorWeight2}
                    onChange={(e) => setFactorWeight2(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-500 bg-slate-800 h-1 rounded-sm"
                  />
                  <span className="text-[10px] font-mono font-bold text-emerald-400">{factorWeight2.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Trajeto de Ação Recomendado</label>
              <input
                type="text"
                placeholder="Ex: Forçar diluição limite a 0.5% nos aspersores agrícolas"
                value={suggestedPath}
                onChange={(e) => setSuggestedPath(e.target.value)}
                className="w-full h-11 bg-slate-950 border border-slate-800 rounded-xl px-3 text-xs text-slate-100 outline-none focus:border-emerald-500/50"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Risco do Plano ({computedRiskPercent}%)</label>
              <div className="flex items-center gap-3 h-11">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={computedRiskPercent}
                  onChange={(e) => setComputedRiskPercent(parseInt(e.target.value))}
                  className="flex-1 accent-rose-500 bg-slate-800 h-1 rounded-sm cursor-pointer"
                />
                <span className={`text-xs font-mono font-bold px-2 py-1 rounded bg-slate-950 border ${
                  computedRiskPercent > 60 
                    ? 'text-rose-400 border-rose-950' 
                    : computedRiskPercent > 30 
                    ? 'text-amber-400 border-amber-950' 
                    : 'text-emerald-400 border-emerald-950'
                }`}>
                  {computedRiskPercent}% Risk
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-mono">Justificativa e Raciocínio de Apoio</label>
            <textarea
              placeholder="Descreva o apoio teórico operacional sob o selo DDSulf Inteligência..."
              value={reasoningRationale}
              onChange={(e) => setReasoningRationale(e.target.value)}
              className="w-full h-20 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 outline-none focus:border-emerald-500/50 resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors duration-200"
            >
              <Check className="size-4" /> Registrar Raciocínio
            </button>
          </div>
        </form>
      )}

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario) => (
          <div key={scenario.id} className="p-6 bg-slate-900 border border-slate-800/80 rounded-3xl space-y-4 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest bg-emerald-950/20 px-2 py-0.5 rounded-md border border-emerald-900/40">
                    {scenario.goal.replace('_', ' ')}
                  </span>
                  <h4 className="text-sm font-bold text-slate-200 mt-2 tracking-tight leading-snug">{scenario.targetObjective}</h4>
                </div>
                
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-mono font-bold ${
                    scenario.computedRiskPercent > 50 
                      ? 'text-rose-400' 
                      : scenario.computedRiskPercent > 20 
                      ? 'text-amber-400' 
                      : 'text-emerald-400'
                  }`}>
                    {scenario.computedRiskPercent}% Risco
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 mt-1 uppercase tracking-wider">Computado</span>
                </div>
              </div>

              {/* Factors */}
              <div className="space-y-2 border-t border-b border-slate-800/60 py-3 mt-3">
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest">Ativos e Pesos Considerados</span>
                {scenario.factorsRanked.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <div className="size-1 rounded-full bg-slate-400" />
                      <span className="text-slate-300 font-medium">{f.factorName}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-500 text-[10px]">{f.observedState}</span>
                      <span className="text-emerald-400 font-semibold uppercase">{f.impactWeight.toFixed(1)}W</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommended Direction */}
              <div className="space-y-1 pt-1.5">
                <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="size-3" /> Diretriz do Motor AI
                </span>
                <p className="text-xs font-bold text-slate-100">{scenario.suggestedPath}</p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-sans mt-3 bg-slate-950/30 p-3 rounded-xl border border-slate-950">
              {scenario.reasoningRationale}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
export default MultiFactorReasoning;
