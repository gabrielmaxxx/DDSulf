import React, { useState } from 'react';
import { useQuoteAnalytics } from '../hooks/useQuoteAnalytics';
import { OperationalSnapshot } from '../types';
import { ArrowLeftRight, Calendar, User, TrendingDown, TrendingUp, Info, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HistoricalComparisonSystem() {
  const { snapshots } = useQuoteAnalytics();
  
  const [selectedSpecA, setSelectedSpecA] = useState<string>('');
  const [selectedSpecB, setSelectedSpecB] = useState<string>('');

  const snapA = snapshots.find(s => s.id === selectedSpecA);
  const snapB = snapshots.find(s => s.id === selectedSpecB);

  // Helper to compute delta
  const getDelta = (valA: number, valB: number) => {
    return valB - valA;
  };

  const getDeltaPercent = (valA: number, valB: number) => {
    if (valA === 0) return 0;
    return ((valB - valA) / valA) * 100;
  };

  const formatDelta = (delta: number, isCurrency = true) => {
    if (delta === 0) return 'Sem alteração';
    const sign = delta > 0 ? '+' : '';
    const formatted = isCurrency 
      ? `R$ ${delta.toFixed(2)}`
      : `${delta.toFixed(1)}%`;
    return `${sign}${formatted}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 bg-white border border-slate-100 rounded-2xl shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ArrowLeftRight className="size-4 text-slate-500" /> Comparador de Versões Operacionais
          </h3>
          <p className="text-xs text-slate-500 font-medium">Compare decisões de precificação, custos e margem entre orçamentos salvos.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Selector A */}
          <select
            value={selectedSpecA}
            onChange={(e) => setSelectedSpecA(e.target.value)}
            className="w-full sm:w-60 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black bg-slate-50"
          >
            <option value="">Selecione Orçamento A (Base)</option>
            {snapshots.map(s => (
              <option key={`a-${s.id}`} value={s.id}>
                {s.inputs.clientName} (v{s.version} - {new Date(s.timestamp).toLocaleDateString()})
              </option>
            ))}
          </select>

          <span className="text-[10px] font-bold text-slate-400 font-mono uppercase">vs</span>

          {/* Selector B */}
          <select
            value={selectedSpecB}
            onChange={(e) => setSelectedSpecB(e.target.value)}
            className="w-full sm:w-60 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-black bg-slate-50"
          >
            <option value="">Selecione Orçamento B (Comparado)</option>
            {snapshots.filter(s => s.id !== selectedSpecA).map(s => (
              <option key={`b-${s.id}`} value={s.id}>
                {s.inputs.clientName} (v{s.version} - {new Date(s.timestamp).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {(!snapA || !snapB) ? (
        <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50/50">
          <Activity className="size-8 text-slate-350 mx-auto mb-2 animate-pulse" />
          <p className="text-xs font-bold text-slate-500">Aguardando Seleção de Cenários</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-1">Selecione duas propostas ou versões na barra superior para realizar auditoria comparativa de custos químicos e margem.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Card A Details */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                Base: Cenário A
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Calendar className="size-3" /> {new Date(snapA.timestamp).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 leading-tight">{snapA.inputs.clientName}</h4>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {snapA.inputs.pestType} em {snapA.inputs.environmentType} ({snapA.inputs.areaSize}m²)
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Preço Sugerido:</span>
                <span className="text-slate-900 font-bold">R$ {snapA.suggestedPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Custo Químico:</span>
                <span className="text-slate-900 font-bold">R$ {snapA.breakdown.chemicalsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Deslocamento:</span>
                <span className="text-slate-900 font-bold">R$ {snapA.breakdown.displacementCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Equipe Desejada:</span>
                <span className="text-slate-950 font-bold">{snapA.techniciansCount} téc ({snapA.estimatedHours}h)</span>
              </div>
              <div className="flex justify-between text-xs font-medium items-center p-2 bg-slate-50 rounded-xl">
                <span className="text-slate-700 font-bold">Margem Praticada:</span>
                <span className="text-emerald-700 font-black text-sm">{snapA.activeMarginPercent.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-150 font-medium">
              <User className="size-3 text-slate-500" /> Operado por: <span className="font-bold text-slate-600">{snapA.changedBy}</span>
            </div>
          </div>

          {/* Card B Details */}
          <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider bg-black text-white px-2.5 py-1 rounded-md">
                Comparado: Cenário B
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Calendar className="size-3" /> {new Date(snapB.timestamp).toLocaleDateString()}
              </span>
            </div>

            <div>
              <h4 className="text-base font-black text-slate-900 leading-tight">{snapB.inputs.clientName}</h4>
              <p className="text-xs text-slate-500 font-bold mt-1">
                {snapB.inputs.pestType} em {snapB.inputs.environmentType} ({snapB.inputs.areaSize}m²)
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2.5">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Preço Sugerido:</span>
                <span className="text-slate-900 font-bold">R$ {snapB.suggestedPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Custo Químico:</span>
                <span className="text-slate-900 font-bold">R$ {snapB.breakdown.chemicalsCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Deslocamento:</span>
                <span className="text-slate-900 font-bold">R$ {snapB.breakdown.displacementCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500">Equipe Desejada:</span>
                <span className="text-slate-950 font-bold">{snapB.techniciansCount} téc ({snapB.estimatedHours}h)</span>
              </div>
              <div className="flex justify-between text-xs font-medium items-center p-2 bg-slate-950 text-white rounded-xl">
                <span className="text-slate-200 font-bold">Margem Praticada:</span>
                <span className="text-emerald-400 font-black text-sm">{snapB.activeMarginPercent.toFixed(1)}%</span>
              </div>
            </div>
            
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-50/50 p-2.5 rounded-lg border border-slate-150 font-medium">
              <User className="size-3 text-slate-500" /> Operado por: <span className="font-bold text-slate-600">{snapB.changedBy}</span>
            </div>
          </div>

          {/* Audit Comparison / Differences Matrix */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col justify-between shadow-lg">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                <Info className="size-3.5 text-slate-400" /> Relatório de Diferenças (A → B)
              </h4>

              <div className="space-y-4">
                {/* Margin Delta */}
                <div>
                  <span className="text-[11px] font-bold text-slate-400">Variação de Margem Bruta</span>
                  <div className="flex items-center gap-2 mt-1">
                    {getDelta(snapA.activeMarginPercent, snapB.activeMarginPercent) >= 0 ? (
                      <TrendingUp className="size-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="size-5 text-red-400" />
                    )}
                    <span className={cn(
                      "text-xl font-black",
                      getDelta(snapA.activeMarginPercent, snapB.activeMarginPercent) >= 0 
                        ? 'text-emerald-400' 
                        : 'text-red-400'
                    )}>
                      {formatDelta(getDelta(snapA.activeMarginPercent, snapB.activeMarginPercent), false)}
                    </span>
                  </div>
                </div>

                {/* Price Delta */}
                <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-3">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400">Diferença de Preço</span>
                    <p className="text-sm font-bold mt-1">
                      {formatDelta(getDelta(snapA.suggestedPrice, snapB.suggestedPrice))}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({getDeltaPercent(snapA.suggestedPrice, snapB.suggestedPrice).toFixed(1)}%)
                    </span>
                  </div>

                  <div>
                    <span className="text-[11px] font-bold text-slate-400">Diferença de Custo</span>
                    <p className="text-sm font-bold mt-1 text-slate-300">
                      {formatDelta(getDelta(snapA.totalOperationalCost, snapB.totalOperationalCost))}
                    </p>
                    <span className="text-[10px] text-slate-500 font-mono">
                      ({getDeltaPercent(snapA.totalOperationalCost, snapB.totalOperationalCost).toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Chemicals & Labor Details */}
                <div className="border-t border-slate-800 pt-3 space-y-2.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Químicos Delta:</span>
                    <span className={cn(
                      getDelta(snapA.breakdown.chemicalsCost, snapB.breakdown.chemicalsCost) >= 0 ? 'text-red-300' : 'text-emerald-300'
                    )}>
                      {formatDelta(getDelta(snapA.breakdown.chemicalsCost, snapB.breakdown.chemicalsCost))}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Técnicos Delta:</span>
                    <span className="text-slate-200">
                      {snapB.techniciansCount - snapA.techniciansCount > 0 ? `+${snapB.techniciansCount - snapA.techniciansCount}` : snapB.techniciansCount - snapA.techniciansCount} téc
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Tempo de Execução:</span>
                    <span className="text-slate-200">
                      {snapB.estimatedHours - snapA.estimatedHours > 0 ? `+${snapB.estimatedHours - snapA.estimatedHours}` : snapB.estimatedHours - snapA.estimatedHours}h
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
              AUDIT INTELLIGENCE ID: COMP_{snapA.id.substring(5,9)}_{snapB.id.substring(5,9)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
