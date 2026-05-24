/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { 
  Building, 
  Map, 
  ArrowUpRight, 
  Settings, 
  Target, 
  GraduationCap, 
  Database, 
  GitMerge, 
  TrendingUp, 
  CheckCircle,
  Brain,
  ShieldCheck,
  Zap,
  HelpCircle
} from 'lucide-react';
import { OnboardingWorkflow } from './onboarding/OnboardingWorkflow';
import { RolloutEnablement } from './rollout/RolloutEnablement';
import { TrainingDashboard } from './training/TrainingDashboard';
import { LegacyMigration } from './migration/LegacyMigration';
import { EnablementChecklist } from './checklists/EnablementChecklist';
import { TransformationIntelligence } from './transformation/TransformationIntelligence';

export function AdoptionCockpit() {
  const [activeTab, setActiveTab] = useState<'onboarding' | 'rollout' | 'training' | 'migration' | 'enablement' | 'transformation'>('onboarding');

  const tabs = [
    { id: 'onboarding', label: 'Onboarding Guiado', icon: Building },
    { id: 'rollout', label: 'Fases de Rollout', icon: GitMerge },
    { id: 'training', label: 'Trilhas de Capacitação', icon: GraduationCap },
    { id: 'migration', label: 'Migração de Legado', icon: Database },
    { id: 'enablement', label: 'Habilitação da Org', icon: Target },
    { id: 'transformation', label: 'Maturidade & Saúde', icon: TrendingUp }
  ] as const;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header Profile Dashboard */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-900 bg-slate-950/80">
        <div className="flex gap-4 items-center">
          <div className="size-14 bg-gradient-to-tr from-sky-500 to-indigo-500 rounded-[24px] flex items-center justify-center shadow-lg shrink-0">
             <Target className="size-7 text-white" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-xl font-bold tracking-tight text-white">Central de Implantação e Adoção DDSulf</h1>
            <div className="flex items-center gap-2">
               <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
               <p className="text-[9px] font-mono font-black uppercase tracking-widest text-emerald-400">Guias de Mudança Org Online</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 gap-3">
          <div className="px-5 py-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3 font-mono text-xs">
            <ShieldCheck className="size-4 text-emerald-400" />
            <div>
              <span className="block text-[8px] text-slate-500 uppercase tracking-widest">Estado de Implantação</span>
              <strong className="text-slate-200">92% Alpha Pilot</strong>
            </div>
          </div>
        </div>
      </header>

      {/* Tabs list navigation */}
      <div className="flex scrollbar-none items-center overflow-x-auto bg-slate-950 p-1.5 rounded-2xl gap-1 border border-slate-900">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 h-11 px-4 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'bg-slate-900 text-slate-50 shadow-md border border-slate-850' 
                  : 'text-slate-400 hover:text-slate-100'
              }`}
            >
              <tab.icon className={`size-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Rendering target panels */}
      <div className="w-full bg-slate-950/40 p-6 rounded-3xl border border-slate-900">
        {activeTab === 'onboarding' && <OnboardingWorkflow />}
        {activeTab === 'rollout' && <RolloutEnablement />}
        {activeTab === 'training' && <TrainingDashboard />}
        {activeTab === 'migration' && <LegacyMigration />}
        {activeTab === 'enablement' && <EnablementChecklist />}
        {activeTab === 'transformation' && <TransformationIntelligence />}
      </div>
    </div>
  );
}
export default AdoptionCockpit;
