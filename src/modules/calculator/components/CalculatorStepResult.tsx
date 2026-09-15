import React from 'react';
import { 
  AlertTriangle, 
  RefreshCw, 
  FileText, 
  DollarSign, 
  Percent, 
  Package, 
  Truck, 
  Clock, 
  Wrench,
  ShieldAlert
} from 'lucide-react';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import { UrgencyLevel } from '@/types/database';

interface ProductWithCost {
  productId: string;
  productName: string;
  quantity: number;
  unit: string;
  availableQty: number;
  costPerUnit: number;
  totalCost: number;
  isInsufficient: boolean;
}

interface PricingResultLike {
  markupMultiplicador: number;
  precoFinalSugerido: number;
  estimatedTimeHours: number;
  cdv: {
    produtos: number;
    transporte: number;
    maoDeObra: number;
    equipamentos: number;
    total: number;
  };
}

interface MarkupSettingsLike {
  margemMinimaPercent: number;
  margemAlvoPercent: number;
  despesasVariaveisPercent: number;
}

interface CalculatorStepResultProps {
  // Preço e ações
  suggestedPrice: number;
  finalPrice: number;
  setFinalPrice: (price: number) => void;
  isPriceManuallyEdited: boolean;
  setIsPriceManuallyEdited: (edited: boolean) => void;
  formatCurrency: (val: number) => string;
  clientName: string;
  handleSaveQuote: (status: 'rascunho' | 'enviado') => void;

  // Margem e markup
  customMargin: number;
  setCustomMargin: (margin: number) => void;
  pricingResult: PricingResultLike;
  markupSettings: MarkupSettingsLike;
  resultingMargin: number;

  // Custos detalhados
  totalProductsCost: number;
  totalTransportCost: number;
  totalLaborCost: number;
  totalOverheadCost: number;
  totalCosts: number;
  productsWithStockCosts: ProductWithCost[];

  // Parâmetros operacionais
  technicians: number;
  setTechnicians: (techs: number) => void;
  urgency: UrgencyLevel;
  setUrgency: (urgency: UrgencyLevel) => void;
  recurrence: 'Único' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual';
  setRecurrence: (recurrence: 'Único' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual') => void;
}

export function CalculatorStepResult({
  suggestedPrice,
  finalPrice,
  setFinalPrice,
  isPriceManuallyEdited,
  setIsPriceManuallyEdited,
  formatCurrency,
  clientName,
  handleSaveQuote,
  customMargin,
  setCustomMargin,
  pricingResult,
  markupSettings,
  resultingMargin,
  totalProductsCost,
  totalTransportCost,
  totalLaborCost,
  totalOverheadCost,
  totalCosts,
  productsWithStockCosts,
  technicians,
  setTechnicians,
  urgency,
  setUrgency,
  recurrence,
  setRecurrence
}: CalculatorStepResultProps) {
  const isMarginHealthy = resultingMargin >= markupSettings.margemMinimaPercent;

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. SEÇÃO PRIMÁRIA E IMEDIATA: PREÇO FINAL E AÇÕES PRINCIPAIS (VISÍVEL SEM ROLAR) */}
      <div className="space-y-4">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md inline-block">
            Resultado da Precificação
          </span>
          <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">
            Preço Comercial Final
          </h4>
          <p className="text-xs text-slate-500">
            Valores consolidados prontos para emissão e negociação direta com o cliente.
          </p>
        </div>

