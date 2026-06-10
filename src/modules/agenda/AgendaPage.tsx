import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSystemStore, AgendaEvent } from '@/store/systemStore';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Briefcase, 
  MapPin, 
  User, 
  X, 
  Check, 
  AlertCircle, 
  Info,
  CalendarDays,
  CheckCircle2,
  Phone,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// Help helper to get the exact YYYY-MM-DD string from an event (handling both string, raw objects and custom format)
const getEventDateString = (ev: any): string => {
  if (!ev) return '';
  if (!ev.date) return '';
  if (typeof ev.date === 'string') return ev.date;
  if (typeof ev.date === 'object' && ev.date !== null) {
    const { y, m, d } = ev.date;
    if (y !== undefined && m !== undefined && d !== undefined) {
      return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    }
  }
  return '';
};

// Map day numbers (0-6) to Portuguese names
const DAYS_OF_WEEK_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DAYS_OF_WEEK_FULL_NAMES = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

// Hourly slots from 07:00 to 18:00
const HOURS = [
  '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
  '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
];

export function AgendaPage() {
  const { 
    agenda, 
    addAgendaEvent, 
    updateAgendaEvent, 
    clients,
    quotes,
    confirmServiceExecuted
  } = useSystemStore();

  const [searchParams] = useSearchParams();
  
  // Set current date reference to June 9, 2026 (based on current metadata timestamp)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 5, 9)); 
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formClient, setFormClient] = useState('');
  const [formServiceType, setFormServiceType] = useState('Dedetização');
  const [formDate, setFormDate] = useState('2026-06-09');
  const [formTime, setFormTime] = useState('08:00');
  const [formSegment, setFormSegment] = useState('B2B — Empresa');
  const [formObs, setFormObs] = useState('');

  // Handle URL deep-linking to highlight a specific event
  useEffect(() => {
    const paramEvId = searchParams.get('eventId');
    if (paramEvId && agenda && agenda.length > 0) {
      const exists = agenda.some(e => e.id === paramEvId);
      if (exists) {
        setSelectedEventId(paramEvId);
        // Find event date and pivot current view to that date's week
        const targetEv = agenda.find(e => e.id === paramEvId);
        const evDateStr = getEventDateString(targetEv);
        if (evDateStr) {
          const matchedDate = new Date(evDateStr + 'T12:00:00');
          setCurrentDate(matchedDate);
        }
      }
    }
  }, [searchParams, agenda]);

  // Compute the 7 days of the current visible week (Sunday to Saturday)
  const weekDays = useMemo(() => {
    const sunday = new Date(currentDate);
    const dayOfWeek = currentDate.getDay(); // 0 is Sunday, 1 is Monday ...
    sunday.setDate(currentDate.getDate() - dayOfWeek);
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const weekDayStrings = useMemo(() => {
    return weekDays.map(d => d.toISOString().split('T')[0]);
  }, [weekDays]);

  // Format the visual week range banner: e.g., "07 jun — 13 jun"
  const formattedWeekRange = useMemo(() => {
    if (weekDays.length < 7) return '';
    const first = weekDays[0];
    const last = weekDays[6];
    
    const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' });
    const firstStr = formatter.format(first).replace('.', '').toLowerCase();
    const lastStr = formatter.format(last).replace('.', '').toLowerCase();
    return `${firstStr} — ${lastStr}`;
  }, [weekDays]);

  // Helper selectors and default mapper for agenda database items
  const mappedEvents = useMemo(() => {
    return (agenda || []).map((ev: any) => {
      // client maps to clientName or client
      const clientName = ev.clientName || ev.client || 'Cliente não identificado';
      
      // status maps to 'confirmed', 'pending', 'cancelled'
      const rawStatus = (ev.status || '').toLowerCase();
      let mappedStatus = 'pending';
      if (rawStatus === 'confirmed' || rawStatus === 'confirmado' || rawStatus === 'realizado') {
        mappedStatus = 'confirmed';
      } else if (rawStatus === 'cancelled' || rawStatus === 'cancelado') {
        mappedStatus = 'cancelled';
      }

      // type maps to 'Dedetização' | 'Desratização' | 'Descupinização' | 'Sanitização' | 'Manutenção (retorno)'
      const rawType = ev.type || 'servico';
      let mappedType = ev.serviceType || 'Dedetização';
      if (rawType === 'retorno') {
        mappedType = 'Manutenção (retorno)';
      } else if (ev.title) {
        const titleL = ev.title.toLowerCase();
        if (titleL.includes('rato') || titleL.includes('roedor')) mappedType = 'Desratização';
        else if (titleL.includes('cupim') || titleL.includes('madeira')) mappedType = 'Descupinização';
        else if (titleL.includes('sanit') || titleL.includes('sanitização')) mappedType = 'Sanitização';
      }

      // segment maps to 'B2B — Condomínio' | 'B2B — Empresa' | 'B2C — Residencial'
      let mappedSeg = ev.seg || 'B2C — Residencial';
      const clientL = clientName.toLowerCase();
      if (ev.seg) {
        mappedSeg = ev.seg;
      } else if (clientL.includes('condomínio') || clientL.includes('condominio')) {
        mappedSeg = 'B2B — Condomínio';
      } else if (clientL.includes('empresa') || clientL.includes('clínica') || clientL.includes('clinica') || clientL.includes('shopping') || clientL.includes('indústria') || clientL.includes('industria') || clientL.includes('grupo')) {
        mappedSeg = 'B2B — Empresa';
      }

      // date object compatibility format as requested { y, m, d }
      let dateObj = { y: 2026, m: 5, d: 9 };
      const dateStr = getEventDateString(ev);
      if (dateStr) {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
          dateObj = {
            y: parseInt(parts[0]),
            m: parseInt(parts[1]) - 1,
            d: parseInt(parts[2])
          };
        }
      }

      return {
        ...ev,
        client: clientName,
        clientName,
        type: mappedType,
        date: dateObj,
        dateStr,
        time: ev.time || '08:00',
        seg: mappedSeg,
        status: mappedStatus,
        obs: ev.obs || ev.notes || 'Sem observações'
      };
    });
  }, [agenda]);

  // Events belonging strictly to the visible week
  const eventsInWeek = useMemo(() => {
    return mappedEvents.filter(ev => weekDayStrings.includes(ev.dateStr));
  }, [mappedEvents, weekDayStrings]);

  // Recalculates cards of summary BASED ONLY on the visible week range
  const summaryCounters = useMemo(() => {
    let total = 0;
    let confirmed = 0;
    let pending = 0;

    eventsInWeek.forEach(ev => {
      total++;
      if (ev.status === 'confirmed') confirmed++;
      if (ev.status === 'pending') pending++;
    });

    return { total, confirmed, pending };
  }, [eventsInWeek]);

  // Order events of the week by date & time for the listing
  const sortedWeekEvents = useMemo(() => {
    return [...eventsInWeek].sort((a, b) => {
      const dateComp = a.dateStr.localeCompare(b.dateStr);
      if (dateComp !== 0) return dateComp;
      return a.time.localeCompare(b.time);
    });
  }, [eventsInWeek]);

  // Active selected event details
  const selectedEvent = useMemo(() => {
    if (!selectedEventId) return null;
    return mappedEvents.find(ev => ev.id === selectedEventId) || null;
  }, [mappedEvents, selectedEventId]);

  // Weekly Navigation Handlers
  const handlePrevWeek = () => {
    const nextRef = new Date(currentDate);
    nextRef.setDate(currentDate.getDate() - 7);
    setCurrentDate(nextRef);
    setSelectedEventId(null); // Close detail panel as requested on week change
  };

  const handleNextWeek = () => {
    const nextRef = new Date(currentDate);
    nextRef.setDate(currentDate.getDate() + 7);
    setCurrentDate(nextRef);
    setSelectedEventId(null); // Close detail panel as requested on week change
  };

  // Confirm Service State transitions
  const handleConfirmService = (evId: string) => {
    const originalEv = agenda.find(e => e.id === evId);
    
    // Call system store callback for full stack reconciliation (inventory, financial) if this is linked to a quote
    if (originalEv && originalEv.quoteId) {
      const quote = quotes?.list?.find(q => q.id === originalEv.quoteId);
      confirmServiceExecuted(
        originalEv.quoteId, 
        quote?.scheduledTechnician || 'Carlos Barbosa', 
        originalEv.notes || 'Executado e verificado no fluxo de agenda'
      );
    }
    
    // Update local agenda event status
    updateAgendaEvent(evId, { status: 'confirmado' });
    toast.success('Serviço confirmado e consolidado com sucesso!');
  };

  // Cancel Service State transitions
  const handleCancelService = (evId: string) => {
    updateAgendaEvent(evId, { status: 'cancelado' as any });
    toast.error('O status do serviço foi alterado para Cancelado.');
  };

  // Save new manually scheduled service
  const handleSaveNewService = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formClient.trim()) {
      toast.error('Por favor, informe o nome do cliente.');
      return;
    }
    if (!formDate) {
      toast.error('Por favor, selecione uma data para o serviço.');
      return;
    }

    const eventId = `ev-${Math.random().toString(36).substring(2, 11)}`;
    const newService: AgendaEvent & any = {
      id: eventId,
      title: `OS - ${formServiceType} (${formClient})`,
      clientName: formClient,
      client: formClient,
      date: formDate,
      time: formTime,
      type: formServiceType === 'Manutenção (retorno)' ? 'retorno' : 'servico',
      serviceType: formServiceType,
      seg: formSegment,
      status: 'pendente',
      notes: formObs,
      obs: formObs
    };

    addAgendaEvent(newService);
    setIsModalOpen(false);
    
    // Navigate week to the newly chosen date to satisfy: "a semana navega para a data escolhida"
    const chosenDate = new Date(formDate + 'T12:00:00');
    setCurrentDate(chosenDate);
    
    // Automatically select the newly created event details
    setSelectedEventId(eventId);
    
    toast.success('Novo serviço agendado com sucesso!');
    
    // Reset inputs
    setFormClient('');
    setFormObs('');
  };

  return (
    <div className="space-y-6 pt-2 pb-12 px-6 bg-zinc-50/50 min-h-screen">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div>
          <h1 className="text-xl font-black font-sans text-zinc-900 tracking-tight flex items-center gap-2">
            <Calendar className="size-5.5 text-[#1D9E75]" /> Agenda & Serviços
          </h1>
          <p className="text-xs text-zinc-500 font-medium">
            Visualize a grade semanal de controle tático, agende re-chamados e emita baixas operacionais integradas.
          </p>
        </div>
        <button
          id="btn-novoservico-agenda"
          onClick={() => {
            setFormDate(currentDate.toISOString().split('T')[0]);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-1.5 h-11 px-5 bg-[#1D9E75] hover:bg-[#157959] text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
        >
          <Plus className="size-4" /> Novo Serviço
        </button>
      </div>

      {/* CORE COLUMNS CONTAINER */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* COLUNA PRINCIPAL (ESQUERDA): CALENDÁRIO SEMANAL */}
        <div className="flex-1 space-y-4">
          <div className="bg-white border border-zinc-200 p-4.5 rounded-2xl shadow-xs space-y-4">
            
            {/* Calendar Navigation Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-semana-anterior"
                  onClick={handlePrevWeek}
                  className="p-2 border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer"
                  title="Semana Anterior"
                >
                  <ChevronLeft className="size-4 text-zinc-700" />
                </button>
                <button
                  id="btn-semana-proxima"
                  onClick={handleNextWeek}
                  className="p-2 border border-zinc-200 hover:bg-zinc-50 rounded-xl transition-colors cursor-pointer"
                  title="Próxima Semana"
                >
                  <ChevronRight className="size-4 text-zinc-700" />
                </button>
              </div>

              <div id="intervalo-semanal" className="text-sm font-black text-zinc-800 uppercase tracking-wide">
                {formattedWeekRange}
              </div>

              <button
                id="btn-semana-hoje"
                onClick={() => setCurrentDate(new Date(2026, 5, 9))}
                className="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-50 text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
              >
                Voltar a Hoje
              </button>
            </div>

            {/* Weekly Grid Calendar View */}
            <div className="overflow-x-auto border border-zinc-250/70 rounded-xl">
              <div className="min-w-[850px] grid grid-cols-8 divide-x divide-zinc-200 bg-zinc-50/20">
                
                {/* Time Axis Column Header */}
                <div className="p-3 bg-zinc-50 border-b border-zinc-200 flex items-center justify-center text-center">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Horário</span>
                </div>

                {/* 7 Day Column Headers */}
                {weekDays.map((dateItem, idx) => {
                  const todayStr = new Date().toISOString().split('T')[0];
                  // Let's pretend today is June 9, 2026 matching our system timer
                  const isToday = dateItem.getDate() === 9 && dateItem.getMonth() === 5 && dateItem.getFullYear() === 2026;
                  
                  return (
                    <div key={idx} className="p-3 bg-zinc-50 border-b border-zinc-200 flex flex-col items-center justify-center text-center gap-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-[#6B6B5F]">{DAYS_OF_WEEK_NAMES[idx]}</span>
                      <span className={`text-xs font-black size-7.5 flex items-center justify-center rounded-full transition-all
                        ${isToday ? 'bg-[#1D9E75] text-white shadow-xs font-bold' : 'text-zinc-800'}`}
                      >
                        {dateItem.getDate()}
                      </span>
                    </div>
                  );
                })}

                {/* Vertical Slots / Interactive Grid Area */}
                {HOURS.map(hourSlot => {
                  const hourHour = hourSlot.split(':')[0];
                  return (
                    <React.Fragment key={hourSlot}>
                      {/* Hour Axis row item */}
                      <div className="h-18 p-1.5 flex items-center justify-center border-b border-zinc-150/80 bg-zinc-50/50">
                        <span className="font-mono text-[10px] font-black text-zinc-400 flex items-center gap-1">
                          <Clock className="size-3" /> {hourSlot}
                        </span>
                      </div>

                      {/* 7 Days cells for this current hour */}
                      {weekDays.map((dateDay, dIdx) => {
                        const dateStr = dateDay.toISOString().split('T')[0];
                        
                        // Find events running during this hour of this day
                        const cellEvents = eventsInWeek.filter(ev => {
                          const evYmd = ev.dateStr;
                          const evHour = ev.time.split(':')[0];
                          return evYmd === dateStr && evHour === hourHour;
                        });

                        return (
                          <div
                            key={dIdx}
                            className="h-18 p-1 border-b border-zinc-150/80 bg-white hover:bg-zinc-50/40 transition-colors relative"
                          >
                            {cellEvents.map(ev => {
                              const isSelected = ev.id === selectedEventId;
                              
                              let statusClass = 'bg-amber-50 text-amber-900 border-[#EF9F27] border-l-4';
                              if (ev.status === 'confirmed') {
                                statusClass = 'bg-emerald-50 text-[#1D9E75] border-[#1D9E75] border-l-4';
                              } else if (ev.status === 'cancelled') {
                                statusClass = 'bg-red-50 text-red-900 line-through';
                              }

                              return (
                                <button
                                  key={ev.id}
                                  id={`cal-event-${ev.id}`}
                                  onClick={() => setSelectedEventId(ev.id)}
                                  className={`w-full h-full p-1.5 rounded-lg text-left text-[9.5px] font-black leading-tight flex flex-col justify-between transition-all overflow-hidden select-none cursor-pointer
                                    ${statusClass}
                                    ${isSelected ? 'ring-2 ring-emerald-600 shadow-xs scale-[0.98]' : 'hover:scale-[1.01] hover:shadow-2xs'}
                                  `}
                                >
                                  <span className="truncate font-black">{ev.clientName}</span>
                                  <span className="text-[8px] font-bold opacity-80 truncate block">{ev.time} — {ev.type}</span>
                                </button>
                              );
                            })}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}

              </div>
            </div>

          </div>
        </div>

        {/* COLUNA LATERIAL (DIREITA, 300px): CARDS RESUMO + LISTA + DETALHES */}
        <div className="w-full xl:w-[320px] shrink-0 space-y-5">
          
          {/* 1. CARDS DE RESUMO (3 colunas): Total / Confirmados / Pendentes */}
          <div className="grid grid-cols-3 gap-2.5">
            {/* Total */}
            <div id="stat-semana-total" className="bg-white border border-zinc-200 p-2.5 rounded-xl text-center space-y-0.5 shadow-2xs">
              <span className="text-[8.5px] font-black text-zinc-400 uppercase tracking-widest block">Total</span>
              <p className="text-lg font-black text-zinc-900">{summaryCounters.total}</p>
            </div>
            {/* Confirmados */}
            <div id="stat-semana-confirmado" className="bg-[#E8F4EE] border border-[#1D9E75]/20 p-2.5 rounded-xl text-center space-y-0.5 shadow-2xs">
              <span className="text-[8.5px] font-black text-emerald-800 uppercase tracking-widest block">Confirmados</span>
              <p className="text-lg font-black text-[#1D9E75]">{summaryCounters.confirmed}</p>
            </div>
            {/* Pendentes */}
            <div id="stat-semana-pendente" className="bg-amber-50 border border-[#EF9F27]/20 p-2.5 rounded-xl text-center space-y-0.5 shadow-2xs">
              <span className="text-[8.5px] font-black text-amber-800 uppercase tracking-widest block">Pendentes</span>
              <p className="text-lg font-black text-[#EF9F27]">{summaryCounters.pending}</p>
            </div>
          </div>

          {/* 2. LISTA DE SERVIÇOS DA SEMANA */}
          <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs space-y-3">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block border-b border-zinc-100 pb-2">
              Serviços da Semana
            </span>

            <div id="lista-semana-scroller" className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {sortedWeekEvents.length === 0 ? (
                <div className="text-center py-6 text-zinc-400 text-[10px] font-bold">
                  Nenhum serviço agendado para esta semana.
                </div>
              ) : (
                sortedWeekEvents.map(ev => {
                  const isSelected = ev.id === selectedEventId;
                  const dayName = getDayOfWeekName(ev.dateStr);

                  let statusBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                  if (ev.status === 'confirmed') {
                    statusBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                  } else if (ev.status === 'cancelled') {
                    statusBadgeColor = 'bg-red-50 text-red-800 border-red-200';
                  }

                  return (
                    <div
                      key={ev.id}
                      id={`list-item-${ev.id}`}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all space-y-1.5 select-none
                        ${isSelected 
                          ? 'bg-[#E8F4EE]/50 border-[#1D9E75] ring-1 ring-[#1D9E75]/30' 
                          : 'bg-white hover:bg-zinc-50 border-zinc-200'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] text-zinc-400 font-bold block">{dayName} — {ev.time}</span>
                        <span className={`text-[7.5px] font-black px-1.5 py-0.5 rounded border ${statusBadgeColor}`}>
                          {ev.status === 'confirmed' ? 'Confirmado' : ev.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                        </span>
                      </div>
                      <h4 className="text-[11px] font-bold text-zinc-900 truncate leading-tight">
                        {ev.clientName}
                      </h4>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. PAINEL DE DETALHES */}
          <div className="bg-white border border-zinc-200 p-4 rounded-xl shadow-xs space-y-4">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block border-b border-zinc-100 pb-2">
              Detalhes do Serviço
            </span>

            {!selectedEvent ? (
              <div id="detalhes-placeholder-sidebar" className="text-center py-12 text-zinc-400 space-y-2">
                <HelpCircle className="size-8 mx-auto text-zinc-300 stroke-[1.5]" />
                <p className="text-[10.5px] font-black text-zinc-700">Nenhum Serviço Selecionado</p>
                <p className="text-[9.5px] text-zinc-400 leading-normal max-w-[200px] mx-auto">
                  Clique em um serviço na lista ou no calendário para exibir os dados de controle operacional e faturamento.
                </p>
              </div>
            ) : (
              <div id="detalhes-conteudo" className="text-left space-y-3.5 text-xs">
                {/* Cliente */}
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Cliente</span>
                  <div className="font-sans font-bold text-zinc-800 flex items-center gap-1">
                    <User className="size-3.5 text-zinc-400 shrink-0" />
                    <span className="truncate">{selectedEvent.clientName}</span>
                  </div>
                </div>

                {/* Tipo de controle */}
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Tipo de Serviço</span>
                  <div className="font-bold text-zinc-700 flex items-center gap-1">
                    <Briefcase className="size-3.5 text-[#1D9E75] shrink-0" />
                    <span>{selectedEvent.type}</span>
                  </div>
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Data</span>
                    <div className="font-bold text-zinc-700">
                      {formatDateStr(selectedEvent.dateStr)}
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Horário</span>
                    <div className="font-bold text-zinc-700">
                      {selectedEvent.time}
                    </div>
                  </div>
                </div>

                {/* Segmento */}
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Segmento Comercial</span>
                  <div className="font-bold text-zinc-600 block">
                    {selectedEvent.seg}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Status</span>
                  <div className="pt-0.5">
                    <span className={`inline-flex items-center gap-1 text-[8.5px] font-black px-2 py-0.5 rounded border
                      ${selectedEvent.status === 'confirmed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 
                        selectedEvent.status === 'cancelled' ? 'bg-red-50 text-red-800 border-red-200' : 
                        'bg-amber-50 text-amber-800 border-amber-200'}`}>
                      <span className={`size-1.5 rounded-full ${selectedEvent.status === 'confirmed' ? 'bg-[#1D9E75]' : 
                        selectedEvent.status === 'cancelled' ? 'bg-red-600' : 'bg-[#EF9F27]'}`} />
                      {selectedEvent.status === 'confirmed' ? 'Confirmado' : selectedEvent.status === 'cancelled' ? 'Cancelado' : 'Pendente'}
                    </span>
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Observações</span>
                  <p className="text-[10.5px] bg-zinc-50 border border-zinc-150 p-2 rounded-lg font-semibold text-zinc-600">
                    {selectedEvent.obs}
                  </p>
                </div>

                {/* Actions Panel Buttons */}
                <div className="pt-2.5 border-t border-zinc-150 space-y-2">
                  {selectedEvent.status === 'pending' && (
                    <button
                      id="btn-detalhes-confirmar"
                      onClick={() => handleConfirmService(selectedEvent.id)}
                      className="w-full flex items-center justify-center gap-1.5 h-10 px-4 bg-[#1D9E75] hover:bg-[#157959] text-white text-[10.5px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs"
                    >
                      <Check className="size-4" /> Confirmar Serviço
                    </button>
                  )}
                  {selectedEvent.status !== 'cancelled' && (
                    <button
                      id="btn-detalhes-cancelar"
                      onClick={() => handleCancelService(selectedEvent.id)}
                      className="w-full flex items-center justify-center gap-1.5 h-10 px-4 border border-zinc-250 hover:bg-red-50/50 text-rose-700 text-[10.5px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Cancelar Serviço
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ADICIONAR NOVA ESCALA OPERACIONAL MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            id="modal-overlay-agenda"
            onClick={() => setIsModalOpen(false)} // Close modal clicking outside as requested
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()} // Stop propagation to preserve clicks inside as requested
              className="bg-white border border-zinc-200 rounded-2xl max-w-md w-full overflow-hidden shadow-xl"
            >
              {/* Modal Header */}
              <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between text-left">
                <div>
                  <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                    Agendar Atividade Operacional
                  </h3>
                  <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                    Preencha os campos para agendar uma nova escala de controle químico.
                  </p>
                </div>
                <button
                  id="btn-close-modal"
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 hover:bg-zinc-50 border border-zinc-200 rounded-lg cursor-pointer"
                >
                  <X className="size-4 text-zinc-400" />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveNewService} className="p-5 space-y-4 text-left">
                {/* Cliente */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                    Cliente / Razão Social <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-input-cliente"
                    type="text"
                    required
                    placeholder="Ex: Condomínio Garden Center"
                    value={formClient}
                    onChange={(e) => setFormClient(e.target.value)}
                    className="w-full h-10 border border-zinc-250/85 rounded-xl px-3 text-xs font-bold focus:outline-none focus:border-[#1D9E75] bg-white transition-all text-zinc-800"
                  />
                </div>

                {/* Tipo de serviço */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">
                    Tipo de Serviço
                  </label>
                  <select
                    id="modal-select-type"
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value)}
                    className="w-full h-10 border border-zinc-250/85 rounded-xl px-3 text-xs font-bold focus:outline-none focus:border-[#1D9E75] bg-white transition-all text-zinc-800"
                  >
                    <option value="Dedetização">Dedetização</option>
                    <option value="Desratização">Desratização</option>
                    <option value="Descupinização">Descupinização</option>
                    <option value="Sanitização">Sanitização</option>
                    <option value="Manutenção (retorno)">Manutenção (retorno)</option>
                  </select>
                </div>

                {/* Data e Horário */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-1">
                      Data <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="modal-input-data"
                      type="date"
                      required
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full h-10 border border-zinc-250/85 rounded-xl px-3 text-xs font-bold focus:outline-none focus:border-[#1D9E75] bg-white transition-all text-zinc-800"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">
                      Horário
                    </label>
                    <select
                      id="modal-select-time"
                      value={formTime}
                      onChange={(e) => setFormTime(e.target.value)}
                      className="w-full h-10 border border-zinc-250/85 rounded-xl px-3 text-xs font-bold focus:outline-none focus:border-[#1D9E75] bg-white transition-all text-zinc-800"
                    >
                      {HOURS.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Segmento */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">
                    Segmento
                  </label>
                  <select
                    id="modal-select-seg"
                    value={formSegment}
                    onChange={(e) => setFormSegment(e.target.value)}
                    className="w-full h-10 border border-zinc-250/85 rounded-xl px-3 text-xs font-bold focus:outline-none focus:border-[#1D9E75] bg-white transition-all text-zinc-800"
                  >
                    <option value="B2B — Condomínio">B2B — Condomínio</option>
                    <option value="B2B — Empresa">B2B — Empresa</option>
                    <option value="B2C — Residencial">B2C — Residencial</option>
                  </select>
                </div>

                {/* Observações */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">
                    Observações Livres
                  </label>
                  <textarea
                    id="modal-textarea-obs"
                    rows={3}
                    placeholder="E.g. Portão lateral aberto a partir das 07h, focar frestas de esgoto."
                    value={formObs}
                    onChange={(e) => setFormObs(e.target.value)}
                    className="w-full border border-zinc-250/85 rounded-xl p-3 text-xs font-bold focus:outline-none focus:border-[#1D9E75] bg-white transition-all text-zinc-800"
                  />
                </div>

                {/* Submit Controls */}
                <div className="flex gap-2.5 pt-2">
                  <button
                    id="btn-modal-cancel"
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 h-10 border border-zinc-200 hover:bg-zinc-50 text-[10.5px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer text-center text-zinc-700"
                  >
                    Voltar
                  </button>
                  <button
                    id="btn-modal-submit"
                    type="submit"
                    className="flex-1 h-10 bg-[#1D9E75] hover:bg-[#157959] text-white text-[10.5px] font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-xs text-center"
                  >
                    Salvar Serviço
                  </button>
                </div>

              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper to get formatted day of week from YYYY-MM-DD
function getDayOfWeekName(dateStr: string) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  return DAYS_OF_WEEK_NAMES[d.getDay()];
}

// Helper for formatting YYYY-MM-DD back into user readable format
function formatDateStr(dateStr: string) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  return dateStr;
}
