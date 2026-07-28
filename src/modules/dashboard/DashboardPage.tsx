import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
import { useSystemStore, selectMargemMesAnterior, selectContratosParaReajuste } from '@/store/systemStore';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatBRL, formatPercent } from '@/utils/format';
import { DisponibilidadeTecnicos } from './components/DisponibilidadeTecnicos';

export function DashboardPage() {
  const systemState = useSystemStore();
  const { financial, inventory, quotes, pops, agenda, clients, contracts, settings } = systemState;
  const navigate = useNavigate();

  // 2. DATA EXTRACTION AND COMPUTATIONS (REAL VALUES REGULATORY PARSED)
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  // Filter movements for current month that are RECEITAS and paid (Problem 1)
  const currentMonthMovements = useMemo(() => {
    return (financial?.movements || []).filter(m => 
      m.date && m.date.startsWith(currentMonth)
    );
  }, [financial?.movements, currentMonth]);

  const revenueValue = useMemo(() => {
    return currentMonthMovements
      .filter(m => m.category === 'RECEITAS' && m.isPaid === true)
      .reduce((sum, m) => sum + Math.abs(m.value), 0);
  }, [currentMonthMovements]);

  // Filter quotes approved or executed in current month (Problem 2 — without fallback)
  const currentMonthQuotes = useMemo(() => {
    return (quotes?.list || []).filter(q => 
      q.createdAt && q.createdAt.startsWith(currentMonth) && 
      (q.status === 'aprovado' || q.status === 'executado')
    );
  }, [quotes?.list, currentMonth]);
  
  const serviceCountValue = currentMonthQuotes.length;

  // Average Ticket Value (Problem 3)
  const avgTicketValue = serviceCountValue > 0 ? (revenueValue / serviceCountValue) : 0;

  // Average Margin Margem Média (from non-draft active quotes of current month)
  const activeMonthQuotes = useMemo(() => {
    return (quotes?.list || []).filter(q => 
      q.createdAt && q.createdAt.startsWith(currentMonth) && 
      q.status !== 'rascunho' && 
      q.status !== 'recusado'
    );
  }, [quotes?.list, currentMonth]);

  const avgMarginValue = useMemo(() => {
    return activeMonthQuotes.length > 0
      ? activeMonthQuotes.reduce((sum, q) => sum + (q.pricing?.marginPercent || 0), 0) / activeMonthQuotes.length
      : 0;
  }, [activeMonthQuotes]);

  // Let's check for EMPTY DATA STATE if there are absolutely no quotes and no movements (Problem 8)
  const noDataTotal = (quotes?.list || []).length === 0 && (financial?.movements || []).length === 0;

  // Stock and Contract calculations for Alertas section
  const lowStockProducts = useMemo(() => {
    return (inventory?.products || []).filter(p => p.quantity <= (p.minQuantity || 0));
  }, [inventory?.products]);

  const expiringContractsCount = useMemo(() => {
    return (contracts || []).filter(c => {
      if (!c.endDate) return false;
      const diffTime = new Date(c.endDate).getTime() - new Date().getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 && diffDays <= 15;
    }).length;
  }, [contracts]);

  const reajusteContrats = useMemo(() => selectContratosParaReajuste(systemState), [systemState]);

  // 2b. REVENUE FORECAST VS REALIZED CHART DATA (COMPILING APPR & CONF QUOTES BY MONTH)
  const revenueChartData = useMemo(() => {
    const list = quotes?.list || [];
    const map = new Map<string, { prevista: number; realizada: number }>();

    list.forEach(q => {
      if (!q.createdAt) return;
      const mes = q.createdAt.slice(0, 7); // YYYY-MM
      if (!/^\d{4}-\d{2}/.test(mes)) return;

      const val = q.pricing?.finalPrice || 0;
      if (!map.has(mes)) {
        map.set(mes, { prevista: 0, realizada: 0 });
      }

      const vals = map.get(mes)!;
      // Approved (Aprovado) and Executed (Executado) represent prevista
      if (q.status === 'aprovado' || q.status === 'executado') {
        vals.prevista += val;
      }
      // Executed (Executado) is the actual realized revenue
      if (q.status === 'executado') {
        vals.realizada += val;
      }
    });

    const mesesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
    return Array.from(map.entries())
      .map(([mes, vals]) => {
        const [year, month] = mes.split('-');
        const monthIdx = parseInt(month, 10) - 1;
        const label = `${mesesNomes[monthIdx] || month}/${year.slice(2)}`;
        return {
          key: mes,
          name: label,
          'Prevista (Orçado + Agendado)': Number(vals.prevista.toFixed(2)),
          'Realizada (Executada)': Number(vals.realizada.toFixed(2))
        };
      })
      .sort((a, b) => a.key.localeCompare(b.key))
      .slice(-6); // last 6 months for a clean UI
  }, [quotes?.list]);

  // 3. SECCIÓN 1: ALERTS COMPILED (MAX 5 ALERTS)
  const alertsList = useMemo(() => {
    const list: Array<{
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

    // Alerta 🔴 Estoque crítico
    if (lowStockProducts.length > 0) {
      const pName = lowStockProducts[0].name;
      list.push({
        id: 'alert-stock-crit',
        variant: 'danger',
        colorIconClass: 'text-red-600 bg-red-100',
        bgColorClass: 'bg-red-50/20',
        borderColorClass: 'border-red-100',
        title: 'Estoque crítico',
        description: `${pName}${lowStockProducts.length > 1 ? ` e outros ${lowStockProducts.length - 1} itens` : ''} abaixo do mínimo.`,
        btnLabel: 'Abrir Estoque',
        path: '/inventory',
        icon: AlertTriangle,
      });
    }

    // Alerta 🟠 Contratos vencendo
    if (expiringContractsCount > 0) {
      list.push({
        id: 'alert-contracts-exp',
        variant: 'warning',
        colorIconClass: 'text-amber-600 bg-amber-100/80',
        bgColorClass: 'bg-amber-50/20',
        borderColorClass: 'border-amber-100/70',
        title: 'Contrato vencendo',
        description: `${expiringContractsCount} ${expiringContractsCount === 1 ? 'contrato vence' : 'contratos vencem'} em 15 dias.`,
        btnLabel: 'Abrir Clientes',
        path: '/clientes',
        icon: Clock,
      });
    }

    // Alerta 🟡 POP sem revisão há mais de 11 meses (Problem 5 — calcular real)
    const unreviewedPops = (pops?.procedures || []).filter(p => {
      if (!p.createdAt) return false;
      const mesesSemRevisao = (Date.now() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 30);
      return mesesSemRevisao > 11;
    });

    if (unreviewedPops.length > 0) {
      const pNames = unreviewedPops.map(p => p.name).slice(0, 2).join(', ');
      const displaySuffix = unreviewedPops.length > 2 ? ` e outros ${unreviewedPops.length - 2}` : '';
      list.push({
        id: 'alert-pops-unrevised',
        variant: 'warning',
        colorIconClass: 'text-yellow-600 bg-yellow-100/80',
        bgColorClass: 'bg-yellow-50/20',
        borderColorClass: 'border-yellow-100/60',
        title: 'POP desatualizado',
        description: `POP ${pNames}${displaySuffix} sem revisão há mais de 11 meses.`,
        btnLabel: 'Abrir POP',
        path: '/pops',
        icon: RefreshCw,
      });
    }

    // Alerta 🔵 Retornos acima da meta (Problem 4 — calcular real)
    const returnRateThreshold = settings?.maxReturnRatePercent ?? 8;
    const monthlyRetornos = (quotes?.list || []).filter(q => q.createdAt?.startsWith(currentMonth) && (q.status === 'retorno' || q.isRetorno === true));
    const qtdRetornos = monthlyRetornos.length;

    const monthlyExecutados = (quotes?.list || []).filter(q => q.createdAt?.startsWith(currentMonth) && q.status === 'executado');
    const qtdExecutados = monthlyExecutados.length;

    const returnRate = qtdExecutados > 0 ? (qtdRetornos / qtdExecutados) * 100 : 0;

    if (returnRate > returnRateThreshold) {
      list.push({
        id: 'alert-returns-rate',
        variant: 'info',
        colorIconClass: 'text-blue-600 bg-blue-100',
        bgColorClass: 'bg-blue-50/20',
        borderColorClass: 'border-blue-100',
        title: 'Retornos acima da meta',
        description: `Taxa de retorno atingiu ${returnRate.toFixed(1)}% (Limite: ${returnRateThreshold}%).`,
        btnLabel: 'Abrir Agenda',
        path: '/agenda',
        icon: TrendingUp,
      });
    }

    // Alerta 🟡 Contratos para reajuste
    if (reajusteContrats.length > 0) {
      const potencialReajuste = reajusteContrats.reduce((s, r) => s + (r.suggestedValue - r.currentValue), 0);
      list.push({
        id: 'alert-contracts-reajuste',
        variant: 'warning',
        colorIconClass: 'text-amber-600 bg-amber-100/80',
        bgColorClass: 'bg-amber-50/20',
        borderColorClass: 'border-amber-100/70',
        title: 'Contratos para reajuste',
        description: `${reajusteContrats.length} contrato(s) elegíveis para reajuste anual (IPCA). Valor potencial: +R$ ${potencialReajuste.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}/mês`,
        btnLabel: 'Abrir Clientes',
        path: '/clientes',
        icon: FileText,
      });
    }

    return list;
  }, [lowStockProducts, expiringContractsCount, pops?.procedures, quotes?.list, currentMonth, settings?.maxReturnRatePercent, reajusteContrats]);

  const displayAlertsList = useMemo(() => alertsList.slice(0, 5), [alertsList]);

  // 4. SECCIÓN 3: AGENDA OPERACIONAL DYNAMIC ITEMS (MAX 10)
  const agendaList = useMemo(() => {
    const list: Array<{
      id: string;
      time: string;
      client: string;
      service: string;
      address: string;
      status: 'Agendado' | 'Confirmado' | 'Garantia' | 'Expirado';
    }> = [];

    const monthAgenda = (agenda || []).filter(e => e.date?.startsWith(currentMonth));

    if (monthAgenda.length > 0) {
      const sortedAgenda = [...monthAgenda].sort((a, b) => {
        const dCompare = (a.date || '').localeCompare(b.date || '');
        if (dCompare !== 0) return dCompare;
        return (a.time || '').localeCompare(b.time || '');
      });

      sortedAgenda.forEach((e) => {
        const quote = (quotes?.list || []).find(q => q.id === e.quoteId);
        const rawAddress = quote?.client?.address || 'Volta Redonda';
        const shortAddress = rawAddress.split(',')[0] || rawAddress;

        list.push({
          id: e.id,
          time: e.time || '08:00',
          client: e.clientName || 'Cliente Particular',
          service: e.title || 'Dedetização Geral',
          address: shortAddress,
          status: e.status === 'confirmado' ? 'Confirmado' : 'Agendado',
        });
      });
    }
    return list;
  }, [agenda, quotes?.list, currentMonth]);

  const finalAgendaList = useMemo(() => agendaList.slice(0, 10), [agendaList]);

  // 5. SECCIÓN 4: IA OPERATING HEALTH SCORE (SAÚDE OPERACIONAL) (Problem 6 — incluir ratio capacidade na fórmula)
  const minMarginTarget = settings?.operationalGoals?.minimumMarginPercent || 35;
  const financeScore = avgMarginValue >= minMarginTarget ? 100 : Math.max(50, Math.round(100 - (minMarginTarget - avgMarginValue) * 4));
  const stockScore = lowStockProducts.length === 0 ? 100 : Math.max(50, 100 - lowStockProducts.length * 10);
  
  // Quality Score based on completed vs return rates in quotes
  const totalCompletedQuotes = (quotes?.list || []).filter(q => q.status === 'executado').length;
  const totalRetornoQuotes = (quotes?.list || []).filter(q => q.status === 'retorno' || q.isRetorno === true).length;
  const qualityRate = totalCompletedQuotes > 0 ? Math.max(0, 1 - (totalRetornoQuotes / totalCompletedQuotes)) : 1;
  const qualityScore = Math.round(qualityRate * 100);

  // Schedule agenda sync score
  const pendingAgendaCount = (agenda || []).filter(e => e.status === 'pendente').length;
  const timerScore = (agenda || []).length > 0 ? Math.max(50, 100 - pendingAgendaCount * 10) : 100;

  // Client retention score
  const customerScore = (clients || []).length > 0 ? 100 : 50;

  // Capacity utilized ratio score (Problem 6)
  const serviceTarget = (settings as any)?.monthlyServiceTarget || settings?.operationalGoals?.targetServicesPerMonth || 120;
  const capacityRatio = serviceTarget > 0 ? (serviceCountValue / serviceTarget) : 0;
  const capacityScore = Math.min(100, Math.round(capacityRatio * 100));

  // Average all 6 elements together in health score
  const healthScore = Math.round((financeScore + stockScore + qualityScore + timerScore + customerScore + capacityScore) / 6) || 87;

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

  // 6. AI INSIGHTS MSG (Problem 7 — comparando avgMarginValue do mês atual vs anterior via seletor)
  const marginAnterior = selectMargemMesAnterior({ quotes } as any);
  const marginDiff = avgMarginValue - marginAnterior;

  let marginInsightMessage = 'Sem dados de faturamento para avaliar oscilação de margem.';
  if (marginAnterior > 0) {
    if (marginDiff < 0) {
      marginInsightMessage = `Margem operacional caiu ${Math.abs(marginDiff).toFixed(2)}% nos últimos 30 dias com base no histórico.`;
    } else if (marginDiff > 0) {
      marginInsightMessage = `Margem operacional subiu ${marginDiff.toFixed(2)}% nos últimos 30 dias em comparação ao mês anterior.`;
    } else {
      marginInsightMessage = `Margem operacional estável em relação ao mês anterior (mantida em ${avgMarginValue.toFixed(2)}%).`;
    }
  } else if (avgMarginValue > 0) {
    marginInsightMessage = `Margem operacional atual consolidada em ${avgMarginValue.toFixed(2)}% para os primeiros serviços executados.`;
  }

  // Contract analysis dynamics
  const expiredOrExpiringContracts = (contracts || []).filter(c => {
    if (!c.endDate) return false;
    const diffTime = new Date(c.endDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return c.status === 'vencido' || (diffDays > 0 && diffDays <= 30);
  });
  const potentialRenewalCount = expiredOrExpiringContracts.length;

  const returnRateThreshold = settings?.maxReturnRatePercent ?? 8;
  const currentMonthRetornos = (quotes?.list || []).filter(q => q.createdAt?.startsWith(currentMonth) && (q.status === 'retorno' || q.isRetorno === true));
  const qtdRetornosVal = currentMonthRetornos.length;
  const currentMonthExecutados = (quotes?.list || []).filter(q => q.createdAt?.startsWith(currentMonth) && q.status === 'executado');
  const qtdExecutadosVal = currentMonthExecutados.length;
  const returnRateVal = qtdExecutadosVal > 0 ? (qtdRetornosVal / qtdExecutadosVal) * 100 : 0;

  const aiInsights = [
    {
      id: 'ai-ins-1',
      message: marginInsightMessage,
      btnLabel: 'Abrir Financeiro',
      path: '/financial',
    },
    {
      id: 'ai-ins-2',
      message: lowStockProducts.length > 0 
        ? `${lowStockProducts.length} ${lowStockProducts.length === 1 ? 'produto apresenta' : 'produtos apresentam'} risco crítico de ruptura no estoque.`
        : 'Todos os insumos operacionais encontram-se em níveis adequados de segurança.',
      btnLabel: 'Abrir Estoque',
      path: '/inventory',
    },
    {
      id: 'ai-ins-3',
      message: potentialRenewalCount > 0
        ? `${potentialRenewalCount} ${potentialRenewalCount === 1 ? 'cliente possui' : 'clientes possuem'} contrato expirando ou vencido ideal para renovação.`
        : 'Sem contratos expirados ou em vias de renovação nos próximos 30 dias.',
      btnLabel: 'Abrir Clientes',
      path: '/clientes',
    },
    {
      id: 'ai-ins-4',
      message: returnRateVal > returnRateThreshold
        ? `Atenção: A taxa de retornos de assistência (${returnRateVal.toFixed(1)}%) supera o limite ideal definido de ${returnRateThreshold}%.`
        : 'Índice de retornos gerais controlado e em conformidade técnica.',
      btnLabel: 'Abrir Relatório',
      path: '/agenda',
    }
  ];

  if (noDataTotal) {
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
              className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97 animate-pulse"
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

        {/* POLISHED EMPTY STATE */}
        <div id="dashboard-empty-state-card" className="flex flex-col items-center justify-center p-12 bg-white border border-[#E8E6E1] rounded-3xl text-center space-y-4 py-24 shadow-xxs">
          <div className="p-4 bg-slate-50 text-slate-400 rounded-full">
            <Activity className="size-12 animate-pulse" />
          </div>
          <h3 className="text-xl font-black text-[#141410] uppercase tracking-wider">
            Sem dados suficientes para calcular
          </h3>
          <p className="text-xs text-slate-500 max-w-md font-bold leading-relaxed">
            Sua conta DDSulf ainda não possui histórico de orçamentos, ordens de serviço ou registros financeiros gravados nesta empresa. Comece gerando novos orçamentos ou inserindo saldos operacionais.
          </p>
          <div className="flex gap-3 pt-3">
            <button
              onClick={() => navigate('/calculator')}
              className="px-6 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-97"
            >
              Iniciar Fluxo de Orçamento
            </button>
          </div>
        </div>
      </div>
    );
  }

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
                  className={`h-[90px] min-h-[90px] flex items-center justify-between p-4 bg-white border border-[#E8E6E1] rounded-2xl shadow-xxs hover:border-slate-300 transition-all ${alert.bgColorClass}`}
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
          <Card className="bg-white border border-[#E8E6E1] p-6 rounded-2xl shadow-xxs flex flex-col justify-between h-[140px] hover:border-slate-250 transition-all">
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
              <p className="text-[11px] font-medium text-slate-450">
                Faturamento líquido arrecadado
              </p>
            </div>
          </Card>

          {/* Card 2: Margem Média */}
          <Card className="bg-white border border-[#E8E6E1] p-6 rounded-2xl shadow-xxs flex flex-col justify-between h-[140px] hover:border-slate-250 transition-all">
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
                vs meta de <span className="font-bold text-slate-600">{minMarginTarget.toFixed(2)}%</span>
              </p>
            </div>
          </Card>

          {/* Card 3: Serviços Realizados */}
          <Card className="bg-white border border-[#E8E6E1] p-6 rounded-2xl shadow-xxs flex flex-col justify-between h-[140px] hover:border-slate-250 transition-all">
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
                vs meta de <span className="font-bold text-slate-600">{serviceTarget}</span>
              </p>
            </div>
          </Card>

          {/* Card 4: Ticket Médio */}
          <Card className="bg-white border border-[#E8E6E1] p-6 rounded-2xl shadow-xxs flex flex-col justify-between h-[140px] hover:border-slate-250 transition-all">
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
              <p className="text-[11px] font-medium text-slate-450">
                Média real arrecadada
              </p>
            </div>
          </Card>
        </div>
      </section>

      {/* SEÇÃO GRÁFICO: FLUXO DE CAIXA PREVISTO VS REALIZADO */}
      <section id="section-comparativo-receita" className="space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Fluxo de Caixa Previsto vs. Realizado
          </h2>
          <p className="text-xs font-medium text-slate-450 mt-1">
            Análise histórica comparativa de faturamento orçado (aprovado/agendado) vs. receita efetivamente liquidada.
          </p>
        </div>

        <Card className="bg-white border border-[#E8E6E1] p-6 sm:p-8 rounded-3xl shadow-xxs">
          <div className="h-[320px] w-full" id="revenue-compare-chart-container">
            {revenueChartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-xs text-slate-400 font-bold uppercase tracking-wider py-12">
                Nenhum dado financeiro para o período.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueChartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBEBE5" opacity={0.6} />
                  <XAxis 
                    dataKey="name" 
                    stroke="#706F65" 
                    fontSize={10} 
                    fontWeight="bold" 
                    tickLine={false} 
                    axisLine={false} 
                    dy={8}
                  />
                  <YAxis 
                    stroke="#706F65" 
                    fontSize={10} 
                    fontWeight="bold" 
                    tickLine={false} 
                    axisLine={false}
                    tickFormatter={(val) => `R$ ${val}`}
                    dx={-8}
                  />
                  <Tooltip
                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                    contentStyle={{ 
                      borderRadius: '16px', 
                      backgroundColor: '#FFFFFF', 
                      border: '1px solid #EBEBE5', 
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                      fontFamily: 'Inter, sans-serif'
                    }}
                    itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                    labelStyle={{ fontSize: '10px', color: '#706F65', fontWeight: 'black', marginBottom: '4px' }}
                  />
                  <Legend 
                    verticalAlign="top" 
                    height={36} 
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'Inter, sans-serif' }}
                  />
                  <Bar 
                    dataKey="Prevista (Orçado + Agendado)" 
                    fill="#8FAD88" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={45}
                  />
                  <Bar 
                    dataKey="Realizada (Executada)" 
                    fill="#1B3A2D" 
                    radius={[6, 6, 0, 0]} 
                    maxBarSize={45}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </section>

      {/* SEÇÃO 3: AGENDA OPERACIONAL */}
      <section id="section-agenda-operacional" className="space-y-4 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              Próximos Serviços
            </h2>
            <p className="text-xs font-medium text-slate-450 mt-1">
              Compromissos programados para a competência atual {currentMonth.split('-').reverse().join('/')}.
            </p>
          </div>

          <button
            id="btn-agenda-completa"
            onClick={() => navigate('/agenda')}
            className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-700 hover:text-[#1B3A2D] transition-colors bg-white px-3.5 py-2 border border-[#E8E6E1] hover:border-slate-350 rounded-xl cursor-pointer"
          >
            <span>Ver Agenda Completa</span>
            <ArrowRight className="size-3.5" />
          </button>
        </div>

        {/* AGENDA ITEMS LIST TABLE */}
        <div className="w-full overflow-hidden bg-white border border-[#E8E6E1] rounded-2xl shadow-xxs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50 h-[56px] border-b border-sky-100/30">
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
                {finalAgendaList.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 font-semibold text-xs font-sans">
                      Nenhum serviço agendado no período atual.
                    </td>
                  </tr>
                ) : (
                  finalAgendaList.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => navigate('/agenda')}
                      className="h-[60px] hover:bg-slate-50/80 cursor-pointer transition-colors group"
                    >
                      {/* Time */}
                      <td className="pl-6 py-3 font-mono text-xs font-bold text-slate-450">
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
                              ? 'bg-teal-50 text-teal-700 border-teal-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* DISPONIBILIDADE E CARGA DE TRABALHO DE TÉCNICOS */}
      <DisponibilidadeTecnicos />

      {/* SEÇÃO 4: IA OPERACIONAL */}
      <section id="section-ia-operacional" className="space-y-4 pt-1">
        <div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">
            Insights da IA
          </h2>
          <p className="text-xs font-medium text-slate-450 mt-1">
            Análises e recomendações automáticas baseadas em modelos ativos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* INSIGHTS CARDS LIST (COL-SPAN-2) */}
          <div className="lg:col-span-2 space-y-4">
            {aiInsights.map((insight) => (
              <div
                key={insight.id}
                className="flex items-center justify-between p-5 bg-white border border-[#E8E6E1] rounded-2xl hover:border-slate-350 transition-all shadow-xxs"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="p-2.5 bg-slate-50 text-[#1B3A2D] rounded-xl shrink-0">
                    <Activity className="size-4" />
                  </div>
                  <p className="text-sm font-extrabold text-slate-700 leading-snug">
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
            <Card className="p-6 bg-white border border-[#E8E6E1] rounded-2xl shadow-xxs flex flex-col justify-between h-full space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[#6B6B5F] uppercase tracking-wider leading-none">
                  Saúde Operacional
                </h3>
                <p className="text-[11px] font-medium text-slate-400 mt-2">
                  Métricas agregadas integradas do negócio.
                </p>
              </div>

              {/* Main Gauge / Score bubble */}
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <div className={`size-24 rounded-full border-4 ${healthBorderClass} flex flex-col items-center justify-center ${healthBgClass} shadow-xxs`}>
                  <span className={`text-3xl font-black ${healthColorText}`}>
                    {healthScore}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">/100</span>
                </div>
                <div className="text-center pt-1">
                  <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-full border ${healthBorderClass} uppercase tracking-widest ${healthColorText}`}>
                    {healthScore >= 80 ? 'Excelente' : healthScore >= 60 ? 'Regular' : 'Crítico'}
                  </span>
                </div>
              </div>

              {/* Indicadores complementares do score */}
              <div className="space-y-3.5 pt-2 border-t border-slate-100">
                {/* Financeiro */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Financeiro (Margem)</span>
                  <span className={avgMarginValue >= minMarginTarget ? 'text-emerald-700 font-extrabold' : 'text-amber-600 font-extrabold'}>
                    {avgMarginValue >= minMarginTarget ? 'Excelente' : 'Abaixo da meta'}
                  </span>
                </div>

                {/* Estoque */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Estoque (Ruptura)</span>
                  <span className={lowStockProducts.length === 0 ? 'text-emerald-700 font-extrabold' : 'text-red-650 font-extrabold'}>
                    {lowStockProducts.length === 0 ? 'Conforme' : `${lowStockProducts.length} críticos`}
                  </span>
                </div>

                {/* Qualidade */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Qualidade (Retornos)</span>
                  <span className={qualityScore >= 80 ? 'text-emerald-700 font-extrabold' : 'text-amber-600 font-extrabold'}>
                    {qualityScore}% conformidade
                  </span>
                </div>

                {/* Sincronização agenda */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Serviços Executados</span>
                  <span className={capacityScore >= 80 ? 'text-emerald-700 font-extrabold' : capacityScore >= 40 ? 'text-amber-655 font-extrabold' : 'text-slate-500'}>
                    {serviceCountValue} / {serviceTarget}
                  </span>
                </div>

                {/* Clientes */}
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Carteira Clientes</span>
                  <span className="text-[#1B3A2D] font-extrabold">{(clients || []).length} ativos</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

    </div>
  );
}
