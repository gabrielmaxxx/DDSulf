import React, { useState } from 'react';
import { useSystemStore } from '@/store';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Trash2, 
  Plus, 
  Search, 
  Eye, 
  X, 
  Upload, 
  Clock, 
  Beaker, 
  AlertTriangle, 
  ExternalLink,
  SearchX,
  FileSpreadsheet,
  FileUp,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// Normalization Helpers for Pests and Services
function getPestLabel(val: string): string {
  if (!val) return 'Outros';
  const v = val.toLowerCase().trim();
  if (v === 'baratas') return 'Baratas';
  if (v === 'ratos') return 'Ratos';
  if (v === 'cupins') return 'Cupins';
  if (v === 'mosquitos/dengue' || v === 'mosquitos' || v === 'mosquitos-dengue' || v === 'mosquito') return 'Mosquitos/Dengue';
  if (v === 'formigas') return 'Formigas';
  if (v === 'escorpioes' || v === 'escorpiões') return 'Escorpiões';
  if (v === 'aranhas') return 'Aranhas';
  return val.charAt(0).toUpperCase() + val.slice(1);
}

function getPestBadgeStyle(val: string): string {
  if (!val) return 'bg-[#FAFAF9] text-[#6B6B5F] border-[#E8E6E1]';
  const v = val.toLowerCase().trim();
  if (v === 'baratas') return 'bg-amber-50 text-amber-850 border-amber-200';
  if (v === 'ratos') return 'bg-slate-50 text-slate-850 border-slate-200';
  if (v === 'cupins') return 'bg-orange-50 text-orange-850 border-orange-200';
  if (v === 'mosquitos/dengue' || v === 'mosquitos' || v === 'mosquitos-dengue' || v === 'mosquito') return 'bg-blue-50 text-blue-850 border-blue-200';
  if (v === 'formigas') return 'bg-rose-50 text-rose-850 border-rose-200';
  if (v === 'escorpioes' || v === 'escorpiões') return 'bg-purple-50 text-purple-855 border-purple-200';
  if (v === 'aranhas') return 'bg-emerald-50 text-emerald-855 border-emerald-200';
  return 'bg-[#FAFAF9] text-[#6B6B5F] border-[#E8E6E1]';
}

function getPestColor(val: string): string {
  if (!val) return 'bg-gray-300';
  const v = val.toLowerCase().trim();
  if (v.includes('barata')) return 'bg-amber-400';
  if (v.includes('rato')) return 'bg-slate-500';
  if (v.includes('cupim')) return 'bg-orange-400';
  if (v.includes('mosquito')) return 'bg-blue-400';
  if (v.includes('formiga')) return 'bg-red-400';
  return 'bg-gray-300';
}

function getServiceLabel(val: string): string {
  if (!val) return 'Dedetização';
  const v = val.toLowerCase().trim();
  if (v === 'dedetizacao' || v === 'dedetização') return 'Dedetização';
  if (v === 'desratizacao' || v === 'desratização') return 'Desratização';
  if (v === 'descupinizacao' || v === 'descupinização') return 'Descupinização';
  if (v === 'sanitizacao' || v === 'sanitização') return 'Sanitização';
  if (v === 'controle integrado' || v === 'controle_integrado' || v === 'controle-integrado') return 'Controle Integrado';
  return val.charAt(0).toUpperCase() + val.slice(1);
}

const PESTS_LIST = [
  'Baratas',
  'Ratos',
  'Cupins',
  'Mosquitos/Dengue',
  'Formigas',
  'Escorpiões',
  'Aranhas',
  'Outros'
];

const SERVICES_LIST = [
  { value: 'dedetizacao', label: 'Dedetização' },
  { value: 'desratizacao', label: 'Desratização' },
  { value: 'descupinizacao', label: 'Descupinização' },
  { value: 'sanitizacao', label: 'Sanitização' },
  { value: 'controle_integrado', label: 'Controle Integrado' }
];

