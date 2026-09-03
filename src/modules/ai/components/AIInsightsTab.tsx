import React from 'react';
import { ArrowUpRight, Zap } from 'lucide-react';
import { AutomaticInsight } from '../types';

interface AIInsightsTabProps {
  insights: AutomaticInsight[];
  onNavigate: (path: string) => void;
}

export const AIInsightsTab: React.FC<AIInsightsTabProps> = ({ insights, onNavigate }) => {
  return (
    <div className="space-y-6 text-left animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Zap className="size-4.5 text-[#D4A017]" />
            Insights e Alertas Automáticos do Sistema ({insights.length})
          </h2>
          <p className="text-[11px] text-slate-500 font-sans mt-0.5">
            Cruzamento preditivo e contínuo entre Financeiro, DRE, Estoque de Químicos e CRM de Clientes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-sans">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="bg-white border border-[#E8E6E1] rounded-3xl p-5 shadow-3xs hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border font-sans ${insight.badgeColor}`}
                >
                  {insight.badge}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-800 leading-snug">{insight.title}</h4>
              <p className="text-[11px] text-slate-500 mt-2 leading-relaxed font-sans font-medium">
                {insight.description}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => onNavigate(insight.path)}
                className="px-3 py-1.5 bg-[#FAF9F5] border border-slate-200 hover:border-[#1B3A2D] rounded-xl text-xs font-bold text-slate-700 hover:text-[#1B3A2D] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{insight.actionLabel}</span>
                <ArrowUpRight className="size-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
