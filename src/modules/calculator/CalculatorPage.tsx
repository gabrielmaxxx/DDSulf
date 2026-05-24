import React, { useState } from 'react';
import { RealtimeCalculator, QuoteWorkflowSystem } from '@/calculator';
import { OperationalAnalyticsDashboard } from '@/calculator/analytics';
import { Sparkles, Zap, KanbanSquare, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CalculatorPage() {
  const [activeTab, setActiveTab] = useState<'workflow' | 'quick' | 'analytics'>('workflow');

  return (
    <div className="py-6 space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Premium Toggle Tabs */}
      <div className="flex justify-center">
        <div className="bg-gray-100 border border-gray-200 p-1 rounded-2xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer selection:bg-none",
              activeTab === 'workflow'
                ? "bg-black text-white shadow-sm"
                : "text-gray-500 hover:text-black"
            )}
          >
            <Sparkles className="size-3.5" /> Workflow Assistido (13 Etapas)
          </button>
          
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer selection:bg-none",
              activeTab === 'quick'
                ? "bg-black text-white shadow-sm"
                : "text-gray-500 hover:text-black"
            )}
          >
            <Zap className="size-3.5" /> Calculadora Rápida
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer selection:bg-none",
              activeTab === 'analytics'
                ? "bg-black text-white shadow-sm"
                : "text-gray-500 hover:text-black"
            )}
          >
            <BarChart3 className="size-3.5" /> Analytics & Inteligência
          </button>
        </div>
      </div>

      {/* Main active calculator display */}
      <div className="transition-all duration-300">
        {activeTab === 'workflow' ? (
          <QuoteWorkflowSystem />
        ) : activeTab === 'quick' ? (
          <div className="py-4">
            <RealtimeCalculator />
          </div>
        ) : (
          <div className="py-4">
            <OperationalAnalyticsDashboard />
          </div>
        )}
      </div>
    </div>
  );
}