export function POPsPage() {
  const { pops, inventory, addPOP, updatePOP, removePOP } = useSystemStore();
  const procedures = pops?.procedures || [];
  const inventoryProducts = inventory?.products || [];

  // Search filter
  const [search, setSearch] = useState('');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingPopId, setEditingPopId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formPestType, setFormPestType] = useState('Baratas');
  const [formServiceType, setFormServiceType] = useState('dedetizacao');
  const [formTime, setFormTime] = useState(1);
  const [formInstructions, setFormInstructions] = useState('');
  
  // Dynamic chemical list
  const [formRequiredProducts, setFormRequiredProducts] = useState<Array<{
    productId: string;
    productName: string;
    quantityPer100m2: number;
    unit: string;
  }>>([]);

  // File Upload states
  const [formFileBase64, setFormFileBase64] = useState<string | undefined>(undefined);
  const [formFileName, setFormFileName] = useState<string | undefined>(undefined);

  // Drag and Drop State
  const [isDragging, setIsDragging] = useState(false);

  // File Viewer states
  const [viewingPopId, setViewingPopId] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  // -------------------------------------------------------------
  // DYNAMIC COMPONENT LINES
  // -------------------------------------------------------------
  const handleAddChemicalLine = () => {
    if (inventoryProducts.length === 0) {
      toast.error('Nenhum insumo químico no estoque!', {
        description: 'Cadastre insumos na aba de Estoque antes de vinculá-los aos POPs.'
      });
      return;
    }

    const defaultProduct = inventoryProducts[0];
    setFormRequiredProducts(prev => [
      ...prev,
      {
        productId: defaultProduct.id,
        productName: defaultProduct.name,
        quantityPer100m2: 10,
        unit: defaultProduct.unit
      }
    ]);
  };

  const handleUpdateChemicalLine = (index: number, productId: string) => {
    const targetProduct = inventoryProducts.find(p => p.id === productId);
    if (!targetProduct) return;

    setFormRequiredProducts(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          productId: targetProduct.id,
          productName: targetProduct.name,
          unit: targetProduct.unit
        };
      }
      return item;
    }));
  };

  const handleUpdateQuantityLine = (index: number, qty: number) => {
    setFormRequiredProducts(prev => prev.map((item, idx) => {
      if (idx === index) {
        return {
          ...item,
          quantityPer100m2: qty
        };
      }
      return item;
    }));
  };

  const handleRemoveChemicalLine = (index: number) => {
    setFormRequiredProducts(prev => prev.filter((_, idx) => idx !== index));
  };

  // -------------------------------------------------------------
  // ATTACHMENT PROCESSOR & DECODER
  // -------------------------------------------------------------
  const processUploadedFile = (file: File) => {
    const sizeInMB = file.size / (1024 * 1024);
    
    // Check if limit of 2MB is passed
    if (sizeInMB > 2) {
      toast.warning('Arquivo superior a 2MB', {
        description: 'Guardamos apenas a referência do nome para salvar espaço no navegador.'
      });
      setFormFileName(file.name);
      setFormFileBase64(undefined);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setFormFileBase64(event.target?.result as string);
      setFormFileName(file.name);
      toast.success('Arquivo acoplado!', {
        description: `Procedimento operacional de "${file.name}" pronto.`
      });
    };
    reader.onerror = () => {
      toast.error('Erro ao ler bytes do arquivo de procedimento.');
    };

    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  // Drag & drop handlers
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
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    processUploadedFile(file);
  };

  // -------------------------------------------------------------
  // OPEN MODALS FOR WORKSHOP (ADD / EDIT)
  // -------------------------------------------------------------
  const triggerCreateModal = () => {
    setModalMode('create');
    setEditingPopId(null);
    setFormName('');
    setFormPestType('Baratas');
    setFormServiceType('dedetizacao');
    setFormTime(1);
    setFormInstructions('');
    setFormRequiredProducts([]);
    setFormFileBase64(undefined);
    setFormFileName(undefined);
    setIsFormModalOpen(true);
  };

  const triggerEditModal = (p: any) => {
    setModalMode('edit');
    setEditingPopId(p.id);
    setFormName(p.name);
    setFormPestType(getPestLabel(p.pestType));
    setFormServiceType(p.serviceType);
    setFormTime(p.estimatedTimeHoursPer100m2);
    setFormInstructions(p.instructions || '');
    setFormRequiredProducts(p.requiredProducts || []);
    setFormFileBase64(p.fileUrl);
    setFormFileName(p.fileName);
    setIsFormModalOpen(true);
  };

  const deleteProcedure = (id: string, name: string) => {
    if (confirm(`Remover definitivamente o POP "${name}"? Calculadoras vinculadas perderão essa matriz.`)) {
      removePOP(id);
      toast.success('Procedimento removido.', {
        description: `O POP "${name}" foi apagado da central de operações.`
      });
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      toast.error('Nome do procedimento é obrigatório.');
      return;
    }

    if (modalMode === 'create') {
      const newId = `pop-${Math.random().toString(36).substring(2, 11)}`;
      addPOP({
        id: newId,
        name: formName.trim(),
        pestType: formPestType.toLowerCase(),
        serviceType: formServiceType,
        requiredProducts: formRequiredProducts,
        estimatedTimeHoursPer100m2: formTime,
        fileUrl: formFileBase64,
        fileName: formFileName,
        instructions: formInstructions.trim() || 'Sem detalhes instrucionais adicionais.',
        createdAt: new Date().toISOString()
      });

      toast.success('POP Cadastrado com Sucesso!', {
        description: `Procedimento "${formName}" adicionado ao catálogo operacional.`
      });
    } else {
      if (editingPopId) {
        updatePOP(editingPopId, {
          name: formName.trim(),
          pestType: formPestType.toLowerCase(),
          serviceType: formServiceType,
          requiredProducts: formRequiredProducts,
          estimatedTimeHoursPer100m2: formTime,
          fileUrl: formFileBase64,
          fileName: formFileName,
          instructions: formInstructions.trim()
        });

        toast.success('Parâmetros do POP atualizados!', {
          description: `Alterações consolidadas para "${formName}".`
        });
      }
    }

    setIsFormModalOpen(false);
  };

  // -------------------------------------------------------------
  // POP FILE VIEWER LOGIC (Section 3)
  // -------------------------------------------------------------
  const handleViewFile = (pop: any) => {
    if (!pop.fileUrl) {
      // Fallback: show the text formatted instructions inside modal drawer
      setViewingPopId(pop.id);
      return;
    }

    const type = pop.fileUrl;
    if (type.startsWith('data:application/pdf') || pop.fileName?.endsWith('.pdf')) {
      try {
        const newTab = window.open();
        if (newTab) {
          newTab.document.write(
            `<html><head><title>${pop.name}</title></head>` +
            `<body style="margin:0; background:#333; display:grid; place-items:center;">` +
            `<embed width="100%" height="100%" src="${pop.fileUrl}" type="application/pdf" />` +
            `</body></html>`
          );
        } else {
          toast.error('O navegador bloqueou a abertura de novas abas (Popup Blocker).');
        }
      } catch (err) {
        console.error(err);
        toast.error('Não foi possível carregar o arquivo PDF.');
      }
    } else if (type.startsWith('data:image/') || pop.fileName?.match(/\.(jpeg|jpg|png|gif|webp)$/i)) {
      // Fullscreen view
      setFullscreenImage(pop.fileUrl);
    } else {
      // Fallback instructions viewer
      setViewingPopId(pop.id);
    }
  };

  // Apply quick search
  const displayedProcedures = procedures.filter(p => {
    const q = search.toLowerCase();
    const matchName = p.name.toLowerCase().includes(q);
    const matchPest = p.pestType.toLowerCase().includes(q) || getPestLabel(p.pestType).toLowerCase().includes(q);
    const matchService = getServiceLabel(p.serviceType).toLowerCase().includes(q);
    return matchName || matchPest || matchService;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 text-left">
      
      {/* HEADER */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <span className="kpi-label text-[#2D6A4F] text-xs font-bold uppercase tracking-wider font-sans">Procedimentos Operacionais</span>
          <h1 className="font-display text-3xl font-semibold text-[#141410] mt-1">POPs Cadastrados</h1>
          <p className="text-sm text-[#6B6B5F] mt-1">
            Base para cálculo automático de produtos na Calculadora.
          </p>
        </div>
        <button 
          onClick={triggerCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#1B3A2D] text-white 
                             text-sm font-semibold rounded-xl hover:bg-[#2D6A4F] transition-colors cursor-pointer"
        >
          <Plus className="size-4" /> Novo POP
        </button>
      </header>

      {/* FILTER SEARCH BAR */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-[#6B6B5F]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar POPs por praga, serviço ou nome..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-[#E8E6E1] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] text-[#141410] shadow-xs"
        />
      </div>

      {/* PROTOCOL MATRICES GRID OF CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayedProcedures.map((pop) => {
          const pestColor = getPestColor(pop.pestType);
          const pestLabel = getPestLabel(pop.pestType);
          const pestBadgeStyle = getPestBadgeStyle(pop.pestType);

          return (
            <motion.div
              layout
              key={pop.id}
              className="bg-white rounded-2xl border border-[#E8E6E1] overflow-hidden 
                         hover:shadow-md hover:border-[#C8C5BF] transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Stripe colorida no topo — cor por tipo de praga */}
                <div className={`h-1.5 ${pestColor}`} />
                
                <div className="p-5">
                  {/* Badge de praga */}
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold 
                                    uppercase tracking-wider border mb-3 ${pestBadgeStyle}`}>
                    {pestLabel}
                  </span>
                  
                  {/* Nome do POP */}
                  <h3 className="font-semibold text-[#141410] text-sm leading-snug mb-3">{pop.name}</h3>
                  
                  {/* Métricas */}
                  <div className="flex items-center gap-4 text-xs text-[#6B6B5F] mb-4">
                    <span className="flex items-center gap-1">
                      <Beaker className="size-3" /> {pop.requiredProducts?.length || 0} produtos
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {pop.estimatedTimeHoursPer100m2}h/100m²
                    </span>
                  </div>
                  
                  {/* Lista de produtos resumida */}
                  <div className="bg-[#F7F6F3] rounded-xl p-3 mb-4 space-y-1.5">
                    {pop.requiredProducts?.slice(0, 2).map(prod => (
                      <div key={prod.productId} className="flex justify-between text-xs">
                        <span className="text-[#6B6B5F] truncate">{prod.productName}</span>
                        <span className="font-semibold text-[#141410] shrink-0 ml-2">
                          {prod.quantityPer100m2} {prod.unit}/100m²
                        </span>
                      </div>
                    ))}
                    {(!pop.requiredProducts || pop.requiredProducts.length === 0) && (
                      <p className="text-xs text-[#6B6B5F]/70 italic">Sem insumos indicados.</p>
                    )}
                    {pop.requiredProducts?.length > 2 && (
                      <p className="text-[10px] text-[#6B6B5F]">+ {pop.requiredProducts.length - 2} mais</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="p-5 pt-0">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleViewFile(pop)}
                    className="flex-1 text-center text-xs font-semibold py-2 rounded-lg 
                               border border-[#E8E6E1] text-[#6B6B5F] hover:bg-[#FAFAF9] transition-colors cursor-pointer"
                  >
                    Visualizar
                  </button>
                  <button 
                    onClick={() => triggerEditModal(pop)}
                    className="flex-1 text-center text-xs font-semibold py-2 rounded-lg 
                               bg-[#1B3A2D] text-white hover:bg-[#2D6A4F] transition-colors cursor-pointer"
                  >
                    Editar
                  </button>
                  <button 
                    onClick={() => deleteProcedure(pop.id, pop.name)}
                    className="p-2 rounded-lg text-[#6B6B5F] hover:text-[#C1361A] 
                               hover:bg-[#FDDDD8] transition-all cursor-pointer"
                    title="Excluir POP"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {displayedProcedures.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-[#E8E6E1] rounded-2xl flex flex-col items-center justify-center gap-4 bg-[#FAFAF9]">
            <SearchX className="size-10 text-[#6B6B5F] opacity-50" />
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#141410] uppercase tracking-widest">Procedimento Não Encontrado</p>
              <p className="text-xs text-[#6B6B5F] max-w-sm font-semibold">Crie novos arquivos do POP ou reajuste o filtro no topo.</p>
            </div>
            <button
              onClick={triggerCreateModal}
              className="px-5 py-2.5 bg-[#1B3A2D] text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-[#2D6A4F] transition-all cursor-pointer"
            >
              Criar Primeiro POP
            </button>
          </div>
        )}
      </div>

      {/* SECTION 2: WORKSHOP FORM MODAL (Add / Edit) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#E8E6E1] max-w-3xl w-full rounded-2xl shadow-2xl my-8 max-h-[90vh] overflow-y-auto text-left relative p-0"
            >
              {/* STICKY HEADER */}
              <div className="sticky top-0 bg-[#1B3A2D] text-white p-6 flex items-start justify-between z-10 rounded-t-2xl border-b border-[#2D6A4F]/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 bg-white/60 rounded-full" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-white/75 font-sans">Diretriz da DDSulf</span>
                  </div>
                  <h2 className="text-xl font-semibold font-display text-white">
                    {modalMode === 'create' ? 'Cadastrar Novo Procedimento' : 'Editar Procedimento Operacional'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="p-6 space-y-6 text-xs font-semibold text-[#141410]">
                
                {/* ROW 1: BASIC INFO */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">Nome do procedimento</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Desinsetização Química Geral de Baratas no Esgoto"
                      className="w-full h-11 px-4 rounded-xl border border-[#E8E6E1] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] text-[#141410]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">Tipo de Praga Alvo</label>
                    <select
                      value={formPestType}
                      onChange={(e) => setFormPestType(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[#E8E6E1] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] text-[#141410] cursor-pointer"
                    >
                      {PESTS_LIST.map((pest) => (
                        <option key={pest} value={pest}>{pest}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">Tipo de Serviço</label>
                    <select
                      value={formServiceType}
                      onChange={(e) => setFormServiceType(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-[#E8E6E1] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] text-[#141410] cursor-pointer"
                    >
                      {SERVICES_LIST.map((srv) => (
                        <option key={srv.value} value={srv.value}>{srv.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">Tempo por 100m² (Horas)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(parseFloat(e.target.value) || 0.5)}
                      className="w-full h-11 px-4 rounded-xl border border-[#E8E6E1] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] text-[#141410]"
                    />
                  </div>
                </div>

                {/* TEXTAREA DIRECTIVES */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F]">Instruções gerais recomendadas aos técnicos</label>
                  <textarea
                    rows={3}
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder="Detalhamento operacional. Métricas de diluição rápida, posicionamento perimetral, advertências, EPIs específicos ou alertas operacionais ambientais..."
                    className="w-full p-4 rounded-xl border border-[#E8E6E1] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-[#FAFAF9] text-[#141410] leading-relaxed resize-none font-sans"
                  />
                </div>

                {/* DYNAMIC PRODUCTS PER 100M² LINKED TO INVENTORY */}
                <div className="space-y-4 pt-4 border-t border-[#E8E6E1]">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-[#141410] font-display">Insumos Químicos Necessários (Por 100m²)</h3>
                    <p className="text-[11px] text-[#6B6B5F] font-medium">Estes insumos serão deduzidos automaticamente pelo assistente DDSulf nos orçamentos.</p>
                  </div>

                  {inventoryProducts.length === 0 ? (
                    <div className="p-4 bg-[#FFF3CD]/50 border border-[#D4A017]/30 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="size-4 text-[#92600A] shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-[#92600A] uppercase">Nenhum Insumo no Estoque</p>
                        <p className="text-[10px] text-[#92600A] font-medium">Você precisa adicionar produtos no estoque antes de vinculá-los aos POPs.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-[#E8E6E1] rounded-xl overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-[#F0EDE8]">
                          <tr className="border-b border-[#E8E6E1]">
                            <th className="py-2.5 px-3 text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans">Insumo Químico / Concentrado</th>
                            <th className="py-2.5 px-3 text-[10px] font-bold text-[#6B6B5F] uppercase tracking-wider font-sans text-right w-36">Quantidade por 100m²</th>
                            <th className="py-2.5 px-3 w-12"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#E8E6E1]">
                          {formRequiredProducts.map((item, index) => (
                            <tr key={index} className="bg-[#FAFAF9] hover:bg-[#FAFAF9]/60 transition-colors border-b border-[#E8E6E1]">
                              <td className="py-2 px-3">
                                <select
                                  value={item.productId}
                                  onChange={(e) => handleUpdateChemicalLine(index, e.target.value)}
                                  className="w-full h-9 px-2.5 rounded-lg border border-[#E8E6E1] text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-white cursor-pointer"
                                >
                                  {inventoryProducts.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                                  ))}
                                </select>
                              </td>
                              <td className="py-2 px-3 text-right">
                                <div className="flex items-center gap-1.5 justify-end">
                                  <input
                                    type="number"
                                    min="0.001"
                                    step="any"
                                    required
                                    value={item.quantityPer100m2}
                                    onChange={(e) => handleUpdateQuantityLine(index, parseFloat(e.target.value) || 0)}
                                    placeholder="Qtd"
                                    className="w-20 h-9 px-2 rounded-lg border border-[#E8E6E1] text-center text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-white"
                                  />
                                  <span className="text-[11px] font-mono text-[#6B6B5F] font-bold shrink-0 w-8 text-left">{item.unit}</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveChemicalLine(index)}
                                  className="p-1 px-1.5 text-[#6B6B5F] hover:text-[#C1361A] hover:bg-[#FDDDD8] rounded-md transition-colors shrink-0 cursor-pointer"
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </td>
                            </tr>
                          ))}

                          {formRequiredProducts.length === 0 && (
                            <tr>
                              <td colSpan={3} className="py-8 text-center text-[#6B6B5F] text-[11px] bg-[#FAFAF9]">
                                Nenhum químico acoplado a este POP por enquanto. Clique em "+ Produto" para adicionar.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>

                      {/* FOOTER DO PRODUTO: BOTÃO NO RODAPÉ */}
                      <div className="bg-[#F0EDE8] p-2.5 flex justify-end">
                        <button
                          type="button"
                          onClick={handleAddChemicalLine}
                          className="h-8 px-4 bg-white hover:bg-[#1B3A2D] border border-[#E8E6E1] hover:border-[#1B3A2D] text-[#1B3A2D] hover:text-white rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <Plus className="size-3.5" />
                          + Produto
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* ATTACHMENT UPLOAD INPUT PANEL */}
                <div className="space-y-3 pt-4 border-t border-[#E8E6E1]">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-semibold text-[#141410] font-display">Documentação do POP</h3>
                    <p className="text-[11px] text-[#6B6B5F] font-medium">Selecione o PDF oﬁcial ou foto de treinamento químico aprovada (Limite: 2MB).</p>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('document-file-attacher')?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer ${
                      isDragging 
                        ? 'border-[#1B3A2D] bg-[#FAFAF9]' 
                        : 'border-[#E8E6E1] hover:border-[#1B3A2D] hover:bg-[#FAFAF9]/50 bg-[#FAFAF9]'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="p-2.5 bg-white rounded-xl border border-[#E8E6E1] text-[#1B3A2D] shadow-xs">
                        <Upload className="size-5" />
                      </div>

                      <div>
                        <p className="text-xs font-bold text-[#141410]">Arraste o arquivo do POP ou clique para localizar</p>
                        <p className="text-[10px] text-[#6B6B5F] leading-normal mt-0.5">Formatos suportados: PDF, PNG, JPG, JPEG (Limite: 2MB).</p>
                      </div>

                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        id="document-file-attacher"
                      />

                      {formFileName && (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#D8EDE3] text-[#1B3A2D] border border-[#2D6A4F]/20 rounded-lg text-xs font-semibold" onClick={(e) => e.stopPropagation()}>
                          <FileText className="size-4 text-[#2D6A4F]" />
                          <span className="max-w-[200px] truncate text-[#1B3A2D]">{formFileName}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setFormFileName(undefined);
                              setFormFileBase64(undefined);
                            }}
                            className="p-0.5 bg-white/60 hover:bg-white rounded text-[#1B3A2D] cursor-pointer inline-flex items-center justify-center size-5 ml-1"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MODAL ACTION KEYS */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E8E6E1]">
                  <button
                    type="button"
                    onClick={() => setIsFormModalOpen(false)}
                    className="h-10 px-5 rounded-xl text-xs font-semibold text-[#6B6B5F] border border-[#E8E6E1] hover:bg-[#FAFAF9] transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-6 rounded-xl text-xs font-bold bg-[#1B3A2D] text-white hover:bg-[#2D6A4F] transition-all cursor-pointer shadow-xs"
                  >
                    Salvar POP
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SECTION 3: POP MANUSCRIPT DRAWER / TEXT INSTRUCTIONS VIEWER */}
      <AnimatePresence>
        {viewingPopId && (() => {
          const pop = procedures.find(p => p.id === viewingPopId);
          if (!pop) return null;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border text-left border-[#E8E6E1] max-w-xl w-full rounded-2xl overflow-hidden shadow-2xl relative flex flex-col"
              >
                {/* Header view */}
                <div className="bg-[#1B3A2D] text-white p-6 flex items-start justify-between">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 rounded-md font-mono text-[9px] font-bold border border-white/20 uppercase bg-white/10 text-white leading-none inline-block">
                      POP #{pop.id}
                    </span>
                    <h3 className="text-lg font-semibold font-display text-white pr-4 pt-1 leading-tight">{pop.name}</h3>
                  </div>
                  <button
                    onClick={() => setViewingPopId(null)}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                  {/* Scope criteria */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold py-3 px-4 bg-[#FAFAF9] rounded-xl border border-[#E8E6E1]">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block pb-0.5 font-sans">Praga Principal</span>
                      <span className="text-[#141410] font-bold">{getPestLabel(pop.pestType)}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block pb-0.5 font-sans">Serviço de Combate</span>
                      <span className="text-[#141410] font-bold">{getServiceLabel(pop.serviceType)}</span>
                    </div>
                  </div>

                  {/* Operational instructions text */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block font-sans">Ficha de Instruções Sanitárias</span>
                    <div className="p-4 bg-[#FAFAF9] rounded-xl text-xs text-[#141410] font-medium leading-relaxed max-h-[200px] overflow-y-auto whitespace-pre-wrap max-w-full border border-[#E8E6E1] font-sans">
                      {pop.instructions}
                    </div>
                  </div>

                  {/* Required products */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B6B5F] block font-sans">Insumos Químicos Associados</span>
                    <div className="space-y-1.5">
                      {pop.requiredProducts?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs font-semibold text-[#141410] py-1.5 border-b border-dashed border-[#E8E6E1]">
                          <span className="flex items-center gap-1.5 text-[#141410]">
                            <span className="size-1.5 bg-[#2D6A4F] rounded-full" />
                            {item.productName}
                          </span>
                          <span className="font-mono text-[#6B6B5F] font-bold">{item.quantityPer100m2} {item.unit} por 100m²</span>
                        </div>
                      ))}
                      {(!pop.requiredProducts || pop.requiredProducts.length === 0) && (
                        <p className="text-[10px] italic text-[#6B6B5F]">Nenhum solvente ou químico associado.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-[#FAFAF9] border-t border-[#E8E6E1] flex justify-end gap-3 text-xs font-semibold">
                  {pop.fileUrl && (
                    <button
                      onClick={() => {
                        setViewingPopId(null);
                        handleViewFile(pop);
                      }}
                      className="inline-flex items-center gap-1.5 bg-white border border-[#E8E6E1] hover:bg-[#FAFAF9] text-[#141410] px-4 py-2 rounded-xl transition-all cursor-pointer"
                    >
                      <ExternalLink className="size-3.5 text-[#6B6B5F]" />
                      Abrir Anexo Original
                    </button>
                  )}
                  <button
                    onClick={() => setViewingPopId(null)}
                    className="bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white font-bold px-5 py-2 rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Concluído
                  </button>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* DETACHED IMAGE VIEWER FULLSCREEN MODEL */}
      <AnimatePresence>
        {fullscreenImage && (
          <div className="fixed inset-0 z-[100] bg-black/90 flex flex-col items-center justify-center p-4 backdrop-blur-md">
            <button
              onClick={() => setFullscreenImage(null)}
              className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all cursor-pointer"
            >
              <X className="size-6" />
            </button>
            <div className="max-w-4xl max-h-[80vh] overflow-hidden flex items-center justify-center rounded-2xl bg-white/5 p-2 border border-white/15">
              <img
                src={fullscreenImage}
                alt="Procedimento Técnico DDSulf"
                className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
              />
            </div>
            <p className="text-white/60 text-xs font-bold font-mono tracking-widest uppercase mt-4">Visualizador do Procedimento Operacional</p>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
