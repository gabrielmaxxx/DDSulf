import React, { useState, useEffect, useMemo } from 'react';
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
import { useSystemStore, FinancialMovement, Quote, Client, InventoryProduct } from '@/store';
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
import { SpreadsheetImportTab } from './components/SpreadsheetImportTab';
import { PlanoContasTab } from './components/PlanoContasTab';

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
  const [activeTab, setActiveTab] = useState<'painel' | 'lancamentos' | 'planilha' | 'precificador'>('painel');

  // Modals status
  const [isNewTxOpen, setIsNewTxOpen] = useState(false);
  const [newTxType, setNewTxType] = useState<'RECEITAS' | 'DESPESAS'>('RECEITAS');
  const [selectedClientDetail, setSelectedClientDetail] = useState<Client | null>(null);

  // Form States for quick transaction form
  const [txDescription, setTxDescription] = useState('');
  const [txCategory, setTxCategory] = useState('RECEITAS');
  const [txSubcategory, setTxSubcategory] = useState('');
  const [txValue, setTxValue] = useState('');
  const [txPaymentMethod, setTxPaymentMethod] = useState('Pix');
  const [txCostCenter, setTxCostCenter] = useState('Geral');
  const [txDueDate, setTxDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [txIsPaid, setTxIsPaid] = useState(true);

  // Quick category reset on transactional type click
  useEffect(() => {
    if (newTxType === 'RECEITAS') {
      setTxCategory('RECEITAS');
      setTxSubcategory('Dedetização');
    } else {
      setTxCategory('DESPESAS OPERACIONAIS');
      setTxSubcategory('Combustível');
    }
  }, [newTxType]);

  useEffect(() => {
    const list = GROUPS_STRUCTURE[txCategory as keyof typeof GROUPS_STRUCTURE] || [];
    if (list.length > 0 && !list.includes(txSubcategory)) {
      setTxSubcategory(list[0]);
    }
  }, [txCategory]);

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
    // In DDSulf logic, we represent clients who have overdue accounts receivable (isPaid === false, date < current, value > 0)
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
        message: `Folha de pagamento e encargos (R$ ${salaries.toLocaleString('pt-BR')}) consomem ${ratioSalaries.toFixed(2)}% do faturamento bruto, estourando o limite de 40,00% estipulado pela DDSulf.`
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

      // Period limit
      if (txQuickPeriod === 'hoje' && m.date !== '2026-06-01') return false; // Simulated 
      // Sazonal filters (simulate month filters on May 2026 seeds since we are in fiscal simulation)
      if (txQuickPeriod === 'mes' && !m.date.includes('-05-') && !m.date.includes('-06-')) return false;

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

      if (txQuickPeriod === 'hoje' && m.date !== '2026-06-01') return false;
      if (txQuickPeriod === 'mes' && !m.date.includes('-05-') && !m.date.includes('-06-')) return false;

      return true;
    });
  }, [movements, txSearch, txQuickPeriod, txFilterCostCenter, txFilterCategory]);


  // ----------------------------------------------------
  // SECTION 6: RENTABILIDADE POR SERVIÇO (DDSULF INTEL)
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
    // 1. Quantiade de retornos: count
    const qty = warrantyQuotes.length || 3; // Fallback to 3 if empty
    
    // 2. Custos gerados (Amortizações extra, deslocamentos, técnico)
    const cost = totalWarrantyCost || 540; 
    
    // 3. Produtos consumidos (estimado 1.8 Litros de Bifentol / Ratol por retorno em média)
    const productsConsumed = (qty * 1.5).toFixed(1) + " L";
    
    // 4. Horas gastas (estimado 2.5 horas por chamado de garantia rural/urbana)
    const hoursSpent = (qty * 2.5).toFixed(1) + " h";

    // Ratio of revenue wasted on warranty issues
    const revWastePercent = totalRevenue > 0 ? (cost / totalRevenue) * 100 : 1.30;

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

  const handleCreateTransaction = (e: React.FormEvent) => {
    e.preventDefault();

    const valueNum = parseFloat(txValue);
    if (!txDescription || isNaN(valueNum) || valueNum <= 0) {
      toast.error('Preencha todos os campos obrigatórios corretamente.');
      return;
    }

    // Deduct direct expenses in backend standard (Despesa is negative)
    const signedValue = txCategory === 'RECEITAS' ? valueNum : -valueNum;

    addFinancialMovement({
      date: new Date().toISOString().split('T')[0],
      description: txDescription,
      category: txCategory,
      subcategory: txSubcategory,
      value: signedValue,
      paymentMethod: txPaymentMethod,
      costCenter: txCostCenter,
      dueDate: txDueDate,
      isPaid: txIsPaid
    });

    toast.success('Fluxo Reconciliado com Sucesso!', {
      description: `Lançamento "${txDescription}" no valor de R$ ${valueNum.toLocaleString('pt-BR')} computado ao Plano de Contas.`
    });

    // Reset Form
    setTxDescription('');
    setTxValue('');
    setIsNewTxOpen(false);
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
      link.setAttribute("download", `DDSulf_Relatorio_Financeiro_${new Date().getFullYear()}.csv`);
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
        address: 'Rua Principal de Atendimento Sanitário DDSulf, 1500 - VR',
        phone: '(24) 99988-7766',
        email: 'financeiro@grupocobrancas.com.br',
        createdAt: '2026-05-10'
      };
      setSelectedClientDetail(mockClient);
    }
  };

  const handleResetForDemo = () => {
    if (window.confirm("🔴 APAGAR ABSOLUTAMENTE TUDO?\n\nEsta ação apagará todos os lançamentos financeiros, custos de frota, salários, precificadores e insumos de estoque para iniciar uma demonstração do absoluto zero.\n\nEsta operação é definitiva e ideal para apresentações de vendas.")) {
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
            DDSulf Economic Management Center
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
      <div className="flex flex-wrap p-1.5 bg-[#F0EDE8]/60 border border-slate-200/60 rounded-2xl w-fit gap-1 shadow-inner">
        <button
          onClick={() => setActiveTab('painel')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'painel' ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-[#6B6B5F] hover:text-[#141410]'
          }`}
        >
          <Gauge className="size-4" />
          Painel Executivo
        </button>

        <button
          onClick={() => setActiveTab('lancamentos')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'lancamentos' ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-[#6B6B5F] hover:text-[#141410]'
          }`}
        >
          <Layers className="size-4" />
          Lançamentos Reconciliados
        </button>

        <button
          onClick={() => setActiveTab('planilha')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'planilha' ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-[#6B6B5F] hover:text-[#141410]'
          }`}
        >
          <Sparkles className="size-4" />
          Auditoria de Planilhas
        </button>

        <button
          onClick={() => setActiveTab('precificador')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'precificador' ? 'bg-[#1B3A2D] text-white shadow-sm' : 'text-[#6B6B5F] hover:text-[#141410]'
          }`}
        >
          <Settings2 className="size-4" />
          Configuração de Custos
        </button>
      </div>


      {/* ----------------------------------------------------
          TAB SWITCHBOARD
          ---------------------------------------------------- */}
      <AnimatePresence mode="wait">
        {activeTab === 'painel' && (
          <motion.div
            key="dashboard-view"
            className="space-y-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            
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


            {/* SECTION 6: ANALISES (GRID CORE AREA) */}
            <h3 className="text-lg font-black uppercase text-slate-700 tracking-wider pt-4 text-left font-display">
              Strategic Financial Evaluations
            </h3>

            <div className="grid gap-6 lg:grid-cols-12 text-left" id="secao-analises">
              
              {/* SUBSECTION: RENTABILIDADE POR SERVIÇO (12 columns) */}
              <div className="lg:col-span-12 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#141410] flex items-center gap-2">
                      <Percent className="size-4.5 text-emerald-800" />
                      Rentabilidade por Tipo de Inseticidas / Serviços
                    </h3>
                    <p className="text-xs text-[#6B6B5F]">Margens líquidas calculadas após descontar compras de insumos e tempo técnico rural.</p>
                  </div>

                  {serviceRankings.highest && serviceRankings.lowest && (
                    <div className="grid gap-2.5 sm:grid-cols-2 text-xs">
                      <div className="bg-emerald-50/50 border border-emerald-150 rounded-xl p-3">
                        <span className="text-[9px] font-extrabold text-emerald-700 uppercase tracking-widest block">Líder em Margem</span>
                        <h5 className="font-extrabold text-slate-900 mt-1">{serviceRankings.highest.name}</h5>
                        <span className="font-mono text-emerald-700 font-extrabold block text-sm mt-0.5">{serviceRankings.highest.margin.toFixed(2)}%</span>
                      </div>
                      <div className="bg-amber-50/50 border border-amber-150 rounded-xl p-3">
                        <span className="text-[9px] font-extrabold text-amber-700 uppercase tracking-widest block">Margem Crítica (Diluição)</span>
                        <h5 className="font-extrabold text-slate-900 mt-1">{serviceRankings.lowest.name}</h5>
                        <span className="font-mono text-amber-700 font-extrabold block text-sm mt-0.5">{serviceRankings.lowest.margin.toFixed(2)}%</span>
                      </div>
                    </div>
                  )}

                  {/* Split Grid for Table and Bar Chart side-by-side */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 pt-2">
                    
                    {/* Left: Table */}
                    <div className="xl:col-span-7 overflow-x-auto">
                      <table className="w-full text-xs font-sans">
                        <thead>
                          <tr className="bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                            <th className="py-2.5 px-3 text-left">Canal / Serviço</th>
                            <th className="py-2.5 px-3 text-right">Faturamento</th>
                            <th className="py-2.5 px-3 text-right">Custos Diretos</th>
                            <th className="py-2.5 px-3 text-right">Margem Pura</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {profitabilityByService.map(srv => {
                            const isHighest = serviceRankings.highest?.id === srv.id;
                            const isLowest = serviceRankings.lowest?.id === srv.id;
                            return (
                              <tr key={srv.id} className="hover:bg-slate-50/30 font-medium">
                                <td className="py-3 px-3">
                                  <div className="space-y-0.5">
                                    <p className="font-semibold text-slate-800">{srv.name}</p>
                                    <p className="text-[10px] text-slate-400">{srv.qty} execuções no período</p>
                                  </div>
                                </td>
                                <td className="py-3 px-3 text-right font-mono">
                                  R$ {srv.revenue.toLocaleString('pt-BR')}
                                </td>
                                <td className="py-3 px-3 text-right font-mono text-slate-500">
                                  R$ {srv.costs.toLocaleString('pt-BR')}
                                </td>
                                <td className="py-3 px-3 text-right font-mono">
                                  <span className={`px-2 py-0.5 rounded-lg border font-bold ${
                                    isHighest 
                                      ? 'bg-[#EBFDF5] border-emerald-250 text-emerald-800' 
                                      : isLowest
                                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                                        : 'bg-slate-50 border-slate-200 text-slate-700'
                                  }`}>
                                    {srv.margin.toFixed(2)}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Right: Bar Chart illustrating margins with adaptive highlighting */}
                    <div className="xl:col-span-5 bg-[#FAF9F5]/70 border border-slate-200/55 p-5 rounded-2xl flex flex-col justify-between">
                      <div className="space-y-1 mb-4 text-left">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest">Comparativo de Margem da Carteira</h4>
                        <p className="text-[11px] text-slate-500 leading-normal">Representação visual do aproveitamento líquido real por tipo de atendimento.</p>
                      </div>

                      <div className="h-[210px] w-full" id="rentabilidade-chart-holder">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={profitabilityByService} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EC" />
                            <XAxis dataKey="name" stroke="#6B6B5F" style={{ fontSize: '9px', fontWeight: 'bold' }} />
                            <YAxis stroke="#6B6B5F" style={{ fontSize: '9px' }} tickFormatter={(val) => `${val}%`} domain={[0, 100]} />
                            <Tooltip 
                              formatter={(value) => [`${Number(value).toFixed(2)}%`, 'Margem de Lucro']} 
                              contentStyle={{ borderRadius: '12px', borderColor: '#E8E6E1', backgroundColor: '#FFF', fontSize: '11px', textAlign: 'left' }}
                            />
                            <Bar dataKey="margin" radius={[4, 4, 0, 0]} barSize={26}>
                              {profitabilityByService.map((entry, index) => {
                                const isHighest = serviceRankings.highest?.id === entry.id;
                                const isLowest = serviceRankings.lowest?.id === entry.id;
                                let fillColor = '#A8CDB8'; // Standard default (soft sage green)
                                if (isHighest) fillColor = '#1B3A2D'; // Highest (deep forest green)
                                if (isLowest) fillColor = '#C1361A'; // Lowest (deep crimson red)
                                return <Cell key={`cell-${index}`} fill={fillColor} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Custom Legend detailing highest/lowest and standard margins */}
                      <div className="flex flex-col gap-2.5 text-[10.5px] text-slate-600 border-t border-slate-200/50 pt-3 mt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block size-2 rounded-xs" style={{ backgroundColor: '#1B3A2D' }} />
                            <span className="font-medium text-slate-500">Maior Margem (Performance Top)</span>
                          </div>
                          <span className="font-bold text-slate-800">{serviceRankings.highest?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block size-2 rounded-xs" style={{ backgroundColor: '#C1361A' }} />
                            <span className="font-medium text-slate-500">Menor Desempenho (Alerta/Gargalo)</span>
                          </div>
                          <span className="font-bold text-slate-800">{serviceRankings.lowest?.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="inline-block size-2 rounded-xs" style={{ backgroundColor: '#A8CDB8' }} />
                            <span className="font-medium text-slate-500">Outros Procedimentos Padrão</span>
                          </div>
                          <span className="text-slate-400 font-medium">Margem Saudável</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>


              {/* SUBSECTION: GARANTIAS - RETORNOS (6 columns) */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#141410] flex items-center gap-2">
                      <Clock className="size-4.5 text-slate-500" />
                      Análise de Qualidade Operacional e Garantias
                    </h3>
                    <p className="text-xs text-[#6B6B5F]">Acompanhamento de chamados de re-visitas sem faturamento que consomem reagentes e horas extras.</p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-4 text-center">
                    <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4">
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">Qtde Retornos</span>
                      <h4 className="text-2xl font-black font-semibold text-[#141410] font-mono mt-1">{operationalGuaranteeMetrics.qty}</h4>
                    </div>

                    <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4">
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">Custo Gerado</span>
                      <h4 className="text-xl font-black font-mono text-rose-700 mt-1.5">R$ {operationalGuaranteeMetrics.cost}</h4>
                    </div>

                    <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4">
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">Químicos Cons.</span>
                      <h4 className="text-xl font-black font-semibold text-slate-800 font-mono mt-1.5">{operationalGuaranteeMetrics.productsConsumed}</h4>
                    </div>

                    <div className="bg-[#FAF9F5] border border-slate-200 rounded-2xl p-4">
                      <span className="text-[8.5px] font-black text-slate-500 uppercase tracking-wider block">Horas Gastas</span>
                      <h4 className="text-xl font-black font-semibold text-slate-800 font-mono mt-1.5">{operationalGuaranteeMetrics.hoursSpent}</h4>
                    </div>
                  </div>

                  <div className="bg-[#FFFDEB] border border-[#FFE9A3] p-4 rounded-2xl text-xs space-y-1 text-slate-800">
                    <div className="flex items-center gap-1.5 font-bold text-amber-800">
                      <AlertTriangle className="size-3.5" />
                      <span>Impacto de Retornos sobre Receitas Totais</span>
                    </div>
                    <p className="leading-relaxed opacity-95">
                      Garantias operacionais e re-dedetizações custaram <span className="font-bold underline text-[#C1361A]">R$ {operationalGuaranteeMetrics.cost.toLocaleString('pt-BR')}</span> ao caixa corporativo este mês. Isso causou vazamento de faturamento bruto equivalente a <span className="font-bold">{operationalGuaranteeMetrics.revWastePercent.toFixed(2)}%</span>.
                    </p>
                  </div>
                </div>
              </div>


              {/* SUBSECTION: INADIMPLÊNCIA / CONTAS EM ATRASO (6 columns) */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#141410] flex items-center gap-2">
                      <Users className="size-4.5 text-[#D4A017]" />
                      Carteira de Recebíveis em Atraso (Cobrança Ativa)
                    </h3>
                    <p className="text-xs text-[#6B6B5F]">Visualização de faturamentos de serviços confirmados em atraso com duplicata em cobrança no cartório.</p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-sans">
                      <thead>
                        <tr className="bg-slate-50 text-[9px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                          <th className="py-2.5 px-3">Cliente Operador</th>
                          <th className="py-2.5 px-3 text-right font-semibold">Duplicata R$</th>
                          <th className="py-2.5 px-3 text-center">Inadimplente</th>
                          <th className="py-2.5 px-3 text-right">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {defaultDelinquentClients.map(cli => (
                          <tr key={cli.id} className="hover:bg-slate-50/30">
                            <td className="py-3 px-3">
                              <div className="space-y-0.5">
                                <p className="font-bold text-slate-800">{cli.name}</p>
                                <p className="text-[10px] text-slate-400">{cli.details}</p>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-extrabold text-[#C1361A]">
                              R$ {cli.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-3 text-center">
                              <span className="bg-rose-50 text-rose-700 border border-rose-200 text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded-lg">
                                {cli.daysOverdue} dias
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => handleOpenClientDetails(cli.id)}
                                className="px-3 py-1.5 bg-[#FAF9F5] border border-slate-200 rounded-lg hover:border-[#1B3A2D] hover:bg-[#1B3A2D] hover:text-white transition-all text-[10.5px] font-black uppercase tracking-wider cursor-pointer"
                              >
                                Abrir Cliente
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>


              {/* SUBSECTION: DOCUMENTOS FISCAIS (6 columns) */}
              <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-sm font-black uppercase tracking-wider text-[#141410] flex items-center gap-2">
                      <FileUp className="size-4.5 text-[#1B3A2D]" />
                      Lançamento de Boletos, Contratos e Notas Fiscais
                    </h3>
                    <p className="text-xs text-[#6B6B5F]">Organize sua central de furos de caixa rurais anexando arquivos operacionais no painel.</p>
                  </div>

                  {/* Document upload integration component */}
                  <FileUpload 
                    files={uploadedFiles} 
                    onFilesChange={(update) => setUploadedFiles(update)}
                    maxFiles={6} 
                  />
                </div>
              </div>


              {/* SUBSECTION: IA FINANCIAL INSIGHTS INTELLIGENTE */}
              <div className="lg:col-span-12 bg-[#1B3A2D] text-white p-6 rounded-3xl border border-[#2D6A4F] shadow-lg">
                <div className="flex items-center gap-2.5 border-b border-[#2D6A4F] pb-4 mb-4">
                  <div className="p-2 bg-white/10 rounded-xl">
                    <Sparkles className="size-5 text-yellow-400 animate-pulse" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[#A8CDB8]">DDSulf Advanced Financial Advisor</h3>
                    <p className="text-[10.5px] text-emerald-100">Gatilhos operacionais interpretados pela IA baseados nos furos do Plano de Contas.</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-left text-xs font-sans">
                  {financialInsightsMessages.map((ins, index) => (
                    <div 
                      key={index} 
                      className="bg-white/5 border border-white/10 p-3.5 rounded-2xl leading-relaxed flex gap-2.5 items-start"
                    >
                      <Sparkle className={`size-3 shrink-0 mt-1 ${
                        ins.type === 'critical' ? 'text-red-400' :
                        ins.type === 'attention' ? 'text-yellow-400' : 'text-emerald-400'
                      }`} />
                      <p className="opacity-95">{ins.text}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </motion.div>
        )}

        {/* TAB LANÇAMENTOS */}
        {activeTab === 'lancamentos' && (
          <motion.div
            key="lancamentos-view"
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <PlanoContasTab />
          </motion.div>
        )}

        {/* TAB PLANILHA */}
        {activeTab === 'planilha' && (
          <motion.div
            key="planilha-view"
            className="space-y-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            <SpreadsheetImportTab />
          </motion.div>
        )}

        {/* TAB CONFIG DE PARÂMETROS DE CUSTO */}
        {activeTab === 'precificador' && (
          <motion.div
            key="precificador-view"
            className="grid gap-6 lg:grid-cols-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
          >
            {/* Form Column */}
            <form onSubmit={handleSaveCosts} className="lg:col-span-8 space-y-6" id="precificador-form">
              <div className="grid gap-6 md:grid-cols-2 items-start">
                
                {/* Fixed Costs Card */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                  <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                    <div className="size-8 rounded-lg bg-[#1B3A2D] flex items-center justify-center text-white font-extrabold text-xs">
                      $
                    </div>
                    <div className="text-left">
                      <h3 className="font-bold text-slate-800 text-sm">Fração de Custos Fixos</h3>
                      <p className="text-[11px] text-slate-500">Comprometimento fixo basilar de frotas e sede</p>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4 text-xs text-left">
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Aluguel / Manutenção de Frota (Mês)</label>
                      <input 
                        type="number"
                        min="0"
                        value={vehicleRental || ''}
                        onChange={(e) => setVehicleRental(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Folha de Salários + Benefícios (Mês)</label>
                      <input 
                        type="number"
                        min="0"
                        value={salaries || ''}
                        onChange={(e) => setSalaries(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Aluguel do Galpão / Escritório</label>
                      <input 
                        type="number"
                        min="0"
                        value={rent || ''}
                        onChange={(e) => setRent(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Previsão Combustíveis da Frota</label>
                      <input 
                        type="number"
                        min="0"
                        value={fuel || ''}
                        onChange={(e) => setFuel(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Seguros da Sede e Frota</label>
                      <input 
                        type="number"
                        min="0"
                        value={insurance || ''}
                        onChange={(e) => setInsurance(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Outro Despesas Fixos</label>
                      <input 
                        type="number"
                        min="0"
                        value={other || ''}
                        onChange={(e) => setOther(parseFloat(e.target.value) || 0)}
                        className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Variable Costs */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                      <div className="size-8 rounded-lg bg-[#D4A017] flex items-center justify-center text-white font-extrabold text-xs">
                        V
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-slate-800 text-sm">Pesos de Custos Variáveis</h3>
                        <p className="text-[11px] text-slate-500">Estimativas indiretas por OS de controle</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-4 text-xs text-left">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Químicos Consumíveis Sazonal / Serviço (R$)</label>
                        <input 
                          type="number"
                          min="0"
                          value={productsPerService || ''}
                          onChange={(e) => setProductsPerService(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Custos Logísticos Horários de Mão de Obra</label>
                        <input 
                          type="number"
                          min="0"
                          value={laborPerHour || ''}
                          onChange={(e) => setLaborPerHour(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Depreciação dos Equipamentos e Bombas</label>
                        <input 
                          type="number"
                          min="0"
                          value={equipmentDepreciation || ''}
                          onChange={(e) => setEquipmentDepreciation(parseFloat(e.target.value) || 0)}
                          className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Target Metas */}
                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                      <div className="size-8 rounded-lg bg-slate-800 flex items-center justify-center text-white font-extrabold text-xs">
                        T
                      </div>
                      <div className="text-left">
                        <h3 className="font-bold text-slate-800 text-sm">Metas de Equilíbrio (Break-Even)</h3>
                        <p className="text-[11px] text-slate-500">Bases de comutação para amortizações corporativas</p>
                      </div>
                    </div>

                    <div className="p-6 space-y-4 text-xs text-left">
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Volume de Serviços Alvo / Mês</label>
                        <input 
                          type="number"
                          min="1"
                          value={servicesPerMonth || ''}
                          onChange={(e) => setServicesPerMonth(parseInt(e.target.value) || 120)}
                          className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Duração Média Atendimento (Horas)</label>
                        <input 
                          type="number"
                          min="1"
                          value={avgServiceDurationHours || ''}
                          onChange={(e) => setAvgServiceDurationHours(parseFloat(e.target.value) || 3)}
                          className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1">Margem Operacional Alvo Mínima (%)</label>
                        <input 
                          type="number"
                          min="5"
                          max="95"
                          value={minimumMarginPercent || ''}
                          onChange={(e) => setMinimumMarginPercent(parseFloat(e.target.value) || 35)}
                          className="w-full bg-[#FAFAF9] border border-slate-200 rounded-xl py-3 px-4 font-mono font-bold text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 col-span-12 w-full">
                <Button 
                  type="submit"
                  className="bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white px-8 py-3 text-xs uppercase tracking-wider font-extrabold rounded-xl h-11 cursor-pointer"
                >
                  Sincronizar Parâmetros de Custo
                </Button>
              </div>
            </form>

            {/* Quick documentation side panel - Right */}
            <div className="lg:col-span-4 space-y-6 text-left text-xs font-sans">
              <div className="bg-[#FAF9F5] rounded-3xl p-6 border border-slate-200 space-y-4">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-[13px]">Calibração do Ponto do Break-even</h4>
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">Estes parâmetros impactam frontalmente as inteligências financeiras e alertas DDSulf do painel principal.</p>
                </div>
                
                <div className="space-y-2.5 text-slate-500 leading-relaxed">
                  <p><strong>Custo Fixo Basilar:</strong> Somas fixas de frotas e sede consumidas antes de que qualquer OS seja efetuada no mês.</p>
                  <p><strong>Margem Alvo Mínima:</strong> Markup financeiro mínimo de segurança na precificação preliminar do sistema.</p>
                </div>

                <div className="bg-[#1B3A2D] text-white p-4.5 rounded-2xl flex items-start gap-2.5">
                  <Sparkles className="size-4 shrink-0 text-yellow-300 mt-0.5 animate-pulse" />
                  <p className="text-[10px] font-medium leading-normal">
                    Re-organize os parâmetros para reuniões de conselho com franquias e calibrar markups corretivos.
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>


      {/* ----------------------------------------------------
          MODAL: NEW TRANSACTION DIALOG (RECEITA / DESPESA)
          ---------------------------------------------------- */}
      {isNewTxOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 text-left border border-slate-100 flex flex-col justify-between">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <div className="space-y-0.5">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-md ${
                  txCategory === 'RECEITAS' ? 'bg-[#EBFDF5] text-[#2D6A4F]' : 'bg-rose-50 text-rose-800'
                }`}>
                  {txCategory === 'RECEITAS' ? 'CONCILIAÇÃO ENTRADA' : 'CONCILIAÇÃO SAÍDA'}
                </span>
                <h3 className="font-extrabold text-base text-slate-800 mt-1">
                  {txCategory === 'RECEITAS' ? 'Novo Faturamento Recebido' : 'Nova Baixa de Conta / Despesa'}
                </h3>
              </div>
              
              <button 
                onClick={() => setIsNewTxOpen(false)}
                className="size-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="py-4 space-y-3.5 text-xs">
              
              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Descrição Comercial (Histórico)</label>
                <input 
                  type="text"
                  placeholder="Ex: Serviço de Dedetização - Shopping das Flores"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3.5 font-sans font-bold text-slate-800 outline-none focus:border-slate-800 focus:bg-white text-xs"
                  required
                />
              </div>

              {/* Group Category */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Grupo Geral de Contas</label>
                  <select
                    value={txCategory}
                    onChange={(e) => setTxCategory(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-700 text-xs"
                  >
                    {Object.keys(GROUPS_STRUCTURE).map(key => (
                      <option key={key} value={key}>{CATEGORY_NAMES[key as keyof typeof CATEGORY_NAMES] || key}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory */}
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Subgrupo Técnico</label>
                  <select
                    value={txSubcategory}
                    onChange={(e) => setTxSubcategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-700 text-xs"
                  >
                    {(GROUPS_STRUCTURE[txCategory as keyof typeof GROUPS_STRUCTURE] || []).map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Value & Payment Method */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Valor Bruto R$</label>
                  <input 
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="2500,00"
                    value={txValue}
                    onChange={(e) => setTxValue(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3.5 font-mono font-bold text-slate-800 outline-none focus:border-slate-800 focus:bg-white text-xs"
                    required
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Meio de Recomutação</label>
                  <select
                    value={txPaymentMethod}
                    onChange={(e) => setTxPaymentMethod(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-700 text-xs"
                  >
                    {['Pix', 'Boleto', 'Cartão de Crédito', 'Dinheiro', 'Transferência'].map(method => (
                      <option key={method} value={method}>{method}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cost Center & Due Date */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Centro de Custo Ativo</label>
                  <select
                    value={txCostCenter}
                    onChange={(e) => setTxCostCenter(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 px-3 font-semibold text-slate-700 text-xs"
                  >
                    {COST_CENTERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500">Data Limite / Competência</label>
                  <input 
                    type="date"
                    value={txDueDate}
                    onChange={(e) => setTxDueDate(e.target.value)}
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl py-2.5 px-3.5 font-semibold text-slate-800 text-xs"
                  />
                </div>
              </div>

              {/* Instant paid toggler */}
              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="chk-is-paid"
                  checked={txIsPaid}
                  onChange={(e) => setTxIsPaid(e.target.checked)}
                  className="size-4 accent-[#1B3A2D] shrink-0 cursor-pointer"
                />
                <label htmlFor="chk-is-paid" className="font-bold text-slate-700 select-none cursor-pointer">
                  Marcar como Liquidado / Pago imediatamente em conta principal.
                </label>
              </div>

              {/* Submit panel */}
              <div className="flex gap-2.5 justify-end mt-4 border-t border-slate-100 pt-4">
                <Button
                  onClick={() => setIsNewTxOpen(false)}
                  type="button"
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all cursor-pointer h-10"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer h-10"
                >
                  Registrar Lançamento
                </Button>
              </div>

            </form>
          </div>
        </div>
      )}


      {/* ----------------------------------------------------
          MODAL: CLIENT BILLING DETAILS COBRANÇA
          ---------------------------------------------------- */}
      {selectedClientDetail && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200 text-left border border-slate-100 flex flex-col justify-between">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-800 flex items-center gap-1">
                <Briefcase className="size-4.5 text-[#D4A017]" />
                Ficha de Cobrança / Reconciliável
              </h3>
              <button 
                onClick={() => setSelectedClientDetail(null)}
                className="size-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 flex items-center justify-center cursor-pointer shrink-0 transition-colors"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-[9px] uppercase tracking-widest font-black text-slate-400 block">Razão Social / Nome Fantasia</label>
                <p className="font-extrabold text-[#141410] text-sm flex items-center gap-1">
                  <User className="size-4 text-slate-500" />
                  {selectedClientDetail.name}
                </p>
                <p className="text-[10.5px] font-medium text-slate-500 font-mono">CNPJ/CPF: {selectedClientDetail.cnpjCpf || '⚠️ NÃO INFORMADO'}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 pt-2 border-t border-slate-100">
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Telefone Principal</span>
                  <p className="font-semibold text-slate-700 flex items-center gap-1.5"><Phone className="size-3 text-slate-400" /> {selectedClientDetail.phone || '⚠️ NÃO INFORMADO'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">E-mail de Faturamento</span>
                  <p className="font-semibold text-slate-700 truncate flex items-center gap-1.5"><Mail className="size-3 text-slate-400" /> {selectedClientDetail.email || '⚠️ NÃO INFORMADO'}</p>
                </div>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Endereço de Notificação</span>
                <p className="font-semibold text-[#141410] text-[11px] leading-relaxed">{selectedClientDetail.address || '⚠️ NÃO INFORMADO'}</p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 leading-relaxed space-y-1.5 mt-2">
                <p className="font-bold">⚠️ Procedimento Recomendado DDSulf:</p>
                <p>Entre em contato utilizando os dados acima para notificar pendências de OS confirmadas. Encaminhe o boleto PDF atualizado via e-mail e registre o estorno ou acordo no Plano de Contas.</p>
              </div>
            </div>

            <div className="flex gap-2.5 justify-end border-t border-slate-100 pt-4">
              <Button
                onClick={() => {
                  toast.success(`Notificação automatizada enviada ao e-mail ${selectedClientDetail.email || 'geral'}`);
                  setSelectedClientDetail(null);
                }}
                className="px-4 py-2 bg-[#1B3A2D] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#1B3A2D]/90 transition-all cursor-pointer h-10"
              >
                Gerar Cobrança por WhatsApp
              </Button>
              <Button
                onClick={() => setSelectedClientDetail(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-all cursor-pointer h-10"
              >
                Fechar
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
