/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShieldCheck, Plus, Check, Info } from 'lucide-react';
import { useRolloutManagement } from '../hooks/useRolloutManagement';
import { RolloutPhase } from '../types';

export function RolloutEnablement() {
  const { gates, toggleGate, adoptIncremental } = useRolloutManagement();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="size-5 text-emerald-400" />
            Rollout Progressivo & Liberação Modular
          </h3>
          <p className="text-xs text-slate-400">Ativação gradual de funcionalidades corporativas para controle de pragas sob fases de risco controlado.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {gates.map((gate) => {
          return (
            <div 
              key={gate.id} 
              className={`p-6 bg-slate-900 border rounded-3xl space-y-4 flex flex-col justify-between ${
                gate.isEnabled 
                  ? 'border-emerald-500/20 bg-slate-900/90' 
                  : 'border-slate-800/80'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                    gate.requiredPhase === RolloutPhase.ALPHA_PILOT 
                      ? 'bg-amber-500/10 text-amber-400 border-amber-950/50' 
                      : gate.requiredPhase === RolloutPhase.REGIONAL_BETA 
                      ? 'bg-sky-500/10 text-sky-400 border-sky-950/50' 
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-950/50'
                  }`}>
                    {gate.requiredPhase.replace('_', ' ')}
                  </span>

                  <span className={`text-[8px] font-mono font-bold uppercase ${
                    gate.criticality === 'high' 
                      ? 'text-rose-400' 
                      : gate.criticality === 'medium' 
                      ? 'text-amber-400' 
                      : 'text-emerald-400'
                  }`}>
                    {gate.criticality} risk
                  </span>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-100">{gate.featureName}</h4>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                    <Info className="size-3 shrink-0" />
                    <span>Requer confirmação de conformidade da Regional Sul</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/50 flex justify-between items-center text-[11px] font-mono">
                  <span className="text-slate-400">Usuários Ativos Local:</span>
                  <span className="font-bold text-slate-200">{gate.adoptedUsersCount} Cadastrados</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleGate(gate.id)}
                    className={`px-4 py-2 border rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                      gate.isEnabled 
                        ? 'bg-rose-500/10 text-rose-400 border-rose-950 hover:bg-rose-500/15'
                        : 'bg-emerald-500 text-slate-950 border-emerald-500 hover:bg-emerald-400'
                    }`}
                  >
                    {gate.isEnabled ? 'Desativar Módulo' : 'Ativar Módulo'}
                  </button>
                </div>

                {gate.isEnabled && (
                  <button
                    onClick={() => adoptIncremental(gate.id)}
                    className="px-3.5 py-1.5 bg-slate-950 text-emerald-400 border border-emerald-950 hover:border-emerald-900 rounded-lg text-[9px] uppercase font-mono transition-all"
                  >
                    Simular Adoção
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default RolloutEnablement;
