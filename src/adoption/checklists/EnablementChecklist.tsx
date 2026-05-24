/**
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Target, CheckCircle2, Circle, Eye, Sparkles } from 'lucide-react';

interface MilestoneItem {
  id: string;
  title: string;
  weight: number;
  completed: boolean;
  desc: string;
}

export function EnablementChecklist() {
  const [items, setItems] = useState<MilestoneItem[]>([
    {
      id: 'mile_01',
      title: 'Habilitação da Filial POA',
      weight: 30,
      completed: true,
      desc: 'Configuração formal do tenant e link operacional no datacenter gaúcho.'
    },
    {
      id: 'mile_02',
      title: 'Simulação Estequiométrica Completa',
      weight: 25,
      completed: true,
      desc: 'Validação da precisão da calculadora regional para Piretróides.'
    },
    {
      id: 'mile_03',
      title: 'Capacitação Completa das Equipes de Campo',
      weight: 25,
      completed: false,
      desc: 'Treinamento comprovado de 80% do time técnico na execução PWA.'
    },
    {
      id: 'mile_04',
      title: 'Auditoria Simulada de Acoplamento Regulatório',
      weight: 20,
      completed: false,
      desc: 'Verificação dos laudos finais para conformidade tributária e vigilância.'
    }
  ]);

  const toggleItem = (id: string) => {
    setItems(items.map(item => {
      if (item.id === id) {
        return { ...item, completed: !item.completed };
      }
      return item;
    }));
  };

  const scoreAcquired = items.reduce((sum, current) => sum + (current.completed ? current.weight : 0), 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl flex items-center gap-4">
          <div className="size-11 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/25">
            <Target className="size-5.5" />
          </div>
          <div>
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Score de Ativação Org</span>
            <span className="text-xl font-bold text-slate-100">{scoreAcquired} / 100 Pts</span>
          </div>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl md:col-span-2 flex items-center justify-between">
          <div className="space-y-1">
            <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Organização Pronta para Rollout?</span>
            <p className="text-xs text-slate-300">
              {scoreAcquired >= 80 
                ? 'Sim! A filial POA preenche os requisitos estritos para fase Enterprise.' 
                : 'Necessário concluir mais capacitações (mínimo 80 Pts para liberação).'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div 
            key={item.id} 
            onClick={() => toggleItem(item.id)}
            className={`p-5 bg-slate-900 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
              item.completed 
                ? 'border-emerald-500/20 bg-slate-900/80' 
                : 'border-slate-800/80 hover:border-slate-805/90'
            }`}
          >
            <div className="pt-0.5 shrink-0">
              {item.completed ? (
                <CheckCircle2 className="size-5 text-emerald-400" />
              ) : (
                <Circle className="size-5 text-slate-600" />
              )}
            </div>

            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between">
                <h5 className="text-xs font-bold text-slate-100">{item.title}</h5>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">+{item.weight} Pts</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default EnablementChecklist;
