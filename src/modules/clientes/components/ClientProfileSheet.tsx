import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from '@/components/ui/tabs';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Plus, 
  Edit2, 
  Calendar, 
  FileText, 
  AlertTriangle, 
  Clock, 
  Activity, 
  FileSpreadsheet, 
  FileCode, 
  FileImage, 
  Trash2, 
  TrendingUp, 
  Sparkles, 
  Check,
  DollarSign
} from 'lucide-react';
import { GoogleMapsViewer } from '@/components/GoogleMapsViewer';
import { 
  Client, 
  Contract, 
  AgendaEvent, 
  Quote, 
  ClienteRentabilidade 
} from '@/store/systemStore';

export interface ClientDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

interface ClientProfileSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  clientStats: {
    faturamentoTotal: number;
    servicosRealizados: number;
    retornos: number;
    garantias: number;
    ticketMedio: number;
  };
  clientHealth: {
    label: string;
    color: string;
    bg: string;
    text: string;
    border: string;
    desc: string;
  };
  activeRentabilidade: ClienteRentabilidade | null;
  aiOpportunity: {
    badge: string;
    title: string;
    description: string;
    estimatedValue: number;
    pct: number;
  } | null;
  clientTimeline: {
    id: string;
    date: string;
    title: string;
    desc: string;
    iconType: string;
  }[];
  clientWarranties: {
    id: string;
    title: string;
    execDate: string;
    expDate: string;
    daysLeft: number;
    status: string;
  }[];
  clientDocs: ClientDoc[];
  agenda: AgendaEvent[];
  quotes: { list: Quote[] };
  contracts: Contract[];
  movements: any[];
  contratosParaReajuste: any[];
  activeProfileTab: string;
  setActiveProfileTab: (tab: any) => void;
  onEditClient: (client: Client) => void;
  onCreateContract: () => void;
  onEditContract: (contract: Contract) => void;
  onNewReturn: () => void;
  onViewServiceOrder: (service: AgendaEvent) => void;
  onScheduleQuote: (quote: Quote) => void;
  onUploadDoc: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDeleteDoc: (docId: string, docName: string) => void;
}

