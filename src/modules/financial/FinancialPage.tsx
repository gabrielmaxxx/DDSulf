import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { 
  DollarSign, 
  TrendingUp, 
  Settings2, 
  Sliders, 
  Check, 
  Upload, 
  FileSpreadsheet, 
  Coins, 
  Truck, 
  Layers, 
  HelpCircle,
  FileCheck2,
  AlertTriangle,
  Eye,
  Percent,
  Calculator,
  PieChartIcon,
  HelpCircleIcon
} from 'lucide-react';
import { useSystemStore } from '@/store';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';

// System fields available for mapping
const SYSTEM_FIELDS_OPTIONS = [
  { value: 'fixedCosts.vehicleRental', label: 'Aluguel de Veículos (Custos Fixos)' },
  { value: 'fixedCosts.salaries', label: 'Salários Brut (Custos Fixos)' },
  { value: 'fixedCosts.rent', label: 'Aluguel / Sede (Custos Fixos)' },
  { value: 'fixedCosts.fuel', label: 'Combustível (Custos Fixos)' },
  { value: 'fixedCosts.insurance', label: 'Seguros (Custos Fixos)' },
  { value: 'fixedCosts.other', label: 'Outros Custos Fixos (Custos Fixos)' },
  { value: 'variableCosts.productsPerService', label: 'Custo Médio de Produtos/Serviço (Variável)' },
  { value: 'variableCosts.laborPerHour', label: 'Mão de Obra por Hora (Variável)' },
  { value: 'variableCosts.equipmentDepreciation', label: 'Depreciação de Equipamentos (Variável)' },
  { value: 'operational.servicesPerMonth', label: 'Média de Serviços por Mês (Operacional)' },
  { value: 'operational.avgServiceDurationHours', label: 'Duração Média do Serviço (Operacional)' },
  { value: 'operational.minimumMarginPercent', label: 'Margem Mínima (%)' },
];

const KEYWORD_MAP = {
  vehicleRental: {
    label: 'Aluguel de Veículos',
    systemField: 'fixedCosts.vehicleRental',
    keywords: ['veiculo', 'carro', 'aluguel veiculo', 'frota', 'locacao', 'locação'],
  },
  salaries: {
    label: 'Salários',
    systemField: 'fixedCosts.salaries',
    keywords: ['salario', 'salário', 'funcionario', 'funcionário', 'folha', 'pessoal', 'pro-labore', 'colaborador'],
  },
  rent: {
    label: 'Aluguel/Sede',
    systemField: 'fixedCosts.rent',
    keywords: ['aluguel', 'sede', 'escritorio', 'escritório', 'imovel', 'imóvel'],
  },
  fuel: {
    label: 'Combustível',
    systemField: 'fixedCosts.fuel',
    keywords: ['combustivel', 'combustível', 'gasolina', 'diesel', 'posto', 'abastecimento'],
  },
  insurance: {
    label: 'Seguros',
    systemField: 'fixedCosts.insurance',
    keywords: ['seguro', 'sinistro', 'seguros'],
  },
  productsPerService: {
    label: 'Custo Médio de Produtos por Serviço',
    systemField: 'variableCosts.productsPerService',
    keywords: ['produto', 'quimico', 'químico', 'insumo', 'gasto com material', 'produtos por servico'],
  },
  servicesPerMonth: {
    label: 'Média de Serviços por Mês',
    systemField: 'operational.servicesPerMonth',
    keywords: ['servico', 'serviço', 'servicos', 'serviços', 'quantidade', 'meta', 'meta mensal'],
  }
};

interface MappedItem {
  id: string;
  sourceLabel: string;
  value: number;
  systemField: string;
  cellRef: string;
  confirmed: boolean;
}

