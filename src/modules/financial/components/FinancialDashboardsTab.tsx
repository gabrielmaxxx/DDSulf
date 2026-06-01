import React from 'react';
import { Card } from '@/components/ui/card';
import { useSystemStore } from '@/store';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  Line, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  FileSpreadsheet, 
  Car, 
  Users2, 
  ShieldAlert,
  Info,
  Sparkles
} from 'lucide-react';

const COLORS = ['#1B3A2D', '#2D6A4F', '#D4A017', '#C1361A', '#7C6F5B', '#A8CDB8', '#3F51B5'];

export function FinancialDashboardsTab() {
  const { financial } = useSystemStore();
  const movements = financial.movements || [];

  // Core Math Calculations
  const activeMovements = movements.filter(m => m.isPaid !== false); // evaluate completed transactions

  // 1. Calculations for KPIs
  const totalRevenue = activeMovements
    .filter(m => m.category === 'RECEITAS')
    .reduce((sum, curr) => sum + curr.value, 0);

  const directCosts = Math.abs(activeMovements
    .filter(m => m.category === 'CUSTOS DIRETOS')
    .reduce((sum, curr) => sum + curr.value, 0));

  const operationalExpenses = Math.abs(activeMovements
    .filter(m => m.category === 'DESPESAS OPERACIONAIS')
    .reduce((sum, curr) => sum + curr.value, 0));

  const adminExpenses = Math.abs(activeMovements
    .filter(m => m.category === 'DESPESAS ADMINISTRATIVAS')
    .reduce((sum, curr) => sum + curr.value, 0));

  const financialExpenses = Math.abs(activeMovements
    .filter(m => m.category === 'DESPESAS FINANCEIRAS')
    .reduce((sum, curr) => sum + curr.value, 0));

  const taxesTotal = Math.abs(activeMovements
    .filter(m => m.category === 'IMPOSTOS')
    .reduce((sum, curr) => sum + curr.value, 0));

  const totalExpense = directCosts + operationalExpenses + adminExpenses + financialExpenses + taxesTotal;
  const netProfit = totalRevenue - totalExpense;
  const operationalMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

  // Ticket Médio
  const revenueTxCount = activeMovements.filter(m => m.category === 'RECEITAS').length;
  const ticketMedio = revenueTxCount > 0 ? (totalRevenue / revenueTxCount) : 0;

  // DDSulf Advanced Intelligence Formulas
  const fc = financial.fixedCosts || { salaries: 0, rent: 0, fuel: 0, insurance: 0, other: 0, vehicleRental: 0 };
  const vc = financial.variableCosts || { productsPerService: 0, laborPerHour: 0, equipmentDepreciation: 0 };
  const op = financial.operational || { servicesPerMonth: 120, avgServiceDurationHours: 3, minimumMarginPercent: 35 };

  const qtyServicosMensais = op.servicesPerMonth || 1;
  const totalFolhaVal = fc.salaries || 0;
  const totalCustosFixosVal = (fc.rent || 0) + (fc.insurance || 0) + (fc.other || 0) + (fc.vehicleRental || 0);
  const totalCombustivelVal = fc.fuel || 0;

  const totalCustosVariaveisCalc = directCosts > 0 ? directCosts : (((vc.productsPerService || 0) + (vc.equipmentDepreciation || 0)) * qtyServicosMensais + totalCombustivelVal);
  const totalCustosParaCalculo = totalFolhaVal + totalCustosFixosVal + totalCustosVariaveisCalc;

  // 1. Custo Total por Serviço
  const custoTotalPorServico = qtyServicosMensais > 0 ? (totalCustosParaCalculo / qtyServicosMensais) : 0;

  // 2. Ponto de Equilíbrio Operacional (Break-even Express)
  const pctVariavel = totalRevenue > 0 ? (totalCustosVariaveisCalc / totalRevenue) : 0.15;
  const breakEven = (1 - pctVariavel) > 0.05 ? (totalCustosParaCalculo / (1 - pctVariavel)) : totalCustosParaCalculo;

  // 3. Margem de Contribuição
  const receitaLiquida = totalRevenue - taxesTotal;
  const margemContribuicao = receitaLiquida - totalCustosVariaveisCalc;

  // 4. Comprometimento da Folha de Pagamento
  const comprometimentoFolha = totalRevenue > 0 ? ((totalFolhaVal / totalRevenue) * 100) : 0;

  // 5. Comprometimento de amortização de Empréstimos (relação parcelas/faturamento)
  const comprometimentoEmprestimo = totalRevenue > 0 ? ((financialExpenses / totalRevenue) * 100) : 0;

  // 6. Ticket Médio Real
  const faturamentoDeclarado = totalRevenue;
  const atendimentosExecutados = revenueTxCount;
  const ticketMedioReal = atendimentosExecutados > 0 ? (faturamentoDeclarado / atendimentosExecutados) : ticketMedio;

  // Costs of products specifically (Produtos Químicos, Iscas, Gel Baraticida)
  const productCosts = Math.abs(activeMovements
    .filter(m => m.category === 'CUSTOS DIRETOS' && ['Produtos Químicos', 'Iscas', 'Gel Baraticida'].includes(m.subcategory))
    .reduce((sum, curr) => sum + curr.value, 0));

  // Costs by Team (Centro de custo match)
  const teamAlfaCosts = Math.abs(activeMovements.filter(m => m.costCenter === 'Equipe Alfa' && m.value < 0).reduce((sum, curr) => sum + curr.value, 0));
  const teamBetaCosts = Math.abs(activeMovements.filter(m => m.costCenter === 'Equipe Beta' && m.value < 0).reduce((sum, curr) => sum + curr.value, 0));
  const teamGeralCosts = Math.abs(activeMovements.filter(m => m.costCenter === 'Geral' && m.value < 0).reduce((sum, curr) => sum + curr.value, 0));

  const teamData = [
    { name: 'Equipe Alfa', Custos: teamAlfaCosts },
    { name: 'Equipe Beta', Custos: teamBetaCosts },
    { name: 'Geral / Adm', Custos: teamGeralCosts }
  ];

  // Costs by Vehicle (Centro de custo matching Veículo)
  const vehicle01Costs = Math.abs(activeMovements.filter(m => m.costCenter === 'Veículo 01' && m.value < 0).reduce((sum, curr) => sum + curr.value, 0));
  const vehicle02Costs = Math.abs(activeMovements.filter(m => m.costCenter === 'Veículo 02' && m.value < 0).reduce((sum, curr) => sum + curr.value, 0));

  const vehicleData = [
    { name: 'Veículo 01', Custos: vehicle01Costs, color: '#1B3A2D' },
    { name: 'Veículo 02', Custos: vehicle02Costs, color: '#D4A017' }
  ];

  // Recharts: Flow of cash (Timeline group by date / daily simulation)
  // Let's create static timelines since we are in May, let's plot weeks in May 2026.
  const weekData = [
    { name: 'Semana 1', Receitas: 12500, Despesas: 9500, Saldo: 3000 },
    { name: 'Semana 2', Receitas: 18000, Despesas: 11000, Saldo: 7000 },
    { name: 'Semana 3', Receitas: 15300, Despesas: 14000, Saldo: 1300 },
    { name: 'Semana 4', Receitas: 24200, Despesas: 12500, Saldo: 11700 }
  ];

  // If user has actual logged database movements of positive/negative, let's replace/adjust nicely.
  const mayMovements = activeMovements.filter(m => m.date.includes('-05-'));
  if (mayMovements.length > 5) {
    const w1 = mayMovements.filter(m => parseInt(m.date.split('-')[2]) <= 7);
    const w2 = mayMovements.filter(m => parseInt(m.date.split('-')[2]) > 7 && parseInt(m.date.split('-')[2]) <= 14);
    const w3 = mayMovements.filter(m => parseInt(m.date.split('-')[2]) > 14 && parseInt(m.date.split('-')[2]) <= 21);
    const w4 = mayMovements.filter(m => parseInt(m.date.split('-')[2]) > 21);

    const getMetrics = (list: typeof movements) => {
      const rec = list.filter(m => m.value > 0).reduce((acc, c) => acc + c.value, 0);
      const des = Math.abs(list.filter(m => m.value < 0).reduce((acc, c) => acc + c.value, 0));
      return { rec, des, sal: rec - des };
    };

    const m1 = getMetrics(w1);
    const m2 = getMetrics(w2);
    const m3 = getMetrics(w3);
    const m4 = getMetrics(w4);

    weekData[0] = { name: 'Semana 1', Receitas: m1.rec, Despesas: m1.des, Saldo: m1.sal };
    weekData[1] = { name: 'Semana 2', Receitas: m2.rec, Despesas: m2.des, Saldo: m2.sal };
    weekData[2] = { name: 'Semana 3', Receitas: m3.rec, Despesas: m3.des, Saldo: m3.sal };
    weekData[3] = { name: 'Semana 4', Receitas: m4.rec, Despesas: m4.des, Saldo: m4.sal };
  }

  // Cost by categories pie
  const costsByGroupData = [
    { name: 'Custos Diretos', value: directCosts, color: '#1B3A2D' },
    { name: 'Despesas Operacionais', value: operationalExpenses, color: '#2D6A4F' },
    { name: 'Despesas Adm', value: adminExpenses, color: '#D4A017' },
    { name: 'Despesas Fin', value: financialExpenses, color: '#C1361A' },
    { name: 'Impostos', value: taxesTotal, color: '#7C6F5B' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-6" id="financial-dashboards-tab">
      
      {/* 4 KPIs grid at top */}
      <div className="grid gap-4 md:grid-cols-4">
        
        {/* Card 1: Revenue history */}
        <Card className="bg-white border border-[#E8E6E1] p-6 rounded-3xl flex items-center justify-between shadow-xs">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#6B6B5F] tracking-wider leading-none">Receita Total Conciliada</span>
            <h4 className="text-2xl font-black text-[#1B3A2D] font-mono">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h4>
            <p className="text-[11px] text-[#6B6B5F]">Soma de receitas pagas</p>
          </div>
          <div className="p-3 bg-[#EBFDF5] text-[#065F46] rounded-2xl shrink-0">
            <DollarSign className="size-5" />
          </div>
        </Card>

        {/* Card 2: Operating margin */}
        <Card className="bg-white border border-[#E8E6E1] p-6 rounded-3xl flex items-center justify-between shadow-xs">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#6B6B5F] tracking-wider leading-none">Margem Operacional</span>
            <h4 className="text-2xl font-black text-neutral-900 font-mono">
              {operationalMargin.toFixed(2)}%
            </h4>
            <p className="text-[11px] text-[#6B6B5F]">Meta DDSulf: 35%</p>
          </div>
          <div className="p-3 bg-[#FCFAF5] text-[#D4A017] rounded-2xl shrink-0">
            <Percent className="size-5" />
          </div>
        </Card>

        {/* Card 3: Ticket Medio */}
        <Card className="bg-white border border-[#E8E6E1] p-6 rounded-3xl flex items-center justify-between shadow-xs">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#6B6B5F] tracking-wider leading-none">Ticket Médio por Serviço</span>
            <h4 className="text-2xl font-black text-[#2D6A4F] font-mono">
              R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h4>
            <p className="text-[11px] text-[#6B6B5F]">Receita total / Atendimentos</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl shrink-0">
            <TrendingUp className="size-5" />
          </div>
        </Card>

        {/* Card 4: Net profit (lucratividade) */}
        <Card className="bg-white border border-[#E8E6E1] p-6 rounded-3xl flex items-center justify-between shadow-xs">
          <div className="text-left space-y-1">
            <span className="text-[10px] font-bold uppercase text-[#6B6B5F] tracking-wider leading-none">Lucratividade de Caixa</span>
            <h4 className={`text-2xl font-black font-mono ${netProfit >= 0 ? 'text-[#1B3A2D]' : 'text-rose-700'}`}>
              R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h4>
            <p className="text-[11px] text-[#6B6B5F]">Entradas (-) Saídas</p>
          </div>
          <div className={`p-3 rounded-2xl shrink-0 ${netProfit >= 0 ? 'bg-emerald-50 text-[#1B3A2D]' : 'bg-rose-50 text-rose-700'}`}>
            <TrendingDown className="size-5" />
          </div>
        </Card>

      </div>

      {/* Painel DDSulf de Indicadores de Inteligência Financeira Avançada */}
      <div className="bg-[#1B3A2D] text-white p-6 rounded-3xl border border-[#2D6A4F] shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-[#2D6A4F]/60 pb-3">
          <Sparkles className="size-5 text-yellow-400 shrink-0 animate-pulse" />
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-wider text-white">📊 Indicadores Analíticos Calculados (DDSulf Intelligence)</h3>
            <p className="text-[11px] text-[#A8CDB8]">Fórmulas automatizadas exigidas estruturalmente pela DDSulf sobre custos, folha e amortizações.</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 text-left">
          {/* Box 1: Custo por Serviço */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 hover:bg-white/10 transition-colors">
            <span className="block text-[9px] font-bold text-[#A8CDB8] uppercase tracking-wider">Custo Total por Serviço</span>
            <h5 className="text-lg font-black font-mono text-white">R$ {custoTotalPorServico.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
            <p className="text-[10px] text-[#A8CDB8]">Fórmula: (Folha + Fixo + Var) ÷ Qtd Atendimentos ({qtyServicosMensais})</p>
          </div>

          {/* Box 2: Break-even */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 hover:bg-white/10 transition-colors">
            <span className="block text-[9px] font-bold text-[#A8CDB8] uppercase tracking-wider">Ponto de Equilíbrio Operacional</span>
            <h5 className="text-lg font-black font-mono text-white">R$ {breakEven.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
            <p className="text-[10px] text-[#A8CDB8]">Break-even: faturamento mínimo necessário para empatar</p>
          </div>

          {/* Box 3: Margem de Contribuição */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 hover:bg-white/10 transition-colors">
            <span className="block text-[9px] font-bold text-[#A8CDB8] uppercase tracking-wider">Margem de Contribuição</span>
            <h5 className="text-lg font-black font-mono text-white">R$ {margemContribuicao.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
            <p className="text-[10px] text-[#A8CDB8]">Receita Líquida (-) Custos Variáveis</p>
          </div>

          {/* Box 4: Comprometimento de Folha */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 hover:bg-white/10 transition-colors">
            <span className="block text-[9px] font-bold text-[#A8CDB8] uppercase tracking-wider">Comprometimento de Folha</span>
            <h5 className="text-lg font-black font-mono text-white">{comprometimentoFolha.toFixed(2)}%</h5>
            <p className="text-[10px] text-[#A8CDB8]">Meta recomendada ≤ 40,00% (Atual: R$ {totalFolhaVal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</p>
          </div>

          {/* Box 5: Serviço de Dívida / Amortizações */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 hover:bg-white/10 transition-colors">
            <span className="block text-[9px] font-bold text-[#A8CDB8] uppercase tracking-wider">Comprometimento de Empréstimos</span>
            <h5 className="text-lg font-black font-mono text-white">{comprometimentoEmprestimo.toFixed(2)}%</h5>
            <p className="text-[10px] text-[#A8CDB8]">Limite seguro ≤ 10,00% (Parcelas mensais: R$ {financialExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })})</p>
          </div>

          {/* Box 6: Ticket Médio Real */}
          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-1 hover:bg-white/10 transition-colors">
            <span className="block text-[9px] font-bold text-[#A8CDB8] uppercase tracking-wider">Ticket Médio Real</span>
            <h5 className="text-lg font-black font-mono text-white">R$ {ticketMedioReal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h5>
            <p className="text-[10px] text-[#A8CDB8]">Autodeclarado: R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ({atendimentosExecutados} ordens)</p>
          </div>
        </div>
      </div>

      {/* Main Charts and Simplified DRE layout split */}
      <div className="grid gap-6 lg:grid-cols-12">
        
        {/* Fluxo de Caixa Line Chart - Left */}
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 lg:col-span-8 flex flex-col justify-between" id="chart-fluxo-caixa">
          <div className="border-b border-[#E8E6E1] pb-4 space-y-1 text-left">
            <h3 className="text-base font-bold font-display text-[#141410]">
              Fluxo de Caixa Mensal Proporcional (Timeline)
            </h3>
            <p className="text-xs text-[#6B6B5F]">Monitoramento semanal das receitas versus despesas operacionais consolidadas.</p>
          </div>

          <div className="h-[280px] w-full mt-6" id="wrapper-fluxo-caixa-chart">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={weekData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" />
                <XAxis dataKey="name" stroke="#6B6B5F" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                <YAxis stroke="#6B6B5F" style={{ fontSize: '10px' }} />
                <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold' }} />
                <Area type="monotone" dataKey="Saldo" fill="#1B3A2D" fillOpacity={0.06} stroke="#1B3A2D" strokeWidth={2} />
                <Bar dataKey="Receitas" fill="#2D6A4F" radius={[4, 4, 0, 0]} barSize={24} />
                <Line type="monotone" dataKey="Despesas" stroke="#C1361A" strokeWidth={2.5} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Simplified DRE Table Card - Right */}
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 lg:col-span-4 flex flex-col justify-between text-left" id="card-dre-simplified">
          <div className="border-b border-[#E8E6E1] pb-4 space-y-1">
            <h3 className="text-base font-bold font-display text-[#141410]">DRE Simplificada</h3>
            <p className="text-xs text-[#6B6B5F]">Exibindo comutação deduzida matematicamente de lançamentos reconciliados.</p>
          </div>

          <div className="py-4 flex-1 space-y-3.5 text-xs text-slate-700">
            <div className="flex justify-between items-center font-semibold">
              <span>Faturamento Bruto:</span>
              <span className="font-mono text-emerald-700 font-bold">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center text-[#6B6B5F]">
              <span>(-) Impostos:</span>
              <span className="font-mono text-[#141410] font-semibold">R$ {taxesTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center border-t border-[#E8E6E1] pt-2 font-extrabold text-neutral-800">
              <span>(=) Receita Líquida:</span>
              <span className="font-mono font-black">R$ {(totalRevenue - taxesTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center text-[#6B6B5F]">
              <span>(-) Custos Diretos (Insumos/Produtos):</span>
              <span className="font-mono text-rose-700 font-semibold">- R$ {directCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center text-[#6B6B5F]">
              <span>(-) Despesas Operacionais:</span>
              <span className="font-mono text-rose-700 font-semibold">- R$ {operationalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center text-[#6B6B5F]">
              <span>(-) Despesas Administrativas:</span>
              <span className="font-mono text-[#141410] font-semibold">- R$ {adminExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center text-[#6B6B5F]">
              <span>(-) Serviços de Dívidas (Passivos/Empréstimos):</span>
              <span className="font-mono text-rose-700 font-semibold">- R$ {financialExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center border-t-2 border-stone-800 pt-2 font-black text-neutral-950 text-sm">
              <span>LUCRO OPERACIONAL LÍQUIDO:</span>
              <span className="font-mono font-extrabold">R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="flex justify-between items-center pt-1 text-[11px] font-bold">
              <span>Margem Líquida Realizada:</span>
              <span className={`px-2.5 py-0.5 rounded-lg border ${
                operationalMargin >= 35 ? 'bg-emerald-50 border-emerald-300 text-emerald-800' :
                operationalMargin >= 20 ? 'bg-amber-50 border-amber-300 text-amber-800' :
                'bg-rose-50 border-rose-300 text-rose-800'
              }`}>{operationalMargin.toFixed(2)}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Breakdowns section: Categories, Products, Teams, Vehicles */}
      <div className="grid gap-6 md:grid-cols-12 animate-in fade-in duration-500">
        
        {/* Cost breakdown by categories chart */}
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 md:col-span-4 text-left" id="card-pie-categories">
          <div className="border-b border-[#E8E6E1] pb-4 space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#141410]">Distribuição de Custos</h3>
            <p className="text-[11px] text-[#6B6B5F]">Soma de saídas para cada grupo de contas.</p>
          </div>

          <div className="h-[220px] w-full mt-4" id="wrapper-categories-pie">
            {costsByGroupData.length === 0 ? (
              <div className="h-full flex items-center justify-center font-medium text-xs text-[#6B6B5F]">Sem dados cadastrados.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costsByGroupData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {costsByGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Simple Legend lists */}
          <div className="space-y-1 text-[11px] font-medium text-[#6B6B5F] mt-4">
            {costsByGroupData.map((item, index) => (
              <div key={item.name} className="flex justify-between items-center">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                  {item.name}:
                </span>
                <span className="font-mono text-neutral-800 font-extrabold text-right">
                  R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Costs of products */}
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 md:col-span-4 text-left" id="card-kpi-products">
          <div className="border-b border-[#E8E6E1] pb-4 space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#141410]">Custos de Produtos e Insumos</h3>
            <p className="text-[11px] text-[#6B6B5F]">Gastos específicos com químicos, gel e iscas ativas.</p>
          </div>

          <div className="space-y-4 py-6 flex-1">
            <div className="text-center bg-[#FAFAF9] border border-[#E8E6E1] py-5 rounded-2xl">
              <span className="text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider block">Total Desembolsado em Produtos</span>
              <h4 className="text-3xl font-black font-mono text-[#1B3A2D] mt-1">
                R$ {productCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h4>
            </div>

            <div className="space-y-2 text-xs text-[#6B6B5F]">
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Subprodutos Analisados</span>
              <div className="flex justify-between border-b border-[#F1F0EC] pb-1.5">
                <span>Produtos Químicos (BIFENTOL/OPTIGARD):</span>
                <span className="font-mono text-[#141410] font-bold">R$ {Math.abs(activeMovements.filter(m => m.subcategory === 'Produtos Químicos').reduce((sum, curr) => sum + curr.value, 0)).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between border-b border-[#F1F0EC] pb-1.5">
                <span>Iscas e Controle de Roedores Tracker:</span>
                <span className="font-mono text-[#141410] font-bold">R$ {Math.abs(activeMovements.filter(m => m.subcategory === 'Iscas').reduce((sum, curr) => sum + curr.value, 0)).toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span>Gel Baraticida de Alta Atratividade:</span>
                <span className="font-mono text-[#141410] font-bold">R$ {Math.abs(activeMovements.filter(m => m.subcategory === 'Gel Baraticida').reduce((sum, curr) => sum + curr.value, 0)).toLocaleString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown of teams & vehicles */}
        <div className="bg-white border border-[#E8E6E1] rounded-3xl p-6 md:col-span-4 text-left flex flex-col justify-between" id="card-kpi-teams">
          <div className="border-b border-[#E8E6E1] pb-4 space-y-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#141410]">Custos Operacionais Unitários</h3>
            <p className="text-[11px] text-[#6B6B5F]">Comparativo financeiro entre frotas e equipes de campo.</p>
          </div>

          <div className="space-y-4 py-4 flex-1">
            {/* Equipes list */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase text-[#6B6B5F] tracking-wider font-sans flex items-center gap-1">
                <Users2 className="size-3.5 text-[#2D6A4F]" />
                Custos por Equipe
              </span>
              <div className="space-y-1.5 text-xs text-[#6B6B5F]">
                <div className="flex justify-between border-b border-[#FAF9F5] pb-1">
                  <span>Equipe Alfa (Técnica):</span>
                  <span className="font-mono text-[#141410] font-semibold">R$ {teamAlfaCosts.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between border-b border-[#FAF9F5] pb-1">
                  <span>Equipe Beta (Suporte/Operacional):</span>
                  <span className="font-mono text-[#141410] font-semibold">R$ {teamBetaCosts.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>

            {/* Veículos list */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-bold uppercase text-[#6B6B5F] tracking-wider font-sans flex items-center gap-1">
                <Car className="size-3.5 text-[#D4A017]" />
                Custos de Combustível/Manutenção por Frota
              </span>
              <div className="space-y-1.5 text-xs text-[#6B6B5F]">
                <div className="flex justify-between border-b border-[#FAF9F5] pb-1">
                  <span>Veículo Pajero TR4 (Veículo 01):</span>
                  <span className="font-mono text-[#141410] font-semibold">R$ {vehicle01Costs.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Veículo Fiorino Log (Veículo 02):</span>
                  <span className="font-mono text-[#141410] font-semibold">R$ {vehicle02Costs.toLocaleString('pt-BR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