export function ClientProfileSheet({
  open,
  onOpenChange,
  client,
  clientStats,
  clientHealth,
  activeRentabilidade,
  aiOpportunity,
  clientTimeline,
  clientWarranties,
  clientDocs,
  agenda,
  quotes,
  contracts,
  movements,
  contratosParaReajuste,
  activeProfileTab,
  setActiveProfileTab,
  onEditClient,
  onCreateContract,
  onEditContract,
  onNewReturn,
  onViewServiceOrder,
  onScheduleQuote,
  onUploadDoc,
  onDeleteDoc,
}: ClientProfileSheetProps) {
  const navigate = useNavigate();

  if (!client) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl p-6 overflow-y-auto text-left"
        id="sheet-client-profile"
      >
        <SheetHeader className="border-b border-slate-200/60 pb-5 text-left">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-1.5 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <SheetTitle className="text-xl font-display font-black text-[#141410] uppercase tracking-tight leading-snug">
                  {client.name}
                </SheetTitle>
                <span className={`inline-block text-[9px] font-black px-2 py-1 rounded-md border ${clientHealth.bg} ${clientHealth.text} ${clientHealth.border}`}>
                  {clientHealth.label}
                </span>
              </div>
              <SheetDescription className="text-xs font-bold font-sans text-slate-500 flex items-center gap-1">
                {clientHealth.desc}
              </SheetDescription>

              {/* Grid Informações Principais */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1.5 text-xs text-slate-600">
                <p className="flex items-center gap-2">
                  <Phone className="size-3.5 text-slate-400 shrink-0" />
                  <span className="font-medium">{client.phone}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <Mail className="size-3.5 text-slate-400 shrink-0" />
                  <span className="truncate underline">{client.email}</span>
                </p>
                <p className="flex items-center gap-2 truncate">
                  <MapPin className="size-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{client.address}</span>
                </p>
              </div>

              {/* Atalhos Rápidos Operacionais */}
              <div className="pt-3 mt-2 border-t border-slate-150 flex flex-wrap items-center gap-2 text-[10px]">
                <span className="text-slate-400 font-extrabold uppercase tracking-wider mr-1">Atalhos:</span>
                
                <button
                  type="button"
                  onClick={() => navigate(`/calculator?clientId=${client.id}`)}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/50 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-none"
                >
                  <Plus className="size-3" /> Orçamento
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/agenda?clientId=${client.id}`)}
                  className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/50 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-none"
                >
                  <Calendar className="size-3" /> Agenda
                </button>

                <button
                  type="button"
                  onClick={() => navigate(`/financial?search=${client.name}`)}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 border border-indigo-200/50 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-none"
                >
                  <DollarSign className="size-3" /> Financeiro
                </button>
              </div>
            </div>

            {/* Botões de Ação do Topo do Perfil */}
            <div className="flex flex-wrap gap-1.5 shrink-0 w-full md:w-auto md:justify-end">
              <Button
                type="button"
                onClick={() => navigate(`/calculator?clientId=${client.id}`)}
                className="flex-1 md:flex-none justify-center flex items-center gap-1 px-3 py-1.5 bg-[#1B3A2D] text-white hover:bg-[#2D6A4F] text-[9px] font-black uppercase tracking-wider rounded-lg cursor-pointer transition-colors h-auto"
              >
                <Plus className="size-3" /> Novo Orçamento
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onNewReturn}
                className="flex-1 md:flex-none justify-center flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-[#E8E6E1] text-[#141410] hover:bg-[#FAF9F6] text-[9px] font-black uppercase tracking-wider rounded-lg cursor-pointer h-auto"
              >
                <Plus className="size-3" /> Registrar Retorno
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onEditClient(client)}
                className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg h-auto"
                title="Editar Informações Cadastrais"
              >
                <Edit2 className="size-3" />
              </Button>
            </div>
          </div>
        </SheetHeader>

        {/* 2️⃣ RESUMO FINANCEIRO E OPERACIONAL (5 CARDS) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 my-4">
          <div className="bg-slate-50/50 border border-[#E8E6E1]/50 p-2.5 rounded-xl">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Faturamento Total</p>
            <p className="text-[13px] font-mono font-black text-[#1B3A2D] pt-0.5">
              R$ {clientStats.faturamentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </p>
          </div>

          <div className="bg-slate-50/50 border border-[#E8E6E1]/50 p-2.5 rounded-xl">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Serviços Feitos</p>
            <p className="text-[13px] font-display font-black text-[#141410] pt-0.5">
              {clientStats.servicosRealizados} executados
            </p>
          </div>

          <div className="bg-slate-50/50 border border-[#E8E6E1]/50 p-2.5 rounded-xl">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Retornos Técnicos</p>
            <p className="text-[13px] font-display font-black text-rose-800 pt-0.5">
              {clientStats.retornos} solicitados
            </p>
          </div>

          <div className="bg-slate-50/50 border border-[#E8E6E1]/50 p-2.5 rounded-xl">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Garantias Ativas</p>
            <p className="text-[13px] font-display font-black text-sky-800 pt-0.5">
              {clientStats.garantias} apólice
            </p>
          </div>

          <div className="bg-slate-50/50 border border-[#E8E6E1]/50 p-2.5 rounded-xl col-span-2 sm:col-span-1">
            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Ticket Médio</p>
            <p className="text-[13px] font-mono font-black text-slate-800 pt-0.5">
              R$ {clientStats.ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
            </p>
          </div>
        </div>

        {/* 3️⃣ CONTEÚDO PRINCIPAL: TABS + CARDS LATERAIS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Sub-Abas de Histórico Completo */}
          <div className="lg:col-span-7 space-y-4 text-left w-full">
            <Tabs value={activeProfileTab} onValueChange={setActiveProfileTab} className="w-full">
              {/* TabsList com scroll horizontal seguindo padrão de InventoryTabs */}
              <div className="flex overflow-x-auto p-1.5 bg-[#F0EDE8]/60 border border-slate-200/60 rounded-2xl w-fit max-w-full shadow-inner scrollbar-none">
                <TabsList className="h-auto p-0 gap-1 bg-transparent">
                  {[
                    { id: 'servicos', label: 'Serviços' },
                    { id: 'orcamentos', label: 'Orçamentos' },
                    { id: 'contratos', label: 'Contratos' },
                    { id: 'financeiro', label: 'Financeiro' },
                    { id: 'documentos', label: 'Documentos' },
                    { id: 'garantias', label: 'Garantias' },
                    { id: 'retornos', label: 'Retornos' },
                    { id: 'timeline', label: 'Timeline' }
                  ].map(tab => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-xl whitespace-nowrap data-active:bg-white data-active:text-[#1B3A2D] data-active:shadow-xs text-slate-600 transition-all cursor-pointer"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {/* ABA SERVIÇOS */}
              <TabsContent value="servicos" className="pt-2">
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Histórico de OSs do Calendário</p>
                  </div>

                  {((agenda || []).filter(e => e.clientId === client.id).length === 0) ? (
                    <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                      <Calendar className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                      <p className="font-bold text-[#141410]">Nenhuma ordem de serviço registrada</p>
                      <p className="text-[9px]">Gere novos serviços ou retornos para agendar no calendário operacional.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(agenda || []).filter(e => e.clientId === client.id).map(s => (
                        <div key={s.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-[#E8E6E1]/60 rounded-xl flex items-center justify-between gap-3 text-left">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-[#141410] font-sans block">{s.title}</span>
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                                s.type === 'retorno' ? 'bg-orange-50 text-orange-700' : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                {s.type.toUpperCase()}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                              <Calendar className="size-3" /> Execução / Agendado: {s.date} {s.time ? `às ${s.time}` : ''}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full ${
                              s.status === 'realizado' 
                                ? 'bg-emerald-50 text-[#1B3A2D] border border-emerald-100' 
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {s.status === 'realizado' ? '• Realizado' : '• Programado'}
                            </span>
                            <button
                              type="button"
                              onClick={() => onViewServiceOrder(s)}
                              className="p-1 px-2 border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-[10px] font-bold rounded-lg cursor-pointer"
                            >
                              Visualizar OS
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ABA ORÇAMENTOS */}
              <TabsContent value="orcamentos" className="pt-2">
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Orçamentos Propostos do Cliente</p>
                    <button
                      type="button"
                      onClick={() => navigate(`/calculator?clientId=${client.id}`)}
                      className="text-[9px] font-black uppercase tracking-wider text-[#1B3A2D] hover:underline flex items-center gap-1"
                    >
                      <Plus className="size-3" /> Gerar Novo Orçamento
                    </button>
                  </div>

                  {((quotes?.list || []).filter(q => q.client?.name?.toLowerCase() === client.name.toLowerCase() || (q as any).clientId === client.id).length === 0) ? (
                    <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                      <FileText className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                      <p className="font-bold text-[#141410]">Nenhum orçamento registrado</p>
                      <p className="text-[9px]">Acesse a Calculadora para gerar propostas comerciais personalizadas.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(quotes?.list || []).filter(q => q.client?.name?.toLowerCase() === client.name.toLowerCase() || (q as any).clientId === client.id).map(q => (
                        <div key={q.id} className="p-3 bg-white border border-[#E8E6E1]/80 rounded-xl flex items-center justify-between gap-3 text-left">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-[#141410]">Orçamento #{q.id}</span>
                              <span className="text-[10px] text-slate-500">• {q.service?.pestType || 'Controle de Pragas'} ({q.service?.areaM2 || 0}m²)</span>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                              <span>R$ {(q.pricing?.finalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              <span>•</span>
                              <span>Criado em: {q.createdAt?.split('T')[0] || 'Hoje'}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full ${
                              q.status === 'aprovado' || q.status === 'executado'
                                ? 'bg-emerald-50 text-[#1B3A2D] border border-emerald-100'
                                : q.status === 'enviado'
                                ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {q.status}
                            </span>

                            {q.status !== 'aprovado' && q.status !== 'executado' && (
                              <button
                                type="button"
                                onClick={() => onScheduleQuote(q)}
                                className="px-2.5 py-1 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                              >
                                <Calendar className="size-3" /> Aprovar / Agendar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ABA CONTRATOS */}
              <TabsContent value="contratos" className="pt-2">
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Contratos de Manutenção CIP Recorrentes</p>
                    <button
                      type="button"
                      onClick={onCreateContract}
                      className="text-[9px] font-black uppercase tracking-wider text-[#1B3A2D] hover:underline flex items-center gap-1"
                    >
                      <Plus className="size-3" /> Adicionar Contrato
                    </button>
                  </div>

                  {((contracts || []).filter(c => c.clientId === client.id).length === 0) ? (
                    <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                      <FileText className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                      <p className="font-bold text-[#141410]">Nenhum contrato recorrente vinculado</p>
                      <p className="text-[9px]">Fidelize este cliente vinculando um faturamento recorrente preventivo.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(contracts || []).filter(c => c.clientId === client.id).map(c => {
                        const reajusteDoCliente = (contratosParaReajuste || []).find((r: any) => r.contractId === c.id);
                        return (
                          <div key={c.id} className="p-3 bg-white border border-[#E8E6E1]/80 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-3 text-left">
                            <div className="space-y-1">
                              <h4 className="font-bold text-[#141410]">{c.title}</h4>
                              <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500">
                                <span>Vigência: {c.startDate} até {c.endDate}</span>
                                <span>•</span>
                                <span>Fatura a cada {c.recurrencyMonths} m</span>
                              </div>
                              {reajusteDoCliente && (
                                <div className="mt-1 inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg text-[9.5px] font-black">
                                  <AlertTriangle className="size-3 shrink-0 text-amber-600 animate-pulse" />
                                  Reajuste sugerido: R$ {reajusteDoCliente.suggestedValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}/mês (+{reajusteDoCliente.adjustment.toFixed(1)}%)
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-3 justify-between">
                              <div>
                                <p className="text-[8px] font-bold text-slate-400 uppercase text-right">Mensalidade</p>
                                <p className="font-mono font-black text-emerald-800 text-xs">
                                  R$ {c.recurrentValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                </p>
                              </div>
                              <div className="flex gap-1">
                                <button
                                  type="button"
                                  onClick={() => onEditContract(c)}
                                  className="p-1 px-1.5 bg-slate-50 border border-[#E8E6E1] hover:border-slate-300 rounded hover:bg-slate-100 cursor-pointer text-slate-600 font-bold"
                                >
                                  Editar
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ABA FINANCEIRO */}
              <TabsContent value="financeiro" className="pt-2">
                {(() => {
                  const clientMovements = (movements || []).filter((m: any) => m.description.toLowerCase().includes(client.name.toLowerCase()));
                  const paidMovements = clientMovements.filter((m: any) => m.isPaid && m.value > 0);
                  const lastReceived = paidMovements.length > 0 ? paidMovements[paidMovements.length - 1].value : 0;
                  const pendingInvoices = clientMovements.filter((m: any) => !m.isPaid).reduce((acc: number, m: any) => acc + Math.abs(m.value), 0);
                  const overdueInvoices = clientMovements.filter((m: any) => !m.isPaid && new Date(m.date) < new Date()).reduce((acc: number, m: any) => acc + Math.abs(m.value), 0);

                  return (
                    <div className="space-y-3 text-xs">
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Extrato Financeiro e Fluxo de Caixa</p>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-slate-50/50 p-2.5 border border-[#E8E6E1]/40 rounded-xl">
                        <div>
                          <span className="text-[8px] font-bold text-slate-500 uppercase">Receita Líquida</span>
                          <p className="font-mono font-black text-emerald-800">R$ {clientStats.faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-500 uppercase">Último Recebimento</span>
                          <p className="font-mono font-black text-slate-700">R$ {lastReceived.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-500 uppercase">Faturas Pendentes</span>
                          <p className="font-mono font-black text-amber-700">R$ {pendingInvoices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <span className="text-[8px] font-bold text-slate-500 uppercase">Inadimplência</span>
                          <p className="font-mono font-black text-rose-700">R$ {overdueInvoices.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase">Lançamentos no Livro Caixa</span>
                        {clientMovements.length === 0 ? (
                          <div className="p-3 bg-slate-50 rounded-xl text-slate-400 text-center">
                            Não há transações liquidadas registradas no módulo financeiro sob esta razão social.
                          </div>
                        ) : (
                          <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                            {clientMovements.map((m: any) => (
                              <div key={m.id} className="p-2.5 bg-white border border-[#E8E6E1]/50 rounded-lg flex items-center justify-between text-[11px]">
                                <div className="space-y-0.5 text-left">
                                  <span className="font-bold text-slate-800 font-sans block">{m.description}</span>
                                  <span className="text-[9px] text-slate-500">{m.date} via {m.paymentMethod} • Ref: {m.costCenter}</span>
                                </div>
                                <div className="text-right font-mono">
                                  <span className={`font-black ${m.value > 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                                    {m.value > 0 ? '+' : ''} R$ {m.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                  <span className={`block text-[8px] font-black ${m.isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {m.isPaid ? 'CONCLUÍDO' : 'PENDENTE'}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </TabsContent>

              {/* ABA DOCUMENTOS */}
              <TabsContent value="documentos" className="pt-2">
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Documentos do Cliente & Certificados ANVISA</p>
                    
                    <label className="text-[9px] font-black uppercase tracking-wider text-[#1B3A2D] hover:underline flex items-center gap-1 cursor-pointer">
                      <Plus className="size-3" /> Anexar arquivo
                      <input
                        type="file"
                        accept=".pdf,.docx,.xlsx,.jpg,.png,.jpeg,.pptx"
                        className="hidden"
                        onChange={onUploadDoc}
                      />
                    </label>
                  </div>

                  {clientDocs.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                      <FileSpreadsheet className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                      <p className="font-bold text-[#141410]">Nenhum arquivo ou documento anexado</p>
                      <p className="text-[9px]">Gere certificados de dedetização ou faça upload de fotos e laudos.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {clientDocs.map(doc => {
                        const isPdf = doc.type === 'pdf';
                        const isXls = doc.type === 'xlsx' || doc.type === 'xls';
                        const isDoc = doc.type === 'doc' || doc.type === 'docx';
                        const isImg = doc.type === 'png' || doc.type === 'jpg' || doc.type === 'jpeg';

                        return (
                          <div key={doc.id} className="p-3 bg-[#FAF9F6]/50 border border-[#E8E6E1]/80 rounded-xl flex items-center justify-between gap-3 text-left">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <div className="p-1.5 rounded-lg bg-white border border-[#E8E6E1] text-[#141410]">
                                {isPdf && <FileText className="size-4 text-rose-600" />}
                                {isXls && <FileSpreadsheet className="size-4 text-emerald-600" />}
                                {isDoc && <FileCode className="size-4 text-blue-600" />}
                                {isImg && <FileImage className="size-4 text-pink-650" />}
                                {!isPdf && !isXls && !isDoc && !isImg && <FileText className="size-4" />}
                              </div>
                              <div className="overflow-hidden truncate">
                                <span className="font-bold text-[#141410] text-[11px] block truncate" title={doc.name}>
                                  {doc.name}
                                </span>
                                <span className="text-[9px] text-[#6B6B5F] font-sans font-semibold">
                                  {doc.size} • Upload em {doc.uploadedAt}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => onDeleteDoc(doc.id, doc.name)}
                              className="p-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 rounded-md cursor-pointer shrink-0"
                              title="Excluir documento"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ABA GARANTIAS */}
              <TabsContent value="garantias" className="pt-2">
                <div className="space-y-4 text-xs">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Apólices e Prazos de Garantias Técnicas</p>
                  
                  {clientWarranties.length === 0 ? (
                    <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                      <Clock className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                      <p className="font-bold text-[#141410]">Sem garantias preventivas ativas</p>
                      <p className="text-[9px]">Garantias são iniciadas automaticamente na conclusão de serviços.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {clientWarranties.map(w => {
                        const pct = w.daysLeft > 0 ? (w.daysLeft / 90) * 100 : 0;
                        return (
                          <div key={w.id} className="p-3 bg-white border border-[#E8E6E1] rounded-xl space-y-2 text-left">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-[#141410]">Garantia: {w.title}</h4>
                                <p className="text-[9px] text-slate-500 font-semibold">
                                  Aplicação feita em {w.execDate} • Cobertura integral até {w.expDate}
                                </p>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                w.daysLeft > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {w.daysLeft > 0 ? `Restam ${w.daysLeft} d` : 'Expirada'}
                              </span>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-300 ${
                                  w.daysLeft > 20 ? 'bg-emerald-700' : 'bg-rose-600 animate-pulse'
                                }`}
                                style={{ width: `${Math.min(pct, 100)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ABA RETORNOS */}
              <TabsContent value="retornos" className="pt-2">
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Chamados de Retornos Técnicos de Assistência</p>
                  </div>

                  {((agenda || []).filter(e => e.clientId === client.id && e.type === 'retorno').length === 0) ? (
                    <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                      <Activity className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                      <p className="font-bold text-[#141410]">Sem solicitações de retorno</p>
                      <p className="text-[9px]">Gere chamados de retorno técnico gratuito se o cliente relatar reinfestação.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(agenda || []).filter(e => e.clientId === client.id && e.type === 'retorno').map(ret => (
                        <div key={ret.id} className="p-3 bg-white border border-[#E8E6E1]/80 rounded-xl flex items-center justify-between gap-3 text-left">
                          <div className="space-y-1">
                            <h4 className="font-bold text-[#141410]">{ret.title}</h4>
                            <div className="flex gap-2 text-[10px] text-slate-500 font-semibold font-sans">
                              <span>Data agendada: {ret.date}</span>
                              <span>•</span>
                              <span>Custo Estimado: R$ 120,00</span>
                            </div>
                          </div>

                          <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full ${
                            ret.status === 'realizado' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700 border border-amber-100'
                          }`}>
                            {ret.status === 'realizado' ? 'Atendido' : 'Aguardando'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ABA TIMELINE */}
              <TabsContent value="timeline" className="pt-2">
                <div className="space-y-3 text-xs">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Histórico Cronológico Geral do Cliente</p>
                  
                  <div className="relative border-l-2 border-[#E8E6E1] ml-2 pb-2 space-y-4 pt-1">
                    {clientTimeline.map((item) => (
                      <div key={item.id} className="relative pl-5 text-left">
                        <div className="absolute -left-[7px] top-0.5 size-3 rounded-full bg-white border-2 border-[#1B3A2D] flex items-center justify-center">
                          <div className="size-1 rounded-full bg-[#1B3A2D]" />
                        </div>

                        <div className="space-y-0.5">
                          <span className="font-mono text-[9px] text-[#2D6A4F] font-bold leading-none">
                            {item.date}
                          </span>
                          <h5 className="text-[11px] font-bold text-[#141410] pt-0.5">
                            {item.title}
                          </h5>
                          <p className="text-[10px] text-[#6B6B5F] leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Coluna Direita Dentro do Sheet: Mapa, Rentabilidade e Oportunidade IA */}
          <div className="lg:col-span-5 w-full space-y-4">
            {/* Google Maps Location Card */}
            <div className="bg-white p-4 border border-[#E8E6E1] rounded-2xl shadow-xxs space-y-3 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-display font-black text-[#141410] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                  <MapPin className="size-4 text-[#1D9E75]" />
                  Localização & Rota
                </h4>
                <span className="text-[9px] font-black uppercase text-[#1D9E75] bg-emerald-50 px-2 py-0.5 rounded-md">
                  Google Maps
                </span>
              </div>

              <GoogleMapsViewer 
                address={client.address}
                title={client.name}
                showRouteFromHq={true}
                height="190px"
              />

              <div className="text-[10px] text-slate-500 font-semibold leading-normal font-sans">
                <p className="font-bold text-slate-700">Endereço do Cliente:</p>
                <p className="mt-0.5 text-slate-600">{client.address}</p>
              </div>
            </div>

            {/* Desempenho Financeiro */}
            {activeRentabilidade && (
              <div id="sheet-desempenho-financeiro-card" className="bg-white p-4 border border-[#E8E6E1] rounded-2xl shadow-xxs space-y-3 text-left">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-display font-black text-[#141410] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                      <TrendingUp className="size-4 text-[#1B3A2D]" />
                      Desempenho Financeiro
                    </h4>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {activeRentabilidade.margemPercent > 40 && activeRentabilidade.qtdServicos > 5 && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-250 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider leading-none">
                        ⭐ Cliente Premium
                      </span>
                    )}
                    {activeRentabilidade.taxaRetorno > 15 && (
                      <span className="bg-rose-100 text-rose-900 border border-rose-250 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider leading-none">
                        ⚠️ Atenção: Retornos
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-emerald-50/20 border border-emerald-100/50 p-2 rounded-xl text-left">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 font-sans block">Total Faturado</span>
                    <span className="text-[12px] font-mono font-black text-emerald-800 block mt-0.5">
                      R$ {activeRentabilidade.totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="bg-slate-50/50 border border-slate-150/50 p-2 rounded-xl text-left">
                    <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 font-sans block">Margem Média</span>
                    <span className={`text-[12px] font-mono font-black block mt-0.5 ${
                      activeRentabilidade.margemPercent > 35 ? 'text-emerald-700' : activeRentabilidade.margemPercent >= 20 ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {activeRentabilidade.margemPercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[10px] text-slate-600 font-bold leading-relaxed">
                  <div className="flex justify-between items-center">
                    <span>Serviços Executados:</span>
                    <span className="font-mono text-slate-800 font-black">{activeRentabilidade.qtdServicos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Retornos Solicitados:</span>
                    <span className="font-mono text-rose-700 font-black">{activeRentabilidade.qtdRetornos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Taxa de Retorno:</span>
                    <span className={`font-mono font-black ${activeRentabilidade.taxaRetorno > 15 ? 'text-rose-700' : 'text-emerald-700'}`}>
                      {activeRentabilidade.taxaRetorno.toFixed(2)}%
                    </span>
                  </div>
                  {activeRentabilidade.ultimoServico && (
                    <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-200">
                      <span>Último Atendimento:</span>
                      <span className="font-mono text-slate-700">{activeRentabilidade.ultimoServico.split('-').reverse().join('/')}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Oportunidade IA */}
            {aiOpportunity && (
              <div className="bg-[#FAF9F6]/80 p-4 border border-[#E8E6E1] rounded-2xl space-y-3 text-left">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1">
                    <span className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-xs">
                      <Sparkles className="size-3 fill-white" /> Oportunidade IA
                    </span>
                    <span className="text-[9px] font-bold text-amber-800">{aiOpportunity.badge}</span>
                  </div>

                  <h4 className="text-xs font-display font-black text-[#141410] uppercase tracking-tight">
                    {aiOpportunity.title}
                  </h4>
                  
                  <p className="text-[10px] text-slate-600 leading-relaxed font-sans font-semibold">
                    {aiOpportunity.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E8E6E1]/50 space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#6B6B5F] font-bold">Volume Estimado:</span>
                    <span className="font-mono font-black text-emerald-800">
                      R$ {aiOpportunity.estimatedValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                    </span>
                  </div>

                  <Button
                    type="button"
                    onClick={() => navigate(`/calculator?clientId=${client.id}`)}
                    className="w-full justify-center flex items-center gap-2 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm h-auto"
                  >
                    <Check className="size-3.5" /> Gerar Orçamento
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4️⃣ GATILHOS DE CONFORMIDADE */}
        <div className="mt-5 pt-4 border-t border-[#E8E6E1]/50 space-y-2 text-left">
          <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-sans">
            Gatilhos de Conformidade & Inteligência
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {clientHealth.color === 'red' ? (
              <div className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/20 text-[10px] text-[#C53030] flex items-start gap-2">
                <span className="shrink-0 pt-0.5">🔴</span>
                <div>
                  <span className="font-bold block uppercase tracking-wide">Inatividade / Risco</span>
                  <p className="text-slate-500 pt-0.5 font-semibold font-sans">{clientHealth.desc}</p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/20 text-[10px] text-emerald-800 flex items-start gap-2">
                <span className="shrink-0 pt-0.5">🟢</span>
                <div>
                  <span className="font-bold block uppercase tracking-wide">Regularidade</span>
                  <p className="text-slate-500 pt-0.5 font-semibold font-sans">Status operacional em conformidade.</p>
                </div>
              </div>
            )}

            {(movements || []).some((m: any) => m.description.toLowerCase().includes(client.name.toLowerCase()) && !m.isPaid) ? (
              <div className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/20 text-[10px] text-amber-800 flex items-start gap-2">
                <span className="shrink-0 pt-0.5">🟡</span>
                <div>
                  <span className="font-bold block uppercase tracking-wide">Comprometimento</span>
                  <p className="text-slate-500 pt-0.5 font-semibold font-sans">Lançamentos em aberto identificados.</p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/20 text-[10px] text-[#1B3A2D] flex items-start gap-2">
                <span className="shrink-0 pt-0.5">🟢</span>
                <div>
                  <span className="font-bold block uppercase tracking-wide">Adimplente</span>
                  <p className="text-slate-500 pt-0.5 font-semibold font-sans">Sem títulos vencidos no financeiro.</p>
                </div>
              </div>
            )}

            {clientWarranties.some(w => w.status === 'active') ? (
              <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/20 text-[10px] text-[#1B3A2D] flex items-start gap-2">
                <span className="shrink-0 pt-0.5">🟢</span>
                <div>
                  <span className="font-bold block uppercase tracking-wide">Proteção Ativa</span>
                  <p className="text-slate-500 pt-0.5 font-semibold font-sans">Garantia vigente para o imóvel.</p>
                </div>
              </div>
            ) : (
              <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-[10px] text-slate-700 flex items-start gap-2">
                <span className="shrink-0 pt-0.5">ℹ️</span>
                <div>
                  <span className="font-bold block uppercase tracking-wide">Sem Garantia</span>
                  <p className="text-slate-500 pt-0.5 font-semibold font-sans">Sem cobertura ativa no momento.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