        {/* HERO CARD DE PREÇO FINAL + NEGOCIAÇÃO */}
        <div className="bg-[#1B3A2D] text-white p-5 sm:p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-5">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block mb-0.5">
              Preço Comercial Sugerido
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight">
                R$ {formatCurrency(suggestedPrice)}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md font-mono ${
                isMarginHealthy ? 'bg-emerald-800/80 text-emerald-200' : 'bg-red-900/80 text-red-200'
              }`}>
                Margem: {resultingMargin.toFixed(1)}% {isMarginHealthy ? '✓ Saudável' : '⚠️ Crítica'}
              </span>
              <span className="text-[11px] font-mono text-emerald-300/80">
                Markup: {pricingResult.markupMultiplicador.toFixed(2)}&times;
              </span>
            </div>
          </div>

          {/* BOX DE NEGOCIAÇÃO MANUAL DO PREÇO */}
          <div className="bg-white/10 border border-white/15 rounded-xl p-3.5 sm:max-w-[260px] w-full">
            <span className="text-[9px] text-emerald-200 uppercase font-black block tracking-wider">
              Negociar Preço Final (R$)
            </span>
            <div className="flex items-center text-white mt-1.5 gap-1">
              <span className="text-sm font-bold text-emerald-200">R$</span>
              <input
                id="input-price"
                type="number"
                step="0.01"
                value={finalPrice || ''}
                onChange={(e) => {
                  setFinalPrice(parseFloat(e.target.value) || 0);
                  setIsPriceManuallyEdited(true);
                }}
                className="bg-transparent text-white focus:outline-none font-mono font-black text-xl w-full border-b border-white/20 pb-0.5"
                placeholder="0,00"
              />
              {isPriceManuallyEdited && (
                <button
                  type="button"
                  onClick={() => {
                    setIsPriceManuallyEdited(false);
                    setFinalPrice(suggestedPrice);
                  }}
                  className="text-emerald-300 hover:text-white p-1 rounded-md transition-colors cursor-pointer"
                  title="Restaurar preço sugerido"
                >
                  <RefreshCw className="size-3.5" />
                </button>
              )}
            </div>
            {isPriceManuallyEdited && (
              <span className="text-[9px] text-emerald-250 font-bold block mt-1">
                Valor ajustado manualmente
              </span>
            )}
          </div>
        </div>

        {/* ALERTA DE MARGEM CRÍTICA SE APLICÁVEL */}
        {resultingMargin < markupSettings.margemMinimaPercent && (
          <div className="bg-red-50 text-red-900 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs font-black shadow-xs">
            <AlertTriangle className="size-4 shrink-0 text-red-600" />
            <span>
              Atenção: A margem do orçamento ({resultingMargin.toFixed(2)}%) está abaixo da margem de piso permitida ({markupSettings.margemMinimaPercent}%).
            </span>
          </div>
        )}

        {/* BARRA DE AÇÕES PRINCIPAIS RÁPIDAS (EM DESTAQUE NO TOPO DO PASSO) */}
        <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-600">
            <span className="font-bold text-slate-800">Pronto para gerar?</span> Salve como rascunho ou emita o orçamento com status enviado.
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleSaveQuote('rascunho')}
              disabled={!clientName}
              className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Salvar Rascunho
            </button>
            <button
              type="button"
              id="btn-convert-to-pop-order"
              onClick={() => handleSaveQuote('enviado')}
              disabled={!clientName}
              className="flex-1 sm:flex-none px-5 py-2 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <span>Gerar Orçamento</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DETALHAMENTO DA COMPOSIÇÃO DE CUSTOS EM COLLAPSIBLE SECTION */}
      <CollapsibleSection
        title="Composição Detalhada de Custo e Margem"
        description="Abertura técnica dos custos de produtos, transporte, mão de obra e insumos."
        icon={DollarSign}
        defaultOpen={true}
        badge={
          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
            Total: R$ {formatCurrency(totalCosts)}
          </span>
        }
      >
        <div className="space-y-4 pt-1">
          
          {/* SLIDER DE MARGEM DE LUCRO ALVO */}
          <div className="bg-slate-50/80 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                Margem de Lucro Alvo (%)
              </label>
              <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-md self-start sm:self-auto">
                Meta de Lucro: {customMargin}%
              </span>
            </div>
            
            <input
              type="range"
              min="0"
              max="80"
              step="1"
              value={customMargin}
              onChange={(e) => {
                setCustomMargin(Number(e.target.value));
                setIsPriceManuallyEdited(false);
              }}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
            />
            
            <div className="flex justify-between text-[10px] text-slate-400 font-mono leading-none">
              <span>Mínimo: {markupSettings.margemMinimaPercent}%</span>
              <span className="font-bold text-[#1B3A2D]">Giro Alvo: {customMargin}%</span>
              <span>Máximo: 80%</span>
            </div>
          </div>

          {/* GRID DE CARDS DE CUSTOS COMPONENTES */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Package className="size-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Produtos</span>
              </div>
              <p className="font-mono font-black text-slate-800 text-sm">
                R$ {formatCurrency(totalProductsCost)}
              </p>
              <span className="text-[9px] text-slate-400 block">
                {productsWithStockCosts.length} item(ns) POP
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Truck className="size-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Deslocamento</span>
              </div>
              <p className="font-mono font-black text-slate-800 text-sm">
                R$ {formatCurrency(totalTransportCost)}
              </p>
              <span className="text-[9px] text-slate-400 block">
                Km rodado e combustível
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Clock className="size-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Mão de Obra</span>
              </div>
              <p className="font-mono font-black text-slate-800 text-sm">
                R$ {formatCurrency(totalLaborCost)}
              </p>
              <span className="text-[9px] text-slate-400 block">
                {pricingResult.estimatedTimeHours}h estimadas
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Wrench className="size-3.5 text-emerald-600" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Equipamentos</span>
              </div>
              <p className="font-mono font-black text-slate-800 text-sm">
                R$ {formatCurrency(totalOverheadCost)}
              </p>
              <span className="text-[9px] text-slate-400 block">
                Amortização e EPIs
              </span>
            </div>
          </div>

          {/* TABELA DE PRODUTOS QUÍMICOS MAPEADOS */}
          {productsWithStockCosts.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                Produtos Químicos Obrigatórios (POP)
              </span>
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl bg-white overflow-hidden text-xs">
                {productsWithStockCosts.map((p, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800">{p.productName}</p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        Dose: {p.quantity} {p.unit} &bull; Custo Unit.: R$ {formatCurrency(p.costPerUnit)}/{p.unit}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-bold text-slate-800">
                        R$ {formatCurrency(p.totalCost)}
                      </p>
                      <span className={`text-[9px] font-bold ${p.isInsufficient ? 'text-red-600' : 'text-emerald-700'}`}>
                        {p.isInsufficient ? 'Estoque Baixo' : 'Estoque OK'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PARÂMETROS OPERACIONAIS / AJUSTES ADICIONAIS */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
              Ajustes Operacionais e Adicionais de Urgência
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/80 p-3.5 rounded-xl text-xs font-semibold border border-slate-200">
              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Equipe Técnica</label>
                <select
                  value={technicians}
                  onChange={(e) => setTechnicians(Number(e.target.value))}
                  className="bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none w-full text-xs font-semibold"
                >
                  <option value={1}>1 Técnico Especialista</option>
                  <option value={2}>2 Técnicos Operacionais</option>
                  <option value={3}>3 Técnicos (Equipe Ampla)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Urgência</label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                  className="bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none w-full text-xs font-semibold"
                >
                  <option value="Normal">Normal</option>
                  <option value="Prioritário">Prioritário (+15%)</option>
                  <option value="Emergência">Emergência (+35%)</option>
                </select>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Frequência/Recorrência</label>
                <select
                  value={recurrence}
                  onChange={(e) => setRecurrence(e.target.value as any)}
                  className="bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none w-full text-xs font-semibold"
                >
                  <option value="Único">Único</option>
                  <option value="Mensal">Mensal (-10%)</option>
                  <option value="Trimestral">Trimestral (-6%)</option>
                  <option value="Semestral">Semestral (-3%)</option>
                </select>
              </div>
            </div>
          </div>

        </div>
      </CollapsibleSection>

    </div>
  );
}
