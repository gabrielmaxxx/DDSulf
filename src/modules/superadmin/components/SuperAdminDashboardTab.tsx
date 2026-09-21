import React from 'react';
import {
  Building2,
  DollarSign,
  Users,
  CalendarDays,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { DashboardMetrics } from '@/services/superadmin/superAdminService';

export interface SuperAdminDashboardTabProps {
  metrics: DashboardMetrics | null;
}

export function SuperAdminDashboardTab({ metrics }: SuperAdminDashboardTabProps) {
  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Empresas */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Empresas</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Building2 className="size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{metrics?.totalEmpresas || 0}</span>
            <span className="text-xs font-semibold text-emerald-400">
              {metrics?.empresasAtivas || 0} ativas
            </span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Suspensas:</span>
            <span className="font-bold text-rose-400">{metrics?.empresasSuspensas || 0}</span>
          </div>
        </div>

        {/* Status Financeiro */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Saúde Financeira</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{metrics?.empresasEmDia || 0}</span>
            <span className="text-xs font-semibold text-slate-400">em dia</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Mensalidades em atraso:</span>
            <span
              className={`font-bold ${
                (metrics?.empresasAtrasadas || 0) > 0 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {metrics?.empresasAtrasadas || 0}
            </span>
          </div>
        </div>

        {/* Usuários Totais */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Usuários na Plataforma</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Users className="size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{metrics?.totalUsuarios || 0}</span>
            <span className="text-xs font-semibold text-purple-400">contas</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Média por empresa:</span>
            <span className="font-bold text-slate-200">
              {metrics?.totalEmpresas
                ? ((metrics.totalUsuarios || 0) / metrics.totalEmpresas).toFixed(1)
                : 0}
            </span>
          </div>
        </div>

        {/* Serviços Executados */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Volume Operacional</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <CalendarDays className="size-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{metrics?.totalServicos || 0}</span>
            <span className="text-xs font-semibold text-slate-400">serviços</span>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-2 border-t border-slate-800/60">
            <span>Orçamentos no funil:</span>
            <span className="font-bold text-slate-200">{metrics?.totalOrcamentos || 0}</span>
          </div>
        </div>
      </div>

      {/* Platform Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribution by Plan */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="size-4 text-amber-400" />
            Distribuição por Planos
          </h3>
          <div className="space-y-3">
            {Object.entries(metrics?.distribuicaoPlanos || {}).map(([plano, count]) => {
              const total = metrics?.totalEmpresas || 1;
              const percent = Math.round((count / total) * 100);
              return (
                <div key={plano} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="capitalize text-slate-300">{plano}</span>
                    <span className="text-slate-400">
                      {count} empresas ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {Object.keys(metrics?.distribuicaoPlanos || {}).length === 0 && (
              <p className="text-xs text-slate-500 py-4 text-center">Nenhum dado de planos disponível.</p>
            )}
          </div>
        </div>

        {/* Monthly Volume */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <FileSpreadsheet className="size-4 text-emerald-400" />
            Métricas Agregadas por Período
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400">Serviços por Mês</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {Object.entries(metrics?.servicosPorMes || {}).length > 0 ? (
                  Object.entries(metrics?.servicosPorMes || {}).map(([mes, qtd]) => (
                    <div
                      key={mes}
                      className="flex justify-between items-center text-xs py-1 border-b border-slate-800/40"
                    >
                      <span className="font-mono text-slate-300">{mes}</span>
                      <span className="font-bold text-amber-400">{qtd} serviços</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Nenhum serviço registrado ainda.</p>
                )}
              </div>
            </div>

            <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-400">Orçamentos por Mês</span>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {Object.entries(metrics?.orcamentosPorMes || {}).length > 0 ? (
                  Object.entries(metrics?.orcamentosPorMes || {}).map(([mes, qtd]) => (
                    <div
                      key={mes}
                      className="flex justify-between items-center text-xs py-1 border-b border-slate-800/40"
                    >
                      <span className="font-mono text-slate-300">{mes}</span>
                      <span className="font-bold text-emerald-400">{qtd} orçamentos</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-500">Nenhum orçamento registrado ainda.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminDashboardTab;
