import React from 'react';
import { 
  Users, 
  Search, 
  ChevronRight, 
  AlertCircle,
  Eye,
  Edit2
} from 'lucide-react';
import { Client, Contract, ClienteRentabilidade } from '@/store/systemStore';

interface ClientesListViewProps {
  clients: Client[];
  contracts: Contract[];
  clientRentabilities: Record<string, ClienteRentabilidade>;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  selectedClientId: string | null;
  onSelectClient: (clientId: string) => void;
  onEditClient: (client: Client) => void;
  getClientType: (client: Client) => 'B2B' | 'B2C';
  isClientIncomplete: (client: Client) => boolean;
}

export function ClientesListView({
  clients,
  contracts,
  clientRentabilities,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  selectedClientId,
  onSelectClient,
  onEditClient,
  getClientType,
  isClientIncomplete,
}: ClientesListViewProps) {
  return (
    <div className="space-y-4">
      {/* 🔍 BUSCA GLOBAL & FILTROS RÁPIDOS */}
      <div className="bg-white border border-[#E8E6E1] p-3.5 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        {/* Input de Busca */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar cliente, telefone, empresa ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg pl-9 pr-3 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
          />
        </div>

        {/* Dynamic filters list */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-start md:justify-end">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'ativos', label: 'Ativos' },
            { id: 'inativos', label: 'Inativos' },
            { id: 'garantias', label: 'Garantias' },
            { id: 'contratos', label: 'Contratos' },
            { id: 'inadimplentes', label: 'Inadimplentes' }
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === f.id 
                  ? 'bg-[#1B3A2D] text-white shadow-xs' 
                  : 'bg-slate-50 hover:bg-[#FAF9F6] text-slate-500 border border-[#E8E6E1]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela / Lista Completa em Largura Total */}
      <div className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 bg-[#FAF9F6] border-b border-[#E8E6E1] flex items-center justify-between">
          <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">
            Lista Geral de Clientes
          </span>
          <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-[10px] font-bold rounded-md text-slate-700">
            {clients.length} cadastrados
          </span>
        </div>

        {clients.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Users className="size-10 mx-auto opacity-30 text-[#6B6B5F]" />
            <p className="text-sm font-bold uppercase text-[#141410]">Nenhum cliente localizado</p>
            <p className="text-xs max-w-sm mx-auto text-slate-500">
              Tente redefinir os filtros de busca para encontrar registros cadastrados.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#E8E6E1]">
            {clients.map(c => {
              const isSel = selectedClientId === c.id;
              const type = getClientType(c);
              const incomplete = isClientIncomplete(c);
              const activeContr = (contracts || []).some(contr => contr.clientId === c.id && contr.status === 'ativo');
              const rent = clientRentabilities[c.id];

              let marginBadge = null;
              if (rent) {
                const isRetornosFrequentes = rent.taxaRetorno > 15 || rent.qtdRetornos >= 2;
                if (rent.margemPercent < 20 || isRetornosFrequentes) {
                  marginBadge = (
                    <span className="bg-rose-50 text-rose-800 border border-rose-150 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      {isRetornosFrequentes ? `⚠️ Retornos (${rent.taxaRetorno.toFixed(0)}%)` : `📉 Margem (${rent.margemPercent.toFixed(0)}%)`}
                    </span>
                  );
                } else if (rent.margemPercent <= 35) {
                  marginBadge = (
                    <span className="bg-amber-50 text-amber-800 border border-amber-150 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      📊 Margem: {rent.margemPercent.toFixed(0)}%
                    </span>
                  );
                } else {
                  marginBadge = (
                    <span className="bg-emerald-50 text-emerald-850 border border-emerald-150 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                      📈 Margem: {rent.margemPercent.toFixed(0)}%
                    </span>
                  );
                }
              }

              return (
                <div
                  key={c.id}
                  onClick={() => onSelectClient(c.id)}
                  className={`p-4 text-left transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                    isSel 
                      ? 'bg-emerald-50/40 border-l-4 border-[#1B3A2D]' 
                      : 'hover:bg-[#FAF9F6]/80 border-l-4 border-transparent'
                  }`}
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-[#141410] truncate block uppercase font-sans tracking-tight">
                        {c.name}
                      </span>
                      {incomplete && (
                        <span className="inline-block" title="Cadastro com campos não informados">
                          <AlertCircle className="size-4 text-rose-500 fill-rose-100 shrink-0" />
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase ${
                        type === 'B2B' ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-pink-50 text-pink-700 border border-pink-200'
                      }`}>
                        {type === 'B2B' ? '🏢 B2B' : '👤 B2C'}
                      </span>
                      {activeContr && (
                        <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase">
                          Contrato Ativo
                        </span>
                      )}
                      {marginBadge}
                      {c.phone && c.phone !== '⚠️ NÃO INFORMADO' && (
                        <span className="text-slate-600 font-mono text-[11px] hidden sm:inline">
                          {c.phone}
                        </span>
                      )}
                      {c.address && c.address !== '⚠️ NÃO INFORMADO' && (
                        <span className="text-slate-400 truncate max-w-xs text-[11px]">
                          • {c.address}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditClient(c);
                      }}
                      className="p-1.5 px-2.5 text-slate-500 hover:text-[#141410] hover:bg-slate-100 rounded-lg text-xs font-bold transition-all border border-slate-200 cursor-pointer flex items-center gap-1"
                      title="Editar Cliente"
                    >
                      <Edit2 className="size-3.5" />
                      <span className="hidden sm:inline">Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectClient(c.id);
                      }}
                      className="p-1.5 px-3 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Eye className="size-3.5" />
                      <span>Ver Ficha</span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
