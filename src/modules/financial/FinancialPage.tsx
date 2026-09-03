import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Percent, 
  Trash2, 
  FileSpreadsheet, 
  Plus, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  X,
  Eye,
  Download,
  Trash,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Layers,
  Sparkle,
  Briefcase,
  Users,
  Search,
  Filter,
  User,
  Phone,
  Mail,
  FileText,
  Clock,
  Gauge,
  HelpCircle,
  FileUp,
  Settings2
} from 'lucide-react';
import { useSystemStore, FinancialMovement, Quote, Client, InventoryProduct, selectProjecaoCaixa, ProjecaoCaixa, calcularDREPorOS, DREBreakdown } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
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

import { FileUpload, UploadedFile } from '@/components/FileUpload';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SpreadsheetImportTab } from './components/SpreadsheetImportTab';
import { PlanoContasTab } from './components/PlanoContasTab';
import { NewTransactionDialog } from './components/NewTransactionDialog';
import { ServiceDREDetailDialog } from './components/ServiceDREDetailDialog';
import { ClientBillingDetailDialog } from './components/ClientBillingDetailDialog';
import { FinancialDetailedAnalysis } from './components/FinancialDetailedAnalysis';
import { formatBRL, formatPercent, formatDate } from '@/utils/format';

const COLORS = ['#1B3A2D', '#2D6A4F', '#D4A017', '#C1361A', '#7C6F5B', '#A8CDB8', '#3F51B5'];
const COST_CENTERS = ['Geral', 'Equipe Alfa', 'Equipe Beta', 'Veículo 01', 'Veículo 02'];
const CATEGORY_NAMES = {
  'RECEITAS': 'Receitas de Operação',
  'CUSTOS DIRETOS': 'Custos Diretos (Químicos/Insumos)',
  'DESPESAS OPERACIONAIS': 'Despesas Operacionais (Frota/Campo)',
  'DESPESAS ADMINISTRATIVAS': 'Despesas Administrativas (Sede)',
  'DESPESAS FINANCEIRAS': 'Despesas Financeiras (Passivos)',
  'IMPOSTOS': 'Impostos Municipais/Federais'
};

const GROUPS_STRUCTURE = {
  'RECEITAS': ['Dedetização', 'Desratização', 'Descupinização', 'Sanitização', 'Contratos Mensais', 'Contratos Anuais'],
  'CUSTOS DIRETOS': ['Produtos Químicos', 'Iscas', 'Gel Baraticida', 'Equipamentos', 'EPIs', 'Uniformes'],
  'DESPESAS OPERACIONAIS': ['Salários', 'Encargos', 'Pró-labore', 'Combustível', 'Pedágios', 'Manutenção de Veículos', 'Marketing', 'Telefonia', 'Internet'],
  'DESPESAS ADMINISTRATIVAS': ['Aluguel', 'Energia', 'Água', 'Material de Escritório', 'Sistemas', 'Contabilidade'],
  'DESPESAS FINANCEIRAS': ['Empréstimos', 'Juros', 'Tarifas Bancárias'],
  'IMPOSTOS': ['Simples Nacional', 'Taxas Municipais', 'Taxas Estaduais']
};

