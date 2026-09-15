import React from 'react';
import { 
  Users, 
  Search, 
  ChevronRight, 
  UserPlus, 
  X, 
  MapPin, 
  Truck, 
  RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GoogleMapsViewer } from '@/components/GoogleMapsViewer';

interface CalculatorStepClientProps {
  clientName: string;
  setClientName: (name: string) => void;
  clientPhone: string;
  setClientPhone: (phone: string) => void;
  clientAddress: string;
  setClientAddress: (address: string) => void;
  selectedClient: any | null;
  setSelectedClient: (client: any | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredClients: any[];
  handleSelectClient: (c: any) => void;
  showClientRegister: boolean;
  setShowClientRegister: (show: boolean) => void;
  handleRegisterClient: () => void;
  distanceKm: number;
  travelDurationText: string;
  isCalculatingDistance: boolean;
  handleCalculateDistance: () => void;
  showMapPreview: boolean;
  setShowMapPreview: (show: boolean) => void;
  clientStats: any | null;
  resolvedCityName: string;
  headquartersAddress?: string;
}

export function CalculatorStepClient({
  clientName,
  setClientName,
  clientPhone,
  setClientPhone,
  clientAddress,
  setClientAddress,
  selectedClient,
  setSelectedClient,
  searchQuery,
  setSearchQuery,
  filteredClients,
  handleSelectClient,
  showClientRegister,
  setShowClientRegister,
  handleRegisterClient,
  distanceKm,
  travelDurationText,
  isCalculatingDistance,
  handleCalculateDistance,
  showMapPreview,
  setShowMapPreview,
  clientStats,
  resolvedCityName,
  headquartersAddress = 'Rua 33, 120 - Vila Santa Cecília, Volta Redonda - RJ'
}: CalculatorStepClientProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Quem receberá o serviço?</h4>
        <p className="text-xs text-slate-500">Pesquise por clientes cadastrados ou insira um novo perfil operacional.</p>
      </div>

      {/* SEARCH ZONE */}
      {!selectedClient && !showClientRegister && (
        <div className="space-y-4">
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Pesquisar cliente</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-slate-400" />
            <input
              id="input-customer"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Digite nome, telefone ou empresa."
              className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 focus:border-emerald-300 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-xs"
            />
          </div>

          {/* Search suggestions lists */}
          {searchQuery.trim() !== '' && (
            <div className="border border-slate-150 bg-white rounded-xl shadow-md overflow-hidden divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
              {filteredClients.length > 0 ? (
                filteredClients.map(c => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectClient(c)}
                    className="w-full p-3.5 text-left hover:bg-slate-50/80 transition-colors flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <p className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{c.name}</p>
                      <p className="text-[11px] text-slate-500 mt-1">{c.address} • {c.phone}</p>
                    </div>
                    <ChevronRight className="size-4 text-slate-400" />
                  </button>
                ))
              ) : (
                <div className="p-5 text-center text-slate-500 space-y-2">
                  <p className="text-xs font-bold text-slate-600">Nenhum cliente cadastrado com esse critério.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setClientName(searchQuery);
                      setShowClientRegister(true);
                    }}
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs font-bold cursor-pointer"
                  >
                    <UserPlus className="size-3.5" />
                    <span>Cadastrar "{searchQuery}"</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Manual fallback trigger buttons */}
          <div className="pt-2 flex justify-start">
            <button
              type="button"
              onClick={() => setShowClientRegister(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 border border-slate-250 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs"
            >
              <UserPlus className="size-4 text-slate-400" />
              <span>Cadastrar Cliente</span>
            </button>
          </div>
        </div>
      )}

      {/* DISPLAY SELECTED CUSTOMER CARD */}
      {selectedClient && !showClientRegister && (
        <div className="bg-emerald-50/20 border border-emerald-150 p-5 rounded-2xl relative space-y-4">
          <button
            type="button"
            onClick={() => {
              setSelectedClient(null);
              setClientName('');
              setClientAddress('');
              setClientPhone('');
            }}
            className="absolute top-4 right-4 p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-xs"
            title="Limpar seleção"
          >
            <X className="size-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Users className="size-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Cliente Selecionado</span>
              <h5 className="text-base font-black text-[#1B3A2D] tracking-tight">{clientName}</h5>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-emerald-100/50 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Telefone</span>
              <p className="font-extrabold text-slate-700 mt-0.5">{clientPhone || 'Não Informado'}</p>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Cidade</span>
              <p className="font-extrabold text-slate-700 mt-0.5">{resolvedCityName}</p>
            </div>
            <div className="col-span-2">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Endereço Técnico</span>
              <p className="font-extrabold text-slate-700 mt-0.5 truncate" title={clientAddress}>{clientAddress}</p>
            </div>
          </div>

          {/* HISTÓRICO CONTEXTUAL DO CLIENTE */}
          {clientStats && (
            <div className="bg-white/90 border border-emerald-100/60 rounded-xl p-4.5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs shadow-2xs">
              <div>
                <span className="text-[9px] text-[#1B3A2D] uppercase font-black tracking-wider block">Faturamento Total</span>
                <p className="font-black text-slate-800 mt-1 font-mono text-xs">
                  R$ {clientStats.totalBilled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-[9px] text-[#1B3A2D] uppercase font-black tracking-wider block">Ticket Médio</span>
                <p className="font-black text-slate-800 mt-1 font-mono text-xs">
                  R$ {clientStats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
              <div>
                <span className="text-[9px] text-[#1B3A2D] uppercase font-black tracking-wider block">Garantia Ativa</span>
                <p className="text-slate-700 font-extrabold mt-1.5 flex items-center gap-1.5 leading-none">
                  <span className={`inline-block size-2 rounded-full ${clientStats.activeWarranty.includes('Ativa') ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span>{clientStats.activeWarranty}</span>
                </p>
              </div>
              <div>
                <span className="text-[9px] text-[#1B3A2D] uppercase font-black tracking-wider block">Último Serviço Executado</span>
                <p className="font-bold text-slate-700 mt-1 truncate" title={clientStats.lastService}>
                  {clientStats.lastService}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MANUAL CLIENT REGISTER FORM */}
      {showClientRegister && (
        <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h5 className="text-sm font-black text-slate-800">Cadastrar Novo Cliente</h5>
              <p className="text-[11px] text-slate-500">Insira os dados necessários e confirme para gerar a precificação.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowClientRegister(false)}
              className="text-slate-400 hover:text-slate-600 text-xs font-bold leading-none cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Nome do Cliente</label>
              <input
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Condomínio Solar ou Particular"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Telefone de Contato</label>
              <input
                type="text"
                value={clientPhone}
                onChange={(e) => setClientPhone(e.target.value)}
                placeholder="(24) 99876-5432"
                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Endereço de Atendimento</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input
                    type="text"
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    placeholder="Av. Ipiranga, 6681 - Cidade Sede - RJ"
                    className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleCalculateDistance}
                  disabled={!clientAddress.trim() || isCalculatingDistance}
                  className="px-3 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                >
                  {isCalculatingDistance ? <RefreshCw className="size-3 animate-spin" /> : 'Calcular Rota'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowClientRegister(false)}
              className="px-4 py-2 bg-white text-slate-500 hover:text-slate-700 text-xs font-bold rounded-lg cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleRegisterClient}
              className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Salvar e Confirmar
            </button>
          </div>
        </div>
      )}

      {/* DISTÂNCIA ESTIMADA & ROTEIRIZAÇÃO GOOGLE MAPS */}
      {clientAddress.trim() !== '' && (
        <div className="bg-emerald-50/15 border border-slate-200 p-4 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-emerald-700 shrink-0">
              <Truck className="size-5" />
            </div>
            <div className="space-y-1 flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">Logística & Roteirização Google Maps</span>
                <div className="flex items-center gap-1.5">
                  <Button
                    type="button"
                    onClick={handleCalculateDistance}
                    disabled={isCalculatingDistance}
                    className="h-7 px-2.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                  >
                    <RefreshCw className={`size-3 ${isCalculatingDistance ? 'animate-spin' : ''}`} />
                    {isCalculatingDistance ? 'Calculando...' : 'Calcular Rota Real'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setShowMapPreview(!showMapPreview)}
                    className="h-7 px-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <MapPin className="size-3 text-emerald-600" />
                    {showMapPreview ? 'Ocultar Mapa' : 'Ver Mapa'}
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <p className="text-xs font-bold text-slate-700">
                  Distância (Um Sentido): <span className="font-extrabold text-slate-900 font-mono text-sm">{distanceKm} km</span>
                </p>
                <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100/60 border border-emerald-200/80 rounded px-2 py-0.5 font-mono">
                  Ida & Volta: {(distanceKm * 2).toFixed(1)} Km
                </span>
                {travelDurationText && (
                  <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded px-2 py-0.5 font-mono">
                    Tempo Estimado: {travelDurationText}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 truncate">
                <span className="font-bold text-slate-900">Sede:</span>
                <span className="truncate max-w-[180px]" title={headquartersAddress}>
                  {headquartersAddress}
                </span>
                <span>&rarr;</span>
                <span className="font-bold text-slate-800 truncate max-w-[200px]" title={clientAddress}>{clientAddress}</span>
              </div>
            </div>
          </div>

          {/* Interactive Google Maps Route View */}
          {showMapPreview && (
            <div className="pt-2 border-t border-slate-200/60">
              <GoogleMapsViewer
                address={clientAddress}
                title={clientName || clientAddress}
                showRouteFromHq={true}
                hqAddress={headquartersAddress}
                height="220px"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
