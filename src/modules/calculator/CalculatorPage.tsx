import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useSystemStore } from '@/store';
import { Button } from '@/components/ui/button';
import { getPOPForService, calculateProductsForArea } from '@/utils/popUtils';
import { GOOGLE_MAPS_API_KEY } from '@/config/maps';
import { GoogleMapsViewer } from '@/components/GoogleMapsViewer';
import { fetchGoogleMapsDistance } from '@/utils/distanceUtils';
import { calcularPrecoPorMarkup } from '@/calculator/calculations/pricingEngine';
import { PestType, EnvironmentType, InfestationLevel, OperationalComplexity, UrgencyLevel } from '@/types/database';
import { 
  MapPin, 
  Search, 
  Sparkles, 
  Beaker, 
  Clock, 
  Truck, 
  ShieldAlert, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Copy, 
  Check, 
  PlusCircle, 
  RefreshCw, 
  Smartphone, 
  ClipboardCheck, 
  DollarSign, 
  Percent, 
  AlertTriangle,
  FileCheck,
  Info,
  Calendar,
  X,
  FileText,
  Users,
  Home,
  Store,
  Factory,
  Building2,
  CheckCircle,
  Eye,
  ArrowRight,
  Shield,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '@/components/ui/card';
import { formatBRL } from '@/utils/format';
import { estimateDistanceOffline } from '@/utils/geo';
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
  { value: 'Industrial', label: 'Industrial', icon: Factory, desc: 'Galpões, industrias, depósitos e áreas de logística.' },
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
  const { financial, inventory, pops, settings, addQuote, updateQuoteStatus, clients, addClient, addAgendaEvent, quotes, agenda } = useSystemStore();

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

  // Synchronize target margin with database defaults on mounts
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

  // Reactively assign final price from suggetion when dependencies change
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

  // Selected client's dynamic statistics or fallback values
  const clientQuotes = quotes?.list?.filter(q => q.client.name.toLowerCase() === clientName.toLowerCase()) || [];
  const latestServiceLabel = clientQuotes.length > 0 
    ? PESTS_LIST.find(p => p.value === clientQuotes[clientQuotes.length - 1].service.pestType)?.label || 'Controle de Pragas'
    : 'Controle de Baratas';
  const resolvedCityName = clientAddress 
    ? clientAddress.split('-')[1]?.trim() || clientAddress.split(',')[1]?.trim() || 'Cidade Sede' 
    : 'Cidade Sede';

  return (
    <div className="space-y-6 pb-16 w-full max-w-7xl mx-auto px-4 sm:px-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-300">
      
      {/* TOPO DA TELA */}
      <header className="pb-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-9 tracking-tight" id="screen-title">
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
                        ? 'bg-slate-50 text-emerald-600 border-slate-250 hover:bg-emerald-50/20'
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
            
            {/* Header del paso */}
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

            {/* Conteúdo del passo */}
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
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Quem receberá o serviço?</h4>
                        <p className="text-xs text-slate-450">Pesquise por clientes cadastrados ou insira um novo perfil operacional.</p>
                      </div>

                      {/* SERCH ZONE */}
                      {!selectedClient && !showClientRegister && (
                        <div className="space-y-4">
                          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">Pesquisar cliente</label>
                          <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4.5 text-slate-400" />
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              placeholder="Digite nome, telefone ou empresa."
                              className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-200 focus:border-emerald-300 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-xs"
                            />
                          </div>

                          {/* Search suggestions lists */}
                          {searchQuery.trim() !== '' && (
                            <div className="border border-slate-150 bg-white rounded-xl shadow-md overflow-hidden divide-y divide-slate-100 max-h-[220px] overflow-y-auto">
                              {filteredClients.length > 0 ? (
                                filteredClients.map(c => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleSelectClient(c)}
                                    className="w-full p-3.5 text-left hover:bg-slate-50/80 transition-colors flex items-center justify-between group cursor-pointer"
                                  >
                                    <div>
                                      <p className="text-xs font-black text-slate-900 group-hover:text-emerald-700 transition-colors">{c.name}</p>
                                      <p className="text-[11px] text-slate-500 mt-1">{c.address} • {c.phone}</p>
                                    </div>
                                    <ChevronRight className="size-4 text-slate-400" />
                                  </button>
                                ))
                              ) : (
                                <div className="p-5 text-center text-slate-500 space-y-2">
                                  <p className="text-xs font-bold text-slate-600">Nenhum cliente cadastrado com esse critério.</p>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setClientName(searchQuery);
                                      setShowClientRegister(true);
                                    }}
                                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 text-xs font-bold cursor-pointer"
                                  >
                                    <UserPlus className="size-3.5" />
                                    <span>Cadastrar "{searchQuery}"</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Placeholder manual fallback trigger buttons */}
                          <div className="pt-2 flex justify-start">
                            <button
                              type="button"
                              onClick={() => setShowClientRegister(true)}
                              className="inline-flex items-center gap-2 px-4 py-2.5 hover:bg-slate-50 border border-slate-250 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs"
                            >
                              <UserPlus className="size-4 text-slate-400" />
                              <span>Cadastrar Cliente</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* DISPLAY SELECTED CUSTOMER CARD */}
                      {selectedClient && !showClientRegister && (
                        <div className="bg-emerald-50/20 border border-emerald-150 p-5 rounded-2xl relative space-y-4">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedClient(null);
                              setClientName('');
                              setClientAddress('');
                              setClientPhone('');
                            }}
                            className="absolute top-4 right-4 p-1.5 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shadow-xs"
                            title="Limpar seleção"
                          >
                            <X className="size-4" />
                          </button>

                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-xs">
                              <Users className="size-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-emerald-700 tracking-wider">Cliente Selecionado</span>
                              <h5 className="text-base font-black text-[#1B3A2D] tracking-tight">{clientName}</h5>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-emerald-100/50 text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-semibold">Telefone</span>
                              <p className="font-extrabold text-slate-700 mt-0.5">{clientPhone || 'Não Informado'}</p>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 uppercase font-semibold">Cidade</span>
                              <p className="font-extrabold text-slate-700 mt-0.5">{resolvedCityName}</p>
                            </div>
                            <div className="col-span-2">
                              <span className="text-[10px] text-slate-500 uppercase font-semibold">Endereço Técnico</span>
                              <p className="font-extrabold text-slate-700 mt-0.5 truncate" title={clientAddress}>{clientAddress}</p>
                            </div>
                          </div>

                          {/* SUBMÓDULO INTEGRADO: HISTÓRICO CONTEXTUAL DO CLIENTE */}
                          {clientStats && (
                            <div className="bg-white/90 border border-emerald-100/60 rounded-xl p-4.5 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs shadow-2xs">
                              <div>
                                <span className="text-[9px] text-[#1B3A2D] uppercase font-black tracking-wider block">Faturamento Total</span>
                                <p className="font-black text-slate-800 mt-1 font-mono text-xs">
                                  R$ {clientStats.totalBilled.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <span className="text-[9px] text-[#1B3A2D] uppercase font-black tracking-wider block">Ticket Médio</span>
                                <p className="font-black text-slate-800 mt-1 font-mono text-xs">
                                  R$ {clientStats.avgTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div>
                                <span className="text-[9px] text-[#1B3A2D] uppercase font-black tracking-wider block">Garantia Ativa</span>
                                <p className="text-slate-700 font-extrabold mt-1.5 flex items-center gap-1.5 leading-none">
                                  <span className={`inline-block size-2 rounded-full ${clientStats.activeWarranty.includes('Ativa') ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                                  <span>{clientStats.activeWarranty}</span>
                                </p>
                              </div>
                              <div>
                                <span className="text-[9px] text-[#1B3A2D] uppercase font-black tracking-wider block">Último Serviço Executado</span>
                                <p className="font-bold text-slate-700 mt-1 truncate" title={clientStats.lastService}>
                                  {clientStats.lastService}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* MANUAL CLIENT REGISTER SLATE FORM */}
                      {showClientRegister && (
                        <div className="bg-slate-50/70 border border-slate-200 p-6 rounded-2xl space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-sm font-black text-slate-800">Cadastrar Novo Cliente</h5>
                              <p className="text-[11px] text-slate-500">Insera os dados necessários e confirme para gerar a precificação.</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowClientRegister(false)}
                              className="text-slate-400 hover:text-slate-600 text-xs font-bold leading-none"
                            >
                              Cancelar
                            </button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Nome do Cliente</label>
                              <input
                                type="text"
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="Condomínio Solar ou Particular"
                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Telefone de Contato</label>
                              <input
                                type="text"
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                placeholder="(24) 99876-5432"
                                className="w-full h-10 px-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <label className="text-[10px] font-bold uppercase text-slate-400 block mb-1.5">Endereço de Atendimento</label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                                  <input
                                    type="text"
                                    value={clientAddress}
                                    onChange={(e) => setClientAddress(e.target.value)}
                                    placeholder="Av. Ipiranga, 6681 - Cidade Sede - RJ"
                                    className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none"
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={handleCalculateDistance}
                                  disabled={!clientAddress.trim() || isCalculatingDistance}
                                  className="px-3 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 rounded-lg text-xs font-bold transition-all flex items-center justify-center cursor-pointer"
                                >
                                  {isCalculatingDistance ? <RefreshCw className="size-3 animate-spin" /> : 'Calcular Rota'}
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="pt-2 flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setShowClientRegister(false)}
                              className="px-4 py-2 bg-white text-slate-500 hover:text-slate-700 text-xs font-bold rounded-lg"
                            >
                              Voltar
                            </button>
                            <button
                              type="button"
                              onClick={handleRegisterClient}
                              className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold rounded-lg transition-colors cursor-pointer shadow-xs"
                            >
                              Salvar e Confirmar
                            </button>
                          </div>
                        </div>
                      )}

                      {/* DISTÂNCIA ESTIMADA & ROTEIRIZAÇÃO GOOGLE MAPS */}
                      {clientAddress.trim() !== '' && (
                        <div className="bg-emerald-50/15 border border-slate-200 p-4 rounded-xl space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs text-emerald-700 shrink-0">
                              <Truck className="size-5" />
                            </div>
                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[9px] font-black uppercase text-emerald-800 tracking-wider">Logística & Roteirização Google Maps</span>
                                <div className="flex items-center gap-1.5">
                                  <Button
                                    type="button"
                                    onClick={handleCalculateDistance}
                                    disabled={isCalculatingDistance}
                                    className="h-7 px-2.5 bg-slate-900 hover:bg-black text-white text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                                  >
                                    <RefreshCw className={`size-3 ${isCalculatingDistance ? 'animate-spin' : ''}`} />
                                    {isCalculatingDistance ? 'Calculando...' : 'Calcular Rota Real'}
                                  </Button>
                                  <Button
                                    type="button"
                                    onClick={() => setShowMapPreview(!showMapPreview)}
                                    className="h-7 px-2.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-[10px] font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                                  >
                                    <MapPin className="size-3 text-emerald-600" />
                                    {showMapPreview ? 'Ocultar Mapa' : 'Ver Mapa'}
                                  </Button>
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-3 pt-1">
                                <p className="text-xs font-bold text-slate-700">
                                  Distância (Um Sentido): <span className="font-extrabold text-slate-900 font-mono text-sm">{distanceKm} km</span>
                                </p>
                                <span className="text-[10px] font-bold text-emerald-900 bg-emerald-100/60 border border-emerald-200/80 rounded px-2 py-0.5 font-mono">
                                  Ida & Volta: {(distanceKm * 2).toFixed(1)} Km
                                </span>
                                {travelDurationText && (
                                  <span className="text-[10px] font-bold text-slate-600 bg-white border border-slate-200 rounded px-2 py-0.5 font-mono">
                                    Tempo Estimado: {travelDurationText}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1 truncate">
                                <span className="font-bold text-slate-900">Sede:</span>
                                <span className="truncate max-w-[180px]" title={settings?.headquartersAddress || 'Sede PestFlow'}>
                                  {settings?.headquartersAddress || 'Sede PestFlow'}
                                </span>
                                <span>&rarr;</span>
                                <span className="font-bold text-slate-800 truncate max-w-[200px]" title={clientAddress}>{clientAddress}</span>
                              </div>
                            </div>
                          </div>

                          {/* Collapsible Interactive Google Maps Route View */}
                          {showMapPreview && (
                            <div className="pt-2 border-t border-slate-200/60">
                              <GoogleMapsViewer
                                address={clientAddress}
                                title={clientName || clientAddress}
                                showRouteFromHq={true}
                                hqAddress={settings?.headquartersAddress || 'Rua 33, 120 - Vila Santa Cecília, Volta Redonda - RJ'}
                                height="220px"
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* ETAPA 2: TIPO DE SERVIÇO */}
                  {currentStep === 2 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Qual serviço será realizado?</h4>
                        <p className="text-xs text-slate-450">Selecione o procedimento de controle de pragas sanitário correspondente.</p>
                      </div>

                      {/* Real dynamic 3-column cards grid as mandated */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {PESTS_LIST.map((p) => {
                          const isSelected = pestType === p.value;
                          return (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => {
                                setPestType(p.value);
                                setServiceType(p.defaultService);
                              }}
                              className={`p-5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between h-[115px] group ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/20 shadow-xs'
                                  : 'border-slate-150 bg-white hover:border-slate-250'
                              }`}
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className={`p-2 rounded-xl border ${
                                  isSelected 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                    : 'bg-slate-50 text-slate-400 border-slate-150 group-hover:bg-slate-100 group-hover:text-slate-700'
                                }`}>
                                  <Beaker className="size-4" />
                                </div>
                                <div className={`size-4 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isSelected 
                                    ? 'border-emerald-600 bg-emerald-600 text-white' 
                                    : 'border-slate-200'
                                }`}>
                                  {isSelected && <Check className="size-2.5 stroke-[4px]" />}
                                </div>
                              </div>
                              <span className={`text-xs font-black uppercase tracking-tight mt-3 ${isSelected ? 'text-[#1B3A2D]' : 'text-slate-800'}`}>
                                {p.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Advanced details config box */}
                      <div className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-slate-700">Ajuste Manual da Tecnologia de Serviço (Opcional):</p>
                          <p className="text-[11px] text-slate-450 font-medium">A alteração da tecnologia impactará as taxas e o rateio operacional.</p>
                        </div>

                        <select
                          value={serviceType}
                          onChange={(e) => setServiceType(e.target.value)}
                          className="px-3.5 py-2 bg-white border border-slate-200 focus:border-emerald-400 rounded-xl text-xs font-bold text-slate-705 focus:outline-none shadow-xs"
                        >
                          {SERVICES_LIST.map((srv) => (
                            <option key={srv.value} value={srv.value}>{srv.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* ETAPA 3: AMBIENTE */}
                  {currentStep === 3 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Qual o tipo de ambiente?</h4>
                        <p className="text-xs text-slate-450">Selecione o enquadramento físico do local onde se dará o tratamento.</p>
                      </div>

                      {/* Cards grandes as requested */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {PROPERTY_TYPES.map((pt) => {
                          const isSelected = propertyType === pt.value;
                          const IconComp = pt.icon;
                          return (
                            <button
                              key={pt.value}
                              type="button"
                              onClick={() => setPropertyType(pt.value)}
                              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-4.5 min-h-[120px] ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/20 shadow-sm'
                                  : 'border-slate-150 bg-white hover:border-slate-250 hover:shadow-xs'
                              }`}
                            >
                              <div className={`p-3 rounded-xl border shrink-0 ${
                                isSelected
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-50 text-slate-450 border-slate-150'
                              }`}>
                                <IconComp className="size-5.5" />
                              </div>
                              <div className="space-y-1.5 flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h5 className={`text-sm font-black uppercase ${isSelected ? 'text-[#1B3A2D]' : 'text-slate-800'}`}>
                                    {pt.label}
                                  </h5>
                                  <span className={`size-3 rounded-full border-2 ${
                                    isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-200'
                                  }`} />
                                </div>
                                <p className="text-xs font-semibold text-slate-500 leading-relaxed">
                                  {pt.desc}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ETAPA 4: ÁREA */}
                  {currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Qual a área estimada?</h4>
                        <p className="text-xs text-slate-450 font-semibold text-slate-500">Mapeie a extensão em metros quadrados para carregar os insumos adequados.</p>
                      </div>

                      <div className="bg-slate-50 border border-slate-150 p-8 rounded-3xl flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
                        <label className="text-xs font-bold text-[#1B3A2D] uppercase tracking-wide">Área total para tratamento</label>
                        
                        <div className="relative w-full max-w-xs">
                          <input
                            type="number"
                            min="1"
                            value={areaM2 || ''}
                            onChange={(e) => setAreaM2(parseInt(e.target.value) || 0)}
                            placeholder="Exemplo: 250"
                            className="w-full text-center h-16 px-4 pr-14 rounded-2xl bg-white border border-slate-200 hover:border-slate-350 focus:border-emerald-300 font-mono text-2xl font-black text-slate-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all shadow-xs"
                          />
                          <span className="absolute right-5 top-1/2 -translate-y-1/2 font-mono text-sm font-black text-slate-400">m²</span>
                        </div>

                        <p className="text-[11px] text-[#6B6B5F] text-center font-bold px-4">
                          Utilizado para cálculo de insumos e mão de obra.
                        </p>
                      </div>

                      {/* Quick helpers areas buttons */}
                      <div className="flex flex-wrap items-center justify-center gap-2 max-w-lg mx-auto">
                        {[50, 100, 200, 350, 500, 1000].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAreaM2(val)}
                            className={`px-3 py-1.5 border rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                              areaM2 === val 
                                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 font-extrabold shadow-2xs' 
                                : 'bg-white hover:bg-slate-50 text-slate-500 border-slate-200'
                            }`}
                          >
                            {val} m²
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ETAPA 5: COMPLEXIDADE */}
                  {currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Qual o nível de complexidade?</h4>
                        <p className="text-xs text-slate-450">Determine as condições do local e focos infestados relatados.</p>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {COMPLEXITY_LEVELS.map((lvl) => {
                          const isSelected = selectedComplexityLevel === lvl.value;
                          return (
                            <button
                              key={lvl.value}
                              type="button"
                              onClick={() => {
                                setSelectedComplexityLevel(lvl.value);
                                setInfestationLevel(lvl.status as InfestationLevel);
                                setComplexity(lvl.comp as OperationalComplexity);
                              }}
                              className={`p-6 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                                isSelected
                                  ? 'border-emerald-500 bg-emerald-50/25 shadow-xs'
                                  : 'border-slate-150 bg-white hover:border-slate-250'
                              }`}
                            >
                              <div className="flex items-center gap-4">
                                <div className={`size-10 rounded-full flex items-center justify-center border font-mono font-black text-xs ${
                                  isSelected 
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}>
                                  {lvl.value.charAt(0)}
                                </div>
                                <div>
                                  <h5 className={`text-sm font-black uppercase ${isSelected ? 'text-[#1B3A2D]' : 'text-slate-800'}`}>
                                    {lvl.label}
                                  </h5>
                                  <p className="text-xs font-semibold text-slate-500 mt-0.5">{lvl.desc}</p>
                                </div>
                              </div>

                              <div className={`size-4 rounded-full border-2 flex items-center justify-center ${
                                isSelected ? 'border-emerald-600 bg-emerald-600' : 'border-slate-200'
                              }`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ETAPA 6: RESULTADO (FORMULATION CONTROLS) */}
                  {currentStep === 6 && (
                    <div className="space-y-6 text-left font-sans">
                      <div className="space-y-2">
                        <h4 className="text-xl font-extrabold text-slate-800 tracking-tight">Análise Comercial de Preço</h4>
                        <p className="text-xs text-slate-450">Estude a composição final e ajuste as variáveis de markup para a proposta final.</p>
                      </div>

                      {/* Interactive target margin slider */}
                      <div className="bg-slate-50 border border-slate-150 p-5 rounded-2xl space-y-3.5">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2.5">
                          <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            Margem de Lucro Alvo (%)
                          </label>
                          <span className="font-mono font-bold text-xs text-emerald-700 bg-emerald-50 border border-emerald-250 px-2.5 py-1 rounded-md self-start sm:self-auto">
                            Markup Fator: {pricingResult.markupMultiplicador.toFixed(2)}&times;
                          </span>
                        </div>
                        
                        <input
                          type="range"
                          min="0"
                          max="80"
                          step="1"
                          value={customMargin}
                          onChange={(e) => {
                            setCustomMargin(Number(e.target.value));
                            setIsPriceManuallyEdited(false);
                          }}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 focus:outline-none"
                        />
                        
                        <div className="flex justify-between text-[10px] text-slate-450 font-mono leading-none">
                          <span>Mínimo: {markupSettings.margemMinimaPercent}%</span>
                          <span className="font-bold text-[#1B3A2D]">Giro Alvo: {customMargin}%</span>
                          <span>Máximo: 80%</span>
                        </div>
                      </div>

                      {/* Manual Negotiated price widget */}
                      <div className="bg-[#1B3A2D] text-white p-5 rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300 block">Preço Comercial Sugerido</span>
                          <span className="text-2xl font-black font-mono">R$ {formatCurrency(suggestedPrice)}</span>
                        </div>

                        <div className="bg-white/10 rounded-xl p-3 flex-1 max-w-[240px]">
                          <span className="text-[8px] text-emerald-200 uppercase font-black block tracking-wider">Negociar Preço Final</span>
                          <div className="flex items-center text-white mt-1">
                            <span className="text-xs font-bold mr-1">R$</span>
                            <input
                              type="number"
                              step="0.01"
                              value={finalPrice || ''}
                              onChange={(e) => {
                                setFinalPrice(parseFloat(e.target.value) || 0);
                                setIsPriceManuallyEdited(true);
                              }}
                              className="bg-transparent text-white focus:outline-none font-mono font-black text-lg w-full border-none p-0"
                            />
                            {isPriceManuallyEdited && (
                              <button
                                type="button"
                                onClick={() => {
                                  setIsPriceManuallyEdited(false);
                                  setFinalPrice(suggestedPrice);
                                }}
                                className="text-emerald-300 hover:text-white p-1 rounded-md"
                                title="Voltar ao preço sugerido"
                              >
                                <RefreshCw className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Cost margin healthy alert status */}
                      {resultingMargin < markupSettings.margemMinimaPercent && (
                        <div className="bg-red-50 text-red-900 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-2.5 text-xs font-black shadow-xs">
                          <AlertTriangle className="size-4 shrink-0 text-red-600" />
                          <span>Atenção: A margem do orçamento ({resultingMargin.toFixed(2)}%) está abaixo da margem de piso permitida ({markupSettings.margemMinimaPercent}%).</span>
                        </div>
                      )}

                      {/* Advanced operational toggles */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs font-semibold">
                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Equipe Técnica</label>
                          <select
                            value={technicians}
                            onChange={(e) => setTechnicians(Number(e.target.value))}
                            className="bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none w-full"
                          >
                            <option value={1}>1 Técnico Especialista</option>
                            <option value={2}>2 Técnicos Operacionais</option>
                            <option value={3}>3 Técnicos (Equipe Ampla)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Urgência</label>
                          <select
                            value={urgency}
                            onChange={(e) => setUrgency(e.target.value as UrgencyLevel)}
                            className="bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none w-full"
                          >
                            <option value="Normal">Normal</option>
                            <option value="Prioritário">Prioritário (+15%)</option>
                            <option value="Emergência">Emergência (+35%)</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Frequência/Recorrência</label>
                          <select
                            value={recurrence}
                            onChange={(e) => setRecurrence(e.target.value as any)}
                            className="bg-white border border-slate-200 rounded-lg p-1.5 focus:outline-none w-full"
                          >
                            <option value="Único">Único</option>
                            <option value="Mensal">Mensal (-10%)</option>
                            <option value="Trimestral">Trimestral (-6%)</option>
                            <option value="Semestral">Semestral (-3%)</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Rodapé da tela com as ações guiadas */}
            <div className="bg-slate-50 border-t border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Back actions key */}
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep(prev => Math.max(prev - 1, 1))}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-650 font-extrabold text-xs tracking-wider uppercase rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
                >
                  &larr; Voltar
                </button>
              ) : (
                <div />
              )}

              {/* Next/Save actions key */}
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
                    className="flex-1 sm:flex-none px-4.5 py-2.5 bg-white hover:bg-slate-50 text-slate-705 border border-slate-250 font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Salvar Rascunho
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSaveQuote('enviado')}
                    disabled={!clientName}
                    className="flex-1 sm:flex-none px-6 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-sm"
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
            
            {/* Header del resumen */}
            <div>
              <h4 className="text-xs font-black text-[#1B3A2D] tracking-widest uppercase">Resumo do Orçamento</h4>
              <p className="text-[10px] font-medium text-slate-450 mt-1">Status operacional em tempo real.</p>
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
              <div className="space-y-2 text-[11px] font-mono font-bold text-slate-650">
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
                  <span className="text-slate-650 font-sans">Margem Final:</span>
                  <span className={`${isMarginHealthy ? 'text-emerald-700' : 'text-red-650'}`}>
                    {resultingMargin.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* DETALHE IMPORTADO DE PREÇO RECOMENDADO EM DESTAQUE */}
            <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-center">
              <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block mb-1">Preço Recomendado</span>
              <span className="text-2xl font-black text-[#1B3A2D] block font-mono">
                R$ {formatCurrency(finalPrice)}
              </span>
            </div>

            {/* INTEGRACÕES VISUAIS */}
            <div className="space-y-3 pt-4 border-t border-slate-150">
              
              {/* POP VINCULADO AUTOMATICO */}
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

              {/* ESTOQUE STATUS COM ICONES */}
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

      {/* POP PROCEDURAL DETAIL OVERLAY MODAL */}
      <AnimatePresence>
        {showPopDetailModal && matchedPop && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border text-left border-slate-200 max-w-lg w-full rounded-[24px] p-6 shadow-2xl relative space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[9px] font-black uppercase text-emerald-700 tracking-widest block">Procedimento Técnico</span>
                  <h3 className="text-base font-black text-slate-850">{matchedPop.name}</h3>
                </div>
                <button
                  onClick={() => setShowPopDetailModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1 text-xs leading-relaxed">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Descritivo da Praga Alvo</span>
                  <p className="font-semibold text-slate-700 mt-1">{matchedPop.pestType || 'Controle Técnico'}</p>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Produtos Químicos Obrigatórios</span>
                  <div className="grid gap-2 mt-1.5">
                    {productsWithStockCosts.length > 0 ? (
                      productsWithStockCosts.map((p, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 border border-slate-150 rounded-lg">
                          <div>
                            <p className="font-extrabold text-slate-850">{p.productName}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">Qtd Usada: {p.quantity} {p.unit} ({p.availableQty} em estoque)</p>
                          </div>
                          <span className={`text-[10px] font-bold ${p.isInsufficient ? 'text-red-650' : 'text-emerald-700'}`}>
                            {p.isInsufficient ? 'Sem Estoque' : 'Em Estoque ✓'}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="italic text-slate-500 text-[11px]">Nenhum produto químico associado.</p>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400">Tempo de Atendimento Estimado</span>
                  <p className="font-semibold text-slate-750 mt-1">{estimatedHours} Hora(s) dedicação técnica.</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPopDetailModal(false)}
                  className="px-5 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#1B3A2D]/90 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Fechar POP
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SHARING FORM MODAL DISPLAY (COMMERCIAL COPYABLE QUOTE + VINCULO SERVICO ACTIVATION) */}
      <AnimatePresence>
        {showShareModal && generatedQuotePayload && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border text-left border-slate-200 max-w-xl w-full rounded-[30px] p-6 sm:p-8 shadow-2xl relative space-y-6 font-sans"
            >
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded-md font-mono text-[9px] font-bold border border-sky-200 uppercase bg-sky-50 text-sky-700">
                    Orçamento Gerado COM SUCESSO!
                  </span>
                  <h3 className="text-lg font-black text-slate-900 block select-none">Proposta Comercial Sanitária</h3>
                </div>
                <button
                  onClick={() => {
                    setShowShareModal(false);
                    resetAllForm();
                  }}
                  className="p-1.5 bg-slate-50 border border-slate-150 rounded-lg text-slate-550 hover:text-slate-900 transition-all cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                  O orçamento comercial foi salvo nos registros operacionais. Use o gabarito profissional abaixo formatado para enviar diretamente no WhatsApp ou E-mail corporativo do cliente.
                </p>

                {/* COPYABLE MODEL PRE CONTAINER */}
                <div className="relative">
                  <pre className="p-4 bg-slate-950 text-white rounded-2xl text-[11px] font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-[220px] overflow-y-auto w-full max-w-full">
                    {getShareableText()}
                  </pre>
                  
                  <button
                    onClick={handleCopyText}
                    className="absolute top-3 right-3 p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-all flex items-center gap-1 font-sans text-[10px] font-bold cursor-pointer"
                  >
                    {isCopied ? (
                      <>
                        <Check className="size-3.5 text-emerald-400" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copiar Texto
                      </>
                    )}
                  </button>
                </div>

                {/* VINCULADO GERAR SERVICO FLUXOS ACTION BAR */}
                <div className="bg-slate-50 border border-slate-150 p-4.5 rounded-2xl space-y-3">
                  <div className="flex gap-2 text-xs">
                    💡
                    <div className="space-y-0.5">
                      <p className="font-extrabold text-slate-800">Mudar para serviço agendado</p>
                      <p className="text-[11px] text-slate-500">Gere uma visita correspondente na agenda e organize as OS da equipe técnica.</p>
                    </div>
                  </div>

                  {serviceGeneratedStatus ? (
                    <div className="bg-emerald-50 text-emerald-800 border border-emerald-150 rounded-xl px-4 py-2 text-xs font-bold flex items-center gap-2">
                      <CheckCircle className="size-4" />
                      <span>Visita agendada para hoje na agenda técnica!</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCreateAgendaServiceFromQuote}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white hover:text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Calendar className="size-4 text-emerald-205" />
                      <span>Gerar Serviço na Agenda Operational</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 text-xs font-semibold">
                {selectedClient ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowShareModal(false);
                      resetAllForm();
                      navigate(`/clientes?clientId=${selectedClient.id}`);
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold uppercase text-[10px] rounded-xl transition-all cursor-pointer"
                  >
                    Abrir Perfil do Cliente
                  </button>
                ) : (
                  <div />
                )}
                <button
                  type="button"
                  onClick={() => {
                    setShowShareModal(false);
                    resetAllForm();
                  }}
                  className="bg-[#1B3A2D] hover:bg-[#1B3A2D]/90 text-white font-extrabold uppercase text-[10px] px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Concluído
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
