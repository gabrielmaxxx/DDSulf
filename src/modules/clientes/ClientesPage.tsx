import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  useSystemStore, 
  Client, 
  Contract, 
  AgendaEvent, 
  Quote, 
  selectClienteRentabilidade, 
  ClienteRentabilidade, 
  selectContratosParaReajuste 
} from '@/store/systemStore';
import { tenantStorage } from '@/utils/storage';
import { 
  UserPlus,
  Download
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { HeaderMetric, HeaderMetricGroup } from '@/components/HeaderMetric';
import { AgendarServicoModal } from '@/modules/confirmacoes/AgendarServicoModal';

// Extracted Sub-Components
import { ClientesListView } from './components/ClientesListView';
import { ClientProfileSheet, ClientDoc } from './components/ClientProfileSheet';
import { ClientFormDialog } from './components/ClientFormDialog';
import { ContractFormDialog } from './components/ContractFormDialog';
import { NewReturnDialog } from './components/NewReturnDialog';
import { ServiceOrderDetailDialog } from './components/ServiceOrderDetailDialog';

type ExtendedClient = Client & {
  type?: 'B2B' | 'B2C';
};

const SIMULATED_TODAY = '2026-06-05';
const INITIAL_DOCS: Record<string, ClientDoc[]> = {};

export function ClientesPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const systemState = useSystemStore();
  const { 
    clients, 
    contracts, 
    quotes, 
    agenda, 
    financial,
    addClient,
    updateClient,
    addContract,
    updateContract,
    addAgendaEvent,
    addQuote,
    updateQuoteStatus,
    scheduleApprovedQuote,
    markAsRetorno
  } = systemState;

  // Active view states
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeProfileTab, setActiveProfileTab] = useState<'servicos' | 'orcamentos' | 'contratos' | 'financeiro' | 'documentos' | 'garantias' | 'retornos' | 'timeline'>('servicos');

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

  // New Return Modal State
  const [isNewReturnOpen, setIsNewReturnOpen] = useState(false);

  // Client form states
  const [formClientName, setFormClientName] = useState('');
  const [formClientCnpjCpf, setFormClientCnpjCpf] = useState('');
  const [formClientEmail, setFormClientEmail] = useState('');
  const [formClientPhone, setFormClientPhone] = useState('');
  const [formClientAddress, setFormClientAddress] = useState('');
  const [formClientType, setFormClientType] = useState<'B2B' | 'B2C'>('B2B');

  // Contract form states
  const [formContractTitle, setFormContractTitle] = useState('');
  const [formContractRecurrent, setFormContractRecurrent] = useState(1200);
  const [formContractRecurrency, setFormContractRecurrency] = useState(1);
  const [formContractStart, setFormContractStart] = useState(SIMULATED_TODAY);
  const [formContractEnd, setFormContractEnd] = useState('2027-06-05');
  const [formContractStatus, setFormContractStatus] = useState<'ativo' | 'vencido' | 'cancelado'>('ativo');

  // New Return Visit Form states
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

    const activeClientsCount = Math.max(0, total - inactiveCount);

    return {
      total,
      activeClients: activeClientsCount,
      activeContracts,
      activeWarranties: activeWarrantiesCount + 1,
      inactive: inactiveCount
    };
  }, [clients, contracts, agenda]);

  // List filtering logic
  const filteredClients = useMemo(() => {
    return (clients || []).filter(c => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = 
        c.name.toLowerCase().includes(lowerSearch) ||
        c.phone.toLowerCase().includes(lowerSearch) ||
        c.address.toLowerCase().includes(lowerSearch) ||
        c.cnpjCpf.toLowerCase().includes(lowerSearch);

      if (!matchesSearch) return false;

      if (statusFilter === 'all') return true;
      if (statusFilter === 'ativos') {
        const hasContracts = (contracts || []).some(contr => contr.clientId === c.id && contr.status === 'ativo');
        const recentServices = (agenda || []).some(e => e.clientId === c.id && e.status === 'realizado');
        return hasContracts || recentServices;
      }
      if (statusFilter === 'inativos') {
        const clientEvents = (agenda || []).filter(e => e.clientId === c.id && e.status === 'realizado');
        if (clientEvents.length === 0) return true;
        const dates = clientEvents.map(e => new Date(e.date).getTime());
        const maxDate = Math.max(...dates);
        const diffDays = (new Date(SIMULATED_TODAY).getTime() - maxDate) / (1000 * 60 * 60 * 24);
        return diffDays > 90;
      }
      if (statusFilter === 'garantias') {
        const clientEvents = (agenda || []).filter(e => e.clientId === c.id && e.status === 'realizado');
        return clientEvents.some(s => {
          const exec = new Date(s.date + 'T00:00:00');
          const exp = new Date(exec);
          exp.setDate(exp.getDate() + 90);
          return exp > new Date();
        });
      }
      if (statusFilter === 'contratos') {
        return (contracts || []).some(contr => contr.clientId === c.id && contr.status === 'ativo');
      }
      if (statusFilter === 'inadimplentes') {
        return movements.some(m => m.description.toLowerCase().includes(c.name.toLowerCase()) && !m.isPaid);
      }
      return true;
    });
  }, [clients, contracts, agenda, searchTerm, statusFilter, movements]);

  // Active client object
  const activeClient = useMemo(() => {
    if (selectedClientId) {
      const found = (clients || []).find(c => c.id === selectedClientId);
      if (found) return found;
    }
    return null;
  }, [clients, selectedClientId]);

  // Listen for clientId and activeTab in URL parameters
  useEffect(() => {
    const cid = searchParams.get('clientId');
    if (cid && clients && clients.length > 0) {
      const exists = clients.some(c => c.id === cid);
      if (exists) {
        setSelectedClientId(cid);
        setIsProfileOpen(true);
        const tab = searchParams.get('activeTab');
        if (tab && ['servicos', 'orcamentos', 'contratos', 'financeiro', 'documentos', 'garantias', 'retornos', 'timeline'].includes(tab)) {
          setActiveProfileTab(tab as any);
        }
      }
    }
  }, [searchParams, clients]);

  // Handle document database state sync on select
  useEffect(() => {
    if (activeClient) {
      const stored = tenantStorage.getItem(`client_docs_${activeClient.id}`);
      if (stored) {
        try {
          setClientDocs(JSON.parse(stored));
        } catch {
          setClientDocs([]);
        }
      } else {
        const initial = INITIAL_DOCS[activeClient.id] || [];
        tenantStorage.setItem(`client_docs_${activeClient.id}`, JSON.stringify(initial));
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
    const contractSum = clientContracts.reduce((acc, c) => acc + (c.status === 'ativo' ? c.recurrentValue : 0), 0);

    const faturamentoTotal = movSum + contractSum;

    // Ticket médio
    const ticketMedio = servicosRealizados > 0 ? Number((faturamentoTotal / servicosRealizados).toFixed(2)) : 0;

    // Garantias Ativas
    const garantiasList = clientCompleted.filter(s => {
      const exec = new Date(s.date + 'T00:00:00');
      const exp = new Date(exec);
      exp.setDate(exp.getDate() + 90);
      return exp > new Date();
    });
    const garantias = garantiasList.length;

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

  // Customer health calculation based on real records
  const clientHealth = useMemo(() => {
    if (!activeClient) return { label: 'Inativo', color: 'gray', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200', desc: 'Nenhum cliente selecionado.' };
    
    // Check overdue/unpaid invoices
    const hasUnpaidMovements = movements.some(m => m.description.toLowerCase().includes(activeClient.name.toLowerCase()) && !m.isPaid);
    if (hasUnpaidMovements) {
      return { 
        label: 'Atenção / Cobrança', 
        color: 'yellow', 
        bg: 'bg-amber-50', 
        text: 'text-amber-800', 
        border: 'border-amber-200',
        desc: '⚠️ Constatadas pendências financeiras em aberto.' 
      };
    }

    // Check last service date
    const clientCompleted = (agenda || []).filter(e => e.clientId === activeClient.id && e.status === 'realizado');
    if (clientCompleted.length > 0) {
      const lastService = clientCompleted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const daysSinceLast = Math.floor((new Date().getTime() - new Date(lastService.date).getTime()) / (1000 * 60 * 60 * 24));
      if (daysSinceLast > 180) {
        return { 
          label: 'Cliente Inativo / Risco', 
          color: 'red', 
          bg: 'bg-rose-50', 
          text: 'text-rose-700', 
          border: 'border-rose-100',
          desc: `🔴 Sem atendimentos realizados há mais de ${daysSinceLast} dias.` 
        };
      }
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
        desc: '🟢 Cliente estratégico com contrato mensal ativo.' 
      };
    }

    return { 
      label: 'Relacionamento Regular', 
      color: 'green', 
      bg: 'bg-sky-50', 
      text: 'text-sky-850', 
      border: 'border-sky-200',
      desc: '🟢 Sem pendências financeiras ou operacionais.' 
    };
  }, [activeClient, contracts, movements, agenda]);

  // IA Opportunities Generation dynamically from client state
  const aiOpportunity = useMemo(() => {
    if (!activeClient) return null;

    const clientContracts = (contracts || []).filter(c => c.clientId === activeClient.id);
    const hasActiveContract = clientContracts.some(c => c.status === 'ativo');
    const clientServices = (agenda || []).filter(e => e.clientId === activeClient.id && e.status === 'realizado');

    if (!hasActiveContract && getClientType(activeClient) === 'B2B') {
      return {
        badge: "Fidelização B2B",
        title: "Upgrade para Plano Multisserviço",
        description: "Oferecer contrato CIP mensal cobrindo dedetização + desratização para previsibilidade de custos e atendimento contínuo.",
        estimatedValue: 1800,
        pct: 75
      };
    }

    if (clientServices.length > 0) {
      const lastService = clientServices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
      const days = Math.floor((new Date().getTime() - new Date(lastService.date).getTime()) / (1000 * 60 * 60 * 24));
      if (days >= 90) {
        return {
          badge: "Reativação Preventiva",
          title: "Renovação de Reforço Sanitário",
          description: `Último atendimento executado há ${days} dias. Momento propício para contato preventivo e agendamento de inspeção.`,
          estimatedValue: 850,
          pct: 85
        };
      }
    }

    return {
      badge: "Cross-selling Ativo",
      title: "Inspeção Preventiva Completa",
      description: "Sugerir vistoria técnica preventiva para controle integrado de pragas urbanas.",
      estimatedValue: 1200,
      pct: 60
    };
  }, [activeClient, contracts, agenda]);

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

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [activeClient, agenda, contracts]);

  // Client Warranties list
  const clientWarranties = useMemo(() => {
    if (!activeClient) return [];
    
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

    return result;
  }, [activeClient, agenda]);

  // Contratos para reajuste selector
  const contratosParaReajuste = useMemo(() => {
    return selectContratosParaReajuste({ contracts, quotes, agenda } as any);
  }, [contracts, quotes, agenda]);

  // Documents Local Persistence Operations
  const handleUploadDoc = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !activeClient) return;
    const file = e.target.files[0];
    const extension = file.name.split('.').pop() || 'pdf';
    
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const displaySize = sizeMB === '0.0' ? `${Math.ceil(file.size / 1024)} KB` : `${sizeMB} MB`;

    const newDoc: ClientDoc = {
      id: `doc-${Math.random().toString(36).substr(2, 9)}`,
      name: file.name,
      type: extension.toLowerCase(),
      size: displaySize,
      uploadedAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newDoc, ...clientDocs];
    setClientDocs(updated);
    tenantStorage.setItem(`client_docs_${activeClient.id}`, JSON.stringify(updated));
    toast.success('Documento carregado!', { description: `Arquivo "${file.name}" anexado com sucesso.` });
  };

  const handleDeleteDoc = (docId: string, docName: string) => {
    if (!activeClient) return;
    const updated = clientDocs.filter(d => d.id !== docId);
    setClientDocs(updated);
    tenantStorage.setItem(`client_docs_${activeClient.id}`, JSON.stringify(updated));
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
      setIsProfileOpen(true);
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
      markAsRetorno(targetQuoteId, returnCostNum, 'Técnico Responsável', formReturnNotes);
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

  const handleConfirmScheduleFromClientPage = (scheduledDate: string, scheduledTime: string, technician: string, employeeId?: string) => {
    if (!quoteToSchedule) return;
    scheduleApprovedQuote(quoteToSchedule.id, scheduledDate, scheduledTime, technician, employeeId);
    updateQuoteStatus(quoteToSchedule.id, 'aprovado');
    setIsScheduleModalOpen(false);
    setQuoteToSchedule(null);
    toast.success('Orçamento aprovado e serviço agendado com sucesso!');
  };

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setIsProfileOpen(true);
  };

  return (
    <div className="space-y-6 text-left animate-in fade-in duration-500">
      {/* 📋 UPPER TOPO HEADER COM HEADERMETRIC */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-200/50 pb-6">
        <div className="flex flex-col xl:flex-row xl:items-center gap-6 xl:gap-8">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1B3A2D] bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/60">
              Relacionamento & CRM
            </span>
            <h1 className="text-3xl lg:text-4xl font-display font-black text-[#141410] tracking-tight leading-none uppercase mt-2">
              Clientes
            </h1>
            <p className="text-slate-500 font-sans text-sm mt-1.5 font-medium leading-relaxed max-w-lg">
              Central de relacionamento operacional. Gerencie histórico completo de serviços, contratos, garantias e documentações.
            </p>
          </div>

          {/* Header Metrics */}
          <HeaderMetricGroup id="header-metrics-clientes" className="pt-2 xl:pt-0 border-t xl:border-t-0 xl:border-l border-slate-200/60 xl:pl-8">
            <HeaderMetric
              id="metric-clientes-ativos"
              label="Clientes Ativos"
              value={`${kpis.activeClients}`}
              delta={{ value: '+4 novos', direction: 'up' }}
            />
            <HeaderMetric
              id="metric-contratos-vencendo"
              label="Contratos Ativos"
              value={`${kpis.activeContracts}`}
              delta={{ value: '100% regulares', direction: 'neutral' }}
            />
            <HeaderMetric
              id="metric-garantias-ativas"
              label="Garantias Vigentes"
              value={`${kpis.activeWarranties}`}
              delta={{ value: 'Proteção ativa', direction: 'neutral' }}
            />
            <HeaderMetric
              id="metric-inativos-alerta"
              label="Alerta Inatividade"
              value={`${kpis.inactive}`}
              delta={kpis.inactive > 0 ? { value: '> 90 dias', direction: 'down' } : undefined}
            />
          </HeaderMetricGroup>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button 
            type="button"
            onClick={handleCreateClientClick}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#1B3A2D] text-white hover:bg-[#2D6A4F] text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-sm h-11"
            id="btn-novo-cliente"
          >
            <UserPlus className="size-4" /> Novo Cliente
          </Button>
          <Button 
            type="button"
            variant="outline"
            onClick={() => toast.success("Lista exportada!", { description: `${filteredClients.length} contatos salvos no formato CSV.` })}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[#E8E6E1] text-[#141410] hover:bg-[#FAF9F6] text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-sm h-11"
            id="btn-exportar-clientes"
          >
            <Download className="size-4" /> Exportar Lista
          </Button>
        </div>
      </header>

      {/* 🚀 LISTA PRINCIPAL EM LARGURA TOTAL */}
      <ClientesListView
        clients={filteredClients}
        contracts={contracts || []}
        clientRentabilities={clientRentabilities}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        selectedClientId={selectedClientId}
        onSelectClient={handleSelectClient}
        onEditClient={handleEditClientClick}
        getClientType={getClientType}
        isClientIncomplete={isClientIncomplete}
      />

      {/* 📑 FICHA DO CLIENTE NO SHEET LATERAL */}
      <ClientProfileSheet
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        client={activeClient}
        clientStats={clientStats}
        clientHealth={clientHealth}
        activeRentabilidade={activeRentabilidade}
        aiOpportunity={aiOpportunity}
        clientTimeline={clientTimeline}
        clientWarranties={clientWarranties}
        clientDocs={clientDocs}
        agenda={agenda || []}
        quotes={quotes || { list: [] }}
        contracts={contracts || []}
        movements={movements}
        contratosParaReajuste={contratosParaReajuste}
        activeProfileTab={activeProfileTab}
        setActiveProfileTab={setActiveProfileTab}
        onEditClient={handleEditClientClick}
        onCreateContract={openCreateContract}
        onEditContract={openEditContract}
        onNewReturn={() => setIsNewReturnOpen(true)}
        onViewServiceOrder={(s) => setDetailServiceModal(s)}
        onScheduleQuote={(q) => {
          setQuoteToSchedule(q);
          setIsScheduleModalOpen(true);
        }}
        onUploadDoc={handleUploadDoc}
        onDeleteDoc={handleDeleteDoc}
      />

      {/* 🔮 MODAL 1: CADASTRAR OU EDITAR CLIENTES */}
      <ClientFormDialog
        open={isClientModalOpen}
        onOpenChange={setIsClientModalOpen}
        mode={clientModalMode}
        name={formClientName}
        setName={setFormClientName}
        cnpjCpf={formClientCnpjCpf}
        setCnpjCpf={setFormClientCnpjCpf}
        clientType={formClientType}
        setClientType={setFormClientType}
        phone={formClientPhone}
        setPhone={setFormClientPhone}
        email={formClientEmail}
        setEmail={setFormClientEmail}
        address={formClientAddress}
        setAddress={setFormClientAddress}
        onSubmit={handleSaveClient}
      />

      {/* 🔮 MODAL 2: CADASTRAR OU EDITAR CONTRATOS */}
      <ContractFormDialog
        open={isContractModalOpen}
        onOpenChange={setIsContractModalOpen}
        mode={contractModalMode}
        title={formContractTitle}
        setTitle={setFormContractTitle}
        recurrent={formContractRecurrent}
        setRecurrent={setFormContractRecurrent}
        recurrency={formContractRecurrency}
        setRecurrency={setFormContractRecurrency}
        startDate={formContractStart}
        setStartDate={setFormContractStart}
        endDate={formContractEnd}
        setEndDate={setFormContractEnd}
        status={formContractStatus}
        setStatus={setFormContractStatus}
        onSubmit={handleSaveContract}
      />

      {/* 🔮 MODAL 3: NOVO RETORNO */}
      <NewReturnDialog
        open={isNewReturnOpen}
        onOpenChange={setIsNewReturnOpen}
        clientName={activeClient?.name || ''}
        reason={formReturnReason}
        setReason={setFormReturnReason}
        date={formReturnDate}
        setDate={setFormReturnDate}
        cost={formReturnCost}
        setCost={setFormReturnCost}
        notes={formReturnNotes}
        setNotes={setFormReturnNotes}
        onSubmit={handleAddReturnSubmission}
      />

      {/* 🔮 MODAL 4: DETALHES DA ORDEM DE SERVIÇO */}
      <ServiceOrderDetailDialog
        open={!!detailServiceModal}
        onOpenChange={(open) => {
          if (!open) setDetailServiceModal(null);
        }}
        service={detailServiceModal}
        onSignExecution={(s) => {
          toast.success('Serviço assinado pelos técnicos!', { description: `Ficha OS-${s.id} consolidada com sucesso.` });
          setDetailServiceModal(null);
        }}
      />

      {/* 🔮 MODAL 5: AGENDAR SERVIÇO A PARTIR DE ORÇAMENTO */}
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
