import React, { useState, useMemo } from 'react';
import { useSystemStore } from '@/store/systemStore';
import { 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  User, 
  Activity, 
  Search, 
  Briefcase, 
  MapPin, 
  AlertCircle,
  TrendingUp,
  Sliders,
  CheckCircle2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'motion/react';

export function DisponibilidadeTecnicos() {
  const { quotes, agenda, employees } = useSystemStore();
  const [weekOffset, setWeekOffset] = useState(0); // 0 = current week, 1 = next week, etc.
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCell, setSelectedCell] = useState<{ techName: string; dateStr: string; formattedDate: string } | null>(null);

  // Compute all unique technicians currently in system
  const techniciansList = useMemo(() => {
    const fromEmployees = (employees || [])
      .filter(e => e.active !== false && (e.role === 'tecnico' || !e.role))
      .map(e => ({
        name: e.name,
        role: e.role === 'tecnico' ? 'Técnico Aplicador' : (e.role || 'Colaborador'),
        color: 'bg-[#1B3A2D]'
      }));

    const fromQuotes = (quotes?.list || [])
      .map(q => q.scheduledTechnician)
      .filter((t): t is string => !!t && t.trim().length > 0);

    const fromAgenda = (agenda || [])
      .map(e => {
        const match = e.notes?.match(/Técnico:\s*([^|]+)/i);
        return match ? match[1].trim() : null;
      })
      .filter((t): t is string => !!t);

    const allNames = Array.from(new Set([...fromEmployees.map(e => e.name), ...fromQuotes, ...fromAgenda]));
    
    const palette = ['bg-[#1B3A2D]', 'bg-emerald-600', 'bg-sky-600', 'bg-purple-600', 'bg-amber-600', 'bg-indigo-600'];

    return allNames.map((name, idx) => {
      const matchEmp = fromEmployees.find(e => e.name.toLowerCase() === name.toLowerCase());
      return {
        name,
        role: matchEmp?.role || 'Técnico de Campo',
        color: palette[idx % palette.length]
      };
    });
  }, [employees, quotes?.list, agenda]);

  // Filter tech list by search input
  const filteredTechnicians = useMemo(() => {
    if (!searchTerm.trim()) return techniciansList;
    return techniciansList.filter(t => 
      t.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      t.role.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [techniciansList, searchTerm]);

  // Helper: Get Monday to Sunday for the selected week offset
  const weekDays = useMemo(() => {
    const current = new Date();
    // Adjust key to first day of current week (Monday) plus offset weeks
    const currentDay = current.getDay();
    const diffToMonday = current.getDate() - currentDay + (currentDay === 0 ? -6 : 1);
    const startOfWeek = new Date(current.setDate(diffToMonday + (weekOffset * 7)));

    const days = [];
    const weekdaysNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      days.push({
        name: weekdaysNames[i],
        dayOfMonth: d.getDate(),
        month: d.toLocaleString('pt-BR', { month: 'short' }).replace('.', ''),
        dateStr,
        isToday: new Date().toDateString() === d.toDateString()
      });
    }
    return days;
  }, [weekOffset]);

  // Helper to get services matching a tech name and date string
  const getServicesForTechAndDate = (techName: string, dateStr: string) => {
    // 1. Matches via scheduled quotes
    const matchedQuotes = (quotes?.list || []).filter(q => 
      q.scheduledDate === dateStr && 
      q.scheduledTechnician?.toLowerCase() === techName.toLowerCase()
    );

    // 2. Matches via agenda events notes (avoid repeats of quote ids already referenced)
    const matchedAgenda = (agenda || []).filter(e => {
      if (e.date !== dateStr) return false;
      
      if (e.quoteId && matchedQuotes.some(q => q.id === e.quoteId)) {
        return false; 
      }

      const lowerNotes = e.notes?.toLowerCase() || '';
      return lowerNotes.includes(`técnico: ${techName.toLowerCase()}`) || 
             lowerNotes.includes(`tecnico: ${techName.toLowerCase()}`);
    });

    return [
      ...matchedQuotes.map(q => ({
        id: q.id,
        clientName: q.client?.name || 'Cliente Particular',
        time: q.scheduledTime || '08:00',
        serviceType: q.service?.serviceType || 'Controle de Pragas',
        pestType: q.service?.pestType || 'Geral',
        address: q.client?.address || 'Sem endereço',
        status: q.status,
        type: 'servico'
      })),
      ...matchedAgenda.map(e => ({
        id: e.id,
        clientName: e.clientName || 'Cliente Particular',
        time: e.time || '08:00',
        serviceType: e.title || 'Serviço Operacional',
        pestType: 'Retorno/Assistência',
        address: e.notes?.split('|')[1]?.trim() || e.notes || 'Sem endereço',
        status: e.status === 'confirmado' ? 'aprovado' : 'pendente',
        type: e.type || 'retorno'
      }))
    ].sort((a, b) => a.time.localeCompare(b.time));
  };

  // Helper for translating service codes
  const resolveServiceLabel = (type: string, pest: string): string => {
    const rawType = type.toLowerCase();
    if (rawType.includes('dede')) return `Dedetização - ${pest}`;
    if (rawType.includes('desra')) return `Desratização - ${pest}`;
    if (rawType.includes('descu')) return `Descupinização - ${pest}`;
    if (rawType.includes('sani')) return `Sanitização - ${pest}`;
    return type;
  };

  // Calculate stats for selected week offset
  const weekStats = useMemo(() => {
    let totalAssigned = 0;
    const techCounts: Record<string, number> = {};

    techniciansList.forEach(tech => {
      techCounts[tech.name] = 0;
      weekDays.forEach(day => {
        const count = getServicesForTechAndDate(tech.name, day.dateStr).length;
        totalAssigned += count;
        techCounts[tech.name] += count;
      });
    });

    const highestWorkloadTech = Object.entries(techCounts).reduce((max, curr) => 
      curr[1] > max[1] ? curr : max, ["Nenhum", 0]);

    return {
      totalAssigned,
      highestWorkloadTechName: highestWorkloadTech[0],
      highestWorkloadCount: highestWorkloadTech[1]
    };
  }, [techniciansList, weekDays]);

  // Selected cell details computed
  const selectedCellServices = useMemo(() => {
    if (!selectedCell) return [];
    return getServicesForTechAndDate(selectedCell.techName, selectedCell.dateStr);
  }, [selectedCell, quotes, agenda]);

  const handleCellClick = (techName: string, dateStr: string, formattedDate: string) => {
    if (selectedCell && selectedCell.techName === techName && selectedCell.dateStr === dateStr) {
      setSelectedCell(null);
    } else {
      setSelectedCell({ techName, dateStr, formattedDate });
    }
  };

  return (
    <section id="section-carga-de-tecnicos" className="space-y-4 animate-in fade-in duration-200">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Sliders className="size-5 text-[#1B3A2D]" />
            Disponibilidade de Técnicos
          </h2>
          <p className="text-xs font-medium text-slate-450 mt-1">
            Gestão inteligente de capacidade e grade horária semanal de técnicos de campo.
          </p>
        </div>

        {/* WEEK COMMUTATOR SELECTOR */}
        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            onClick={() => setWeekOffset(prev => prev - 1)}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 transition-all rounded-xl cursor-pointer"
            title="Semana Anterior"
          >
            <ChevronLeft className="size-4 text-slate-600" />
          </button>
          
          <button
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-2 text-xs font-bold rounded-xl transition-all border ${
              weekOffset === 0 
                ? 'bg-[#1B3A2D] text-white border-[#1B3A2D] shadow-xs' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Semana Atual
          </button>

          <button
            onClick={() => setWeekOffset(prev => prev + 1)}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 active:scale-95 transition-all rounded-xl cursor-pointer"
            title="Próxima Semana"
          >
            <ChevronRight className="size-4 text-slate-600" />
          </button>

          <span className="text-xs font-mono font-bold text-slate-500 pl-2">
            (f{weekOffset >= 0 ? `+${weekOffset}` : weekOffset} sem)
          </span>
        </div>
      </div>

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50/50 border border-slate-200/65 p-3.5 rounded-2xl flex items-center gap-3.5">
          <div className="p-2 bg-emerald-50 text-[#1B3A2D] rounded-xl shrink-0">
            <Calendar className="size-4" />
          </div>
          <div>
            <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Período Selecionado</span>
            <strong className="text-xs text-slate-800 font-bold block mt-0.5">
              {weekDays[0].dayOfMonth} de {weekDays[0].month} — {weekDays[6].dayOfMonth} de {weekDays[6].month}
            </strong>
          </div>
        </div>

        <div className="bg-slate-50/50 border border-slate-200/65 p-3.5 rounded-2xl flex items-center gap-3.5">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Activity className="size-4" />
          </div>
          <div>
            <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Serviços na Semana</span>
            <strong className="text-xs text-slate-800 font-bold block mt-0.5">
              {weekStats.totalAssigned} ordens de serviço agendadas
            </strong>
          </div>
        </div>

        <div className="bg-slate-50/50 border border-slate-200/65 p-3.5 rounded-2xl flex items-center gap-3.5">
          <div className="p-2 bg-amber-50 text-amber-600 rounded-xl shrink-0">
            <User className="size-4" />
          </div>
          <div>
            <span className="block text-[9px] font-mono font-bold text-slate-400 uppercase tracking-wider">Maior Carregamento</span>
            <strong className="text-xs text-slate-800 font-bold block mt-0.5 truncate max-w-[200px]">
              {weekStats.highestWorkloadCount > 0 
                ? `${weekStats.highestWorkloadTechName} (${weekStats.highestWorkloadCount} OS)` 
                : 'Escala em aberto / Disponível'}
            </strong>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="text"
          placeholder="Pesquisar por técnico ou cargo de atuação..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full h-10 pl-10 pr-4 bg-white border border-[#E8E6E1] hover:border-slate-300 rounded-xl text-xs text-[#141410] outline-none focus:ring-2 focus:ring-[#1B3A2D]/5 focus:border-[#1B3A2D] transition-all"
        />
      </div>

      {/* GRID CONTAINER */}
      <Card className="bg-white border border-[#E8E6E1] rounded-2xl shadow-xxs overflow-hidden">
        <div className="overflow-x-auto">
          <div className="min-w-[800px] divide-y divide-slate-100">
            
            {/* GRID HEADER */}
            <div className="grid grid-cols-12 bg-slate-50/80 items-center py-3.5 text-xs font-semibold text-slate-500">
              <div className="col-span-3 pl-6">
                TÉCNICO / ESPECIALIDADE
              </div>
              
              <div className="col-span-7 grid grid-cols-7 gap-2 px-4 text-center">
                {weekDays.map((day) => (
                  <div 
                    key={day.dateStr} 
                    className={`flex flex-col items-center justify-center p-1 rounded-lg ${
                      day.isToday ? 'bg-[#1B3A2D]/10 text-[#1B3A2D]' : ''
                    }`}
                  >
                    <span className="text-[10px] font-bold uppercase tracking-wider">{day.name}</span>
                    <strong className="text-sm font-black mt-0.5">{day.dayOfMonth}</strong>
                  </div>
                ))}
              </div>

              <div className="col-span-2 pr-6 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">
                CARGA TOTAL
              </div>
            </div>

            {/* GRID BODY */}
            {techniciansList.length === 0 ? (
              <div className="py-12 px-4 text-center">
                <p className="text-slate-500 font-semibold text-xs mb-1">
                  Nenhum técnico ou aplicador cadastrado no momento.
                </p>
                <p className="text-slate-400 text-[11px] max-w-md mx-auto">
                  Cadastre seus colaboradores no menu <strong className="text-slate-600">Funcionários</strong> para acompanhar a disponibilidade, escalas e carregamento de ordens de serviço.
                </p>
              </div>
            ) : filteredTechnicians.length === 0 ? (
              <div className="py-12 text-center text-slate-400 font-bold text-xs">
                Nenhum técnico encontrado para o termo "{searchTerm}".
              </div>
            ) : (
              filteredTechnicians.map((tech) => {
                // Compute total services listed for this technician in the current week view
                let techWeeklyTotal = 0;
                const daysData = weekDays.map((day) => {
                  const services = getServicesForTechAndDate(tech.name, day.dateStr);
                  techWeeklyTotal += services.length;
                  return {
                    day,
                    servicesCount: services.length
                  };
                });

                // Compute utilization percent capacity (arbitrary scale: 10 OS per week is 100% standard goal load)
                const goalLoad = 10;
                const loadPercent = Math.min(100, Math.round((techWeeklyTotal / goalLoad) * 100));

                return (
                  <div key={tech.name} className="grid grid-cols-12 items-center py-4 hover:bg-slate-50/45 transition-colors">
                    
                    {/* Tech details */}
                    <div className="col-span-3 pl-6 flex items-center gap-3.5">
                      <div className={`size-9 rounded-xl ${tech.color} text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0`}>
                        {tech.name.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-extrabold text-slate-900 leading-none truncate pr-2" title={tech.name}>
                          {tech.name}
                        </h4>
                        <span className="text-[10px] font-semibold text-slate-400 block mt-1 truncate max-w-[150px] lg:max-w-none">
                          {tech.role}
                        </span>
                      </div>
                    </div>

                    {/* Week day cells */}
                    <div className="col-span-7 grid grid-cols-7 gap-2 px-4">
                      {daysData.map(({ day, servicesCount }) => {
                        // Classify color depending on workload intensity
                        let intensityClass = 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100/50';
                        let labelText = 'Livre';
                        
                        if (servicesCount === 1) {
                          intensityClass = 'bg-emerald-50 text-emerald-800 border-emerald-150/70 hover:bg-emerald-100/40';
                          labelText = '1 OS';
                        } else if (servicesCount === 2) {
                          intensityClass = 'bg-sky-50 text-sky-800 border-sky-150/70 hover:bg-sky-100/40';
                          labelText = '2 OS';
                        } else if (servicesCount >= 3) {
                          intensityClass = 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100/40';
                          labelText = `${servicesCount} OS`;
                        }

                        const cellFormattedDate = `${day.dayOfMonth} de ${day.month}`;
                        const isCurrentlySelected = selectedCell && selectedCell.techName === tech.name && selectedCell.dateStr === day.dateStr;

                        return (
                          <button
                            type="button"
                            key={day.dateStr}
                            onClick={() => handleCellClick(tech.name, day.dateStr, cellFormattedDate)}
                            className={`h-[48px] rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer select-none active:scale-95 ${intensityClass} ${
                              isCurrentlySelected ? 'ring-2 ring-[#1B3A2D] bg-[#1B3A2D]/5 scale-97' : ''
                            }`}
                          >
                            <span className="text-[11px] font-black">{labelText}</span>
                            <span className="text-[8px] font-semibold tracking-wider uppercase opacity-65 mt-0.5">
                              {servicesCount > 0 ? 'ocupado' : 'disponível'}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Aggregated load stats */}
                    <div className="col-span-2 pr-6 text-center space-y-1">
                      <span className="text-xs font-black text-slate-800 block">
                        {techWeeklyTotal} serv.
                      </span>
                      {/* Workload progress bar */}
                      <div className="w-[80px] h-1.5 bg-slate-100 rounded-full mx-auto overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            loadPercent >= 90 ? 'bg-amber-500' : loadPercent >= 50 ? 'bg-sky-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${loadPercent}%` }}
                        />
                      </div>
                      <span className="text-[9px] font-bold text-slate-400 block uppercase">
                        {loadPercent}% Cap.
                      </span>
                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>
      </Card>

      {/* CELL DETAILS PANEL (EXPANDED ON CLICK) */}
      <AnimatePresence>
        {selectedCell && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="p-5 bg-white border border-[#E8E6E1] rounded-2xl shadow-md text-left space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="size-8 bg-[#E3EFE5] text-[#1B3A2D] rounded-lg flex items-center justify-center shrink-0">
                  <User className="size-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wide leading-none">
                    Escala de Serviço: {selectedCell.techName}
                  </h3>
                  <span className="text-[10px] text-slate-500 font-semibold block mt-1.5 flex items-center gap-1">
                    <Calendar className="size-3.5" />
                    {selectedCell.formattedDate} ({weekDays.find(d => d.dateStr === selectedCell.dateStr)?.name})
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${
                  selectedCellServices.length === 0 
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                    : selectedCellServices.length >= 3 
                    ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                    : 'bg-indigo-50 text-indigo-800 border border-indigo-150'
                }`}>
                  {selectedCellServices.length === 0 ? 'Disponível' : `${selectedCellServices.length} serviço(s) agendados`}
                </span>
                
                <button
                  onClick={() => setSelectedCell(null)}
                  className="px-2.5 py-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 font-bold text-xs rounded-lg cursor-pointer transition-colors"
                >
                  Fechar details
                </button>
              </div>
            </div>

            {/* List Services */}
            {selectedCellServices.length === 0 ? (
              <div className="py-6 flex flex-col items-center justify-center text-center space-y-2">
                <CheckCircle2 className="size-6 text-emerald-500" />
                <span className="text-xs font-extrabold text-slate-700">Técnico totalmente livre nesta data</span>
                <p className="text-[11px] text-slate-450">Nova Ordem de Serviço pode ser agendada para este colaborador sem risco de colisão.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCellServices.map((service, idx) => (
                  <div 
                    key={`${service.id}-${idx}`}
                    className="p-3.5 bg-slate-50/70 border border-slate-200 rounded-xl space-y-2.5 flex flex-col justify-between"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 block font-mono">CLIENTE</span>
                        <strong className="text-xs font-bold text-slate-800 leading-snug block">
                          {service.clientName}
                        </strong>
                      </div>
                      <div className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-mono font-bold text-slate-600 flex items-center gap-1 select-none">
                        <Clock className="size-3" />
                        {service.time}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-1.5 text-[11px] text-slate-600 border-t border-slate-200/60 pt-2">
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="size-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">
                          <strong>Serviço:</strong> {resolveServiceLabel(service.serviceType, service.pestType)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="size-3.5 text-slate-400 shrink-0" />
                        <span className="truncate" title={service.address}>
                          <strong>Local:</strong> {service.address}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/40">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                        service.status === 'executado' || service.status === 'realizado'
                          ? 'bg-teal-50 text-teal-700 border border-teal-100'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {service.status === 'executado' || service.status === 'realizado' ? 'concluído' : 'agendado'}
                      </span>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

    </section>
  );
}
