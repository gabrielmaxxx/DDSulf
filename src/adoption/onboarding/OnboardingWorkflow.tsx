/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { CheckCircle2, Play, Circle, RefreshCcw, Sparkles } from 'lucide-react';
import { useOperationalOnboarding } from '../hooks/useOperationalOnboarding';
import { OnboardingStepStatus } from '../types';

export function OnboardingWorkflow() {
  const { steps, startStep, completeStep, resetOnboarding } = useOperationalOnboarding();
  const [selectedWalkthroughText, setSelectedWalkthroughText] = useState<string | null>(null);

  const totalSteps = steps.length;
  const completedSteps = steps.filter(s => s.status === OnboardingStepStatus.COMPLETED).length;
  const progressRatio = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold text-sky-400 uppercase tracking-widest">Matriz de Onboarding</span>
          <h4 className="text-sm font-bold text-slate-100">Progresso de Onboarding Multi-Tenant ({progressRatio}%)</h4>
          <p className="text-xs text-slate-400">Ativação sequencial coordenada para técnicos seniores e escritórios regionais DDSulf.</p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
          <div className="flex-1 md:w-44 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${progressRatio}%` }}
            />
          </div>
          
          <button
            onClick={resetOnboarding}
            className="p-2 bg-slate-950 text-slate-400 hover:text-slate-100 border border-slate-800 rounded-xl transition-all"
            title="Reiniciar Progresso"
          >
            <RefreshCcw className="size-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {steps.map((step) => {
            const isCompleted = step.status === OnboardingStepStatus.COMPLETED;
            const isInProgress = step.status === OnboardingStepStatus.IN_PROGRESS;
            const isNotStarted = step.status === OnboardingStepStatus.NOT_STARTED;

            return (
              <div 
                key={step.id} 
                className={`p-5 bg-slate-900 border rounded-3xl flex items-start gap-4 transition-all duration-200 ${
                  isInProgress 
                    ? 'border-emerald-500/40 bg-slate-900 shadow-md shadow-emerald-500/5' 
                    : 'border-slate-800/80'
                }`}
              >
                <div className="pt-0.5 shrink-0">
                  {isCompleted ? (
                    <CheckCircle2 className="size-5.5 text-emerald-400" />
                  ) : isInProgress ? (
                    <div className="size-5.5 rounded-full border-2 border-emerald-500/80 border-t-transparent animate-spin" />
                  ) : (
                    <Circle className="size-5.5 text-slate-600" />
                  )}
                </div>

                <div className="space-y-1.5 flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800/60">
                        {step.moduleCovered}
                      </span>
                      <h5 className="text-xs font-bold text-slate-100 mt-2">{step.title}</h5>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">{step.estimatedMinutes} min</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{step.description}</p>
                  
                  <div className="flex gap-2 pt-2">
                    {isNotStarted && (
                      <button
                        onClick={() => startStep(step.id)}
                        className="px-3.5 py-1.5 bg-slate-950 text-slate-200 hover:text-slate-50 border border-slate-800 text-[10px] font-bold rounded-lg uppercase tracking-wide flex items-center gap-1 transition-all"
                      >
                        <Play className="size-3 fill-slate-200" /> Iniciar
                      </button>
                    )}
                    {isInProgress && (
                      <button
                        onClick={() => completeStep(step.id)}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1 transition-all"
                      >
                        Concluir Etapa
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedWalkthroughText(`Guia Contextual: Para calibrar a etapa de "${step.title}", certifique-se de carregar amostras compatíveis. O sincronismo é testado localmente.`)}
                      className="px-3 py-1.5 text-slate-500 hover:text-slate-300 text-[10px] font-bold uppercase tracking-wide"
                    >
                      Ajuda Contextual
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guidance Walkthrough Panel */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sky-400">
              <Sparkles className="size-4" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest">Walkthrough Virtual</span>
            </div>
            <h4 className="text-sm font-bold text-slate-100">Assistente de Adoção AI</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Clique em "Ajuda Contextual" em qualquer etapa para carregar os comandos orientativos em tempo real do assistente operacional de campo.
            </p>
            {selectedWalkthroughText ? (
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-mono">
                {selectedWalkthroughText}
              </div>
            ) : (
              <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-850 border-dashed text-[11px] text-slate-500 italic text-center">
                Selecione uma etapa para ler as referências operacionais
              </div>
            )}
          </div>
          
          <div className="border-t border-slate-800/80 pt-4 mt-6">
            <span className="text-[9px] font-mono text-slate-500 uppercase">Apoio Estequiométrica Offline</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default OnboardingWorkflow;
