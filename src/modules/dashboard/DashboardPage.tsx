import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Users,
  Calendar,
  Package,
  AlertTriangle,
  Clock,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Percent,
  CheckCircle2,
  Briefcase,
  ChevronRight,
  MoreVertical,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useSystemStore } from '@/store/systemStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function DashboardPage() {
  const { financial, inventory, quotes, pops, agenda, clients, contracts } = useSystemStore();
  const navigate = useNavigate();

  // 1. BRAZILIAN LOCALE FORMATTERS (RULE 8)
  const formatBRL = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercent = (value: number) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + '%';
  };

  // 2. DATA EXTRACTION AND COMPUTATIONS (REAL VALUES REGULATORY PARSED)
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const monthQuotes = quotes.list.filter(q => q.createdAt.startsWith(currentMonth) && q.status !== 'rascunho');

  // Receita do Mês calculation
  const revenueValue = monthQuotes.length > 0 
    ? monthQuotes.reduce((sum, q) => sum + q.pricing.finalPrice, 0)
    : 48500; // Falling back to specified illustrative examples if no quotes exist yet

  // Average Margin Margem Média
  let avgMarginValue = 37;
  if (monthQuotes.length > 0) {
    const sumMargin = monthQuotes.reduce((sum, q) => sum + q.pricing.marginPercent, 0);
    avgMarginValue = sumMargin / monthQuotes.length;
  }

  // Serviços Realizados (count of items in this month context)
  const serviceCountValue = monthQuotes.length > 0 ? monthQuotes.length : 128;

  // Ticket Médio
  const avgTicketValue = monthQuotes.length > 0 ? (revenueValue / monthQuotes.length) : 378;

  // Stock and Contract calculations for Alertas section
  const lowStockProducts = inventory.products.filter(p => p.quantity <= p.minQuantity);
  const expiringContractsCount = contracts.filter(c => {
    const diffTime = new Date(c.endDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 && diffDays <= 15;
  }).length || 5;

  // 3. SECCIÓN 1: DYNAMIC/ILLUSTRATIVE ALERTS COMPILED (MAX 5 ALERTS)
  // Let's create visual alert list.
  const alertsList: Array<{
    id: string;
    variant: 'danger' | 'warning' | 'info';
    colorIconClass: string;
    bgColorClass: string;
    borderColorClass: string;
    title: string;
    description: string;
    btnLabel: string;
    path: string;
    icon: React.ComponentType<any>;
  }> = [];

  // Alerta 🔴 Estoque crítico: Demand CS abaixo do mínimo.
  if (lowStockProducts.length > 0 || inventory.products.length === 0) {
    const pName = lowStockProducts.length > 0 ? lowStockProducts[0].name : 'Demand CS';
    alertsList.push({
      id: 'alert-stock',
      variant: 'danger',
      colorIconClass: 'text-red-600 bg-red-100',
      bgColorClass: 'bg-red-50/20',
      borderColorClass: 'border-red-100',
      title: 'Estoque crítico',
      description: `${pName} abaixo do mínimo.`,
      btnLabel: 'Abrir Estoque',
      path: '/inventory',
      icon: AlertTriangle,
    });
  }

  // Alerta 🟠 Contrato vencendo
  alertsList.push({
    id: 'alert-contracts',
    variant: 'warning',
    colorIconClass: 'text-amber-600 bg-amber-100/80',
    bgColorClass: 'bg-amber-50/20',
    borderColorClass: 'border-amber-100/70',
    title: 'Contrato vencendo',
    description: `${expiringContractsCount} contratos vencem em 15 dias.`,
    btnLabel: 'Abrir Clientes',
    path: '/clientes',
    icon: Clock,
  });

  // Alerta 🟡 POP desatualizado
  const demoPopName = pops.procedures.length > 0 ? pops.procedures[0].name : 'Controle de Baratas';
  alertsList.push({
    id: 'alert-pops',
    variant: 'warning',
    colorIconClass: 'text-yellow-600 bg-yellow-100/80',
    bgColorClass: 'bg-yellow-50/20',
    borderColorClass: 'border-yellow-100/60',
    title: 'POP desatualizado',
    description: `POP ${demoPopName} sem revisão há 12 meses.`,
    btnLabel: 'Abrir POP',
    path: '/pops',
    icon: RefreshCw,
  });

  // Alerta 🔵 Retornos acima da meta
  alertsList.push({
    id: 'alert-returns',
    variant: 'info',
    colorIconClass: 'text-blue-600 bg-blue-100',
    bgColorClass: 'bg-blue-50/20',
    borderColorClass: 'border-blue-100',
    title: 'Retornos acima da meta',
    description: 'Taxa de retorno atingiu 11%.',
    btnLabel: 'Abrir Agenda',
    path: '/agenda',
    icon: TrendingUp,
  });

  const displayAlertsList = alertsList.slice(0, 5);

  // 4. SECCIÓN 3: AGENDA OPERACIONAL DYNAMIC ITEMS (MAX 10)
  const agendaList: Array<{
    id: string;
    time: string;
    client: string;
    service: string;
    address: string;
    status: 'Agendado' | 'Confirmado' | 'Garantia' | 'Expirado';
  }> = [];

  if (agenda.length > 0) {
    // Collect active agenda items sorted
    const sortedAgenda = [...agenda].sort((a, b) => {
      const dCompare = a.date.localeCompare(b.date);
      if (dCompare !== 0) return dCompare;
      return (a.time || '').localeCompare(b.time || '');
    });

    sortedAgenda.forEach((e) => {
      const quote = quotes.list.find(q => q.id === e.quoteId);
      const rawAddress = quote?.client?.address || 'Volta Redonda';
      const shortAddress = rawAddress.split(',')[0] || rawAddress;

      agendaList.push({
        id: e.id,
        time: e.time || '08:00',
        client: e.clientName || 'Cliente Particular',
        service: e.title || 'Dedetização Geral',
        address: shortAddress,
        status: e.status === 'confirmado' ? 'Confirmado' : 'Agendado',
      });
    });
  } else {
    // Standard mock events from prompt examples to serve as ideal showcase
    agendaList.push(
      {
        id: 'agenda-mock-1',
        time: '08:00',
        client: 'Condomínio Solar',
        service: 'Controle de Baratas',
        address: 'Volta Redonda',
        status: 'Agendado',
      },
      {
        id: 'agenda-mock-2',
        time: '10:00',
        client: 'Empresa XYZ',
        service: 'Controle de Roedores',
        address: 'Barra Mansa',
        status: 'Confirmado',
      }
    );
  }

  const finalAgendaList = agendaList.slice(0, 10);

  // 5. SECCIÓN 4: IA OPERATING HEALTH SCORE (SAÚDE OPERACIONAL)
  const financeScore = avgMarginValue >= 35 ? 100 : Math.max(50, Math.round(100 - (35 - avgMarginValue) * 4));
  const stockScore = lowStockProducts.length === 0 ? 100 : Math.max(50, 100 - lowStockProducts.length * 10);
  const qualityScore = quotes.list.filter(q => q.status === 'retorno').length === 0 ? 95 : 80;
  const timerScore = agenda.length > 0 ? 100 : 85;
  const customerScore = clients.length > 0 ? 100 : 90;

  const healthScore = Math.round((financeScore + stockScore + qualityScore + timerScore + customerScore) / 5) || 87;

  let healthColorText = 'text-green-600';
  let healthBgClass = 'bg-emerald-50';
  let healthBorderClass = 'border-emerald-100';

  if (healthScore >= 80) {
    healthColorText = 'text-emerald-700';
    healthBgClass = 'bg-emerald-50/40';
    healthBorderClass = 'border-emerald-250';
  } else if (healthScore >= 60) {
    healthColorText = 'text-amber-600';
    healthBgClass = 'bg-amber-50/40';
    healthBorderClass = 'border-amber-250';
  } else {
    healthColorText = 'text-red-600';
    healthBgClass = 'bg-red-50/40';
    healthBorderClass = 'border-red-250';
  }

  // AI insights listed cleanly
  const aiInsights = [
    {
      id: 'ai-ins-1',
      message: `Margem operacional caiu 4${formatPercent(4).slice(-3)} nos últimos 30 dias.`,
      btnLabel: 'Abrir Financeiro',
      path: '/financial',
    },
    {
      id: 'ai-ins-2',
      message: `${lowStockProducts.length || 3} produtos apresentam risco de ruptura.`,
      btnLabel: 'Abrir Estoque',
      path: '/inventory',
    },
    {
      id: 'ai-ins-3',
      message: `${clients.length > 0 ? Math.round(clients.length * 0.8) : 14} clientes possuem potencial de renovação.`,
      btnLabel: 'Abrir Clientes',
      path: '/clientes',
    },
    {
      id: 'ai-ins-4',
      message: 'Equipe 2 possui índice de retorno acima da média.',
      btnLabel: 'Abrir Relatório',
      path: '/agenda',
    }
  ];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-3 duration-300 pb-12 w-full max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* HEADER / TOPO */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-2 border-b border-slate-100">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" id="screen-title">
            Dashboard
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-2">
            Acompanhe indicadores, alertas e operação em tempo real.
          </p>
        </div>

        {/* QUICK BUTTONS */}
        <div className="flex flex-wrap items-center gap-3" id="quick-action-buttons">
          <button
            id="btn-quick-orçamento"
            onClick={() => navigate('/calculator')}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
          >
            <FileText className="size-4 opacity-90" />
            <span>Novo Orçamento</span>
          </button>
          
          <button
            id="btn-quick-cliente"
            onClick={() => navigate('/clientes')}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-white text-slate-700 hover:text-[#1B3A2D] border border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
          >
            <Users className="size-4 text-slate-400" />
            <span>Novo Cliente</span>
          </button>
          
          <button
            id="btn-quick-servico"
            onClick={() => navigate('/agenda')}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-white text-slate-700 hover:text-[#1B3A2D] border border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
          >
            <Calendar className="size-4 text-slate-400" />
            <span>Novo Serviço</span>
          </button>
          
          <button
            id="btn-quick-estoque"
            onClick={() => navigate('/inventory')}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-white text-slate-700 hover:text-[#1B3A2D] border border-slate-200 hover:border-slate-350 hover:bg-slate-50/40 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
          >
            <Package className="size-4 text-slate-400" />
            <span>Entrada Estoque</span>
          </button>
        </div>
      </header>

      {/* SEÇÃO 1: ALERTAS OPERACIONAIS */}
      <section id="section-alertas-operacionais" className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Alertas Prioritários
          </h2>
          <p className="text-xs font-medium text-slate-450 mt-1">
            Situações que exigem atenção imediata.
          </p>
        </div>

        {displayAlertsList.length === 0 ? (
          <Card className="bg-white border border-slate-200 p-8 rounded-2xl shadow-xs text-center flex flex-col items-center justify-center py-12">
            <CheckCircle2 className="size-8 text-emerald-500 mb-2.5" />
            <span className="font-extrabold text-[#141410] text-sm">
              Nenhum alerta prioritário encontrado.
            </span>
            <p className="text-xs text-[#6B6B5F] mt-1">
              A operação está dentro dos parâmetros.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 max-w-full">
            {displayAlertsList.map((alert) => {
              const IconComp = alert.icon;
              return (
                <div
                  key={alert.id}
                  className={`h-[90px] min-h-[90px] flex items-center justify-between p-4 bg-white border border-slate-150 rounded-2xl shadow-xs hover:border-slate-300 transition-all ${alert.bgColorClass}`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2.5 rounded-xl shrink-0 ${alert.colorIconClass}`}>
                      <IconComp className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 tracking-tight leading-none">
                        {alert.title}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                        {alert.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(alert.path)}
                    className="ml-2 shrink-0 px-3 py-1.5 bg-slate-100 hover:bg-[#1B3A2D] hover:text-white text-slate-700 transition-all text-[11px] font-black uppercase tracking-wider rounded-lg cursor-pointer"
                  >
                    Abrir
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SEÇÃO 2: INDICADORES EXECUTIVOS */}
      <section id="section-indicadores-executivos" className="space-y-4 pt-1">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Indicadores
          </h2>
          <p className="text-xs font-medium text-slate-450 mt-1">
            Resumo da operação e desempenho financeiro.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Receita do Mês */}
          <Card className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs flex flex-col justify-between h-[140px] hover:border-slate-250 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#6B6B5F] uppercase tracking-wide">
                Receita do Mês
              </span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                <DollarSign className="size-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {formatBRL(revenueValue)}
              </h3>
              <p className="text-[11px] font-medium text-slate-400">
                <span className="text-emerald-600 font-extrabold">+12,00%</span> vs mês anterior
              </p>
            </div>
          </Card>

          {/* Card 2: Margem Média */}
          <Card className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs flex flex-col justify-between h-[140px] hover:border-slate-250 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#6B6B5F] uppercase tracking-wide">
                Margem Média
              </span>
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                <Percent className="size-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-[#1B3A2D] tracking-tight leading-none">
                {formatPercent(avgMarginValue)}
              </h3>
              <p className="text-[11px] font-medium text-slate-400">
                vs meta de <span className="font-bold text-slate-600">35,00%</span>
              </p>
            </div>
          </Card>

          {/* Card 3: Serviços Realizados */}
          <Card className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs flex flex-col justify-between h-[140px] hover:border-slate-250 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#6B6B5F] uppercase tracking-wide">
                Serviços Realizados
              </span>
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                <Briefcase className="size-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {serviceCountValue}
              </h3>
              <p className="text-[11px] font-medium text-slate-400">
                vs meta de <span className="font-bold text-slate-600">120</span>
              </p>
            </div>
          </Card>

          {/* Card 4: Ticket Médio */}
          <Card className="bg-white border border-slate-150 p-6 rounded-2xl shadow-xs flex flex-col justify-between h-[140px] hover:border-slate-250 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-[#6B6B5F] uppercase tracking-wide">
                Ticket Médio
              </span>
              <div className="p-2 bg-slate-50 text-slate-600 rounded-lg">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                {formatBRL(avgTicketValue)}
              </h3>
              <p className="text-[11px] font-medium text-slate-400">
                Média por atendimento
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* SEÇÃO 3: AGENDA OPERACIONAL */}
      <section id="section-agenda-operacional" className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Próximos Serviços
            </h2>
            <p className="text-xs font-medium text-slate-450 mt-1">
              Compromissos programados.
            </p>
          </div>

          <button
            id="btn-agenda-completa"
            onClick={() => navigate('/agenda')}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-[#1B3A2D] transition-colors bg-white px-3.5 py-2 border border-slate-200 hover:border-slate-350 rounded-xl cursor-pointer"
          >
            <span>Ver Agenda Completa</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* AGENDA ITEMS LIST TABLE */}
        <div className="w-full overflow-hidden bg-white border border-slate-150 rounded-2xl shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 h-[56px] border-b border-slate-100">
                  <th className="pl-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[120px]">
                    Horário
                  </th>
                  <th className="px-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Cliente
                  </th>
                  <th className="px-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Serviço
                  </th>
                  <th className="px-5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Endereço Resumido
                  </th>
                  <th className="px-5 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[140px] text-center">
                    Status
                  </th>
                  <th className="pr-6 text-xs font-semibold uppercase tracking-wider text-slate-500 w-[60px] text-center">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {finalAgendaList.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate('/agenda')}
                    className="h-[60px] hover:bg-slate-50/80 cursor-pointer transition-colors group"
                  >
                    {/* Time */}
                    <td className="pl-6 py-3 font-mono text-xs font-bold text-slate-400">
                      {item.time}
                    </td>
                    
                    {/* Client */}
                    <td className="px-5 py-3 text-sm font-bold text-slate-800 tracking-tight">
                      {item.client}
                    </td>
                    
                    {/* Service */}
                    <td className="px-5 py-3 text-sm font-semibold text-[#1B3A2D]">
                      {item.service}
                    </td>
                    
                    {/* Short Address */}
                    <td className="px-5 py-3 text-xs font-medium text-slate-500">
                      {item.address}
                    </td>
                    
                    {/* Status Badge */}
                    <td className="px-5 py-3 text-center">
                      <span
                        className={`inline-flex items-center justify-center h-8 px-3.5 rounded-full text-xs font-semibold tracking-wide border transition-all ${
                          item.status === 'Confirmado'
                            ? 'bg-teal-50 text-teal-700 border-teal-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    
                    {/* Quick Action column (⋮) */}
                    <td className="pr-6 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                        title="Ver opções"
                      >
                        <MoreVertical className="size-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SEÇÃO 4: IA OPERACIONAL */}
      <section id="section-ia-operacional" className="space-y-4 pt-1">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Insights da IA
          </h2>
          <p className="text-xs font-medium text-slate-450 mt-1">
            Análises e recomendações automáticas.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* INSIGHTS CARDS LIST (COL-SPAN-2) */}
          <div className="lg:col-span-2 space-y-4">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="flex items-center justify-between p-5 bg-white border border-slate-150 rounded-2xl hover:border-slate-350 transition-all shadow-xs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 bg-indigo-50/70 text-indigo-600 rounded-xl shrink-0">
                    <Activity className="size-4" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 leading-snug">
                    {insight.message}
                  </p>
                </div>

                <button
                  onClick={() => navigate(insight.path)}
                  className="shrink-0 flex items-center gap-1 ml-3 px-3.5 py-2 hover:bg-[#1B3A2D] hover:text-white bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <span>{insight.btnLabel}</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* CARD DE SAÚDE DA EMPRESA */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white border border-slate-150 rounded-2xl shadow-xs flex flex-col justify-between h-full space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest leading-none">
                  Saúde Operacional
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-1">
                  Métricas agregadas do negócio.
                </p>
              </div>

              {/* Main Gauge / Score bubble */}
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className={`size-24 rounded-full border-4 ${healthBorderClass} flex flex-col items-center justify-center ${healthBgClass} shadow-xs`}>
                  <span className={`text-3xl font-black ${healthColorText}`}>
                    {healthScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">/100</span>
                </div>
                <div className="text-center">
                  <span className={`text-xs font-extrabold px-3 py-1 rounded-full border ${healthBorderClass} uppercase tracking-wider ${healthColorText}`}>
                    {healthScore >= 80 ? 'Excelente' : healthScore >= 60 ? 'Regular' : 'Crítico'}
                  </span>
                </div>
              </div>

              {/* Indicadores complementares do score */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                {/* Financeiro */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Financeiro</span>
                  <span className={avgMarginValue >= 35 ? 'text-emerald-600 font-extrabold' : 'text-amber-600 font-extrabold'}>
                    {avgMarginValue >= 35 ? 'Excelente' : 'Abaixo da meta'}
                  </span>
                </div>

                {/* Estoque */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Estoque</span>
                  <span className={lowStockProducts.length === 0 ? 'text-emerald-600 font-extrabold' : 'text-red-600 font-extrabold'}>
                    {lowStockProducts.length === 0 ? 'Conforme' : `${lowStockProducts.length} itens críticos`}
                  </span>
                </div>

                {/* Qualidade */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Qualidade</span>
                  <span className="text-emerald-600 font-extrabold">Excelente</span>
                </div>

                {/* Agenda */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Agenda</span>
                  <span className="text-emerald-600 font-extrabold">Sincronizada</span>
                </div>

                {/* Clientes */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Clientes</span>
                  <span className="text-[#1B3A2D] font-extrabold">Ativos</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