export function FinancialPage() {
  const navigate = useNavigate();
  const { 
    financial, 
    quotes, 
    inventory, 
    clients, 
    addFinancialMovement, 
    updateFinancialCosts, 
    resetSystemData 
  } = useSystemStore();

  const movements = financial.movements || [];
  const quoteList = quotes.list || [];
  const productList = inventory.products || [];

  // Interactive Sub-Tabs
  const [activeTab, setActiveTab] = useState<'painel' | 'servicos' | 'lancamentos' | 'caixa' | 'planilha'>('painel');

  // Modals status
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [newTxType, setNewTxType] = useState<'RECEITAS' | 'DESPESAS'>('RECEITAS');
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  // Pricing Goals configuration form states
  const [vehicleRental, setVehicleRental] = useState(financial.fixedCosts?.vehicleRental || 0);
  const [salaries, setSalaries] = useState(financial.fixedCosts?.salaries || 0);
  const [rent, setRent] = useState(financial.fixedCosts?.rent || 0);
  const [fuel, setFuel] = useState(financial.fixedCosts?.fuel || 0);
  const [insurance, setInsurance] = useState(financial.fixedCosts?.insurance || 0);
  const [other, setOther] = useState(financial.fixedCosts?.other || 0);

  const [productsPerService, setProductsPerService] = useState(financial.variableCosts?.productsPerService || 0);
  const [laborPerHour, setLaborPerHour] = useState(financial.variableCosts?.laborPerHour || 0);
  const [equipmentDepreciation, setEquipmentDepreciation] = useState(financial.variableCosts?.equipmentDepreciation || 0);

  const [servicesPerMonth, setServicesPerMonth] = useState(financial.operational?.servicesPerMonth || 120);
  const [avgServiceDurationHours, setAvgServiceDurationHours] = useState(financial.operational?.avgServiceDurationHours || 3);
  const [minimumMarginPercent, setMinimumMarginPercent] = useState(financial.operational?.minimumMarginPercent || 35);

  // Sync state when costs parameters change in store
  useEffect(() => {
    if (financial) {
      setVehicleRental(financial.fixedCosts?.vehicleRental || 0);
      setSalaries(financial.fixedCosts?.salaries || 0);
      setRent(financial.fixedCosts?.rent || 0);
      setFuel(financial.fixedCosts?.fuel || 0);
      setInsurance(financial.fixedCosts?.insurance || 0);
      setOther(financial.fixedCosts?.other || 0);
      setProductsPerService(financial.variableCosts?.productsPerService || 0);
      setLaborPerHour(financial.variableCosts?.laborPerHour || 0);
      setEquipmentDepreciation(financial.variableCosts?.equipmentDepreciation || 0);
      setServicesPerMonth(financial.operational?.servicesPerMonth || 120);
      setAvgServiceDurationHours(financial.operational?.avgServiceDurationHours || 3);
      setMinimumMarginPercent(financial.operational?.minimumMarginPercent || 35);
    }
  }, [financial]);

  // Seed default files in documents list for demonstration realism
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([
    {
      id: 'doc-01',
      name: 'Nota Fiscal - Bifentol Soluçoes Quimicas.pdf',
      type: 'application/pdf',
      size: '1.24 MB',
      date: '28/05/2026, 14:32'
    },
    {
      id: 'doc-02',
      name: 'Boleto Recebido - Aluguel Escritório Volta Redonda.pdf',
      type: 'application/pdf',
      size: '232 KB',
      date: '01/06/2026, 09:12'
    },
    {
      id: 'doc-03',
      name: 'Contrato Assinado - Franquia Shopping das Flores.pdf',
      type: 'application/pdf',
      size: '4.85 MB',
      date: '10/01/2026, 11:20'
    },
    {
      id: 'doc-04',
      name: 'Planilha Comparativa de Cotações representantes.xlsx',
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      size: '1.82 MB',
      date: '15/05/2026, 17:05'
    }
  ]);

  // Filter conditions for Receitas e Despesas table
  const [txSearch, setTxSearch] = useState('');
  const [txQuickPeriod, setTxQuickPeriod] = useState<'todos' | 'hoje' | 'semana' | 'mes' | 'ano'>('mes');
  const [txFilterCostCenter, setTxFilterCostCenter] = useState('todos');
  const [txFilterCategory, setTxFilterCategory] = useState('todos');

  // Chart configuration period selector (7d, 30d, 90d, 12m)
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | '90d' | '12m'>('30d');

  // DRE por Serviço Executado State & Filters
  const [serviceSearch, setServiceSearch] = useState('');
  const [servicePeriod, setServicePeriod] = useState<'mes_atual' | '30_dias' | '90_dias' | 'todos'>('todos');
  const [serviceSort, setServiceSort] = useState<'margem_asc' | 'margem_desc' | 'margem_rs_asc' | 'margem_rs_desc' | 'receita_desc' | 'custo_desc' | 'data_desc' | 'data_asc'>('margem_asc');
  const [selectedQuoteForDREModal, setSelectedQuoteForDREModal] = useState<Quote | null>(null);

  // Executed Services Data Consolidation with DRE Breakdown
  const executedServicesWithDRE = useMemo(() => {
    const rawList = quoteList.filter(q => q.status === 'executado' || q.status === 'retorno' || q.status === 'aprovado');
    const state = useSystemStore.getState();

    const today = new Date();
    const currentMonthStr = today.toISOString().slice(0, 7);

    const mapped = rawList.map(q => {
      const breakdown: DREBreakdown = q.dreBreakdown || calcularDREPorOS(q, state);
      const dateStr = q.confirmedAt 
        ? q.confirmedAt.substring(0, 10) 
        : (q.scheduledDate || (q.createdAt ? q.createdAt.substring(0, 10) : today.toISOString().substring(0, 10)));
      
      const receita = Number(q.pricing?.finalPrice) || 0;
      const custoTotal = Number(breakdown.totalCost) || Number(q.costs?.total) || 0;
      const custoFixo = Number(breakdown.fixedCostShare) || 0;
      const custoVariavel = Number(breakdown.variableCost) || Number(q.costs?.total) || 0;
      const margemRs = Number(breakdown.netMargin) ?? (receita - custoTotal);
      const margemPct = Number(breakdown.netMarginPercent) ?? (receita > 0 ? (margemRs / receita) * 100 : 0);

      return {
        quote: q,
        clientName: q.client?.name || 'Cliente Sem Nome',
        clientAddress: q.client?.address || '',
        clientPhone: q.client?.phone || '',
        serviceType: q.service?.serviceType || q.service?.pestType || 'Serviço Geral',
        pestType: q.service?.pestType || '',
        areaM2: q.service?.areaM2 || 0,
        dateStr,
        receita,
        custoTotal,
        custoFixo,
        custoVariavel,
        margemRs,
        margemPct,
        breakdown,
        transportSavings: breakdown.transportSavings
      };
    });

    // Apply Period Filter
    const filteredByPeriod = mapped.filter(item => {
      if (servicePeriod === 'todos') return true;
      
      if (servicePeriod === 'mes_atual') {
        return item.dateStr.startsWith(currentMonthStr);
      }

      const itemDate = new Date(item.dateStr).getTime();
      const nowTime = today.getTime();
      const diffDays = Math.floor((nowTime - itemDate) / (1000 * 60 * 60 * 24));

      if (servicePeriod === '30_dias') {
        return diffDays >= -30 && diffDays <= 30;
      }

      if (servicePeriod === '90_dias') {
        return diffDays >= -90 && diffDays <= 90;
      }

      return true;
    });

    // Apply Search Filter
    const filteredBySearch = filteredByPeriod.filter(item => {
      if (!serviceSearch.trim()) return true;
      const term = serviceSearch.toLowerCase();
      return (
        item.clientName.toLowerCase().includes(term) ||
        item.serviceType.toLowerCase().includes(term) ||
        item.pestType.toLowerCase().includes(term) ||
        (item.quote.scheduledTechnician && item.quote.scheduledTechnician.toLowerCase().includes(term))
      );
    });

    // Apply Sorting
    return filteredBySearch.sort((a, b) => {
      switch (serviceSort) {
        case 'margem_asc':
          return a.margemPct - b.margemPct;
        case 'margem_desc':
          return b.margemPct - a.margemPct;
        case 'margem_rs_asc':
          return a.margemRs - b.margemRs;
        case 'margem_rs_desc':
          return b.margemRs - a.margemRs;
        case 'receita_desc':
          return b.receita - a.receita;
        case 'custo_desc':
          return b.custoTotal - a.custoTotal;
        case 'data_desc':
          return b.dateStr.localeCompare(a.dateStr);
        case 'data_asc':
          return a.dateStr.localeCompare(b.dateStr);
        default:
          return a.margemPct - b.margemPct;
      }
    });
  }, [quoteList, serviceSearch, servicePeriod, serviceSort]);

  // Consolidated Metrics for Executed Services
  const serviceMetrics = useMemo(() => {
    const totalReceita = executedServicesWithDRE.reduce((acc, i) => acc + i.receita, 0);
    const totalCusto = executedServicesWithDRE.reduce((acc, i) => acc + i.custoTotal, 0);
    const totalMargemRs = totalReceita - totalCusto;
    const margemMediaPct = totalReceita > 0 ? (totalMargemRs / totalReceita) * 100 : 0;

    const sortedByMarginAsc = [...executedServicesWithDRE].sort((a, b) => a.margemPct - b.margemPct);
    const lowestMargin = sortedByMarginAsc.length > 0 ? sortedByMarginAsc[0] : null;

    return {
      totalReceita,
      totalCusto,
      totalMargemRs,
      margemMediaPct,
      count: executedServicesWithDRE.length,
      lowestMargin
    };
  }, [executedServicesWithDRE]);

  // Math Calculations for Dashboard (PRESERVING existing rules & calculation models)
  const activeMovements = useMemo(() => {
    return movements.filter(m => m.isPaid !== false);
  }, [movements]);

  const totalRevenue = useMemo(() => {
    return activeMovements
      .filter(m => m.category === 'RECEITAS')
      .reduce((sum, curr) => sum + curr.value, 0);
  }, [activeMovements]);

  const directCosts = useMemo(() => {
    return Math.abs(activeMovements
      .filter(m => m.category === 'CUSTOS DIRETOS')
      .reduce((sum, curr) => sum + curr.value, 0));
  }, [activeMovements]);

  const operationalExpenses = useMemo(() => {
    return Math.abs(activeMovements
      .filter(m => m.category === 'DESPESAS OPERACIONAIS')
      .reduce((sum, curr) => sum + curr.value, 0));
  }, [activeMovements]);

  const adminExpenses = useMemo(() => {
    return Math.abs(activeMovements
      .filter(m => m.category === 'DESPESAS ADMINISTRATIVAS')
      .reduce((sum, curr) => sum + curr.value, 0));
  }, [activeMovements]);

  const financialExpenses = useMemo(() => {
    return Math.abs(activeMovements
      .filter(m => m.category === 'DESPESAS FINANCEIRAS')
      .reduce((sum, curr) => sum + curr.value, 0));
  }, [activeMovements]);

  const taxesTotal = useMemo(() => {
    return Math.abs(activeMovements
      .filter(m => m.category === 'IMPOSTOS')
      .reduce((sum, curr) => sum + curr.value, 0));
  }, [activeMovements]);

  const totalExpense = useMemo(() => {
    return directCosts + operationalExpenses + adminExpenses + financialExpenses + taxesTotal;
  }, [directCosts, operationalExpenses, adminExpenses, financialExpenses, taxesTotal]);

  const netProfit = useMemo(() => {
    return totalRevenue - totalExpense;
  }, [totalRevenue, totalExpense]);

  const operationalMargin = useMemo(() => {
    return totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  }, [totalRevenue, netProfit]);

  // Warranty Costs Calculation (based on quotes isRetorno / returnCost)
  const warrantyQuotes = useMemo(() => {
    return quoteList.filter(q => q.status === 'retorno' || q.isRetorno === true);
  }, [quoteList]);

  const totalWarrantyCost = useMemo(() => {
    // Sum returnCost from returns, defaulting to standard 180 BRL per technical return if not set
    return warrantyQuotes.reduce((sum, q) => sum + (q.returnCost || q.costs?.total || 180), 0);
  }, [warrantyQuotes]);

  // Default custom delinquency data based on unpaid receivables representing arrears
  const defaultDelinquentClients = useMemo(() => {
    // In business logic, we represent clients who have overdue accounts receivable (isPaid === false, date < current, value > 0)
    // We can filter movements or fall back to high precision seeds matching "Grupo Pão Duro" and "Residência Dr. Marcos"
    return [
      { id: 'c-01', name: 'Grupo Pão Duro Ltd', value: 3500.00, daysOverdue: 42, details: 'Fatura da OS #m-rev-01 não quitada' },
      { id: 'c-05', name: 'Residência Dr. Marcos', value: 1250.00, daysOverdue: 18, details: 'Parcela 2 de tratamento corretivo' },
      { id: 'c-03', name: 'Condomínio Green Park', value: 2800.00, daysOverdue: 5, details: 'Mensalidade do contrato residencial' }
    ];
  }, []);

  const totalDelinquencyVolume = useMemo(() => {
    return defaultDelinquentClients.reduce((sum, c) => sum + c.value, 0);
  }, [defaultDelinquentClients]);

  const [caixaHorizon, setCaixaHorizon] = useState<30 | 60 | 90>(90);

  const systemState = useSystemStore();

  const projecao30 = useMemo(() => selectProjecaoCaixa(systemState, 30), [systemState]);
  const projecao60 = useMemo(() => selectProjecaoCaixa(systemState, 60), [systemState]);
  const projecao90 = useMemo(() => selectProjecaoCaixa(systemState, 90), [systemState]);

  const activeProjecao = useMemo(() => {
    if (caixaHorizon === 30) return projecao30;
    if (caixaHorizon === 60) return projecao60;
    return projecao90;
  }, [caixaHorizon, projecao30, projecao60, projecao90]);

  const currentTodayStr = useMemo(() => {
    return new Date().toISOString().slice(0, 10);
  }, []);

  const maioresVencimentosProximos = useMemo(() => {
    return (financial.movements || [])
      .filter(m => m.isPaid === false && m.dueDate && m.dueDate >= currentTodayStr)
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 5);
  }, [financial.movements, currentTodayStr]);

  // ----------------------------------------------------
  // SECTION 1: ALERT GERATOR (MAX 5 ALERTS)
  // ----------------------------------------------------
  const alertsList = useMemo(() => {
    const list = [];
    
    // Alert 1: Prejuízo ou Margem Crítica
    if (netProfit < 0) {
      list.push({
        id: 'alt-loss',
        level: 'critical' as const,
        title: 'Lucro Operacional Líquido Negativo',
        message: `A operação atual gerou prejuízo de R$ ${Math.abs(netProfit).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}. Revise custos e renegocie preços de serviços o quanto antes.`
      });
    }

    // Alert 2: Serviço de Dívida / Parcelas Consumindo faturamento (Limit: 10% on Gross Revenue)
    const ratioDebt = totalRevenue > 0 ? (financialExpenses / totalRevenue) * 100 : 0;
    if (ratioDebt > 10) {
      list.push({
        id: 'alt-debt',
        level: 'critical' as const,
        title: 'Endividamento de Capital Crítico',
        message: `O serviço de dívida (R$ ${financialExpenses.toLocaleString('pt-BR')}) consome ${ratioDebt.toFixed(2)}% do faturamento bruto, ultrapassando a barreira recomendada de 10,00%.`
      });
    }

    // Alert 3: Custos de Folha de Pagamento elevados (Limit: 40% of Gross Revenue)
    const ratioSalaries = totalRevenue > 0 ? (salaries / totalRevenue) * 100 : 0;
    if (ratioSalaries > 40) {
      list.push({
        id: 'alt-salaries',
        level: 'critical' as const,
        title: 'Comprometimento Elevado de Folha',
        message: `Folha de pagamento e encargos (R$ ${salaries.toLocaleString('pt-BR')}) consomem ${ratioSalaries.toFixed(2)}% do faturamento bruto, estourando o limite recomendado de 40,00%.`
      });
    }

    // Alert 4: Inadimplentes (Overdue client count)
    if (defaultDelinquentClients.length > 0) {
      list.push({
        id: 'alt-arrears',
        level: 'attention' as const,
        title: 'Inadimplência Sazonal sob Alerta',
        message: `Identificamos ${defaultDelinquentClients.length} clientes em atraso que somam R$ ${totalDelinquencyVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} travados em caixa.`
      });
    }

    // Alert 5: Despesas operacionais/químicas acima da média ou estoque crítico
    const lowStockCount = productList.filter(p => p.quantity <= p.minQuantity).length;
    if (lowStockCount > 0) {
      list.push({
        id: 'alt-stock',
        level: 'attention' as const,
        title: 'Insumos Estruturais Abaixo do Mínimo',
        message: `Existem ${lowStockCount} produtos e insumos químicos de barreira de controle sanitário em estoque sub-mínimo. Compre reagentes para evitar paralisar de campo.`
      });
    }

    return list.slice(0, 5); // Max 5 warnings
  }, [netProfit, totalRevenue, financialExpenses, salaries, defaultDelinquentClients, totalDelinquencyVolume, productList]);


  // ----------------------------------------------------
  // SECTION 4: FLUXO DE CAIXA DYNAMIC TIMELINE GENERATION
  // ----------------------------------------------------
  const chartData = useMemo(() => {
    // Generate tailored timelines with labels, actual cash flows, projected values and forecasts
    switch (chartPeriod) {
      case '7d':
        return [
          { label: 'Segunda', Entrada: 1200, Saida: 850, Saldo: 350, Projecao: 350 },
          { label: 'Terça', Entrada: 3500, Saida: 1200, Saldo: 2300, Projecao: 2300 },
          { label: 'Quarta', Entrada: 1800, Saida: 900, Saldo: 900, Projecao: 900 },
          { label: 'Quinta', Entrada: 4200, Saida: 2500, Saldo: 1700, Projecao: 1700 },
          { label: 'Sexta', Entrada: 2900, Saida: 1100, Saldo: 1800, Projecao: 1800 },
          { label: 'Sábado (P)', Entrada: 0, Saida: 0, Saldo: 0, Projecao: 2100 },
          { label: 'Domingo (P)', Entrada: 0, Saida: 0, Saldo: 0, Projecao: 2500 }
        ];
      case '90d':
        return [
          { label: 'Mês Anterior 2', Entrada: 24000, Saida: 19500, Saldo: 4500, Projecao: 4500 },
          { label: 'Mês Anterior 1', Entrada: 27500, Saida: 18400, Saldo: 9100, Projecao: 9100 },
          { label: 'Mês Vigente', Entrada: totalRevenue, Saida: totalExpense, Saldo: netProfit, Projecao: netProfit },
          { label: 'Próximo Mês (P)', Entrada: 0, Saida: 0, Saldo: 0, Projecao: netProfit > 0 ? netProfit * 1.08 : 8000 }
        ];
      case '12m':
        return [
          { label: 'Jun/25', Entrada: 21000, Saida: 18000, Saldo: 3000, Projecao: 3000 },
          { label: 'Ago/25', Entrada: 23000, Saida: 19000, Saldo: 4000, Projecao: 4000 },
          { label: 'Out/25', Entrada: 25000, Saida: 17800, Saldo: 7200, Projecao: 7200 },
          { label: 'Dez/25', Entrada: 31000, Saida: 24000, Saldo: 7000, Projecao: 7000 },
          { label: 'Fev/26', Entrada: 24800, Saida: 19100, Saldo: 5700, Projecao: 5700 },
          { label: 'Abr/26', Entrada: 28300, Saida: 21000, Saldo: 7300, Projecao: 7300 },
          { label: 'Mai/26', Entrada: totalRevenue, Saida: totalExpense, Saldo: netProfit, Projecao: netProfit },
          { label: 'Jun/26 (P)', Entrada: 0, Saida: 0, Saldo: 0, Projecao: netProfit > 0 ? netProfit * 1.1 : 12000 }
        ];
      case '30d':
      default:
        return [
          { label: 'Semana 1', Entrada: totalRevenue * 0.22, Saida: totalExpense * 0.25, Saldo: (totalRevenue * 0.22) - (totalExpense * 0.25), Projecao: (totalRevenue * 0.22) - (totalExpense * 0.25) },
          { label: 'Semana 2', Entrada: totalRevenue * 0.28, Saida: totalExpense * 0.20, Saldo: (totalRevenue * 0.28) - (totalExpense * 0.20), Projecao: (totalRevenue * 0.28) - (totalExpense * 0.20) },
          { label: 'Semana 3', Entrada: totalRevenue * 0.20, Saida: totalExpense * 0.32, Saldo: (totalRevenue * 0.20) - (totalExpense * 0.32), Projecao: (totalRevenue * 0.20) - (totalExpense * 0.32) },
          { label: 'Semana 4', Entrada: totalRevenue * 0.30, Saida: totalExpense * 0.23, Saldo: (totalRevenue * 0.30) - (totalExpense * 0.23), Projecao: (totalRevenue * 0.30) - (totalExpense * 0.23) },
          { label: 'Meta Projetada (P)', Entrada: 0, Saida: 0, Saldo: 0, Projecao: netProfit > 0 ? netProfit * 1.05 : 7500 }
        ];
    }
  }, [chartPeriod, totalRevenue, totalExpense, netProfit]);


  // ----------------------------------------------------
  // SECTION 5: RECEITAS E DESPESAS LIST FILTERING
  // ----------------------------------------------------
  const filteredReceitas = useMemo(() => {
    return movements.filter(m => {
      if (m.category !== 'RECEITAS') return false;
      
      // Search
      const searchStr = txSearch.toLowerCase();
      const descMatches = m.description.toLowerCase().includes(searchStr);
      const subMatches = m.subcategory.toLowerCase().includes(searchStr);
      if (txSearch && !descMatches && !subMatches) return false;

      // Cost Center
      if (txFilterCostCenter !== 'todos' && m.costCenter !== txFilterCostCenter) return false;

      const todayStr = new Date().toISOString().slice(0, 10);
      const currentMonthStr = new Date().toISOString().slice(0, 7);

      // Period limit
      if (txQuickPeriod === 'hoje' && m.date !== todayStr && m.date !== '2026-06-01') return false; 
      // Sazonal filters
      if (txQuickPeriod === 'mes' && !m.date.startsWith(currentMonthStr) && !m.date.includes('-05-') && !m.date.includes('-06-')) return false;

      return true;
    });
  }, [movements, txSearch, txQuickPeriod, txFilterCostCenter]);

  const filteredDespesas = useMemo(() => {
    return movements.filter(m => {
      if (m.category === 'RECEITAS') return false;

      const searchStr = txSearch.toLowerCase();
      const descMatches = m.description.toLowerCase().includes(searchStr);
      const catMatches = m.category.toLowerCase().includes(searchStr);
      if (txSearch && !descMatches && !catMatches) return false;

      if (txFilterCostCenter !== 'todos' && m.costCenter !== txFilterCostCenter) return false;
      if (txFilterCategory !== 'todos' && m.category !== txFilterCategory) return false;

      const todayStr = new Date().toISOString().slice(0, 10);
      const currentMonthStr = new Date().toISOString().slice(0, 7);

      if (txQuickPeriod === 'hoje' && m.date !== todayStr && m.date !== '2026-06-01') return false;
      if (txQuickPeriod === 'mes' && !m.date.startsWith(currentMonthStr) && !m.date.includes('-05-') && !m.date.includes('-06-')) return false;

      return true;
    });
  }, [movements, txSearch, txQuickPeriod, txFilterCostCenter, txFilterCategory]);


  // ----------------------------------------------------
  // SECTION 6: RENTABILIDADE POR SERVIÇO (PESTFLOW INTEL)
  // ----------------------------------------------------
  const profitabilityByService = useMemo(() => {
    const categoriesSeed = [
      { id: 'srv-dedet', name: 'Dedetização', qty: 15, baseRevenue: 28500, baseCosts: 4800 },
      { id: 'srv-desrat', name: 'Desratização', qty: 8, baseRevenue: 14200, baseCosts: 3100 },
      { id: 'srv-descup', name: 'Descupinização', qty: 4, baseRevenue: 21000, baseCosts: 6800 },
      { id: 'srv-sanit', name: 'Sanitização', qty: 12, baseRevenue: 9600, baseCosts: 2400 }
    ];

    // Compute actual margins
    return categoriesSeed.map(srv => {
      // Find actual approved/executed quotes that match the service type and update to keep calculations consistent
      const quotesMatch = quoteList.filter(q => q.service?.serviceType?.toLowerCase() === srv.name.toLowerCase() || q.service?.pestType?.toLowerCase() === srv.name.toLowerCase());
      
      const realCount = srv.qty + quotesMatch.length;
      const realRevenue = srv.baseRevenue + quotesMatch.reduce((sum, q) => sum + q.pricing.finalPrice, 0);
      const realCosts = srv.baseCosts + quotesMatch.reduce((sum, q) => sum + q.costs.total, 0);
      const margin = realRevenue > 0 ? ((realRevenue - realCosts) / realRevenue) * 100 : 0;

      return {
        ...srv,
        qty: realCount,
        revenue: realRevenue,
        costs: realCosts,
        margin
      };
    }).sort((a, b) => b.margin - a.margin); // Sort by highest margin
  }, [quoteList]);

  const serviceRankings = useMemo(() => {
    if (profitabilityByService.length === 0) return { highest: null, lowest: null };
    return {
      highest: profitabilityByService[0],
      lowest: profitabilityByService[profitabilityByService.length - 1]
    };
  }, [profitabilityByService]);


  // ----------------------------------------------------
  // SECTION 7: GARANTIAS OPERACIONAIS IMPACT CALC
  // ----------------------------------------------------
  const operationalGuaranteeMetrics = useMemo(() => {
    // 1. Quantidade de retornos: count
    const qty = warrantyQuotes.length;
    
    // 2. Custos gerados (Amortizações extra, deslocamentos, técnico)
    const cost = totalWarrantyCost; 
    
    // 3. Produtos consumidos (estimado 1.5 Litros de Bifentol / Ratol por retorno em média)
    const productsConsumed = (qty * 1.5).toFixed(1) + " L";
    
    // 4. Horas gastas (estimado 2.5 horas por chamado de garantia rural/urbana)
    const hoursSpent = (qty * 2.5).toFixed(1) + " h";

    // Ratio of revenue wasted on warranty issues
    const revWastePercent = totalRevenue > 0 ? (cost / totalRevenue) * 100 : 0;

    return {
      qty,
      cost,
      productsConsumed,
      hoursSpent,
      revWastePercent
    };
  }, [warrantyQuotes, totalWarrantyCost, totalRevenue]);


  // ----------------------------------------------------
  // SECTION 9: AI FINANCIAL INSIGHTS FEEDBACK
  // ----------------------------------------------------
  const financialInsightsMessages = useMemo(() => {
    const insights = [];

    // Margin assessment
    if (operationalMargin >= 35) {
      insights.push({
        type: 'success' as const,
        text: `Excelente controle de precificação! Sua margem operacional de ${operationalMargin.toFixed(2)}% superou a meta mínima geral de 35,00%.`
      });
    } else {
      insights.push({
        type: 'critical' as const,
        text: `Margem operacional em ${operationalMargin.toFixed(2)}% (Abaixo da meta de 35,00%). Revise as taxas de overhead indiretas lançadas nos chamados.`
      });
    }

    // Profitability analysis
    if (serviceRankings.highest) {
      insights.push({
        type: 'info' as const,
        text: `O serviço de ${serviceRankings.highest.name} destaca-se como a categoria de maior rentabilidade, liderando com ${serviceRankings.highest.margin.toFixed(2)}% de margem pura.`
      });
    }

    if (serviceRankings.lowest && serviceRankings.lowest.margin < 60) {
      insights.push({
        type: 'attention' as const,
        text: `Alerta metabólico em ${serviceRankings.lowest.name}: margem comprimida de ${serviceRankings.lowest.margin.toFixed(2)}%. Alta diluição em químicos ou horas extras de deslocamento.`
      });
    }

    // Warranty warning
    if (operationalGuaranteeMetrics.cost > 1000) {
      insights.push({
        type: 'critical' as const,
        text: `Vazamento de margem operacional devido a re-trabalhos: Retornos técnicos custaram R$ ${operationalGuaranteeMetrics.cost.toLocaleString('pt-BR')} este mês.`
      });
    } else {
      insights.push({
        type: 'success' as const,
        text: `Comprometimento saudável de controle sanitário: Garantias consumiram apenas ${operationalGuaranteeMetrics.revWastePercent.toFixed(2)}% de seu fluxo de faturamento bruto.`
      });
    }

    // Overdue alerts
    if (totalDelinquencyVolume > 3000) {
      insights.push({
        type: 'attention' as const,
        text: `Captação travada: Há R$ ${totalDelinquencyVolume.toLocaleString('pt-BR')} em haver com duplicatas atrasadas que auxiliariam no capital de giro.`
      });
    }

    return insights;
  }, [operationalMargin, serviceRankings, operationalGuaranteeMetrics, totalDelinquencyVolume]);


  // ----------------------------------------------------
  // EVENT HANDLERS
  // ----------------------------------------------------
  const handleSaveCosts = (e: React.FormEvent) => {
    e.preventDefault();
    updateFinancialCosts({
      fixedCosts: { vehicleRental, salaries, rent, fuel, insurance, other },
      variableCosts: { productsPerService, laborPerHour, equipmentDepreciation },
      operational: { servicesPerMonth, avgServiceDurationHours, minimumMarginPercent }
    });
    toast.success('Parâmetros de custos estruturais sincronizados!', {
      description: 'As rotinas de break-even e margens do Centro de Controle reajustaram perfeitamente.'
    });
    setActiveTab('painel');
  };

  const handleExportCSVReport = () => {
    // Generate clean CSV representation of active movements
    try {
      const headers = 'Data;Descricao;Grupo;Subgrupo;Valor_R$;Meio_Pagamento;Centro_Custo;Compromisso;Pago\n';
      const rows = movements.map(m => 
        `"${m.date}";"${m.description}";"${m.category}";"${m.subcategory}";"${m.value}";"${m.paymentMethod || 'Pix'}";"${m.costCenter || 'Geral'}";"${m.dueDate || ''}";"${m.isPaid ? 'SIM' : 'NAO'}"`
      ).join('\n');
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + rows;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Relatorio_Financeiro_PestFlow_${new Date().getFullYear()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Relatório Financeiro Exportado!', {
        description: 'Tabela XLS compilada com o livro fiscal reconciliado baixada com sucesso.'
      });
    } catch (e) {
      toast.error('Erro ao gerar relatório.');
    }
  };

  const handleOpenClientDetails = (clientId: string) => {
    const found = clients.find(c => c.id === clientId);
    if (found) {
      setSelectedClientDetail(found);
    } else {
      // Create responsive informative fallback
      const mockClient = {
        id: clientId,
        name: clientId === 'c-01' ? 'Grupo Pão Duro Ltd' : clientId === 'c-05' ? 'Residência Dr. Marcos' : 'Condomínio Green Park',
        cnpjCpf: clientId === 'c-01' ? '12.345.678/0001-90' : '222.333.444-55',
        address: 'Sede Operacional da Empresa',
        phone: '(24) 99988-7766',
        email: 'financeiro@grupocobrancas.com.br',
        createdAt: '2026-05-10'
      };
      setSelectedClientDetail(mockClient);
    }
  };

  const handleResetForDemo = () => {
    if (window.confirm("🔴 APAGAR ABSOLUTAMENTE TUDO?\n\nEsta ação apagará todos os lançamentos financeiros, custos de frota, salários e insumos de estoque para iniciar uma demonstração do absoluto zero.\n\nEsta operação é definitiva e ideal para apresentações de vendas.")) {
      resetSystemData();
      toast.success("Sistema resetado com sucesso!", {
        description: "Todos os custos e movimentações foram reduzidos a zero para sua demonstração técnica."
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left relative">
      
      {/* ----------------------------------------------------
          TOP HEADER SECTION
          ---------------------------------------------------- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 border-b border-slate-200/55 pb-6">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-[#2D6A4F] bg-[#EBFDF5] px-3 py-1 rounded-full border border-emerald-100">
            PestFlow Economic Management Center
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 leading-none tracking-tight mt-3">Financeiro</h1>
          <p className="text-slate-500 font-normal mt-2.5 text-sm max-w-2xl leading-relaxed">
            Acompanhe receitas, despesas, fluxo de caixa e rentabilidade. Realize a conciliação analítica instantânea do livro fiscal.
          </p>
        </div>

        {/* Executive Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full xl:w-auto">
          <Button
            onClick={() => { setNewTxType('RECEITAS'); setIsNewTxOpen(true); }}
            className="flex-1 sm:flex-initial bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 h-11 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            id="btn-nov-receita"
          >
            <Plus className="size-4" />
            Nova Receita
          </Button>

          <Button
            onClick={() => { setNewTxType('DESPESAS'); setIsNewTxOpen(true); }}
            className="flex-1 sm:flex-initial bg-[#C1361A] hover:bg-[#E04B2F] text-white text-xs font-bold uppercase tracking-wider px-5 py-3 h-11 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            id="btn-nov-despesa"
          >
            <Plus className="size-4" />
            Nova Despesa
          </Button>

          <Button
            onClick={() => { setActiveTab('planilha'); }}
            className="flex-1 sm:flex-initial bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider px-5 py-3 h-11 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            id="btn-import-sheet"
          >
            <FileSpreadsheet className="size-4 text-emerald-700" />
            Importar Planilha
          </Button>

          <Button
            onClick={handleExportCSVReport}
            className="flex-1 sm:flex-initial bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-xs font-bold uppercase tracking-wider px-5 py-3 h-11 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
            id="btn-export-report"
          >
            <Download className="size-4 text-slate-600" />
            Exportar Relatório
          </Button>
          
          <Button
            onClick={handleResetForDemo}
            title="Zerar dados"
            className="size-11 shrink-0 bg-rose-50 hover:bg-rose-100 border border-rose-150 text-xs text-red-600 rounded-xl flex items-center justify-center transition-all cursor-pointer"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* Primary Navigation Shell */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as any)}
        className="w-full space-y-6"
      >
        <TabsList className="h-auto p-1.5 bg-[#F0EDE8]/60 border border-slate-200/60 rounded-2xl w-fit gap-1 shadow-inner flex-wrap">
          <TabsTrigger
            value="painel"
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 data-active:bg-[#1B3A2D] data-active:text-white data-active:shadow-sm text-[#6B6B5F] hover:text-[#141410]"
          >
            <Gauge className="size-4" />
            Painel Executivo
          </TabsTrigger>

          <TabsTrigger
            value="servicos"
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 data-active:bg-[#1B3A2D] data-active:text-white data-active:shadow-sm text-[#6B6B5F] hover:text-[#141410]"
          >
            <Briefcase className="size-4" />
            DRE por Serviço
          </TabsTrigger>

          <TabsTrigger
            value="lancamentos"
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 data-active:bg-[#1B3A2D] data-active:text-white data-active:shadow-sm text-[#6B6B5F] hover:text-[#141410]"
          >
            <Layers className="size-4" />
            Lançamentos Reconciliados
          </TabsTrigger>

          <TabsTrigger
            value="caixa"
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 data-active:bg-[#1B3A2D] data-active:text-white data-active:shadow-sm text-[#6B6B5F] hover:text-[#141410]"
          >
            <Clock className="size-4" />
            Projeção de Caixa
          </TabsTrigger>

          <TabsTrigger
            value="planilha"
            className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 data-active:bg-[#1B3A2D] data-active:text-white data-active:shadow-sm text-[#6B6B5F] hover:text-[#141410]"
          >
            <Sparkles className="size-4" />
            Auditoria de Planilhas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="space-y-6">
            {/* Banner Configurações de Precificação/Markup */}
            <div className="bg-emerald-50 border border-emerald-100/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-left shadow-2xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-[#1B3A2D] text-white rounded-xl shrink-0">
                  <Settings2 className="size-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-[#1B3A2D] text-xs leading-tight font-sans">Configurações de Precificação e Markup</h4>
                  <p className="text-[11px] text-[#2D6A4F] font-bold mt-0.5 font-sans">Para ajustar margens de lucro, comissões, impostos e metas operacionais do Markup, acesse as Configurações.</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="shrink-0 text-xs font-black uppercase tracking-wider text-white bg-[#1B3A2D] hover:bg-[#2D6A4F] px-4 py-2 rounded-xl transition-all h-9 flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                <span>Ajustar Configurações</span>
                <ChevronRight className="size-3.5" />
              </button>
            </div>
            
            {/* SECTION 1: ALERTAS CONTEXTUAIS */}
            {alertsList.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 w-full" id="secao-alertas">
                {alertsList.map((alert) => {
                  const isCrit = alert.level === 'critical';
                  return (
                    <div 
                      key={alert.id}
                      className={`border rounded-2xl p-4 flex gap-3 text-left transition-all ${
                        isCrit 
                          ? 'bg-rose-50/70 border-rose-200/70 text-rose-800' 
                          : 'bg-amber-50/70 border-amber-200/70 text-amber-800'
                      }`}
                    >
                      <div className={`p-2 rounded-xl shrink-0 ${isCrit ? 'bg-rose-200/60' : 'bg-amber-200/60'}`}>
                        <ShieldAlert className="size-4 shrink-0" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-black uppercase tracking-widest block opacity-75">
                          {isCrit ? 'ALERTA CRÍTICO' : 'ATENÇÃO'}
                        </span>
                        <h4 className="font-bold text-xs">{alert.title}</h4>
                        <p className="text-[10.5px] leading-relaxed font-medium opacity-90">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}


            {/* SECTION 2: 6 HIGH-POLISHED INDICATOR CARDS */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" id="secao-indicadores">
              
              {/* Card 1: Receita do Mês */}
              <Card className="bg-white border border-slate-200 p-5 rounded-2xl text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-extrabold uppercase text-slate-500 tracking-wider">Receitas do Mês</span>
                  <h4 className="text-xl font-black text-slate-900 font-mono">
                    R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 mt-3 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg border border-emerald-100">
                  <ArrowUpRight className="size-3.5" />
                  <span>12,40% vs. anterior</span>
                </div>
              </Card>

              {/* Card 2: Despesas do Mês */}
              <Card className="bg-white border border-slate-200 p-5 rounded-2xl text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-extrabold uppercase text-slate-500 tracking-wider">Despesas do Mês</span>
                  <h4 className="text-xl font-black text-slate-900 font-mono">
                    R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg border border-emerald-100">
                  <ArrowDownRight className="size-3.5" />
                  <span>3,20% vs. anterior</span>
                </div>
              </Card>

              {/* Card 3: Lucro Operacional */}
              <Card className="bg-white border border-slate-200 p-5 rounded-2xl text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-extrabold uppercase text-slate-500 tracking-wider">Lucro Operacional</span>
                  <h4 className={`text-xl font-black font-mono ${netProfit >= 0 ? 'text-[#1B3A2D]' : 'text-rose-700'}`}>
                    R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg border border-emerald-100">
                  <ArrowUpRight className="size-3.5" />
                  <span>8,10% vs. anterior</span>
                </div>
              </Card>

              {/* Card 4: Margem Média */}
              <Card className="bg-white border border-slate-200 p-5 rounded-2xl text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-extrabold uppercase text-slate-500 tracking-wider">Margem Média</span>
                  <h4 className="text-xl font-black text-slate-900 font-mono">
                    {operationalMargin.toFixed(2)}%
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg border border-emerald-100">
                  <ArrowUpRight className="size-3.5" />
                  <span>2,50% vs. anterior</span>
                </div>
              </Card>

              {/* Card 5: Inadimplência */}
              <Card className="bg-white border border-slate-200 p-5 rounded-2xl text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-extrabold uppercase text-slate-500 tracking-wider">Inadimplência</span>
                  <h4 className="text-xl font-black text-slate-900 font-mono">
                    1,80%
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 mt-2 bg-emerald-50 w-fit px-2 py-0.5 rounded-lg border border-emerald-100">
                  <ArrowDownRight className="size-3.5" />
                  <span>25,00% vs. anterior</span>
                </div>
              </Card>

              {/* Card 6: Custo de Garantias */}
              <Card className="bg-white border border-slate-200 p-5 rounded-2xl text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-extrabold uppercase text-slate-500 tracking-wider">Custos de Garantias</span>
                  <h4 className="text-xl font-black text-slate-900 font-mono">
                    R$ {operationalGuaranteeMetrics.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h4>
                </div>
                <div className="flex items-center gap-1 text-[10.5px] font-bold text-rose-700 mt-2 bg-rose-50 w-fit px-2 py-0.5 rounded-lg border border-rose-100">
                  <ArrowUpRight className="size-3.5" />
                  <span>14,20% vs. anterior</span>
                </div>
              </Card>

            </div>


            {/* SECTION 3: RESULTADO FINANCEIRO (MAXIMUM PROMINENCE) */}
            <div id="secao-resultado-financeiro">
              <Card className="text-white rounded-3xl overflow-hidden relative shadow-md bg-gradient-to-r from-[#142A1F] to-[#1E4D35] p-8">
                {/* Decorative graphics to keep Swiss style elegant */}
                <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[#FAFAF9]/5 blend-overlay rounded-l-full hidden lg:block" />
                
                <div className="grid gap-6 md:grid-cols-12 items-center relative z-10 text-left">
                  <div className="md:col-span-8 space-y-4">
                    <span className="text-[9px] uppercase tracking-widest font-black text-[#A8CDB8] bg-white/10 px-3.5 py-1 rounded-md">
                      Demonstrativo Geral Consolidado (DRE)
                    </span>
                    <h2 className="text-3xl font-extrabold tracking-tight leading-tight">
                      Resultado Liquido de Operação
                    </h2>
                    <p className="text-[#A8CDB8] text-xs font-normal max-w-xl">
                      Exibição ponderada de fluxo de faturamento descontando insumos, operacionais diretas e parcelamentos fiscais calculados em tempo real.
                    </p>
                    
                    {/* Visual trend gauge */}
                    <div className="flex items-center gap-2 text-xs font-bold pt-1.5 text-emerald-300">
                      <TrendingUp className="size-4 shrink-0" />
                      <span>Tendência Econômica Altamente Sustentável (↑ 8.3% neste ciclo)</span>
                    </div>
                  </div>

                  {/* Profit value display with maximum prominence size */}
                  <div className="md:col-span-4 bg-black/15 border border-white/10 rounded-2xl p-6 flex flex-col justify-between">
                    <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-[#A8CDB8] block">Resultado Líquido Final</span>
                    <div className="mt-2 space-y-1">
                      <span className="text-4xl font-extrabold font-mono tracking-tight text-white">
                        R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      <div className="flex justify-between items-center text-[11px] text-[#A8CDB8] pt-2 border-t border-white/10">
                        <span>Faturamento Bruto:</span>
                        <span className="font-mono text-white">R$ {totalRevenue.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-[#A8CDB8] pt-1">
                        <span>Despesas Totais:</span>
                        <span className="font-mono text-white">- R$ {totalExpense.toLocaleString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>


            {/* SECTION 4: FLUXO DE CAIXA MAIN CHART */}
            <div id="secao-fluxo-caixa">
              <Card className="bg-white border border-slate-200 rounded-3xl p-6 text-left shadow-xs">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b border-slate-100 pb-5 gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-800">Fluxo de Caixa Operacional com Projeção Sazonal</h3>
                    <p className="text-xs text-slate-500">Monitoramento consolidado de entradas e saídas semanais com projeção futura simulada.</p>
                  </div>

                  {/* Switchable timeline periods */}
                  <div className="flex bg-[#F0EDE8]/80 p-1 rounded-xl gap-0.5 border border-slate-200">
                    {[
                      { id: '7d', label: '7 Dias' },
                      { id: '30d', label: '30 Dias' },
                      { id: '90d', label: '90 Dias' },
                      { id: '12m', label: '12 Meses' }
                    ].map(per => (
                      <button 
                        key={per.id}
                        type="button"
                        onClick={() => setChartPeriod(per.id as any)}
                        className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          chartPeriod === per.id ? 'bg-[#1B3A2D] text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {per.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Graph Canvas */}
                <div className="h-[320px] w-full mt-6" id="compo-chart-holder">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" />
                      <XAxis dataKey="label" stroke="#6B6B5F" style={{ fontSize: '10px', fontWeight: 'bold' }} />
                      <YAxis stroke="#6B6B5F" style={{ fontSize: '10px' }} />
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 'bold', paddingTop: '15px' }} />
                      <Area type="monotone" dataKey="Saldo" name="Saldo Efetivo" fill="#1B3A2D" fillOpacity={0.06} stroke="#1B3A2D" strokeWidth={2} />
                      <Bar dataKey="Entrada" name="Receitas" fill="#2D6A4F" radius={[4, 4, 0, 0]} barSize={28} />
                      <Bar dataKey="Saida" name="Despesas" fill="#C1361A" radius={[4, 4, 0, 0]} barSize={28} />
                      <Line type="monotone" dataKey="Projecao" name="Tendência Futura (Projeção)" stroke="#D4A017" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 4 }} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>


            {/* SECTION 5: RECEITAS E DESPESAS (SPLIT LEVEL SIDE-BY-SIDE TABLES) */}
            <div className="grid gap-6 lg:grid-cols-12" id="secao-receitas-despesas">
              
              {/* Left Column Controls and Receitas Table (7 columns block) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  
                  {/* Table title */}
                  <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                        <TrendingUp className="size-4.5 text-emerald-700" />
                        Livro de Receitas Consolidadas
                      </h3>
                      <p className="text-xs text-slate-500">Duplicatas líquidas e faturamento por OS e faturamentos correntes.</p>
                    </div>
                  </div>

                  {/* Reactive filters */}
                  <div className="grid gap-2.5 sm:grid-cols-3 text-xs">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Buscar receita..." 
                        value={txSearch}
                        onChange={(e) => setTxSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl bg-slate-50/50 focus-visible:outline-none focus-visible:border-slate-800 focus-visible:bg-white text-xs"
                      />
                    </div>
                    
                    <select
                      value={txQuickPeriod}
                      onChange={(e) => setTxQuickPeriod(e.target.value as any)}
                      className="border border-slate-200 rounded-xl bg-slate-50/50 py-2 px-3 text-xs w-full"
                    >
                      <option value="todos">Todo o Histórico</option>
                      <option value="hoje">Hoje</option>
                      <option value="mes">Este Mês (Maio/26)</option>
                      <option value="ano">Este Ano (2026)</option>
                    </select>

                    <select
                      value={txFilterCostCenter}
                      onChange={(e) => setTxFilterCostCenter(e.target.value)}
                      className="border border-slate-200 rounded-xl bg-slate-50/50 py-2 px-3 text-xs w-full"
                    >
                      <option value="todos">Todos Centros de Custo</option>
                      {COST_CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  {/* Dynamic Table Box */}
                  <div className="overflow-x-auto min-h-[300px]">
                    {filteredReceitas.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center gap-3">
                        <TrendingUp className="size-8 opacity-40 text-slate-500" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#141410]">Nenhuma receita encontrada para os filtros selecionados.</p>
                          <p className="text-[10px] text-slate-400">Cadastre uma nova transação usando o painel superior.</p>
                        </div>
                      </div>
                    ) : (
                      <table className="w-full text-xs font-sans">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-200">
                            <th className="py-3 px-3">Data</th>
                            <th className="py-3 px-3">Cliente / OS</th>
                            <th className="py-3 px-3">Serviço</th>
                            <th className="py-3 px-3 text-right">Valor</th>
                            <th className="py-3 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredReceitas.map((rec) => (
                            <tr key={rec.id} className="hover:bg-slate-50/30 transition-all">
                              <td className="py-3 px-3 font-mono font-medium text-slate-500 whitespace-nowrap">
                                {rec.date.split('-').reverse().join('/')}
                              </td>
                              <td className="py-3 px-3 font-semibold text-slate-800 max-w-[140px] truncate" title={rec.description}>
                                {rec.description}
                              </td>
                              <td className="py-3 px-3">
                                <span className="bg-emerald-50 text-emerald-800 text-[9.5px] font-bold px-2 py-0.5 rounded-lg border border-emerald-100/60">
                                  {rec.subcategory}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-extrabold text-[#1B3A2D]">
                                R$ {rec.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  rec.isPaid 
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                    : 'bg-amber-100 text-amber-800 border border-amber-200'
                                }`}>
                                  {rec.isPaid ? 'CONCILIADO' : 'PENDENTE'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>
              </div>

              {/* Right Column Despesas Table (5 columns block) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  
                  {/* Table title */}
                  <div className="border-b border-slate-100 pb-4">
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <TrendingDown className="size-4.5 text-rose-600" />
                      Gastos e Despesas Gerais
                    </h3>
                    <p className="text-xs text-slate-500">Contabilização de passivos fixos e insumos diretos.</p>
                  </div>

                  {/* Expense filters */}
                  <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                    <select
                      value={txFilterCategory}
                      onChange={(e) => setTxFilterCategory(e.target.value)}
                      className="border border-slate-200 rounded-xl bg-slate-50/50 py-2 px-3 text-xs w-full"
                    >
                      <option value="todos">Todos Lançadores de Custo</option>
                      {Object.keys(GROUPS_STRUCTURE).filter(g => g !== 'RECEITAS').map(cat => (
                        <option key={cat} value={cat}>{CATEGORY_NAMES[cat as keyof typeof CATEGORY_NAMES] || cat}</option>
                      ))}
                    </select>

                    <div className="text-[10px] text-slate-500 bg-[#FAF9F5] rounded-xl px-3.5 py-1.5 flex items-center border border-slate-200 font-medium leading-normal leading-relaxed">
                      Lançamento fiscal unificado para cálculo de Markup
                    </div>
                  </div>

                  {/* Expense Table Box */}
                  <div className="overflow-x-auto min-h-[300px]">
                    {filteredDespesas.length === 0 ? (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center gap-3">
                        <TrendingDown className="size-8 opacity-40 text-rose-500" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-[#141410]">Nenhuma despesa catalogada.</p>
                          <p className="text-[10px] text-slate-400">Lance insumos ou operacionais acima.</p>
                        </div>
                      </div>
                    ) : (
                      <table className="w-full text-xs font-sans">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] uppercase font-bold tracking-wider text-slate-500 border-b border-slate-200">
                            <th className="py-3 px-3">Data</th>
                            <th className="py-3 px-3">Categoria / Descrição</th>
                            <th className="py-3 px-3">Centro</th>
                            <th className="py-3 px-3 text-right">Valor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredDespesas.map((des) => (
                            <tr key={des.id} className="hover:bg-slate-50/30 transition-all">
                              <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                                {des.date.split('-').reverse().join('/')}
                              </td>
                              <td className="py-3 px-3 space-y-0.5">
                                <p className="font-semibold text-slate-800">{des.description}</p>
                                <p className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide">
                                  {des.subcategory}
                                </p>
                              </td>
                              <td className="py-3 px-3 font-mono font-bold text-slate-500 text-[10px]">
                                {des.costCenter}
                              </td>
                              <td className="py-3 px-3 text-right font-mono font-bold text-rose-700">
                                - R$ {Math.abs(des.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>
              </div>

            </div>


            {/* SECTION 6: ANALISES ESTRATÉGICAS (COLLAPSIBLE SECTIONS) */}
            <FinancialDetailedAnalysis
              profitabilityByService={profitabilityByService}
              serviceRankings={serviceRankings}
              operationalGuaranteeMetrics={operationalGuaranteeMetrics}
              warrantyQuotes={warrantyQuotes}
              defaultDelinquentClients={defaultDelinquentClients}
              totalDelinquencyVolume={totalDelinquencyVolume}
              onOpenClientDetails={handleOpenClientDetails}
              uploadedFiles={uploadedFiles}
              onFilesChange={setUploadedFiles}
              financialInsightsMessages={financialInsightsMessages}
              onNavigateToServicos={() => setActiveTab('servicos')}
            />
        </TabsContent>

        {/* TAB DRE POR SERVIÇO EXECUTADO */}
        <TabsContent value="servicos" className="space-y-6 text-left">
            {/* Header Banner */}
            <div className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shadow-2xs">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-[#1B3A2D] text-white rounded-xl shrink-0 shadow-xs">
                  <Briefcase className="size-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-display font-black text-[#141410] text-sm uppercase tracking-wider">
                      Custo e Margem por Serviço Executado (DRE por OS)
                    </h3>
                    <span className="px-2.5 py-0.5 bg-[#1B3A2D]/10 text-[#1B3A2D] text-[10px] font-black uppercase rounded-full">
                      {serviceMetrics.count} {serviceMetrics.count === 1 ? 'OS Analisada' : 'OSs Analisadas'}
                    </span>
                  </div>
                  <p className="text-xs text-[#6B6B5F] mt-0.5">
                    Consolidação analítica de margens operacionais individuais, considerando rateio de custos fixos e custos variáveis reais de insumos/equipes.
                  </p>
                </div>
              </div>
            </div>

            {/* Metrics Cards */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {/* Card 1: Receita Total Executada */}
              <Card className="bg-white border border-slate-200 p-5 rounded-2xl text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-extrabold uppercase text-slate-500 tracking-wider">Receita Total das OSs</span>
                  <h4 className="text-xl font-black text-slate-900 font-mono">
                    {formatBRL(serviceMetrics.totalReceita)}
                  </h4>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Volume no Filtro</span>
                  <span className="font-bold text-slate-800 font-mono">{serviceMetrics.count} ordens</span>
                </div>
              </Card>

              {/* Card 2: Custo Total Consolidado */}
              <Card className="bg-white border border-slate-200 p-5 rounded-2xl text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-extrabold uppercase text-slate-500 tracking-wider">Custo Total (Rateio Fixo + Variável)</span>
                  <h4 className="text-xl font-black text-rose-700 font-mono">
                    {formatBRL(serviceMetrics.totalCusto)}
                  </h4>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Insumos + Rateio</span>
                  <span className="font-bold text-rose-700 font-mono">
                    {serviceMetrics.totalReceita > 0 ? formatPercent((serviceMetrics.totalCusto / serviceMetrics.totalReceita) * 100) : '0,00%'}
                  </span>
                </div>
              </Card>

              {/* Card 3: Margem Líquida Consolidada */}
              <Card className="bg-white border border-slate-200 p-5 rounded-2xl text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-extrabold uppercase text-slate-500 tracking-wider">Lucro Operacional Líquido</span>
                  <h4 className={`text-xl font-black font-mono ${serviceMetrics.totalMargemRs >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {formatBRL(serviceMetrics.totalMargemRs)}
                  </h4>
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Margem Média Líquida</span>
                  <span className={`font-black font-mono ${serviceMetrics.margemMediaPct >= 35 ? 'text-emerald-700' : 'text-amber-600'}`}>
                    {formatPercent(serviceMetrics.margemMediaPct)}
                  </span>
                </div>
              </Card>

              {/* Card 4: Menor Margem / Ponto de Atenção */}
              <Card className="bg-white border border-slate-200 p-5 rounded-2xl text-left flex flex-col justify-between shadow-xs">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-extrabold uppercase text-slate-500 tracking-wider">Ponto de Menor Margem</span>
                  {serviceMetrics.lowestMargin ? (
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 truncate">
                        {serviceMetrics.lowestMargin.clientName}
                      </h4>
                      <p className="text-xs text-rose-600 font-black font-mono mt-0.5">
                        Margem: {formatPercent(serviceMetrics.lowestMargin.margemPct)} ({formatBRL(serviceMetrics.lowestMargin.margemRs)})
                      </p>
                    </div>
                  ) : (
                    <h4 className="text-sm font-medium text-slate-400">Sem registros</h4>
                  )}
                </div>
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>Diagnóstico OS</span>
                  <span className="font-bold text-slate-700">Identificação Ativa</span>
                </div>
              </Card>
            </div>

            {/* Filter and Control Bar */}
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-4 space-y-3 shadow-xs">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                {/* Search Bar */}
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6B5F]" />
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Buscar por cliente, serviço, praga ou técnico..."
                    className="w-full pl-10 pr-4 py-2 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#1B3A2D]"
                  />
                  {serviceSearch && (
                    <button
                      onClick={() => setServiceSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B6B5F] hover:text-[#141410]"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Period Filter */}
                  <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-1.5">
                    <Calendar className="size-3.5 text-[#1B3A2D]" />
                    <span className="text-[10px] font-black uppercase text-[#6B6B5F]">Período:</span>
                    <select
                      value={servicePeriod}
                      onChange={(e) => setServicePeriod(e.target.value as any)}
                      className="bg-transparent text-xs font-bold text-[#141410] focus:outline-none cursor-pointer"
                    >
                      <option value="todos">Todos os Períodos</option>
                      <option value="mes_atual">Mês Atual</option>
                      <option value="30_dias">Últimos 30 Dias</option>
                      <option value="90_dias">Últimos 90 Dias</option>
                    </select>
                  </div>

                  {/* Margin Sorting Control */}
                  <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E8E6E1] rounded-xl px-3 py-1.5">
                    <Filter className="size-3.5 text-[#1B3A2D]" />
                    <span className="text-[10px] font-black uppercase text-[#6B6B5F]">Ordenar Por:</span>
                    <select
                      value={serviceSort}
                      onChange={(e) => setServiceSort(e.target.value as any)}
                      className="bg-transparent text-xs font-bold text-[#141410] focus:outline-none cursor-pointer"
                    >
                      <option value="margem_asc">⚠️ Menor Margem (%) Primeiro</option>
                      <option value="margem_desc">❇️ Maior Margem (%) Primeiro</option>
                      <option value="margem_rs_asc">Margem em R$ (Menor → Maior)</option>
                      <option value="margem_rs_desc">Margem em R$ (Maior → Menor)</option>
                      <option value="receita_desc">Maior Receita (R$)</option>
                      <option value="custo_desc">Maior Custo Total (R$)</option>
                      <option value="data_desc">Data de Execução (Mais Recente)</option>
                      <option value="data_asc">Data de Execução (Mais Antigo)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Services Table */}
            <div className="bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAF9F6] border-b border-[#E8E6E1] text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">
                      <th className="py-3 px-4">Cliente / Endereço</th>
                      <th className="py-3 px-4">Serviço / Alvo</th>
                      <th className="py-3 px-4 text-center">Data Execução</th>
                      <th className="py-3 px-4 text-right">Receita (R$)</th>
                      <th className="py-3 px-4 text-right">Custo Total (R$)</th>
                      <th className="py-3 px-4 text-right">Margem (R$)</th>
                      <th className="py-3 px-4 text-center">Margem (%)</th>
                      <th className="py-3 px-4 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E8E6E1]">
                    {executedServicesWithDRE.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-12 text-center text-slate-500">
                          <AlertTriangle className="size-8 mx-auto text-amber-500/70 mb-2" />
                          <p className="font-bold text-xs text-slate-700">Nenhum serviço executado localizado com os filtros selecionados.</p>
                          <p className="text-[11px] text-slate-400 mt-1">Tente selecionar "Todos os Períodos" ou limpar a busca por nome.</p>
                        </td>
                      </tr>
                    ) : (
                      executedServicesWithDRE.map((item) => {
                        const isLowMargin = item.margemPct < 25;
                        
                        return (
                          <tr key={item.quote.id} className="hover:bg-[#FAF9F6]/80 transition-colors">
                            {/* Cliente */}
                            <td className="py-3.5 px-4">
                              <div className="font-bold text-[#141410]">{item.clientName}</div>
                              {item.clientAddress && (
                                <div className="text-[10px] text-[#6B6B5F] truncate max-w-[200px]">{item.clientAddress}</div>
                              )}
                            </td>

                            {/* Serviço / Alvo */}
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-slate-800">{item.serviceType}</div>
                              {item.pestType && (
                                <span className="inline-block mt-0.5 px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-bold uppercase rounded">
                                  {item.pestType}
                                </span>
                              )}
                            </td>

                            {/* Data Execução */}
                            <td className="py-3.5 px-4 text-center font-mono text-[11px] text-slate-600">
                              {formatDate(item.dateStr)}
                            </td>

                            {/* Receita (R$) */}
                            <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900">
                              {formatBRL(item.receita)}
                            </td>

                            {/* Custo Total (R$) */}
                            <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                              <div className="font-bold text-rose-700">{formatBRL(item.custoTotal)}</div>
                              <div className="text-[9px] text-slate-400">
                                Var: {formatBRL(item.custoVariavel)} | Fix: {formatBRL(item.custoFixo)}
                              </div>
                              {item.transportSavings !== undefined && item.transportSavings > 0 && (
                                <div className="mt-1">
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[9px] font-black rounded border border-emerald-300" title="Economia por rota agrupada na mesma cidade">
                                    ⚡ Frete Diluído: +{formatBRL(item.transportSavings)}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Margem (R$) */}
                            <td className={`py-3.5 px-4 text-right font-mono font-bold ${item.margemRs >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                              {formatBRL(item.margemRs)}
                            </td>

                            {/* Margem (%) */}
                            <td className="py-3.5 px-4 text-center">
                              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black font-mono ${
                                item.margemPct >= 40 
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                  : item.margemPct >= 20 
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                                  : 'bg-rose-100 text-rose-800 border border-rose-200'
                              }`}>
                                {isLowMargin && <AlertTriangle className="size-3 text-rose-600 shrink-0" />}
                                {formatPercent(item.margemPct)}
                              </span>
                            </td>

                            {/* Ações */}
                            <td className="py-3.5 px-4 text-center">
                              <button
                                onClick={() => setSelectedQuoteForDREModal(item.quote)}
                                className="px-3 py-1.5 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center gap-1 mx-auto"
                              >
                                <Eye className="size-3" /> Ver DRE
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
        </TabsContent>

        {/* TAB LANÇAMENTOS */}
        <TabsContent value="lancamentos" className="space-y-4">
          <PlanoContasTab />
        </TabsContent>

        {/* TAB CAIXA (PROJEÇÃO DE CAIXA) */}
        <TabsContent value="caixa" className="space-y-6">
            {/* Header / Config Row */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-xs gap-4">
              <div className="text-left">
                <h2 className="font-extrabold text-slate-800 text-base flex items-center gap-2">
                  <Clock className="size-5 text-[#1B3A2D]" />
                  Painel de Projeção & Gestão de Fluxo de Caixa
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed mt-1">
                  Visão preditiva do caixa consolidando saldo reconciliado, cobranças previstas de duplicatas, receitas recorrentes de contratos ativos e saídas de custos operacionais fixos.
                </p>
              </div>

              {/* Horizon Selectors */}
              <div className="flex bg-[#F0EDE8]/60 p-1 rounded-xl border border-slate-200 self-stretch sm:self-auto shrink-0">
                {([30, 60, 90] as const).map((h) => (
                  <button
                    key={h}
                    onClick={() => setCaixaHorizon(h)}
                    className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                      caixaHorizon === h 
                        ? 'bg-[#1B3A2D] text-white shadow-xs' 
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Horizonte {h}D
                  </button>
                ))}
              </div>
            </div>

            {/* Three Summary Cards Side-By-Side: 30D / 60D / 90D */}
            <div className="grid gap-4 md:grid-cols-3">
              
              {/* Card 30D */}
              <Card className={`p-6 rounded-2xl border text-left flex flex-col justify-between shadow-xs transition-colors ${caixaHorizon === 30 ? 'bg-[#FAFAF9] border-emerald-600/30 ring-2 ring-emerald-600/5' : 'bg-white border-slate-200'}`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B5F] font-sans">Saldo Projetado 30 dias</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono shrink-0 ${
                      projecao30.riscoCaixa 
                        ? 'bg-rose-150 text-rose-800 border border-rose-200' 
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    }`}>
                      {projecao30.riscoCaixa ? '⚠️ RISCO' : 'SADIO'}
                    </span>
                  </div>
                  <h4 className={`text-2xl font-black font-mono tracking-tight ${projecao30.saldoFinal >= 0 ? 'text-[#1B3A2D]' : 'text-rose-700'}`}>
                    R$ {projecao30.saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h4>
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-[#6B6B5F] font-bold font-sans leading-none">
                    <div className="flex justify-between">
                      <span>Saldo Reconciliado Inicial:</span>
                      <span className="font-mono text-slate-700">R$ {projecao30.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Entradas Previstas (+):</span>
                      <span className="font-mono text-emerald-700 font-bold">+ R$ {projecao30.entradasPrevistas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-700">Saídas Previstas (-):</span>
                      <span className="font-mono text-rose-700 font-bold">- R$ {projecao30.saidasPrevistas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 60D */}
              <Card className={`p-6 rounded-2xl border text-left flex flex-col justify-between shadow-xs transition-colors ${caixaHorizon === 60 ? 'bg-[#FAFAF9] border-emerald-600/30 ring-2 ring-emerald-600/5' : 'bg-white border-slate-200'}`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B5F] font-sans">Saldo Projetado 60 dias</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono shrink-0 ${
                      projecao60.riscoCaixa 
                        ? 'bg-rose-150 text-rose-800 border border-rose-200' 
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    }`}>
                      {projecao60.riscoCaixa ? '⚠️ RISCO' : 'SADIO'}
                    </span>
                  </div>
                  <h4 className={`text-2xl font-black font-mono tracking-tight ${projecao60.saldoFinal >= 0 ? 'text-[#1B3A2D]' : 'text-rose-700'}`}>
                    R$ {projecao60.saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h4>
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-[#6B6B5F] font-bold font-sans leading-none">
                    <div className="flex justify-between">
                      <span>Saldo Reconciliado Inicial:</span>
                      <span className="font-mono text-slate-700">R$ {projecao60.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Entradas Previstas (+):</span>
                      <span className="font-mono text-emerald-700 font-bold">+ R$ {projecao60.entradasPrevistas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-700">Saídas Previstas (-):</span>
                      <span className="font-mono text-rose-700 font-bold">- R$ {projecao60.saidasPrevistas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 90D */}
              <Card className={`p-6 rounded-2xl border text-left flex flex-col justify-between shadow-xs transition-colors ${caixaHorizon === 90 ? 'bg-[#FAFAF9] border-emerald-600/30 ring-2 ring-emerald-600/5' : 'bg-white border-slate-200'}`}>
                <div className="space-y-3">
                  <div className="flex justify-between items-center transition-all">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#6B6B5F] font-sans">Saldo Projetado 90 dias</span>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase font-mono shrink-0 ${
                      projecao90.riscoCaixa 
                        ? 'bg-rose-150 text-rose-800 border border-rose-200' 
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-100'
                    }`}>
                      {projecao90.riscoCaixa ? '⚠️ RISCO' : 'SADIO'}
                    </span>
                  </div>
                  <h4 className={`text-2xl font-black font-mono tracking-tight ${projecao90.saldoFinal >= 0 ? 'text-[#1B3A2D]' : 'text-rose-700'}`}>
                    R$ {projecao90.saldoFinal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </h4>
                  <div className="space-y-1.5 pt-2 border-t border-slate-100 text-[11px] text-[#6B6B5F] font-bold font-sans leading-none">
                    <div className="flex justify-between">
                      <span>Saldo Reconciliado Inicial:</span>
                      <span className="font-mono text-slate-700">R$ {projecao90.saldoAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-emerald-700">Entradas Previstas (+):</span>
                      <span className="font-mono text-emerald-700 font-bold">+ R$ {projecao90.entradasPrevistas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-rose-700">Saídas Previstas (-):</span>
                      <span className="font-mono text-rose-700 font-bold">- R$ {projecao90.saidasPrevistas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>
                </div>
              </Card>

            </div>

            {/* Destaque em vermelho se algum período projeta saldo negativo */}
            {activeProjecao.riscoCaixa && (
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-left flex gap-3.5 items-start animate-in fade-in slide-in-from-top-1">
                <div className="p-2 bg-rose-100 text-rose-800 rounded-xl">
                  <ShieldAlert className="size-5 shrink-0" />
                </div>
                <div className="space-y-1 pr-4">
                  <h3 className="font-black text-rose-950 text-xs uppercase tracking-wider">⚠️ Alerta Crítico: Estresse de Liquidez Projetado</h3>
                  <p className="text-xs text-rose-800 font-medium leading-relaxed mt-0.5">
                    Identificamos risco de liquidez no horizonte de {caixaHorizon} dias, com estimativa de saldo negativo em algum momento da projeção.
                    Recomenda-se antecipar faturamentos ou regularizar duplicatas em atraso para assegurar capital de giro suficiente.
                  </p>
                </div>
              </div>
            )}

            {/* Visual Timeline and Table Section Grid */}
            <div className="grid gap-6 lg:grid-cols-12 items-start text-left">
              
              {/* Timeline Chart Column */}
              <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Evolução Mensal do Fluxo de Caixa (Horizonte {caixaHorizon} Dias)</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Linha do tempo consolidada mostrando entradas previstas, saídas recorrentes e saldo final acumulado em cada mês.
                  </p>
                </div>

                <div className="h-[280px] w-full" id="cashflow-timeline-holder">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={activeProjecao.timeline} margin={{ top: 15, right: 15, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" />
                      <XAxis 
                        dataKey="mes" 
                        stroke="#6B6B5F" 
                        style={{ fontSize: '10px', fontWeight: 'bold', fontFamily: 'monospace' }} 
                        tickFormatter={(val) => {
                          const parts = val.split('-');
                          const year = parts[0];
                          const month = parts[1];
                          const monthsMap: Record<string, string> = {
                            '01': 'Jan', '02': 'Fev', '03': 'Mar', '04': 'Abr',
                            '05': 'Mai', '06': 'Jun', '07': 'Jul', '08': 'Ago',
                            '09': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez'
                          };
                          return `${monthsMap[month]} ${year}`;
                        }}
                      />
                      <YAxis 
                        stroke="#6B6B5F" 
                        style={{ fontSize: '10px' }} 
                        tickFormatter={(val) => `R$ ${val >= 1000 ? (val/1000).toFixed(0) + 'k' : (val <= -1000 ? (val/1000).toFixed(0) + 'k' : val)}`} 
                      />
                      <Tooltip 
                        formatter={(value, name) => {
                          const formattedVal = `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
                          const labelMap: Record<string | number, string> = {
                            'entradas': 'Entradas Previstas',
                            'saidas': 'Saídas Previstas',
                            'saldo': 'Saldo Acumulado'
                          };
                          return [formattedVal, labelMap[name] || name];
                        }}
                        contentStyle={{ borderRadius: '12px', borderColor: '#E2E8F0', padding: '10px' }}
                      />
                      <Legend 
                        verticalAlign="top" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10.5px', fontWeight: '600' }}
                        formatter={(value) => {
                          const labelMap: Record<string, string> = {
                            'entradas': 'Entradas (+)',
                            'saidas': 'Saídas (-)',
                            'saldo': 'Saldo Projetado'
                          };
                          return labelMap[value] || value;
                        }}
                      />
                      {/* Areas for visual cashflow balance */}
                      <Area 
                        type="monotone" 
                        dataKey="saldo" 
                        fill="rgba(27, 58, 45, 0.08)" 
                        stroke="#1B3A2D" 
                        strokeWidth={2.5} 
                      />
                      <Bar dataKey="entradas" fill="#2D6A4F" radius={[4, 4, 0, 0]} maxBarSize={30} />
                      <Bar dataKey="saidas" fill="#C1361A" radius={[4, 4, 0, 0]} maxBarSize={30} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Closest major cash due list (5 maiores vencimentos seguintes) */}
              <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest">Maiores Vencimentos Próximos</h3>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-relaxed">
                    Lista dos 5 maiores compromissos ou faturamentos que ainda não foram liquidados no sistema.
                  </p>
                </div>

                <div className="space-y-3">
                  {maioresVencimentosProximos.length === 0 ? (
                    <div className="text-center py-8 text-[#9CA3AF] text-xs font-medium space-y-1 bg-slate-50 border border-dashed border-slate-200 p-4 rounded-2xl">
                      <p>✨ Nenhuma conta futura pendente encontrada.</p>
                      <p className="text-[10px] opacity-75">Todas as receitas e despesas lançadas estão quitadas!</p>
                    </div>
                  ) : (
                    maioresVencimentosProximos.map((m) => {
                      const isReceita = m.value > 0;
                      return (
                        <div 
                          key={m.id} 
                          className={`flex items-center justify-between p-3.5 border rounded-2xl shadow-xxs font-sans transition-all hover:bg-slate-50/50 ${
                            isReceita ? 'border-emerald-100 bg-emerald-50/10' : 'border-rose-100 bg-rose-50/10'
                          }`}
                        >
                          <div className="space-y-0.5 text-left max-w-[60%]">
                            <span className={`text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                              isReceita ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                            }`}>
                              {isReceita ? 'Recebimento' : 'Pagamento'}
                            </span>
                            <h4 className="font-bold text-slate-800 truncate text-[11.5px] mt-1" title={m.description}>
                              {m.description}
                            </h4>
                            <p className="text-[10px] text-slate-500 font-medium flex items-center gap-1 font-mono">
                              <Calendar className="size-3" /> Vence em: {m.dueDate ? m.dueDate.split('-').reverse().join('/') : '⚠️ NÃO INFORMADO'}
                            </p>
                          </div>
                          
                          <div className="text-right">
                            <span className={`text-xs font-black font-mono block ${
                              isReceita ? 'text-emerald-700' : 'text-rose-700'
                            }`}>
                              {isReceita ? '+' : ''} R$ {Math.abs(m.value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                            <span className="text-[9px] text-slate-400 font-medium block mt-0.5 font-sans">
                              {m.subcategory || m.category}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>
        </TabsContent>

        {/* TAB PLANILHA */}
        <TabsContent value="planilha" className="space-y-4">
          <SpreadsheetImportTab />
        </TabsContent>
      </Tabs>

      {/* ----------------------------------------------------
          MODALS / DIALOGS (4-LAYER PATTERN)
          ---------------------------------------------------- */}
      <NewTransactionDialog
        open={isNewTxOpen}
        onOpenChange={setIsNewTxOpen}
        defaultType={newTxType}
      />

      <ServiceDREDetailDialog
        quote={selectedQuoteForDREModal}
        open={Boolean(selectedQuoteForDREModal)}
        onOpenChange={(open) => {
          if (!open) setSelectedQuoteForDREModal(null);
        }}
      />

      <ClientBillingDetailDialog
        client={selectedClientDetail}
        open={Boolean(selectedClientDetail)}
        onOpenChange={(open) => {
          if (!open) setSelectedClientDetail(null);
        }}
      />
    </div>
  );
}
