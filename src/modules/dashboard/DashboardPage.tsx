import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  PieChart as LucidePieChart, 
  Calendar, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  TrendingDown,
  CheckCircle2,
  Lock,
  Percent,
  TrendingUp as TrendUpIcon,
  Package,
  Layers,
  FileText
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell, 
  Legend
} from 'recharts';
import { useSystemStore } from '@/store';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function DashboardPage() {
  const { financial, inventory, quotes, pops, getIntelligenceReport } = useSystemStore();
  const navigate = useNavigate();

  // 1. CALCULATED VARIABLES (COMPUTED DATA)
  const intelligence = getIntelligenceReport();
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  
  const monthQuotes = quotes.list.filter(q =>
    q.createdAt.startsWith(currentMonth) && q.status !== 'rascunho'
  );

  const revenue = monthQuotes.reduce((sum, q) => sum + q.pricing.finalPrice, 0);
  const totalCosts = monthQuotes.reduce((sum, q) => sum + q.costs.total, 0);
  
  const avgMargin = monthQuotes.length > 0
    ? monthQuotes.reduce((sum, q) => sum + q.pricing.marginPercent, 0) / monthQuotes.length
    : 0;
    
  const avgTicket = monthQuotes.length > 0 ? revenue / monthQuotes.length : 0;
  
  const lowStockProducts = inventory.products.filter(p => p.quantity <= p.minQuantity);

  // Calculate most consumed product in the last 30 days
  const now = new Date();
  const time30DaysAgo = now.getTime() - 30 * 24 * 60 * 60 * 1000;
  const recentOutMovements = inventory.movements.filter(
    m => m.type === 'saida' && new Date(m.date).getTime() >= time30DaysAgo
  );

  const productConsumption: Record<string, number> = {};
  recentOutMovements.forEach(m => {
    productConsumption[m.productId] = (productConsumption[m.productId] || 0) + m.quantity;
  });

  let mostConsumedProductId = '';
  let mostConsumedQty = 0;
  Object.entries(productConsumption).forEach(([id, qty]) => {
    if (qty > mostConsumedQty) {
      mostConsumedQty = qty;
      mostConsumedProductId = id;
    }
  });

  const mostConsumedProduct = inventory.products.find(p => p.id === mostConsumedProductId);

  // 2. STATED OBJECTS FOR CHECKLIST DE CONFIGURAÇÃO (ESTADO VAZIO INTELIGENTE)
  const isFinancialConfigured = Object.values(financial.fixedCosts).reduce((acc, val) => acc + val, 0) > 0;
  const isInventoryConfigured = inventory.products.length > 0;
  const isPopsConfigured = pops.procedures.length > 0;
  const isQuotesCreated = quotes.list.length > 0;

  // Total checklist items checked
  const checklistItems = [
    { label: 'Configure os custos da empresa', path: '/financial', checked: isFinancialConfigured },
    { label: 'Cadastre seus produtos no estoque', path: '/inventory', checked: isInventoryConfigured },
    { label: 'Cadastre pelo menos 1 POP', path: '/pops', checked: isPopsConfigured },
    { label: 'Gere seu primeiro orçamento', path: '/calculator', checked: isQuotesCreated },
  ];
  const completedCount = checklistItems.filter(item => item.checked).length;

  // 3. CHART DATA GATHERING (LAST 6 MONTHS GROUPING)
  const last6Months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return d.toISOString().slice(0, 7); // "YYYY-MM"
  }).reverse();

  const chartData = last6Months.map(month => {
    const monthQuotesAll = quotes.list.filter(q => q.createdAt.startsWith(month) && q.status !== 'rascunho');
    const rev = monthQuotesAll.reduce((sum, q) => sum + q.pricing.finalPrice, 0);
    const cost = monthQuotesAll.reduce((sum, q) => sum + q.costs.total, 0);
    
    // Format month for display (e.g., "Mai/26")
    const [year, m] = month.split('-');
    const monthsPt = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const formattedMonth = `${monthsPt[parseInt(m, 10) - 1]}/${year.slice(2)}`;
    
    return {
      monthStr: formattedMonth,
      faturamento: rev,
      custo: cost
    };
  });

  const marginTrendData = last6Months.map(month => {
    const monthQuotesAll = quotes.list.filter(q => q.createdAt.startsWith(month) && q.status !== 'rascunho');
    const avgM = monthQuotesAll.length > 0
      ? monthQuotesAll.reduce((sum, q) => sum + q.pricing.marginPercent, 0) / monthQuotesAll.length
      : 0;
    
    // Format month for display (e.g., "Mai/26")
    const [year, m] = month.split('-');
    const monthsPt = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const formattedMonth = `${monthsPt[parseInt(m, 10) - 1]}/${year.slice(2)}`;
    
    return {
      monthStr: formattedMonth,
      margin: Math.round(avgM * 10) / 10,
      hasData: monthQuotesAll.length > 0
    };
  });

  const monthsWithDataCount = marginTrendData.filter(d => d.hasData).length;

  const hasChartData = quotes.list.some(q => q.status !== 'rascunho');

  // 4. COST COMPOSITION CODES (PIE CHART)
  // Categories: Veículos | Salários | Aluguel | Combustível | Outros
  const pieData = [
    { name: 'Veículos', value: Number(financial.fixedCosts.vehicleRental || 0) },
    { name: 'Salários', value: Number(financial.fixedCosts.salaries || 0) },
    { name: 'Aluguel', value: Number(financial.fixedCosts.rent || 0) },
    { name: 'Combustível', value: Number(financial.fixedCosts.fuel || 0) },
    { name: 'Outros', value: Number(financial.fixedCosts.other || 0) + Number(financial.fixedCosts.insurance || 0) },
  ].filter(item => item.value > 0);

  const PIE_COLORS = ['#0f172a', '#334155', '#475569', '#64748b', '#94a3b8'];

  // 5. INVENTORY STOCK CRITICAL PRODUCTS (PROGRESS)
  // Ratio quantity vs minQuantity (closest to running out or furthest below is first)
  const stockMetrics = [...inventory.products]
    .map(p => {
      const percentage = p.minQuantity > 0 ? (p.quantity / p.minQuantity) * 100 : 100;
      return {
        ...p,
        percentage: Math.min(100, Math.round(percentage))
      };
    })
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, 5);

  // 6. LATEST BUDGETS TABLE
  const latestQuotes = [...quotes.list]
    .filter(q => q.status !== 'rascunho')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  // Financial goals calculation
  const monthlyServicesGoal = financial.operational.servicesPerMonth || 120;
  const minMarginPercent = financial.operational.minimumMarginPercent || 35;
  // Estimate target ticket either from existing state or standard baseline R$ 1200
  const estimatedTicket = avgTicket > 0 ? avgTicket : 1200;
  const targetRevenue = monthlyServicesGoal * estimatedTicket;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Title & Description Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              DDSulf • Inteligência Operacional Ativa
            </span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">Dashboard de Performance</h1>
          <p className="text-sm text-slate-500 font-medium">
            Monitoramento de rentabilidade real, estoque crítico e conformação financeira de campo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-2">
            <Calendar className="size-4 text-slate-400" />
            {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </div>
        </div>
      </header>

      {/* ⚠️ FAIXA DE ALERTA DE ESTOQUE CRÍTICO */}
      {lowStockProducts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-950 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="size-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold text-sm">
                Estoque Crítico Detectado
              </span>
              <p className="text-xs text-amber-800">
                ⚠️ {lowStockProducts.length} produto(s) com estoque crítico: <span className="font-semibold">{lowStockProducts.map(p => p.name).join(', ')}</span>
              </p>
            </div>
          </div>
          <Link 
            to="/inventory" 
            className="text-xs font-black uppercase tracking-wider text-amber-700 hover:text-amber-900 flex items-center gap-1 shrink-0 self-end sm:self-center transition-colors"
          >
            Reabastecer <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* STATUS DO SETUP: CHECKLIST INTELIGENTE (ESTADO VAZIO) */}
      {(!isQuotesCreated || completedCount < 4) && (
        <Card className="bg-slate-50 border border-slate-100 rounded-[28px] p-6 lg:p-8">
          <div className="grid gap-6 md:grid-cols-12 items-center">
            <div className="md:col-span-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#64748b]">Onboarding Direcionado</span>
                <h3 className="text-2xl font-black text-slate-950">Validação Operacional</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Para obter relatórios exatos e simulações perfeitas com base na sua operação real, complete as etapas abaixo:
                </p>
              </div>
              <div className="flex items-center gap-3 bg-white border border-slate-100 rounded-xl p-3 w-fit">
                <span className="text-xl font-black text-slate-800">{completedCount}/4</span>
                <div className="h-4 w-1 bg-slate-200 rounded-full" />
                <span className="text-xs font-semibold text-slate-500">Tarefas completadas</span>
              </div>
            </div>

            <div className="md:col-span-7 grid gap-3 sm:grid-cols-2">
              {checklistItems.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => navigate(item.path)}
                  className="bg-white border text-left border-slate-200/60 p-4 rounded-2xl hover:border-slate-800 transition-all flex items-start gap-3 group relative overflow-hidden"
                >
                  <div className="mt-0.5">
                    {item.checked ? (
                      <CheckCircle2 className="size-5 text-emerald-500 fill-emerald-50" />
                    ) : (
                      <div className="size-5 rounded-full border-2 border-slate-300 group-hover:border-slate-800 transition-colors" />
                    )}
                  </div>
                  <div className="space-y-1 relative z-10">
                    <p className="text-xs font-black text-slate-800 leading-tight group-hover:text-slate-950">
                      {item.label}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 flex items-center gap-1 transition-colors">
                      Configurar →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </Card>
      )}

      {/* GRID DE KPIS PRINCIPAIS (4 cards) */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1: Faturamento do Mês */}
        <Card className="bg-white border border-slate-200/80 rounded-[24px] p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Receita Mensal</span>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <DollarSign className="size-4 text-slate-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-black text-slate-900">
                {revenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                vs meta: <span className="text-slate-700">{targetRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* KPI 2: Margem Média */}
        {(() => {
          const isHealthy = avgMargin >= minMarginPercent;
          return (
            <Card className="bg-white border border-slate-200/80 rounded-[24px] p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-widest text-slate-400">Margem Média</span>
                  <div className={`p-2.5 rounded-xl ${isHealthy ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Percent className="size-4" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h4 className={`text-2xl font-black ${isHealthy ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {avgMargin.toFixed(1)}%
                  </h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                    Mínima Desejada: <span className="text-slate-700 font-semibold">{minMarginPercent}%</span>
                  </p>
                </div>
              </div>
            </Card>
          );
        })()}

        {/* KPI 3: Serviços no Mês */}
        <Card className="bg-white border border-slate-200/80 rounded-[24px] p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Serviços Executados</span>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <Target className="size-4 text-slate-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-black text-slate-900">
                {monthQuotes.length}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                Meta do Mês: <span className="text-slate-700 font-semibold">{monthlyServicesGoal}</span>
              </p>
            </div>
          </div>
        </Card>

        {/* KPI 4: Ticket Médio */}
        <Card className="bg-white border border-slate-200/80 rounded-[24px] p-6 flex flex-col justify-between hover:shadow-md hover:border-slate-300 transition-all">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Ticket Médio</span>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <TrendingUp className="size-4 text-slate-600" />
              </div>
            </div>
            <div className="space-y-1">
              <h4 className="text-2xl font-black text-slate-900">
                {avgTicket.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </h4>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
                Ticket Médio de fechamento
              </p>
            </div>
          </div>
        </Card>
      </section>

      {/* SEÇÃO INTELIGÊNCIA OPERACIONAL */}
      <section className="space-y-4 bg-slate-50/50 border border-slate-200/60 rounded-[32px] p-6 lg:p-8">
        <div className="flex items-center gap-2">
          <span className="size-2 bg-indigo-600 rounded-full animate-pulse" />
          <h2 className="text-xl font-black tracking-tight text-slate-800">Painel de Inteligência Operacional</h2>
        </div>

        {/* 3 Métricas Inteligentes */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-0 p-6 text-white rounded-[24px] space-y-3 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-5xl font-black">1</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Ponto de Equilíbrio</p>
              <h4 className="text-2xl font-black">
                {intelligence.breakEvenServicesPerMonth} <span className="text-xs font-semibold text-slate-300">serviços/mês</span>
              </h4>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Você precisa de no mínimo {intelligence.breakEvenServicesPerMonth} serviços/mês para cobrir os custos fixos acumulados da DDSulf.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950 border-0 p-6 text-white rounded-[24px] space-y-3 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-5xl font-black">2</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">Margem Real 30d</p>
              <h4 className="text-2xl font-black">{intelligence.avgMarginLast30Days.toFixed(1)}%</h4>
            </div>
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Sua margem real nos últimos 30 dias foi de {intelligence.avgMarginLast30Days.toFixed(1)}%. Tendência atual classificada como <span className="font-bold text-emerald-300">{intelligence.marginTrend}</span>.
            </p>
          </Card>

          <Card className="bg-gradient-to-br from-slate-900 via-slate-950 to-amber-950 border-0 p-6 text-white rounded-[24px] space-y-3 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <span className="text-5xl font-black">3</span>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-amber-300 font-mono">Produto Mais Consumido</p>
              <h4 className="text-base font-black truncate max-w-[210px]">
                {mostConsumedProduct ? mostConsumedProduct.name : 'Nenhum consumo'}
              </h4>
              {mostConsumedProduct && (
                <p className="text-xs text-amber-300 font-bold">Consumido: {mostConsumedQty} {mostConsumedProduct.unit}</p>
              )}
            </div>
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Based on automated inventory movements from approved quotes in the last 30 days.
            </p>
          </Card>
        </div>

        {/* Alertas Ativos em cards coloridos */}
        {intelligence.alerts.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            {intelligence.alerts.map((al, idx) => {
              let borderClass = 'border-slate-300 bg-white text-slate-800';
              let iconColor = 'text-slate-500';
              
              if (al.type === 'danger') {
                borderClass = 'border-rose-200 bg-rose-50/70 text-rose-950';
                iconColor = 'text-rose-600';
              } else if (al.type === 'warning') {
                borderClass = 'border-amber-200 bg-amber-50/70 text-amber-950';
                iconColor = 'text-amber-600';
              } else if (al.type === 'info') {
                borderClass = 'border-sky-200 bg-sky-50/70 text-sky-950';
                iconColor = 'text-sky-600';
              }

              return (
                <Card key={idx} className={`border p-4 rounded-2xl flex items-start gap-3.5 transition-all duration-300 hover:shadow-sm ${borderClass}`}>
                  <div className="p-2 bg-white border border-slate-100 rounded-xl shrink-0">
                    <AlertTriangle className={`size-4 ${iconColor}`} />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h5 className="text-xs font-black tracking-tight">{al.title}</h5>
                    <p className="text-[11px] leading-relaxed opacity-90 font-medium">{al.message}</p>
                    {al.action && (
                      <Link
                        to={al.action}
                        className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1 mt-2.5 transition-opacity hover:opacity-85 text-slate-900"
                      >
                        Ajustar Indicador <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="border border-slate-200 bg-slate-50 p-4 rounded-2xl flex items-center gap-2.5">
            <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-bold text-slate-500">Todos os indicadores operacionais da DDSulf estão em conformidade excelente.</span>
          </Card>
        )}
      </section>

      {/* CORE SECTIONS GRID: GRAFICOS E MINI-DASHBOARDS */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* LEFT COLUMN (LARGER): CHRONOLOGY AREA CHART + TABLE */}
        <div className="lg:col-span-8 space-y-8">
          {/* Gráfico de Faturamento Mensal (Recharts — AreaChart) */}
          <Card className="bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Performance</span>
                <h3 className="text-xl font-black text-slate-900">Faturamento vs Custos Operacionais</h3>
                <p className="text-xs text-slate-400">Evolução financeira consolidada dos últimos 6 meses</p>
              </div>

              {hasChartData && (
                <div className="flex items-center gap-4 text-xs font-bold shrink-0">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="size-2 bg-emerald-500 rounded-full" />
                    Faturamento
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <span className="size-2 bg-rose-500 rounded-full" />
                    Custos Totais
                  </span>
                </div>
              )}
            </div>

            <div className="w-full">
              {hasChartData ? (
                <div className="h-[280px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="monthStr" 
                        axisLine={false} 
                        tickLine={false} 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        fontWeight="bold"
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        fontWeight="bold"
                        tickFormatter={val => `R$${val}`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ fontSize: '11px', color: '#64748b', fontWeight: 'black', textTransform: 'uppercase' }}
                        formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="faturamento" 
                        stroke="#10b981" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorFaturamento)" 
                        name="Faturamento"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="custo" 
                        stroke="#ef4444" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorCusto)" 
                        name="Custo Total"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-200 rounded-2xl h-[280px]">
                  <p className="text-sm font-bold text-slate-500 max-w-sm mb-4">
                    Nenhum orçamento registrado ainda. Use a Calculadora para gerar seu primeiro orçamento.
                  </p>
                  <Button 
                    onClick={() => navigate('/calculator')}
                    className="bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider h-11 px-6 shadow-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    Ir para Calculadora
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Card de Tendência de Margem */}
          <Card className="bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#4f46e5]">Tendência Analítica</span>
                <h3 className="text-xl font-black text-slate-900">Evolução da Margem Média</h3>
                <p className="text-xs text-slate-400">Desempenho da margem real acumulada nos últimos 6 meses</p>
              </div>
            </div>

            <div className="w-full">
              {monthsWithDataCount >= 2 ? (
                <div className="h-[200px] w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={marginTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis 
                        dataKey="monthStr" 
                        axisLine={false} 
                        tickLine={false} 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        fontWeight="bold"
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        stroke="#94a3b8" 
                        fontSize={11} 
                        fontWeight="bold"
                        tickFormatter={val => `${val}%`}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                        labelStyle={{ fontSize: '11px', color: '#64748b', fontWeight: 'black', textTransform: 'uppercase' }}
                        formatter={(value: any) => [`${value}%`, 'Margem Média']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="margin" 
                        stroke="#4f46e5" 
                        strokeWidth={3} 
                        dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                        activeDot={{ r: 6 }}
                        name="Margem Média"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed border-slate-200 rounded-2xl h-[200px] bg-slate-50/40">
                  <AlertTriangle className="size-6 text-slate-400 mb-2" />
                  <p className="text-xs font-semibold text-slate-400 max-w-sm">
                    Dados insuficientes para análise de tendência. Continue usando o sistema para acumular histórico.
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Tabela de Últimos Orçamentos (últimos 5) */}
          <Card className="bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Histórico Recente</span>
                <h3 className="text-xl font-black text-slate-900">Últimos Orçamentos</h3>
              </div>
              <Link 
                to="/calculator" 
                className="text-xs font-black uppercase tracking-wider text-slate-800 hover:text-slate-950 flex items-center gap-1 transition-colors"
              >
                Novo Orçamento →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100 pb-3">
                    <th className="pb-3 text-xs font-black uppercase tracking-wider text-slate-400 width-[100px]">Data</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider text-slate-400">Cliente</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider text-slate-400">Serviço</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Preço Final</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider text-slate-400 text-right">Margem</th>
                    <th className="pb-3 text-xs font-black uppercase tracking-wider text-slate-400 text-center width-[110px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {latestQuotes.length > 0 ? (
                    latestQuotes.map((q) => {
                      const serviceLabel = q.service.serviceType.charAt(0).toUpperCase() + q.service.serviceType.slice(1);
                      const isMarginHealthy = q.pricing.marginPercent >= minMarginPercent;
                      return (
                        <tr key={q.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 text-xs font-medium text-slate-500">
                            {new Date(q.createdAt).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="py-4 text-xs font-bold text-slate-800">
                            {q.client.name}
                          </td>
                          <td className="py-4 text-xs font-semibold text-slate-600">
                            {serviceLabel}
                          </td>
                          <td className="py-4 text-xs font-black text-slate-900 text-right">
                            {q.pricing.finalPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </td>
                          <td className={`py-4 text-xs font-bold text-right ${isMarginHealthy ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {q.pricing.marginPercent.toFixed(1)}%
                          </td>
                          <td className="py-4 text-center">
                            {(() => {
                              let bg = 'bg-slate-50 text-slate-600 border-slate-200';
                              if (q.status === 'enviado') bg = 'bg-sky-50 text-sky-700 border-sky-100';
                              else if (q.status === 'aprovado') bg = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                              else if (q.status === 'recusado') bg = 'bg-rose-50 text-rose-700 border-rose-100';
                              else if (q.status === 'executado') bg = 'bg-indigo-50 text-indigo-700 border-indigo-100';
                              return (
                                <span className={`inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full border ${bg}`}>
                                  {q.status}
                                </span>
                              );
                            })()}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs font-semibold text-slate-400 italic">
                        Nenhum orçamento gerado ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* RIGHT COLUMN (SMALLER): FIX COSTS PIE CHART + STOCK MINI-DASHBOARD */}
        <div className="lg:col-span-4 space-y-8">
          {/* Card de Composição de Custos (Recharts — PieChart) */}
          <Card className="bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-8 space-y-6">
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Composição</span>
              <h3 className="text-xl font-black text-slate-900">Custos Fixos</h3>
              <p className="text-xs text-slate-400">Custos fixos mensais consolidados da empresa</p>
            </div>

            <div className="w-full flex justify-center">
              {pieData.length > 0 ? (
                <div className="h-[220px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Fixo</span>
                    <p className="text-sm font-black text-slate-800">
                      R$ {pieData.reduce((acc, c) => acc + c.value, 0).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs font-semibold text-slate-400 italic">
                  Abra /financial para preencher os custos da empresa.
                </div>
              )}
            </div>

            {pieData.length > 0 && (
              <div className="gap-2 grid grid-cols-2 pt-2 border-t border-slate-100">
                {pieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <span 
                      className="size-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }} 
                    />
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-slate-700 truncate">{item.name}</p>
                      <p className="text-[10px] font-mono text-slate-400">
                        R$ {item.value.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Card de Estoque (mini-dashboard) */}
          <Card className="bg-white border border-slate-200/80 rounded-[32px] p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Monitor</span>
                <h3 className="text-xl font-black text-slate-900">Alocação de Estoque</h3>
                <p className="text-xs text-slate-400">Top 5 insumos mais próximos do mínimo tolerável</p>
              </div>
            </div>

            <div className="space-y-4">
              {stockMetrics.length > 0 ? (
                stockMetrics.map((p) => {
                  const isCritical = p.quantity <= p.minQuantity;
                  const isWarning = p.quantity <= p.minQuantity * 1.5;
                  
                  let barColor = 'bg-emerald-500';
                  if (isCritical) barColor = 'bg-rose-500';
                  else if (isWarning) barColor = 'bg-amber-500';

                  return (
                    <div key={p.id} className="space-y-1.5 skeleton">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 truncate max-w-[180px]">
                          {p.name}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-slate-400">
                          {p.quantity}/{p.minQuantity} {p.unit}
                        </span>
                      </div>
                      
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          style={{ width: `${p.percentage}%` }}
                          className={`h-full rounded-full ${barColor}`} 
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs font-semibold text-slate-400 italic text-center py-6">
                  Nenhum insumo disponível no estoque.
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100">
              <Link 
                to="/inventory" 
                className="text-xs font-black uppercase tracking-wider text-slate-800 hover:text-slate-950 flex items-center justify-between transition-colors"
              >
                <span>Ver Estoque Completo</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
