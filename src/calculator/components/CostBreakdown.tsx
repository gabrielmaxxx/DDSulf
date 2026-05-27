import React from 'react';
import { Truck, Users, Trash, Hammer, ShieldAlert, CheckCircle, AlertTriangle, HelpCircle } from 'lucide-react';
import { PricingBreakdown } from '../types';
import { useSystemStore } from '../../store/systemStore';

interface CostBreakdownProps {
  breakdown: PricingBreakdown;
}

export function CostBreakdown({ breakdown }: CostBreakdownProps) {
  const { financial } = useSystemStore();
  const {
    directLaborCost,
    displacementCost,
    chemicalsCost,
    equipmentsCost,
    suggestedPrice,
    actualMarginPercent,
    profitAmount,
    breakEvenPrice
  } = breakdown;

  const dvPercent = financial?.markupDespesasVariaveisPercent ?? 15;
  const margemMinimaPercent = financial?.markupMargemMinimaPercent ?? 20;

  // CDV calculation
  const cdvTotal = chemicalsCost + directLaborCost + displacementCost + equipmentsCost;

  // Dynamic Markup Math
  const dv = dvPercent / 100;
  const ml = actualMarginPercent / 100;
  const markupDivisor = Math.max(0.01, 1 - (dv + ml));
  const markupMultiplicador = 1 / markupDivisor;

  // Segmented Bar Proportions
  const totalBar = suggestedPrice > 0 ? suggestedPrice : 1;
  const cdvBarPct = Math.max(0, Math.min(100, (cdvTotal / totalBar) * 100));
  const taxesBarPct = Math.max(0, Math.min(100, dvPercent));
  const profitBarPct = Math.max(0, Math.min(100, 100 - (cdvBarPct + taxesBarPct)));

  const isBelowMinMargin = actualMarginPercent < margemMinimaPercent;
  const isAtBreakEven = suggestedPrice <= breakEvenPrice;

  // Health configuration state
  let healthColor = 'text-emerald-600 bg-emerald-50 border-emerald-100';
  let healthRing = 'ring-emerald-500/20';
  let healthTitle = 'Margem Saudável';
  let healthIcon = CheckCircle;
  let textTheme = { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200' };

  if (isBelowMinMargin) {
    healthColor = 'text-red-600 bg-red-50 border-red-100';
    healthRing = 'ring-red-500/20';
    healthTitle = 'Margem Crítica';
    healthIcon = AlertTriangle;
    textTheme = { bg: 'bg-red-500', text: 'text-red-700', border: 'border-red-200' };
  } else if (isAtBreakEven) {
    healthColor = 'text-amber-600 bg-amber-50 border-amber-100';
    healthRing = 'ring-amber-500/20';
    healthTitle = 'Ajustado ao Break-Even';
    healthIcon = HelpCircle;
    textTheme = { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200' };
  }

  const costItems = [
    {
      name: 'Produtos Químicos',
      amount: chemicalsCost,
      icon: Trash,
      desc: 'Insumos e defensivos aplicados',
      color: 'bg-emerald-500'
    },
    {
      name: 'Mão de Obra Direta',
      amount: directLaborCost,
      icon: Users,
      desc: 'Tempo operacional e técnico',
      color: 'bg-indigo-500'
    },
    {
      name: 'Transporte (Deslocamento)',
      amount: displacementCost,
      icon: Truck,
      desc: 'Logística de ida e volta',
      color: 'bg-amber-500'
    },
    {
      name: 'Equipamentos & Ferramentas',
      amount: equipmentsCost,
      icon: Hammer,
      desc: 'EPIs e tecnologia empregada',
      color: 'bg-blue-500'
    }
  ];

  const formatCurrency = (val: number) => {
    return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="bg-white border border-[#E8E6E1]/80 rounded-3xl p-6 space-y-6 shadow-sm text-left">
      
      {/* SEÇÃO 1: COMPOSIÇÃO DO CUSTO DIRETO VARIÁVEL (CDV) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8E6E1]/60 pb-3">
          <span className="text-[10px] font-extrabold text-[#6B6B5F] uppercase tracking-wider block">
            1. COMPOSIÇÃO DO CUSTO DIRETO VARIÁVEL (CDV)
          </span>
          <span className="text-xs font-mono font-bold text-[#1B3A2D] bg-[#D8EDE3] px-2.5 py-1 rounded-md">
            CDV Total: R$ {formatCurrency(cdvTotal)}
          </span>
        </div>

        <div className="space-y-3.5">
          {costItems.map((item, idx) => {
            const ratio = cdvTotal > 0 ? (item.amount / cdvTotal) * 100 : 0;
            return (
              <div key={idx} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs font-bold text-[#141410]">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 bg-[#FAFAF9] border border-[#E8E6E1] rounded-lg group-hover:bg-[#1B3A2D]/10 group-hover:border-[#1B3A2D]/30 transition-colors">
                      <item.icon className="size-3.5 text-[#6B6B5F]" />
                    </div>
                    <div>
                      <span className="font-semibold block">{item.name}</span>
                      <span className="text-[9px] font-normal text-[#9CA3AF] block font-sans">{item.desc}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold block font-mono">R$ {formatCurrency(item.amount)}</span>
                    <span className="text-[9px] font-bold text-[#6B6B5F] block font-mono leading-none">{ratio.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="h-1 w-full bg-[#FAFAF9] border border-[#E8E6E1]/40 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${item.color}`}
                    style={{ width: `${ratio}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO 2: CARD DE MARKUP */}
      <div className="border border-[#E8E6E1] rounded-2xl bg-[#FCFCFB] p-4 space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-[#E8E6E1]/60">
          <div>
            <span className="text-[10px] font-extrabold text-[#6B6B5F] uppercase tracking-wider block">
              2. MARKUP OPERACIONAL DESEJADO
            </span>
            <span className="text-[9px] text-[#9CA3AF] block font-sans">
              Divisor: 1 - ({dvPercent}% DV + {actualMarginPercent.toFixed(1)}% ML)
            </span>
          </div>
          <div className="text-right">
            <span className="bg-[#1B3A2D] text-white text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg">
              Fator: {markupMultiplicador.toFixed(2)}&times;
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-[10px] font-mono text-[#6B6B5F]">
          <div>
            <p className="font-sans font-bold text-[#4B4B43]">Despesas Variáveis (%DV)</p>
            <p className="font-black text-[#141410] text-xs font-mono">{dvPercent.toFixed(2)}%</p>
          </div>
          <div>
            <p className="font-sans font-bold text-[#4B4B43]">Margem Selecionada (%ML)</p>
            <p className="font-black text-[#141410] text-xs font-mono">{actualMarginPercent.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: PREÇO FINAL E INDICADORES DE SAÚDE */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-extrabold text-[#6B6B5F] uppercase tracking-wider">
            3. VIABILIDADE FINANCEIRA DO PREÇO
          </span>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-wider ${healthColor}`}>
            {React.createElement(healthIcon, { className: 'size-3' })}
            <span>{healthTitle}</span>
          </div>
        </div>

        {/* Dynamic visual price display container */}
        <div className={`p-4 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white shadow-xs`}>
          <div className="text-left select-none">
            <span className="text-[10px] font-extrabold text-[#6B6B5F] uppercase tracking-wider block mb-0.5">Preço Ajustado Praticado</span>
            <span className="font-display text-2xl font-black text-[#141410]">R$ {formatCurrency(suggestedPrice)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 md:gap-6 border-t md:border-t-0 md:border-l border-[#E8E6E1]/60 pt-3 md:pt-0 md:pl-6 text-right font-mono font-bold leading-none">
            <div className="text-left md:text-right">
              <span className="text-[#6B6B5F] text-[9px] block uppercase font-sans font-bold mb-1">Preço Mínimo (Break-Even)</span>
              <span className="text-xs text-[#141410]">R$ {formatCurrency(breakEvenPrice)}</span>
            </div>
            <div>
              <span className="text-[#6B6B5F] text-[9px] block uppercase font-sans font-bold mb-1">Margem Real Resultante</span>
              <span className={`text-xs ${isBelowMinMargin ? 'text-red-600' : 'text-emerald-700'}`}>
                {actualMarginPercent.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* SECTOR PROGRESS BAR [===CUSTO===][=IMPOSTOS=][===LUCRO===] */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[9px] font-bold text-[#6B6B5F] uppercase">Composição do Preço de Venda</span>
            <span className="text-[9px] font-mono font-bold text-[#9CA3AF]">Soma: 100%</span>
          </div>

          {/* Visual composite progress segment bar */}
          <div className="h-3.5 w-full bg-[#FAFAF9] border border-[#E8E6E1] rounded-lg overflow-hidden flex shadow-inner">
            <div 
              style={{ width: `${cdvBarPct}%` }} 
              className="h-full bg-indigo-500 hover:brightness-105 transition-all cursor-help relative group"
              title={`Custo Direto Variável (CDV): ${cdvBarPct.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${taxesBarPct}%` }} 
              className="h-full bg-amber-500 hover:brightness-105 transition-all cursor-help relative"
              title={`Despesas Variáveis (DV): ${taxesBarPct.toFixed(1)}%`}
            />
            <div 
              style={{ width: `${profitBarPct}%` }} 
              className={`h-full ${textTheme.bg} hover:brightness-105 transition-all cursor-help relative`}
              title={`Lucro Operacional Líquido (ML): ${profitBarPct.toFixed(1)}%`}
            />
          </div>

          {/* Composition Legenda */}
          <div className="grid grid-cols-3 gap-2.5 pt-1.5 text-[9px] font-bold">
            <div className="flex items-center gap-1.5">
              <div className="size-2 bg-indigo-500 rounded-xs" />
              <div>
                <span className="text-[#6B6B5F] block font-sans">Custos (CDV)</span>
                <span className="text-[#141410] font-mono leading-none">{cdvBarPct.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-2 bg-amber-500 rounded-xs" />
              <div>
                <span className="text-[#6B6B5F] block font-sans">Impostos (DV)</span>
                <span className="text-[#141410] font-mono leading-none">{taxesBarPct.toFixed(1)}%</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`size-2 ${textTheme.bg} rounded-xs`} />
              <div>
                <span className="text-[#6B6B5F] block font-sans font-bold">Lucro Líquido</span>
                <span className="text-[#141410] font-mono leading-none">{profitBarPct.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

