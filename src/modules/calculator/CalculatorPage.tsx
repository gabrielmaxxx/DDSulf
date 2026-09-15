import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSystemStore } from '@/store';
import { getPOPForService, calculateProductsForArea } from '@/utils/popUtils';
import { GOOGLE_MAPS_API_KEY } from '@/config/maps';
import { fetchGoogleMapsDistance } from '@/utils/distanceUtils';
import { calcularPrecoPorMarkup } from '@/calculator/calculations/pricingEngine';
import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity, UrgencyLevel } from '@/types/database';
import { 
  Users, 
  Beaker, 
  Home, 
  Store, 
  Factory, 
  Building2, 
  FileText, 
  Shield, 
  ClipboardCheck, 
  RefreshCw, 
  ChevronRight, 
  Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/card';
import { formatBRL } from '@/utils/format';
import { estimateDistanceOffline } from '@/utils/geo';

// Subcomponentes por passo e diálogos de ação secundária
import { CalculatorStepClient } from './components/CalculatorStepClient';
import { CalculatorStepService } from './components/CalculatorStepService';
import { CalculatorStepEnvironment } from './components/CalculatorStepEnvironment';
import { CalculatorStepArea } from './components/CalculatorStepArea';
import { CalculatorStepComplexity } from './components/CalculatorStepComplexity';
import { CalculatorStepResult } from './components/CalculatorStepResult';
import { PopDetailDialog } from './components/PopDetailDialog';
import { ShareQuoteDialog } from './components/ShareQuoteDialog';

export { estimateDistanceOffline };

// Unified type-safe currency formatting helper for pt-BR compliance using the unified utility
function formatCurrency(val: number): string {
  return formatBRL(val).replace('R$', '').trim();
}

const PESTS_LIST = [
  { value: 'baratas', label: 'Controle de Baratas', defaultService: 'dedetizacao' },
  { value: 'formigas', label: 'Controle de Formigas', defaultService: 'dedetizacao' },
  { value: 'ratos', label: 'Controle de Roedores', defaultService: 'desratizacao' },
  { value: 'cupins', label: 'Controle de Cupins', defaultService: 'descupinizacao' },
  { value: 'escorpioes', label: 'Controle de Escorpiões', defaultService: 'dedetizacao' },
  { value: 'outros', label: 'Outros', defaultService: 'controle_integrado' }
];

const SERVICES_LIST = [
  { value: 'dedetizacao', label: 'Dedetização' },
  { value: 'desratizacao', label: 'Desratização' },
  { value: 'descupinizacao', label: 'Descupinização' },
  { value: 'sanitizacao', label: 'Sanitização' },
  { value: 'controle_integrado', label: 'Controle Integrado' }
];

const PROPERTY_TYPES = [
  { value: 'Residencial', label: 'Residencial', icon: Home, desc: 'Casas, apartamentos ou quintais particulares.' },
  { value: 'Comercial', label: 'Comercial', icon: Store, desc: 'Lojas, escritórios, restaurantes ou clínicas.' },
  { value: 'Industrial', label: 'Industrial', icon: Factory, desc: 'Galpões, indústrias, depósitos e áreas de logística.' },
  { value: 'Condomínio', label: 'Condomínio', icon: Building2, desc: 'Áreas comuns, blocos residenciais ou comerciais.' }
];

const COMPLEXITY_LEVELS = [
  { value: 'Baixa', label: 'Baixa', desc: 'Infestação leve. Tratamento rápido e focado.', status: 'Baixo', comp: 'Simples' },
  { value: 'Média', label: 'Média', desc: 'Infestação moderada. Tratamento padrão e monitoramento contínuo.', status: 'Médio', comp: 'Normal' },
  { value: 'Alta', label: 'Alta', desc: 'Infestação severa. Bloqueio químico de alta potência e barreira.', status: 'Alto', comp: 'Complexo' }
];

const mapPestType = (pest: string): PestType => {
  const mapping: Record<string, PestType> = {
    'baratas': 'Baratas',
    'ratos': 'Ratos',
    'cupins': 'Cupins',
    'formigas': 'Formigas',
    'escorpioes': 'Escorpiões',
    'outros': 'Outros'
  };
  return mapping[pest] || 'Outros';
};

const mapEnvironmentType = (prop: string): EnvironmentType => {
  const mapping: Record<string, EnvironmentType> = {
    'Residencial': 'Residência',
    'Comercial': 'Comércio',
    'Industrial': 'Indústria',
    'Condomínio': 'Condomínio',
    'Outros': 'Área Externa'
  };
  return mapping[prop] || 'Residência';
};

export function CalculatorPage() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { inventory, pops, settings, addQuote, updateQuoteStatus, clients, addClient, addAgendaEvent, quotes, agenda } = useSystemStore();

  const procedures = pops?.procedures || [];
  const products = inventory?.products || [];

  // Safe formatter for object-based and string-based addresses
  const formatClientAddress = (addr: any): string => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    const parts = [
      addr.street,
      addr.number,
      addr.complement,
      addr.neighborhood,
      addr.city,
      addr.state
    ].filter(Boolean);
    return parts.join(', ');
  };

  // Wizard active step: 1: Cliente, 2: Serviço, 3: Ambiente, 4: Área, 5: Complexidade, 6: Resultado
  const [currentStep, setCurrentStep] = useState(1);

  // STEP 1 FIELDS: Client & Search details
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [showClientRegister, setShowClientRegister] = useState(false);
  
  // Custom manual metadata fields
  const [clientName, setClientName] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [distanceKm, setDistanceKm] = useState<number>(0);
  const [travelDurationText, setTravelDurationText] = useState<string>('');
  const [showMapPreview, setShowMapPreview] = useState<boolean>(false);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  // Effect to handle automatic client loading on mount from search parameters (?clientId=...) or location state
  useEffect(() => {
    const clientIdParam = searchParams.get('clientId') || (location.state as any)?.clientId;
    if (clientIdParam && clients && clients.length > 0) {
      const found = clients.find((c: any) => c.id === clientIdParam);
      if (found) {
        setSelectedClient(found);
        setClientName(found.name);
        setClientAddress(formatClientAddress(found.address));
        setClientPhone(found.phone || '');
        setSearchQuery(found.name);
        toast.success(`Cliente "${found.name}" selecionado via fluxo operacional!`);
      }
    } else if ((location.state as any)?.client) {
      const c = (location.state as any).client;
      setSelectedClient(c);
      setClientName(c.name || '');
      setClientAddress(formatClientAddress(c.address));
      setClientPhone(c.phone || '');
      setSearchQuery(c.name || '');
    }
  }, [searchParams, location.state, clients]);

  // STEP 2 FIELDS: Service details
  const [pestType, setPestType] = useState('baratas');
  const [serviceType, setServiceType] = useState('dedetizacao');

  // STEP 3 FIELDS: Environment details
  const [propertyType, setPropertyType] = useState('Residencial');

  // STEP 4 FIELDS: Area details
  const [areaM2, setAreaM2] = useState<number>(100);

  // STEP 5 FIELDS: Complexity details
  const [selectedComplexityLevel, setSelectedComplexityLevel] = useState('Média');
  const [infestationLevel, setInfestationLevel] = useState<InfestationLevel>('Médio');
  const [complexity, setComplexity] = useState<OperationalComplexity>('Normal');

  // Extras pricing parameters
  const [technicians, setTechnicians] = useState<number>(1);
  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [recurrence, setRecurrence] = useState<'Único' | 'Mensal' | 'Trimestral' | 'Semestral' | 'Anual'>('Único');
  const [customMargin, setCustomMargin] = useState<number>(35);

  // Memoized historical statistics of the selected customer for context-aware calculator display
  const clientStats = React.useMemo(() => {
    if (!selectedClient) return null;
    const clientQuotes = (quotes?.list || []).filter((q: any) => q.clientId === selectedClient.id && q.status !== 'rascunho');
    const totalBilled = clientQuotes.reduce((acc, q) => acc + (q.pricing?.finalPrice || 0), 0);
    const avgTicket = clientQuotes.length > 0 ? totalBilled / clientQuotes.length : 0;
    
    // Last completed service
    const clientServices = (agenda || []).filter(e => e.clientId === selectedClient.id);
    const lastServiceObj = clientServices.length > 0 ? clientServices[clientServices.length - 1] : null;
    const lastService = lastServiceObj ? `${lastServiceObj.title} (${lastServiceObj.date})` : 'Sem registros anteriores';

    // Active warranty check
    const activeWarranty = clientQuotes.some((q: any) => q.status === 'enviado') ? 'Ativa (120 dias)' : 'Nenhuma garantia ativa';

    return {
      totalBilled,
      avgTicket,
      lastService,
      activeWarranty
    };
  }, [selectedClient, quotes, agenda]);

  // Matched POP & modal states
  const [matchedPop, setMatchedPop] = useState<any>(null);
  const [showPopDetailModal, setShowPopDetailModal] = useState(false);

  // Pricing result formulation
  const [finalPrice, setFinalPrice] = useState<number>(0);
  const [isPriceManuallyEdited, setIsPriceManuallyEdited] = useState(false);

  // Modal shares state
  const [showShareModal, setShowShareModal] = useState(false);
  const [generatedQuotePayload, setGeneratedQuotePayload] = useState<any>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [serviceGeneratedStatus, setServiceGeneratedStatus] = useState(false);

  // Synchronize target margin with database defaults on mount
  useEffect(() => {
    const targetVal = settings?.operationalGoals?.targetMarginPercent ?? 35;
    setCustomMargin(targetVal);
  }, [settings?.operationalGoals?.targetMarginPercent]);

  // Handle automatic POP binding based on selected parameters
  useEffect(() => {
    const pop = getPOPForService(pestType, serviceType, procedures);
    setMatchedPop(pop);
  }, [pestType, serviceType, procedures]);

  // Calculate distance reactively on address variables change with Google Maps API Distance Matrix integration & offline fallback
  useEffect(() => {
    if (!clientAddress.trim()) {
      setDistanceKm(0);
      setTravelDurationText('');
      return;
    }
    const hq = settings?.headquartersAddress || 'Rua 33, 120 - Vila Santa Cecília, Volta Redonda - RJ';
    // Immediate offline heuristic fallback
    const offlineDist = estimateDistanceOffline(hq, clientAddress);
    setDistanceKm(offlineDist);

    // Asynchronously call Google Maps Distance Matrix API with automatic offline fallback handling
    let isCancelled = false;
    fetchGoogleMapsDistance(hq, clientAddress, GOOGLE_MAPS_API_KEY)
      .then(result => {
        if (!isCancelled && result.distanceKm > 0) {
          setDistanceKm(result.distanceKm);
          if (result.durationText) {
            setTravelDurationText(result.durationText);
          }
        }
      })
      .catch(err => {
        console.warn('Google Maps Distance Matrix automatic calculation error, preserving offline estimate:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [clientAddress, settings?.headquartersAddress]);

  // Live clients search logic
  const filteredClients = searchQuery.trim() === ''
    ? []
    : (clients || []).filter(c => 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        (c.cnpjCpf && c.cnpjCpf.includes(searchQuery))
      );

  // Select existing client action
  const handleSelectClient = (c: any) => {
    setSelectedClient(c);
    setClientName(c.name);
    setClientAddress(formatClientAddress(c.address));
    setClientPhone(c.phone);
    setSearchQuery('');
    setShowClientRegister(false);
    toast.success(`Cliente ${c.name} selecionado!`, {
      description: `Roteirização e preços atualizados baseado no endereço do cadastro.`
    });
  };

  // Register new client in systemStore
  const handleRegisterClient = () => {
    if (!clientName.trim()) {
      toast.error('Informe o nome do cliente para cadastrar.');
      return;
    }
    if (!clientAddress.trim()) {
      toast.error('Informe o endereço do cliente.');
      return;
    }

    const newClientId = `c-${Math.random().toString(36).substring(2, 11)}`;
    const newClientObj: any = {
      id: newClientId,
      name: clientName.trim(),
      cnpjCpf: '⚠️ NÃO INFORMADO',
      address: clientAddress.trim(),
      phone: clientPhone.trim() || '⚠️ NÃO INFORMADO',
      email: '⚠️ NÃO INFORMADO',
      createdAt: new Date().toISOString().split('T')[0]
    };

    addClient(newClientObj);
    setSelectedClient(newClientObj);
    setShowClientRegister(false);
    toast.success('Cliente cadastrado com sucesso!', {
      description: 'Cliente salvo no banco de dados e selecionado para o orçamento.'
    });
  };

  // Trigger Google Maps route finder
  const handleCalculateDistance = async () => {
    if (!clientAddress.trim()) {
      toast.error('Informe o endereço de destino para calcular a rota.');
      return;
    }

    const hq = settings?.headquartersAddress || 'Rua 33, 120 - Vila Santa Cecília, Volta Redonda - RJ';
    setIsCalculatingDistance(true);

    const result = await fetchGoogleMapsDistance(hq, clientAddress, GOOGLE_MAPS_API_KEY);
    setDistanceKm(result.distanceKm);
    if (result.durationText) setTravelDurationText(result.durationText);

    if (result.source === 'google') {
      toast.success('Distância Roteirizada via Google Maps!', {
        description: `Total: ${result.distanceKm} km ${result.durationText ? `(${result.durationText})` : ''}. Ida & Volta: ${(result.distanceKm * 2).toFixed(1)} km.`
      });
    } else {
      toast.info('Distância Estimada (Heurística Geográfica)', {
        description: `Partida: Sede (${hq})\nDestino: ${clientAddress}\nTotal: ${result.distanceKm} km.`
      });
    }
    setIsCalculatingDistance(false);
  };

  // 1. PRODUCTS CALCULATION & COSTS INGESTION
  const calculatedProducts = matchedPop ? calculateProductsForArea(matchedPop, areaM2) : [];
  
  const productsWithStockCosts = calculatedProducts.map(p => {
    const originalProd = products.find(op => op.id === p.productId);
    const availableQty = originalProd ? originalProd.quantity : 0;
    const costPerUnit = originalProd ? originalProd.costPerUnit : 0;
    const totalCost = parseFloat((p.quantity * costPerUnit).toFixed(2));
    const isInsufficient = p.quantity > availableQty;

    return {
      ...p,
      availableQty,
      costPerUnit,
      totalCost,
      isInsufficient
    };
  });

  // Safe checks for stock shortage
  const isStockOk = productsWithStockCosts.length === 0 || !productsWithStockCosts.some(p => p.isInsufficient);

  // Setup markup engine parameters
  const markupSettings = {
    costPerHour: Number(settings?.operationalGoals?.costPerHour ?? 45),
    costPerKm: Number(settings?.operationalGoals?.costPerKm ?? 2.40),
    baseEquipmentAmortization: Number(settings?.operationalGoals?.equipmentAmortization ?? 35),
    despesasVariaveisPercent: Number(settings?.operationalGoals?.variableExpensesPercent ?? 15),
    margemAlvoPercent: Number(settings?.operationalGoals?.targetMarginPercent ?? 35),
    margemMinimaPercent: Number(settings?.operationalGoals?.minMarginPercent ?? 20),
  };

  const selectedProductsMapped = productsWithStockCosts.map(p => {
    const popProd = matchedPop?.requiredProducts?.find(rp => rp.productId === p.productId);
    const qtyPer100 = popProd ? popProd.quantityPer100m2 : 0;
    const dosagePerM2 = parseFloat((qtyPer100 / 100).toFixed(6));

    return {
      id: p.productId,
      name: p.productName,
      dosagePerM2: dosagePerM2,
      unitCost: p.costPerUnit,
      unitLabel: p.unit as 'ml' | 'g',
      amountUsed: p.quantity,
      totalCost: p.totalCost
    };
  });

  const pricingInputs = {
    clientName: clientName || 'Cliente Proposto',
    pestType: mapPestType(pestType),
    environmentType: mapEnvironmentType(propertyType),
    areaSize: areaM2,
    infestationLevel,
    complexity,
    displacement: distanceKm,
    technicians,
    urgency,
    recurrence,
    selectedProducts: selectedProductsMapped,
    customMargin: customMargin,
  };

  const pricingResult = calcularPrecoPorMarkup(pricingInputs, markupSettings);

  const totalProductsCost = pricingResult.cdv.produtos;
  const totalLaborCost = pricingResult.cdv.maoDeObra;
  const totalTransportCost = pricingResult.cdv.transporte;
  const totalOverheadCost = pricingResult.cdv.equipamentos;
  const totalCosts = pricingResult.cdv.total;
  
  const estimatedHours = pricingResult.estimatedTimeHours;
  const suggestedPrice = pricingResult.precoFinalSugerido;

  // Reactively assign final price from suggestion when dependencies change
  useEffect(() => {
    if (!isPriceManuallyEdited) {
      setFinalPrice(suggestedPrice);
    }
  }, [suggestedPrice, isPriceManuallyEdited]);

  // Adjust margin calculations dynamically
  const resultingMargin = finalPrice > 0 
    ? ((finalPrice * (1 - markupSettings.despesasVariaveisPercent / 100) - totalCosts) / finalPrice) * 100 
    : 0;

  const isMarginHealthy = resultingMargin >= markupSettings.margemMinimaPercent;

  // Handles wizard navigation validation
  const validateStepAndGoNext = () => {
    if (currentStep === 1) {
      if (!clientName.trim()) {
        toast.error('Informe o nome do cliente ou selecione um cadastro.');
        return;
      }
      if (!clientAddress.trim()) {
        toast.error('Endereço completo é obrigatório.');
        return;
      }
    }
    if (currentStep === 4) {
      if (areaM2 <= 0 || isNaN(areaM2)) {
        toast.error('Digite um valor maior que 0 para a área.');
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 6));
  };

  // Submit quote state changes
  const handleSaveQuote = (status: 'rascunho' | 'enviado') => {
    const quoteId = `qto-${Math.random().toString(36).substring(2, 11)}`;
    const newQuote: any = {
      id: quoteId,
      createdAt: new Date().toISOString(),
      status: status,
      client: {
        name: clientName.trim(),
        address: clientAddress.trim(),
        phone: clientPhone.trim() || undefined
      },
      service: {
        pestType: pestType,
        serviceType: serviceType,
        areaM2: areaM2,
        distanceKm: distanceKm
      },
      costs: {
        products: totalProductsCost,
        labor: totalLaborCost,
        transport: totalTransportCost,
        overhead: totalOverheadCost,
        total: totalCosts
      },
      pricing: {
        suggestedPrice: suggestedPrice,
        finalPrice: Number(finalPrice),
        marginPercent: parseFloat(resultingMargin.toFixed(1))
      },
      productsUsed: productsWithStockCosts.map(p => ({
        productId: p.productId,
        productName: p.productName,
        quantity: p.quantity,
        unit: p.unit
      })),
      inventoryDeducted: false
    };

    addQuote(newQuote);

    if (status === 'rascunho') {
      toast.success('Rascunho criado com sucesso!', {
        description: `Orçamento #${quoteId} para "${clientName}" salvo em rascunhos.`
      });
      resetAllForm();
    } else {
      setGeneratedQuotePayload(newQuote);
      setServiceGeneratedStatus(false);
      setShowShareModal(true);
      toast.success('Orçamento Gerado com Sucesso!', {
        description: `Orçamento #${quoteId} gravado no sistema com status Enviado.`
      });
    }
  };

  // Flow integration creating direct agenda task: "Gerar Serviço"
  const handleCreateAgendaServiceFromQuote = () => {
    if (!generatedQuotePayload) return;
    const q = generatedQuotePayload;
    
    const targetPestLabel = PESTS_LIST.find(p => p.value === q.service.pestType)?.label || q.service.pestType;
    const eventId = `ev-${Math.random().toString(36).substring(2, 11)}`;
    
    addAgendaEvent({
      id: eventId,
      title: `Ordem de Serviço - ${targetPestLabel}`,
      date: new Date().toISOString().split('T')[0],
      clientId: selectedClient?.id || 'c-proposto',
      clientName: q.client.name,
      type: 'servico',
      quoteId: q.id,
      status: 'pendente',
      notes: `Ordem de Serviço gerada a partir do orçador guiado. Área: ${q.service.areaM2} m² no endereço: ${q.client.address}`,
      time: '08:00'
    });

    if (q.id) {
      updateQuoteStatus(q.id, 'aprovado');
    }

    setServiceGeneratedStatus(true);
    toast.success('Serviço gerado e agendado como pendente!', {
      description: 'Ordem de serviço cadastrada na agenda operacional como pendente de execução.'
    });
  };

  const resetAllForm = () => {
    setClientName('');
    setClientAddress('');
    setClientPhone('');
    setSelectedClient(null);
    setSearchQuery('');
    setDistanceKm(0);
    setAreaM2(100);
    setPestType('baratas');
    setServiceType('dedetizacao');
    setPropertyType('Residencial');
    setSelectedComplexityLevel('Média');
    setInfestationLevel('Médio');
    setComplexity('Normal');
    setIsPriceManuallyEdited(false);
    setCurrentStep(1);
    setServiceGeneratedStatus(false);
  };

  // Create WhatsApp message string templates
  const getShareableText = () => {
    if (!generatedQuotePayload) return '';
    const q = generatedQuotePayload;
    const pestName = PESTS_LIST.find(p => p.value === q.service.pestType)?.label || q.service.pestType;
    const serviceName = SERVICES_LIST.find(s => s.value === q.service.serviceType)?.label || q.service.serviceType;

    return `📄 *ORÇAMENTO DE CONTROLE SANITÁRIO - PestFlow*
----------------------------------------
*🛒 ID ORÇAMENTO:* #${q.id}
*👤 CLIENTE:* ${q.client.name}
*📍 ENDEREÇO:* ${q.client.address}
${q.client.phone ? `*📞 CONTATO:* ${q.client.phone}\n` : ''}
----------------------------------------
*🛠️ SERVIÇO PROPOSTO:*
- Tecnologia: ${serviceName}
- Praga Alvo: ${pestName}
- Área Dimensionada: ${q.service.areaM2} m²
- Estimativa Operacional de Duração: ${estimatedHours} Horas

*📦 INSUMOS MAPEADOS:*
${q.productsUsed.map((p: any) => `• ${p.productName}: ${p.quantity} ${p.unit}`).join('\n') || '• Procedimento químico perimetral geral sinérgico'}

----------------------------------------
*💰 VALOR TOTAL INVESTIMENTO:* R$ ${formatCurrency(q.pricing.finalPrice)}
*🛡️ GARANTIA TÉCNICA:* 90 dias com auditoria regulatória e fiscal.

*PestFlow Inteligência Sanitária Integrada*`;
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(getShareableText());
    setIsCopied(true);
    toast.success('Proposta copiada para a área de transferência!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Details for specific step warnings
  const progressSteps = [
    { number: 1, label: 'Cliente' },
    { number: 2, label: 'Serviço' },
    { number: 3, label: 'Ambiente' },
    { number: 4, label: 'Área' },
    { number: 5, label: 'Complexidade' },
    { number: 6, label: 'Resultado' }
  ];

  const resolvedCityName = clientAddress 
    ? clientAddress.split('-')[1]?.trim() || clientAddress.split(',')[1]?.trim() || 'Cidade Sede' 
    : 'Cidade Sede';

  return (
    <div className="space-y-6 pb-16 w-full max-w-7xl mx-auto px-4 sm:px-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* TOPO DA TELA */}
      <header className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight" id="screen-title">
            Calculadora
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Crie orçamentos padronizados com base nos custos operacionais.
          </p>
        </div>
        <button
          onClick={resetAllForm}
          className="self-start md:self-auto px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <RefreshCw className="size-3.5" />
          <span>Reiniciar Fluxo</span>
        </button>
      </header>

      {/* INDICADOR DE PROGRESSO */}
      <section className="bg-white border border-slate-150 p-4 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">Progresso</span>
            <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 transition-all duration-300 rounded-full" 
                style={{ width: `${(currentStep / 6) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#1B3A2D]">{currentStep}/6</span>
          </div>

          {/* Steps Indicator row */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full md:w-auto">
            {progressSteps.map((s) => {
              const isActive = currentStep === s.number;
              const isCompleted = currentStep > s.number;
              return (
                <button
                  key={s.number}
                  disabled={s.number > currentStep && !clientName}
                  onClick={() => setCurrentStep(s.number)}
                  className={`px-2 py-1.5 rounded-lg text-center transition-all cursor-pointer flex flex-col items-center justify-center border text-[10px] uppercase font-bold tracking-wider ${
                    isActive 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-xs ring-1 ring-emerald-400/20' 
                      : isCompleted 
                        ? 'bg-slate-50 text-emerald-600 border-slate-200 hover:bg-emerald-50/20'
                        : 'bg-transparent text-slate-400 border-transparent opacity-60 cursor-not-allowed'
                  }`}
                >
                  <span className="leading-none">{s.number}. {s.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CORE GRID 70% / 30% */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
        
        {/* COLUNA ESQUERDA - FLUXO DE PREENCHIMENTO (70%) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-150 rounded-3xl shadow-sm overflow-hidden min-h-[380px] flex flex-col justify-between">
            
            {/* Header do passo */}
            <div className="bg-slate-50/80 border-b border-slate-100 px-6 py-4.5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-[#1B3A2D] text-white flex items-center justify-center shadow-xs">
                  {currentStep === 1 && <Users className="size-4" />}
                  {currentStep === 2 && <Beaker className="size-4" />}
                  {currentStep === 3 && <Home className="size-4" />}
                  {currentStep === 4 && <FileText className="size-4" />}
                  {currentStep === 5 && <Shield className="size-4" />}
                  {currentStep === 6 && <ClipboardCheck className="size-4" />}
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase text-[#1B3A2D] tracking-wider">Etapa {currentStep} de 6</span>
                  <h3 className="text-base font-black text-slate-800 tracking-tight leading-none mt-0.5">
                    {currentStep === 1 && 'Efetuar Vínculo do Cliente'}
                    {currentStep === 2 && 'Mapeamento do Tipo de Serviço'}
                    {currentStep === 3 && 'Mapeamento de Ambiente'}
                    {currentStep === 4 && 'Dimensão de Área'}
                    {currentStep === 5 && 'Complexidade & Atendimento'}
                    {currentStep === 6 && 'Resultado / Composição de Preço'}
                  </h3>
                </div>
              </div>

              {/* Status helper label */}
              <span className="text-[11px] font-mono font-bold text-slate-400 bg-white border border-slate-150 rounded-md px-2 py-0.5">
                PestFlow Orçador
              </span>
            </div>

            {/* Conteúdo do passo */}
            <div className="p-6 sm:p-8 flex-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* ETAPA 1: CLIENTE */}
                  {currentStep === 1 && (
                    <CalculatorStepClient
                      clientName={clientName}
                      setClientName={setClientName}
                      clientPhone={clientPhone}
                      setClientPhone={setClientPhone}
                      clientAddress={clientAddress}
                      setClientAddress={setClientAddress}
                      selectedClient={selectedClient}
                      setSelectedClient={setSelectedClient}
                      searchQuery={searchQuery}
                      setSearchQuery={setSearchQuery}
                      filteredClients={filteredClients}
                      handleSelectClient={handleSelectClient}
                      showClientRegister={showClientRegister}
                      setShowClientRegister={setShowClientRegister}
                      handleRegisterClient={handleRegisterClient}
                      distanceKm={distanceKm}
                      travelDurationText={travelDurationText}
                      isCalculatingDistance={isCalculatingDistance}
                      handleCalculateDistance={handleCalculateDistance}
                      showMapPreview={showMapPreview}
                      setShowMapPreview={setShowMapPreview}
                      clientStats={clientStats}
                      resolvedCityName={resolvedCityName}
                      headquartersAddress={settings?.headquartersAddress}
                    />
                  )}

                  {/* ETAPA 2: TIPO DE SERVIÇO */}
                  {currentStep === 2 && (
                    <CalculatorStepService
                      pestType={pestType}
                      setPestType={setPestType}
                      serviceType={serviceType}
                      setServiceType={setServiceType}
                      pestsList={PESTS_LIST}
                      servicesList={SERVICES_LIST}
                    />
                  )}

                  {/* ETAPA 3: AMBIENTE */}
                  {currentStep === 3 && (
                    <CalculatorStepEnvironment
                      propertyType={propertyType}
                      setPropertyType={setPropertyType}
                      propertyTypes={PROPERTY_TYPES}
                    />
                  )}

                  {/* ETAPA 4: ÁREA */}
                  {currentStep === 4 && (
                    <CalculatorStepArea
                      areaM2={areaM2}
                      setAreaM2={setAreaM2}
                    />
                  )}

                  {/* ETAPA 5: COMPLEXIDADE */}
                  {currentStep === 5 && (
                    <CalculatorStepComplexity
                      selectedComplexityLevel={selectedComplexityLevel}
                      setSelectedComplexityLevel={setSelectedComplexityLevel}
                      setInfestationLevel={setInfestationLevel}
                      setComplexity={setComplexity}
                      complexityLevels={COMPLEXITY_LEVELS}
                    />
                  )}

                  {/* ETAPA 6: RESULTADO (FORMULATION CONTROLS) */}
                  {currentStep === 6 && (
                    <CalculatorStepResult
                      suggestedPrice={suggestedPrice}
                      finalPrice={finalPrice}
                      setFinalPrice={setFinalPrice}
                      isPriceManuallyEdited={isPriceManuallyEdited}
                      setIsPriceManuallyEdited={setIsPriceManuallyEdited}
                      formatCurrency={formatCurrency}
                      clientName={clientName}
                      handleSaveQuote={handleSaveQuote}
                      customMargin={customMargin}
                      setCustomMargin={setCustomMargin}
                      pricingResult={pricingResult}
                      markupSettings={markupSettings}
                      resultingMargin={resultingMargin}
                      totalProductsCost={totalProductsCost}
                      totalTransportCost={totalTransportCost}
                      totalLaborCost={totalLaborCost}
                      totalOverheadCost={totalOverheadCost}
                      totalCosts={totalCosts}
                      productsWithStockCosts={productsWithStockCosts}
                      technicians={technicians}
                      setTechnicians={setTechnicians}
                      urgency={urgency}
                      setUrgency={setUrgency}
                      recurrence={recurrence}
                      setRecurrence={setRecurrence}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Rodapé da tela com as ações guiadas */}
            <div className="bg-slate-50 border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
                >
                  &larr; Voltar
                </button>
              ) : (
                <div />
              )}

              {currentStep < 6 ? (
                <button
                  type="button"
                  onClick={validateStepAndGoNext}
                  className="px-6 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                >
                  <span>Avançar</span>
                  <ChevronRight className="size-3.5" />
                </button>
              ) : (
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => handleSaveQuote('rascunho')}
                    disabled={!clientName}
                    className="flex-1 sm:flex-none px-4.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Salvar Rascunho
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveQuote('enviado')}
                    disabled={!clientName}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Gerar Orçamento
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* COLUNA DIREITA - RESUMO EM TEMPO REAL (30%) - FIXED / PERSISTENT ON DESKTOP */}
        <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-6">
          <Card className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-6">
            
            {/* Header do resumo */}
            <div>
              <h4 className="text-xs font-black text-[#1B3A2D] tracking-widest uppercase">Resumo do Orçamento</h4>
              <p className="text-[10px] font-medium text-slate-400 mt-1">Status operacional em tempo real.</p>
            </div>

            {/* Dynamic details parameters listing */}
            <div className="space-y-4">
              
              {/* Variable: Cliente */}
              <div className="flex items-start justify-between gap-3 text-xs">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400 block">Cliente</span>
                  <span className="font-extrabold text-slate-800 leading-snug">
                    {clientName || <span className="text-amber-600 font-bold italic">⚠️ Selecione um cliente</span>}
                  </span>
                </div>
              </div>

              {/* Variable: Serviço */}
              <div className="flex items-center justify-between text-xs border-t border-slate-100/50 pt-2.5">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Serviço</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {PESTS_LIST.find(p => p.value === pestType)?.label || 'PestFlow Tratamento'}
                  </p>
                </div>
              </div>

              {/* Variable: Área */}
              <div className="flex items-center justify-between text-xs border-t border-slate-100/50 pt-2.5">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Área</span>
                  <p className="font-extrabold text-[#1B3A2D] font-mono mt-0.5">
                    {areaM2 ? `${areaM2} m²` : <span className="text-amber-600 font-bold italic">⚠️ Não informada</span>}
                  </p>
                </div>
              </div>

              {/* Variable: Complexidade */}
              <div className="flex items-center justify-between text-xs border-t border-slate-100/50 pt-2.5">
                <div>
                  <span className="text-[9px] font-bold uppercase text-slate-400">Complexidade</span>
                  <p className="font-extrabold text-slate-800 mt-0.5">
                    {selectedComplexityLevel} ({complexity})
                  </p>
                </div>
              </div>

              {/* SEPARADOR DIVISOR */}
              <div className="border-t border-slate-200 my-4" />

              {/* DETALHES FINANCEIROS DE CUSTO */}
              <div className="space-y-2 text-[11px] font-mono font-bold text-slate-600">
                <div className="text-center font-sans uppercase font-black text-[9px] text-slate-400 tracking-wider mb-2 text-left">
                  Custos Operacionais
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Produtos:</span>
                  <span className="text-slate-800">R$ {formatCurrency(totalProductsCost)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Deslocamento:</span>
                  <span className="text-slate-800">R$ {formatCurrency(totalTransportCost)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Mão de Obra:</span>
                  <span className="text-slate-800">R$ {formatCurrency(totalLaborCost)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span>Outros Custos:</span>
                  <span className="text-slate-800">R$ {formatCurrency(totalOverheadCost)}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 font-extrabold text-[#1B3A2D]">
                  <span>Total de Custos:</span>
                  <span>R$ {formatCurrency(totalCosts)}</span>
                </div>

                <div className="flex justify-between items-center border-t border-slate-100 pt-1.5 font-extrabold">
                  <span className="text-slate-600 font-sans">Margem Final:</span>
                  <span className={`${isMarginHealthy ? 'text-emerald-700' : 'text-red-600'}`}>
                    {resultingMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* DETALHE DE PREÇO RECOMENDADO EM DESTAQUE */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Preço Recomendado</span>
              <span className="text-2xl font-black text-[#1B3A2D] block font-mono">
                R$ {formatCurrency(finalPrice)}
              </span>
            </div>

            {/* INTEGRAÇÕES VISUAIS */}
            <div className="space-y-3 pt-4 border-t border-slate-150">
              
              {/* POP VINCULADO AUTOMÁTICO */}
              <div className="bg-emerald-50/20 border border-emerald-150/40 rounded-xl p-3 text-left">
                <span className="text-[8px] font-black uppercase text-emerald-700 tracking-wider block mb-1">POP Vinculado</span>
                <p className="text-[10px] font-bold text-slate-800 leading-snug truncate">
                  {matchedPop ? matchedPop.name : 'Nenhum POP Ativo'}
                </p>
                {matchedPop && (
                  <button
                    type="button"
                    onClick={() => setShowPopDetailModal(true)}
                    className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-900 text-[10px] font-black uppercase tracking-wider mt-1.5 cursor-pointer leading-none"
                  >
                    <Eye className="size-3" />
                    <span>Ver POP Completo</span>
                  </button>
                )}
              </div>

              {/* ESTOQUE STATUS COM ÍCONES */}
              <div className={`p-3 rounded-xl text-left border flex items-center justify-between text-[11px] font-bold ${
                isStockOk 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                <span>Disponibilidade Estoque</span>
                <span className="font-extrabold tracking-tight">
                  {isStockOk ? '🟢 Estoque OK' : '🔴 Estoque insuficiente'}
                </span>
              </div>

            </div>

          </Card>
        </div>

      </div>

      {/* POP PROCEDURAL DETAIL OFFICIAL DIALOG */}
      <PopDetailDialog
        open={showPopDetailModal}
        onOpenChange={setShowPopDetailModal}
        matchedPop={matchedPop}
        productsWithStockCosts={productsWithStockCosts}
        estimatedHours={estimatedHours}
      />

      {/* SHARING FORM OFFICIAL DIALOG */}
      <ShareQuoteDialog
        open={showShareModal}
        onOpenChange={setShowShareModal}
        generatedQuotePayload={generatedQuotePayload}
        shareableText={getShareableText()}
        isCopied={isCopied}
        handleCopyText={handleCopyText}
        serviceGeneratedStatus={serviceGeneratedStatus}
        handleCreateAgendaServiceFromQuote={handleCreateAgendaServiceFromQuote}
        selectedClient={selectedClient}
        onNavigateToClient={() => {
          setShowShareModal(false);
          resetAllForm();
          if (selectedClient?.id) {
            navigate(`/clientes?clientId=${selectedClient.id}`);
          }
        }}
        onCloseAndReset={() => {
          setShowShareModal(false);
          resetAllForm();
        }}
      />

    </div>
  );
}
