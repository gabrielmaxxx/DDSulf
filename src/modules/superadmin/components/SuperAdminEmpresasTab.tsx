import React from 'react';
import {
  Search,
  Building2,
  Power,
  CreditCard,
  Edit3,
  UserPlus,
} from 'lucide-react';
import { EmpresaWithUserCount } from '@/services/superadmin/superAdminService';

export interface SuperAdminEmpresasTabProps {
  empresas: EmpresaWithUserCount[];
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  statusFilter: 'all' | 'ativas' | 'suspensas';
  onStatusFilterChange: (status: 'all' | 'ativas' | 'suspensas') => void;
  finFilter: 'all' | 'em_dia' | 'atrasado';
  onFinFilterChange: (fin: 'all' | 'em_dia' | 'atrasado') => void;
  onToggleAtiva: (emp: EmpresaWithUserCount) => void;
  onOpenFinModal: (emp: EmpresaWithUserCount) => void;
  onOpenEditModal: (emp: EmpresaWithUserCount) => void;
  onOpenMasterModal: (emp: EmpresaWithUserCount) => void;
}

export function SuperAdminEmpresasTab({
  empresas,
  searchTerm,
  onSearchTermChange,
  statusFilter,
  onStatusFilterChange,
  finFilter,
  onFinFilterChange,
  onToggleAtiva,
  onOpenFinModal,
  onOpenEditModal,
  onOpenMasterModal,
}: SuperAdminEmpresasTabProps) {
  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            id="input-busca-empresas"
            placeholder="Buscar empresa, ID ou CNPJ..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Filter Selectors */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">Status:</span>
            <select
              id="select-filtro-status"
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value as 'all' | 'ativas' | 'suspensas')}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas</option>
              <option value="ativas">Ativas</option>
              <option value="suspensas">Suspensas</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-slate-400">Financeiro:</span>
            <select
              id="select-filtro-financeiro"
              value={finFilter}
              onChange={(e) => onFinFilterChange(e.target.value as 'all' | 'em_dia' | 'atrasado')}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos</option>
              <option value="em_dia">Em Dia</option>
              <option value="atrasado">Atrasado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] font-black uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Empresa (Tenant)</th>
                <th className="py-3.5 px-4">CNPJ</th>
                <th className="py-3.5 px-4">Plano</th>
                <th className="py-3.5 px-4">Usuários</th>
                <th className="py-3.5 px-4">Status Financeiro</th>
                <th className="py-3.5 px-4">Acesso / Ativa</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {empresas.map((emp) => {
                const isAtiva = emp.ativa !== false;
                const isEmDia = emp.financeiro?.status === 'em_dia' || !emp.financeiro?.status;

                return (
                  <tr key={emp.empresaId} className="hover:bg-slate-800/40 transition-colors">
                    {/* Nome e ID */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-amber-400 shrink-0">
                          {emp.nome.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-white block text-sm">{emp.nome}</span>
                          <span className="font-mono text-[10px] text-slate-400">ID: {emp.empresaId}</span>
                        </div>
                      </div>
                    </td>

                    {/* CNPJ */}
                    <td className="py-4 px-4 font-mono text-slate-400">
                      {emp.cnpj || '—'}
                    </td>

                    {/* Plano */}
                    <td className="py-4 px-4">
                      <span className="inline-block px-2 py-0.5 rounded-md font-bold uppercase text-[10px] bg-slate-800 text-amber-300 border border-amber-500/20">
                        {emp.plano || 'standard'}
                      </span>
                    </td>

                    {/* Total Usuários */}
                    <td className="py-4 px-4 font-bold text-slate-200">
                      {emp.totalUsuarios || 0}
                    </td>

                    {/* Status Financeiro */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                            isEmDia
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          <span className={`size-1.5 rounded-full ${isEmDia ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                          {isEmDia ? 'Em Dia' : 'Atrasado'}
                        </span>
                        {emp.financeiro?.dataVencimento && (
                          <span className="block text-[10px] text-slate-500 font-mono">
                            Venc: {emp.financeiro.dataVencimento}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Ativação Switch */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => onToggleAtiva(emp)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                          isAtiva
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                        }`}
                        title={isAtiva ? 'Clique para suspender' : 'Clique para reativar'}
                      >
                        <Power className="size-3" />
                        {isAtiva ? 'Ativa' : 'Suspensa'}
                      </button>
                    </td>

                    {/* Ações */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenFinModal(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Gerenciar Status Financeiro"
                        >
                          <CreditCard className="size-4 text-emerald-400" />
                        </button>
                        <button
                          onClick={() => onOpenEditModal(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Editar Cadastro"
                        >
                          <Edit3 className="size-4 text-blue-400" />
                        </button>
                        <button
                          onClick={() => onOpenMasterModal(emp)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
                          title="Criar Conta Master"
                        >
                          <UserPlus className="size-4 text-amber-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {empresas.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    Nenhuma empresa encontrada com os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default SuperAdminEmpresasTab;
