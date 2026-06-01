import React, { useState, useMemo } from 'react';
import { useSystemStore, Quote } from '@/store/systemStore';
import { 
  CheckCircle2, 
  RotateCcw, 
  AlertCircle, 
  Clock, 
  Check, 
  Plus, 
  Sparkles, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  User, 
  FileText, 
  SlidersHorizontal, 
  Tag, 
  Layers, 
  X,
  PackageCheck,
  Scale,
  Activity,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { ConfirmacaoServicoModal } from './ConfirmacaoServicoModal';
import { MarcarRetornoModal } from './MarcarRetornoModal';

export function ServicoConfirmacaoPage() {
  const { quotes, confirmServiceExecuted, markAsRetorno } = useSystemStore();
  const quoteList = quotes?.list || [];

  // Active tab state in sub-page
  const [activeTab, setActiveTab] = useState<'pendentes' | 'confirmados' | 'retornos'>('pendentes');

  // Modal control states
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [selectedQuoteForConfirm, setSelectedQuoteForConfirm] = useState<Quote | null>(null);

  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedQuoteForReturn, setSelectedQuoteForReturn] = useState<Quote | null>(null);

  // Date Filtering Helper
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isFromCurrentMonth = (dateString?: string) => {
    if (!dateString) return false;
    const d = new Date(dateString);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  };

  // KPI Calculations
  const kpis = useMemo(() => {
    const pendentesList = quoteList.filter(q => q.status === 'enviado' || q.status === 'aprovado');
    const confirmadosList = quoteList.filter(q => q.status === 'executado');
    const retornosList = quoteList.filter(q => q.status === 'retorno' || q.isRetorno === true);

    const pendentesCount = pendentesList.length;

    // Checked list of items executed this month
    const confirmadosEsteMesCount = confirmadosList.filter(q => isFromCurrentMonth(q.confirmedAt || q.createdAt)).length;

    // Returns recorded this month
    const retornosEsteMesList = retornosList.filter(q => isFromCurrentMonth(q.confirmedAt || q.createdAt));
    const retornosEsteMesCount = retornosEsteMesList.length;

    // Return costs accumulated this month
    const custoEmRetornosEsteMes = retornosEsteMesList.reduce((acc, q) => acc + (q.returnCost || 0), 0);

    return {
      pendentesCount,
      confirmadosEsteMesCount,
      retornosEsteMesCount,
      custoEmRetornosEsteMes
    };
  }, [quoteList]);

  // Labels localization filters helpers
  const getPestText = (val: string): string => {
    if (!val) return 'Múltiplas pragas';
    const v = val.toLowerCase().trim();
    if (v === 'baratas') return 'Controle de Baratas';
    if (v === 'ratos') return 'Controle de Roedores';
    if (v === 'cupins') return 'Controle de Cupins';
    if (v === 'mosquitos' || v === 'mosquito' || v.includes('mosquito')) return 'Mosquitos/Dengue';
    if (v === 'formigas') return 'Controle de Formigas';
    if (v === 'escorpioes' || v === 'escorpiões') return 'Escorpiões';
    if (v === 'aranhas') return 'Aranhas e aracnídeos';
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  const getServiceTypeText = (val: string): string => {
    if (!val) return 'Serviço operacional';
    const v = val.toLowerCase().trim();
    if (v === 'dedetizacao' || v === 'dedetização') return 'Dedetização';
    if (v === 'desratizacao' || v === 'desratização') return 'Desratização';
    if (v === 'descupinizacao' || v === 'descupinização') return 'Descupinização';
    if (v === 'sanitizacao' || v === 'sanitização') return 'Sanitização Corretiva';
    if (v === 'controle_integrado' || v === 'controle integrado') return 'CIP (Controle Integrado de Pragas)';
    return val.charAt(0).toUpperCase() + val.slice(1);
  };

  // Split calculations of retornos for rendering in tab 3
  const retornosSubtotalAcumulado = useMemo(() => {
    return quoteList
      .filter(q => q.status === 'retorno' || q.isRetorno === true)
      .reduce((sum, q) => sum + (q.returnCost || 0), 0);
  }, [quoteList]);

  // Modals operations trigger
  const triggerConfirmModal = (quote: Quote) => {
    setSelectedQuoteForConfirm(quote);
    setIsConfirmModalOpen(true);
  };

  const triggerReturnModal = (quote: Quote) => {
    setSelectedQuoteForReturn(quote);
    setIsReturnModalOpen(true);
  };

  const handleConfirmSubmit = (techName: string, notes: string) => {
    if (!selectedQuoteForConfirm) return;
    confirmServiceExecuted(
      selectedQuoteForConfirm.id,
      techName || undefined,
      notes || undefined
    );
    setIsConfirmModalOpen(false);
    setSelectedQuoteForConfirm(null);
    toast.success("Serviço confirmado! Estoque atualizado e receita registrada.");
  };

  const handleReturnSubmit = (cost: number, notes: string) => {
    if (!selectedQuoteForReturn) return;
    markAsRetorno(
      selectedQuoteForReturn.id,
      cost,
      undefined,
      notes
    );
    setIsReturnModalOpen(false);
    setSelectedQuoteForReturn(null);
    toast.success(`Retorno registrado! Custo de R$ ${cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} lançado no financeiro.`);
  };

  return (
    <div className="flex-1 w-full bg-[#FAF9F5] min-h-[calc(100vh-64px)] p-6 md:p-8 font-sans antialiased text-[#1D1D18]">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Upper Header styling with minimalist badge */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-[#2D6A4F] uppercase tracking-widest bg-[#E3EFE5] px-3 py-1 rounded-full mb-2 w-fit">
              <span className="size-1.5 bg-[#2E7D32] rounded-full animate-pulse" />
              Sincronia de Atendimento e Insumos
            </div>
            <h1 className="text-3xl font-display font-black text-[#141410] tracking-tight">
              Gerente de Confirmações
            </h1>
            <p className="text-sm text-[#706F65] max-w-xl">
              Selecione orçamentos fechados para validar execuções em campo, registrando laudos técnicos, baixas de inventário integradas e contingência de retornos gratuitos em garantia.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white border border-[#EBEBE5] px-4 py-2.5 rounded-2xl shadow-xs">
            <Activity className="size-4 text-[#2D6A4F]" />
            <div className="text-left">
              <span className="block text-[10px] font-mono text-slate-400 font-bold uppercase leading-tight">Canal Ativo</span>
              <span className="text-xs font-bold text-[#141410] leading-none">DDSulf Integração</span>
            </div>
          </div>
        </div>

        {/* TOP KPI SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <div className="bg-white border border-[#EBEBE5] rounded-2xl p-5 shadow-xs transition-transform duration-300 hover:-translate-y-0.5" id="kpi-pendentes">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#706F65] uppercase tracking-wider">Aguardando Baixa</span>
              <div className="size-7 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center">
                <Clock className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-display font-extrabold text-[#141410]">{kpis.pendentesCount}</span>
              <span className="text-xs font-bold text-slate-400">orçamentos</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Aprovados ou enviados</p>
          </div>

          <div className="bg-white border border-[#EBEBE5] rounded-2xl p-5 shadow-xs transition-transform duration-300 hover:-translate-y-0.5" id="kpi-confirmados">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-[#2D6A4F] uppercase tracking-wider">Executados (Este Mês)</span>
              <div className="size-7 bg-[#E3EFE5] text-[#2D6A4F] rounded-lg flex items-center justify-center">
                <Check className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-display font-extrabold text-[#1B3A2D]">{kpis.confirmadosEsteMesCount}</span>
              <span className="text-xs font-bold text-slate-400">concluídos</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Gera receita real na DRE</p>
          </div>

          <div className="bg-white border border-[#EBEBE5] rounded-2xl p-5 shadow-xs transition-transform duration-300 hover:-translate-y-0.5" id="kpi-retornos">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">Retornos (Este Mês)</span>
              <div className="size-7 bg-amber-50 text-amber-700 rounded-lg flex items-center justify-center">
                <RotateCcw className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-3xl font-display font-extrabold text-amber-800">{kpis.retornosEsteMesCount}</span>
              <span className="text-xs font-bold text-slate-400">chamados</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Garantia sem cobranças</p>
          </div>

          <div className="bg-white border border-[#EBEBE5] rounded-2xl p-5 shadow-xs transition-transform duration-300 hover:-translate-y-0.5" id="kpi-custos-retorno">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-rose-700 uppercase tracking-wider">Custos de Retorno</span>
              <div className="size-7 bg-rose-50 text-rose-700 rounded-lg flex items-center justify-center">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-1">
              <span className="text-2xl font-display font-extrabold text-rose-700">
                R$ {kpis.custoEmRetornosEsteMes.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Prejuízo técnico operacional</p>
          </div>

        </div>

        {/* NAVIGATION TABS SELECTOR */}
        <div className="flex items-center justify-between border-b border-[#EBEBE5] pb-px">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('pendentes')}
              className={`pb-4 px-3 text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'pendentes' 
                  ? 'text-[#2D6A4F]' 
                  : 'text-[#706F65] hover:text-[#141410]'
              }`}
              id="tab-pendentes"
            >
              <span className="flex items-center gap-1.5">
                <Clock className="size-4 shrink-0" />
                Pendentes
                <span className="bg-[#EBEBE5] text-[#141410] font-sans text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {quoteList.filter(q => q.status === 'enviado' || q.status === 'aprovado').length}
                </span>
              </span>
              {activeTab === 'pendentes' && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#2D6A4F] rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('confirmados')}
              className={`pb-4 px-3 text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'confirmados' 
                  ? 'text-[#2D6A4F]' 
                  : 'text-[#706F65] hover:text-[#141410]'
              }`}
              id="tab-confirmados"
            >
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="size-4 shrink-0" />
                Confirmados
                <span className="bg-[#EBEBE5] text-[#141410] font-sans text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {quoteList.filter(q => q.status === 'executado').length}
                </span>
              </span>
              {activeTab === 'confirmados' && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#2D6A4F] rounded-t-full" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('retornos')}
              className={`pb-4 px-3 text-xs font-bold transition-all cursor-pointer relative ${
                activeTab === 'retornos' 
                  ? 'text-[#2D6A4F]' 
                  : 'text-[#706F65] hover:text-[#141410]'
              }`}
              id="tab-retornos"
            >
              <span className="flex items-center gap-1.5">
                <RotateCcw className="size-4 shrink-0" />
                Retornos em Garantia
                <span className="bg-[#EBEBE5] text-[#141410] font-sans text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {quoteList.filter(q => q.status === 'retorno' || q.isRetorno === true).length}
                </span>
              </span>
              {activeTab === 'retornos' && (
                <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-1 bg-[#2D6A4F] rounded-t-full" />
              )}
            </button>
          </div>
        </div>

        {/* ACTIVE TAB RENDER VIEWS */}
        <div>
          {activeTab === 'pendentes' && (
            <div className="space-y-6" id="list-pendentes">
              {quoteList.filter(q => q.status === 'enviado' || q.status === 'aprovado').length === 0 ? (
                <div className="bg-white border border-[#EBEBE5] rounded-2xl py-16 px-4 text-center max-w-md mx-auto space-y-4">
                  <div className="size-16 bg-[#F7F6F2] rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <SlidersHorizontal className="size-6 text-[#706F65]" />
                  </div>
                  <div>
                    <h3 className="text-base font-display font-bold text-[#141410]">Nenhum orçamento aguardando confirmação</h3>
                    <p className="text-xs text-[#706F65] mt-1 max-w-sm mx-auto leading-relaxed">
                      Crie um orçamento na Calculadora e envie-o ao cliente.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quoteList
                    .filter(q => q.status === 'enviado' || q.status === 'aprovado')
                    .map((q) => (
                      <div 
                        key={q.id}
                        className="bg-white border border-[#EBEBE5] rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:border-[#2D6A4F]/30 hover:shadow-sm transition-all duration-200"
                        id={`quote-card-pendente-${q.id}`}
                      >
                        <div>
                          {/* Card Head */}
                          <div className="flex justify-between items-start pb-4 border-b border-[#EBEBE5]/60 mb-4">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wider">CÓDIGO: {q.id}</span>
                              <span className="block text-xs font-mono font-semibold text-slate-400 mt-0.5">
                                Criado em {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <div>
                              <span className={`px-2.5 py-1 text-[9px] font-mono font-bold tracking-wider rounded-md uppercase ${
                                q.status === 'aprovado' 
                                  ? 'bg-[#E3EFE5] text-[#2D6A4F]' 
                                  : 'bg-sky-50 text-sky-700 border border-sky-100'
                              }`}>
                                {q.status === 'aprovado' ? 'Aprovado' : 'Enviado'}
                              </span>
                            </div>
                          </div>

                          {/* Client Section */}
                          <div className="space-y-1 text-left mb-4">
                            <h3 className="text-[#141410] font-display font-extrabold text-[#141410] text-base">{q.client?.name}</h3>
                            <p className="text-xs text-[#706F65] line-clamp-1">{q.client?.address}</p>
                            {q.client?.phone && <p className="text-[10px] font-mono text-slate-400">CONTATO: {q.client.phone}</p>}
                          </div>

                          {/* Detail specs of service */}
                          <div className="grid grid-cols-2 gap-3 bg-[#FAF8F5] border border-[#EBEBE5]/60 rounded-2xl p-3 text-xs mb-4">
                            <div className="text-left">
                              <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase">Serviço</span>
                              <span className="font-extrabold text-[#141410]">{getServiceTypeText(q.service?.serviceType)}</span>
                            </div>
                            <div className="text-left">
                              <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase">Praga-Alvo</span>
                              <span className="font-extrabold text-[#141410]">{getPestText(q.service?.pestType)}</span>
                            </div>
                            <div className="text-left pt-2 border-t border-[#EBEBE5]/40">
                              <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase">Área Operativa</span>
                              <span className="font-bold text-[#141410]">{q.service?.areaM2 || 0} m²</span>
                            </div>
                            <div className="text-left pt-2 border-t border-[#EBEBE5]/40">
                              <span className="block text-[8px] font-mono font-bold text-slate-400 uppercase">Distância Deslocada</span>
                              <span className="font-bold text-[#141410]">{q.service?.distanceKm || 0} Km</span>
                            </div>
                          </div>

                          {/* Cost and Products components mapped list */}
                          <div className="mb-4">
                            <h4 className="text-[10px] font-mono font-bold text-[#706F65] uppercase tracking-wider mb-2 text-left">Produtos no Plano Técnico</h4>
                            {q.productsUsed && q.productsUsed.length > 0 ? (
                              <div className="bg-white border border-[#EBEBE5]/60 rounded-xl max-h-28 overflow-y-auto p-2 text-xs space-y-1">
                                {q.productsUsed.map((prod, idx) => (
                                  <div key={`${q.id}-prod-${idx}-${prod.productId}`} className="flex justify-between items-center bg-[#FAF8F5]/50 px-2 py-1 rounded-md text-[11px]">
                                    <span className="text-[#141410] font-semibold">{prod.productName}</span>
                                    <span className="font-mono text-[#2D6A4F] font-bold">
                                      {prod.quantity} {prod.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-[10px] italic text-[#706F65] text-left">Sem insumos descritos na matriz</p>
                            )}
                          </div>

                          {/* Final prices bar */}
                          <div className="flex justify-between items-center py-2.5 border-t border-b border-[#EBEBE5]/40 mb-6">
                            <span className="text-xs font-bold text-[#706F65]">Preço Estimado</span>
                            <span className="text-base font-display font-black text-[#2D6A4F]">
                              R$ {(q.pricing?.finalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2.5 mt-auto pt-2">
                          <button
                            type="button"
                            onClick={() => triggerConfirmModal(q)}
                            className="flex-1 h-11 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-1"
                            id={`btn-confirm-${q.id}`}
                          >
                            <CheckCircle2 className="size-3.5" /> Confirmar Execução
                          </button>
                        </div>

                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'confirmados' && (
            <div className="space-y-6" id="list-confirmados">
              {quoteList.filter(q => q.status === 'executado').length === 0 ? (
                <div className="bg-white border border-[#EBEBE5] rounded-3xl py-12 px-4 text-center max-w-sm mx-auto">
                  <p className="text-sm text-[#706F65] italic">Nenhuma ordem listada como efetuada.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quoteList
                    .filter(q => q.status === 'executado')
                    .map((q) => (
                      <div 
                        key={q.id}
                        className="bg-white border border-[#EBEBE5] rounded-3xl p-6 shadow-xs flex flex-col justify-between text-left"
                        id={`quote-card-confirmado-${q.id}`}
                      >
                        <div>
                          <div className="flex justify-between items-start pb-3 border-b border-[#EBEBE5]/60 mb-4">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider">CÓDIGO: {q.id}</span>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Concluído em: {q.confirmedAt ? new Date(q.confirmedAt).toLocaleString('pt-BR') : 'N/A'}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 text-[9px] font-mono font-bold uppercase rounded-md flex items-center gap-1">
                              <Check className="size-3" /> Executado
                            </span>
                          </div>

                          <div className="mb-4">
                            <h3 className="font-display font-extrabold text-[#141410] text-base">{q.client?.name}</h3>
                            <p className="text-xs text-[#706F65] mt-0.5">{q.client?.address}</p>
                          </div>

                          {/* Technical Box */}
                          <div className="bg-[#FAF8F5] border border-[#EBEBE5]/40 rounded-xl p-3 mb-4 space-y-2 text-xs">
                            <p className="text-[9px] font-mono font-bold tracking-wider text-[#706F65] uppercase border-b border-[#EBEBE5]/50 pb-1">
                              Laudo Técnico Emitido
                            </p>
                            {q.confirmedBy && (
                              <p className="text-xs text-[#141410]">
                                <strong>Aplicador Responsável:</strong> {q.confirmedBy}
                              </p>
                            )}
                            {q.serviceNotes ? (
                              <div className="bg-white border border-[#EBEBE5]/60 text-[#706F65] rounded-lg p-2.5 text-[11px] leading-relaxed italic">
                                "{q.serviceNotes}"
                              </div>
                            ) : (
                              <span className="text-[11px] italic text-[#706F65]">Nenhuma observação informada.</span>
                            )}
                          </div>

                          {/* Service parameters and prices */}
                          <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                            <span>Tipo Aplicado:</span>
                            <span className="font-bold text-[#141410]">{getServiceTypeText(q.service?.serviceType)}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs text-slate-500 mb-4">
                            <span>Área Trabalhada:</span>
                            <span className="font-bold text-[#141410]">{q.service?.areaM2 || 0} m²</span>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-[#EBEBE5]/60">
                            <span className="text-xs font-bold text-slate-500">Receita Homologada:</span>
                            <span className="text-base font-display font-extrabold text-[#1B3A2D]">
                              R$ {(q.pricing?.finalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>

                                        {/* Retorno button for confirmed services */}
                        <div className="mt-4 flex gap-2">
                          {!q.hasReturn ? (
                            <button
                              type="button"
                              onClick={() => triggerReturnModal(q)}
                              className="flex-1 h-10 border border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 text-amber-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              id={`btn-return-confirmed-${q.id}`}
                            >
                              <RotateCcw className="size-3.5" /> Registrar Retorno em Garantia
                            </button>
                          ) : (
                            <div className="flex-1 p-2 bg-rose-50 rounded-xl text-[10px] text-rose-700 font-bold text-center border border-rose-100">
                              ⚠️ Este serviço possui um retorno em garantia ativo
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'retornos' && (
            <div className="space-y-6" id="list-retornos">
              
              {/* MONTH SUB-TOTAL CALCULATION PANEL */}
              <div className="bg-[#FAF8F5] border-2 border-dashed border-amber-300 rounded-[24px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-amber-950 text-sm flex items-center gap-2">
                    <RotateCcw className="size-4 shrink-0 text-amber-700 animate-spin duration-3000" />
                    Balanço Técnico em Garantias
                  </h4>
                  <p className="text-xs text-amber-900 leading-relaxed">
                    Soma de custos não comerciais gerados no fechamento dos retornos. Estes montantes alimentam o histórico financeiro como saídas em sinistros.
                  </p>
                </div>
                <div className="bg-amber-100/50 border border-amber-200 px-5 py-3 rounded-2xl flex flex-col items-center justify-center shrink-0">
                  <span className="text-[9px] font-mono font-bold tracking-wider text-amber-800 uppercase">SUBTOTAL GERAL</span>
                  <span className="text-lg font-display font-black text-amber-900">
                    R$ {retornosSubtotalAcumulado.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {quoteList.filter(q => q.status === 'retorno' || q.isRetorno === true).length === 0 ? (
                <div className="bg-white border border-[#EBEBE5] rounded-3xl py-12 px-4 text-center max-w-sm mx-auto">
                  <p className="text-sm text-[#706F65] italic">Nenhum retorno de garantia catalogado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quoteList
                    .filter(q => q.status === 'retorno' || q.isRetorno === true)
                    .map((q) => (
                      <div 
                        key={q.id}
                        className="bg-white border border-[#EBEBE5] rounded-3xl p-6 shadow-xs flex flex-col justify-between text-left border-l-4 border-l-amber-600"
                        id={`quote-card-retorno-${q.id}`}
                      >
                        <div>
                          <div className="flex justify-between items-start pb-3 border-b border-[#EBEBE5]/60 mb-4">
                            <div>
                              <span className="text-[10px] font-mono text-slate-400 font-bold tracking-wider">RETORNO ID: {q.id}</span>
                              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                                Registrado em: {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                            <span className="px-2.5 py-1 bg-amber-50 text-amber-800 text-[9px] font-mono font-bold uppercase rounded-md flex items-center gap-1">
                              <RotateCcw className="size-3" /> Retorno Gratuito
                            </span>
                          </div>

                          <div className="mb-4">
                            <h3 className="font-display font-extrabold text-[#141410] text-base">{q.client?.name}</h3>
                            <p className="text-xs text-[#706F65] mt-0.5">{q.client?.address}</p>
                            <span className="block text-[10px] font-mono font-semibold text-amber-850 mt-2">
                              VÍNCULO AO CONTRATO ORIGINAL: <strong className="font-mono text-[#2D6A4F]">#{q.parentQuoteId}</strong>
                            </span>
                          </div>

                          {/* Detail fields */}
                          <div className="bg-[#FAF8F5] border border-[#EBEBE5]/40 rounded-xl p-3 mb-4 space-y-2 text-xs">
                            <p className="text-[9px] font-mono font-bold tracking-wider text-amber-800 uppercase border-b border-[#EBEBE5]/50 pb-1">
                              Justificativa do Retorno
                            </p>
                            {q.confirmedBy && (
                              <p className="text-xs text-[#141410]">
                                <strong>Técnico Responsável:</strong> {q.confirmedBy}
                              </p>
                            )}
                            {q.serviceNotes ? (
                              <div className="bg-white border border-[#EBEBE5]/60 text-amber-950 rounded-lg p-2.5 text-[11px] leading-relaxed italic">
                                "{q.serviceNotes}"
                              </div>
                            ) : (
                              <span className="text-[11px] italic text-[#706F65]">Motivo não descrito.</span>
                            )}
                          </div>

                          <div className="flex justify-between items-center text-xs text-slate-500 mb-2">
                            <span>Praga Alvo Relatada:</span>
                            <span className="font-bold text-[#141410]">{getPestText(q.service?.pestType)}</span>
                          </div>

                          <div className="flex justify-between items-center pt-3 border-t border-[#EBEBE5]/60">
                            <span className="text-xs font-bold text-[#706F65]">Prejuízo Técnico (Custo):</span>
                            <span className="text-base font-display font-extrabold text-rose-700">
                              R$ {(q.returnCost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detailed Guidelines Bottom Info Panel */}
        <div className="bg-[#E3EFE5] border border-[#2D6A4F]/20 rounded-3xl p-6 flex gap-4 text-xs text-[#1B3A2D] leading-relaxed text-left">
          <AlertCircle className="size-5 text-[#2D6A4F] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="font-bold font-display text-sm">Controle de Baixa em Tempo Real</h5>
            <p>
              Ao acionar a <strong>Confirmação de Execução</strong> para qualquer serviço, a baixa dos produtos descritos nas composições é processada imediatamente no catálogo inteligente de estoque. Essa ação descarta simulações de rascunhos e consolida faturas liquidadas como receitas confirmadas para a contabilidade da folha de premissas da DRE.
            </p>
          </div>
        </div>

      </div>

      {/* CONFIRMATION IN TRANSIT MODAL */}
      <AnimatePresence>
        {isConfirmModalOpen && selectedQuoteForConfirm && (
          <ConfirmacaoServicoModal
            quote={selectedQuoteForConfirm}
            onConfirm={handleConfirmSubmit}
            onClose={() => {
              setIsConfirmModalOpen(false);
              setSelectedQuoteForConfirm(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* REGISTRATION RETURN MODAL */}
      <AnimatePresence>
        {isReturnModalOpen && selectedQuoteForReturn && (
          <MarcarRetornoModal
            quote={selectedQuoteForReturn}
            onConfirm={handleReturnSubmit}
            onClose={() => {
              setIsReturnModalOpen(false);
              setSelectedQuoteForReturn(null);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
}
