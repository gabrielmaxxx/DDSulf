import React, { useState, useMemo } from 'react';
import { useSystemStore, AgendaEvent } from '@/store/systemStore';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  Clock, 
  MapPin, 
  User, 
  List, 
  Grid, 
  SearchX, 
  X, 
  Search, 
  AlertTriangle,
  HelpCircle,
  FileText,
  CalendarDays,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// Color definitions based on event type
const TYPE_COLORS: Record<AgendaEvent['type'], { bg: string; text: string; border: string; dot: string; label: string }> = {
  servico: {
    bg: 'bg-blue-50/80 hover:bg-blue-50',
    text: 'text-blue-800',
    border: 'border-blue-100',
    dot: 'bg-blue-500',
    label: 'Serviço'
  },
  retorno: {
    bg: 'bg-orange-50/80 hover:bg-orange-50',
    text: 'text-orange-800',
    border: 'border-orange-100',
    dot: 'bg-orange-500',
    label: 'Retorno'
  },
  recorrencia: {
    bg: 'bg-purple-50/80 hover:bg-purple-50',
    text: 'text-purple-800',
    border: 'border-purple-100',
    dot: 'bg-purple-500',
    label: 'Recorrência'
  },
  visita: {
    bg: 'bg-emerald-50/80 hover:bg-emerald-50',
    text: 'text-emerald-800',
    border: 'border-emerald-100',
    dot: 'bg-emerald-500',
    label: 'Visita'
  },
  outro: {
    bg: 'bg-slate-50/80 hover:bg-slate-50',
    text: 'text-slate-800',
    border: 'border-slate-100',
    dot: 'bg-slate-500',
    label: 'Outro'
  }
};

const STATUS_LABELS: Record<AgendaEvent['status'], { label: string; text: string; bg: string }> = {
  confirmado: { label: 'Confirmado', text: 'text-blue-700', bg: 'bg-blue-50' },
  pendente: { label: 'Pendente', text: 'text-amber-700', bg: 'bg-amber-50' },
  realizado: { label: 'Realizado', text: 'text-[#1B3A2D]', bg: 'bg-[#E8F4EE]' }
};

