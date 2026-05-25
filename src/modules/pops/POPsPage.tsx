import React, { useState } from 'react';
import { useSystemStore } from '@/store';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Trash2, 
  Edit3, 
  Plus, 
  Search, 
  Layers, 
  FileCheck2, 
  Eye, 
  X, 
  Upload, 
  Clock, 
  BookOpen, 
  Beaker, 
  AlertTriangle, 
  Check, 
  Sparkles, 
  ExternalLink,
  ChevronRight,
  Info,
  Shield,
  SearchX
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
  if (!val) return 'bg-zinc-50 text-zinc-700 border-zinc-200';
  const v = val.toLowerCase().trim();
  if (v === 'baratas') return 'bg-amber-50 text-amber-700 border-amber-200/60';
  if (v === 'ratos') return 'bg-slate-100 text-slate-800 border-slate-200';
  if (v === 'cupins') return 'bg-orange-50 text-orange-700 border-orange-200/60';
  if (v === 'mosquitos/dengue' || v === 'mosquitos' || v === 'mosquitos-dengue' || v === 'mosquito') return 'bg-blue-50 text-blue-700 border-blue-200/60';
  if (v === 'formigas') return 'bg-rose-50 text-rose-700 border-rose-200/60';
  if (v === 'escorpioes' || v === 'escorpiões') return 'bg-purple-50 text-purple-700 border-purple-200/60';
  if (v === 'aranhas') return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
  return 'bg-zinc-100 text-zinc-700 border-zinc-200';
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
  // ATTACHMENT METADATA DECODER
  // -------------------------------------------------------------
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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

    if (file.type.startsWith('image/')) {
      reader.readAsDataURL(file);
    } else {
      // PDF or text doc
      reader.readAsDataURL(file);
    }
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
        description: `Procedimento "${formName}" adicionado à catálogo operacional.`
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
      // PDF base64: create new object url if needed, or window.open
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
    <div className="space-y-8 animate-in fade-in duration-500 text-left">
      
      {/* HEADER SECTION WITH ACTION */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-gray-100">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="size-2 bg-slate-900 rounded-full" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Padrão operacional & controle químico</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-neutral-950">POP Técnicos</h1>
          <p className="text-gray-500 text-sm max-w-2xl font-medium">Configure as fichas de aplicação. Defina os quimicos, dosagens por 100m² e tempos sugeridos de serviço automático.</p>
        </div>

        <Button
          id="btn-add-new-pop"
          onClick={triggerCreateModal}
          className="bg-slate-950 text-white hover:bg-slate-900 h-11 px-5 rounded-2xl text-[11px] font-black uppercase tracking-wider shadow-sm transition-all self-start md:self-auto flex items-center gap-1.5 active:scale-98"
        >
          <Plus className="size-4" />
          Novo POP
        </Button>
      </header>

      {/* FILTER SEARCH BAR */}
      <div className="relative max-w-xl">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filtrar procedimentos por praga, serviço ou nome..."
          className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-slate-950 bg-white shadow-xs"
        />
      </div>

      {/* PROTOCOL MATRICES CARDS */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {displayedProcedures.map((pop) => {
          const chemicalCount = pop.requiredProducts?.length || 0;
          return (
            <motion.div
              layout
              key={pop.id}
              whileHover={{ y: -3 }}
              className="bg-white border border-gray-100 rounded-[28px] p-6 shadow-xs flex flex-col justify-between hover:border-slate-950 transition-all text-left"
            >
              <div className="space-y-4">
                
                {/* Visual Category/Pest badging */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-md font-mono text-[9px] font-bold border uppercase ${getPestBadgeStyle(pop.pestType)}`}>
                    #{getPestLabel(pop.pestType)}
                  </span>
                  
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[9px] font-bold uppercase">
                    {getServiceLabel(pop.serviceType)}
                  </span>
                </div>

                {/* POP Name & Summary details */}
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-950 tracking-tight leading-tight">{pop.name}</h3>
                  <p className="text-[10px] text-gray-400 font-mono">ID: {pop.id}</p>
                </div>

                <p className="text-xs text-slate-500 font-semibold line-clamp-3 leading-relaxed">
                  {pop.instructions || "Nenhuma diretriz cadastrada para este procedimento operacional."}
                </p>

                {/* Technical variables layout */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50 text-[11px] font-semibold text-slate-700">
                  <div className="flex items-center gap-2">
                    <Beaker className="size-3.5 text-slate-400" />
                    <span>
                      <strong className="text-slate-950 block">{chemicalCount}</strong> Insumos sugeridos
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="size-3.5 text-slate-400" />
                    <span>
                      <strong className="text-slate-950 block">{pop.estimatedTimeHoursPer100m2} Hrs</strong> por 100m²
                    </span>
                  </div>
                </div>

              </div>

              {/* ACTION FOOTER BAR */}
              <div className="flex items-center justify-between gap-2 mt-6 pt-4 border-t border-gray-50">
                <Button
                  variant="outline"
                  onClick={() => handleViewFile(pop)}
                  className="h-9 px-3.5 rounded-xl text-[10px] font-bold text-slate-800 border-gray-200 hover:bg-slate-50 flex items-center gap-1 shadow-xs"
                >
                  <Eye className="size-3.5 text-slate-400" />
                  Visualizar
                </Button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => triggerEditModal(pop)}
                    className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Edit3 className="size-3.5" />
                  </button>
                  <button
                    onClick={() => deleteProcedure(pop.id, pop.name)}
                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

            </motion.div>
          );
        })}

        {displayedProcedures.length === 0 && (
          <div className="col-span-full py-24 text-center border-2 border-dashed border-gray-100 rounded-[32px] flex flex-col items-center justify-center gap-4 bg-slate-50/20">
            <SearchX className="size-10 text-slate-300 animate-pulse" />
            <div className="space-y-1">
              <p className="text-sm font-black text-slate-950 uppercase tracking-widest">Procedimento Não Encontrado</p>
              <p className="text-xs text-gray-400 max-w-sm font-semibold">Crie novos arquivos do POP ou reajuste o filtro de praga no topo.</p>
            </div>
            <Button
              onClick={triggerCreateModal}
              className="bg-slate-950 text-white uppercase text-[10px] py-2 px-5 rounded-lg hover:bg-slate-900 font-extrabold"
            >
              Criar Primeiro POP
            </Button>
          </div>
        )}
      </div>

      {/* SECTION 2: WORKSHOP FORM MODAL (Add / Edit) */}
      <AnimatePresence>
        {isFormModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 max-w-3xl w-full rounded-[32px] shadow-2xl p-6 md:p-8 space-y-6 my-8 max-h-[90vh] overflow-y-auto text-left"
            >
              <div className="flex items-start justify-between pb-4 border-b">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="size-1.5 bg-slate-900 rounded-full" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Diretriz da DDSulf</span>
                  </div>
                  <h2 className="text-xl font-black text-slate-950">
                    {modalMode === 'create' ? 'Cadastrar Novo Procedimento' : 'Editar Procedimento Operacional'}
                  </h2>
                </div>
                <button
                  onClick={() => setIsFormModalOpen(false)}
                  className="p-1.5 hover:bg-slate-50 rounded-lg text-slate-400 hover:text-slate-950 transition-colors"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveForm} className="space-y-6 text-xs font-semibold text-slate-700">
                
                {/* ROW 1: BASIC INFO */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Nome do procedimento</label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ex: Desinsetização Quimica Geral de Baratas no Esgoto"
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-slate-950 bg-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tipo de Praga Alvo</label>
                    <select
                      value={formPestType}
                      onChange={(e) => setFormPestType(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-slate-950 bg-white"
                    >
                      {PESTS_LIST.map((pest) => (
                        <option key={pest} value={pest}>{pest}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tipo de Serviço</label>
                    <select
                      value={formServiceType}
                      onChange={(e) => setFormServiceType(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-slate-950 bg-white"
                    >
                      {SERVICES_LIST.map((srv) => (
                        <option key={srv.value} value={srv.value}>{srv.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Tempo por 100m² (Horas)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(parseFloat(e.target.value) || 0.5)}
                      className="w-full h-11 px-4 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-slate-950 bg-white"
                    />
                  </div>
                </div>

                {/* TEXTAREA DIRECTIVES */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-400">Instruções gerais recomendadas aos técnicos</label>
                  <textarea
                    rows={3}
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder="Detalhamento operacional. Métricas de diluição rápida, posicionamento perimetral, advertências, EPIs específicos ou alertas operacionais ambientais..."
                    className="w-full p-4 rounded-xl border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-slate-950 bg-white leading-relaxed resize-none"
                  />
                </div>

                {/* DYNAMIC PRODUCTS PER 100M² LINKED TO INVENTORY */}
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-black text-slate-950">Insumos Químicos Necessários (Por 100m²)</h3>
                      <p className="text-[10px] text-gray-400 font-medium">Estes insumos serão deduzidos comercialmente pelo assistente DDSulf nos orçamentos.</p>
                    </div>

                    <Button
                      type="button"
                      onClick={handleAddChemicalLine}
                      variant="outline"
                      className="h-8 pr-3 pl-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider border-gray-200 text-slate-950 hover:bg-slate-50 flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="size-3.5" />
                      Adicionar Linha
                    </Button>
                  </div>

                  {inventoryProducts.length === 0 ? (
                    <div className="p-4 bg-amber-50 border border-amber-200/50 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-black text-amber-950 uppercase">Nenhum Insumo no Estoque</p>
                        <p className="text-[10px] text-amber-800 font-medium">Você precisa adicionar produtos no estoque para linká-los em novos POPs operacionais.</p>
                      </div>
                    </div>
                  ) : formRequiredProducts.length === 0 ? (
                    <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-xl bg-slate-50/20 text-slate-400">
                      <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Nenhum químico acoplado a este POP por enquanto.<br />Gere uma linha acima para computar custos na calculadora.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                      {formRequiredProducts.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-transparent hover:border-slate-200 transition-all">
                          
                          {/* Product Lookup select */}
                          <div className="flex-1">
                            <select
                              value={item.productId}
                              onChange={(e) => handleUpdateChemicalLine(index, e.target.value)}
                              className="w-full h-9 px-2 rounded-lg border border-gray-200 text-xs font-semibold focus:outline-hidden focus:border-slate-950 bg-white"
                            >
                              {inventoryProducts.map(p => (
                                <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                              ))}
                            </select>
                          </div>

                          {/* Float quantity input */}
                          <div className="w-28 flex items-center gap-2">
                            <input
                              type="number"
                              min="0.001"
                              step="any"
                              required
                              value={item.quantityPer100m2}
                              onChange={(e) => handleUpdateQuantityLine(index, parseFloat(e.target.value) || 0)}
                              placeholder="Fração"
                              className="w-full h-9 px-2 rounded-lg border border-gray-200 text-center text-xs font-bold focus:outline-hidden focus:border-slate-950 bg-white"
                            />
                            <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0 w-8">{item.unit}</span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveChemicalLine(index)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-white rounded-md border border-transparent hover:border-gray-200 transition-colors shrink-0"
                          >
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ATTACHMENT UPLOAD INPUT PANEL */}
                <div className="space-y-3 pt-4 border-t border-gray-100">
                  <div className="space-y-0.5">
                    <h3 className="text-sm font-black text-slate-950">Documentação do POP</h3>
                    <p className="text-[10px] text-gray-400 font-medium">Selecione o PDF oficial ou foto de treinamento químico aprovada (Limite: 2MB).</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,image/png,image/jpeg,image/jpg,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                        id="document-file-attacher"
                      />
                      <Button
                        type="button"
                        onClick={() => document.getElementById('document-file-attacher')?.click()}
                        className="h-10 bg-slate-100 border text-slate-800 hover:bg-slate-200 rounded-xl px-4 text-xs font-bold flex items-center gap-2 shadow-xs"
                      >
                        <Upload className="size-4" />
                        Anexar Procedimento
                      </Button>
                    </div>

                    {formFileName ? (
                      <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border rounded-lg text-slate-800">
                        <FileText className="size-4 text-slate-500" />
                        <span className="max-w-[200px] truncate text-slate-800 font-semibold">{formFileName}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormFileName(undefined);
                            setFormFileBase64(undefined);
                          }}
                          className="p-0.5 bg-slate-200 rounded text-slate-500 hover:text-slate-950"
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nenhum arquivo de rascunho</span>
                    )}
                  </div>
                </div>

                {/* MODAL ACTION KEYS */}
                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsFormModalOpen(false)}
                    className="h-10 px-5 rounded-xl text-xs font-bold text-slate-500 border-gray-200 hover:bg-slate-50"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    className="h-10 px-6 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-950 text-white hover:bg-slate-900 shadow-sm"
                  >
                    Salvar POP
                  </Button>
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
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border text-left border-gray-200 max-w-xl w-full rounded-[32px] p-6 shadow-2xl relative space-y-5"
              >
                <div className="flex items-start justify-between pb-3 border-b">
                  <div className="space-y-1">
                    <span className="px-2 py-0.5 rounded-md font-mono text-[9px] font-bold border uppercase bg-slate-100 text-slate-700">
                      POP #{pop.id}
                    </span>
                    <h3 className="text-base font-black text-slate-950 block select-none pt-1">{pop.name}</h3>
                  </div>
                  <button
                    onClick={() => setViewingPopId(null)}
                    className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-950 transition-colors"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Scope criteria */}
                  <div className="grid grid-cols-2 gap-3 text-xs font-semibold py-3 px-4 bg-slate-50 rounded-2xl border border-gray-100">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block pb-0.5">Praga Principal</span>
                      <span className="text-slate-950 font-bold">{getPestLabel(pop.pestType)}</span>
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block pb-0.5">Serviço de Combate</span>
                      <span className="text-slate-950 font-bold">{getServiceLabel(pop.serviceType)}</span>
                    </div>
                  </div>

                  {/* Operational instructions text */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Ficha de Instruções Sanitárias</span>
                    <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-700 font-semibold leading-relaxed max-h-[160px] overflow-y-auto whitespace-pre-wrap max-w-full">
                      {pop.instructions}
                    </div>
                  </div>

                  {/* Required products */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">Insumos Químicos Associados</span>
                    <div className="space-y-1">
                      {pop.requiredProducts?.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-xs font-bold text-slate-800 py-1 border-b border-dashed border-gray-100">
                          <span className="flex items-center gap-1.5 text-slate-900">
                            <span className="size-1.5 bg-slate-900 rounded-full" />
                            {item.productName}
                          </span>
                          <span className="font-mono text-slate-500 font-bold">{item.quantityPer100m2} {item.unit} por 100m²</span>
                        </div>
                      ))}
                      {(!pop.requiredProducts || pop.requiredProducts.length === 0) && (
                        <p className="text-[10px] italic text-gray-400">Nenhum solvente ou químico associado.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t flex justify-end gap-3 text-xs font-semibold">
                  {pop.fileUrl && (
                    <button
                      onClick={() => {
                        setViewingPopId(null);
                        handleViewFile(pop);
                      }}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border text-slate-800 px-4 py-2 rounded-xl transition-all"
                    >
                      <ExternalLink className="size-3.5" />
                      Abrir Anexo Original
                    </button>
                  )}
                  <button
                    onClick={() => setViewingPopId(null)}
                    className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold uppercase text-[10px] px-5 py-2 rounded-xl transition-all"
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
              className="absolute top-6 right-6 p-2 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all"
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