function cleanString(val: any): string {
  if (val === undefined || val === null) return '';
  return String(val)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function parseNumber(val: any): number | null {
  if (typeof val === 'number') {
    // Avoid returning NaN
    return isNaN(val) ? null : val;
  }
  if (typeof val === 'string') {
    // Basic cleaning for currency values
    let cleaned = val.replace(/[^\d.,-]/g, '').trim();
    if (!cleaned) return null;

    // Standardize decimals format (European/Brazilian vs Anglo formats)
    if (cleaned.includes(',') && cleaned.includes('.')) {
      if (cleaned.indexOf('.') < cleaned.indexOf(',')) {
        // Thousands separator is . and decimal separator is , (e.g., 1.500,00)
        const noDots = cleaned.split('.').join('');
        const withDot = noDots.replace(',', '.');
        const num = parseFloat(withDot);
        return isNaN(num) ? null : num;
      } else {
        // Thousands separator is , and decimal is . (e.g., 1,500.00)
        const noCommas = cleaned.split(',').join('');
        const num = parseFloat(noCommas);
        return isNaN(num) ? null : num;
      }
    }

    if (cleaned.includes(',') && !cleaned.includes('.')) {
      const withDot = cleaned.replace(',', '.');
      const num = parseFloat(withDot);
      return isNaN(num) ? null : num;
    }

    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

function getColumnLetter(colIndex: number): string {
  let temp = colIndex;
  let letter = '';
  while (temp >= 0) {
    letter = String.fromCharCode((temp % 26) + 65) + letter;
    temp = Math.floor(temp / 26) - 1;
  }
  return letter;
}

export function FinancialPage() {
  const { financial, updateFinancialCosts } = useSystemStore();

  const [activeTab, setActiveTab] = useState<'costs' | 'spreadsheet' | 'overview'>('costs');
  const [saving, setSaving] = useState(false);

  // Form Inputs States
  const [vehicleRental, setVehicleRental] = useState(financial.fixedCosts.vehicleRental || 0);
  const [salaries, setSalaries] = useState(financial.fixedCosts.salaries || 0);
  const [rent, setRent] = useState(financial.fixedCosts.rent || 0);
  const [fuel, setFuel] = useState(financial.fixedCosts.fuel || 0);
  const [insurance, setInsurance] = useState(financial.fixedCosts.insurance || 0);
  const [other, setOther] = useState(financial.fixedCosts.other || 0);
  const [observations, setObservations] = useState('');

  const [productsPerService, setProductsPerService] = useState(financial.variableCosts.productsPerService || 0);
  const [laborPerHour, setLaborPerHour] = useState(financial.variableCosts.laborPerHour || 0);
  const [equipmentDepreciation, setEquipmentDepreciation] = useState(financial.variableCosts.equipmentDepreciation || 0);

  const [servicesPerMonth, setServicesPerMonth] = useState(financial.operational.servicesPerMonth || 120);
  const [avgServiceDurationHours, setAvgServiceDurationHours] = useState(financial.operational.avgServiceDurationHours || 3);
  const [minimumMarginPercent, setMinimumMarginPercent] = useState(financial.operational.minimumMarginPercent || 35);

  // Spreadsheet state
  const [isDragging, setIsDragging] = useState(false);
  const [mappedItems, setMappedItems] = useState<MappedItem[]>([]);
  const [sheetPreviewData, setSheetPreviewData] = useState<any[][]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>('');

  // Sync state with store on load or modifications
  useEffect(() => {
    if (financial) {
      setVehicleRental(financial.fixedCosts.vehicleRental || 0);
      setSalaries(financial.fixedCosts.salaries || 0);
      setRent(financial.fixedCosts.rent || 0);
      setFuel(financial.fixedCosts.fuel || 0);
      setInsurance(financial.fixedCosts.insurance || 0);
      setOther(financial.fixedCosts.other || 0);
      setProductsPerService(financial.variableCosts.productsPerService || 0);
      setLaborPerHour(financial.variableCosts.laborPerHour || 0);
      setEquipmentDepreciation(financial.variableCosts.equipmentDepreciation || 0);
      setServicesPerMonth(financial.operational.servicesPerMonth || 120);
      setAvgServiceDurationHours(financial.operational.avgServiceDurationHours || 3);
      setMinimumMarginPercent(financial.operational.minimumMarginPercent || 35);
    }
  }, [financial]);

  // Read observations from storage
  useEffect(() => {
    const savedObs = localStorage.getItem('ddsulf_financial_observations');
    if (savedObs) setObservations(savedObs);
  }, []);

  // Projections calculations (using form state)
  const currentTotalFixedCosts = vehicleRental + salaries + rent + fuel + insurance + other;
  const safeServicesPerMonth = Math.max(1, servicesPerMonth);
  const currentFixedCostPerService = currentTotalFixedCosts / safeServicesPerMonth;
  const currentVariableCostPerService = productsPerService + (laborPerHour * avgServiceDurationHours) + (equipmentDepreciation / safeServicesPerMonth);
  const currentTotalCostPerService = currentFixedCostPerService + currentVariableCostPerService;
  
  const currentMarginFactor = 1 - (minimumMarginPercent / 100);
  const currentSuggestedMinPrice = currentMarginFactor > 0 ? currentTotalCostPerService / currentMarginFactor : currentTotalCostPerService;

  // Saved Projections calculations (using store state for Overview)
  const savedTotalFixedCosts = financial.fixedCosts.vehicleRental + financial.fixedCosts.salaries + financial.fixedCosts.rent + financial.fixedCosts.fuel + financial.fixedCosts.insurance + financial.fixedCosts.other;
  const savedSafeServicesPerMonth = Math.max(1, financial.operational.servicesPerMonth);
  const savedFixedCostPerService = savedTotalFixedCosts / savedSafeServicesPerMonth;
  const savedVariableCostPerService = financial.variableCosts.productsPerService + (financial.variableCosts.laborPerHour * financial.operational.avgServiceDurationHours) + (financial.variableCosts.equipmentDepreciation / savedSafeServicesPerMonth);
  const savedTotalCostPerService = savedFixedCostPerService + savedVariableCostPerService;
  
  const savedMarginFactor = 1 - (financial.operational.minimumMarginPercent / 100);
  const savedSuggestedMinPrice = savedMarginFactor > 0 ? savedTotalCostPerService / savedMarginFactor : savedTotalCostPerService;

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);

    setTimeout(() => {
      try {
        updateFinancialCosts({
          fixedCosts: { vehicleRental, salaries, rent, fuel, insurance, other },
          variableCosts: { productsPerService, laborPerHour, equipmentDepreciation },
          operational: { servicesPerMonth, avgServiceDurationHours, minimumMarginPercent }
        });

        localStorage.setItem('ddsulf_financial_observations', observations);

        toast.success('Parâmetros Financeiros Atualizados!', {
          description: 'Os dados foram persistidos e serão aplicados automaticamente nas cotações.'
        });
        setActiveTab('overview');
      } catch (err) {
        toast.error('Ocorreu um erro ao salvar suas alterações financeiras.');
      } finally {
        setSaving(false);
      }
    }, 500);
  };

  // Excel Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      toast.error('Formato inválido.', {
        description: 'Selecione um arquivo válido nos formatos (.xlsx, .xls ou .csv).'
      });
      return;
    }

    setUploadedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const rawBuffer = e.target?.result as ArrayBuffer;
        const data = new Uint8Array(rawBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Feed raw array rows structure for original grid preview
        const rows = XLSX.utils.sheet_to_json<any[]>(worksheet, { header: 1 });
        setSheetPreviewData(rows);

        const items: MappedItem[] = [];

        rows.forEach((row, rowIndex) => {
          if (!Array.isArray(row)) return;
          row.forEach((cell, cellIndex) => {
            const cellStr = cleanString(cell);
            if (!cellStr) return;

            Object.entries(KEYWORD_MAP).forEach(([fieldKey, config]) => {
              const matchedKeyword = config.keywords.some(kw => cellStr.includes(cleanString(kw)));
              if (matchedKeyword) {
                // Find nearest number in the row matrix
                let matchedNum: number | null = null;
                let bestCellIdx = -1;

                // Priority 1: cells on the right
                for (let idx = cellIndex + 1; idx < row.length; idx++) {
                  const num = parseNumber(row[idx]);
                  if (num !== null) {
                    matchedNum = num;
                    bestCellIdx = idx;
                    break;
                  }
                }

                // Priority 2: cells on the left
                if (matchedNum === null) {
                  for (let idx = cellIndex - 1; idx >= 0; idx--) {
                    const num = parseNumber(row[idx]);
                    if (num !== null) {
                      matchedNum = num;
                      bestCellIdx = idx;
                      break;
                    }
                  }
                }

                if (matchedNum !== null) {
                  const letter = getColumnLetter(bestCellIdx);
                  // Ensure uniqueness to avoid polluting grid coordinates duplicates
                  const key = `map-${fieldKey}-${rowIndex}-${cellIndex}`;
                  if (!items.some(it => it.id === key)) {
                    items.push({
                      id: key,
                      sourceLabel: String(cell),
                      value: matchedNum,
                      systemField: config.systemField,
                      cellRef: `${letter}${rowIndex + 1} ("${cell}")`,
                      confirmed: true
                    });
                  }
                }
              }
            });
          });
        });

        if (items.length > 0) {
          setMappedItems(items);
          toast.success('Varredura Completa!', {
            description: `Encontramos ${items.length} potenciais correspondências semânticas.`
          });
        } else {
          setMappedItems([]);
          toast.warning('Processamento concluído, sem dados decodificados.', {
            description: 'Não localizamos termos financeiros correspondentes de custos na planilha.'
          });
        }
      } catch (err) {
        console.error(err);
        toast.error('Falha ao processar arquivo de planilha excel.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleUpdateItemField = (id: string, newField: string) => {
    setMappedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, systemField: newField };
      }
      return item;
    }));
  };

  const handleToggleItemConfirm = (id: string) => {
    setMappedItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, confirmed: !item.confirmed };
      }
      return item;
    }));
  };

  const handleImportSelected = () => {
    const activeItems = mappedItems.filter(i => i.confirmed);
    if (activeItems.length === 0) {
      toast.warning('Ação cancelada.', {
        description: 'Nenhum dos campos detectados foi marcado para importação.'
      });
      return;
    }

    // Accumulate structures
    const fixedObj: any = {};
    const variableObj: any = {};
    const operationalObj: any = {};

    activeItems.forEach(item => {
      const [category, field] = item.systemField.split('.');
      if (category === 'fixedCosts') {
        fixedObj[field] = item.value;
      } else if (category === 'variableCosts') {
        variableObj[field] = item.value;
      } else if (category === 'operational') {
        operationalObj[field] = item.value;
      }
    });

    // Populate actual state variables
    if (fixedObj.vehicleRental !== undefined) setVehicleRental(fixedObj.vehicleRental);
    if (fixedObj.salaries !== undefined) setSalaries(fixedObj.salaries);
    if (fixedObj.rent !== undefined) setRent(fixedObj.rent);
    if (fixedObj.fuel !== undefined) setFuel(fixedObj.fuel);
    if (fixedObj.insurance !== undefined) setInsurance(fixedObj.insurance);
    if (fixedObj.other !== undefined) setOther(fixedObj.other);

    if (variableObj.productsPerService !== undefined) setProductsPerService(variableObj.productsPerService);
    if (variableObj.laborPerHour !== undefined) setLaborPerHour(variableObj.laborPerHour);
    if (variableObj.equipmentDepreciation !== undefined) setEquipmentDepreciation(variableObj.equipmentDepreciation);

    if (operationalObj.servicesPerMonth !== undefined) setServicesPerMonth(operationalObj.servicesPerMonth);
    if (operationalObj.avgServiceDurationHours !== undefined) setAvgServiceDurationHours(operationalObj.avgServiceDurationHours);
    if (operationalObj.minimumMarginPercent !== undefined) setMinimumMarginPercent(operationalObj.minimumMarginPercent);

    // Call store update
    updateFinancialCosts({
      fixedCosts: fixedObj,
      variableCosts: variableObj,
      operational: operationalObj
    });

    toast.success('Planilha importada com sucesso!', {
      description: `Mapeados ${activeItems.length} parâmetros no store financeiro.`
    });

    // Switch to Overview or Costs tab
    setActiveTab('overview');
  };

  // Recharts chart makeup
  const pieData = [
    { name: 'Aluguel Frota', value: financial.fixedCosts.vehicleRental || 0, color: '#1E293B' },
    { name: 'Folha Salarial', value: financial.fixedCosts.salaries || 0, color: '#0F172A' },
    { name: 'Aluguel Sede', value: financial.fixedCosts.rent || 0, color: '#475569' },
    { name: 'Combustíveis', value: financial.fixedCosts.fuel || 0, color: '#64748B' },
    { name: 'Seguros Gerais', value: financial.fixedCosts.insurance || 0, color: '#94A3B8' },
    { name: 'Outros Custos', value: financial.fixedCosts.other || 0, color: '#CBD5E1' }
  ].filter(item => item.value > 0);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      
      {/* Visual Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="size-2 bg-slate-900 rounded-full" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Painel de Controle de viabilidade</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-neutral-950">Custos & Viabilidade</h1>
          <p className="text-gray-500 text-sm max-w-2xl font-medium">Configure as despesas fixas, preço de insumos operacionais e a margem de segurança para subsidiar a calculadora DDSulf.</p>
        </div>

        {/* Dynamic Tabs Navigation Switch */}
        <div className="flex bg-gray-100/80 p-1.5 rounded-2xl border border-gray-200/50 self-start md:self-auto shrink-0 shadow-xs" id="tabs-navigation">
          <button
            id="tab-btn-overview"
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'overview' ? 'bg-white text-slate-950 shadow-sm border border-black/5' : 'text-gray-500 hover:text-black hover:bg-white/40'
            }`}
          >
            <Eye className="size-3.5" />
            Visão Geral
          </button>
          <button
            id="tab-btn-costs"
            type="button"
            onClick={() => setActiveTab('costs')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'costs' ? 'bg-white text-slate-950 shadow-sm border border-black/5' : 'text-gray-500 hover:text-black hover:bg-white/40'
            }`}
          >
            <Settings2 className="size-3.5" />
            Custos da Empresa
          </button>
          <button
            id="tab-btn-spreadsheet"
            type="button"
            onClick={() => setActiveTab('spreadsheet')}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'spreadsheet' ? 'bg-white text-slate-950 shadow-sm border border-black/5' : 'text-gray-500 hover:text-black hover:bg-white/40'
            }`}
          >
            <Upload className="size-3.5" />
            Upload de Planilha
          </button>
        </div>
      </header>

      {/* Tabs Layout Handler */}
      <AnimatePresence mode="wait">
        
        {/* ABA 1: CUSTOS DA EMPRESA */}
        {activeTab === 'costs' && (
          <motion.div
            key="costs-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid gap-8 lg:grid-cols-12"
          >
            
            {/* Form Column - Left */}
            <form onSubmit={handleSave} className="lg:col-span-8 space-y-8" id="financial-form">
              
              {/* Custos Fixos Seção */}
              <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[28px] p-8 space-y-6" id="card-fixed-costs-input">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-950 rounded-xl">
                    <Truck className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950">Custos Fixos Mensais</h3>
                    <p className="text-[11px] text-gray-400">Despesas rotineiras essenciais para manter a DDSulf em operação.</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5" id="group-vehicle-rental">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Aluguel de Veículos (Frota)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                      <input
                        id="input-vehicle-rental"
                        type="number"
                        min="0"
                        step="0.01"
                        value={vehicleRental || ''}
                        onChange={(e) => setVehicleRental(parseFloat(e.target.value) || 0)}
                        className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5" id="group-salaries">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Salários (Total Bruto)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                      <input
                        id="input-salaries"
                        type="number"
                        min="0"
                        step="0.01"
                        value={salaries || ''}
                        onChange={(e) => setSalaries(parseFloat(e.target.value) || 0)}
                        className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5" id="group-rent">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Aluguel / Sede Coordenada</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                      <input
                        id="input-rent"
                        type="number"
                        min="0"
                        step="0.01"
                        value={rent || ''}
                        onChange={(e) => setRent(parseFloat(e.target.value) || 0)}
                        className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5" id="group-fuel">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Combustível (Média Mensal)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                      <input
                        id="input-fuel"
                        type="number"
                        min="0"
                        step="0.01"
                        value={fuel || ''}
                        onChange={(e) => setFuel(parseFloat(e.target.value) || 0)}
                        className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5" id="group-insurance">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Seguros Contratados</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                      <input
                        id="input-insurance"
                        type="number"
                        min="0"
                        step="0.01"
                        value={insurance || ''}
                        onChange={(e) => setInsurance(parseFloat(e.target.value) || 0)}
                        className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5" id="group-other">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Outros Custos Fixos (Água, Luz, Admin...)</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                      <input
                        id="input-other"
                        type="number"
                        min="0"
                        step="0.01"
                        value={other || ''}
                        onChange={(e) => setOther(parseFloat(e.target.value) || 0)}
                        className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5" id="group-observations">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Observações Estratégicas</label>
                  <textarea
                    id="textarea-observations"
                    rows={2}
                    value={observations}
                    onChange={(e) => setObservations(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl p-3.5 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white min-h-[70px]"
                    placeholder="Especifique frotas extras, contratos especiais ou reajustes periódicos programados..."
                  />
                </div>
              </Card>

              {/* Custos Variáveis Seção */}
              <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[28px] p-8 space-y-6" id="card-variable-costs-input">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-950 rounded-xl">
                    <Coins className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950">Custos Variáveis</h3>
                    <p className="text-[11px] text-gray-400">Despesas inerentes aos consumíveis e as execuções de atendimentos.</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-1.5" id="group-products-per-service">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Média de Produtos/Serviço</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                      <input
                        id="input-products-per-service"
                        type="number"
                        min="0"
                        step="0.01"
                        value={productsPerService || ''}
                        onChange={(e) => setProductsPerService(parseFloat(e.target.value) || 0)}
                        className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5" id="group-labor-per-hour">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Mão de Obra por Hora</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                      <input
                        id="input-labor-per-hour"
                        type="number"
                        min="0"
                        step="0.01"
                        value={laborPerHour || ''}
                        onChange={(e) => setLaborPerHour(parseFloat(e.target.value) || 0)}
                        className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5" id="group-equipment-depreciation">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Depreciação de Equipamento</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">R$</span>
                      <input
                        id="input-equipment-depreciation"
                        type="number"
                        min="0"
                        step="0.01"
                        value={equipmentDepreciation || ''}
                        onChange={(e) => setEquipmentDepreciation(parseFloat(e.target.value) || 0)}
                        className="w-full h-11 border border-gray-200 rounded-xl pl-10 pr-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Parâmetros Operacionais Seção */}
              <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[28px] p-8 space-y-6" id="card-operational-input">
                <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="p-2.5 bg-slate-50 border border-slate-100 text-slate-950 rounded-xl">
                    <Sliders className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-950">Parâmetros Operacionais</h3>
                    <p className="text-[11px] text-gray-400">Volume estimado de serviços de base do rateio geral.</p>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-1.5" id="group-services-per-month">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Média de Serviços por Mês</label>
                    <input
                      id="input-services-per-month"
                      type="number"
                      min="1"
                      value={servicesPerMonth || ''}
                      onChange={(e) => setServicesPerMonth(parseInt(e.target.value) || 1)}
                      className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                      placeholder="Ex: 120"
                    />
                  </div>

                  <div className="space-y-1.5" id="group-avg-duration">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">Duração Média do Serviço (horas)</label>
                    <input
                      id="input-avg-duration"
                      type="number"
                      min="0.5"
                      step="0.5"
                      value={avgServiceDurationHours || ''}
                      onChange={(e) => setAvgServiceDurationHours(parseFloat(e.target.value) || 1)}
                      className="w-full h-11 border border-gray-200 rounded-xl px-4 text-xs font-semibold focus:outline-hidden focus:border-slate-950 transition-all bg-white"
                      placeholder="Ex: 3"
                    />
                  </div>
                </div>

                <div className="space-y-3" id="group-minimum-margin">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400 font-bold">
                      Margem Mínima Desejada (%)
                    </label>
                    <span className="text-xs font-bold text-slate-950 bg-slate-100 px-2.5 py-1 rounded-md">
                      {minimumMarginPercent}%
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400">0%</span>
                    <input
                      id="slider-margin"
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={minimumMarginPercent}
                      onChange={(e) => setMinimumMarginPercent(parseInt(e.target.value) || 0)}
                      className="flex-1 accent-slate-950 h-1 bg-gray-200 rounded-sm appearance-none cursor-pointer"
                    />
                    <span className="text-[10px] font-bold text-slate-400">100%</span>
                  </div>
                </div>
              </Card>
            </form>

            {/* Sidebar real-time computations - Right */}
            <div className="lg:col-span-4 space-y-6">
              
              <Card className="bg-slate-950 text-white p-8 rounded-[32px] space-y-6 relative overflow-hidden shadow-md" id="right-projection-panel">
                <div>
                  <div className="size-2 bg-emerald-500 rounded-full mb-3.5 animate-pulse" />
                  <h3 className="text-sm font-black uppercase tracking-widest opacity-60">Projeção Dinâmica</h3>
                  <h4 className="text-[10px] text-slate-400">Visualização imediata dos inputs atuais</h4>
                </div>

                <div className="border-t border-slate-800 pt-5 space-y-3.5 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="opacity-50">Custos Fixos Totais/mês</span>
                    <span className="font-bold">R$ {currentTotalFixedCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-50">Custo Fixo por Serviço</span>
                    <span className="font-bold">R$ {currentFixedCostPerService.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="opacity-50">Custo Variável estimado</span>
                    <span className="font-bold">R$ {currentVariableCostPerService.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-sm font-bold text-slate-100">
                    <span>Custo Total por Serviço</span>
                    <span>R$ {currentTotalCostPerService.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>

                <div className="bg-slate-900 rounded-2xl p-5 space-y-1.5 border border-slate-800/60">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#10B981] flex items-center gap-1">
                    <TrendingUp className="size-3" /> Preço Mínimo Sugerido
                  </span>
                  <div className="text-2xl font-black text-white tracking-tight">
                    R$ {currentSuggestedMinPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-[9px] text-slate-500 leading-normal">
                    Fator multiplicador necessário para cobrir custos e retornar livre de encargos a margem estipulada de {minimumMarginPercent}%.
                  </p>
                </div>

                <Button
                  id="btn-save-costs-form"
                  onClick={() => handleSave()}
                  disabled={saving}
                  className="w-full h-12 bg-white text-slate-950 hover:bg-gray-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-98 flex items-center justify-center gap-2 shadow-sm"
                >
                  {saving ? 'Gravando Alterações...' : (
                    <>
                      <Check className="size-4" />
                      Salvar Dados Financeiros
                    </>
                  )}
                </Button>

                <div className="absolute -bottom-20 -left-20 size-56 bg-slate-800/15 rounded-full blur-2xl pointer-events-none" />
              </Card>

              {/* Tips Section */}
              <div className="p-6 bg-slate-50 border border-[#E5E7EB] rounded-[24px] space-y-3" id="card-help-projections">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <HelpCircle className="size-3.5 text-slate-400" />
                  Métrica de Equivalência
                </h4>
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  A DDSulf usa essas taxas como referências globais do sistema. O rateio do KM rodado, taxas tributárias aproximadas e custo ocioso de técnicos em campo de orçamentos se retroalimentam com base neste painel central.
                </p>
              </div>

            </div>
          </motion.div>
        )}

        {/* ABA 2: UPLOAD DE PLANILHA */}
        {activeTab === 'spreadsheet' && (
          <motion.div
            key="spreadsheet-upload"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            <div className="grid gap-8 lg:grid-cols-12">
              
              {/* Drag n Drop Upload Area */}
              <div className="lg:col-span-5 space-y-6">
                <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[28px] p-8 space-y-6" id="card-upload-dragdrop">
                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-slate-950">Seletor de Planilhas</h3>
                    <p className="text-[11px] text-gray-400">Importe as planilhas existentes da DDSulf sem mudar suas estruturas originais.</p>
                  </div>

                  {/* Interative Box */}
                  <div
                    id="dropzone-area"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-[20px] p-10 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-slate-950 bg-slate-50/50' 
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-slate-400">
                        <FileSpreadsheet className="size-8" />
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-slate-900">Arraste ou clique para carregar o arquivo</p>
                        <p className="text-[9px] text-gray-400">Formatos compatíveis: .xlsx, .xls ou .csv</p>
                      </div>

                      {uploadedFileName && (
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-900 px-3 py-1 rounded-full text-[10px] font-bold border border-slate-200">
                          <Check className="size-3 text-emerald-600" />
                          {uploadedFileName}
                        </div>
                      )}

                      <div className="relative">
                        <input
                          id="file-upload-input"
                          type="file"
                          accept=".xlsx,.xls,.csv"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider text-slate-950 border-slate-200 hover:bg-slate-50"
                        >
                          Procurar Arquivo
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Details block */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-gray-500 space-y-1.5">
                    <span className="font-bold text-slate-800 uppercase block tracking-wider">Como funciona o scanner semântico?</span>
                    <p className="leading-relaxed">
                      Lemos as linhas e cruzamos descrições comuns para "veículo", "salários", "sede", "gasolina" e "seguros" e detectamos de forma contígua os valores próximos. Você pode visualizar a correspondência e mudar o campo destino ou ignorar.
                    </p>
                  </div>
                </Card>
              </div>

              {/* Mapped values review parameters panel */}
              <div className="lg:col-span-7 space-y-6">
                <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[28px] p-8 space-y-6 flex flex-col min-h-[420px]" id="card-mapped-results">
                  
                  <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <div className="space-y-0.5">
                      <h3 className="text-base font-bold text-slate-950">Tabela de Revisão</h3>
                      <p className="text-[11px] text-gray-400">Verifique e edite o destino das correspondências identificadas.</p>
                    </div>
                    {mappedItems.length > 0 && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 flex items-center gap-1">
                        <FileCheck2 className="size-3.5" /> {mappedItems.length} Encontrados
                      </span>
                    )}
                  </div>

                  {/* Review Table body */}
                  <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 space-y-3">
                    {mappedItems.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center gap-3">
                        <AlertTriangle className="size-8 text-amber-500 opacity-60" />
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Aguardando Planilha</p>
                          <p className="text-[10px] text-gray-400 max-w-[320px] leading-relaxed">Importe uma planilha financeira para ver o mapeador inteligente em ação.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {mappedItems.map((item, index) => (
                          <div 
                            key={item.id}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                              item.confirmed 
                                ? 'bg-slate-50/50 border-slate-200' 
                                : 'bg-white border-dashed border-gray-200 opacity-50'
                            }`}
                          >
                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2">
                                <b className="text-xs text-slate-950 font-bold">{item.sourceLabel}</b>
                                <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                  Ref: {item.cellRef.split(' (')[0]}
                                </span>
                              </div>
                              <p className="text-[10px] text-gray-400 font-medium">
                                Valor identificado: <span className="font-bold text-slate-700">R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </p>
                            </div>

                            {/* Options and Checks Column */}
                            <div className="flex items-center gap-3 shrink-0">
                              
                              {/* Destination dropdown selector */}
                              <select
                                value={item.systemField}
                                onChange={(e) => handleUpdateItemField(item.id, e.target.value)}
                                className="h-9 input-option-system text-slate-950 bg-white border border-gray-200 rounded-lg px-2 text-[11px] font-bold focus:outline-hidden focus:ring-1 focus:ring-slate-950 max-w-[220px]"
                              >
                                {SYSTEM_FIELDS_OPTIONS.map(opt => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>

                              {/* Checkbox */}
                              <label className="flex items-center gap-1 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={item.confirmed}
                                  onChange={() => handleToggleItemConfirm(item.id)}
                                  className="size-4 accent-slate-950 rounded border-gray-300"
                                />
                                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest pl-1">Aprovar</span>
                              </label>

                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {mappedItems.length > 0 && (
                    <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                      <Button
                        type="button"
                        onClick={() => {
                          setMappedItems([]);
                          setSheetPreviewData([]);
                          setUploadedFileName('');
                        }}
                        variant="ghost"
                        className="h-11 px-5 text-[10px] font-bold uppercase tracking-wider rounded-xl text-rose-600 hover:bg-rose-50"
                      >
                        Limpar Dados
                      </Button>
                      <Button
                        id="btn-confirm-import-data"
                        type="button"
                        onClick={handleImportSelected}
                        className="h-11 px-6 text-[10px] font-bold uppercase tracking-wider text-white bg-slate-950 hover:opacity-95 active:scale-98 transition-all rounded-xl shadow-md flex items-center gap-1.5"
                      >
                        <Check className="size-4" />
                        Importar Dados Selecionados
                      </Button>
                    </div>
                  )}

                </Card>
              </div>

            </div>

            {/* Render Raw Sheet Grid Preview */}
            {sheetPreviewData && sheetPreviewData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full"
                id="container-sheet-original-preview"
              >
                <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[28px] p-8 space-y-4">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                      <Eye className="size-4 text-slate-500" />
                      Visualização da Planilha Original (Primeiras 10 linhas)
                    </h4>
                    <p className="text-[11px] text-gray-400">Audite os dados diretamente na tabela original capturada do arquivo.</p>
                  </div>
                  
                  <div className="overflow-x-auto rounded-2xl border border-gray-150 max-h-[300px]">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-gray-200 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-center text-[9px] font-black uppercase text-gray-400 border-r border-gray-150 bg-slate-100 w-12">#</th>
                          {Array.from({ length: Math.max(...sheetPreviewData.slice(0, 10).map(r => r.length), 0) }).map((_, i) => (
                            <th key={i} className="px-4 py-2 text-[10px] font-black text-center uppercase tracking-wider text-gray-400 border-r border-gray-150 bg-slate-50">
                              {getColumnLetter(i)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150 bg-white">
                        {sheetPreviewData.slice(0, 10).map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-3 py-2 text-center font-mono text-[9px] bg-slate-50 text-slate-400 font-bold border-r border-gray-150">{rIdx + 1}</td>
                            {Array.from({ length: Math.max(...sheetPreviewData.slice(0, 10).map(r => r.length), 0) }).map((_, cIdx) => {
                              const cellVal = row[cIdx];
                              return (
                                <td key={cIdx} className="px-4 py-2.5 border-r border-gray-150 text-[#334155] font-medium min-w-[130px] truncate max-w-[220px]">
                                  {cellVal !== undefined && cellVal !== null ? String(cellVal) : ''}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </motion.div>
            )}

          </motion.div>
        )}

        {/* ABA 3: VISÃO GERAL */}
        {activeTab === 'overview' && (
          <motion.div
            key="overview-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="space-y-8"
          >
            
            {/* KPI Cards Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" id="overview-kpi-grid">
              
              {/* Card 1: Custo Fixo Mensal */}
              <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[24px] p-6 space-y-4" id="overview-card-fixed-total">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Custos Fixos Totais</span>
                  <Truck className="size-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-3xl font-black text-slate-950">R$ {savedTotalFixedCosts.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                  <p className="text-[10px] text-gray-400">Rateio para {savedSafeServicesPerMonth} metas de atendimentos</p>
                </div>
                
                {/* Visual items list breakdown */}
                <div className="border-t border-gray-100 pt-3 space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Veículos:</span>
                    <span className="font-bold text-slate-950">R$ {(financial.fixedCosts.vehicleRental || 0).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Funcionários:</span>
                    <span className="font-bold text-slate-950">R$ {(financial.fixedCosts.salaries || 0).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sede Física:</span>
                    <span className="font-bold text-slate-950">R$ {(financial.fixedCosts.rent || 0).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </Card>

              {/* Card 2: Custo Por Serviço */}
              <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[24px] p-6 space-y-4" id="overview-card-per-service">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Custo Médio / Atendimento</span>
                  <Coins className="size-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-3xl font-black text-slate-950">R$ {savedTotalCostPerService.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                  <p className="text-[10px] text-gray-400">Fixo Rateado + Categoria do serviço</p>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Fração Fixa:</span>
                    <span className="font-bold text-slate-900">R$ {savedFixedCostPerService.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insumos Médios:</span>
                    <span className="font-bold text-slate-900">R$ {(financial.variableCosts.productsPerService || 0).toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Mão de Obra estim.:</span>
                    <span className="font-bold text-slate-900">R$ {(financial.variableCosts.laborPerHour * financial.operational.avgServiceDurationHours).toLocaleString('pt-BR')}</span>
                  </div>
                </div>
              </Card>

              {/* Card 3: Preço Mínimo */}
              <Card className="bg-slate-950 text-white shadow-xs rounded-[24px] p-6 space-y-4 relative overflow-hidden" id="overview-card-suggested-price">
                <div className="flex items-center justify-between opacity-60">
                  <span className="text-[10px] font-black uppercase tracking-wider">Mínimo Sugerido Base</span>
                  <TrendingUp className="size-4 text-emerald-400" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-3xl font-black text-white">R$ {savedSuggestedMinPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h4>
                  <p className="text-[10px] text-slate-400">Para preservar a rentabilidade definida</p>
                </div>

                <div className="border-t border-slate-800 pt-3 space-y-1 text-[11px] text-slate-300">
                  <div className="flex justify-between">
                    <span>Custo Base do Atendimento:</span>
                    <span>R$ {savedTotalCostPerService.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Margem Mínima Segura:</span>
                    <span className="text-emerald-400 font-bold">{financial.operational.minimumMarginPercent}%</span>
                  </div>
                </div>
                <div className="absolute -bottom-16 -right-16 size-36 bg-slate-800/25 rounded-full blur-xl pointer-events-none" />
              </Card>

              {/* Card 4: Margem Operacional */}
              <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[24px] p-6 space-y-4" id="overview-card-margin-goal">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Configuração da Margem</span>
                  <Percent className="size-4" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-3xl font-black text-slate-950">{financial.operational.minimumMarginPercent}%</h4>
                  <p className="text-[10px] text-gray-400">Margem mínima em cotações</p>
                </div>

                <div className="border-t border-gray-100 pt-3 space-y-1 text-[11px] text-slate-600">
                  <div className="flex justify-between">
                    <span>Serviços / Mês (Meta):</span>
                    <span className="font-bold text-slate-950">{financial.operational.servicesPerMonth} serviços</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duração Média:</span>
                    <span className="font-bold text-slate-950">{financial.operational.avgServiceDurationHours} horas</span>
                  </div>
                </div>
              </Card>

            </div>

            {/* Visual Charts and lists breakdown */}
            <div className="grid gap-8 lg:grid-cols-12" id="overview-visuals">
              
              {/* Pie Composition Chart - Left */}
              <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[28px] p-8 lg:col-span-7 flex flex-col justify-between" id="card-piechart-fixed-costs">
                <div className="space-y-1 border-b border-gray-100 pb-4">
                  <h3 className="text-base font-bold text-slate-950 flex items-center gap-2">
                    <PieChartIcon className="size-4 text-slate-500" />
                    Distribuição Estrita dos Custos Fixos
                  </h3>
                  <p className="text-[11px] text-gray-400">Visão proporcional das despesas obrigatórias mensais para fins de gerenciamento tributário e de compras.</p>
                </div>

                <div className="h-[280px] w-full mt-6" id="wrapper-fixed-costs-piechart">
                  {pieData.length === 0 ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center text-slate-400 gap-2">
                      <AlertTriangle className="size-6 text-amber-500" />
                      <span className="text-[11px] font-medium">Não há custos fixos inseridos para gerar o gráfico.</span>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR')}`}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          iconType="circle"
                          wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>

              {/* Complete lists breakdown card - Right */}
              <Card className="bg-white border-[#E5E7EB] shadow-xs rounded-[28px] p-8 lg:col-span-5 flex flex-col justify-between" id="card-overview-breakdown-list">
                <div className="space-y-1 border-b border-gray-100 pb-4">
                  <h3 className="text-base font-bold text-slate-950">Composição Detalhada</h3>
                  <p className="text-[11px] text-gray-400">Sumário completo das variáveis atualmente ativas no sistema.</p>
                </div>

                <div className="space-y-4 py-5 flex-1 divide-y divide-gray-100 text-xs">
                  
                  <div className="pt-3 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Custos Fixos Mensais</span>
                    <div className="grid grid-cols-2 gap-y-1.5 text-slate-600">
                      <span>Aluguel Veículos:</span>
                      <span className="font-mono text-right font-bold text-slate-900">R$ {(financial.fixedCosts.vehicleRental || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Salários Ativos:</span>
                      <span className="font-mono text-right font-bold text-slate-900">R$ {(financial.fixedCosts.salaries || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Aluguel Sede:</span>
                      <span className="font-mono text-right font-bold text-slate-900">R$ {(financial.fixedCosts.rent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Combustível mensal:</span>
                      <span className="font-mono text-right font-bold text-slate-900">R$ {(financial.fixedCosts.fuel || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Seguros:</span>
                      <span className="font-mono text-right font-bold text-slate-900">R$ {(financial.fixedCosts.insurance || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Outros Custos:</span>
                      <span className="font-mono text-right font-bold text-slate-900">R$ {(financial.fixedCosts.other || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  <div className="pt-4 space-y-2">
                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Custos Variáveis por Serviço</span>
                    <div className="grid grid-cols-2 gap-y-1.5 text-slate-600">
                      <span>Média Produtos/Serviço:</span>
                      <span className="font-mono text-right font-bold text-slate-900">R$ {(financial.variableCosts.productsPerService || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Valor Mão de Obra Hora:</span>
                      <span className="font-mono text-right font-bold text-slate-900">R$ {(financial.variableCosts.laborPerHour || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      <span>Depreciação de Equipamento/mês:</span>
                      <span className="font-mono text-right font-bold text-slate-900">R$ {(financial.variableCosts.equipmentDepreciation || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                </div>

                <div className="pt-4 border-t border-gray-100 flex gap-2">
                  <Button
                    id="btn-goto-costs-tab"
                    type="button"
                    onClick={() => setActiveTab('costs')}
                    className="w-full text-[10px] font-bold uppercase tracking-wider h-11 bg-slate-100 text-slate-950 hover:bg-slate-200 rounded-xl"
                  >
                    Alterar Parâmetros Manualmente
                  </Button>
                </div>
              </Card>

            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
