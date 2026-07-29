import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSystemStore, Client, Contract, AgendaEvent, Quote, selectClienteRentabilidade, ClienteRentabilidade, selectContratosParaReajuste } from '@/store/systemStore';
import { 
  Users, 
  FileText, 
  Phone, 
  MapPin, 
  AlertTriangle, 
  Calendar, 
  DollarSign, 
  Search, 
  Trash2, 
  Edit2, 
  Plus, 
  X, 
  Check, 
  Mail, 
  ShieldCheck, 
  Clock, 
  Info,
  ChevronRight,
  TrendingUp,
  FileSpreadsheet,
  FileImage,
  Sparkles,
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Activity,
  UserPlus
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import { formatBRL, formatPercent, formatDate } from '@/utils/format';
import { GoogleMapsViewer } from '@/components/GoogleMapsViewer';
import { AgendarServicoModal } from '@/modules/confirmacoes/AgendarServicoModal';

// Extended client and document types
type ExtendedClient = Client & {
  type?: 'B2B' | 'B2C';
};

interface ClientDoc {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

const SIMULATED_TODAY = '2026-06-05';

// Mock DB of initial documents for default clients
const INITIAL_DOCS: Record<string, ClientDoc[]> = {
  'c-01': [
    { id: 'doc-1', name: 'Contrato_Social_Grupo_Pao_Duro.pdf', type: 'pdf', size: '2.4 MB', uploadedAt: '2026-05-10' },
    { id: 'doc-2', name: 'Laudo_Vigilancia_Desinsetizacao_Maio.pdf', type: 'pdf', size: '1.1 MB', uploadedAt: '2026-05-11' }
  ],
  'c-02': [
    { id: 'doc-3', name: 'Contrato_CIP_Shopping_das_Flores_Assinado.pdf', type: 'pdf', size: '4.8 MB', uploadedAt: '2026-01-10' },
    { id: 'doc-4', name: 'Relatorio_Mensal_CIP_Maio.docx', type: 'docx', size: '1.3 MB', uploadedAt: '2026-05-29' }
  ],
  'c-03': [
    { id: 'doc-6', name: 'Plano_Anual_Controle_Roedores_Especificacoes.pdf', type: 'pdf', size: '3.1 MB', uploadedAt: '2025-05-01' },
    { id: 'doc-7', name: 'Relatorio_De_Iscas_Consumidas_Abril.pdf', type: 'pdf', size: '890 KB', uploadedAt: '2026-04-28' }
  ],
  'c-04': [
    { id: 'doc-8', name: 'Licenca_Sanitaria_MedSim.pdf', type: 'pdf', size: '1.2 MB', uploadedAt: '2026-05-18' }
  ],
  'c-05': [
    { id: 'doc-10', name: 'Fotos_Foco_Cupim_Garagem.jpg', type: 'jpg', size: '3.3 MB', uploadedAt: '2026-05-20' }
  ],
  'c-06': [
    { id: 'doc-12', name: 'Contrato_Anual_Metalnorte_Vigente.pdf', type: 'pdf', size: '5.2 MB', uploadedAt: '2026-05-22' }
  ]
};

export function ClientesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const systemState = useSystemStore();
  const {
    clients,
    contracts,
    agenda,
    addClient,
    updateClient,
    removeClient,
    addContract,
    updateContract,
    removeContract,
    addAgendaEvent,
    addQuote,
    quotes,
    financial,
    scheduleApprovedQuote,
    updateQuoteStatus,
    markAsRetorno
  } = systemState;

  // Listen for clientId and activeTab in URL parameters and automatically select the client and tab on mount or change
  useEffect(() => {
    const cid = searchParams.get('clientId');
    if (cid && clients && clients.length > 0) {
      const exists = clients.some(c => c.id === cid);
      if (exists) {
        setSelectedClientId(cid);
        const tab = searchParams.get('activeTab');
        if (tab && ['servicos', 'orcamentos', 'contratos', 'financeiro', 'documentos', 'garantias', 'retornos', 'timeline'].includes(tab)) {
          setActiveProfileTab(tab as any);
        }
      }
    }
  }, [searchParams, clients]);

  // Active view states
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeProfileTab, setActiveProfileTab] = useState<'servicos' | 'orcamentos' | 'contratos' | 'financeiro' | 'documentos' | 'garantias' | 'retornos' | 'timeline'>('servicos');
  const [showMobileProfile, setShowMobileProfile] = useState(false);

  // Document management state
  const [clientDocs, setClientDocs] = useState<ClientDoc[]>([]);

  // Modals Visibility
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientModalMode, setClientModalMode] = useState<'create' | 'edit'>('create');
  const [selectedClientForEdit, setSelectedClientForEdit] = useState<Client | null>(null);

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractModalMode, setContractModalMode] = useState<'create' | 'edit'>('create');
  const [selectedContractForEdit, setSelectedContractForEdit] = useState<Contract | null>(null);

  // Detail view for service order modal
  const [detailServiceModal, setDetailServiceModal] = useState<AgendaEvent | null>(null);

  // Schedule Quote Modal state
  const [quoteToSchedule, setQuoteToSchedule] = useState<Quote | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  const handleConfirmScheduleFromClientPage = (scheduledDate: string, scheduledTime: string, technician: string, employeeId?: string) => {
    if (!quoteToSchedule) return;
    scheduleApprovedQuote(quoteToSchedule.id, scheduledDate, scheduledTime, technician, employeeId);
    updateQuoteStatus(quoteToSchedule.id, 'aprovado');
    setIsScheduleModalOpen(false);
    setQuoteToSchedule(null);
    toast.success('Orçamento aprovado e serviço agendado com sucesso!');
  };

  // New forms states (pre-filled client creations)
  const [isNewReturnOpen, setIsNewReturnOpen] = useState(false);

  // Client form
  const [formClientName, setFormClientName] = useState('');
  const [formClientCnpjCpf, setFormClientCnpjCpf] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formClientAddress, setFormClientAddress] = useState('');
  const [formClientType, setFormClientType] = useState<'B2B' | 'B2C'>('B2B');

  // Contract form
  const [formContractTitle, setFormContractTitle] = useState('');
  const [formContractRecurrent, setFormContractRecurrent] = useState(1200);
  const [formContractRecurrency, setFormContractRecurrency] = useState(1);
  const [formContractStart, setFormContractStart] = useState(SIMULATED_TODAY);
  const [formContractEnd, setFormContractEnd] = useState('2027-06-05');
  const [formContractStatus, setFormContractStatus] = useState<'ativo' | 'vencido' | 'cancelado'>('ativo');

  // New Return Visit Form
  const [formReturnReason, setFormReturnReason] = useState('Reforço preventivo contra baratas');
  const [formReturnDate, setFormReturnDate] = useState(SIMULATED_TODAY);
  const [formReturnCost, setFormReturnCost] = useState(150);
  const [formReturnNotes, setFormReturnNotes] = useState('Cliente detectou insetos vivos 20 dias após aplicação.');

  // Financial system movements
  const movements = useMemo(() => financial?.movements || [], [financial]);

  // Handle client type classification
  const getClientType = (client: ExtendedClient): 'B2B' | 'B2C' => {
    if (client.type) return client.type;
    const rawVal = (client.cnpjCpf || '').replace(/\D/g, '');
    if (client.cnpjCpf?.includes('/') || rawVal.length === 14) return 'B2B';
    return 'B2C';
  };

  const isClientIncomplete = (client: Client): boolean => {
    return !client.cnpjCpf || client.cnpjCpf === '⚠️ NÃO INFORMADO' || !client.email || client.email === '⚠️ NÃO INFORMADO';
  };

  // KPI Calculations
  const kpis = useMemo(() => {
    const total = (clients || []).length;
    const activeContracts = (contracts || []).filter(c => c.status === 'ativo').length;
    
    // Count clients with active warranties
    const activeWarrantiesCount = (clients || []).filter(c => {
      const clientEvents = (agenda || []).filter(e => e.clientId === c.id && e.status === 'realizado');
      return clientEvents.some(s => {
        const exec = new Date(s.date + 'T00:00:00');
        const exp = new Date(exec);
        exp.setDate(exp.getDate() + 90);
        return exp > new Date(SIMULATED_TODAY);
      });
    }).length;

    // Count clients without recent service (more than 90 days ago) or no service at all
    const inactiveCount = (clients || []).filter(c => {
      const clientEvents = (agenda || []).filter(e => e.clientId === c.id && e.status === 'realizado');
      if (clientEvents.length === 0) return true;
      const dates = clientEvents.map(e => new Date(e.date).getTime());
      const maxDate = Math.max(...dates);
      const diffDays = (new Date(SIMULATED_TODAY).getTime() - maxDate) / (1000 * 60 * 60 * 24);
      return diffDays > 90;
    }).length;

    return {
      total,
      activeContracts,
      activeWarranties: activeWarrantiesCount + 1, // adjusting for mockup completeness
      inactive: inactiveCount
    };
  }, [clients, contracts, agenda]);

  // List filtering logic
  const filteredClients = useMemo(() => {
    return (clients || []).filter(c => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = 
        c.name.toLowerCase().includes(lowerSearch) ||
        (c.cnpjCpf && c.cnpjCpf.toLowerCase().includes(lowerSearch)) ||
        (c.phone && c.phone.toLowerCase().includes(lowerSearch)) ||
        (c.address && c.address.toLowerCase().includes(lowerSearch));

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'ativos') {
        const hasActiveContract = (contracts || []).some(contr => contr.clientId === c.id && contr.status === 'ativo');
        const hasRecentService = (agenda || []).some(e => e.clientId === c.id && e.status === 'realizado' && (new Date(SIMULATED_TODAY).getTime() - new Date(e.date).getTime()) / (1000*60*60*24) <= 90);
        return hasActiveContract || hasRecentService;
      }
      if (statusFilter === 'inativos') {
        const hasActiveContract = (contracts || []).some(contr => contr.clientId === c.id && contr.status === 'ativo');
        const hasRecentService = (agenda || []).some(e => e.clientId === c.id && e.status === 'realizado' && (new Date(SIMULATED_TODAY).getTime() - new Date(e.date).getTime()) / (1000*60*60*24) <= 90);
        return !hasActiveContract && !hasRecentService;
      }
      if (statusFilter === 'garantias') {
        return (agenda || []).some(s => s.clientId === c.id && s.status === 'realizado' && s.type === 'servico' && (new Date(s.date).getTime() + 90 * 24*60*60*1000) > new Date(SIMULATED_TODAY).getTime());
      }
      if (statusFilter === 'contratos') {
        return (contracts || []).some(contr => contr.clientId === c.id && contr.status === 'ativo');
      }
      if (statusFilter === 'inadimplentes') {
        // Mock default for styling and realism (Residência Dr. Marcos and Grupo Pão Duro have some pending bills)
        return c.id === 'c-05' || c.id === 'c-01';
      }
      return true;
    });
  }, [clients, contracts, agenda, searchTerm, statusFilter]);

  // Set default selection if none
  const activeClient = useMemo(() => {
    if (selectedClientId) {
      const found = (clients || []).find(c => c.id === selectedClientId);
      if (found) return found;
    }
    if (filteredClients.length > 0) return filteredClients[0];
    return null;
  }, [clients, selectedClientId, filteredClients]);

  // Handle document database state sync on select
  useEffect(() => {
    if (activeClient) {
      const stored = localStorage.getItem(`DDSULF_CLIENT_DOCS_${activeClient.id}`);
      if (stored) {
        setClientDocs(JSON.parse(stored));
      } else {
        const initial = INITIAL_DOCS[activeClient.id] || [
          { id: 'doc-basic', name: 'Laudo_Vistoria_Preventiva_DDSulf.pdf', type: 'pdf', size: '1.4 MB', uploadedAt: '2026-06-01' }
        ];
        localStorage.setItem(`DDSULF_CLIENT_DOCS_${activeClient.id}`, JSON.stringify(initial));
        setClientDocs(initial);
      }
    } else {
      setClientDocs([]);
    }
  }, [activeClient]);

  // Dynamic calculations for selected client
  const clientStats = useMemo(() => {
    if (!activeClient) return { faturamentoTotal: 0, servicosRealizados: 0, retornos: 0, garantias: 0, ticketMedio: 0 };
    
    // Services Completed
    const clientCompleted = (agenda || []).filter(e => e.clientId === activeClient.id && e.status === 'realizado');
    const servicosRealizados = clientCompleted.length;

    // Retornos Completed
    const retornos = (agenda || []).filter(e => e.clientId === activeClient.id && e.type === 'retorno').length;

    // Faturamento Total (Movements + APPROVED Quotes + Contracts Recurrency)
    const clientMovements = movements.filter(m => m.description.toLowerCase().includes(activeClient.name.toLowerCase()) && m.isPaid);
    const movSum = clientMovements.reduce((acc, current) => acc + Math.abs(current.value), 0);

    const clientContracts = (contracts || []).filter(c => c.clientId === activeClient.id);
    const contractSum = clientContracts.reduce((acc, c) => acc + (c.status === 'ativo' ? c.recurrentValue * 5 : 0), 0); // simulated months paid

    const faturamentoTotal = movSum > 0 ? movSum + contractSum : (servicosRealizados * 1250) + contractSum;

    // Ticket médio
    const ticketMedio = servicosRealizados > 0 ? Number((faturamentoTotal / servicosRealizados).toFixed(2)) : 1250;

    // Garantias Ativas
    const garantiasList = clientCompleted.filter(s => {
      const exec = new Date(s.date + 'T00:00:00');
      const exp = new Date(exec);
      exp.setDate(exp.getDate() + 90);
      return exp > new Date(SIMULATED_TODAY);
    });
    const garantias = garantiasList.length || (activeClient.id === 'c-01' || activeClient.id === 'c-02' ? 1 : 0);

    return {
      faturamentoTotal,
      servicosRealizados,
      retornos,
      garantias,
      ticketMedio
    };
  }, [activeClient, agenda, contracts, movements]);

  // Rentabilidade mappings and active calculations
  const clientRentabilities = useMemo(() => {
    const mapping: Record<string, ClienteRentabilidade> = {};
    const state = { clients, contracts, quotes, agenda } as any;
    (clients || []).forEach(c => {
      mapping[c.id] = selectClienteRentabilidade(c.id, state);
    });
    return mapping;
  }, [clients, contracts, quotes, agenda]);

  const activeRentabilidade = useMemo(() => {
    if (!activeClient) return null;
    return selectClienteRentabilidade(activeClient.id, { clients, contracts, quotes, agenda } as any);
  }, [activeClient, clients, contracts, quotes, agenda]);

  // Customer health calculation
  const clientHealth = useMemo(() => {
    if (!activeClient) return { label: 'Inativo', color: 'gray', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' };
    
    // c-05 is mock risk
    if (activeClient.id === 'c-05') {
      return { 
        label: 'Cliente em Risco', 
        color: 'red', 
        bg: 'bg-rose-50', 
        text: 'text-rose-700', 
        border: 'border-rose-100',
        desc: '🔴 Sem nenhum atendimento há mais de 8 meses.' 
      };
    }
    // c-01 default issues matching Mocked items
    if (activeClient.id === 'c-01') {
      return { 
        label: 'Atenção / Cobrança', 
        color: 'yellow', 
        bg: 'bg-amber-50', 
        text: 'text-amber-800', 
        border: 'border-amber-200',
        desc: '⚠️ Constatado histórico financeiro oscilante.' 
      };
    }

    const clientContracts = (contracts || []).filter(c => c.clientId === activeClient.id);
    const hasActiveContract = clientContracts.some(c => c.status === 'ativo');
    if (hasActiveContract) {
      return { 
        label: 'Relacionamento Ativo', 
        color: 'green', 
        bg: 'bg-emerald-50', 
        text: 'text-emerald-800', 
        border: 'border-emerald-200',
        desc: '🟢 Cliente estratégico com faturamento e CIP ativos.' 
      };
    }

    return { 
      label: 'Relacionamento Saudável', 
      color: 'green', 
      bg: 'bg-sky-50', 
      text: 'text-sky-850', 
      border: 'border-sky-200',
      desc: '🟢 Sem pendências financeiras registradas.' 
    };
  }, [activeClient, contracts]);

  // IA Opportunities Generation
  const aiOpportunity = useMemo(() => {
    if (!activeClient) return null;
    if (activeClient.id === 'c-05') {
      return {
        badge: "Inativo há 8 meses",
        title: "Reativação Preventiva",
        description: "Cliente residencial sem ordens de serviço executadas desde Outubro de 2025. Período crítico para proliferação de insetos voadores nos ralos e dispensas.",
        estimatedValue: 1250,
        pct: 95
      };
    }
    if (activeClient.id === 'c-03') {
      return {
        badge: "Renovação de Contrato",
        title: "Retomada do Plano Mensal",
        description: "Condomínio Green Park está com o Plano de Controle de Roedores expirado há 30 dias. Oferecer 5% de desconto no primeiro mês para contratação imediata.",
        estimatedValue: 33600,
        pct: 88
      };
    }
    const hasActiveContract = (contracts || []).some(c => c.clientId === activeClient.id && c.status === 'ativo');
    if (!hasActiveContract && getClientType(activeClient) === 'B2B') {
      return {
        badge: "Fidelização B2B",
        title: "Upgrade para Plano Multisserviço",
        description: "Este cliente corporativo atual faz contratação apenas avulsa. Oferecer contrato CIP mensal cobrindo dedetização + desratização para previsibilidade de custos.",
        estimatedValue: 1800,
        pct: 75
      };
    }
    return {
      badge: "Cross-selling Ativo",
      title: "Descupinização de Estruturas",
      description: "Sugerir inspeção técnica gratuita para cupins de solo nas madeiras e forros em Volta Redonda para aumentar o ticket médio atual.",
      estimatedValue: 1950,
      pct: 60
    };
  }, [activeClient, contracts]);

  // Client Timeline Generation
  const clientTimeline = useMemo(() => {
    if (!activeClient) return [];
    const list: { id: string; date: string; title: string; desc: string; iconType: string }[] = [];

    list.push({
      id: 't-1',
      date: activeClient.createdAt || '2026-05-10',
      title: "Cliente Registrado",
      desc: `Abertura oficial da ficha cadastral de tipo ${getClientType(activeClient) === 'B2B' ? 'Empresa B2B' : 'Residencial B2C'} no ERP.`,
      iconType: 'user'
    });

    const clientCompleted = (agenda || []).filter(e => e.clientId === activeClient.id && e.status === 'realizado');
    clientCompleted.forEach((ev, idx) => {
      list.push({
        id: `t-ev-${idx}`,
        date: ev.date,
        title: ev.title,
        desc: `Serviço técnico executado. ${ev.notes || 'Equipe reportou sem intercorrências.'}`,
        iconType: 'check'
      });
    });

    const clientPending = (agenda || []).filter(e => e.clientId === activeClient.id && e.status === 'pendente');
    clientPending.forEach((ev, idx) => {
      list.push({
        id: `t-pend-${idx}`,
        date: ev.date,
        title: `Agendado: ${ev.title}`,
        desc: `Ordem programada na rota técnica. Observações adicionais: ${ev.notes || 'Nenhuma.'}`,
        iconType: 'calendar'
      });
    });

    const clientContracts = (contracts || []).filter(c => c.clientId === activeClient.id);
    clientContracts.forEach((contr, idx) => {
      list.push({
        id: `t-contr-${idx}`,
        date: contr.startDate,
        title: `Contrato Vinculado: ${contr.title}`,
        desc: `Início do cronograma técnico com mensalidade contratual de R$ ${contr.recurrentValue.toLocaleString('pt-BR', {minimumFractionDigits:2})}.`,
        iconType: 'contract'
      });
    });

    // Sort chronologically (newest first)
    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeClient, agenda, contracts]);

  // Client Warranties list
  const clientWarranties = useMemo(() => {
    if (!activeClient) return [];
    
    // Get completed services
    const clientCompleted = (agenda || []).filter(e => e.clientId === activeClient.id && e.status === 'realizado' && e.type === 'servico');
    const result = clientCompleted.map((s, idx) => {
      const exec = new Date(s.date + 'T00:00:00');
      const exp = new Date(exec);
      exp.setDate(exp.getDate() + 90);
      const today = new Date(SIMULATED_TODAY + 'T00:00:00');
      const diff = exp.getTime() - today.getTime();
      const days = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));

      return {
        id: `w-${idx}`,
        title: s.title.replace("Ordem de Serviço ", ""),
        execDate: s.date,
        expDate: exp.toISOString().split('T')[0],
        daysLeft: days,
        status: days > 0 ? 'active' : 'expired'
      };
    });

    // Seed mock fallback for default screens if none found
    if (result.length === 0) {
      if (activeClient.id === 'c-01') {
        result.push({
          id: 'w-mock-1',
          title: "Detetização de Baratas & Pragas Comuns",
          execDate: "2026-05-10",
          expDate: "2026-08-10",
          daysLeft: 66,
          status: 'active'
        });
      } else if (activeClient.id === 'c-06') {
        result.push({
          id: 'w-mock-2',
          title: "Desinsetização Química e Controle Sanitário",
          execDate: "2026-05-22",
          expDate: "2026-08-22",
          daysLeft: 78,
          status: 'active'
        });
      }
    }

    return result;
  }, [activeClient, agenda]);

  // Documents Local Persistence Operations
  const handleUploadDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const extension = file.name.split('.').pop() || 'pdf';
    
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const displaySize = sizeMB === '0.0' ? `${Math.ceil(file.size / 1024)} KB` : `${sizeMB} MB`;

    const newDoc: ClientDoc = {
      id: `doc-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: extension.toLowerCase(),
      size: displaySize,
      uploadedAt: SIMULATED_TODAY
    };

    const updated = [newDoc, ...clientDocs];
    setClientDocs(updated);
    localStorage.setItem(`DDSULF_CLIENT_DOCS_${activeClient!.id}`, JSON.stringify(updated));
    toast.success('Documento carregado!', { description: `Arquivo "${file.name}" anexado com sucesso.` });
  };

  const handleDeleteDoc = (docId: string, docName: string) => {
    const updated = clientDocs.filter(d => d.id !== docId);
    setClientDocs(updated);
    localStorage.setItem(`DDSULF_CLIENT_DOCS_${activeClient!.id}`, JSON.stringify(updated));
    toast.success('Documento arquivado', { description: `O arquivo "${docName}" foi excluído.` });
  };

  // Client actions
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formClientName.trim()) {
      toast.error('O nome do cliente é obrigatório.');
      return;
    }

    const payload: ExtendedClient = {
      id: clientModalMode === 'edit' && selectedClientForEdit ? selectedClientForEdit.id : `c-${Math.random().toString(36).substr(2, 9)}`,
      name: formClientName.trim(),
      cnpjCpf: formClientCnpjCpf.trim() || '⚠️ NÃO INFORMADO',
      email: formClientEmail.trim() || '⚠️ NÃO INFORMADO',
      phone: formClientPhone.trim() || '⚠️ NÃO INFORMADO',
      address: formClientAddress.trim() || '⚠️ NÃO INFORMADO',
      type: formClientType,
      createdAt: clientModalMode === 'edit' && selectedClientForEdit ? selectedClientForEdit.createdAt : SIMULATED_TODAY
    };

    if (clientModalMode === 'edit' && selectedClientForEdit) {
      updateClient(selectedClientForEdit.id, payload);
      toast.success('Perfil atualizado com sucesso!', { description: `Os dados de ${payload.name} foram salvos` });
    } else {
      addClient(payload);
      setSelectedClientId(payload.id);
      toast.success('Cliente cadastrado com sucesso!', { description: `${payload.name} já disponível na carteira.` });
    }

    setIsClientModalOpen(false);
  };

  const handleEditClientClick = (c: Client) => {
    setClientModalMode('edit');
    setSelectedClientForEdit(c);
    setFormClientName(c.name);
    setFormClientCnpjCpf(c.cnpjCpf === '⚠️ NÃO INFORMADO' ? '' : c.cnpjCpf);
    setFormClientEmail(c.email === '⚠️ NÃO INFORMADO' ? '' : c.email);
    setFormClientPhone(c.phone === '⚠️ NÃO INFORMADO' ? '' : c.phone);
    setFormClientAddress(c.address === '⚠️ NÃO INFORMADO' ? '' : c.address);
    setFormClientType(getClientType(c));
    setIsClientModalOpen(true);
  };

  const handleCreateClientClick = () => {
    setClientModalMode('create');
    setSelectedClientForEdit(null);
    setFormClientName('');
    setFormClientCnpjCpf('');
    setFormClientEmail('');
    setFormClientPhone('');
    setFormClientAddress('');
    setFormClientType('B2B');
    setIsClientModalOpen(true);
  };

  // Contract Saving Actions
  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContractTitle.trim() || !activeClient) return;

    const payload: Contract = {
      id: contractModalMode === 'edit' && selectedContractForEdit ? selectedContractForEdit.id : `contr-${Math.random().toString(36).substr(2, 9)}`,
      clientId: activeClient.id,
      clientName: activeClient.name,
      title: formContractTitle,
      recurrentValue: Number(formContractRecurrent),
      recurrencyMonths: Number(formContractRecurrency),
      value: Number(formContractRecurrent) * (12 / Number(formContractRecurrency)),
      startDate: formContractStart,
      endDate: formContractEnd,
      status: formContractStatus,
      createdAt: contractModalMode === 'edit' && selectedContractForEdit ? selectedContractForEdit.createdAt : SIMULATED_TODAY
    };

    if (contractModalMode === 'edit' && selectedContractForEdit) {
      updateContract(selectedContractForEdit.id, payload);
      toast.success('Contrato editado!');
    } else {
      addContract(payload);
      toast.success('Novo contrato faturamento recorrente agendado!');
    }

    setIsContractModalOpen(false);
  };

  const openEditContract = (c: Contract) => {
    setContractModalMode('edit');
    setSelectedContractForEdit(c);
    setFormContractTitle(c.title);
    setFormContractRecurrent(c.recurrentValue);
    setFormContractRecurrency(c.recurrencyMonths);
    setFormContractStart(c.startDate);
    setFormContractEnd(c.endDate);
    setFormContractStatus(c.status);
    setIsContractModalOpen(true);
  };

  const openCreateContract = () => {
    setContractModalMode('create');
    setSelectedContractForEdit(null);
    setFormContractTitle('Contrato Trimestral de Dedetização Sanitária');
    setFormContractRecurrent(1400);
    setFormContractRecurrency(3);
    setFormContractStart(SIMULATED_TODAY);
    setFormContractEnd('2027-06-05');
    setFormContractStatus('ativo');
    setIsContractModalOpen(true);
  };

  const handleAddReturnSubmission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeClient) return;

    const clientQuote = quotes?.list?.find(q => q.client.name.toLowerCase() === activeClient.name.toLowerCase());
    let targetQuoteId = clientQuote?.id;

    if (!targetQuoteId) {
      const baseQuote: Quote = {
        id: `q-ret-base-${Math.random().toString(36).substr(2, 7)}`,
        createdAt: SIMULATED_TODAY,
        status: 'executado',
        client: {
          name: activeClient.name,
          address: activeClient.address,
          phone: activeClient.phone
        },
        service: {
          pestType: formReturnReason,
          serviceType: 'Retorno Técnico',
          areaM2: 100,
          distanceKm: 10
        },
        costs: { products: 100, labor: 150, transport: 50, overhead: 30, total: 330 },
        pricing: { suggestedPrice: 500, marginPercent: 34, finalPrice: 500 },
        productsUsed: [{ productId: 'prod-01', productName: 'BIFENTOL 200SC', quantity: 150, unit: 'ml' }],
        inventoryDeducted: true,
        hasReturn: false
      };
      addQuote(baseQuote);
      targetQuoteId = baseQuote.id;
    }

    const returnCostNum = Number(formReturnCost) || 0;
    if (markAsRetorno && targetQuoteId) {
      markAsRetorno(targetQuoteId, returnCostNum, 'Técnico DDSulf', formReturnNotes);
    }

    const newReturnEvent: AgendaEvent = {
      id: `ev-ret-${Math.random().toString(36).substr(2, 7)}`,
      title: `Retorno Técnico: ${formReturnReason}`,
      date: formReturnDate,
      clientId: activeClient.id,
      clientName: activeClient.name,
      type: 'retorno',
      quoteId: targetQuoteId,
      status: 'pendente',
      notes: `${formReturnNotes} (Custo estimado: R$ ${formReturnCost})`
    };

    addAgendaEvent(newReturnEvent);
    setIsNewReturnOpen(false);
    toast.success('Retorno registrado com sucesso!', { description: `Retorno preventivo agendado para ${formReturnDate}.` });
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-500">
      
      {/* 📋 UPPER TOPO HEADER */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
        <div>
          <h1 className="text-3xl font-display font-black text-[#141410] tracking-tight leading-none uppercase">Clientes</h1>
          <p className="text-slate-500 font-sans text-sm mt-1.5 font-medium leading-relaxed">
            Central de relacionamento operacional. Gerencie histórico completo de serviços, contratos, garantias e documentações.
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button 
            type="button"
            onClick={handleCreateClientClick}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#2D6A4F] text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-sm"
          >
            <UserPlus className="size-4" /> Novo Cliente
          </button>
          <button 
            type="button"
            onClick={() => toast.success("Lista exportada!", { description: `${filteredClients.length} contatos salvos no formato CSV.` })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E8E6E1] text-[#141410] hover:bg-[#FAF9F6] text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-sm"
          >
            <Download className="size-4" /> Exportar Lista
          </button>
        </div>
      </header>

      {/* 📊 INDICADORES SUPERIORES */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-[#E8E6E1]/80 p-4 rounded-2xl flex items-center justify-between transition-all hover:shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-sans font-semibold">Clientes Ativos</span>
            <p className="text-2xl font-display font-black text-[#1B3A2D] leading-none">{kpis.total - kpis.inactive}</p>
            <p className="text-[10px] text-emerald-700 font-bold font-sans">Carteira operante</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50/50 flex items-center justify-center text-emerald-800 border border-emerald-100">
            <Users className="size-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E6E1]/80 p-4 rounded-2xl flex items-center justify-between transition-all hover:shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-sans font-semibold">Novos Clientes</span>
            <p className="text-2xl font-display font-black text-sky-800 leading-none">6</p>
            <p className="text-[10px] text-sky-600 font-bold font-sans">Registrados recentmente</p>
          </div>
          <div className="size-11 rounded-xl bg-sky-50/50 flex items-center justify-center text-sky-850 border border-sky-100">
            <TrendingUp className="size-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E6E1]/80 p-4 rounded-2xl flex items-center justify-between transition-all hover:shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-sans font-semibold">Garantia Ativa</span>
            <p className="text-2xl font-display font-black text-amber-700 leading-none">{kpis.activeWarranties}</p>
            <p className="text-[10px] text-amber-600 font-bold font-sans">Vistoria e proteção ativa</p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50/50 flex items-center justify-center text-amber- y-700 border border-amber-100">
            <Clock className="size-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E6E1]/80 p-4 rounded-2xl flex items-center justify-between transition-all hover:shadow-xs">
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 font-sans font-semibold">Alerta de Inatividade</span>
            <p className="text-2xl font-display font-black text-rose-700 leading-none">{kpis.inactive}</p>
            <p className="text-[10px] text-rose-600 font-bold font-sans">Sem serviço &gt; 90 dias</p>
          </div>
          <div className="size-11 rounded-xl bg-rose-50/50 flex items-center justify-center text-rose-700 border border-rose-100">
            <AlertTriangle className="size-5" />
          </div>
        </div>

      </div>

      {/* 🔍 BUSCA GLOBAL & SYSTEM CONTROLLERS */}
      <div className="bg-white border border-[#E8E6E1] p-3 rounded-2xl flex flex-col md:flex-row gap-3 items-center justify-between shadow-xs">
        
        {/* Input de Busca */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Pesquisar cliente, telefone, empresa ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg pl-9 pr-3 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
          />
        </div>

        {/* Dynamic filters list */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto justify-end">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'ativos', label: 'Ativos' },
            { id: 'inativos', label: 'Inativos' },
            { id: 'garantias', label: 'Garantias' },
            { id: 'contratos', label: 'Contratos' },
            { id: 'inadimplentes', label: 'Inadimplentes' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                statusFilter === f.id 
                  ? 'bg-[#1B3A2D] text-white' 
                  : 'bg-slate-50 hover:bg-[#FAF9F6] text-slate-500 border border-[#E8E6E1]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* 🚀 LAYOUT SPLIT: LEFT LISTING (35%) VS RIGHT PROFILE (65%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column - Lista de Clientes. Hide on mobile if mobile details selected */}
        <div className={`lg:col-span-4 bg-white border border-[#E8E6E1] rounded-2xl overflow-hidden shadow-xs ${
          showMobileProfile ? 'hidden lg:block' : 'block'
        }`}>
          <div className="px-4 py-3 bg-[#FAF9F6] border-b border-[#E8E6E1] flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-600">Lista Geral de Clientes</span>
            <span className="px-2 py-0.5 bg-slate-100 text-[9px] font-black rounded-md">{filteredClients.length} cadastrados</span>
          </div>

          <div className="divide-y divide-[#E8E6E1] max-h-[640px] overflow-y-auto">
            {filteredClients.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Users className="size-8 mx-auto opacity-30 text-[#6B6B5F]" />
                <p className="text-xs font-bold uppercase text-[#141410]">Nenhum cliente localizado</p>
                <p className="text-[10px] max-w-xs mx-auto">Tente redefinir os filtros de busca para encontrar registros cadastrados.</p>
              </div>
            ) : (
              filteredClients.map(c => {
                const isSel = activeClient?.id === c.id;
                const type = getClientType(c);
                const incomplete = isClientIncomplete(c);
                const firstWord = c.address.split(',')[0];
                const activeContr = (contracts || []).some(contr => contr.clientId === c.id && contr.status === 'ativo');

                const rent = clientRentabilities[c.id];
                let marginBadge = null;
                if (rent) {
                  const isRetornosFrequentes = rent.taxaRetorno > 15 || rent.qtdRetornos >= 2;
                  if (rent.margemPercent < 20 || isRetornosFrequentes) {
                    marginBadge = (
                      <span className="bg-rose-50 text-rose-800 border border-rose-150 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        {isRetornosFrequentes ? `⚠️ Retornos (${rent.taxaRetorno.toFixed(0)}%)` : `📉 Margem (${rent.margemPercent.toFixed(0)}%)`}
                      </span>
                    );
                  } else if (rent.margemPercent <= 35) {
                    marginBadge = (
                      <span className="bg-amber-50 text-amber-800 border border-amber-150 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        📊 Margem: {rent.margemPercent.toFixed(0)}%
                      </span>
                    );
                  } else {
                    marginBadge = (
                      <span className="bg-emerald-50 text-emerald-850 border border-emerald-150 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                        📈 Margem: {rent.margemPercent.toFixed(0)}%
                      </span>
                    );
                  }
                }

                return (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedClientId(c.id);
                      setShowMobileProfile(true);
                    }}
                    className={`p-3.5 text-left transition-all cursor-pointer flex items-start justify-between gap-2.5 ${
                      isSel ? 'bg-emerald-50/40 border-l-4 border-[#1B3A2D]' : 'hover:bg-[#FAF9F6]/60 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="space-y-1.5 overflow-hidden truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#141410] truncate block uppercase font-sans tracking-tight">
                          {c.name}
                        </span>
                        {incomplete && (
                          <span className="inline-block" title="Cadastro incompleto">
                            <AlertCircle className="size-3.5 text-rose-500 fill-rose-100 shrink-0" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase ${
                          type === 'B2B' ? 'bg-sky-50 text-sky-800' : 'bg-pink-50 text-pink-700'
                        }`}>
                          {type === 'B2B' ? '🏢 B2B' : '👤 B2C'}
                        </span>
                        {activeContr && (
                          <span className="bg-emerald-100 text-emerald-800 text-[8px] font-black px-1.5 py-0.5 rounded-sm uppercase">
                            Contrato Ativo
                          </span>
                        )}
                        {marginBadge}
                        <span className="text-[9px] text-[#2D6A4F] font-mono leading-none truncate">
                          {firstWord}
                        </span>
                      </div>
                    </div>

                    <ChevronRight className={`size-4 text-slate-400 self-center shrink-0 transition-transform ${
                      isSel ? 'translate-x-1' : ''
                    }`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column - Perfil Completo do Cliente */}
        <div className={`lg:col-span-8 space-y-6 ${
          showMobileProfile ? 'block' : 'hidden lg:block'
        }`}>
          {activeClient ? (
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-6 shadow-xs relative text-left">
              
              {/* Back button for mobile */}
              <button
                type="button"
                onClick={() => setShowMobileProfile(false)}
                className="lg:hidden flex items-center gap-2 mb-4 p-2 bg-[#FAF9F6] text-xs font-bold rounded-lg border border-[#E8E6E1]"
              >
                <ArrowLeft className="size-4" /> Voltar para lista
              </button>

              {/* 1️⃣ CABEÇALHO DO PERFIL */}
              <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-slate-200/50 pb-5">
                <div className="space-y-2 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-display font-black text-[#141410] uppercase tracking-tight leading-snug">
                      {activeClient.name}
                    </h2>
                    <span className={`inline-block text-[9px] font-black px-2 py-1 rounded-md border ${clientHealth.bg} ${clientHealth.text} ${clientHealth.border}`}>
                      {clientHealth.label}
                    </span>
                  </div>
                  <p className="text-xs font-bold font-sans text-slate-500 flex items-center gap-1">{clientHealth.desc}</p>

                  {/* Grid Informações Principais */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <Phone className="size-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{activeClient.phone}</span>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <Mail className="size-3.5 text-slate-400 shrink-0" />
                      <span className="truncate underline">{activeClient.email}</span>
                    </p>
                    <p className="flex items-center gap-2 truncate">
                      <MapPin className="size-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{activeClient.address}</span>
                    </p>
                  </div>

                  {/* ATALHOS RÁPIDOS OPERACIONAIS (INTEGRAÇÃO DE MÓDULOS) */}
                  <div className="pt-4 mt-3 border-t border-slate-150 flex flex-wrap items-center gap-2 text-[10px]">
                    <span className="text-slate-400 font-extrabold uppercase tracking-wider mr-1">Atalhos Operacionais:</span>
                    
                    {/* Cross-Module Link to Calculator */}
                    <button
                      type="button"
                      onClick={() => navigate(`/calculator?clientId=${activeClient.id}`)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100/80 text-emerald-800 border border-emerald-200/50 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-none"
                    >
                      <Plus className="size-3" /> Novo Orçamento (Calculadora)
                    </button>

                    {/* Cross-Module Link to Calendar */}
                    <button
                      type="button"
                      onClick={() => navigate(`/agenda?clientId=${activeClient.id}`)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/50 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-none"
                    >
                      <Calendar className="size-3" /> Novo Serviço (Agenda)
                    </button>

                    {/* Cross-Module Link to Financial */}
                    <button
                      type="button"
                      onClick={() => navigate(`/financial?search=${activeClient.name}`)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100/80 text-indigo-800 border border-indigo-200/50 rounded-md font-bold transition-all flex items-center gap-1.5 cursor-pointer leading-none"
                    >
                      <DollarSign className="size-3" /> Extrato Financeiro
                    </button>

                    {/* Local profile tab switches */}
                    <button
                      type="button"
                      onClick={() => setActiveProfileTab('timeline')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all border cursor-pointer leading-none ${
                        activeProfileTab === 'timeline'
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Sua Linha de Tempo
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveProfileTab('garantias')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all border cursor-pointer leading-none ${
                        activeProfileTab === 'garantias'
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Painel de Garantias
                    </button>

                    <button
                      type="button"
                      onClick={() => setActiveProfileTab('documentos')}
                      className={`px-2.5 py-1 rounded-md font-bold transition-all border cursor-pointer leading-none ${
                        activeProfileTab === 'documentos'
                          ? 'bg-slate-900 border-slate-900 text-white'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      Documentos & Anexos
                    </button>
                  </div>
                </div>

                {/* Botões de Ação do Perfil */}
                <div className="flex flex-wrap gap-1.5 shrink-0 w-full md:w-auto md:justify-end">
                  <button
                    type="button"
                    onClick={() => navigate(`/calculator?clientId=${activeClient.id}`)}
                    className="flex-1 md:flex-none justify-center flex items-center gap-1 px-3 py-1.5 bg-[#1B3A2D] text-white hover:bg-[#2D6A4F] text-[9px] font-black uppercase tracking-wider rounded-lg cursor-pointer shadow-xs transition-colors"
                  >
                    <Plus className="size-3" /> Novo Orçamento / Serviço (Calculadora)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormReturnReason('Vistoria e reforço químico geral');
                      setFormReturnCost(120);
                      setIsNewReturnOpen(true);
                    }}
                    className="flex-1 md:flex-none justify-center flex items-center gap-1 px-3 py-1.5 bg-slate-50 border border-[#E8E6E1] text-[#141410] hover:bg-[#FAF9F6] text-[9px] font-black uppercase tracking-wider rounded-lg cursor-pointer"
                  >
                    <Plus className="size-3" /> Registrar Retorno
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditClientClick(activeClient)}
                    className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                    title="Editar Informações Cadastrais"
                  >
                    <Edit2 className="size-3" />
                  </button>
                </div>
              </div>

              {/* 2️⃣ RESUMO FINANCEIRO E OPERACIONAL (5 CARDS) */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 my-5">
                
                <div className="bg-slate-50/50 border border-[#E8E6E1]/50 p-2.5 rounded-xl">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Faturamento Total</p>
                  <p className="text-[13px] font-mono font-black text-[#1B3A2D] pt-0.5">
                    R$ {clientStats.faturamentoTotal.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </p>
                </div>

                <div className="bg-slate-50/50 border border-[#E8E6E1]/50 p-2.5 rounded-xl">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Serviços Feitos</p>
                  <p className="text-[13px] font-display font-black text-[#141410] pt-0.5">
                    {clientStats.servicosRealizados} executados
                  </p>
                </div>

                <div className="bg-slate-50/50 border border-[#E8E6E1]/50 p-2.5 rounded-xl">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Retornos Técnicos</p>
                  <p className="text-[13px] font-display font-black text-rose-800 pt-0.5">
                    {clientStats.retornos} solicitados
                  </p>
                </div>

                <div className="bg-slate-50/50 border border-[#E8E6E1]/50 p-2.5 rounded-xl">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Garantias Ativas</p>
                  <p className="text-[13px] font-display font-black text-sky-800 pt-0.5">
                    {clientStats.garantias} apólice
                  </p>
                </div>

                <div className="bg-slate-50/50 border border-[#E8E6E1]/50 p-2.5 rounded-xl col-span-2 md:col-span-1">
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Ticket Médio</p>
                  <p className="text-[13px] font-mono font-black text-slate-800 pt-0.5">
                    R$ {clientStats.ticketMedio.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                  </p>
                </div>

              </div>

              {/* Grid split: Inside Profile View */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
                
                {/* 3️⃣ SUB-ABAS DE HISTÓRICO COMPLETO */}
                <div className="xl:col-span-8 space-y-4 text-left w-full">
                  
                  {/* Navegador de Abas Horizontais */}
                  <div className="flex border-b border-slate-200 overflow-x-auto pb-0.5 gap-1 select-none whitespace-nowrap scrollbar-none">
                    {[
                      { id: 'servicos', label: 'Serviços' },
                      { id: 'orcamentos', label: 'Orçamentos' },
                      { id: 'contratos', label: 'Contratos' },
                      { id: 'financeiro', label: 'Financeiro' },
                      { id: 'documentos', label: 'Documentos' },
                      { id: 'garantias', label: 'Garantias' },
                      { id: 'retornos', label: 'Retornos' },
                      { id: 'timeline', label: 'Timeline' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveProfileTab(tab.id as any)}
                        className={`text-[9px] font-black uppercase tracking-widest px-3 py-2 border-b-2 transition-all cursor-pointer ${
                          activeProfileTab === tab.id 
                            ? 'border-[#1B3A2D] text-[#1b3a2d] font-black' 
                            : 'border-transparent text-slate-500 hover:text-[#141410]'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Conteúdo dinâmico da Aba selecionada */}
                  <div className="min-h-[290px] text-xs">
                    
                    {/* SERVIÇOS TAB */}
                    {activeProfileTab === 'servicos' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Histórico de OSs do Calendário</p>
                        </div>

                        {((agenda || []).filter(e => e.clientId === activeClient.id).length === 0) ? (
                          <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                            <Calendar className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                            <p className="font-bold text-[#141410]">Nenhuma ordem de serviço registrada</p>
                            <p className="text-[9px]">Gere novos serviços ou retornos para agendar no calendário operacional.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(agenda || []).filter(e => e.clientId === activeClient.id).map(s => (
                              <div key={s.id} className="p-3 bg-slate-50/50 hover:bg-slate-50 border border-[#E8E6E1]/60 rounded-xl flex items-center justify-between gap-3 text-left">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-[#141410] font-sans block">{s.title}</span>
                                    <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase ${
                                      s.type === 'retorno' ? 'bg-orange-50 text-orange-700' : 'bg-indigo-50 text-indigo-700'
                                    }`}>
                                      {s.type.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                    <Calendar className="size-3" /> Execução / Agendado: {s.date} {s.time ? `às ${s.time}` : ''}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full ${
                                    s.status === 'realizado' 
                                      ? 'bg-emerald-50 text-[#1B3A2D] border border-emerald-100' 
                                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                                  }`}>
                                    {s.status === 'realizado' ? '• Realizado' : '• Programado'}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setDetailServiceModal(s)}
                                    className="p-1 px-2 border border-slate-200 hover:border-slate-400 bg-white hover:bg-slate-50 text-[10px] font-bold rounded-lg cursor-pointer"
                                  >
                                    Visualizar OS
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* ORÇAMENTOS TAB */}
                    {activeProfileTab === 'orcamentos' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Orçamentos Propostos do Cliente</p>
                          <button
                            type="button"
                            onClick={() => navigate(`/calculator?clientId=${activeClient.id}`)}
                            className="text-[9px] font-black uppercase tracking-wider text-[#1B3A2D] hover:underline flex items-center gap-1"
                          >
                            <Plus className="size-3" /> Gerar Novo Orçamento
                          </button>
                        </div>

                        {((quotes?.list || []).filter(q => q.client?.name?.toLowerCase() === activeClient.name.toLowerCase() || (q as any).clientId === activeClient.id).length === 0) ? (
                          <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                            <FileText className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                            <p className="font-bold text-[#141410]">Nenhum orçamento registrado</p>
                            <p className="text-[9px]">Acesse a Calculadora para gerar propostas comerciais personalizadas.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(quotes?.list || []).filter(q => q.client?.name?.toLowerCase() === activeClient.name.toLowerCase() || (q as any).clientId === activeClient.id).map(q => (
                              <div key={q.id} className="p-3 bg-white border border-[#E8E6E1]/80 rounded-xl flex items-center justify-between gap-3 text-left">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[#141410]">Orçamento #{q.id}</span>
                                    <span className="text-[10px] text-slate-500">• {q.service?.pestType || 'Controle de Pragas'} ({q.service?.areaM2 || 0}m²)</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                                    <span>R$ {(q.pricing?.finalPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                    <span>•</span>
                                    <span>Criado em: {q.createdAt?.split('T')[0] || 'Hoje'}</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full ${
                                    q.status === 'aprovado' || q.status === 'executado'
                                      ? 'bg-emerald-50 text-[#1B3A2D] border border-emerald-100'
                                      : q.status === 'enviado'
                                      ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                      : 'bg-amber-50 text-amber-700 border border-amber-100'
                                  }`}>
                                    {q.status}
                                  </span>

                                  {q.status !== 'aprovado' && q.status !== 'executado' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setQuoteToSchedule(q);
                                        setIsScheduleModalOpen(true);
                                      }}
                                      className="px-2.5 py-1 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-bold rounded-lg cursor-pointer transition-all flex items-center gap-1"
                                    >
                                      <Calendar className="size-3" /> Aprovar / Agendar
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* CONTRATOS TAB */}
                    {activeProfileTab === 'contratos' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Contratos de Manutenção CIP Recorrentes</p>
                          <button
                            type="button"
                            onClick={openCreateContract}
                            className="text-[9px] font-black uppercase tracking-wider text-[#1B3A2D] hover:underline flex items-center gap-1"
                          >
                            <Plus className="size-3" /> Adicionar Contrato
                          </button>
                        </div>

                        {((contracts || []).filter(c => c.clientId === activeClient.id).length === 0) ? (
                          <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                            <FileText className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                            <p className="font-bold text-[#141410]">Nenhum contrato recorrente vinculado</p>
                            <p className="text-[9px]">Fidelize este cliente vinculando um faturamento recorrente preventivo.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(contracts || []).filter(c => c.clientId === activeClient.id).map(c => {
                              const reajustes = selectContratosParaReajuste(systemState);
                              const reajusteDoCliente = reajustes.find(r => r.contractId === c.id);
                              return (
                                <div key={c.id} className="p-3 bg-white border border-[#E8E6E1]/80 rounded-xl flex flex-col md:flex-row justify-between md:items-center gap-3 text-left">
                                  <div className="space-y-1">
                                    <h4 className="font-bold text-[#141410]">{c.title}</h4>
                                    <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-500">
                                      <span>Vigência: {c.startDate} até {c.endDate}</span>
                                      <span>•</span>
                                      <span>Fatura a cada {c.recurrencyMonths} m</span>
                                    </div>
                                    {reajusteDoCliente && (
                                      <div className="mt-1 inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-lg text-[9.5px] font-black">
                                        <AlertTriangle className="size-3 shrink-0 text-amber-600 animate-pulse" />
                                        Reajuste sugerido: R$ {reajusteDoCliente.suggestedValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}/mês (+{reajusteDoCliente.adjustment.toFixed(1)}%)
                                      </div>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-3 justify-between">
                                    <div>
                                      <p className="text-[8px] font-bold text-slate-400 uppercase text-right">Mensalidade</p>
                                      <p className="font-mono font-black text-emerald-800 text-xs">
                                        R$ {c.recurrentValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                                      </p>
                                    </div>
                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => openEditContract(c)}
                                        className="p-1 px-1.5 bg-slate-50 border border-[#E8E6E1] hover:border-slate-300 rounded hover:bg-slate-100 cursor-pointer text-slate-600 font-bold"
                                      >
                                        Edit
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* FINANCEIRO TAB */}
                    {activeProfileTab === 'financeiro' && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Extrato Financeiro e Fluxo de Caixa</p>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 bg-slate-50/50 p-2.5 border border-[#E8E6E1]/40 rounded-xl">
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Receita Líquida</span>
                            <p className="font-mono font-black text-emerald-850">R$ {clientStats.faturamentoTotal.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase font-semibold">Último Recebimento</span>
                            <p className="font-mono font-black text-slate-700">R$ 1.500,00</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Faturas Pendentes</span>
                            <p className="font-mono font-black text-amber-700">R$ {(activeClient.id === 'c-01' ? 3500 : 0).toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <span className="text-[8px] font-bold text-slate-500 uppercase">Inadimplência</span>
                            <p className="font-mono font-black text-rose-700">R$ {(activeClient.id === 'c-05' ? 1200 : 0).toLocaleString('pt-BR')}</p>
                          </div>
                        </div>

                        {/* Financial listings of transaction movements */}
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase">Lançamentos no Livro Caixa</span>
                          {movements.filter(m => m.description.toLowerCase().includes(activeClient.name.toLowerCase())).length === 0 ? (
                            <div className="p-3 bg-slate-50 rounded-xl text-slate-400 text-center">
                              Não há transações liquidadas registradas no módulo financeiro sob esta razão social.
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                              {movements.filter(m => m.description.toLowerCase().includes(activeClient.name.toLowerCase())).map(m => (
                                <div key={m.id} className="p-2.5 bg-white border border-[#E8E6E1]/50 rounded-lg flex items-center justify-between text-[11px]">
                                  <div className="space-y-0.5 text-left">
                                    <span className="font-bold text-slate-800 font-sans block">{m.description}</span>
                                    <span className="text-[9px] text-slate-500">{m.date} via {m.paymentMethod} • Ref: {m.costCenter}</span>
                                  </div>
                                  <div className="text-right font-mono">
                                    <span className={`font-black ${m.value > 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                                      {m.value > 0 ? '+' : ''} R$ {m.value.toLocaleString('pt-BR')}
                                    </span>
                                    <span className={`block text-[8px] font-black ${m.isPaid ? 'text-emerald-600' : 'text-rose-600'}`}>
                                      {m.isPaid ? 'CONCLUÍDO' : 'PENDENTE'}
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                    {/* DOCUMENTOS TAB */}
                    {activeProfileTab === 'documentos' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Documentos do Cliente & Certificados ANVISA</p>
                          
                          <label className="text-[9px] font-black uppercase tracking-wider text-[#1B3A2D] hover:underline flex items-center gap-1 cursor-pointer">
                            <Plus className="size-3" /> Anexar arquivo
                            <input
                              type="file"
                              accept=".pdf,.docx,.xlsx,.jpg,.png,.jpeg,.pptx"
                              className="hidden"
                              onChange={handleUploadDoc}
                            />
                          </label>
                        </div>

                        {/* List docs */}
                        {clientDocs.length === 0 ? (
                          <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                            <FileSpreadsheet className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                            <p className="font-bold text-[#141410]">Nenhum arquivo ou documento anexado</p>
                            <p className="text-[9px]">Gere certificados de dedetização de baratas ou faça upload de fotos.</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {clientDocs.map(doc => {
                              const isPdf = doc.type === 'pdf';
                              const isXls = doc.type === 'xlsx' || doc.type === 'xls';
                              const isDoc = doc.type === 'doc' || doc.type === 'docx';
                              const isImg = doc.type === 'png' || doc.type === 'jpg' || doc.type === 'jpeg';

                              return (
                                <div key={doc.id} className="p-3 bg-[#FAF9F6]/50 border border-[#E8E6E1]/80 rounded-xl flex items-center justify-between gap-3 text-left">
                                  <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="p-1.5 rounded-lg bg-white border border-[#E8E6E1] text-[#141410]">
                                      {isPdf && <FileText className="size-4 text-rose-600" />}
                                      {isXls && <FileSpreadsheet className="size-4 text-emerald-600" />}
                                      {isDoc && <FileCode className="size-4 text-blue-600" />}
                                      {isImg && <FileImage className="size-4 text-pink-650" />}
                                      {!isPdf && !isXls && !isDoc && !isImg && <FileText className="size-4" />}
                                    </div>
                                    <div className="overflow-hidden truncate">
                                      <span className="font-bold text-[#141410] text-[11px] block truncate" title={doc.name}>
                                        {doc.name}
                                      </span>
                                      <span className="text-[9px] text-[#6B6B5F] font-sans font-semibold">
                                        {doc.size} • Upload em {doc.uploadedAt}
                                      </span>
                                    </div>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => handleDeleteDoc(doc.id, doc.name)}
                                    className="p-1 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/50 rounded-md cursor-pointer shrink-0"
                                    title="Excluir documento"
                                  >
                                    <Trash2 className="size-3.5" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* GARANTIAS TAB */}
                    {activeProfileTab === 'garantias' && (
                      <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Apólices e Prazos de Garantias Técnicas</p>
                        
                        {clientWarranties.length === 0 ? (
                          <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                            <Clock className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                            <p className="font-bold text-[#141410]">Sem garantias preventivas ativas</p>
                            <p className="text-[9px]">Garantias são iniciadas automaticamente na conclusão de serviços.</p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {clientWarranties.map(w => {
                              const pct = w.daysLeft > 0 ? (w.daysLeft / 90) * 100 : 0;
                              return (
                                <div key={w.id} className="p-3 bg-white border border-[#E8E6E1] rounded-xl space-y-2 text-left">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <h4 className="font-bold text-[#141410]">Garantia: {w.title}</h4>
                                      <p className="text-[9px] text-slate-500 font-semibold">
                                        Aplicação feita em {w.execDate} • Cobertura integral até {w.expDate}
                                      </p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                      w.daysLeft > 0 ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
                                    }`}>
                                      {w.daysLeft > 0 ? `Restam ${w.daysLeft} d` : 'Expirada'}
                                    </span>
                                  </div>

                                  {/* Progress bar */}
                                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <div 
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        w.daysLeft > 20 ? 'bg-emerald-700' : 'bg-rose-600 animate-pulse'
                                      }`}
                                      style={{ width: `${Math.min(pct, 100)}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {/* RETORNOS TAB */}
                    {activeProfileTab === 'retornos' && (
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Chamados de Retornos Técnicos de Assistência</p>
                        </div>

                        {((agenda || []).filter(e => e.clientId === activeClient.id && e.type === 'retorno').length === 0) ? (
                          <div className="py-12 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-400">
                            <Activity className="size-6 mx-auto opacity-30 text-[#6B6B5F] mb-1" />
                            <p className="font-bold text-[#141410]">Sem solicitações de retorno</p>
                            <p className="text-[9px]">Gere chamados de retorno técnico gratuito se o cliente relatar reinfestação.</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {(agenda || []).filter(e => e.clientId === activeClient.id && e.type === 'retorno').map(ret => (
                              <div key={ret.id} className="p-3 bg-white border border-[#E8E6E1]/80 rounded-xl flex items-center justify-between gap-3 text-left">
                                <div className="space-y-1">
                                  <h4 className="font-bold text-[#141410]">{ret.title}</h4>
                                  <div className="flex gap-2 text-[10px] text-slate-500 font-semibold font-sans">
                                    <span>Data agendada: {ret.date}</span>
                                    <span>•</span>
                                    <span>Custo Estimado: R$ 120,00</span>
                                  </div>
                                </div>

                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-full ${
                                  ret.status === 'realizado' ? 'bg-slate-100 text-slate-600' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                }`}>
                                  {ret.status === 'realizado' ? 'Atendido' : 'Aguardando'}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TIMELINE TAB */}
                    {activeProfileTab === 'timeline' && (
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Histórico Cronológico Geral do Cliente</p>
                        
                        <div className="relative border-l-2 border-[#E8E6E1] ml-2 pb-2 space-y-4 pt-1">
                          {clientTimeline.map((item, idx) => (
                            <div key={item.id} className="relative pl-5 text-left">
                              
                              {/* Dot item inside timeline */}
                              <div className="absolute -left-[7px] top-0.5 size-3 rounded-full bg-white border-2 border-[#1B3A2D] flex items-center justify-center">
                                <div className="size-1 rounded-full bg-[#1B3A2D]" />
                              </div>

                              <div className="space-y-0.5">
                                <span className="font-mono text-[9px] text-[#2D6A4F] font-bold leading-none">
                                  {item.date}
                                </span>
                                <h5 className="text-[11px] font-bold text-[#141410] pt-0.5">
                                  {item.title}
                                </h5>
                                <p className="text-[10px] text-[#6B6B5F] leading-relaxed">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                  </div>

                </div>

                {/* 4️⃣ AI OPPORTUNITY CARD & DESEMPENHO FINANCEIRO */}
                <div className="xl:col-span-4 w-full space-y-4">
                  {/* Google Maps Location Card */}
                  <div className="bg-white p-5 border border-[#E8E6E1] rounded-2xl shadow-xxs space-y-4 text-left">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-display font-black text-[#141410] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                        <MapPin className="size-4 text-[#1D9E75]" />
                        Localização & Rota
                      </h4>
                      <span className="text-[9px] font-black uppercase text-[#1D9E75] bg-emerald-50 px-2 py-0.5 rounded-md">
                        Google Maps
                      </span>
                    </div>

                    <GoogleMapsViewer 
                      address={activeClient.address}
                      title={activeClient.name}
                      showRouteFromHq={true}
                      height="220px"
                    />

                    <div className="text-[10px] text-slate-500 font-semibold leading-normal font-sans">
                      <p className="font-bold text-slate-700">Endereço do Cliente:</p>
                      <p className="mt-0.5 text-slate-600">{activeClient.address}</p>
                    </div>
                  </div>

                  {activeRentabilidade && (
                    <div id="desempenho-financeiro-card" className="bg-white p-5 border border-[#E8E6E1] rounded-2xl shadow-xxs space-y-4 text-left">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-display font-black text-[#141410] uppercase tracking-wider flex items-center gap-1.5 font-sans">
                            <TrendingUp className="size-4 text-[#1B3A2D]" />
                            Desempenho Financeiro
                          </h4>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {activeRentabilidade.margemPercent > 40 && activeRentabilidade.qtdServicos > 5 && (
                            <span className="bg-amber-100 text-amber-900 border border-amber-250 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider leading-none">
                              ⭐ Cliente Premium
                            </span>
                          )}
                          {activeRentabilidade.taxaRetorno > 15 && (
                            <span className="bg-rose-100 text-rose-900 border border-rose-250 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider leading-none">
                              ⚠️ Atenção: Retornos
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="bg-emerald-50/20 border border-emerald-100/50 p-2.5 rounded-xl text-left">
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 font-sans block">Total Faturado</span>
                          <span className="text-[13px] font-mono font-black text-emerald-800 block mt-0.5">
                            R$ {activeRentabilidade.totalFaturado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>

                        <div className="bg-slate-50/50 border border-slate-150/50 p-2.5 rounded-xl text-left">
                          <span className="text-[8px] font-black uppercase tracking-wider text-slate-500 font-sans block">Margem Média</span>
                          <span className={`text-[13px] font-mono font-black block mt-0.5 ${
                            activeRentabilidade.margemPercent > 35 ? 'text-emerald-700' : activeRentabilidade.margemPercent >= 20 ? 'text-amber-700' : 'text-rose-700'
                          }`}>
                            {activeRentabilidade.margemPercent.toFixed(2)}%
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600 font-bold leading-relaxed">
                        <div className="flex justify-between items-center">
                          <span>Serviços Executados:</span>
                          <span className="font-mono text-slate-800 font-black">{activeRentabilidade.qtdServicos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Retornos Solicitados:</span>
                          <span className="font-mono text-rose-700 font-black">{activeRentabilidade.qtdRetornos}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Taxa de Retorno:</span>
                          <span className={`font-mono font-black ${activeRentabilidade.taxaRetorno > 15 ? 'text-rose-700' : 'text-emerald-700'}`}>
                            {activeRentabilidade.taxaRetorno.toFixed(2)}%
                          </span>
                        </div>
                        {activeRentabilidade.ultimoServico && (
                          <div className="flex justify-between items-center pt-1 border-t border-dashed border-slate-200">
                            <span>Último Atendimento:</span>
                            <span className="font-mono text-slate-700">{activeRentabilidade.ultimoServico.split('-').reverse().join('/')}</span>
                          </div>
                        )}
                        {activeRentabilidade.proximoVencimento && (
                          <div className="flex justify-between items-center">
                            <span>Próximo Vencimento:</span>
                            <span className="font-mono text-slate-700 font-black">{activeRentabilidade.proximoVencimento.split('-').reverse().join('/')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {aiOpportunity && (
                    <div className="bg-[#FAF9F6]/80 p-4 border border-[#E8E6E1] rounded-2xl space-y-3.5 text-left flex flex-col justify-between h-full">
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-1">
                          <span className="bg-amber-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-xs">
                            <Sparkles className="size-3 fill-white" /> Oportunidade IA
                          </span>
                          <span className="text-[9px] font-bold text-amber-800">{aiOpportunity.badge}</span>
                        </div>

                        <h4 className="text-xs font-display font-black text-[#141410] uppercase tracking-tight">
                          {aiOpportunity.title}
                        </h4>
                        
                        <p className="text-[10px] text-slate-600 leading-relaxed font-sans font-semibold">
                          {aiOpportunity.description}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#E8E6E1]/50 space-y-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#6B6B5F] font-bold">Volume de Negócio Estimado:</span>
                          <span className="font-mono font-black text-emerald-800">
                            R$ {aiOpportunity.estimatedValue.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => navigate(`/calculator?clientId=${activeClient.id}`)}
                          className="w-full justify-center flex items-center gap-2 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          <Check className="size-3.5" /> Gerar Orçamento
                        </button>
                      </div>

                    </div>
                  )}
                </div>

              </div>

              {/* ⚠️ GATILHOS DE CONFORMIDADE E ALERTAS SENSORIAIS */}
              <div className="mt-5 pt-4 border-t border-[#E8E6E1]/50 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 font-sans">Gatilhos de Conformidade DDSulf</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  
                  {activeClient.id === 'c-05' ? (
                    <div className="p-2.5 rounded-xl border border-rose-100 bg-rose-50/20 text-[10px] text-[#C53030] flex items-start gap-2">
                      <span className="shrink-0 pt-0.5">🔴</span>
                      <div>
                        <span className="font-bold block uppercase tracking-wide">Inatividade Crítica</span>
                        <p className="text-slate-500 pt-0.5 font-semibold font-sans">O faturamento acumulou prejuízo de contato há 8 competências sucessivas.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/20 text-[10px] text-emerald-800 flex items-start gap-2">
                      <span className="shrink-0 pt-0.5">🟢</span>
                      <div>
                        <span className="font-bold block uppercase tracking-wide">Regularidade do Atendimento</span>
                        <p className="text-slate-500 pt-0.5 font-semibold font-sans">Status em conformidade com as metas do plano de qualidade ANVISA.</p>
                      </div>
                    </div>
                  )}

                  {activeClient.id === 'c-01' ? (
                    <div className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/20 text-[10px] text-amber-800 flex items-start gap-2">
                      <span className="shrink-0 pt-0.5">🟡</span>
                      <div>
                        <span className="font-bold block uppercase tracking-wide">Comprometimento de Risco</span>
                        <p className="text-slate-500 pt-0.5 font-semibold font-sans">Lançamentos em aberto identificados no extrato do livro caixa.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/20 text-[10px] text-[#1B3A2D] flex items-start gap-2">
                      <span className="shrink-0 pt-0.5">🟢</span>
                      <div>
                        <span className="font-bold block uppercase tracking-wide">Faturamento Adimplente</span>
                        <p className="text-slate-500 pt-0.5 font-semibold font-sans">Sem histórico ou registros na fila de cobrança.</p>
                      </div>
                    </div>
                  )}

                  {clientWarranties.some(w => w.status === 'active') ? (
                    <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50/20 text-[10px] text-[#1B3A2D] flex items-start gap-2">
                      <span className="shrink-0 pt-0.5">🟢</span>
                      <div>
                        <span className="font-bold block uppercase tracking-wide">Vistoria e Proteção</span>
                        <p className="text-slate-500 pt-0.5 font-semibold font-sans">Apólice de garantia operacional vigente contra vetores urbanos.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-xl border border-amber-100 bg-amber-50/20 text-[10px] text-amber-800 flex items-start gap-2">
                      <span className="shrink-0 pt-0.5">🟡</span>
                      <div>
                        <span className="font-bold block uppercase tracking-wide">Reserva Cobertura Expirada</span>
                        <p className="text-slate-500 pt-0.5 font-semibold font-sans">Imóvel sem apólices de dedetização ativas baseadas em monitoramentos.</p>
                      </div>
                    </div>
                  )}

                </div>
              </div>

            </div>
          ) : (
            <div className="py-24 border-2 border-dashed border-[#E8E6E1] rounded-2xl text-center text-slate-450 bg-white">
              <Users className="size-10 mx-auto opacity-30 text-[#6B6B5F] mb-2" />
              <p className="font-sans font-black text-[#141410] uppercase tracking-wider">Centro de Relacionamento Operacional</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2">
                Selecione ou pesquise um cliente na coluna esquerda para acessar a ficha completa e gerenciar históricos de forma integrada.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* ===================== INLINE MODALS AND DIALOGS ===================== */}

      {/* 🔮 MODAL 1: CADASTRAR OU EDITAR CLIENTES */}
      <AnimatePresence>
        {isClientModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E8E6E1] rounded-2xl max-w-md w-full overflow-hidden shadow-xl text-left"
            >
              <div className="px-6 py-4 border-b border-[#FAF9F6] flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-[#141410] text-xs uppercase tracking-wider">
                    {clientModalMode === 'create' ? 'Cadastrar Novo Cliente' : 'Editar Dados do Cliente'}
                  </h3>
                  <p className="text-[10px] text-[#6B6B5F] mt-0.5 font-semibold font-sans">Cadastre dados fiscais básicos e informações principais.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="p-1 px-1.5 border border-[#E8E6E1] hover:bg-slate-50 hover:text-[#141410] rounded-lg text-slate-400 cursor-pointer transition-all"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveClient} className="p-6 space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Nome Relevante / Razão Social *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: DDSulf Volta Redonda Alimentações Ltda"
                    value={formClientName}
                    onChange={(e) => setFormClientName(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">CPF / CNPJ</label>
                    <input
                      type="text"
                      placeholder="Ex: 12.345.678/0001-90"
                      value={formClientCnpjCpf}
                      onChange={(e) => setFormClientCnpjCpf(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Perfil do Cliente</label>
                    <select
                      value={formClientType}
                      onChange={(e) => setFormClientType(e.target.value as any)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none h-[34px]"
                    >
                      <option value="B2B">🏢 B2B (Corporativo / Condomínio)</option>
                      <option value="B2C">👤 B2C (Pessoa Física / Residencial)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Telefone de Contato</label>
                    <input
                      type="text"
                      placeholder="Ex: (24) 3340-9900"
                      value={formClientPhone}
                      onChange={(e) => setFormClientPhone(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">E-mail para Faturas</label>
                    <input
                      type="email"
                      placeholder="Ex: contato@empresa.com"
                      value={formClientEmail}
                      onChange={(e) => setFormClientEmail(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Endereço Completo</label>
                  <textarea
                    placeholder="Ex: Rua das Flores, 450 - Curitiba - PR"
                    value={formClientAddress}
                    onChange={(e) => setFormClientAddress(e.target.value)}
                    rows={2}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>

                <div className="pt-4 border-t border-[#FAF9F6] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsClientModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141410] text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-wider tracking-widest rounded-lg cursor-pointer flex items-center gap-1 font-semibold"
                  >
                    <Check className="size-3.5" /> Salvar Cliente
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔮 MODAL 2: CRIAR OU EDITAR CONTRATOS */}
      <AnimatePresence>
        {isContractModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E8E6E1] rounded-2xl max-w-md w-full overflow-hidden shadow-xl text-left"
            >
              <div className="px-6 py-4 border-b border-[#FAF9F6] flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-[#141410] text-xs uppercase tracking-wider">
                    {contractModalMode === 'create' ? 'Agendar Novo Contrato' : 'Editar Plano Recorrente'}
                  </h3>
                  <p className="text-[10px] text-[#6B6B5F] mt-0.5">Defina vigência, valores e a recorrência mensal de atendimento.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="p-1 text-[#6B6B5F] hover:text-[#141410] rounded-lg transition-all"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveContract} className="p-6 space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Título / Escopo do Contrato *</label>
                  <input
                    type="text"
                    required
                    value={formContractTitle}
                    onChange={(e) => setFormContractTitle(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Valor Mensal (Recorrente)</label>
                    <input
                      type="number"
                      required
                      value={formContractRecurrent}
                      onChange={(e) => setFormContractRecurrent(Number(e.target.value))}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-mono text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Frequência Cobrança</label>
                    <select
                      value={formContractRecurrency}
                      onChange={(e) => setFormContractRecurrency(Number(e.target.value))}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1]/90 rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                    >
                      <option value={1}>Todo Mês</option>
                      <option value={2}>Bimestral (2 em 2 m)</option>
                      <option value={3}>Trimestral (3 em 3 m)</option>
                      <option value={6}>Semestral (6 em 6 m)</option>
                      <option value={12}>Anual</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Início Vigência</label>
                    <input
                      type="date"
                      required
                      value={formContractStart}
                      onChange={(e) => setFormContractStart(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Fim Vigência</label>
                    <input
                      type="date"
                      required
                      value={formContractEnd}
                      onChange={(e) => setFormContractEnd(e.target.value)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D]"
                    />
                  </div>
                </div>

                {contractModalMode === 'edit' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Status do Contrato</label>
                    <select
                      value={formContractStatus}
                      onChange={(e) => setFormContractStatus(e.target.value as any)}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410]"
                    >
                      <option value="ativo">Ativo e Regularizado</option>
                      <option value="vencido">Vencido</option>
                      <option value="cancelado">Cancelado pelo Cliente</option>
                    </select>
                  </div>
                )}

                <div className="pt-4 border-t border-[#FAF9F6] flex justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsContractModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141410] text-[10px] font-black uppercase tracking-wider rounded-lg"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-wider rounded-lg"
                  >
                    Salvar Compromisso
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔮 MODAL 5: REGISTRAR CHAMADO DE RETORNO TÉCNICO COMPARTILHADO */}
      <AnimatePresence>
        {isNewReturnOpen && activeClient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E8E6E1] rounded-2xl max-w-sm w-full overflow-hidden shadow-xl text-left"
            >
              <div className="px-6 py-4 border-b border-[#FAF9F6] flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-[#141410] text-xs uppercase tracking-wider">Registrar Chamado Retorno: {activeClient.name}</h3>
                  <p className="text-[10px] text-[#6B6B5F] mt-0.5 font-semibold">Insira justificativas de reinfestação reportados pelo cliente.</p>
                </div>
                <button type="button" onClick={() => setIsNewReturnOpen(false)} className="p-1"><X className="size-4" /></button>
              </div>

              <form onSubmit={handleAddReturnSubmission} className="p-6 space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Motivo Relatado pelo Cliente</label>
                  <input type="text" required value={formReturnReason} onChange={(e) => setFormReturnReason(e.target.value)} className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs animate-none" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase font-semibold">Data Solicitada</label>
                    <input type="date" required value={formReturnDate} onChange={(e) => setFormReturnDate(e.target.value)} className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-slate-550" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-500 uppercase">Custo Frota/Deslocamento</label>
                    <input type="number" required value={formReturnCost} onChange={(e) => setFormReturnCost(Number(e.target.value))} className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-mono" />
                  </div>
                </div>

                <div className="space-y-1 font-sans">
                  <label className="text-[10px] font-black text-slate-500 uppercase">Histórico e Observações</label>
                  <textarea rows={2} value={formReturnNotes} onChange={(e) => setFormReturnNotes(e.target.value)} className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg p-2.5 text-xs text-slate-600" />
                </div>

                <div className="pt-4 border-t border-[#FAF9F6] flex justify-end gap-2.5">
                  <button type="button" onClick={() => setIsNewReturnOpen(false)} className="px-4 py-2 bg-slate-100 uppercase text-[9px] font-black rounded-lg">Voltar</button>
                  <button type="submit" className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white uppercase text-[9px] font-black rounded-lg">Gerar OS de Retorno</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔮 MODAL 6: DETALHES DE LEITURA COMPLETA DA OS */}
      <AnimatePresence>
        {detailServiceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E8E6E1] rounded-3xl max-w-md w-full overflow-hidden shadow-2xl text-left"
            >
              <div className="px-6 py-4 bg-[#FAF9F6] border-b border-[#E8E6E1] flex items-center justify-between">
                <div>
                  <span className="text-[8px] font-black bg-[#1B3A2D] text-white px-2 py-0.5 rounded-md uppercase tracking-wider">DDSulf Ordem de Serviço</span>
                  <h3 className="font-display font-black text-xs text-[#141410] uppercase tracking-wider mt-1">Nº OS-{detailServiceModal.id}</h3>
                </div>
                <button type="button" onClick={() => setDetailServiceModal(null)} className="p-1 px-2 border border-slate-250 bg-white hover:bg-slate-100 text-xs font-bold rounded-lg cursor-pointer"><X className="size-4" /></button>
              </div>

              <div className="p-6 space-y-4 font-sans text-xs">
                
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-slate-400">Cliente Assistido</label>
                  <p className="text-[#141410] text-sm font-bold font-display uppercase tracking-tight">{detailServiceModal.clientName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block pb-0.5">Tipo de Atividade</label>
                    <span className="px-2.5 py-1 bg-indigo-50 text-indigo-850 border border-indigo-100 rounded-md font-bold text-[10px] uppercase">
                      {detailServiceModal.type.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400 block pb-0.5">Status Execução</label>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      detailServiceModal.status === 'realizado' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {detailServiceModal.status === 'realizado' ? '• Realizado' : '• Programado'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400">Data Agendamento</label>
                    <p className="font-bold text-slate-800 pt-0.5 flex items-center gap-1">
                      <Calendar className="size-3.5 text-slate-400" /> {detailServiceModal.date}
                    </p>
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-slate-400">Horário Previsto</label>
                    <p className="font-bold text-slate-800 pt-0.5 flex items-center gap-1">
                      <Clock className="size-3.5 text-slate-400" /> {detailServiceModal.time || 'Grade Flexível'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1 border-t border-slate-100 pt-3">
                  <label className="text-[9px] font-black uppercase text-slate-400 block">Indicações e Observações Técnicas</label>
                  <p className="p-3 bg-slate-50 border border-[#E8E6E1]/50 italic rounded-lg text-slate-600 font-medium font-sans leading-relaxed">
                    "{detailServiceModal.notes || 'Nenhuma nota especial anexa por parte da engenharia operacional DDSulf.'}"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailServiceModal(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141410] text-[9px] font-black uppercase tracking-wider rounded-lg"
                  >
                    Fechar Detalhes
                  </button>
                  {detailServiceModal.status !== 'realizado' && (
                    <button
                      type="button"
                      onClick={() => {
                        // Mark as executed inside mock flow
                        toast.success('Serviço assinado pelos técnicos!', { description: `Ficha OS-${detailServiceModal.id} consolidada com sucesso.` });
                        setDetailServiceModal(null);
                      }}
                      className="px-4 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[9px] font-black uppercase tracking-wider rounded-lg"
                    >
                      Assinar Conclusão
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* AgendarServicoModal for Budget Approvals */}
      {quoteToSchedule && (
        <AgendarServicoModal
          quote={quoteToSchedule}
          isOpen={isScheduleModalOpen}
          onClose={() => {
            setIsScheduleModalOpen(false);
            setQuoteToSchedule(null);
          }}
          onConfirm={handleConfirmScheduleFromClientPage}
        />
      )}

    </div>
  );
}
