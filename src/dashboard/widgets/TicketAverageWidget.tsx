import React from 'react';
import { Card } from '@/components/ui/card';
import { Target, ArrowUpRight, ArrowDownRight, Award } from 'lucide-react';
import { motion } from 'motion/react';

interface TicketAverageWidgetProps {
  averageTicket: number;
  clv: number;
}

export function TicketAverageWidget({ averageTicket, clv }: TicketAverageWidgetProps) {
  const isHealthy = averageTicket >= 900;
  
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-[32px] space-y-6 shadow-xl relative overflow-hidden font-sans">
      <div className="relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-black tracking-wider opacity-40">Métrica de Conversão</span>
            <h4 className="text-lg font-black leading-tight">Ticket Médio & CLV</h4>
          </div>
          <div className="p-2.5 bg-white/10 rounded-2xl">
            <Target className="size-4 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 divide-x divide-white/10 border-t border-b border-white/10 py-5">
          <div className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Média por Contrato</p>
            <h3 className="text-3xl font-black text-white leading-none">
              R$ {averageTicket.toFixed(0)}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-emerald-400">
              <ArrowUpRight className="size-3" />
              <span>Saudável</span>
            </div>
          </div>

          <div className="pl-4 space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest opacity-40 font-black">LTV Estimado (CLV)</p>
            <h3 className="text-3xl font-black text-sky-450 leading-none">
              R$ {clv.toFixed(0)}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-[10px] font-bold text-sky-400">
              <Award className="size-3" />
              <span>Recorrente</span>
            </div>
          </div>
        </div>

        <p className="text-xs opacity-60 font-medium leading-relaxed">
          Cada novo contrato adicionado gera um impacto imediato de projeção de receita continuada (LTV) de R$ {clv.toFixed(0)} devido à recorrência estimada de controle trimestral.
        </p>
      </div>
      <div className="absolute -bottom-16 -left-16 size-48 bg-sky-500/10 rounded-full blur-[60px]" />
    </Card>
  );
}

export default TicketAverageWidget;
