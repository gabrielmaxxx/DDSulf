import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSystemStore } from '@/store';
import { auth } from '@/firebase/config';
import { tenantStorage } from '@/utils/storage';
import {
  Activity,
  Package,
  Trash2,
  Plus,
  Search,
  Upload,
  Clock,
  Check,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  Calendar,
  Download,
  AlertCircle,
  Zap,
  PlusCircle,
  UserCheck,
  FolderTree,
  Filter,
  ShieldCheck,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { CollapsibleSection } from '@/components/ui/collapsible-section';
import {
  ExtendedPOP,
  TrainingCourse,
  SuggestedEdit,
  DEFAULT_SEEDED_POPS,
  SEEDED_TRAININGS,
} from './types';
import { POPsCategoriesSheet } from './components/POPsCategoriesSheet';
import { POPsAIChatSheet } from './components/POPsAIChatSheet';
import { POPsSuggestionsSheet } from './components/POPsSuggestionsSheet';
import { POPsReadingDialog } from './components/POPsReadingDialog';
import { POPsCreateDialog } from './components/POPsCreateDialog';
import { POPsEditDialog } from './components/POPsEditDialog';
import { POPsUploadDialog } from './components/POPsUploadDialog';
import { POPsTrainingDialog } from './components/POPsTrainingDialog';

export function POPsPage() {
  const { pops, inventory, agenda, addPOP, updatePOP, removePOP } = useSystemStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dbProcedures = pops?.procedures || [];
  const inventoryProducts = inventory?.products || [];

  // Combine database procedures and static pre-seeded ones
  const [procedures, setProcedures] = useState<ExtendedPOP[]>([]);

  // Local storage lists for suggested alterations (Model B simulation)
  const [suggestedEdits, setSuggestedEdits] = useState<SuggestedEdit[]>([]);

  // Navigation & filtering states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos'); // Horizontal Filters
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // Tree Category Folder
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null); // Tree child nodes

  // Sheets states
  const [isCategoriesSheetOpen, setIsCategoriesSheetOpen] = useState(false);
  const [isAiSheetOpen, setIsAiSheetOpen] = useState(false);
  const [isSuggestionsSheetOpen, setIsSuggestionsSheetOpen] = useState(false);

  // Dialogs states
  const [readingPop, setReadingPop] = useState<ExtendedPOP | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedDiffVersion, setSelectedDiffVersion] = useState<string>('1.0');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestionProposal, setSuggestionProposal] = useState('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingPop, setEditingPop] = useState<ExtendedPOP | null>(null);

  // Training Player states
  const [activeTraining, setActiveTraining] = useState<TrainingCourse | null>(null);
  const [courseMode, setCourseMode] = useState<'slides' | 'quiz' | 'completed'>('slides');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // AI Chat states
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatLog, setAiChatLog] = useState<Array<{ sender: 'user' | 'ia'; text: string }>>([
    {
      sender: 'ia',
      text: 'Olá! Sou o Assistente de Inteligência de POPs da PestFlow. Digite uma praga ou procedimento técnico e eu consultarei a base de conhecimentos em tempo real!',
    },
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Form Field states for CRUD
  const [formName, setFormName] = useState('');
  const [formPest, setFormPest] = useState('baratas');
  const [formServiceType, setFormServiceType] = useState('dedetizacao');
  const [formCategory, setFormCategory] = useState('Operacional');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formTime, setFormTime] = useState(1.5);
  const [formInstructions, setFormInstructions] = useState('');
  const [formRequiredProducts, setFormRequiredProducts] = useState<any[]>([]);

  // Drag and Drop Attachment files
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(undefined);
  const [uploadedBase64, setUploadedBase64] = useState<string | undefined>(undefined);

  // Initial Sync from useSystemStore database
  useEffect(() => {
    const formattedDb: ExtendedPOP[] = dbProcedures.map((item: any) => {
      let cat = 'Operacional';
      let subcat: string | undefined = undefined;

      const pType = (item.pestType || '').toLowerCase().trim();
      const nameLower = item.name.toLowerCase();

      if (pType === 'baratas' || nameLower.includes('barata')) {
        subcat = 'Controle de Baratas';
      } else if (pType === 'formigas' || nameLower.includes('formiga')) {
        subcat = 'Controle de Formigas';
      } else if (pType === 'cupins' || nameLower.includes('cupim')) {
        subcat = 'Controle de Cupins';
      } else if (pType === 'ratos' || nameLower.includes('rato') || nameLower.includes('roedor')) {
        subcat = 'Controle de Roedores';
      } else if (pType === 'escorpioes' || pType === 'escorpiões' || nameLower.includes('escorpião')) {
        subcat = 'Controle de Escorpiões';
      }

      if (nameLower.includes('admin') || item.serviceType === 'administrativo') {
        cat = 'Administrativo';
        subcat = undefined;
      } else if (nameLower.includes('financeiro') || item.serviceType === 'financeiro') {
        cat = 'Financeiro';
        subcat = undefined;
      } else if (nameLower.includes('venda') || nameLower.includes('comercial') || item.serviceType === 'comercial') {
        cat = 'Comercial';
        subcat = undefined;
      } else if (nameLower.includes('sistema') || item.serviceType === 'sistemas') {
        cat = 'Sistemas';
        subcat = undefined;
      }

      return {
        id: item.id,
        name: item.name,
        pestType: item.pestType,
        serviceType: item.serviceType,
        requiredProducts: item.requiredProducts || [],
        estimatedTimeHoursPer100m2: item.estimatedTimeHoursPer100m2 || 1.0,
        fileUrl: item.fileUrl,
        fileName: item.fileName,
        instructions: item.instructions || '',
        createdAt: item.createdAt || new Date().toISOString().split('T')[0],
        category: cat,
        subcategory: subcat,
        author: 'Responsável Técnico',
        version: '1.0',
        status: 'Ativo',
        lastRevision: item.createdAt || '01/06/2026',
        versions: [{ version: '1.0', date: item.createdAt || '01/06/2026', change: 'Primeiro upload da diretriz operacional.' }],
      };
    });

    setProcedures(formattedDb);
  }, [dbProcedures]);

  const handleImportStandardTemplates = () => {
    DEFAULT_SEEDED_POPS.forEach((pop) => {
      addPOP({
        id: `pop-${Math.random().toString(36).substr(2, 9)}`,
        name: pop.name,
        pestType: pop.pestType,
        serviceType: pop.serviceType,
        requiredProducts: pop.requiredProducts,
        estimatedTimeHoursPer100m2: pop.estimatedTimeHoursPer100m2,
        instructions: pop.instructions,
        createdAt: new Date().toLocaleDateString('pt-BR'),
      });
    });
    toast.success('Modelos de POPs sugeridos importados com sucesso!');
  };

  // Listen for search or popId URL parameters
  useEffect(() => {
    const qSearch = searchParams.get('search');
    if (qSearch && qSearch.trim() !== '') {
      setSearchTerm(decodeURIComponent(qSearch));
    }
    const qPopId = searchParams.get('popId');
    if (qPopId && procedures.length > 0) {
      const found = procedures.find((p) => p.id === qPopId);
      if (found) {
        setReadingPop(found);
        toast.info(`Visualizando procedimento: ${found.name}`);
      }
    }
  }, [searchParams, procedures]);

  // Load collaborator suggestions
  useEffect(() => {
    const cached = tenantStorage.getItem('pop_suggestions');
    if (cached) {
      try {
        setSuggestedEdits(JSON.parse(cached));
      } catch {
        setSuggestedEdits([]);
      }
    } else {
      setSuggestedEdits([]);
    }
  }, []);

  const handleCreatePOP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) {
      toast.error('Preencha o título do procedimento.');
      return;
    }

    const nextId = `pop-custom-${Math.random().toString(36).substring(2, 9)}`;
    const newRecord = {
      id: nextId,
      name: formName,
      pestType: formPest,
      serviceType: formServiceType,
      requiredProducts: formRequiredProducts,
      estimatedTimeHoursPer100m2: formTime,
      instructions: formInstructions,
      fileUrl: uploadedBase64,
      fileName: uploadedFileName,
      createdAt: new Date().toISOString().split('T')[0],
    };

    addPOP(newRecord);

    toast.success('Novo POP criado na biblioteca!', {
      description: 'Diretriz operacional cadastrada com sucesso e vinculada ao sistema geral.',
    });

    setIsCreateOpen(false);
    resetForm();
  };

  const handleEditPOP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPop) return;

    const updatedData = {
      name: formName,
      pestType: formPest,
      serviceType: formServiceType,
      requiredProducts: formRequiredProducts,
      estimatedTimeHoursPer100m2: formTime,
      instructions: formInstructions,
      fileUrl: uploadedBase64 || editingPop.fileUrl,
      fileName: uploadedFileName || editingPop.fileName,
    };

    updatePOP(editingPop.id, updatedData);

    toast.success('POP operacional atualizado!', {
      description: 'As alterações foram sincronizadas e registradas na biblioteca corporativa.',
    });

    setIsEditOpen(false);
    setEditingPop(null);
    resetForm();
  };

  const handleDeletePOP = (id: string, name: string) => {
    if (confirm(`Remover permanentemente o procedimento "${name}" do acervo da empresa?`)) {
      removePOP(id);
      toast.success('Procedimento excluído do sistema.');
    }
  };

  const handleUploadedFiles = (file: File) => {
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > 3) {
      toast.error('O arquivo excede o limite máximo permitido de 3MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedBase64(e.target?.result as string);
      setUploadedFileName(file.name);
      toast.success(`Arquivo carregado: ${file.name}`, {
        description: 'Documento acoplado e pronto para vinculação operacional.',
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      handleUploadedFiles(e.dataTransfer.files[0]);
    }
  };

  const triggerCreateModal = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const triggerUploadModal = () => {
    resetForm();
    setIsUploadOpen(true);
  };

  const triggerEditModal = (pop: ExtendedPOP) => {
    setEditingPop(pop);
    setFormName(pop.name);
    setFormPest(pop.pestType);
    setFormServiceType(pop.serviceType);
    setFormCategory(pop.category);
    setFormSubcategory(pop.subcategory || '');
    setFormTime(pop.estimatedTimeHoursPer100m2);
    setFormInstructions(pop.instructions);
    setFormRequiredProducts(pop.requiredProducts);
    setUploadedFileName(pop.fileName);
    setUploadedBase64(pop.fileUrl);
    setIsEditOpen(true);
  };

  const resetForm = () => {
    setFormName('');
    setFormPest('baratas');
    setFormServiceType('dedetizacao');
    setFormCategory('Operacional');
    setFormSubcategory('');
    setFormTime(1.5);
    setFormInstructions('');
    setFormRequiredProducts([]);
    setUploadedFileName(undefined);
    setUploadedBase64(undefined);
  };

  const addChemicalLine = () => {
    if (inventoryProducts.length === 0) {
      toast.warning('Nenhum insumo cadastrado no estoque.', {
        description: 'Vá até o painel de Estoque para alimentar os insumos ativos.',
      });
      return;
    }
    const standard = inventoryProducts[0];
    setFormRequiredProducts((prev) => [
      ...prev,
      { productId: standard.id, productName: standard.name, quantityPer100m2: 10, unit: standard.unit },
    ]);
  };

  const updateChemicalField = (idx: number, field: string, val: any) => {
    setFormRequiredProducts((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        if (field === 'productId') {
          const found = inventoryProducts.find((p) => p.id === val);
          return {
            ...item,
            productId: val,
            productName: found ? found.name : item.productName,
            unit: found ? found.unit : item.unit,
          };
        }
        return { ...item, [field]: val };
      })
    );
  };

  const removeChemicalLine = (idx: number) => {
    setFormRequiredProducts((prev) => prev.filter((_, i) => i !== idx));
  };

  const suggestAlteration = () => {
    if (!suggestionProposal.trim() || !readingPop) return;

    const newSuggestion: SuggestedEdit = {
      id: `sug-${Math.random().toString(36).substring(2, 9)}`,
      popId: readingPop.id,
      popName: readingPop.name,
      proposer: 'Técnico Especialista',
      content: suggestionProposal.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'pendente',
    };

    const updated = [newSuggestion, ...suggestedEdits];
    setSuggestedEdits(updated);
    tenantStorage.setItem('pop_suggestions', JSON.stringify(updated));

    toast.success('Sugestão enviada com sucesso!', {
      description: 'O gestor avaliador revisará sua solicitação para eventual publicação na nova versão.',
    });

    setSuggestionProposal('');
    setIsSuggestOpen(false);
  };

  const approveSuggestion = (sug: SuggestedEdit) => {
    const target = procedures.find((p) => p.id === sug.popId);
    if (!target) return;

    const currentVer = parseFloat(target.version || '1.0');
    const nextVer = (currentVer + 0.1).toFixed(1);

    const appendText = `\n\n* [Ajuste Versão ${nextVer} - Sugestão Aprovada]: ${sug.content}`;
    const newInstructions = target.instructions + appendText;

    updatePOP(target.id, {
      instructions: newInstructions,
      version: nextVer,
      name: target.name,
      pestType: target.pestType,
      serviceType: target.serviceType,
      requiredProducts: target.requiredProducts,
      estimatedTimeHoursPer100m2: target.estimatedTimeHoursPer100m2,
      fileUrl: target.fileUrl,
      fileName: target.fileName,
    } as any);

    const updatedLocally = suggestedEdits.map((s) => {
      if (s.id === sug.id) return { ...s, status: 'aprovado' as const };
      return s;
    });
    setSuggestedEdits(updatedLocally);
    tenantStorage.setItem('pop_suggestions', JSON.stringify(updatedLocally));

    toast.success(`Sugestão técnica de ${sug.proposer} aprovada!`, {
      description: `Procedimento "${target.name}" atualizado de v${target.version} para v${nextVer}.`,
    });

    setReadingPop(null);
  };

  const rejectSuggestion = (sugId: string) => {
    const updatedLocally = suggestedEdits.map((s) => {
      if (s.id === sugId) return { ...s, status: 'rejeitado' as const };
      return s;
    });
    setSuggestedEdits(updatedLocally);
    tenantStorage.setItem('pop_suggestions', JSON.stringify(updatedLocally));
    toast.info('Sugestão de alteração recusada pelo Administrador.');
  };

  const submitAiQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatQuery.trim() || isAiLoading) return;

    const userText = aiChatQuery;
    setAiChatLog((prev) => [...prev, { sender: 'user', text: userText }]);
    setAiChatQuery('');
    setIsAiLoading(true);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const popContext = `Você é o Assistente de Inteligência Especializado em POPs (Procedimentos Operacionais Padrão) da PestFlow.
Atualmente, a biblioteca possui os seguintes POPs cadastrados na base:
${procedures.map((p) => `- POP: ${p.name} | Praga: ${p.pestType} | Versão: ${p.version} | Categoria: ${p.category}`).join('\n')}

Responda dúvidas sobre técnicas de controle de pragas, dosagens, EPIs exigidos, procedimentos e normas da Anvisa com precisão e clareza.`;

      const response = await fetch('/api/ai/pestflow-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userText,
          systemContext: popContext,
          history: aiChatLog.map((m) => ({
            role: m.sender === 'ia' ? 'model' : 'user',
            content: m.text,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com o servidor de inteligência.');
      }

      const data = await response.json();
      const answer = data.text || 'Não foi possível obter resposta da inteligência.';
      setAiChatLog((prev) => [...prev, { sender: 'ia', text: answer }]);
    } catch {
      setAiChatLog((prev) => [
        ...prev,
        { sender: 'ia', text: 'Desculpe, ocorreu um erro ao consultar o assistente de inteligência. Tente novamente.' },
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleGenerateProcedureWithAI = async () => {
    if (isGeneratingAI) return;
    setIsGeneratingAI(true);
    toast.info('Gerando POP com IA...');

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const chemicalProducts = (inventoryProducts || []).filter((p) => {
        const cat = (p.category || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        const isExcluded =
          cat.includes('epi') ||
          cat.includes('equip') ||
          cat.includes('veículo') ||
          cat.includes('veiculo') ||
          cat.includes('ferramenta') ||
          cat.includes('uniforme');
        if (isExcluded) return false;
        return (
          cat.includes('quím') ||
          cat.includes('quim') ||
          cat.includes('insetic') ||
          cat.includes('ratic') ||
          cat.includes('cupin') ||
          cat.includes('gel') ||
          cat.includes('isca') ||
          cat.includes('defensiv') ||
          cat.includes('desinfest') ||
          name.includes('sc') ||
          name.includes('wg') ||
          name.includes('ce') ||
          name.includes('gel') ||
          cat === '' ||
          p.quantity > 0
        );
      });

      const allowedChemicalIds = (chemicalProducts.length > 0 ? chemicalProducts : inventoryProducts).map((p) =>
        p.id ? `${p.id}: ${p.name}` : p.name
      );

      const response = await fetch('/api/ai/generate-procedure', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: formName || 'Procedimento Técnico de Controle de Pragas',
          description: formName || 'Controle de Pragas Urbana',
          targetPests: [formPest],
          allowedChemicalIds,
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar procedimento com IA');
      }

      const res = await response.json();

      if (res.pestType) {
        setFormPest(res.pestType);
      }

      const stepsText = Array.isArray(res.steps)
        ? res.steps.map((s: any) => `### Etapa ${s.sequence || ''}: ${s.title || ''}\n${s.description || ''}`).join('\n\n')
        : '';

      const fullInstructions =
        `# ${formName || 'PROCEDIMENTO OPERACIONAL PADRÃO'}\n\n` +
        `**Praga-Alvo:** ${res.pestType || formPest}\n` +
        `**Princípios Ativos:** ${res.activeIngredients || 'A definir conforme praga-alvo'}\n` +
        `**Diluição Recomendada:** ${res.dilutionRatio || res.recommendedChemicalVolume || 'Conforme rótulo do fabricante'}\n` +
        `**Método de Aplicação:** ${res.applicationMethod || 'Pulverização / Pincelamento'}\n` +
        `**EPIs Obrigatórios:** ${res.safetyEquipment || res.requiredEPIs?.extraArmorText || 'Luvas de nitrila, máscara P2, óculos e botas'}\n` +
        `**Tempo de Reentrada:** ${res.reentryInterval || '24 horas'}\n` +
        `**Base Legal / Regulamentação:** ${res.legalFramework || 'RDC 52/2009 ANVISA / NR-31'}\n\n` +
        `## PASSO A PASSO OPERACIONAL\n${stepsText || 'Siga as recomendações técnicas do fabricante e regras de segurança da Anvisa.'}`;

      setFormInstructions(fullInstructions);
      toast.success('POP gerado com IA com sucesso!');
    } catch (err) {
      console.error('Erro na geração de POP com IA:', err);
      toast.error('Erro ao gerar POP com IA. Tente novamente.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Filter and display calculations
  const totalCount = procedures.length + SEEDED_TRAININGS.length;
  const operationalCount = procedures.filter((p) => p.category === 'Operacional').length;
  const adminCount = procedures.filter((p) => p.category === 'Administrativo').length;
  const trainingsCount = SEEDED_TRAININGS.length;
  const pendingReviewCount = suggestedEdits.filter((s) => s.status === 'pendente').length;

  const filteredProcedures = procedures.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchSearch =
      p.name.toLowerCase().includes(q) ||
      p.pestType.toLowerCase().includes(q) ||
      p.instructions.toLowerCase().includes(q) ||
      p.author.toLowerCase().includes(q);

    if (!matchSearch) return false;

    if (activeCategory) {
      if (p.category !== activeCategory) return false;
      if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
    }

    if (selectedFilter !== 'Todos') {
      if (selectedFilter === 'Pendentes Revisão') {
        const hasSuggestion = suggestedEdits.some((s) => s.popId === p.id && s.status === 'pendente');
        if (!hasSuggestion) return false;
      } else if (selectedFilter === 'Treinamentos') {
        return false;
      } else {
        if (p.category !== selectedFilter) return false;
      }
    }

    return true;
  });

  const getPestColor = (pest?: string) => {
    if (!pest) return 'bg-gray-400';
    const v = pest.toLowerCase();
    if (v.includes('barata')) return 'bg-amber-500';
    if (v.includes('rato') || v.includes('roedor')) return 'bg-slate-600';
    if (v.includes('cupim')) return 'bg-orange-500';
    if (v.includes('formiga')) return 'bg-rose-500';
    if (v.includes('escorp')) return 'bg-purple-600';
    return 'bg-emerald-500';
  };

  const startTrainingPlayer = (course: TrainingCourse) => {
    setActiveTraining(course);
    setCourseMode('slides');
    setCurrentSlideIndex(0);
    setCurrentQuizIndex(0);
    setSelectedOptionIndex(null);
    setIsAnswerSubmitted(false);
    setQuizScore(0);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 text-left" id="pestflow_pops_panel_root">
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-5" id="pops-header-row">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-50 text-[#1B3A2D] rounded-xl self-center shrink-0">
              <BookOpen className="size-6" />
            </span>
            POPs e Procedimentos
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Central de conhecimento, padronização técnica sanitária e capacitação da PestFlow.
          </p>
        </div>

        {/* ACTIONS BAR (SHEET TRIGGERS + PRIMARY ACTION DIALOGS) */}
        <div className="flex flex-wrap items-center gap-2" id="headers-action-buttons">
          {/* SHEET TRIGGER: CATEGORIES TREE */}
          <button
            id="btn-trigger-categories-sheet"
            onClick={() => setIsCategoriesSheetOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all shadow-2xs"
          >
            <FolderTree className="size-3.5 text-emerald-600" />
            <span>Pastas & Categorias</span>
          </button>

          {/* SHEET TRIGGER: AI COPILOT */}
          <button
            id="btn-trigger-ai-copilot-sheet"
            onClick={() => setIsAiSheetOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-200 text-[#1B3A2D] text-xs font-bold rounded-lg transition-all shadow-2xs"
          >
            <Sparkles className="size-3.5 text-emerald-600" />
            <span>Copiloto IA</span>
          </button>

          {/* SHEET TRIGGER: COLLABORATOR SUGGESTIONS (MODEL B) */}
          <button
            id="btn-trigger-suggestions-sheet"
            onClick={() => setIsSuggestionsSheetOpen(true)}
            className="relative flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all shadow-2xs"
          >
            <UserCheck className="size-3.5 text-amber-600" />
            <span>Revisões</span>
            {pendingReviewCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.5 bg-amber-500 text-white text-[10px] font-extrabold rounded-full leading-none">
                {pendingReviewCount}
              </span>
            )}
          </button>

          {/* DIALOG TRIGGER: UPLOAD DOCUMENT */}
          <button
            id="btn-trigger-upload-doc"
            onClick={triggerUploadModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all shadow-2xs"
          >
            <Upload className="size-3.5 text-slate-500" />
            <span>Upload Documento</span>
          </button>

          {/* DIALOG TRIGGER: CREATE NEW POP */}
          <button
            id="btn-trigger-new-pop"
            onClick={triggerCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1B3A2D] text-white text-xs font-bold rounded-lg hover:bg-[#2D6A4F] transition-all shadow-sm"
          >
            <Plus className="size-3.5" />
            <span>Novo POP</span>
          </button>

          {/* ADD NEW CATEGORY PROMPT */}
          <button
            id="btn-new-category"
            onClick={() => {
              const catName = prompt('Digite o nome da nova categoria operacional/administrativa:');
              if (catName && catName.trim()) {
                toast.success(`Categoria "${catName}" pré-agendada para homologação do TI.`);
              }
            }}
            className="p-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-800 rounded-lg transition-all shadow-2xs"
            title="Adicionar Categoria"
          >
            <PlusCircle className="size-4" />
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC COMPACT COUNTERS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6" id="upper-metric-indicators">
        <div className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-2xs flex flex-col justify-between" id="metric-total">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total de POPs</span>
          <span className="text-xl font-black text-slate-800 mt-1">{totalCount}</span>
          <span className="text-[10px] text-emerald-600 mt-0.5 flex items-center gap-1 font-semibold">
            <Check className="size-3" /> Base em Dia
          </span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-2xs flex flex-col justify-between" id="metric-oper">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Operacionais</span>
          <span className="text-xl font-black text-slate-800 mt-1">{operationalCount}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 font-medium">Bicos & Dosagens</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-2xs flex flex-col justify-between" id="metric-admin">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Administrativos</span>
          <span className="text-xl font-black text-slate-800 mt-1">{adminCount}</span>
          <span className="text-[10px] text-slate-500 mt-0.5 font-medium">Fluxos Internos</span>
        </div>
        <div className="bg-white p-3.5 rounded-xl border border-slate-150 shadow-2xs flex flex-col justify-between" id="metric-trainings">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Treinamentos</span>
          <span className="text-xl font-black text-slate-800 mt-1">{trainingsCount}</span>
          <span className="text-[10px] text-emerald-700 mt-0.5 flex items-center gap-1 font-bold">
            <Zap className="size-3 text-emerald-600" /> Habilitadores
          </span>
        </div>
        <div
          onClick={() => setIsSuggestionsSheetOpen(true)}
          className={`p-3.5 rounded-xl border shadow-2xs flex flex-col justify-between transition-colors cursor-pointer ${
            pendingReviewCount > 0 ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-100/50' : 'bg-white border-slate-150 hover:bg-slate-50'
          }`}
          id="metric-pendings"
        >
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pendentes de Revisão</span>
          <span className={`text-xl font-black mt-1 ${pendingReviewCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>
            {pendingReviewCount}
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5 font-medium flex items-center gap-1">
            {pendingReviewCount > 0 ? '⚠️ Ver revisões' : '✓ Tudo revisado'}
          </span>
        </div>
      </div>

      {/* 3. CORE SEARCH AREA (CENTRAL PROMINENT SEARCH) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl mb-6 relative overflow-hidden" id="prominent-search-billboard">
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center z-10 relative">
          <div className="inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-350 mb-3">
            <Sparkles className="size-3 text-emerald-400" /> Busca Semântica & Manual Oficial
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-sans text-white mb-2">Central Única de Busca de Conhecimento</h2>
          <p className="text-xs text-slate-300 mb-5">
            Localize dosagens químicas de pragas, diretrizes comerciais ou manuais ANVISA em segundos.
          </p>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              id="main-large-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar POPs, documentos, treinamentos ou palavras-chave..."
              className="w-full h-12 pl-11 pr-10 rounded-xl bg-white text-slate-900 border-none text-xs sm:text-sm font-medium focus:ring-4 focus:ring-emerald-500/30 transition-all placeholder:text-slate-400 shadow-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. HORIZONTAL QUICK CATEGORY FILTERS & ACTIVE CHIPS */}
      <div className="flex flex-col gap-2.5 mb-6" id="horizontal-filters-wrapper">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" id="horizontal-filters-tabs">
            {['Todos', 'Operacional', 'Administrativo', 'Financeiro', 'Comercial', 'Sistemas', 'Treinamentos', 'Pendentes Revisão'].map((filterName) => {
              const isActive = selectedFilter === filterName;
              return (
                <button
                  key={filterName}
                  id={`filter-tab-${filterName.toLowerCase().replace(' ', '-')}`}
                  onClick={() => {
                    setSelectedFilter(filterName);
                    setActiveCategory(null);
                    setActiveSubcategory(null);
                    if (filterName === 'Treinamentos') {
                      setActiveCategory('Treinamentos');
                    }
                  }}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs font-bold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {filterName}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setIsCategoriesSheetOpen(true)}
            className="shrink-0 hidden sm:flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 transition"
          >
            <Filter className="size-3.5" /> Explorar Pastas
          </button>
        </div>

        {/* ACTIVE CATEGORY OR SUBCATEGORY CHIP */}
        {(activeCategory || activeSubcategory) && (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-emerald-50/70 border border-emerald-150 px-3 py-1.5 rounded-lg w-fit">
            <span>
              Filtrado por pasta: <strong className="text-[#1B3A2D]">{activeCategory}</strong>
              {activeSubcategory && ` > ${activeSubcategory}`}
            </span>
            <button
              onClick={() => {
                setActiveCategory(null);
                setActiveSubcategory(null);
                setSelectedFilter('Todos');
              }}
              className="p-0.5 hover:bg-emerald-200/60 rounded text-emerald-800"
              title="Limpar filtro de pasta"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* 5. PRIMARY CONTENT: FULL-WIDTH GRID OF POPS OR TRAININGS */}
      <div id="primary-content-area" className="mb-10">
        {selectedFilter === 'Treinamentos' ? (
          /* TRAINING CARDS GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5" id="training-courses-grid">
            {SEEDED_TRAININGS.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                      <Zap className="size-3 text-emerald-600" /> Capacitação Técnica
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">{course.duration}</span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base leading-snug">{course.title}</h3>
                    <p className="text-xs text-slate-500 mt-2 leading-relaxed font-medium">{course.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-150">
                    <div>{course.slides.length} Módulos Teóricos</div>
                    <div>{course.quiz.length} Questões Avaliativas</div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <button
                    onClick={() => startTrainingPlayer(course)}
                    className="w-full py-2.5 bg-[#1B3A2D] hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
                  >
                    Iniciar Treinamento <ArrowRight className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* POP PROCEDURES GRID */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" id="pop-procedures-list-grid">
            {filteredProcedures.map((pop) => {
              const isPendingReview = suggestedEdits.some((s) => s.popId === pop.id && s.status === 'pendente');
              const matchingAgenda = (agenda || []).filter(
                (e) =>
                  e.title?.toLowerCase().includes((pop.pestType || '').toLowerCase()) ||
                  e.title?.toLowerCase().includes((pop.category || '').toLowerCase())
              );
              const activeProducts = (inventory?.products || []).filter((p: any) =>
                pop.requiredProducts?.some((req: any) => {
                  const name = typeof req === 'string' ? req : req?.productName || '';
                  return name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(name.toLowerCase());
                })
              );

              return (
                <div
                  key={pop.id}
                  id={`pop-card-${pop.id}`}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className={`h-1.5 ${getPestColor(pop.pestType)}`} />

                    <div className="p-5 space-y-3 text-left">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-widest text-[#1B3A2D] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                          {pop.category} {pop.subcategory ? `· ${pop.subcategory}` : ''}
                        </span>
                        {isPendingReview && (
                          <span className="text-[9px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 flex items-center gap-1">
                            <AlertCircle className="size-2.5" /> Em Sugestão
                          </span>
                        )}
                      </div>

                      <h3 className="font-extrabold text-slate-800 text-sm leading-snug tracking-tight line-clamp-2">
                        {pop.name}
                      </h3>

                      <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                        {pop.instructions
                          ? pop.instructions.replace(/[#*`_-]/g, '').substring(0, 130) + '...'
                          : 'Ficha de diretriz instrucional corporativa geral.'}
                      </p>

                      {/* INTEGRATED COLLABORATIVE DATA */}
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 text-[10px]">
                        <div className="flex items-center justify-between text-slate-600 font-bold">
                          <span className="flex items-center gap-1">
                            <Activity className="size-3 text-slate-400" /> Serviços Agendados:
                          </span>
                          <span className="text-[#1B3A2D] font-black">{matchingAgenda.length} OS vinculadas</span>
                        </div>
                        <div className="flex items-start justify-between text-slate-650 font-bold">
                          <span className="flex items-center gap-1 mt-0.5">
                            <Package className="size-3 text-slate-400" /> Insumos Associados:
                          </span>
                          <span className="text-[#1B3A2D] font-black text-right truncate max-w-[130px]">
                            {activeProducts.map((p: any) => p.name).join(', ') || pop.requiredProducts?.join(', ') || 'Nenhum insumo'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-sans border-t border-slate-100 pt-2.5">
                        <div className="flex items-center gap-1.5 truncate">
                          <Clock className="size-3 text-slate-400" /> {pop.estimatedTimeHoursPer100m2}h / 100m²
                        </div>
                        <div className="flex items-center gap-1.5 truncate">
                          <Calendar className="size-3 text-slate-400" /> Rev: {pop.lastRevision}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 pt-0 border-t border-slate-50 mt-1 flex items-center gap-2">
                    <button
                      id={`btn-read-pop-${pop.id}`}
                      onClick={() => {
                        setReadingPop(pop);
                        setIsCompareMode(false);
                      }}
                      className="flex-1 text-center py-2.5 bg-slate-900 border border-slate-950 hover:bg-slate-800 rounded-lg text-xs font-black uppercase text-white transition-all cursor-pointer shadow-2xs leading-none"
                    >
                      Abrir POP
                    </button>
                    <button
                      id={`btn-edit-pop-trigger-${pop.id}`}
                      onClick={() => triggerEditModal(pop)}
                      className="px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs text-slate-650 hover:text-emerald-700 transition-all cursor-pointer"
                      title="Editar Regulamento"
                    >
                      Editar
                    </button>
                    {pop.fileUrl ? (
                      <a
                        id={`btn-download-file-pop-${pop.id}`}
                        href={pop.fileUrl}
                        download={pop.fileName || 'diretriz_pop.pdf'}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 hover:text-blue-600 transition"
                        title="Fazer Download do Anexo"
                      >
                        <Download className="size-3.5" />
                      </a>
                    ) : (
                      <button
                        id={`btn-simulated-download-${pop.id}`}
                        onClick={() => toast.success('Conteúdo impresso/exportado como documento corporativo oficial.')}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 transition cursor-pointer"
                        title="Imprimir Diretriz"
                      >
                        <Download className="size-3.5" />
                      </button>
                    )}
                    <button
                      id={`btn-delete-pop-${pop.id}`}
                      onClick={() => handleDeletePOP(pop.id, pop.name)}
                      className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition cursor-pointer"
                      title="Apagar permanentemente"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredProcedures.length === 0 && (
              <div
                className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-white p-6"
                id="empty-state-card"
              >
                <div className="p-3 bg-slate-50 text-slate-400 rounded-full mb-3">
                  <BookOpen className="size-8 text-[#1B3A2D]" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest">Nenhum POP cadastrado</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1 font-medium leading-relaxed">
                  Sua empresa ainda não possui procedimentos operacionais cadastrados para esta filtragem. Crie uma diretriz personalizada ou importe nossos modelos padrão.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2.5 mt-4">
                  <button
                    id="empty-state-create-btn"
                    onClick={triggerCreateModal}
                    className="px-4 py-2 bg-[#1B3A2D] hover:bg-[#2D6A4F] text-white text-xs font-bold rounded-lg transition shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="size-3.5" /> Criar Primeiro POP
                  </button>
                  <button
                    id="empty-state-import-templates-btn"
                    onClick={handleImportStandardTemplates}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition border border-slate-200 flex items-center gap-1.5"
                  >
                    <Sparkles className="size-3.5 text-emerald-600" /> Importar Modelos Padrão
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. COLLAPSIBLE SECTION: SANITARY COMPLIANCE & ANVISA NORMS */}
      <div className="mb-6" id="compliance-collapsible-wrapper">
        <CollapsibleSection
          title="Diretrizes Regulamentares de Vigilância Sanitária & ANVISA (RDC 52/2009)"
          icon={ShieldCheck}
          defaultOpen={false}
          className="bg-white rounded-xl border border-slate-200 shadow-2xs"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-650 leading-relaxed font-sans pt-2">
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-150 space-y-1.5">
              <strong className="text-slate-800 block font-bold">1. Responsabilidade Técnica:</strong>
              <p>
                Todo POP operacional deve ser homologado pelo Responsável Técnico habilitado perante o conselho de classe (CRQ/CRBio/CREA/CRMV).
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-150 space-y-1.5">
              <strong className="text-slate-800 block font-bold">2. Tríplice Lavagem & EPIs:</strong>
              <p>
                A obrigatoriedade de EPIs (NR-31 e RDC 52) e destinação das embalagens vazias aos postos de recebimento credenciados são requisitos legais inegociáveis.
              </p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-150 space-y-1.5">
              <strong className="text-slate-800 block font-bold">3. Rastreabilidade & Revisão Anual:</strong>
              <p>
                Os procedimentos devem ser revisados anualmente ou sempre que houver alteração de formulação química, registrando o histórico de versões.
              </p>
            </div>
          </div>
        </CollapsibleSection>
      </div>

      {/* ========================================================= */}
      {/* 7. SHEETS & DIALOGS (REPLACED MANUAL OVERLAYS WITH RADIX) */}
      {/* ========================================================= */}

      {/* SHEET 1: CATEGORIES & DIRECTORY TREE */}
      <POPsCategoriesSheet
        isOpen={isCategoriesSheetOpen}
        onOpenChange={setIsCategoriesSheetOpen}
        activeCategory={activeCategory}
        activeSubcategory={activeSubcategory}
        onSelectCategory={setActiveCategory}
        onSelectSubcategory={setActiveSubcategory}
        onSelectFilter={setSelectedFilter}
        procedures={procedures}
      />

      {/* SHEET 2: AI COPILOT CONSULTATION CHAT */}
      <POPsAIChatSheet
        isOpen={isAiSheetOpen}
        onOpenChange={setIsAiSheetOpen}
        aiChatQuery={aiChatQuery}
        setAiChatQuery={setAiChatQuery}
        aiChatLog={aiChatLog}
        isAiLoading={isAiLoading}
        onSubmitAiQuestion={submitAiQuestion}
      />

      {/* SHEET 3: COLLABORATOR SUGGESTIONS & REVIEWS (MODEL B) */}
      <POPsSuggestionsSheet
        isOpen={isSuggestionsSheetOpen}
        onOpenChange={setIsSuggestionsSheetOpen}
        suggestedEdits={suggestedEdits}
        onApproveSuggestion={approveSuggestion}
        onRejectSuggestion={rejectSuggestion}
      />

      {/* DIALOG 1: READING ROOM */}
      <POPsReadingDialog
        readingPop={readingPop}
        onClose={() => setReadingPop(null)}
        isCompareMode={isCompareMode}
        setIsCompareMode={setIsCompareMode}
        selectedDiffVersion={selectedDiffVersion}
        setSelectedDiffVersion={setSelectedDiffVersion}
        isSuggestOpen={isSuggestOpen}
        setIsSuggestOpen={setIsSuggestOpen}
        suggestionProposal={suggestionProposal}
        setSuggestionProposal={setSuggestionProposal}
        onSuggestAlteration={suggestAlteration}
        agenda={agenda || []}
        inventory={inventory}
        onNavigate={navigate}
      />

      {/* DIALOG 2: CREATE POP */}
      <POPsCreateDialog
        isOpen={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        formName={formName}
        setFormName={setFormName}
        formPest={formPest}
        setFormPest={setFormPest}
        formCategory={formCategory}
        setFormCategory={setFormCategory}
        formTime={formTime}
        setFormTime={setFormTime}
        formSubcategory={formSubcategory}
        setFormSubcategory={setFormSubcategory}
        formInstructions={formInstructions}
        setFormInstructions={setFormInstructions}
        formRequiredProducts={formRequiredProducts}
        inventoryProducts={inventoryProducts}
        addChemicalLine={addChemicalLine}
        removeChemicalLine={removeChemicalLine}
        updateChemicalField={updateChemicalField}
        isDragging={isDragging}
        uploadedFileName={uploadedFileName}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleUploadedFiles={handleUploadedFiles}
        onClearUploadedFile={() => {
          setUploadedFileName(undefined);
          setUploadedBase64(undefined);
        }}
        setIsDragging={setIsDragging}
        isGeneratingAI={isGeneratingAI}
        handleGenerateProcedureWithAI={handleGenerateProcedureWithAI}
        onSubmit={handleCreatePOP}
      />

      {/* DIALOG 3: EDIT POP */}
      <POPsEditDialog
        isOpen={isEditOpen}
        onOpenChange={setIsEditOpen}
        editingPop={editingPop}
        formName={formName}
        setFormName={setFormName}
        formPest={formPest}
        setFormPest={setFormPest}
        formServiceType={formServiceType}
        setFormServiceType={setFormServiceType}
        formTime={formTime}
        setFormTime={setFormTime}
        formSubcategory={formSubcategory}
        setFormSubcategory={setFormSubcategory}
        formInstructions={formInstructions}
        setFormInstructions={setFormInstructions}
        formRequiredProducts={formRequiredProducts}
        inventoryProducts={inventoryProducts}
        addChemicalLine={addChemicalLine}
        removeChemicalLine={removeChemicalLine}
        updateChemicalField={updateChemicalField}
        onSubmit={handleEditPOP}
        onCancel={() => {
          setIsEditOpen(false);
          setEditingPop(null);
        }}
      />

      {/* DIALOG 4: UPLOAD POP */}
      <POPsUploadDialog
        isOpen={isUploadOpen}
        onOpenChange={setIsUploadOpen}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        uploadedFileName={uploadedFileName}
        onClearUploadedFile={() => {
          setUploadedFileName(undefined);
          setUploadedBase64(undefined);
        }}
        handleDragOver={handleDragOver}
        handleDrop={handleDrop}
        handleUploadedFiles={handleUploadedFiles}
        onProceedToCreate={() => {
          setIsUploadOpen(false);
          setIsCreateOpen(true);
        }}
      />

      {/* DIALOG 5: TRAINING COURSE PLAYER */}
      <POPsTrainingDialog
        course={activeTraining}
        onClose={() => setActiveTraining(null)}
        courseMode={courseMode}
        currentSlideIndex={currentSlideIndex}
        setCurrentSlideIndex={setCurrentSlideIndex}
        setCourseMode={setCourseMode}
        currentQuizIndex={currentQuizIndex}
        setCurrentQuizIndex={setCurrentQuizIndex}
        selectedOptionIndex={selectedOptionIndex}
        setSelectedOptionIndex={setSelectedOptionIndex}
        isAnswerSubmitted={isAnswerSubmitted}
        setIsAnswerSubmitted={setIsAnswerSubmitted}
        quizScore={quizScore}
        setQuizScore={setQuizScore}
      />
    </div>
  );
}
