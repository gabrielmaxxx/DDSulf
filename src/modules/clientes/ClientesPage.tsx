import React, { useState, useMemo } from 'react';
import { useSystemStore, Client, Contract } from '@/store/systemStore';
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
  CalendarCheck,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// Extended type to handle custom client variables directly 
type ExtendedClient = Client & {
  type?: 'B2B' | 'B2C';
};

export function ClientesPage() {
  const {
    clients,
    contracts,
    addClient,
    updateClient,
    removeClient,
    addContract,
    updateContract,
    removeContract
  } = useSystemStore();

  const [activeTab, setActiveTab] = useState<'clientes' | 'contratos'>('clientes');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Modals visibility
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [clientModalMode, setClientModalMode] = useState<'create' | 'edit'>('create');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [contractModalMode, setContractModalMode] = useState<'create' | 'edit'>('create');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);

  // Client form states
  const [clientName, setClientName] = useState('');
  const [clientCnpjCpf, setClientCnpjCpf] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientType, setClientType] = useState<'B2B' | 'B2C'>('B2B');

  // Contract form states
  const [contractClientId, setContractClientId] = useState('');
  const [contractTitle, setContractTitle] = useState('');
  const [contractRecurrentValue, setContractRecurrentValue] = useState<number>(0);
  const [contractRecurrencyMonths, setContractRecurrencyMonths] = useState<number>(1);
  const [contractStartDate, setContractStartDate] = useState('');
  const [contractEndDate, setContractEndDate] = useState('');
  const [contractStatus, setContractStatus] = useState<'ativo' | 'vencido' | 'cancelado'>('ativo');
  const [contractValue, setContractValue] = useState<number>(5000); // edited/total value

  // Delete confirmations
  const [confirmDeleteClientId, setConfirmDeleteClientId] = useState<string | null>(null);
  const [confirmDeleteContractId, setConfirmDeleteContractId] = useState<string | null>(null);

  // Simulated current local system date: June 5, 2026
  const SIMULATED_TODAY = '2026-06-05';

  // Helper functions
  const getClientType = (client: ExtendedClient): 'B2B' | 'B2C' => {
    if (client.type) return client.type;
    // Fallback classification
    const rawVal = (client.cnpjCpf || '').replace(/\D/g, '');
    if (client.cnpjCpf?.includes('/') || rawVal.length === 14) return 'B2B';
    return 'B2C';
  };

  const isClientIncomplete = (client: Client): boolean => {
    return (
      !client.cnpjCpf || 
      client.cnpjCpf === '⚠️ NÃO INFORMADO' || 
      !client.email || 
      client.email === '⚠️ NÃO INFORMADO'
    );
  };

  const getActiveContractsCount = (clientId: string): number => {
    return (contracts || []).filter(c => c.clientId === clientId && c.status === 'ativo').length;
  };

  const getDaysRemaining = (endDateStr: string): number | null => {
    if (!endDateStr) return null;
    try {
      const end = new Date(endDateStr);
      const today = new Date(SIMULATED_TODAY);
      const diffTime = end.getTime() - today.getTime();
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch {
      return null;
    }
  };

  const isExpiringSoon = (endDateStr: string): boolean => {
    const daysLeft = getDaysRemaining(endDateStr);
    return daysLeft !== null && daysLeft >= 0 && daysLeft <= 30;
  };

  // Safe sanitizers to enhance user experience
  const sanitizeInput = (val: string) => {
    return val === '⚠️ NÃO INFORMADO' ? '' : val;
  };

  const finalizeOutput = (val: string) => {
    return val.trim() === '' ? '⚠️ NÃO INFORMADO' : val.trim();
  };

  // KPIs
  const kpis = useMemo(() => {
    const totalClients = (clients || []).length;
    const b2bClients = (clients || []).filter(c => getClientType(c) === 'B2B').length;
    const incompleteClients = (clients || []).filter(isClientIncomplete).length;
    const activeContracts = (contracts || []).filter(c => c.status === 'ativo').length;

    return {
      totalClients,
      b2bClients,
      incompleteClients,
      activeContracts
    };
  }, [clients, contracts]);

  // Filters for Tab 1 (Clientes)
  const filteredClients = useMemo(() => {
    return (clients || []).filter(c => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        c.name.toLowerCase().includes(searchLower) ||
        (c.cnpjCpf && c.cnpjCpf.toLowerCase().includes(searchLower)) ||
        (c.email && c.email.toLowerCase().includes(searchLower)) ||
        (c.phone && c.phone.toLowerCase().includes(searchLower)) ||
        (c.address && c.address.toLowerCase().includes(searchLower));
      
      return matchSearch;
    });
  }, [clients, searchTerm]);

  // Filters for Tab 2 (Contratos)
  const filteredContracts = useMemo(() => {
    return (contracts || []).filter(c => {
      const searchLower = searchTerm.toLowerCase();
      const matchSearch = 
        c.clientName.toLowerCase().includes(searchLower) ||
        c.title.toLowerCase().includes(searchLower) ||
        (c.status && c.status.toLowerCase().includes(searchLower));

      const matchStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [contracts, searchTerm, statusFilter]);

  // Modals opening handlers
  const openCreateClientModal = () => {
    setClientModalMode('create');
    setSelectedClientId(null);
    setClientName('');
    setClientCnpjCpf('');
    setClientEmail('');
    setClientPhone('');
    setClientAddress('');
    setClientType('B2B');
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (client: ExtendedClient) => {
    setClientModalMode('edit');
    setSelectedClientId(client.id);
    setClientName(client.name);
    setClientCnpjCpf(sanitizeInput(client.cnpjCpf));
    setClientEmail(sanitizeInput(client.email));
    setClientPhone(sanitizeInput(client.phone));
    setClientAddress(sanitizeInput(client.address));
    setClientType(getClientType(client));
    setIsClientModalOpen(true);
  };

  const openCreateContractModal = () => {
    if ((clients || []).length === 0) {
      toast.error('Nenhum cliente disponível', { 
        description: 'Não é possível gerar um contrato sem antes cadastrar pelo menos um cliente.' 
      });
      return;
    }
    setContractModalMode('create');
    setSelectedContractId(null);
    setContractClientId(clients[0].id);
    setContractTitle('Contrato Metódico Trimestral');
    setContractRecurrentValue(1500);
    setContractRecurrencyMonths(3);
    setContractStartDate(SIMULATED_TODAY);
    setContractEndDate('2027-06-05');
    setContractStatus('ativo');
    setIsContractModalOpen(true);
  };

  const openEditContractModal = (contract: Contract) => {
    setContractModalMode('edit');
    setSelectedContractId(contract.id);
    setContractClientId(contract.clientId);
    setContractTitle(contract.title);
    setContractRecurrentValue(contract.recurrentValue);
    setContractRecurrencyMonths(contract.recurrencyMonths);
    setContractStartDate(contract.startDate);
    setContractEndDate(contract.endDate);
    setContractStatus(contract.status);
    setContractValue(contract.value); // Keep historical value or recalculate
    setIsContractModalOpen(true);
  };

  // Submit operations
  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) {
      toast.error('O nome do cliente é obrigatório.');
      return;
    }

    const payload: ExtendedClient = {
      id: clientModalMode === 'edit' && selectedClientId ? selectedClientId : `c-${Math.random().toString(36).substring(2, 11)}`,
      name: clientName.trim(),
      cnpjCpf: finalizeOutput(clientCnpjCpf),
      email: finalizeOutput(clientEmail),
      phone: finalizeOutput(clientPhone),
      address: finalizeOutput(clientAddress),
      type: clientType,
      createdAt: clientModalMode === 'edit' && selectedClientId 
        ? ((clients || []).find(c => c.id === selectedClientId)?.createdAt || SIMULATED_TODAY)
        : SIMULATED_TODAY
    };

    if (clientModalMode === 'edit' && selectedClientId) {
      updateClient(selectedClientId, payload);
      toast.success('Cliente atualizado!', { description: `${payload.name} teve seus dados consolidados.` });
    } else {
      addClient(payload);
      toast.success('Cliente cadastrado!', { description: `${payload.name} foi adicionado à carteira.` });
    }

    setIsClientModalOpen(false);
  };

  const handleSaveContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractTitle.trim()) {
      toast.error('Título do contrato obrigatório.');
      return;
    }
    
    const matchedClient = (clients || []).find(c => c.id === contractClientId);
    if (!matchedClient) {
      toast.error('Selecione um cliente válido.');
      return;
    }

    // Recalculates value: standard value = recurrentValue * (12 / recurrencyMonths)
    const factor = contractRecurrencyMonths > 0 ? (12 / contractRecurrencyMonths) : 1;
    const computedTotalValue = contractModalMode === 'create' 
      ? Number((contractRecurrentValue * factor).toFixed(2))
      : Number(contractValue);

    const payload: Contract = {
      id: contractModalMode === 'edit' && selectedContractId ? selectedContractId : `contr-${Math.random().toString(36).substring(2, 11)}`,
      clientId: contractClientId,
      clientName: matchedClient.name,
      title: contractTitle,
      recurrentValue: Number(contractRecurrentValue),
      recurrencyMonths: Number(contractRecurrencyMonths),
      value: computedTotalValue,
      startDate: contractStartDate,
      endDate: contractEndDate,
      status: contractStatus,
      createdAt: contractModalMode === 'edit' && selectedContractId
        ? ((contracts || []).find(c => c.id === selectedContractId)?.createdAt || SIMULATED_TODAY)
        : SIMULATED_TODAY
    };

    if (contractModalMode === 'edit' && selectedContractId) {
      updateContract(selectedContractId, payload);
      toast.success('Contrato atualizado!', { description: `O contrato "${payload.title}" foi editado com sucesso.` });
    } else {
      // Direct store function is addContract
      addContract(payload);
      toast.success('Contrato vinculado!', { description: `Novo faturamento recorrente agendado para ${matchedClient.name}.` });
    }

    setIsContractModalOpen(false);
  };

  const handleDeleteClient = (id: string, name: string) => {
    // Only delete if there are absolutely no active contracts refering this client
    const numActiveContracts = getActiveContractsCount(id);
    if (numActiveContracts > 0) {
      toast.error('Não é possível remover!', { 
        description: `O cliente ${name} possui ${numActiveContracts} contrato(s) ativo(s) em vigência.` 
      });
      setConfirmDeleteClientId(null);
      return;
    }

    removeClient(id);
    setConfirmDeleteClientId(null);
    toast.success('Cliente removido', { description: `${name} foi descadastrado.` });
  };

  const handleDeleteContract = (id: string, title: string) => {
    if (removeContract) {
      removeContract(id);
      setConfirmDeleteContractId(null);
      toast.success('Contrato cancelado/removido', { description: `O compromisso contratual "${title}" foi arquivado.` });
    } else {
      // Fallback: If removeContract is undefined, set status to cancelado
      updateContract(id, { status: 'cancelado' });
      setConfirmDeleteContractId(null);
      toast.success('Status alterado para Cancelado', { description: `Contrato "${title}" foi desativado.` });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 text-left">
      
      {/* HEADER */}
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="font-sans text-[#2D6A4F] text-xs font-bold uppercase tracking-wider block">DDSULF OPERACIONAL</span>
          <h1 className="font-display text-2.5xl font-black text-[#141410] mt-1 uppercase tracking-tight">Carteira de Clientes & Contratos</h1>
          <p className="text-xs text-[#6B6B5F] mt-0.5">Gestão de contatos, dados de faturamento (LGPD completo) e vigência de faturamentos recorrentes.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'clientes' ? (
            <button 
              onClick={openCreateClientModal}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3A2D] text-white 
                                 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#2D6A4F] transition-all cursor-pointer shadow-sm shrink-0"
            >
              <Plus className="size-4" /> Novo Cliente
            </button>
          ) : (
            <button 
              onClick={openCreateContractModal}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[#1B3A2D] text-white 
                                 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#2D6A4F] transition-all cursor-pointer shadow-sm shrink-0"
            >
              <Plus className="size-4" /> Novo Contrato
            </button>
          )}
        </div>
      </header>

      {/* KPI SUMMARIES */}
      <div className="grid gap-6 sm:grid-cols-4">
        <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black text-[#6B6B5F] uppercase tracking-wider">Total de Clientes</span>
            <p className="text-2xl font-display font-black text-[#141410]">{kpis.totalClients}</p>
            <p className="text-[10px] text-[#2D6A4F] font-bold font-sans">Cadastrados no ERP</p>
          </div>
          <div className="size-11 rounded-xl bg-[#FAF9F6] flex items-center justify-center text-[#141410] border border-[#E8E6E1]">
            <Users className="size-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black text-[#6B6B5F] uppercase tracking-wider font-semibold">Empresas (B2B)</span>
            <p className="text-2xl font-display font-black text-[#1B3A2D]">{kpis.b2bClients}</p>
            <p className="text-[10px] text-[#2D6A4F] font-bold font-sans">Pessoas Jurídicas</p>
          </div>
          <div className="size-11 rounded-xl bg-emerald-50 flex items-center justify-center text-[#1B3A2D] border border-emerald-100">
            <ShieldCheck className="size-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black text-[#6B6B5F] uppercase tracking-wider">Dados Incompletos</span>
            <p className="text-2xl font-display font-black text-rose-700">{kpis.incompleteClients}</p>
            <p className="text-[10px] text-[#6B6B5F] font-bold font-sans">⚠️ Sem CNPJ ou Email</p>
          </div>
          <div className="size-11 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700 border border-rose-150">
            <AlertTriangle className="size-5" />
          </div>
        </div>

        <div className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex items-center justify-between">
          <div className="space-y-0.5 text-left">
            <span className="text-[10px] font-black text-[#6B6B5F] uppercase tracking-wider">Contratos Ativos</span>
            <p className="text-2xl font-display font-black text-amber-700">{kpis.activeContracts}</p>
            <p className="text-[10px] text-[#6B6B5F] font-bold font-sans">Receita mensal recorrente</p>
          </div>
          <div className="size-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700 border border-amber-200">
            <FileText className="size-5" />
          </div>
        </div>
      </div>

      {/* FILTER & TABS HEADER */}
      <div className="bg-white border border-[#E8E6E1] p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Nav Tabs */}
        <div className="flex gap-1 bg-[#F0EDE8] p-1 rounded-xl shrink-0 w-full md:w-auto">
          <button
            onClick={() => { setActiveTab('clientes'); setSearchTerm(''); }}
            className={`px-5 py-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex-1 md:flex-none ${
              activeTab === 'clientes' ? 'bg-[#1B3A2D] text-white shadow-xs' : 'text-[#6B6B5F] hover:text-[#141410]'
            }`}
          >
            Clientes
          </button>
          <button
            onClick={() => { setActiveTab('contratos'); setSearchTerm(''); }}
            className={`px-5 py-2.5 rounded-lg text-[10px] font-extrabold uppercase tracking-widest transition-all cursor-pointer flex-1 md:flex-none ${
              activeTab === 'contratos' ? 'bg-[#1B3A2D] text-white shadow-xs' : 'text-[#6B6B5F] hover:text-[#141410]'
            }`}
          >
            Contratos ({contracts?.length || 0})
          </button>
        </div>

        {/* Dynamic Filters depending on Tab selected */}
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto justify-end">
          
          {/* Main search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 size-4 text-[#6B6B5F]" />
            <input
              type="text"
              placeholder={activeTab === 'clientes' ? "Buscar por cliente ou CNPJ..." : "Buscar por contrato ou cliente..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg pl-9 pr-4 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
            />
          </div>

          {/* Status filter for contracts tab only */}
          {activeTab === 'contratos' && (
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none h-[34px]"
              >
                <option value="all">TODOS OS STATUS</option>
                <option value="ativo">ATIVO</option>
                <option value="vencido">VENCIDO</option>
                <option value="cancelado">CANCELADO</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* RENDER VIEW */}
      <AnimatePresence mode="wait">
        
        {/* -------------------- TAB 1: CLIENTES -------------------- */}
        {activeTab === 'clientes' && (
          <motion.div
            key="clientes-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredClients.length === 0 ? (
              <div className="col-span-full py-16 text-center text-[#6B6B5F] space-y-2 bg-white border border-[#E8E6E1] rounded-2xl">
                <Users className="size-8 mx-auto opacity-30 text-[#6B6B5F]" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#141410]">Nenhum cliente cadastrado ou localizado</p>
                <p className="text-[10px] max-w-xs mx-auto">Cadastre novos clientes para conseguir gerar ordens de serviço e acompanhamentos recorrentes no painel.</p>
              </div>
            ) : (
              filteredClients.map(client => {
                const isIncomplete = isClientIncomplete(client);
                const type = getClientType(client);
                const totalActiveContr = getActiveContractsCount(client.id);

                return (
                  <div
                    key={client.id}
                    className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-400 transition-all text-left"
                  >
                    <div className="space-y-3">
                      
                      {/* Name & Type header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h3 className="font-display font-black text-sm text-[#141410] uppercase tracking-tight leading-tight">
                            {client.name}
                          </h3>
                          <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                            type === 'B2B' ? 'bg-sky-50 text-sky-800 border border-sky-200' : 'bg-pink-50 text-pink-850 border border-pink-200'
                          }`}>
                            {type === 'B2B' ? '🏢 B2B / Empresa' : '👤 B2C / Residencial'}
                          </span>
                        </div>

                        {/* Edit and Delete */}
                        <div className="flex gap-1">
                          <button
                            onClick={() => openEditClientModal(client)}
                            className="p-1 px-1.5 bg-slate-50 hover:bg-blue-50 border border-[#E8E6E1] hover:border-blue-200 rounded text-blue-800 cursor-pointer transition-all"
                            title="Editar Cliente"
                          >
                            <Edit2 className="size-3" />
                          </button>
                          
                          {confirmDeleteClientId === client.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-0.5 rounded">
                              <button
                                onClick={() => handleDeleteClient(client.id, client.name)}
                                className="px-1 text-[8px] font-black uppercase text-white bg-rose-650 hover:bg-rose-700 rounded cursor-pointer"
                                title="Confirmar exclusão"
                              >
                                Sim
                              </button>
                              <button
                                onClick={() => setConfirmDeleteClientId(null)}
                                className="px-1 text-[8px] font-bold text-slate-800 bg-slate-200 rounded cursor-pointer"
                                title="Cancelar"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteClientId(client.id)}
                              className="p-1 px-1.5 bg-slate-50 hover:bg-rose-50 border border-[#E8E6E1] hover:border-rose-200 rounded text-rose-800 cursor-pointer transition-all"
                              title="Excluir"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Warnings if critical fields are omitted */}
                      {isIncomplete && (
                        <div className="bg-[#FFF5F5] border border-rose-100 p-2 rounded-xl text-[9px] text-[#C53030] flex items-center gap-1.5">
                          <AlertCircle className="size-3.5 fill-[#C53030] text-white shrink-0" />
                          <span className="font-semibold">Cadastro Incompleto (Exige ajuste no CNPJ/Email)</span>
                        </div>
                      )}

                      {/* Contact Info details */}
                      <div className="space-y-1.5 pt-1 text-[10px] text-[#6B6B5F] font-semibold">
                        <p className="flex items-center gap-2">
                          <Phone className="size-3.5 text-[#9E9E90] shrink-0" />
                          <span>{client.phone || '⚠️ NÃO INFORMADO'}</span>
                        </p>
                        <p className="flex items-center gap-2 overflow-hidden truncate">
                          <Mail className="size-3.5 text-[#9E9E90] shrink-0" />
                          <span className="truncate" title={client.email}>{client.email || '⚠️ NÃO INFORMADO'}</span>
                        </p>
                        <p className="flex items-center gap-2 font-mono text-[9px] text-[#141410] uppercase">
                          <span className="text-[#6B6B5F] font-sans font-semibold">Doc:</span>
                          <span>{client.cnpjCpf || '⚠️ NÃO INFORMADO'}</span>
                        </p>
                        <p className="flex items-center gap-2 pt-1 border-t border-[#FAF9F6]">
                          <MapPin className="size-3.5 text-[#9E9E90] shrink-0" />
                          <span className="truncate leading-tight font-medium" title={client.address}>{client.address || '⚠️ NÃO INFORMADO'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Active Contracts Badge */}
                    <div className="pt-2 border-t border-[#FAF9F6] flex items-center justify-between text-xs text-[#6B6B5F]">
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Contratos:</span>
                      {totalActiveContr > 0 ? (
                        <span className="px-2 py-0.5 bg-[#E8F4EE] border border-emerald-100 rounded-full text-[9px] font-bold text-[#1B3A2D]">
                          ● {totalActiveContr} Ativo(s)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 rounded-full text-[9px] font-bold text-slate-500">
                          Sem contrato ativo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}

        {/* -------------------- TAB 2: CONTRATOS -------------------- */}
        {activeTab === 'contratos' && (
          <motion.div
            key="contratos-tab"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredContracts.length === 0 ? (
              <div className="col-span-full py-16 text-center text-[#6B6B5F] space-y-2 bg-white border border-[#E8E6E1] rounded-2xl">
                <FileText className="size-8 mx-auto opacity-30 text-[#6B6B5F]" />
                <p className="text-xs font-bold uppercase tracking-wider text-[#141410]">Nenhum contrato ativo ou localizado</p>
                <p className="text-[10px] max-w-xs mx-auto">Vincule contratos de prestação a clientes recorrentes e agende faturamentos.</p>
              </div>
            ) : (
              filteredContracts.map(contract => {
                const soon = isExpiringSoon(contract.endDate);
                const daysRemaining = getDaysRemaining(contract.endDate);

                return (
                  <div
                    key={contract.id}
                    className="bg-white border border-[#E8E6E1] p-5 rounded-2xl flex flex-col justify-between space-y-4 hover:border-slate-400 transition-all text-left"
                  >
                    <div className="space-y-3">
                      
                      {/* Client name, Contract title & actions menu */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black uppercase tracking-wider text-[#2D6A4F] truncate block">
                            {contract.clientName}
                          </span>
                          <h4 className="font-display font-black text-[12px] text-[#141410] uppercase leading-tight pt-0.5">
                            {contract.title}
                          </h4>
                        </div>

                        {/* Actions block */}
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => openEditContractModal(contract)}
                            className="p-1 px-1.5 bg-slate-50 hover:bg-blue-50 border border-[#E8E6E1] hover:border-blue-200 rounded text-blue-800 cursor-pointer transition-all"
                            title="Editar Contrato"
                          >
                            <Edit2 className="size-3" />
                          </button>
                          
                          {confirmDeleteContractId === contract.id ? (
                            <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-0.5 rounded">
                              <button
                                onClick={() => handleDeleteContract(contract.id, contract.title)}
                                className="px-1 text-[8px] font-black uppercase text-white bg-rose-650 hover:bg-rose-700 rounded cursor-pointer"
                                title="Confirmar cancelamento"
                              >
                                Apagar
                              </button>
                              <button
                                onClick={() => setConfirmDeleteContractId(null)}
                                className="px-1 text-[8px] font-bold text-slate-[#141410] bg-slate-200 rounded cursor-pointer"
                              >
                                X
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmDeleteContractId(contract.id)}
                              className="p-1 px-1.5 bg-slate-50 hover:bg-rose-50 border border-[#E8E6E1] hover:border-rose-200 rounded text-rose-800 cursor-pointer transition-all"
                              title="Desvincular / Excluir"
                            >
                              <Trash2 className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Expiring Soon Badge Warning */}
                      {soon && (
                        <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl text-[9px] text-[#975A16] flex items-center gap-1.5">
                          <Clock className="size-3.5 text-amber-600 shrink-0 animate-pulse" />
                          <span className="font-bold">CONTRATO EXPIRANDO EM BREVE ({daysRemaining} dias para expirar!)</span>
                        </div>
                      )}

                      {/* Budget values */}
                      <div className="grid grid-cols-2 gap-3 bg-[#FAF9F6]/50 p-2.5 border border-[#E8E6E1]/50 rounded-xl">
                        <div>
                          <p className="text-[8px] font-extrabold uppercase text-[#6B6B5F]">Faturamento Mensal</p>
                          <p className="text-[11px] font-mono font-black text-[#141410]">R$ {(contract.recurrentValue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-extrabold uppercase text-[#6B6B5F]">Valor Total Total</p>
                          <p className="text-[11px] font-mono font-black text-[#2D6A4F]">R$ {(contract.value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>

                      {/* Contract period terms & repeat recurrence */}
                      <div className="space-y-1 text-[10px] text-[#6B6B5F] font-semibold">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="size-3.5 text-[#9E9E90]" />
                          <span>Vigência: {contract.startDate ? new Date(contract.startDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem data'} até {contract.endDate ? new Date(contract.endDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'Sem data'}</span>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Info className="size-3.5 text-[#9E9E90]" />
                          <span>Recorrência de faturamento a cada {contract.recurrencyMonths} {contract.recurrencyMonths === 1 ? 'mês' : 'meses'}</span>
                        </p>
                      </div>

                    </div>

                    {/* Status badge in bottom */}
                    <div className="pt-2.5 border-t border-[#FAF9F6] flex items-center justify-between">
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Tipo de Roteiro:</span>
                      <span className={`inline-block text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        contract.status === 'ativo' 
                          ? 'bg-[#E8F4EE] text-[#1B3A2D] border border-emerald-100' 
                          : contract.status === 'vencido' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-100' 
                            : 'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        • {contract.status === 'ativo' ? 'Ativo / Operante' : contract.status === 'vencido' ? 'Vencido' : 'Cancelado'}
                      </span>
                    </div>

                  </div>
                );
              })
            )}
          </motion.div>
        )}

      </AnimatePresence>

      {/* -------------------- INLINE MODAL 1: CLIENTES -------------------- */}
      {isClientModalOpen && (
        <div id="modal-clients-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
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
                <p className="text-[10px] text-[#6B6B5F] mt-0.5">Insira os contatos básicos e documentos de identificação fiscal.</p>
              </div>
              <button
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 text-[#6B6B5F] hover:text-[#141410] bg-slate-50 border border-[#E8E6E1] rounded-lg cursor-pointer animate-none"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Nome / Razão Social *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: DDSulf Saneamento de Volta Redonda Ltda"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Documento (CNPJ/CPF)</label>
                  <input
                    type="text"
                    placeholder="Ex: 12.345.678/0001-90"
                    value={clientCnpjCpf}
                    onChange={(e) => setClientCnpjCpf(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>
                
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Perfil de Atendimento</label>
                  <select
                    value={clientType}
                    onChange={(e) => setClientType(e.target.value as any)}
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
                    placeholder="Ex: (24) 99999-5555"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">E-mail para Faturamento</label>
                  <input
                    type="email"
                    placeholder="Ex: financeiro@empresa.com.br"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Endereço Completo</label>
                <textarea
                  placeholder="Ex: Av. Sete de Setembro, 202 - Aterrado - Volta Redonda - RJ"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
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
                  className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Check className="size-3.5" /> Salvar Cliente
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* -------------------- INLINE MODAL 2: CONTRATOS -------------------- */}
      {isContractModalOpen && (
        <div id="modal-contracts-overlay" className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white border border-[#E8E6E1] rounded-2xl max-w-md w-full overflow-hidden shadow-xl text-left"
          >
            <div className="px-6 py-4 border-b border-[#FAF9F6] flex items-center justify-between">
              <div>
                <h3 className="font-display font-black text-[#141410] text-xs uppercase tracking-wider">
                  {contractModalMode === 'create' ? 'Agendar Novo Contrato' : 'Editar Compromisso Contratual'}
                </h3>
                <p className="text-[10px] text-[#6B6B5F] mt-0.5">Defina o cliente, valores mensais, recorrência e vigência do contrato.</p>
              </div>
              <button
                onClick={() => setIsContractModalOpen(false)}
                className="p-1 text-[#6B6B5F] hover:text-[#141410] bg-slate-50 border border-[#E8E6E1] rounded-lg cursor-pointer animate-none"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleSaveContract} className="p-6 space-y-4 text-left">
              
              {/* Client Selection (Create mode only or display client name inside edit mode) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Cliente do Contrato *</label>
                {contractModalMode === 'create' ? (
                  <select
                    value={contractClientId}
                    onChange={(e) => setContractClientId(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none h-[34px]"
                  >
                    {(clients || []).map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled
                    value={(clients || []).find(c => c.id === contractClientId)?.name || 'Cliente Geral'}
                    className="w-full bg-slate-100 border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs text-[#6B6B5F] select-none text-left"
                  />
                )}
              </div>

              {/* Title of Contract */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Título / Escopo do Contrato *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Contrato Anual de Controle de Vetores CIP"
                  value={contractTitle}
                  onChange={(e) => setContractTitle(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3.5 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                />
              </div>

              {/* Financial values */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Valor Mensal (Recorrente) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-[10px] font-bold text-slate-500">R$</span>
                    <input
                      type="number"
                      required
                      min={0}
                      step={0.01}
                      value={contractRecurrentValue}
                      onChange={(e) => setContractRecurrentValue(Number(e.target.value))}
                      className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg pl-8 pr-3 py-2 text-xs font-mono text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none h-[34px]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Recorrência de Cobrança</label>
                  <select
                    value={contractRecurrencyMonths}
                    onChange={(e) => setContractRecurrencyMonths(Number(e.target.value))}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none h-[34px]"
                  >
                    <option value={1}>Mensal (todo mês)</option>
                    <option value={2}>Bimestral (a cada 2 meses)</option>
                    <option value={3}>Trimestral (a cada 3 meses)</option>
                    <option value={6}>Semestral (a cada 6 meses)</option>
                    <option value={12}>Anual (uma vez ao ano)</option>
                  </select>
                </div>
              </div>

              {/* Display calculated value preview on creating contract */}
              {contractModalMode === 'create' ? (
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200/50 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-[#6B6B5F]">Valor Total Estimado (12 meses):</span>
                  <span className="text-xs font-mono font-black text-[#1B3A2D]">
                    R$ {(contractRecurrentValue * (12 / contractRecurrencyMonths)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Valor Total Atribuído (R$)</label>
                  <input
                    type="number"
                    step={0.01}
                    value={contractValue}
                    onChange={(e) => setContractValue(Number(e.target.value))}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-mono text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none h-[34px]"
                  />
                </div>
              )}

              {/* Vigência Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Início da Vigência *</label>
                  <input
                    type="date"
                    required
                    value={contractStartDate}
                    onChange={(e) => setContractStartDate(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Fim da Vigência *</label>
                  <input
                    type="date"
                    required
                    value={contractEndDate}
                    onChange={(e) => setContractEndDate(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs font-sans text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none"
                  />
                </div>
              </div>

              {/* Status field (Edit mode only) */}
              {contractModalMode === 'edit' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#6B6B5F]">Status Operacional do Contrato</label>
                  <select
                    value={contractStatus}
                    onChange={(e) => setContractStatus(e.target.value as any)}
                    className="w-full bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-xs text-[#141410] focus:ring-1 focus:ring-[#1B3A2D] focus:outline-none h-[34px]"
                  >
                    <option value="ativo">Operante / Ativo</option>
                    <option value="vencido">Vencido</option>
                    <option value="cancelado">Cancelado pelo Cliente</option>
                  </select>
                </div>
              )}

              <div className="pt-4 border-t border-[#FAF9F6] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#141410] text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-[10px] font-black uppercase tracking-wider rounded-lg cursor-pointer flex items-center gap-1"
                >
                  <Check className="size-3.5" /> Salvar Contrato
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