export function AgendaPage() {
  const { 
    agenda, 
    addAgendaEvent, 
    updateAgendaEvent, 
    removeAgendaEvent 
  } = useSystemStore();

  const events: (AgendaEvent & { address?: string })[] = (agenda || []) as any;

  // View settings
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 5, 5)); // Prefilled to June 2026 to fit the 2026-06-05 timeline

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modal active states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Form field states
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formType, setFormType] = useState<AgendaEvent['type']>('servico');
  const [formStatus, setFormStatus] = useState<AgendaEvent['status']>('pendente');
  const [formClientName, setFormClientName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Delete confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Focus on a specific day via calendar to view its events or quickly add
  const [focusedDayDateStr, setFocusedDayDateStr] = useState<string | null>(null);

  // Months of Year
  const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Current view context month/year
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Helper: Format ISO Dates cleanly
  const formatBrazilianDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  // Helper: Prev/Next month logic
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setFocusedDayDateStr(null);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setFocusedDayDateStr(null);
  };

  const handleToday = () => {
    const today = new Date();
    // Force to 2026-06 if today is too different, to align with system presets, but let's keep the real Date matching system context
    setCurrentDate(new Date(2026, 5, 5));
    setFocusedDayDateStr(null);
  };

  // Safe checks & computations
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      // search match
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        e.title.toLowerCase().includes(searchLower) ||
        (e.clientName && e.clientName.toLowerCase().includes(searchLower)) ||
        (e.notes && e.notes.toLowerCase().includes(searchLower)) ||
        (e.address && e.address.toLowerCase().includes(searchLower));

      // type match
      const matchType = typeFilter === 'all' || e.type === typeFilter;

      // status match
      const matchStatus = statusFilter === 'all' || e.status === statusFilter;

      return matchSearch && matchType && matchStatus;
    });
  }, [events, searchTerm, typeFilter, statusFilter]);

  // KPIs
  const kpis = useMemo(() => {
    const currentMonthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    
    // Total of selected month/year
    const monthEvents = events.filter(e => e.date.startsWith(currentMonthPrefix));

    const totalInMonth = monthEvents.length;
    const pendentes = monthEvents.filter(e => e.status === 'pendente').length;
    const realizados = monthEvents.filter(e => e.status === 'realizado').length;
    const retornos = monthEvents.filter(e => e.type === 'retorno').length;

    return {
      totalInMonth,
      pendentes,
      realizados,
      retornos
    };
  }, [events, year, month]);

  // Calendar Day Grid Logic
  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay(); // 0-Sunday to 6-Saturday
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      day: number;
      dateString: string;
      isCurrentMonth: boolean;
      eventsThisDay: (AgendaEvent & { address?: string })[];
    }[] = [];

    // Fill previous month days
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDay = daysInPrevMonth - i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateString = `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(prevDay).padStart(2, '0')}`;
      
      const dayEvents = events.filter(e => e.date === dateString);

      cells.push({
        day: prevDay,
        dateString,
        isCurrentMonth: false,
        eventsThisDay: dayEvents
      });
    }

    // Fill current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateString);

      cells.push({
        day: d,
        dateString,
        isCurrentMonth: true,
        eventsThisDay: dayEvents
      });
    }

    // Fill next month days to complete multi-row grid (usually 42 cells or matching multiple of 7)
    const totalRemaining = 42 - cells.length;
    for (let n = 1; n <= totalRemaining; n++) {
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateString = `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(n).padStart(2, '0')}`;
      const dayEvents = events.filter(e => e.date === dateString);

      cells.push({
        day: n,
        dateString,
        isCurrentMonth: false,
        eventsThisDay: dayEvents
      });
    }

    return cells;
  }, [events, year, month]);

  // Events of focused day from calendar (if any clicked/selected)
  const focusedDayEvents = useMemo(() => {
    if (!focusedDayDateStr) return [];
    return filteredEvents.filter(e => e.date === focusedDayDateStr);
  }, [filteredEvents, focusedDayDateStr]);

  // Modal actions handlers
  const openCreateModal = (prefilledDate?: string) => {
    setModalMode('create');
    setSelectedEventId(null);
    setFormTitle('');
    setFormDate(prefilledDate || new Date().toISOString().split('T')[0]);
    setFormTime('');
    setFormType('servico');
    setFormStatus('pendente');
    setFormClientName('');
    setFormAddress('');
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (event: AgendaEvent & { address?: string }) => {
    setModalMode('edit');
    setSelectedEventId(event.id);
    setFormTitle(event.title);
    setFormDate(event.date);
    setFormTime(event.time || '');
    setFormType(event.type);
    setFormStatus(event.status);
    setFormClientName(event.clientName || '');
    setFormAddress(event.address || '');
    setFormNotes(event.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('Título obrigatório', { description: 'Por favor, ensira um título explicativo para o evento.' });
      return;
    }
    if (!formDate) {
      toast.error('Data obrigatória', { description: 'Por favor, indique o dia do agendamento.' });
      return;
    }

    const eventPayload: AgendaEvent & { address?: string } = {
      id: modalMode === 'edit' && selectedEventId ? selectedEventId : `ev-${Math.random().toString(36).substring(2, 11)}`,
      title: formTitle,
      date: formDate,
      time: formTime || undefined,
      type: formType,
      status: formStatus,
      clientName: formClientName || 'Cliente Geral',
      address: formAddress || undefined,
      notes: formNotes || undefined
    };

    if (modalMode === 'edit' && selectedEventId) {
      updateAgendaEvent(selectedEventId, eventPayload);
      toast.success('Evento Atualizado!', { description: `O compromisso "${formTitle}" foi ajustado.` });
    } else {
      addAgendaEvent(eventPayload);
      toast.success('Evento Agendado!', { description: `Novo compromisso criado para o dia ${formatBrazilianDate(formDate)}.` });
    }

    setIsModalOpen(false);
  };

  const handleQuickComplete = (id: string, title: string) => {
    updateAgendaEvent(id, { status: 'realizado' });
    toast.success('Serviço Concluído!', { description: `"${title}" foi marcado como realizado.` });
  };

  const handleDeleteEvent = (id: string, title: string) => {
    removeAgendaEvent(id);
    setConfirmDeleteId(null);
    toast.success('Removido com sucesso', { description: `Compromisso "${title}" cancelado da escala.` });
  };

  // Grouped filtered list for List View
  const groupedList = useMemo(() => {
    const groups: Record<string, (AgendaEvent & { address?: string })[]> = {};
    
    // Sort chronologically
    const sorted = [...filteredEvents].sort((a, b) => {
      const compareDates = a.date.localeCompare(b.date);
      if (compareDates !== 0) return compareDates;
      return (a.time || '').localeCompare(b.time || '');
    });

    sorted.forEach(e => {
      if (!groups[e.date]) {
        groups[e.date] = [];
      }
      groups[e.date].push(e);
    });

    return Object.entries(groups).map(([date, items]) => ({
      date,
      items
    }));
  }, [filteredEvents]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      
      {/* HEADER */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-[#2D6A4F] text-xs font-bold uppercase tracking-wider block">DDSULF OPERACIONAL</span>
          <h1 className="font-display text-2.5xl font-black text-[#141410] mt-1 uppercase tracking-tight">Escala & Agenda de Serviços</h1>
          <p className="text-xs text-[#6B6B5F] mt-0.5">Calendário dinâmico, monitoramento de prazos recorrentes e ordens de serviços integradas.</p>
        </div>
        <button 
          onClick={() => openCreateModal()}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3A2D] text-white 
                             text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#2D6A4F] transition-all cursor-pointer shadow-sm shrink-0"
        >
          <Plus className="size-4" /> Novo Compromisso
        </button>
      </header>

      {/* KPI CARDS */}
      <div className="grid gap-6 sm:grid-cols-4">
        <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black text-[#6B6B5F] uppercase tracking-wider">Total do Mês</span>
            <p className="text-2xl font-display font-black text-[#141410]">{kpis.totalInMonth}</p>
            <p className="text-[10px] text-[#2D6A4F] font-bold font-sans">Agendados em {MONTHS[month]}</p>
          </div>
          <div className="size-11 rounded-xl bg-slate-50 flex items-center justify-center text-slate-800 border border-[#E8E6E1]">
            <CalendarDays className="size-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black text-[#6B6B5F] uppercase tracking-wider">Pendentes</span>
            <p className="text-2xl font-display font-black text-amber-700">{kpis.pendentes}</p>
            <p className="text-[10px] text-[#6B6B5F] font-bold font-sans">Aguardando atendimento</p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200">
            <Clock className="size-5 animate-pulse" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black text-[#6B6B5F] uppercase tracking-wider">Realizados</span>
            <p className="text-2xl font-display font-black text-[#1B3A2D]">{kpis.realizados}</p>
            <p className="text-[10px] text-[#2D6A4F] font-bold font-sans">Concluídos com sucesso</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#1B3A2D] border border-emerald-200">
            <CheckCircle2 className="size-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black text-[#6B6B5F] uppercase tracking-wider">Retornos Garantia</span>
            <p className="text-2xl font-display font-black text-orange-700">{kpis.retornos}</p>
            <p className="text-[10px] text-[#6B6B5F] font-bold font-sans">Reaplicações sem custo</p>
          </div>
          <div className="size-11 rounded-xl bg-orange-50 flex items-center justify-center text-orange-700 border border-orange-200">
            <AlertTriangle className="size-5" />
          </div>
        </div>
      </div>

      {/* FILTER CONTROLS & VIEW TOGGLE */}
      <div className="bg-white border border-[#E8E6E1] p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-[#6B6B5F]" />
          <input
            type="text"
            placeholder="Buscar por cliente, título..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg pl-9 pr-4 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
          />
        </div>

        {/* Categories/Status filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
            >
              <option value="all">TODOS OS TIPOS</option>
              <option value="servico">SERVIÇO</option>
              <option value="retorno">RETORNO</option>
              <option value="recorrencia">RECORRÊNCIA</option>
              <option value="visita">VISITA TÉCNICA</option>
              <option value="outro">OUTROS</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
            >
              <option value="all">TODOS OS STATUS</option>
              <option value="confirmado">CONFIRMADO</option>
              <option value="pendente">PENDENTE</option>
              <option value="realizado">REALIZADO</option>
            </select>
          </div>

          {/* Separator */}
          <div className="hidden md:block w-[1px] h-6 bg-[#E8E6E1]" />

          {/* Mode Switch Button */}
          <div className="flex gap-1 bg-[#F0EDE8] p-1 rounded-lg">
            <button
              onClick={() => { setViewMode('calendar'); setFocusedDayDateStr(null); }}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'calendar' ? 'bg-[#1B3A2D] text-white' : 'text-[#6B6B5F] hover:text-[#141410]'}`}
              title="Visão de Calendário"
            >
              <Grid className="size-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === 'list' ? 'bg-[#1B3A2D] text-white' : 'text-[#6B6B5F] hover:text-[#141410]'}`}
              title="Visão de Lista"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SWAPPING VIEWS */}
      <AnimatePresence mode="wait">
        
        {/* VIEW 1: MONTHLY CALENDAR */}
        {viewMode === 'calendar' && (
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Left Block: Full Month Grid */}
            <div className="lg:col-span-2 bg-white border border-[#E8E6E1] rounded-2xl p-6 space-y-6">
              
              {/* Calendar control bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="size-5 text-[#1B3A2D]" />
                  <h3 className="font-display font-black text-sm uppercase tracking-tight text-[#141410]">
                    {MONTHS[month]} <span className="text-[#6B6B5F] font-sans font-normal">{year}</span>
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToday}
                    className="px-3 py-1.5 border border-[#E8E6E1] rounded-lg text-[9px] font-black uppercase tracking-wider text-[#141410] hover:bg-[#FAF9F6] cursor-pointer"
                  >
                    HOJE
                  </button>
                  <button
                    onClick={handlePrevMonth}
                    className="p-1.5 border border-[#E8E6E1] rounded-lg text-[#141410] hover:bg-[#FAF9F6] cursor-pointer"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-1.5 border border-[#E8E6E1] rounded-lg text-[#141410] hover:bg-[#FAF9F6] cursor-pointer"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                </div>
              </div>

              {/* Grid System */}
              <div className="space-y-1">
                {/* Column Headers */}
                <div className="grid grid-cols-7 gap-1 text-center border-b border-[#FAF9F6] pb-2">
                  {DAYS_OF_WEEK.map(dayLabel => (
                    <div key={dayLabel} className="text-[10px] font-black text-[#6B6B5F] uppercase tracking-wider">
                      {dayLabel}
                    </div>
                  ))}
                </div>

                {/* Day Blocks */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarCells.map((cell, idx) => {
                    const isToday = cell.dateString === '2026-06-05'; // Real local simulated system date
                    const isFocused = cell.dateString === focusedDayDateStr;

                    return (
                      <div
                        key={`${cell.dateString}-${idx}`}
                        onClick={() => setFocusedDayDateStr(cell.dateString)}
                        className={`min-h-[85px] p-1.5 rounded-xl border flex flex-col justify-between transition-all cursor-pointer ${
                          cell.isCurrentMonth 
                            ? 'bg-white text-[#141410]' 
                            : 'bg-[#FAF9F6]/60 text-[#9E9E90] border-transparent'
                        } ${
                          isToday 
                            ? 'ring-2 ring-inset ring-[#D4A017] border-transparent' 
                            : isFocused 
                              ? 'border-[#1B3A2D] bg-[#E8F4EE]/50'
                              : 'border-[#E8E6E1]/70'
                        } hover:border-[#141410]`}
                      >
                        {/* Day indicator header */}
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-bold ${isToday ? 'bg-[#D4A017] text-slate-900 px-1.5 py-0.5 rounded-md font-black' : ''}`}>
                            {cell.day}
                          </span>
                          
                          {/* Circle for quick actions if day has events */}
                          {cell.eventsThisDay.length > 0 && (
                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-[#FAF9F6] border border-[#E8E6E1] rounded-full text-[#6B6B5F]">
                              {cell.eventsThisDay.length}
                            </span>
                          )}
                        </div>

                        {/* List tiny events preview */}
                        <div className="mt-1 space-y-0.5 max-h-[50px] overflow-hidden flex-1 flex flex-col justify-end">
                          {cell.eventsThisDay.slice(0, 2).map(ev => {
                            const config = TYPE_COLORS[ev.type] || TYPE_COLORS.outro;
                            const isRealizado = ev.status === 'realizado';

                            return (
                              <div
                                key={ev.id}
                                className={`text-[8px] px-1 py-0.5 rounded-md font-bold truncate tracking-wide border ${config.bg} ${config.text} ${config.border} ${isRealizado ? 'line-through opacity-60' : ''}`}
                                title={`${ev.title} - ${ev.clientName}`}
                              >
                                {ev.time ? `${ev.time} ` : ''}{ev.clientName || ev.title}
                              </div>
                            );
                          })}
                          {cell.eventsThisDay.length > 2 && (
                            <div className="text-[7px] text-[#6B6B5F] font-bold text-center">
                              +{cell.eventsThisDay.length - 2} mais
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Instructions */}
              <div className="text-[10px] text-[#6B6B5F] bg-[#FAF9F6] p-3 rounded-xl flex items-center gap-2">
                <span className="text-[#D4A017]">💡</span>
                <span>Role ou clique em qualquer dia do calendário acima para filtrar ou gerenciar em tempo real os compromissos agendados.</span>
              </div>
            </div>

            {/* Right Block: Selected day details / Side panel list */}
            <div className="space-y-6">
              
              <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl space-y-4">
                
                {/* Panel title */}
                <div className="flex items-center justify-between border-b border-[#FAF9F6] pb-3">
                  <div>
                    <h4 className="font-display font-black text-xs uppercase text-[#141410]">Agendamento Diário</h4>
                    <p className="text-[10px] text-[#6B6B5F] mt-0.5">
                      {focusedDayDateStr ? `Compromissos para ${formatBrazilianDate(focusedDayDateStr)}` : 'Selecione um dia no calendário'}
                    </p>
                  </div>
                  {focusedDayDateStr && (
                    <button
                      onClick={() => openCreateModal(focusedDayDateStr)}
                      className="flex items-center gap-1 bg-[#1B3A2D] text-white px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider hover:bg-[#2D6A4F] cursor-pointer"
                    >
                      <Plus className="size-3" /> Add OS
                    </button>
                  )}
                </div>

                {/* Day events render */}
                {!focusedDayDateStr ? (
                  <div className="py-12 text-center text-[#6B6B5F] space-y-2">
                    <CalendarDays className="size-8 mx-auto opacity-30 text-[#6B6B5F]" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Clique em um dia na grade ao lado</p>
                    <p className="text-[10px] max-w-xs mx-auto">Para visualizar o roteiro, ordens de serviços a serem executadas e observações avançadas.</p>
                  </div>
                ) : focusedDayEvents.length === 0 ? (
                  <div className="py-12 text-center text-[#6B6B5F] space-y-2">
                    <SearchX className="size-8 mx-auto opacity-30 text-[#6B6B5F]" />
                    <p className="text-[10px] font-bold uppercase tracking-wider">Sem tarefas para este dia</p>
                    <button
                      onClick={() => openCreateModal(focusedDayDateStr)}
                      className="px-3 py-1 bg-slate-50 border border-[#E8E6E1] hover:bg-slate-100 rounded-md text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                    >
                      Agendar um Compromisso
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
                    {focusedDayEvents.map(ev => {
                      const colors = TYPE_COLORS[ev.type] || TYPE_COLORS.outro;
                      const statusConf = STATUS_LABELS[ev.status];
                      const isRealizado = ev.status === 'realizado';

                      return (
                        <div
                          key={ev.id}
                          className="p-3.5 rounded-xl border border-[#E8E6E1] bg-[#FAF9F6]/30 space-y-3 hover:border-slate-400 transition-all text-left"
                        >
                          <div className="flex items-start justify-between gap-2.5">
                            <div className="space-y-0.5">
                              <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}>
                                {colors.label}
                              </span>
                              <h5 className={`font-display font-black text-[11px] text-[#141410] uppercase leading-tight pt-1 ${isRealizado ? 'line-through opacity-50' : ''}`}>
                                {ev.title}
                              </h5>
                            </div>
                            
                            {/* Actions menu */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => openEditModal(ev)}
                                className="p-1 rounded-md bg-white border border-[#E8E6E1] hover:border-blue-400 text-blue-800 cursor-pointer transition-all"
                                title="Editar Compromisso"
                              >
                                <Edit2 className="size-3" />
                              </button>
                              
                              {confirmDeleteId === ev.id ? (
                                <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-0.5 rounded-lg">
                                  <button
                                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                                    className="p-1 bg-rose-600 text-white rounded-md cursor-pointer text-[7px]"
                                    title="Confirmar exclusão"
                                  >
                                    <Check className="size-2.5" />
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="p-1 bg-slate-200 text-slate-800 rounded-md cursor-pointer text-[7px]"
                                    title="Cancelar"
                                  >
                                    <X className="size-2.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(ev.id)}
                                  className="p-1 rounded-md bg-white border border-[#E8E6E1] hover:border-rose-400 text-rose-800 cursor-pointer transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 className="size-3" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Customer & Address Details */}
                          <div className="space-y-1 text-[10px] text-[#6B6B5F] font-semibold">
                            <p className="flex items-center gap-1.5">
                              <User className="size-3.5 text-[#9E9E90]" />
                              <span>{ev.clientName}</span>
                            </p>
                            {ev.address && (
                              <p className="flex items-center gap-1.5">
                                <MapPin className="size-3.5 text-[#9E9E90]" />
                                <span className="truncate" title={ev.address}>{ev.address}</span>
                              </p>
                            )}
                            {ev.time && (
                              <p className="flex items-center gap-1.5 font-mono text-[9px] text-[#141410]">
                                <Clock className="size-3.5 text-[#9E9E90]" />
                                <span>{ev.time} Horas</span>
                              </p>
                            )}
                          </div>

                          {ev.notes && (
                            <p className="text-[10px] text-[#5C5C50] bg-white border border-[#E8E6E1]/60 p-2 rounded-lg italic font-medium">
                              "{ev.notes}"
                            </p>
                          )}

                          {/* Quick submit and status */}
                          <div className="flex items-center justify-between pt-1 border-t border-[#FAF9F6]">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusConf?.bg} ${statusConf?.text}`}>
                              • {statusConf?.label}
                            </span>

                            {!isRealizado && (
                              <button
                                onClick={() => handleQuickComplete(ev.id, ev.title)}
                                className="flex items-center gap-1 py-1 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[9px] font-extrabold uppercase tracking-wide rounded-md cursor-pointer transition-all"
                              >
                                <Check className="size-3" /> Marcar Concluído
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* VIEW 2: CHRONOLOGICAL LIST VIEW */}
        {viewMode === 'list' && (
          <motion.div
            key="list-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {groupedList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center gap-4 bg-white border border-[#E8E6E1] rounded-2xl">
                <SearchX className="size-9 text-[#6B6B5F] opacity-50" />
                <div className="space-y-1">
                  <p className="text-xs font-black text-[#141410] uppercase tracking-widest">Nenhum compromisso localizado</p>
                  <p className="text-xs text-[#6B6B5F] max-w-sm">Tente redefinir os filtros superiores ou faça uma busca menos específica.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {groupedList.map(group => (
                  <div key={group.date} className="space-y-3">
                    {/* Sticky Date Group Header */}
                    <div className="flex items-center gap-3 bg-[#FAF9F6] border border-[#E8E6E1] px-4 py-2.5 rounded-xl text-left">
                      <CalendarDays className="size-4 text-[#1B3A2D] shrink-0" />
                      <span className="text-[11px] font-black uppercase text-[#141410] tracking-wider">
                        Dia {formatBrazilianDate(group.date)}
                      </span>
                    </div>

                    {/* Timeline items */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {group.items.map(ev => {
                        const colors = TYPE_COLORS[ev.type] || TYPE_COLORS.outro;
                        const statusConf = STATUS_LABELS[ev.status];
                        const isRealizado = ev.status === 'realizado';

                        return (
                          <div
                            key={ev.id}
                            className="bg-white border border-[#E8E6E1] p-4 rounded-xl shadow-xs space-y-3 hover:border-slate-400 transition-all text-left flex flex-col justify-between"
                          >
                            <div className="space-y-2.5">
                              {/* Tags, Title and actions */}
                              <div className="flex items-start justify-between gap-1.5">
                                <div className="space-y-1.5">
                                  <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider border ${colors.bg} ${colors.text} ${colors.border}`}>
                                    {colors.label}
                                  </span>
                                  <h4 className={`font-display font-black text-xs text-[#141410] uppercase leading-tight ${isRealizado ? 'line-through opacity-50' : ''}`}>
                                    {ev.title}
                                  </h4>
                                </div>

                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    onClick={() => openEditModal(ev)}
                                    className="p-1.5 rounded-md bg-slate-50 border border-[#E8E6E1] hover:border-blue-400 text-blue-800 cursor-pointer transition-all"
                                    title="Editar"
                                  >
                                    <Edit2 className="size-3" />
                                  </button>
                                  
                                  {confirmDeleteId === ev.id ? (
                                    <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-0.5 rounded-lg">
                                      <button
                                        onClick={() => handleDeleteEvent(ev.id, ev.title)}
                                        className="p-1 px-1.5 bg-rose-600 text-white rounded cursor-pointer text-[8px] font-bold"
                                        title="Confirmar"
                                      >
                                        Apagar
                                      </button>
                                      <button
                                        onClick={() => setConfirmDeleteId(null)}
                                        className="p-1 rounded bg-slate-200 text-slate-800 cursor-pointer text-[8px] font-bold"
                                        title="Cancelar"
                                      >
                                        X
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      onClick={() => setConfirmDeleteId(ev.id)}
                                      className="p-1.5 rounded-md bg-slate-50 border border-[#E8E6E1] hover:bg-rose-50 hover:border-rose-400 text-rose-800 cursor-pointer transition-all"
                                      title="Excluir"
                                    >
                                      <Trash2 className="size-3" />
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="space-y-1 text-[10px] text-[#6B6B5F] font-semibold font-mono">
                                <p className="flex items-center gap-1.5 font-sans">
                                  <User className="size-3.5 text-[#9E9E90]" />
                                  <span>{ev.clientName}</span>
                                </p>
                                {ev.address && (
                                  <p className="flex items-center gap-1.5 font-sans">
                                    <MapPin className="size-3.5 text-[#9E9E90] shrink-0" />
                                    <span className="truncate" title={ev.address}>{ev.address}</span>
                                  </p>
                                )}
                                {ev.time && (
                                  <p className="flex items-center gap-1.5 text-[#141410] font-black">
                                    <Clock className="size-3.5 text-[#9E9E90]" />
                                    <span>{ev.time} Horas</span>
                                  </p>
                                )}
                              </div>

                              {ev.notes && (
                                <p className="text-[10px] text-[#5C5C50] bg-[#FAF9F6] border border-[#E8E6E1]/50 p-2 rounded-lg italic font-medium">
                                  "{ev.notes}"
                                </p>
                              )}
                            </div>

                            {/* Status Bottom */}
                            <div className="pt-2 border-t border-[#FAF9F6] flex items-center justify-between mt-2.5">
                              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${statusConf?.bg} ${statusConf?.text}`}>
                                • {statusConf?.label}
                              </span>

                              {!isRealizado && (
                                <button
                                  onClick={() => handleQuickComplete(ev.id, ev.title)}
                                  className="flex items-center gap-1 py-1 px-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-[9px] font-extrabold uppercase tracking-wide rounded-md cursor-pointer transition-all"
                                >
                                  <Check className="size-3" /> Concluir
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* --- INLINE OVERLAY MODAL: CREATE AND EDIT DIALOG --- */}
      {isModalOpen && (
        <div id="modal-agenda-overlap" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#E8E6E1] rounded-2xl max-w-lg w-full overflow-hidden shadow-xl"
          >
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-[#FAF9F6] flex items-center justify-between text-left">
              <div>
                <h3 className="font-display font-black text-[#141410] text-xs uppercase tracking-wider">
                  {modalMode === 'create' ? 'Agendar Novo Compromisso' : 'Editar Compromisso Agendado'}
                </h3>
                <p className="text-[10px] text-[#6B6B5F] mt-0.5">Preencha os dados abaixo com o roteiro ou escala técnica operacional.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-[#6B6B5F] hover:text-[#141410] bg-slate-50 border border-[#E8E6E1] rounded-lg cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modal Form body */}
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 text-left">
              
              {/* Title field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Título do Compromisso / OS *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: OS #1002 - Desratização Residencial"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-4.5 py-2.5 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                />
              </div>

              {/* Grid 1: Date & Time & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Data de Agendamento *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Horário (Opcional)</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Tipo de Compromisso</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  >
                    <option value="servico">Serviço (OS)</option>
                    <option value="retorno">Retorno de Garantia</option>
                    <option value="recorrencia">Alerta de Recorrência</option>
                    <option value="visita">Visita Técnica</option>
                    <option value="outro">Outro Motivo</option>
                  </select>
                </div>
              </div>

              {/* Client and Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Nome do Cliente / Local</label>
                  <input
                    type="text"
                    placeholder="Ex: Condomínio Residencial Bella Vista"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2.5 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Status Inicial</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2.5 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  >
                    <option value="pendente">Pendente para Atendimento</option>
                    <option value="confirmado">Confirmado / Prontidão</option>
                    <option value="realizado">Realizado / Executado</option>
                  </select>
                </div>
              </div>

              {/* Address field */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Endereço / Roteiro (Opcional)</label>
                <input
                  type="text"
                  placeholder="Ex: Av. das Cerejeiras, 455 - Bloco B"
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-4.5 py-2.5 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                />
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Observações Complementares / Pragas Alvo</label>
                <textarea
                  placeholder="Detalhes adicionais, recomendações prévias e EPIs obrigatórios..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-4 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#FAF9F6]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-[#E8E6E1] rounded-lg text-[10px] font-extrabold uppercase tracking-widest text-[#6B6B5F] hover:bg-[#FAF9F6] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white rounded-lg text-[10px] font-extrabold uppercase tracking-widest cursor-pointer shadow-sm"
                >
                  Confirmar e Salvar
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
