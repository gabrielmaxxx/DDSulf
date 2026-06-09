import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  FileText,
  CalendarDays,
  CheckCircle2,
  Phone,
  FileSpreadsheet,
  AlertCircle,
  HelpCircle,
  Download,
  Share2,
  BookOpen,
  History,
  Timer,
  Users,
  Package,
  DollarSign
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { FileUpload } from '@/components/FileUpload';
import { formatBRL, formatPercent, formatDate } from '@/utils/format';



// Return the list of days in a week given a date reference
const getStartAndEndOfWeek = (dateRefStr: string) => {
  const ref = new Date(dateRefStr);
  const day = ref.getDay(); // 0 is Sunday, 1 is Monday ...
  const diff = ref.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const monday = new Date(ref.setDate(diff));
  
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    dates.push(nextDay.toISOString().split('T')[0]);
  }
  return dates;
};

export function AgendaPage() {
  const { 
    agenda, 
    addAgendaEvent, 
    updateAgendaEvent, 
    removeAgendaEvent,
    clients,
    pops,
    inventory,
    confirmServiceExecuted,
    quotes
  } = useSystemStore();

  const events: (AgendaEvent & any)[] = useMemo(() => agenda || [], [agenda]);
  const clientList = useMemo(() => clients || [], [clients]);
  const popProcedures = useMemo(() => pops?.procedures || [], [pops]);
  const inventoryProducts = useMemo(() => inventory?.products || [], [inventory]);

  // Current selected date of the system: June 05, 2026 as per local clock
  const TODAY_STR = '2026-06-05';
  const TOMORROW_STR = '2026-06-06';
  
  const currentWeekDays = useMemo(() => getStartAndEndOfWeek(TODAY_STR), []);
  const currentMonthPrefix = '2026-06';

  // State Management
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 5, 5)); // Prefilled to June 2026
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'hoje' | 'semana' | 'mes' | 'atrasados' | 'garantia' | 'retornos'>('todos');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [confirmingEventId, setConfirmingEventId] = useState<string | null>(null);
  const [execNotes, setExecNotes] = useState('');

  // Focus effect based on URL param deep link (?eventId=...) or client prefilling (?clientId=...)
  useEffect(() => {
    const paramEvId = searchParams.get('eventId');
    if (paramEvId && agenda && agenda.length > 0) {
      const match = agenda.some(e => e.id === paramEvId);
      if (match) {
        setSelectedEventId(paramEvId);
      }
    } else {
      const paramClientId = searchParams.get('clientId');
      if (paramClientId && clients && clients.length > 0) {
        const found = clients.find(c => c.id === paramClientId);
        if (found) {
          setIsModalOpen(true);
          setModalMode('create');
          setFormClientId(found.id);
          setFormClientName(found.name);
          setFormTitle(`Controle de Pragas - ${found.name}`);
          toast.success(`Iniciando agendamento para: ${found.name}`);
        }
      }
    }
  }, [searchParams, agenda, clients]);
  
  // Selected Event inside Column 3 details
  const [selectedEventId, setSelectedEventId] = useState<string | null>(() => {
    // Select the first service by default if exists
    return agenda && agenda.length > 0 ? agenda[0].id : null;
  });

  const selectedEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  // Uploaded files dictionary scoped by event ID to simulate local persistence
  const [uploadedFilesMap, setUploadedFilesMap] = useState<Record<string, any[]>>(() => {
    // Scaffold default attachments for demo/persistence
    return {
      'ev-01': [
        { id: 'f1', name: 'relatorio_execucao_pao_duro.pdf', type: 'application/pdf', size: '1.2 MB', date: '10/05/2026 14:30' },
        { id: 'f2', name: 'comprovante_sanitacao.jpg', type: 'image/jpeg', size: '640 KB', date: '10/05/2026 14:32' }
      ],
      'ev-02': [
        { id: 'f3', name: 'foto_caixas_iscagem.jpg', type: 'image/jpeg', size: '220 KB', date: '15/05/2026 11:20' }
      ]
    };
  });

  // Modal active states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [activeFormType, setActiveFormType] = useState<AgendaEvent['type']>('servico');

  // Form Fields
  const [formFieldId, setFormFieldId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formTime, setFormTime] = useState('');
  const [formClientName, setFormClientName] = useState('');
  const [formClientId, setFormClientId] = useState('');
  const [formStatus, setFormStatus] = useState<AgendaEvent['status']>('pendente');
  const [formNotes, setFormNotes] = useState('');
  
  // Operational fields for high-fidelity simulation saved directly on event metadata
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formTechnician, setFormTechnician] = useState('');
  const [formServiceType, setFormServiceType] = useState('');
  const [formPest, setFormPest] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formComplexity, setFormComplexity] = useState('Média');
  const [formValue, setFormValue] = useState('');
  const [formPopName, setFormPopName] = useState('');
  const [formProducts, setFormProducts] = useState<string[]>([]);

  // Return warranty Modal states
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [returnDate, setReturnDate] = useState('2026-06-12');
  const [returnReason, setReturnReason] = useState('');
  const [returnNotes, setReturnNotes] = useState('');

  // Active POP Dialog state
  const [activePopDetail, setActivePopDetail] = useState<any | null>(null);

  // Month Grid Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const DAYS_OF_WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  const calendarCells = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const cells: {
      day: number;
      dateString: string;
      isCurrentMonth: boolean;
      eventsThisDay: (AgendaEvent & any)[];
    }[] = [];

    // Prev month padding
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

    // Current month days
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

    // Next month padding
    const remainingCount = 42 - cells.length;
    for (let n = 1; n <= remainingCount; n++) {
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

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // KPIs calculations
  const stats = useMemo(() => {
    const servicesToday = events.filter(e => e.date === TODAY_STR).length;
    const servicesTomorrow = events.filter(e => e.date === TOMORROW_STR).length;
    const servicesThisWeek = events.filter(e => currentWeekDays.includes(e.date)).length;
    const totalRetornos = events.filter(e => e.type === 'retorno').length;
    const totalServiceAndRetorno = events.filter(e => e.type === 'servico' || e.type === 'retorno').length;
    
    // Dynamic percentage returned
    const returnRate = totalServiceAndRetorno > 0 ? (totalRetornos / totalServiceAndRetorno) * 100 : 0;

    return {
      today: servicesToday,
      tomorrow: servicesTomorrow,
      thisWeek: servicesThisWeek,
      retornos: totalRetornos,
      rate: returnRate
    };
  }, [events, currentWeekDays]);

  // List filter counters for Column 1 quick selectors
  const filterCounters = useMemo(() => {
    const hoje = events.filter(e => e.date === TODAY_STR).length;
    const semana = events.filter(e => currentWeekDays.includes(e.date)).length;
    const mes = events.filter(e => e.date.startsWith(currentMonthPrefix)).length;
    const atrasados = events.filter(e => e.status !== 'realizado' && e.date < TODAY_STR).length;
    
    const garantia = events.filter(e => {
      if (e.status !== 'realizado') return false;
      const diff = (new Date(TODAY_STR).getTime() - new Date(e.date).getTime()) / (1000 * 3600 * 24);
      return diff >= 0 && diff <= 90;
    }).length;
    
    const retornos = events.filter(e => e.type === 'retorno').length;

    return { hoje, semana, mes, atrasados, garantia, retornos };
  }, [events, currentWeekDays, currentMonthPrefix]);

  // Advanced Filtering logic for Column 2
  const filteredServices = useMemo(() => {
    return events.filter(e => {
      // 1. Calendar selection override if selectedDate is clicked
      if (selectedDate && e.date !== selectedDate) {
        return false;
      }

      // 2. Search query match (client, address, description)
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const clientNameMatch = e.clientName?.toLowerCase().includes(query) || false;
        const addressMatch = e.address?.toLowerCase().includes(query) || false;
        const titleMatch = e.title?.toLowerCase().includes(query) || false;
        const notesMatch = e.notes?.toLowerCase().includes(query) || false;
        if (!clientNameMatch && !addressMatch && !titleMatch && !notesMatch) {
          return false;
        }
      }

      // 3. Quick filters (only executed if no specific calendar date is clicked, to respect gestor layout clicks)
      if (!selectedDate && activeFilter !== 'todos') {
        switch (activeFilter) {
          case 'hoje':
            return e.date === TODAY_STR;
          case 'semana':
            return currentWeekDays.includes(e.date);
          case 'mes':
            return e.date.startsWith(currentMonthPrefix);
          case 'atrasados':
            return e.status !== 'realizado' && e.date < TODAY_STR;
          case 'retornos':
            return e.type === 'retorno';
          case 'garantia': {
            if (e.status !== 'realizado') return false;
            const diff = (new Date(TODAY_STR).getTime() - new Date(e.date).getTime()) / (1000 * 3600 * 24);
            return diff >= 0 && diff <= 90;
          }
          default:
            return true;
        }
      }

      return true;
    }).sort((a, b) => {
      // Sort priority: earliest date first, then time
      const dateComp = a.date.localeCompare(b.date);
      if (dateComp !== 0) return dateComp;
      return (a.time || '').localeCompare(b.time || '');
    });
  }, [events, selectedDate, searchTerm, activeFilter, currentWeekDays, currentMonthPrefix]);

  // Color mapping configuration for requested statuses
  const getStatusConfig = (ev: AgendaEvent) => {
    const isPast = ev.date < TODAY_STR;
    
    if (ev.status === 'realizado') {
      return { label: 'Concluído', colorBg: 'bg-zinc-100 border-zinc-250', colorText: 'text-zinc-700', activeDot: 'bg-zinc-500' };
    }
    
    if (isPast) {
      return { label: 'Atrasado', colorBg: 'bg-rose-50 border-rose-200', colorText: 'text-rose-700', activeDot: 'bg-rose-600 animate-pulse' };
    }
    
    if (ev.status === 'confirmado') {
      return { label: 'Confirmado', colorBg: 'bg-emerald-50 border-emerald-250', colorText: 'text-emerald-700', activeDot: 'bg-emerald-600' };
    }
    
    if ((ev as any).status === 'executando' || (ev as any).status === 'execução') {
      return { label: 'Em execução', colorBg: 'bg-amber-50 border-amber-250', colorText: 'text-amber-700', activeDot: 'bg-amber-600' };
    }
    
    // Default: 'Agendado' mapping (Azul)
    return { label: 'Agendado', colorBg: 'bg-blue-50 border-blue-200', colorText: 'text-blue-700', activeDot: 'bg-blue-500' };
  };

  // Return calculations for modal check
  const returnCalculation = useMemo(() => {
    if (!selectedEvent) return { diffDays: 0, isActive: false };
    const dateOrig = new Date(selectedEvent.date);
    const dateRet = new Date(returnDate);
    
    // Day diff calculation
    const diffTime = dateRet.getTime() - dateOrig.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      diffDays,
      isActive: diffDays >= 0 && diffDays <= 90
    };
  }, [selectedEvent, returnDate]);

  // Form Pre-fill handlers
  const openCreateModal = (type: AgendaEvent['type'] = 'servico') => {
    setModalMode('create');
    setFormFieldId('');
    setActiveFormType(type);
    
    setFormTitle(type === 'retorno' ? 'Retorno de Assistência Técnica' : 'Prestação de Serviço de Dedetização');
    setFormDate(TODAY_STR);
    setFormTime('08:00');
    setFormClientName('');
    setFormClientId('');
    setFormStatus('pendente');
    setFormNotes('');
    
    // Prefill operational fields
    setFormPhone('(24) 99884-2211');
    setFormAddress('Av. Getúlio Vargas, 1400');
    setFormCity('Volta Redonda');
    setFormTechnician('Carlos Barbosa (Técnico Sênior)');
    setFormServiceType(type === 'retorno' ? 'Retorno Assistência' : 'DDSulf Desinsetização Premium');
    setFormPest('Baratas e Formigas');
    setFormArea('120 m²');
    setFormComplexity('Média');
    setFormValue('380');
    setFormPopName(popProcedures.length > 0 ? popProcedures[0].name : 'POP-01: Controle de Baratas Germânicas');
    setFormProducts(['Demand CS', 'Maxforce Barata']);
    
    setIsModalOpen(true);
  };

  const openEditModal = (ev: any) => {
    setModalMode('edit');
    setFormFieldId(ev.id);
    setActiveFormType(ev.type);
    
    setFormTitle(ev.title || '');
    setFormDate(ev.date || '');
    setFormTime(ev.time || '');
    setFormClientName(ev.clientName || '');
    setFormClientId(ev.clientId || '');
    setFormStatus(ev.status || 'pendente');
    setFormNotes(ev.notes || '');
    
    // Fill operational custom metadata fields
    setFormPhone(ev.phone || '(24) 99882-1100');
    setFormAddress(ev.address || 'Rua das Camélias, 21');
    setFormCity(ev.city || 'Volta Redonda');
    setFormTechnician(ev.technician || 'Marcelo Fonseca (Técnico de Campo)');
    setFormServiceType(ev.serviceType || 'Controle Químico Combinado');
    setFormPest(ev.pest || 'Geral de Rasteiros');
    setFormArea(ev.area || '200 m²');
    setFormComplexity(ev.complexity || 'Baixa');
    setFormValue(ev.value ? String(ev.value) : '450');
    setFormPopName(ev.popName || (popProcedures.length > 0 ? popProcedures[0].name : 'POP-01: Controle Integrado'));
    setFormProducts(ev.products || ['K-Othrine WG', 'Maxforce']);
    
    setIsModalOpen(true);
  };

  // Form submission handler
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('O título da agenda é obrigatório');
      return;
    }

    const payload: AgendaEvent & any = {
      id: modalMode === 'edit' ? formFieldId : `ev-${Math.random().toString(36).substring(2, 9)}`,
      title: formTitle,
      date: formDate,
      time: formTime || undefined,
      clientName: formClientName || 'Cliente Geral Faturado',
      clientId: formClientId || undefined,
      type: activeFormType,
      status: formStatus,
      notes: formNotes || undefined,
      
      // Metadata fields
      phone: formPhone,
      address: formAddress,
      city: formCity,
      technician: formTechnician,
      serviceType: formServiceType,
      pest: formPest,
      area: formArea,
      complexity: formComplexity,
      value: parseFloat(formValue) || 0,
      popName: formPopName,
      products: formProducts,
      history: modalMode === 'edit' ? (events.find(ev => ev.id === formFieldId)?.history || ['Orçamento criado', 'Serviço agendado']) : ['Orçamento criado', 'Serviço agendado']
    };

    if (modalMode === 'edit') {
      updateAgendaEvent(formFieldId, payload);
      toast.success('Tarefa operacional atualizada com sucesso!');
    } else {
      addAgendaEvent(payload);
      setSelectedEventId(payload.id);
      toast.success('Tarefa agendada e emitida na escala técnica!');
    }

    setIsModalOpen(false);
  };

  // Quick conclusion trigger for active card
  const handleQuickComplete = (id: string, title: string) => {
    const current = events.find(e => e.id === id);
    if (!current) return;

    // Append history transition
    const updatedHistory = [...(current.history || ['Orçamento criado', 'Serviço agendado', 'Serviço confirmado']), 'Serviço executado'];
    
    updateAgendaEvent(id, { 
      status: 'realizado',
      history: updatedHistory
    } as any);
    toast.success(`Serviço "${title}" concluído e marcado na escala executiva!`);
  };

  // Register return action confirmation click
  const handleSaveReturn = () => {
    if (!selectedEvent) return;
    if (!returnReason.trim()) {
      toast.error('Descreva o motivo do acionamento de retorno.');
      return;
    }

    // Double check date
    if (!returnCalculation.isActive) {
      toast.error('Garantia expirada. Não é possível gerar retorno sem custo de receita.');
      return;
    }

    const originalTitle = selectedEvent.title.replace('Ordem de Serviço #', '');
    const returnPayload: AgendaEvent & any = {
      id: `ev-ret-${Math.random().toString(36).substring(2, 9)}`,
      title: `Retorno de Garantia: ${originalTitle}`,
      date: returnDate,
      time: '09:00',
      clientName: selectedEvent.clientName,
      clientId: selectedEvent.clientId,
      type: 'retorno',
      status: 'pendente',
      notes: `Motivo: ${returnReason}. Observações: ${returnNotes}`,
      
      // Inherited metadata with zeroed values or operational cost calculations
      phone: selectedEvent.phone || '(24) 99882-1100',
      address: selectedEvent.address || '',
      city: selectedEvent.city || '',
      technician: selectedEvent.technician || 'Elias Ribeiro (Técnico Responsável)',
      serviceType: 'Acionamento de Retorno Gratuito',
      pest: selectedEvent.pest || 'Baratas Germânicas',
      area: selectedEvent.area || '100 m²',
      complexity: 'Média',
      value: 0, // NO DIRECT REVENUE GENERATED
      isReturnCost: true,
      popName: selectedEvent.popName || 'POP-01: Retomada Química de Reforço',
      products: selectedEvent.products || ['Demand CS'],
      history: ['Retorno de garantia solicitado', 'Vistoria técnica reagendada']
    };

    addAgendaEvent(returnPayload);
    setIsReturnModalOpen(false);
    setSelectedEventId(returnPayload.id);
    
    // Clear return values
    setReturnReason('');
    setReturnNotes('');
    
    toast.success('Retorno sem custos registrado na agenda!', {
      description: 'O serviço foi classificado como Retorno de Garantia (Garantia Ativa).'
    });
  };

  // Simulation of agenda exports 
  const handleExportAgenda = () => {
    const headers = 'ID,Titulo,Data,Hora,Cliente,Tipo,Status,Endereco,Tecnico,Valor\n';
    const rows = events.map(e => {
      const statusLabel = getStatusConfig(e).label;
      return `"${e.id}","${e.title}","${e.date}","${e.time || ''}","${e.clientName}","${e.type}","${statusLabel}","${e.address || ''}","${e.technician || ''}",${e.value || 0}`;
    }).join('\n');
    
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `agenda_ddsulf_operacoes_${TODAY_STR}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Agenda exportada com sucesso!', {
      description: 'Download do arquivo CSV formatado concluído.'
    });
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-300">
      
      {/* HEADER SECTION */}
      <div id="page-header-container" className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-150 pb-5">
        <div>
          <h1 id="page-title" className="text-3xl font-sans font-bold text-zinc-900 tracking-tight">
            Agenda e Serviços
          </h1>
          <p id="page-description" className="text-sm text-zinc-500 font-semibold mt-1">
            Gerencie agendamentos, execuções e retornos.
          </p>
        </div>
        
        {/* ACTION BUTTONS (Right Side) */}
        <div id="header-action-panel" className="flex flex-wrap items-center gap-2.5">
          <button 
            id="btn-novoservico-header"
            onClick={() => openCreateModal('servico')}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A2D] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#1B3A2D]/90 transition-all cursor-pointer shadow-sm hover:translate-y-[-1px]"
          >
            <Plus className="size-4" /> Novo Serviço
          </button>
          <button 
            id="btn-novoretorno-header"
            onClick={() => openCreateModal('retorno')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-amber-700 transition-all cursor-pointer shadow-sm hover:translate-y-[-1px]"
          >
            <Timer className="size-4" /> Novo Retorno
          </button>
          <button 
            id="btn-exportar-header"
            onClick={handleExportAgenda}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-zinc-300 shadow-xs"
          >
            <Download className="size-4" /> Exportar Agenda
          </button>
        </div>
      </div>

      {/* INDICADORES OPERACIONAIS SUPERIORES */}
      <div id="top-indicator-cards" className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* HOJE */}
        <div id="card-hoje-stats" className="bg-white border border-zinc-200/95 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Hoje</span>
            <p className="text-2xl font-bold font-sans text-zinc-950">{stats.today}</p>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 mt-2 flex items-center gap-1.5 border-t border-zinc-100 pt-1.5">
            <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>05 Jun 2026</span>
          </div>
        </div>

        {/* AMANHÃ */}
        <div id="card-amanha-stats" className="bg-white border border-zinc-200/95 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Amanhã</span>
            <p className="text-2xl font-bold font-sans text-zinc-950">{stats.tomorrow}</p>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 mt-2 flex items-center gap-1.5 border-t border-zinc-100 pt-1.5">
            <span className="size-1.5 rounded-full bg-slate-400" />
            <span>06 Jun 2026</span>
          </div>
        </div>

        {/* ESTA SEMANA */}
        <div id="card-semana-stats" className="bg-white border border-zinc-200/95 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Esta Semana</span>
            <p className="text-2xl font-bold font-sans text-zinc-950">{stats.thisWeek}</p>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 mt-2 flex items-center gap-1.5 border-t border-zinc-100 pt-1.5">
            <span className="size-1.5 rounded-full bg-[#1B3A2D]" />
            <span>Escala Operacional</span>
          </div>
        </div>

        {/* RETORNOS PENDENTES */}
        <div id="card-retornos-stats" className="bg-white border border-zinc-200/95 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Retornos</span>
            <p className="text-2xl font-bold font-sans text-amber-700">{stats.retornos}</p>
          </div>
          <div className="text-[11px] font-bold text-amber-600 mt-2 flex items-center gap-1.5 border-t border-zinc-100 pt-1.5">
            <span className="size-1.5 rounded-full bg-amber-500" />
            <span>Garantias emitidas</span>
          </div>
        </div>

        {/* TAXA DE RETORNO (PERCENTUAL) */}
        <div id="card-taxa-stats" className="col-span-2 md:col-span-1 bg-white border border-zinc-200/95 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block">Taxa de Retorno</span>
            <p className="text-2xl font-bold font-sans text-[#1B3A2D]">{formatPercent(stats.rate)}</p>
          </div>
          <div className="text-[11px] font-semibold text-zinc-400 mt-2 flex items-center gap-1.5 border-t border-zinc-100 pt-1.5">
            <span className="size-1.5 rounded-full bg-[#1B3A2D]" />
            <span>Meta de qualidade &lt; 5%</span>
          </div>
        </div>
      </div>

      {/* CORE THREE COLUMNS CONTAINER */}
      <div id="operational-center-grid" className="flex flex-col md:grid md:grid-cols-2 lg:flex lg:flex-row gap-6">
        
        {/* ==================================================== */}
        {/* COLUNA 1: AGENDA (25%) */}
        {/* ==================================================== */}
        <div id="column-agenda-left" className="w-full md:col-span-1 lg:w-[25%] shrink-0 space-y-5">
          <div className="bg-white border border-zinc-200 p-4.5 rounded-2xl space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="size-4.5 text-[#1B3A2D]" /> Calendário
              </span>
              
              <div className="flex items-center gap-1">
                <button 
                  id="btn-prev-month"
                  onClick={handlePrevMonth} 
                  className="p-1 hover:bg-zinc-50 border border-zinc-200 rounded-md cursor-pointer"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <span className="text-[11px] font-bold text-zinc-800 uppercase px-1.5">
                  {MONTHS[month]} '{String(year).slice(-2)}
                </span>
                <button 
                  id="btn-next-month"
                  onClick={handleNextMonth} 
                  className="p-1 hover:bg-zinc-50 border border-zinc-200 rounded-md cursor-pointer"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Micro Monthly Grid */}
            <div className="space-y-1">
              <div className="grid grid-cols-7 gap-1 text-center font-bold text-[8.5px] text-zinc-400 uppercase tracking-widest py-1 border-b border-zinc-100 mb-1">
                {DAYS_OF_WEEK.map(d => <div key={d}>{d}</div>)}
              </div>
              
              <div className="grid grid-cols-7 gap-1.5">
                {calendarCells.map((cell, cidx) => {
                  const isToday = cell.dateString === TODAY_STR;
                  const isSelected = cell.dateString === selectedDate;
                  const hasTasks = cell.eventsThisDay.length > 0;
                  
                  return (
                    <button
                      key={`${cell.dateString}-${cidx}`}
                      id={`cal-cell-${cell.dateString}`}
                      onClick={() => {
                        if (selectedDate === cell.dateString) {
                          setSelectedDate(null); // toggle filter off
                        } else {
                          setSelectedDate(cell.dateString);
                        }
                      }}
                      className={`h-7.5 rounded-lg text-[10px] font-bold flex flex-col items-center justify-center transition-all relative border cursor-pointer
                        ${cell.isCurrentMonth ? 'text-zinc-800' : 'text-zinc-300 border-transparent bg-zinc-50/20'}
                        ${isSelected 
                          ? 'bg-[#1B3A2D] text-white border-[#1B3A2D]' 
                          : isToday 
                            ? 'border-amber-500 bg-amber-50/30' 
                            : 'border-transparent hover:bg-zinc-50 hover:border-zinc-300'
                        }
                      `}
                    >
                      <span>{cell.day}</span>
                      {hasTasks && (
                        <span className={`absolute bottom-0.5 size-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (
              <div className="pt-2">
                <button 
                  id="btn-limpar-calendario"
                  onClick={() => setSelectedDate(null)}
                  className="w-full text-center text-[10px] font-bold text-zinc-500 hover:text-[#1B3A2D] uppercase tracking-wider py-1 hover:bg-zinc-50 rounded-lg border border-dashed border-zinc-200"
                >
                  Limpar Data Selecionada
                </button>
              </div>
            )}
          </div>

          {/* FILTROS RÁPIDOS */}
          <div className="bg-white border border-zinc-200 p-4.5 rounded-2xl shadow-xs space-y-3">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block border-b border-zinc-100 pb-1.5">
              FILTROS OPERACIONAIS
            </span>
            
            <div id="quick-filters-list" className="space-y-1">
              {[
                { id: 'todos', label: 'Todos os Serviços', count: events.length },
                { id: 'hoje', label: 'Hoje', count: filterCounters.hoje, color: 'bg-blue-600' },
                { id: 'semana', label: 'Esta Semana', count: filterCounters.semana, color: 'bg-amber-600' },
                { id: 'mes', label: 'Este Mês', count: filterCounters.mes, color: 'bg-[#1B3A2D]' },
                { id: 'atrasados', label: 'Atrasados', count: filterCounters.atrasados, color: 'bg-rose-600' },
                { id: 'garantia', label: 'Garantias Ativas', count: filterCounters.garantia, color: 'bg-emerald-600' },
                { id: 'retornos', label: 'Retornos', count: filterCounters.retornos, color: 'bg-amber-500' },
              ].map(filt => {
                const isSelected = activeFilter === filt.id && !selectedDate;
                return (
                  <button
                    key={filt.id}
                    id={`filter-nav-${filt.id}`}
                    onClick={() => {
                      setSelectedDate(null); // clear specific calendar block
                      setActiveFilter(filt.id as any);
                    }}
                    className={`w-full py-2 px-3 rounded-lg flex items-center justify-between text-left text-xs font-semibold tracking-wide transition-colors cursor-pointer
                      ${isSelected 
                        ? 'bg-[#1B3A2D] text-white' 
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                  >
                    <span className="flex items-center gap-2">
                      {filt.color && (
                        <span className={`size-1.5 rounded-full ${filt.color}`} />
                      )}
                      {filt.label}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${isSelected ? 'bg-white/15 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                      {filt.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUNA 2: SERVIÇOS (35%) */}
        {/* ==================================================== */}
        <div id="column-servicos-middle" className="w-full md:col-span-1 lg:w-[35%] shrink-0 space-y-4">
          <div className="bg-white border border-zinc-200 p-4.5 rounded-2xl shadow-xs space-y-4 min-h-[580px]">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                  Serviços Programados
                </h3>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                  {selectedDate ? `Filtro: ${formatDate(selectedDate)}` : `Filtro: ${activeFilter}`}
                </p>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-0.5 rounded-md">
                {filteredServices.length} {filteredServices.length === 1 ? 'item' : 'itens'}
              </span>
            </div>

            {/* Campo de Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-zinc-400" />
              <input
                id="service-search-input"
                type="text"
                placeholder="Pesquisar cliente ou endereço."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50/70 border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-xs text-zinc-800 placeholder-zinc-400 focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
              />
            </div>

            {/* Service Cards Container */}
            <div id="service-cards-scroller" className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredServices.length === 0 ? (
                <div id="empty-state-list" className="py-24 text-center space-y-4 border border-dashed border-zinc-200 rounded-xl bg-zinc-50/20 px-4">
                  <SearchX className="size-10 mx-auto text-zinc-300 stroke-[1.5]" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-zinc-800">
                      Nenhum serviço programado para este período.
                    </p>
                    <p className="text-[11px] text-zinc-400">
                      Tente alterar os filtros rápidos ou cadastrar uma nova escala técnica.
                    </p>
                  </div>
                  <button
                    id="btn-empty-novo-servico"
                    onClick={() => openCreateModal('servico')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#1B3A2D] text-white text-[11px] font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-850 cursor-pointer transition-colors shadow-xs"
                  >
                    <Plus className="size-3.5" /> Novo Serviço
                  </button>
                </div>
              ) : (
                filteredServices.map(ev => {
                  const isSelected = ev.id === selectedEventId;
                  const statusObj = getStatusConfig(ev);
                  const isWarrantyRet = ev.type === 'retorno';
                  
                  return (
                    <div
                      key={ev.id}
                      id={`service-card-${ev.id}`}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`p-3.5 rounded-xl border transition-all text-left cursor-pointer relative space-y-2.5
                        ${isSelected 
                          ? 'bg-[#E8F4EE]/50 border-[#1B3A2D] shadow-xs' 
                          : 'bg-white hover:bg-zinc-50 border-zinc-200'}`}
                    >
                      {/* Horário, Status, and Warranty indicators */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold font-sans text-zinc-800 flex items-center gap-1">
                          <Clock className="size-3 text-zinc-400" />
                          {ev.time || 'Sem hora'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isWarrantyRet && (
                            <span className="text-[8px] font-bold px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                              Garantia Ativa
                            </span>
                          )}
                          <span className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${statusObj.colorBg} ${statusObj.colorText}`}>
                            <span className={`size-1.5 rounded-full ${statusObj.activeDot}`} />
                            {statusObj.label}
                          </span>
                        </div>
                      </div>

                      {/* Cliente & Tipo de Serviço */}
                      <div className="space-y-0.5">
                        <h4 className="font-sans font-bold text-xs text-zinc-900 leading-snug">
                          {ev.time ? `${ev.time} — ` : ''}{ev.clientName}
                        </h4>
                        <p className="text-[10.5px] font-semibold text-zinc-500 flex items-center gap-1">
                          <span className={`size-1.5 rounded-full ${ev.type === 'retorno' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                          {ev.title}
                        </p>
                      </div>

                      {/* Cidade */}
                      <div className="text-[10.5px] font-bold text-zinc-400 flex items-center gap-1 pt-1.5 border-t border-zinc-100">
                        <MapPin className="size-3 text-zinc-400" />
                        <span>{ev.city || 'Volta Redonda - RJ'}</span>
                      </div>

                      {/* Confirmação de Execução Direta no Card */}
                      {ev.quoteId && ev.status === 'pendente' && (
                        confirmingEventId === ev.id ? (
                          <div 
                            style={{ marginTop: 8, borderTop: '1px solid #EBEBE5', paddingTop: 8 }}
                            onClick={(e) => e.stopPropagation()}
                            className="space-y-2 text-left"
                            id={`execution-form-${ev.id}`}
                          >
                            <textarea
                              placeholder="Observações do técnico (opcional)"
                              value={execNotes}
                              onChange={e => setExecNotes(e.target.value)}
                              rows={2}
                              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-lg p-2 font-sans focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] text-zinc-800"
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const quote = quotes.list.find(q => q.id === ev.quoteId);
                                  confirmServiceExecuted(
                                    ev.quoteId!,
                                    quote?.scheduledTechnician || 'Técnico',
                                    execNotes
                                  );
                                  updateAgendaEvent(ev.id, { status: 'realizado' });
                                  setConfirmingEventId(null);
                                  setExecNotes('');
                                  toast.success('Serviço confirmado!');
                                }}
                                className="flex-1 py-1.5 px-3 bg-[#1B3A2D] text-white text-[11px] font-bold uppercase rounded-lg hover:bg-emerald-850 cursor-pointer transition-colors text-center"
                              >
                                Confirmar execução
                              </button>
                              <button 
                                type="button" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmingEventId(null);
                                }}
                                className="py-1.5 px-3 bg-zinc-100 hover:bg-zinc-250 border border-zinc-250 text-zinc-700 text-[11px] font-bold uppercase rounded-lg cursor-pointer transition-colors"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div onClick={(e) => e.stopPropagation()} className="pt-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmingEventId(ev.id);
                              }}
                              className="w-full flex items-center justify-center gap-1 py-1.5 px-3 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[11px] font-bold uppercase rounded-lg transition-colors cursor-pointer shadow-xs"
                            >
                              ✓ Confirmar execução
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* COLUNA 3: DETALHES (40%) */}
        {/* ==================================================== */}
        <div id="column-detalhes-right" className="w-full md:col-span-2 lg:w-[40%] shrink-0 space-y-4">
          <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-xs space-y-5 min-h-[580px] relative">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">
                Detalhes do Serviço
              </h3>
              
              {selectedEvent && (
                <div className="flex items-center gap-1.5">
                  <button
                    id="btn-edit-active-service"
                    onClick={() => openEditModal(selectedEvent)}
                    className="p-1.5 text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                    title="Editar Ordem de Serviço"
                  >
                    <Edit2 className="size-3.5" />
                  </button>
                  <button
                    id="btn-delete-active-service"
                    onClick={() => {
                      if (confirm('Deseja excluir esta tarefa operacional?')) {
                        removeAgendaEvent(selectedEvent.id);
                        toast.success('Serviço cancelado da escala!');
                        setSelectedEventId(null);
                      }
                    }}
                    className="p-1.5 text-rose-700 bg-rose-50 border border-rose-250 rounded-lg hover:bg-rose-100 transition-colors cursor-pointer"
                    title="Excluir Serviço"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Check Selected Event */}
            {!selectedEvent ? (
              <div id="detalhes-placeholder" className="py-32 text-center text-zinc-400 space-y-3 px-4">
                <HelpCircle className="size-12 mx-auto text-zinc-200 stroke-[1.5]" />
                <p className="text-xs font-bold text-zinc-700">Selecione um serviço ao lado</p>
                <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                  Para visualizar a ficha técnica operacional, conferir estoque de produtos e emitir assistência/retornos de garantia.
                </p>
              </div>
            ) : (
              <div id="selected-service-panel" className="space-y-5">
                
                {/* 1. Core Header Block (Cliente, Telefone, Endereço, Data, Horário, Técnico) */}
                <div id="service-block-header" className="bg-zinc-50/60 p-4 rounded-xl border border-zinc-150 space-y-3.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 id="detail-client-name" className="text-base font-bold text-zinc-950 font-sans">
                        {selectedEvent.clientName}
                      </h4>
                      <p className="text-xs text-zinc-400 font-bold tracking-wide uppercase mt-0.5">
                        {selectedEvent.title}
                      </p>
                    </div>
                    {selectedEvent.type === 'retorno' && (
                      <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        Garantia Ativa
                      </span>
                    )}
                  </div>

                  {/* ATALHOS INTEGRADOS DE MÓDULOS (UMA INFORMAÇÃO, MÚLTIPLOS CONTEXTOS) */}
                  <div className="pt-3 border-t border-zinc-200/90 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="text-zinc-600 font-extrabold uppercase mr-1">Ir para:</span>
                    
                    {/* Link to Clientes */}
                    {selectedEvent.clientId ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/clientes?clientId=${selectedEvent.clientId}`)}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-250/60 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer leading-none"
                      >
                        <Users className="size-3" /> Ficha do Cliente
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => navigate(`/clientes?search=${encodeURIComponent(selectedEvent.clientName)}`)}
                        className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-250/60 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer leading-none"
                      >
                        <Users className="size-3" /> Ficha do Cliente
                      </button>
                    )}

                    {/* Link to POPs */}
                    <button
                      type="button"
                      onClick={() => navigate(`/procedures?search=${encodeURIComponent(selectedEvent.pest || 'Baratas')}`)}
                      className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-250/60 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer leading-none"
                    >
                      <BookOpen className="size-3" /> Ver POP
                    </button>

                    {/* Link to Inventory */}
                    <button
                      type="button"
                      onClick={() => navigate(`/inventory?search=${encodeURIComponent(selectedEvent.products?.[0] || 'Demand')}`)}
                      className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-250/60 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer leading-none"
                    >
                      <Package className="size-3" /> Ver Estoque
                    </button>

                    {/* Link to Financial */}
                    <button
                      type="button"
                      onClick={() => navigate(`/financial?search=${encodeURIComponent(selectedEvent.clientName)}`)}
                      className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-250/60 rounded-md font-bold transition-all flex items-center gap-1 cursor-pointer leading-none"
                    >
                      <DollarSign className="size-3" /> Ver Financeiro
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-semibold text-zinc-500 border-t border-zinc-200/90 pt-3">
                    <div className="space-y-1.5">
                      <p id="detail-client-phone" className="flex items-center gap-2">
                        <Phone className="size-3.5 text-zinc-400 shrink-0" />
                        <span>{selectedEvent.phone || '(24) 99882-1100'}</span>
                      </p>
                      <p id="detail-client-address" className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate" title={selectedEvent.address || 'Rua não informada'}>
                          {selectedEvent.address || 'Não Informado'}
                        </span>
                      </p>
                    </div>
                    
                    <div className="space-y-1.5">
                      <p id="detail-client-date" className="flex items-center gap-2">
                        <CalendarDays className="size-3.5 text-zinc-400 shrink-0" />
                        <span>{formatDate(selectedEvent.date)} às {selectedEvent.time || '--:--'}</span>
                      </p>
                      <p id="detail-client-technician" className="flex items-center gap-2">
                        <User className="size-3.5 text-zinc-400 shrink-0" />
                        <span className="text-zinc-600 font-bold">{selectedEvent.technician || 'Carlos Barbosa (Técnico)'}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Bloco INFORMAÇÕES DO SERVIÇO */}
                <div id="service-block-info" className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Informações do Serviço
                  </span>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    <div className="bg-zinc-50/30 border border-zinc-150 p-2.5 rounded-lg">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Tipo de Serviço</span>
                      <span className="text-xs font-bold text-zinc-800 block truncate mt-0.5">
                        {selectedEvent.serviceType || 'Dedetização'}
                      </span>
                    </div>

                    <div className="bg-zinc-50/30 border border-zinc-150 p-2.5 rounded-lg">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Praga</span>
                      <span className="text-xs font-bold text-zinc-800 block truncate mt-0.5">
                        {selectedEvent.pest || 'Geral Rasteiros'}
                      </span>
                    </div>

                    <div className="bg-zinc-50/30 border border-zinc-150 p-2.5 rounded-lg col-span-2 sm:col-span-1">
                      <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Área & Complexidade</span>
                      <span className="text-xs font-bold text-zinc-800 block truncate mt-0.5">
                        {selectedEvent.area || '150 m²'} • {selectedEvent.complexity || 'Média'}
                      </span>
                    </div>

                    <div className="bg-zinc-50/30 border border-zinc-150 p-2.5 rounded-lg col-span-2 sm:col-span-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Valor do Contrato</span>
                        <span className="text-sm font-bold text-[#1B3A2D] mt-0.5 block">
                          {selectedEvent.type === 'retorno' ? 'R$ 0,00 (Retorno de Garantia)' : formatBRL(Number(selectedEvent.value || 450))}
                        </span>
                      </div>
                      
                      {/* Retorno button or badge */}
                      {selectedEvent.status === 'realizado' && (
                        <button
                          id="btn-opcao-retorno"
                          onClick={() => {
                            setReturnDate(new Date().toISOString().split('T')[0]); // prefill today
                            setIsReturnModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                        >
                          Registrar Retorno
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. Bloco PRODUTOS PREVISTOS */}
                <div id="service-block-products" className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Produtos Previstos
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedEvent.products && selectedEvent.products.length > 0 ? selectedEvent.products : ['Demand CS', 'Maxforce Barata']).map((prod: string, pidx: number) => {
                      // Check simulated stock availability
                      const isStockAvailable = pidx !== 2; // Simulate third product as insufficient just for realistic fidelity
                      return (
                        <div key={`${prod}-${pidx}`} className="flex items-center justify-between p-2 border border-zinc-150 bg-white rounded-lg">
                          <span className="text-xs font-bold text-zinc-800">{prod}</span>
                          
                          {isStockAvailable ? (
                            <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                              <span>🟢 Disponível</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                              <span>🔴 Insuficiente</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Bloco POP RELACIONADO */}
                <div id="service-block-pop" className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Procedimento Operacional Padrão (POP)
                  </span>

                  <div className="flex items-center justify-between p-3 border border-zinc-200 rounded-xl bg-slate-50/60">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-zinc-900 block truncate">
                        {selectedEvent.popName || 'POP-01: Procedimento Geral de Dedetização contra Baratas'}
                      </span>
                      <span className="text-[9px] text-[#1B3A2D] font-bold block">
                        Recomendações técnicas de segurança ativas
                      </span>
                    </div>

                    <button
                      id="btn-visualizar-pop"
                      onClick={() => {
                        // Find related procedures if exist or default mock POP
                        const matchingPop = popProcedures.find(p => p.name.includes(selectedEvent.pest || 'baratas')) || {
                          id: 'default-pop',
                          name: selectedEvent.popName || 'Controle Integrado DDSulf',
                          instructions: 'Fazer triagem visual, calçar luvas e máscara respiratória. Pulverizar solução de baraticida em frestas e fendas de despensas e cozinhas.'
                        };
                        setActivePopDetail(matchingPop);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#1B3A2D] text-white text-[10px] font-bold uppercase tracking-wider rounded-lg hover:bg-[#1B3A2D]/90 transition-colors cursor-pointer shrink-0"
                    >
                      <BookOpen className="size-3.5" /> Abrir POP
                    </button>
                  </div>
                </div>

                {/* 5. Bloco DOCUMENTOS */}
                <div id="service-block-documents" className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Documentos e Evidências
                  </span>

                  {/* Render simulated FileUpload component mapped per ID */}
                  <div className="p-1.5 border border-zinc-150 bg-white rounded-xl shadow-xs">
                    <FileUpload 
                      files={uploadedFilesMap[selectedEvent.id] || []}
                      onFilesChange={(newFiles) => {
                        setUploadedFilesMap(prev => ({
                          ...prev,
                          [selectedEvent.id]: newFiles
                        }));
                        toast.success('Documentação operacional atualizada!');
                      }}
                    />
                  </div>
                </div>

                {/* 6. Bloco HISTÓRICO / TIMELINE */}
                <div id="service-block-history" className="space-y-2">
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Histórico do Serviço / Ordem Técnico
                  </span>

                  <div className="p-4 border border-zinc-200 rounded-xl bg-white space-y-3.5 text-left">
                    {(selectedEvent.history || ['Orçamento criado', 'Serviço agendado', 'Serviço confirmado']).map((step: string, sidx: number, rawHistory: string[]) => {
                      const isLastStep = sidx === rawHistory.length - 1;
                      return (
                        <div key={`${step}-${sidx}`} className="flex items-start gap-3 relative">
                          {/* Timeline vertical bar connector */}
                          {!isLastStep && (
                            <span className="absolute left-1.5 top-4 w-[1px] h-6 bg-zinc-200" />
                          )}
                          
                          <div className={`mt-1 size-3 rounded-full shrink-0 flex items-center justify-center border
                            ${isLastStep ? 'bg-[#1B3A2D] border-[#1B3A2D]' : 'bg-zinc-200 border-zinc-300'}`}
                          >
                            <span className="size-1 bg-white rounded-full" />
                          </div>
                          
                          <div className="space-y-0.5">
                            <h5 className={`text-[11.5px] font-bold ${isLastStep ? 'text-[#1B3A2D]' : 'text-zinc-600'}`}>
                              {step}
                            </h5>
                            <p className="text-[9px] font-semibold text-zinc-400">
                              Passo operacional correspondido
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick actions bar for service execution */}
                {selectedEvent.status !== 'realizado' && (
                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-end">
                    <button
                      id="btn-concluir-servico-ativo"
                      onClick={() => handleQuickComplete(selectedEvent.id, selectedEvent.title)}
                      className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-emerald-800 hover:bg-emerald-950 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-800/10"
                    >
                      <Check className="size-4" /> Finalizar & Confirmar Execução Técnica
                    </button>
                  </div>
                )}

              </div>
            )}
          </div>
        </div>

      </div>

      {/* ==================================================== */}
      {/* 90-DAYS RETORNO GARANTIA MODAL (FORME RETORNO) */}
      {/* ==================================================== */}
      {isReturnModalOpen && selectedEvent && (
        <div id="retorno-dialog-overlap" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-xl"
          >
            {/* Modal header */}
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between text-left">
              <div>
                <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                  Registrar Retorno de Garantia
                </h3>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                  Original: {selectedEvent.clientName} ({formatDate(selectedEvent.date)})
                </p>
              </div>
              <button 
                id="btn-close-retornodialog"
                onClick={() => setIsReturnModalOpen(false)}
                className="p-1 hover:bg-zinc-50 border border-zinc-200 rounded-lg cursor-pointer"
              >
                <X className="size-4 text-zinc-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="p-6 space-y-4 text-left">
              
              {/* Date Input for automated count check */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">Data de Retorno *</label>
                <input
                  id="return-date-picker"
                  type="date"
                  required
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-sans text-zinc-800 focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                />
              </div>

              {/* AUTOMATED CALCULATION RESPONSE */}
              <div id="warranty-verification-response">
                {returnCalculation.isActive ? (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl space-y-2 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                        Garantia Ativa
                      </span>
                      <span className="text-[11px] font-bold text-emerald-800">
                        Classificado: Retorno Garantia ({returnCalculation.diffDays} dias passados)
                      </span>
                    </div>
                    <p className="text-[10.5px] text-emerald-700 font-semibold leading-relaxed">
                      Esta operação é classificada como assistência técnica de retenção. Não gera receita/faturamento financeiro na empresa. Gera apenas custos de logística e materiais.
                    </p>
                  </div>
                ) : (
                  <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl space-y-2 text-left">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded uppercase">
                        Garantia Encerrada
                      </span>
                      <span className="text-[11px] font-bold text-rose-800">
                        {returnCalculation.diffDays < 0 ? 'Data inválida (anterior ao serviço)' : `Passaram-se ${returnCalculation.diffDays} dias do serviço original (Limite 90 dias)`}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-rose-700 font-semibold leading-relaxed">
                      O prazo de 90 dias de cobertura expirou. Novos acionamentos de dedetização devem passar por nova precificação comercial.
                    </p>
                  </div>
                )}
              </div>

              {/* Motivo do acionamento */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">Motivo do Rechamado *</label>
                <input
                  id="return-reason-input"
                  type="text"
                  required
                  placeholder="Ex: Reaparecimento de formigas doceiras na cozinha"
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-sans text-zinc-800 focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                />
              </div>

              {/* Observações */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">Observações de Campo</label>
                <textarea
                  id="return-notes-input"
                  placeholder="Instruções para o técnico, horário de preferência, etc."
                  value={returnNotes}
                  onChange={(e) => setReturnNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-sans text-zinc-800 focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none resize-none"
                />
              </div>

              {/* Footer actions depending on 90 days validity */}
              <div className="flex items-center justify-end gap-2.5 pt-3.5 border-t border-zinc-100 mt-2">
                <button
                  type="button"
                  onClick={() => setIsReturnModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-[#6B6B5F] text-[10.5px] font-black uppercase tracking-wider rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  Cancelar
                </button>
                
                {returnCalculation.isActive ? (
                  <button
                    id="btn-confirmar-retorno"
                    onClick={handleSaveReturn}
                    className="px-5 py-2 bg-[#1B3A2D] text-white text-[10.5px] font-black uppercase tracking-wider rounded-lg hover:bg-[#1B3A2D]/90 transition-colors cursor-pointer"
                  >
                    Confirmar Retorno de Garantia
                  </button>
                ) : (
                  <button
                    id="btn-gerar-orcamento"
                    type="button"
                    onClick={() => {
                      setIsReturnModalOpen(false);
                      toast.info('Instanciando novo fluxo comercial...');
                      // Custom redirect to calculator page or standard toast
                      setTimeout(() => {
                        window.location.hash = '#/calculator';
                      }, 400);
                    }}
                    className="px-5 py-2 bg-amber-600 text-white text-[10.5px] font-black uppercase tracking-wider rounded-lg hover:bg-amber-700 transition-all cursor-pointer"
                  >
                    Gerar Novo Orçamento
                  </button>
                )}
              </div>

            </div>
          </motion.div>
        </div>
      )}

      {/* ==================================================== */}
      {/* ADICIONAR / EDITAR COMPROMISSO GENERAL MODAL */}
      {/* ==================================================== */}
      {isModalOpen && (
        <div id="form-active-dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-zinc-200 rounded-2xl max-w-xl w-full overflow-hidden shadow-xl"
          >
            {/* Modal header */}
            <div className="px-6 py-4.5 border-b border-zinc-100 flex items-center justify-between text-left">
              <div>
                <h3 className="text-xs font-black text-zinc-900 uppercase tracking-wider">
                  {modalMode === 'create' ? 'Agendar Nova Atividade Operacional' : 'Editar Atividade Operacional'}
                </h3>
                <p className="text-[10px] text-zinc-400 font-semibold mt-0.5">
                  Preencha os dados do agendamento para a escala técnica da DDSulf.
                </p>
              </div>
              <button 
                id="btn-formmodal-close"
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-zinc-50 border border-zinc-200 rounded-lg cursor-pointer"
              >
                <X className="size-4 text-zinc-500" />
              </button>
            </div>

            {/* Form body */}
            <form onSubmit={handleSaveEvent} className="p-6 space-y-4 text-left max-h-[500px] overflow-y-auto">
              
              {/* Row 0: Active Type Select */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Tipo de Atividade</label>
                  <select
                    value={activeFormType}
                    onChange={(e) => setActiveFormType(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 font-sans focus:outline-none"
                  >
                    <option value="servico">Serviço Técnico (OS)</option>
                    <option value="retorno">Retorno de Cobrança / Rechamado</option>
                    <option value="visita">Venda / Visita Técnica de Avaliação</option>
                    <option value="recorrencia">Fidelização / Recorrência</option>
                    <option value="outro">Outros Eventos</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Status Operacional</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 font-sans focus:outline-none"
                  >
                    <option value="pendente">Pendente (Agendado)</option>
                    <option value="confirmado">Confirmado (Em prontidão)</option>
                    <option value="realizado">Realizado (Fechamento técnico)</option>
                  </select>
                </div>
              </div>

              {/* Title Input */}
              <div className="space-y-1">
                <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Título do Compromisso *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: OS #2203 - Dedetização Preventiva Rasteiros"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-sans text-zinc-800 focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                />
              </div>

              {/* Client Selector (Sync with store clientList if possible) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Nome do Cliente / Local *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Ex: Condomínio Royal"
                      value={formClientName}
                      onChange={(e) => {
                        setFormClientName(e.target.value);
                        // Try matching phone/address from list if matches names
                        const matchingClient = clientList.find(c => c.name.toLowerCase().includes(e.target.value.toLowerCase()));
                        if (matchingClient) {
                          setFormClientId(matchingClient.id);
                          setFormPhone(matchingClient.phone || '');
                          setFormAddress(matchingClient.address || '');
                        }
                      }}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                    />
                    
                    {/* Tiny auto-complete helper feedback */}
                    {clientList.length > 0 && formClientName && !formClientId && (
                      <div className="absolute right-2 top-2 text-[9px] text-zinc-400 font-semibold bg-zinc-100 px-1.5 rounded">
                        Pesquisando...
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Telefone para Contato</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Address & City Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Endereço de Aplicação</label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Cidade / Estado</label>
                  <input
                    type="text"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Scheduling Date & Time Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Data *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Horário</label>
                  <input
                    type="time"
                    value={formTime}
                    onChange={(e) => setFormTime(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Técnico Designado</label>
                  <input
                    type="text"
                    value={formTechnician}
                    onChange={(e) => setFormTechnician(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                  />
                </div>
              </div>

              {/* Ficha Técnica: Service Type, target pests, dimensions, values */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-1.5 border-t border-zinc-100">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Metodologia</label>
                  <input
                    type="text"
                    value={formServiceType}
                    onChange={(e) => setFormServiceType(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Praga Alvo</label>
                  <input
                    type="text"
                    value={formPest}
                    onChange={(e) => setFormPest(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Área (m²)</label>
                  <input
                    type="text"
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Complexidade</label>
                  <select
                    value={formComplexity}
                    onChange={(e) => setFormComplexity(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none"
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>

              {/* Price contract, POP procedure */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Valor Cobrado (R$)</label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-sans text-zinc-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">POP Relacionado</label>
                  <select
                    value={formPopName}
                    onChange={(e) => setFormPopName(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-xs text-zinc-800 focus:outline-none"
                  >
                    {[
                      'POP-01: Controle de Baratas Germânicas',
                      'POP-02: Instalação de Iscas Perimetral para Ratos',
                      'POP-03: Barreira Química Cupins de Solo',
                      'POP-04: Sanitização de Ambientes de Saúde'
                    ].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* General Field Notes */}
              <div className="space-y-1">
                <label className="text-[9.5px] font-bold uppercase tracking-wider text-zinc-400">Observações Extras para o Técnico</label>
                <textarea
                  placeholder="Ex: Clavulagem prévia, cuidados com animais domésticos no local..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3.5 py-2 text-xs font-sans text-zinc-800 focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none resize-none"
                />
              </div>

              {/* Modal controls */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-zinc-200 text-[#6B6B5F] text-[10.5px] font-black uppercase tracking-wider rounded-lg hover:bg-zinc-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B3A2D] text-white text-[10.5px] font-black uppercase tracking-wider rounded-lg hover:bg-emerald-850 cursor-pointer transition-colors"
                >
                  Confirmar e Reescalar
                </button>
              </div>

            </form>
          </motion.div>
        </div>
      )}

      {/* ==================================================== */}
      {/* OVERLAY POP INSTRUCTION DOCUMENT DIALOG */}
      {/* ==================================================== */}
      {activePopDetail && (
        <div id="pop-instruction-dialog" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in font-sans">
            <div className="px-6 py-4.5 border-b border-zinc-150 bg-slate-50 flex items-center justify-between text-left">
              <div>
                <span className="text-[9px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded uppercase">
                  DDSulf Ficha Operacional
                </span>
                <h4 className="text-sm font-bold text-zinc-905 block truncate mt-1">
                  {activePopDetail.name}
                </h4>
              </div>
              <button 
                id="btn-close-popdialog"
                onClick={() => setActivePopDetail(null)}
                className="p-1 hover:bg-zinc-100 border border-zinc-200 rounded-lg cursor-pointer"
              >
                <X className="size-4 text-zinc-500" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-left">
              <div className="space-y-1.5">
                <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">
                  Instruções de Execução em Campo
                </span>
                <div className="p-4 bg-zinc-50 border border-zinc-150 rounded-xl leading-relaxed text-zinc-700 font-medium">
                  "{activePopDetail.instructions || 'Fazer triagem visual de ninhos. Utilizar luvas de nitrila e óculos de proteção. Aplicar gel frestas de cozinhas e pulverizar perímetros em caixas de gordura.'}"
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Duração Estimada</span>
                  <p className="font-bold text-zinc-800 text-[11px]">~45 Minutos por 100m²</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Inspeção Requerida</span>
                  <p className="font-bold text-[#1B3A2D] text-[11px]">Selo de Controle DDSulf v4</p>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 flex items-center justify-end">
                <button
                  id="btn-close-popdialog-footer"
                  onClick={() => setActivePopDetail(null)}
                  className="px-4 py-2 bg-zinc-900 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Fechar Procedimento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
