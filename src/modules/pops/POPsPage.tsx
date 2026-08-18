import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSystemStore } from '@/store';
import { auth } from '@/firebase/config';
import { tenantStorage } from '@/utils/storage';
import { 
  Activity,
  Package,
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
  Check,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Award,
  BookOpen,
  ArrowRight,
  History,
  Info,
  Calendar,
  ThumbsUp,
  MessageSquare,
  FileSpreadsheet,
  Download,
  AlertCircle,
  HelpCircle,
  BookOpenCheck,
  Zap,
  RefreshCw,
  PlusCircle,
  UserCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';

// Static Categories and Subcategories Mapping
const CATEGORIES_TREE = [
  {
    name: 'Operacional',
    icon: 'wrench',
    subs: ['Controle de Baratas', 'Controle de Formigas', 'Controle de Cupins', 'Controle de Roedores', 'Controle de Escorpiões']
  },
  { name: 'Administrativo', icon: 'folder', subs: [] },
  { name: 'Financeiro', icon: 'dollar-sign', subs: [] },
  { name: 'Comercial', icon: 'trending-up', subs: [] },
  { name: 'Sistemas', icon: 'cpu', subs: [] },
  { name: 'Treinamentos', icon: 'graduation-cap', subs: [] }
];

// Seeded local procedures for rich default information
interface ExtendedPOP {
  id: string;
  name: string;
  pestType: string;
  serviceType: string;
  requiredProducts: any[];
  estimatedTimeHoursPer100m2: number;
  fileUrl?: string;
  fileName?: string;
  instructions: string;
  createdAt: string;
  // Extended fields
  category: string;
  subcategory?: string;
  author: string;
  version: string;
  status: 'Ativo' | 'Em revisão' | 'Obsoleto';
  lastRevision: string;
  versions?: { version: string; date: string; change: string; textUrl?: string }[];
}

const DEFAULT_SEEDED_POPS: ExtendedPOP[] = [
  {
    id: 'pop-baratas-res',
    name: 'POP Controle de Baratas Residencial',
    pestType: 'baratas',
    serviceType: 'dedetizacao',
    category: 'Operacional',
    subcategory: 'Controle de Baratas',
    estimatedTimeHoursPer100m2: 1.5,
    author: 'Responsável Técnico',
    version: '2.0',
    status: 'Ativo',
    lastRevision: '15/03/2026',
    createdAt: '2025-01-01',
    requiredProducts: [
      { productId: 'prod-03', productName: 'Gel Baraticida', quantityPer100m2: 2, unit: 'unidade' },
      { productId: 'prod-01', productName: 'Inseticida Piretroide', quantityPer100m2: 50, unit: 'ml' }
    ],
    instructions: `# POP REGULADO - CONTROLE DE BARATAS EM ÁREAS RESIDENCIAIS\n\nEste procedimento padroniza as ações de inspeção e controle de Blattella germanica e Periplaneta americana.\n\n## 1. EQUIPAMENTOS DE SEGURANÇA (EPIs)\n* Luvas químicas de nitrila de cano longo.\n* Máscara semifacial com cartucho para vapores orgânicos/névoas.\n* Óculos panorâmicos de proteção.\n\n## 2. PROCEDIMENTO OPERACIONAL PASSO A PASSO\n1. **Inspeção de Foco**: Iniciar vistoria com lanterna em motores de geladeira, frestas de balcão e caixas de gordura.\n2. **Aspiração Mecânica**: Opcional, para remoção inicial de massas críticas.\n3. **Isquicidade Perimetral**: Aplicar pequenas gotas de gel nos gonzos de armários e gaveteiros operacionais.\n4. **Pulverização Residual**: Tratar rodapés, ralos abertos e tubulações periféricas no perímetro úmido externo para formação de barreira residual durável. Evitar contato com alimentos ou louças domésticas.`,
    versions: [
      { version: '1.0', date: '01/01/2025', change: 'Primeira versão de controle básico aprovada.' },
      { version: '2.0', date: '01/01/2026', change: 'Atualização geral de ingredientes e dosagens por m².' }
    ]
  },
  {
    id: 'pop-formigas',
    name: 'POP Controle Avançado de Formigas Urbanas',
    pestType: 'formigas',
    serviceType: 'dedetizacao',
    category: 'Operacional',
    subcategory: 'Controle de Formigas',
    estimatedTimeHoursPer100m2: 1.2,
    author: 'Responsável Técnico',
    version: '1.2',
    status: 'Ativo',
    lastRevision: '10/01/2026',
    createdAt: '2025-03-10',
    requiredProducts: [
      { productId: 'prod-03', productName: 'Gel Formicida', quantityPer100m2: 1, unit: 'unidade' }
    ],
    instructions: `# CONTROLE INTEGRADO DE FORMIGAS URBANAS (Monomorium pharaonis)\n\n## 1. PREMISSAS IMPORTANTES\nFormigas doceiras são desalojadas e dispersadas agressivamente caso pulverizações químicas irritantes sejam executadas nas proximidades das colônias.\n\n## 2. PROCEDIMENTO EXCLUSIVO DE ISCAGEM\n1. Mapear as trilhas ativas sem espantar as colônias.\n2. Injetar filetes finos de gel paralelo às rotas de passagem secundárias.\n3. Bloquear o acesso de umidade na área imediata para potencializar a atração do gel atrativo.`,
    versions: [
      { version: '1.0', date: '10/03/2025', change: 'Esboço primordial do POP.' },
      { version: '1.2', date: '10/01/2026', change: 'Remoção de indicação de calda líquida nas pias de sanitários.' }
    ]
  },
  {
    id: 'pop-admin-onboarding',
    name: 'POP Integração de Novos Colaboradores Administrativos',
    pestType: 'outro',
    serviceType: 'administrativo',
    category: 'Administrativo',
    estimatedTimeHoursPer100m2: 4,
    author: 'Recursos Humanos',
    version: '1.0',
    status: 'Ativo',
    lastRevision: '12/02/2026',
    createdAt: '2026-02-12',
    requiredProducts: [],
    instructions: `# PROCESSO ADMINISTRATIVO: ONBOARDING INTEGRAL\n\nEste manual guia o fluxo de recepção de recepcionistas e auxiliares de escritório.\n\n## Diretrizes de Entrada:\n1. Coleta de documentação pessoal, carteira técnica e assinatura de contratos.\n2. Concessão de credenciais internas no sistema.\n3. Fornecimento das apostilas operacionais de controle integrado.\n4. Agendamento do Treinamento Inicial Técnico Básico.`,
    versions: [{ version: '1.0', date: '12/02/2026', change: 'Primeiro lançamento oficial após revisão de conformidade.' }]
  },
  {
    id: 'pop-fin-fechamento',
    name: 'POP Processamento de Conciliação e Fechamento Diário de Caixa',
    pestType: 'outro',
    serviceType: 'financeiro',
    category: 'Financeiro',
    estimatedTimeHoursPer100m2: 1,
    author: 'Departamento Financeiro',
    version: '1.1',
    status: 'Ativo',
    lastRevision: '05/04/2026',
    createdAt: '2025-10-15',
    requiredProducts: [],
    instructions: `# GESTÃO FINANCEIRA: FECHAMENTO DE CAIXA\n\nPadronização da conferência orçamentária de serviços finalizados.\n\n## Passos Mandatórios:\n1. No painel operacional, filtrar Ordens de Serviço dadas como 'Executadas' ou 'Concluídas'.\n2. Cruzar com comprovantes de PIX, boletos de depósitos compensados e liquidações de cartões de débito/crédito.\n3. Sinalizar divergências e lançar taxas corporativas na aba correspondente.\n4. Fechar sumário diário e emitir relatório de fechamento gerencial.`,
    versions: [
      { version: '1.0', date: '15/10/2025', change: 'Procedimento inicial.' },
      { version: '1.1', date: '05/04/2026', change: 'Conversão para conciliação bancária estruturada pelo painel.' }
    ]
  },
  {
    id: 'pop-com-pipeline',
    name: 'POP Qualificação de Leads B2B e Cadastro Comercial',
    pestType: 'outro',
    serviceType: 'comercial',
    category: 'Comercial',
    estimatedTimeHoursPer100m2: 2,
    author: 'Equipe Comercial',
    version: '1.0',
    status: 'Ativo',
    lastRevision: '20/05/2026',
    createdAt: '2026-05-20',
    requiredProducts: [],
    instructions: `# FUNIL COMERCIAL: DIRETRIZ DE ATENDIMENTO\n\nEste procedimento define como converter contatos receptivos em propostas estruturadas no sistema.\n\n## Regras Chave:\n1. Investigar metragem total (m²) do imóvel do cliente.\n2. Perguntar praga predominante e se já houveram tratamentos anteriores.\n3. Alimentar a Calculadora Operacional para obter parâmetros de custo e margem mínima.\n4. Enviar proposta comercial detalhada com agilidade.`,
    versions: [{ version: '1.0', date: '20/05/2026', change: 'Lançamento inicial.' }]
  },
  {
    id: 'pop-sys-erp',
    name: 'POP Práticas de Segurança e Acessos ao Sistema',
    pestType: 'outro',
    serviceType: 'sistemas',
    category: 'Sistemas',
    estimatedTimeHoursPer100m2: 0.5,
    author: 'Segurança da Informação',
    version: '1.3',
    status: 'Ativo',
    lastRevision: '22/04/2026',
    createdAt: '2025-05-01',
    requiredProducts: [],
    instructions: `# SEGURANÇA E ACESSO A DADOS\n\nRegras de acesso e manutenção de dados sensíveis de carteira de clientes e operações.\n\n## Diretrizes Fundamentais:\n1. Proibido compartilhar credenciais de acesso individuais com terceiros.\n2. Manter autenticação segura ao acessar em novas redes externas.\n3. Bloqueio automático da sessão após inatividade prolongada.\n4. Registro de logs de atividades e modificações auditáveis de ponta a ponta.`,
    versions: [
      { version: '1.0', date: '01/05/2025', change: 'Abertura padrão.' },
      { version: '1.3', date: '22/04/2026', change: 'Revisão de práticas de segurança da informação.' }
    ]
  }
];

// Interactive Training Seeded Data
interface TrainingCourse {
  id: string;
  title: string;
  description: string;
  duration: string;
  slides: string[];
  quiz: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
}

const SEEDED_TRAININGS: TrainingCourse[] = [
  {
    id: 'train-01',
    title: 'Integração e Código Técnico de Vetores e Pragas',
    description: 'Capacitação inicial para técnicos aplicadores de campo. Conceitos de biossegurança de campo, diluição de caldas químicas e manuseio seguro de defensivos sob regulamentação sanitária.',
    duration: '8 horas',
    slides: [
      'Bem-vindo à Academia de Capacitação PestFlow! Como técnico profissional, sua missão é entregar resultados de controle sanitário preservando a saúde e segurança do cliente e colaboradores.',
      'Aula 1: Biologia de Pragas Urbanas. Entender os hábitos e comportamentos de baratas, roedores e cupins é fundamental para aplicar a dosagem correta nos pontos estratégicos.',
      'Aula 2: Preparo Químico. Sempre vista os EPIs de nitrila e óculos antes de manusear concentrados. Realize tríplice lavagem e meça as frações indicadas com provetas precisas.',
      'Aula 3: Descarte Ecológico. Embalagens vazias devem ser furadas para inutilização, armazenadas adequadamente e destinadas à logística reversa regulamentada.'
    ],
    quiz: [
      {
        question: 'Qual o principal EPI indicado para o manuseio direto de diluição de concentrados químicos?',
        options: ['Luvas de algodão simples', 'Luvas de nitrila de cano longo e respirador químico', 'Apenas óculos comuns', 'Capacete e botas simples'],
        correctIndex: 1,
        explanation: 'Luvas de nitrila resistentes e respirador com filtro protegem contra absorção cutânea e inalação de vapores.'
      },
      {
        question: 'O que deve ser realizado imediatamente após esvaziar totalmente a embalagem de um defensivo concentrado?',
        options: ['Reutilizar a embalagem para água no veículo', 'Tríplice lavagem e inutilização física (furação) do vasilhame', 'Descarte no lixo comum', 'Queimar a embalagem na área externa'],
        correctIndex: 1,
        explanation: 'A tríplice lavagem remove resíduos críticos antes de destinar a embalagem para logística reversa obrigatória.'
      },
      {
        question: 'Por que o uso de inseticidas altamente irritantes em ninhos de formigas doceiras pode ser prejudicial?',
        options: ['Formigas não reagem a defensivos', 'As formigas morrem instantaneamente sem relatar nada', 'Eles fragmentam a colônia e abrem novos ninhos satélites', 'Aumentam o açúcar da cozinha'],
        correctIndex: 2,
        explanation: 'Inseticidas de contato irritantes podem assustar a colônia, induzindo a fragmentação da colônia em novos ninhos.'
      }
    ]
  },
  {
    id: 'train-02',
    title: 'Procedimentos de Diluição Química Segura e Dosagem Prática',
    description: 'Curso focado em cálculos químicos, dosagens por m² e regulagem dos bicos de pulverizadores costais de pressão.',
    duration: '4 horas',
    slides: [
      'Compreensão do fator de calda ativa: uma aplicação correta reduz retornos de garantia e evita desperdício de insumos no estoque da empresa.',
      'Cálculo Prático: Se o POP estipula 50ml de calda por 100m² e o imóvel possui 200m² de área tratada, o operador aplicará no total 100ml de calda concentrada diluída.',
      'Regulagem do Equipamento: Mantenha a pressão constante nos pulverizadores manuais para evitar gotas excessivamente grandes ou deriva por névoa fina.'
    ],
    quiz: [
      {
        question: 'Se um POP indica 50ml de calda para cada 100m², quantos ml serão necessários para um galpão de 400m²?',
        options: ['100ml', '200ml', '150ml', '50ml'],
        correctIndex: 1,
        explanation: 'Multiplicamos a dose unitária pela proporção da área: 50ml x 4 = 200ml.'
      },
      {
        question: 'Qual o tipo de bico de pulverização mais indicado para cobertura residual homogênea sobre rodapés e superfícies?',
        options: ['Bico tipo Leque plano regulado', 'Bico tipo Cone cheio', 'Bico de fluxo livre sem ponteira', 'Mangueira direta'],
        correctIndex: 0,
        explanation: 'Os bicos tipo leque plano distribuem uma faixa uniforme de gotas médias ideal para barreiras residuais.'
      }
    ]
  }
];

export function POPsPage() {
  const { pops, inventory, agenda, clients, addPOP, updatePOP, removePOP } = useSystemStore();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dbProcedures = pops?.procedures || [];
  const inventoryProducts = inventory?.products || [];

  // Combine database procedures and static pre-seeded ones
  const [procedures, setProcedures] = useState<ExtendedPOP[]>([]);

  // Local storage lists for suggested alterations (Model B simulation)
  const [suggestedEdits, setSuggestedEdits] = useState<any[]>([]);

  // Navigation states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos'); // Horizontal Filters
  const [activeCategory, setActiveCategory] = useState<string | null>(null); // Left Menu Category Folder
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null); // Left Menu child nodes

  // Detailed Modal Viewing states
  const [readingPop, setReadingPop] = useState<ExtendedPOP | null>(null);
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedDiffVersion, setSelectedDiffVersion] = useState<string>('1.0');

  // Modals for CRUD operations
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingPop, setEditingPop] = useState<ExtendedPOP | null>(null);

  // Suggested Edit Modal (Collaborator Proposal)
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [suggestionProposal, setSuggestionProposal] = useState('');

  // Course Player states
  const [activeTraining, setActiveTraining] = useState<TrainingCourse | null>(null);
  const [courseSlideIdx, setCourseSlideIdx] = useState(0);
  const [isQuizMode, setIsQuizMode] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResult, setShowQuizResult] = useState(false);
  const [certifiedName, setCertifiedName] = useState('');

  // AI Chat states (Real Gemini POP Assistant)
  const [aiChatQuery, setAiChatQuery] = useState('');
  const [aiChatLog, setAiChatLog] = useState<Array<{ sender: 'user' | 'ia'; text: string }>>([
    { sender: 'ia', text: 'Olá! Sou o Assistente de Inteligência de POPs da PestFlow. Digite uma praga ou procedimento técnico e eu consultarei a base de conhecimentos em tempo real!' }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

  // Form Field states for CRUD
  const [formName, setFormName] = useState('');
  const [formPest, setFormPest] = useState('baratas');
  const [formServiceType, setFormServiceType] = useState('dedetizacao');
  const [formCategory, setFormCategory] = useState('Operacional');
  const [formSubcategory, setFormSubcategory] = useState('');
  const [formTime, setFormTime] = useState(1);
  const [formInstructions, setFormInstructions] = useState('');
  const [formRequiredProducts, setFormRequiredProducts] = useState<any[]>([]);

  // Drag and Drop Attachment files
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | undefined>(undefined);
  const [uploadedBase64, setUploadedBase64] = useState<string | undefined>(undefined);

  // Initial Sync from useSystemStore database
  useEffect(() => {
    // Merge DB changes to our state and synchronize
    const formattedDb = dbProcedures.map((item: any) => {
      // Determine virtual categories based on its type
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
        status: 'Ativo' as const,
        lastRevision: item.createdAt || '01/06/2026',
        versions: [{ version: '1.0', date: item.createdAt || '01/06/2026', change: 'Primeiro upload da diretriz operacional.' }]
      };
    });

    setProcedures(formattedDb);
  }, [dbProcedures]);

  const handleImportStandardTemplates = () => {
    DEFAULT_SEEDED_POPS.forEach(pop => {
      addPOP({
        id: `pop-${Math.random().toString(36).substr(2, 9)}`,
        name: pop.name,
        pestType: pop.pestType,
        serviceType: pop.serviceType,
        requiredProducts: pop.requiredProducts,
        estimatedTimeHoursPer100m2: pop.estimatedTimeHoursPer100m2,
        instructions: pop.instructions,
        createdAt: new Date().toLocaleDateString('pt-BR')
      });
    });
    toast.success('Modelos de POPs sugeridos importados com sucesso!');
  };

  // Listen for search or popId URL parameters to auto-focus POP and search entries
  useEffect(() => {
    const qSearch = searchParams.get('search');
    if (qSearch && qSearch.trim() !== '') {
      setSearchTerm(decodeURIComponent(qSearch));
    }
    const qPopId = searchParams.get('popId');
    if (qPopId && procedures.length > 0) {
      const found = procedures.find(p => p.id === qPopId);
      if (found) {
        setReadingPop(found);
        toast.info(`Visualizando procedimento: ${found.name}`);
      }
    }
  }, [searchParams, procedures]);

  // Load collaborator suggestions simulation local list
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
      createdAt: new Date().toISOString().split('T')[0]
    };

    // Save in master store
    addPOP(newRecord);

    toast.success('Novo POP criado na biblioteca!', {
      description: 'Diretriz operacional cadastrada com sucesso e vinculada ao sistema geral.'
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
      fileName: uploadedFileName || editingPop.fileName
    };

    updatePOP(editingPop.id, updatedData);

    toast.success('POP operacional atualizado!', {
      description: 'As alterações foram sincronizadas e registradas na biblioteca corporativa.'
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

  // Upload file parser (Base64)
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
        description: 'Documento acoplado e pronto para vinculação operacional.'
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
        description: 'Vá até o painel de Estoque para alimentar os insumos ativos.'
      });
      return;
    }
    const standard = inventoryProducts[0];
    setFormRequiredProducts(prev => [
      ...prev,
      { productId: standard.id, productName: standard.name, quantityPer100m2: 10, unit: standard.unit }
    ]);
  };

  const updateChemicalField = (idx: number, field: string, val: any) => {
    setFormRequiredProducts(prev => prev.map((item, i) => {
      if (i !== idx) return item;
      if (field === 'productId') {
        const found = inventoryProducts.find(p => p.id === val);
        return { ...item, productId: val, productName: found ? found.name : item.productName, unit: found ? found.unit : item.unit };
      }
      return { ...item, [field]: val };
    }));
  };

  const removeChemicalLine = (idx: number) => {
    setFormRequiredProducts(prev => prev.filter((_, i) => i !== idx));
  };

  // Model B - Collaborator suggestions simulation
  const suggestAlteration = () => {
    if (!suggestionProposal.trim() || !readingPop) return;

    const newSuggestion = {
      id: `sug-${Math.random().toString(36).substring(2, 9)}`,
      popId: readingPop.id,
      popName: readingPop.name,
      proposer: 'Técnico Especialista',
      content: suggestionProposal.trim(),
      date: new Date().toLocaleDateString('pt-BR'),
      status: 'pendente'
    };

    const updated = [newSuggestion, ...suggestedEdits];
    setSuggestedEdits(updated);
    tenantStorage.setItem('pop_suggestions', JSON.stringify(updated));

    toast.success('Sugestão enviada com sucesso!', {
      description: 'O gestor avaliador revisará sua solicitação para eventual publicação na nova versão.'
    });

    setSuggestionProposal('');
    setIsSuggestOpen(false);
  };

  const approveSuggestion = (sug: any) => {
    // Locate target pop
    const target = procedures.find(p => p.id === sug.popId);
    if (!target) return;

    // Simulate approval: Create new version
    const currentVer = parseFloat(target.version || '1.0');
    const nextVer = (currentVer + 0.1).toFixed(1);

    // Dynamic replacement in text instructions
    const appendText = `\n\n* [Ajuste Versão ${nextVer} - Sugestão Aprovada]: ${sug.content}`;
    const newInstructions = target.instructions + appendText;

    const updatedHistory = [
      { version: nextVer, date: new Date().toLocaleDateString('pt-BR'), change: sug.content },
      ...(target.versions || [])
    ];

    // Persist alteration
    updatePOP(target.id, {
      instructions: newInstructions,
      version: nextVer,
      // Pass other fields to preserve
      name: target.name,
      pestType: target.pestType,
      serviceType: target.serviceType,
      requiredProducts: target.requiredProducts,
      estimatedTimeHoursPer100m2: target.estimatedTimeHoursPer100m2,
      fileUrl: target.fileUrl,
      fileName: target.fileName
    } as any);

    // Update suggestions status
    const updatedLocally = suggestedEdits.map(s => {
      if (s.id === sug.id) return { ...s, status: 'aprovado' };
      return s;
    });
    setSuggestedEdits(updatedLocally);
    tenantStorage.setItem('pop_suggestions', JSON.stringify(updatedLocally));

    toast.success(`Sugestão técnica de ${sug.proposer} aprovada!`, {
      description: `Procedimento "${target.name}" atualizado de v${target.version} para v${nextVer}.`
    });

    // Close reader if opened to prevent stale views
    setReadingPop(null);
  };

  const rejectSuggestion = (sugId: string) => {
    const updatedLocally = suggestedEdits.map(s => {
      if (s.id === sugId) return { ...s, status: 'recusado' };
      return s;
    });
    setSuggestedEdits(updatedLocally);
    tenantStorage.setItem('pop_suggestions', JSON.stringify(updatedLocally));
    toast.info('Sugestão de alteração recusada pelo Administrador.');
  };

  // Real Gemini AI Chat for POPs Knowledge
  const submitAiQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatQuery.trim() || isAiLoading) return;

    const userText = aiChatQuery;
    setAiChatLog(prev => [...prev, { sender: 'user', text: userText }]);
    setAiChatQuery('');
    setIsAiLoading(true);

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const popContext = `Você é o Assistente de Inteligência Especializado em POPs (Procedimentos Operacionais Padrão) da PestFlow.
Atualmente, a biblioteca possui os seguintes POPs cadastrados na base:
${procedures.map(p => `- POP: ${p.name} | Praga: ${p.pestType} | Versão: ${p.version} | Categoria: ${p.category}`).join('\n')}

Responda dúvidas sobre técnicas de controle de pragas, dosagens, EPIs exigidos, procedimentos e normas da Anvisa com precisão e clareza.`;

      const response = await fetch('/api/ai/pestflow-chat', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: userText,
          systemContext: popContext,
          history: aiChatLog.map(m => ({
            role: m.sender === 'ia' ? 'model' : 'user',
            content: m.text
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Falha ao comunicar com o servidor de inteligência.');
      }

      const data = await response.json();
      const answer = data.text || 'Não foi possível obter resposta da inteligência.';
      setAiChatLog(prev => [...prev, { sender: 'ia', text: answer }]);
    } catch (err) {
      setAiChatLog(prev => [...prev, { sender: 'ia', text: 'Desculpe, ocorreu um erro ao consultar o assistente de inteligência. Tente novamente.' }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Automated POP Generation with Gemini AI
  const handleGenerateProcedureWithAI = async () => {
    if (isGeneratingAI) return;
    setIsGeneratingAI(true);
    toast.info('Gerando POP com IA...');

    try {
      const token = auth.currentUser ? await auth.currentUser.getIdToken() : undefined;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ai/generate-procedure', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          title: formName || 'Procedimento Técnico de Controle de Pragas',
          description: formName || 'Controle de Pragas Urbana',
          targetPests: [formPest],
          allowedChemicalIds: []
        })
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

      const fullInstructions = `# ${formName || 'PROCEDIMENTO OPERACIONAL PADRÃO'}\n\n` +
        `**Praga-Alvo:** ${res.pestType || formPest}\n` +
        `**Princípios Ativos:** ${res.activeIngredients || 'A definir conforme praga-alvo'}\n` +
        `**Diluição Recomendada:** ${res.dilutionRatio || res.recommendedChemicalVolume || 'Conforme rótulo do fabricante'}\n` +
        `**Método de Aplicação:** ${res.applicationMethod || 'Pulverização / Pincelamento'}\n` +
        `**EPIs Obrigatórios:** ${res.safetyEquipment || (res.requiredEPIs?.extraArmorText || 'Luvas de nitrila, máscara P2, óculos e botas')}\n` +
        `**Tempo de Reentrada:** ${res.reentryInterval || '24 horas'}\n` +
        `**Base Legal / Regulamentação:** ${res.legalFramework || 'RDC 52/2009 ANVISA / NR-31'}\n\n` +
        `## PASSO A PASSO OPERACIONAL\n${stepsText || 'Siga as recomendações técnicas do fabricante e regras de segurança da Anvisa.'}`;

      setFormInstructions(fullInstructions);
      toast.success('POP gerado com IA com sucesso!');
    } catch (err: any) {
      console.error('Erro na geração de POP com IA:', err);
      toast.error('Erro ao gerar POP com IA. Tente novamente.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Filter and display calculations
  const totalCount = procedures.length + SEEDED_TRAININGS.length;
  const operationalCount = procedures.filter(p => p.category === 'Operacional').length;
  const adminCount = procedures.filter(p => p.category === 'Administrativo').length;
  const trainingsCount = SEEDED_TRAININGS.length;
  const pendingReviewCount = suggestedEdits.filter(s => s.status === 'pendente').length;

  const filteredProcedures = procedures.filter(p => {
    // 1. Full text search
    const q = searchTerm.toLowerCase();
    const matchSearch = p.name.toLowerCase().includes(q) || 
                        p.pestType.toLowerCase().includes(q) || 
                        p.instructions.toLowerCase().includes(q) ||
                        p.author.toLowerCase().includes(q);

    if (!matchSearch) return false;

    // 2. Left Menu Folders
    if (activeCategory) {
      if (p.category !== activeCategory) return false;
      if (activeSubcategory && p.subcategory !== activeSubcategory) return false;
    }

    // 3. Horizontal Filters
    if (selectedFilter !== 'Todos') {
      if (selectedFilter === 'Pendentes Revisão') {
        const hasSuggestion = suggestedEdits.some(s => s.popId === p.id && s.status === 'pendente');
        if (!hasSuggestion) return false;
      } else if (selectedFilter === 'Treinamentos') {
        return false; // Handled separately
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

  // Training Deck player operations
  const startTrainingPlayer = (course: TrainingCourse) => {
    setActiveTraining(course);
    setCourseSlideIdx(0);
    setIsQuizMode(false);
    setQuizAnswers([]);
    setShowQuizResult(false);
    setCertifiedName('');
  };

  const handleNextSlide = () => {
    if (!activeTraining) return;
    if (courseSlideIdx < activeTraining.slides.length - 1) {
      setCourseSlideIdx(prev => prev + 1);
    } else {
      setIsQuizMode(true);
    }
  };

  const handleSelectQuizAnswer = (qIdx: number, oIdx: number) => {
    const updated = [...quizAnswers];
    updated[qIdx] = oIdx;
    setQuizAnswers(updated);
  };

  const submitTrainingQuiz = () => {
    if (!activeTraining) return;
    if (quizAnswers.length < activeTraining.quiz.length) {
      toast.warning('Responda todas as perguntas para obter o laudo técnico!');
      return;
    }
    setShowQuizResult(true);
  };

  const downloadSimulatedCertificate = () => {
    toast.success('Certificado gerado com sucesso!', {
      description: 'O download do PDF de Habilitação foi disponibilizado no repositório local.'
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 text-left" id="pestflow_pops_panel_root">
      
      {/* 1. TOP HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-gray-100 pb-5" id="pops-header-row">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <span className="p-2 bg-emerald-50 text-[#1B3A2D] rounded-xl self-center shrink-0">
              <BookOpen className="size-6" />
            </span>
            POPs e Procedimentos
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 max-w-xl">
            Central de conhecimento, padronização operacional e treinamento corporativo de controle de pragas.
          </p>
        </div>
        <div className="flex items-center gap-2.5 self-start md:self-auto" id="headers-action-buttons">
          <button 
            id="btn-trigger-new-pop"
            onClick={triggerCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#1B3A2D] text-white text-xs font-semibold rounded-lg hover:bg-[#2D6A4F] transition-all shadow-sm"
          >
            <Plus className="size-3.5" /> Novo POP
          </button>
          <button 
            id="btn-trigger-upload-doc"
            onClick={triggerUploadModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
          >
            <Upload className="size-3.5" /> Upload Documento
          </button>
          <button 
            id="btn-new-category"
            onClick={() => {
              const catName = prompt("Digite o nome da nova categoria operacional/administrativa:");
              if (catName && catName.trim()) {
                toast.success(`Categoria "${catName}" pré-agendada para homologação do TI.`);
              }
            }}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-all"
          >
            <PlusCircle className="size-3.5" /> Nova Categoria
          </button>
        </div>
      </div>

      {/* 2. DYNAMIC UPPER COUNTERS (INDICATORS) */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mb-8" id="upper-metric-indicators">
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs flex flex-col justify-between" id="metric-total">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Total de POPs</span>
          <span className="text-2xl font-black text-slate-800 mt-2">{totalCount}</span>
          <span className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-semibold">
            <Check className="size-3" /> Base em Dia
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs flex flex-col justify-between" id="metric-oper">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">POPs Operacionais</span>
          <span className="text-2xl font-black text-slate-800 mt-2">{operationalCount}</span>
          <span className="text-[10px] text-slate-500 mt-1 font-medium">Bicas e Dosagens</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs flex flex-col justify-between" id="metric-admin">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">POPs Administrativos</span>
          <span className="text-2xl font-black text-slate-800 mt-2">{adminCount}</span>
          <span className="text-[10px] text-slate-500 mt-1 font-medium">Fluxos Internos</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-150 shadow-xs flex flex-col justify-between" id="metric-trainings">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Treinamentos</span>
          <span className="text-2xl font-black text-slate-800 mt-2">{trainingsCount}</span>
          <span className="text-[10px] text-indigo-600 mt-1 flex items-center gap-1 font-bold">
            <Zap className="size-3" /> Habilitadores
          </span>
        </div>
        <div className={`p-4 rounded-xl border shadow-xs flex flex-col justify-between transition-colors ${pendingReviewCount > 0 ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-150'}`} id="metric-pendings">
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Pendentes de Revisão</span>
          <span className={`text-2xl font-black mt-2 ${pendingReviewCount > 0 ? 'text-amber-700' : 'text-slate-800'}`}>{pendingReviewCount}</span>
          <span className="text-[10px] text-slate-500 mt-1 font-medium flex items-center gap-1">
            {pendingReviewCount > 0 ? '⚠️ Exige atenção' : '✓ Tudo revisado'}
          </span>
        </div>
      </div>

      {/* 3. CORE SEARCH AREA (PRIMARY VISUAL ELEMENT) */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 shadow-xl mb-8 relative overflow-hidden" id="prominent-search-billboard">
        {/* Subtle dynamic backdrop decoration */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-2xl mx-auto text-center z-10 relative">
          <div className="inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-350 mb-3">
            <Sparkles className="size-3 text-emerald-400 animate-pulse" /> Busca Semântica & Manual Oficial
          </div>
          <h2 className="text-2xl font-bold font-sans text-white mb-2">Central Única de Busca de Conhecimento</h2>
          <p className="text-xs text-slate-300 mb-6">Localize dosagens químicas de pragas, diretrizes comerciais ou manuais ANVISA em segundos.</p>
          
          <div className="relative">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <input 
              id="main-large-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Pesquisar POPs, documentos, treinamentos ou palavras-chave..."
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-white text-slate-900 border-none text-sm font-medium focus:ring-4 focus:ring-emerald-500/30 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
      </div>

      {/* HORIZONTAL QUICK CATEGORY METRIC FILTRES */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 scrollbar-none" id="horizontal-filters-tabs">
        {['Todos', 'Operacional', 'Administrativo', 'Financeiro', 'Comercial', 'Sistemas', 'Treinamentos', 'Pendentes Revisão'].map((filterName) => {
          const isActive = selectedFilter === filterName;
          return (
            <button
              key={filterName}
              id={`filter-tab-${filterName.toLowerCase().replace(' ', '-')}`}
              onClick={() => {
                setSelectedFilter(filterName);
                // Clear tree node sidebar so it focuses correctly on search results
                setActiveCategory(null);
                setActiveSubcategory(null);
                if (filterName === 'Treinamentos') {
                  setActiveCategory('Treinamentos');
                }
              }}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border whitespace-nowrap transition-all ${
                isActive 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-sm' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {filterName}
            </button>
          );
        })}
      </div>

      {/* 4. MAIN SPLIT LAYOUT SYSTEM */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start" id="main-application-split">
        
        {/* LEFT COLUMN: LIBRARY DIRECTORY TREE (25%) */}
        <div className="space-y-6 lg:sticky lg:top-4" id="left-column-sidebar">
          
          {/* FOLDER EXPLORER CARD */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden" id="directory-tree-card">
            <div className="bg-slate-50 p-3.5 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <BookOpen className="size-3.5 text-slate-500" /> Diretório de Pastas
              </span>
              <button 
                onClick={() => {
                  setActiveCategory(null);
                  setActiveSubcategory(null);
                  setSelectedFilter('Todos');
                }}
                className="text-[10px] text-emerald-700 font-bold hover:underline"
              >
                Limpar Selação
              </button>
            </div>

            <div className="p-3.5 space-y-2.5" id="tree-container">
              {CATEGORIES_TREE.map((node) => {
                const isCatActive = activeCategory === node.name;
                const hasSubs = node.subs.length > 0;

                return (
                  <div key={node.name} className="space-y-1">
                    <button
                      id={`tree-node-${node.name.toLowerCase()}`}
                      onClick={() => {
                        setActiveCategory(isCatActive && !activeSubcategory ? null : node.name);
                        setActiveSubcategory(null);
                        setSelectedFilter(node.name === 'Treinamentos' ? 'Treinamentos' : 'Todos');
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs font-semibold text-left transition-colors ${
                        isCatActive 
                          ? 'bg-emerald-50/70 text-[#1B3A2D]' 
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className={`size-1.5 rounded-full ${isCatActive ? 'bg-emerald-600' : 'bg-slate-350'}`} />
                        {node.name}
                      </span>
                      {hasSubs && (
                        <span className="text-slate-450 shrink-0">
                          {isCatActive ? <ChevronDown className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                        </span>
                      )}
                    </button>

                    {/* SUBCATEGORIES SLIDE PANEL */}
                    {hasSubs && isCatActive && (
                      <div className="pl-4.5 border-l border-slate-250 py-1 space-y-1.5" id={`sub-tree-${node.name.toLowerCase()}`}>
                        {node.subs.map((subName) => {
                          const isSubActive = activeSubcategory === subName;
                          return (
                            <button
                              key={subName}
                              id={`sub-tree-node-${subName.toLowerCase().replace(/ /g, '-')}`}
                              onClick={() => {
                                setActiveSubcategory(isSubActive ? null : subName);
                              }}
                              className={`w-full flex items-center justify-between p-1.5 rounded text-[11px] font-medium text-left transition-all ${
                                isSubActive 
                                  ? 'text-emerald-700 font-bold' 
                                  : 'text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              <span>{subName}</span>
                              {isSubActive && <Check className="size-3 text-emerald-600 ml-1 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SIMULATED MODEL B COLLABORATOR SUBMISSION BANNER & ALERTS INBOX */}
          <div className="bg-white rounded-xl border border-slate-250 shadow-sm p-4 text-xs font-semibold space-y-3" id="collaborator-panel-suggestion">
            <div className="flex items-center gap-1.5 text-slate-800">
              <UserCheck className="size-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-700 lowercase leading-tight">Revisões Pendentes (Modelo B)</span>
            </div>
            <p className="text-[11px] text-slate-450 leading-relaxed font-medium">
              O fluxo de sugestões de alterações ativa técnicos a propor melhorias de diluição no campo para validação administrativa.
            </p>
            
            <div className="space-y-2 border-t border-slate-100 pt-3" id="suggestion-alert-inbox">
              {suggestedEdits.filter(s => s.status === 'pendente').map((sug) => (
                <div key={sug.id} className="p-2.5 bg-amber-50/50 border border-amber-150 rounded-lg text-left" id={`sug-inbox-card-${sug.id}`}>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans mb-1">
                    <span className="font-bold text-[#1b3a2d]">{sug.proposer}</span>
                    <span>{sug.date}</span>
                  </div>
                  <p className="font-medium text-slate-800 text-[11px] leading-relaxed mb-3">
                    <strong>Ref:</strong> {sug.popName}<br/>
                    "{sug.content}"
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => approveSuggestion(sug)}
                      className="px-2 py-1 bg-[#1B3A2D] text-white hover:bg-emerald-700 text-[10px] font-bold rounded"
                    >
                      Aprovar & Publicar
                    </button>
                    <button
                      onClick={() => rejectSuggestion(sug.id)}
                      className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:text-red-600 text-[10px] rounded"
                    >
                      Recusar
                    </button>
                  </div>
                </div>
              ))}
              {suggestedEdits.filter(s => s.status === 'pendente').length === 0 && (
                <div className="text-center py-2 text-slate-400 font-medium text-[10px]" id="sug-inbox-empty">
                  Nenhuma sugestão técnica pendente de aprovação.
                </div>
              )}
            </div>
          </div>

          {/* AI SEARCH BOT CHAT PANEL */}
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-4" id="ai-chat-assistent-box">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-[#1B3A2D] text-white rounded-md shrink-0">
                <Sparkles className="size-3.5 text-emerald-300" />
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 leading-none">Biblioteca de Consulta IA</h4>
                <span className="text-[9px] text-slate-400 font-bold">Assistente Técnico</span>
              </div>
            </div>

            <div className="max-h-48 overflow-y-auto space-y-2 border-b border-slate-100 pb-3" id="ai-chat-logs-screen">
              {aiChatLog.map((logMsg, lIdx) => (
                <div key={lIdx} className={`p-2.5 rounded-lg text-[11px] leading-relaxed font-sans ${logMsg.sender === 'user' ? 'bg-emerald-50 text-slate-800 ml-4 border border-emerald-100 text-right' : 'bg-white text-slate-700 border border-slate-150 mr-4 text-left'}`}>
                  {logMsg.text}
                </div>
              ))}
              {isAiLoading && (
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold px-1 animate-pulse">
                  <RefreshCw className="size-3 animate-spin text-emerald-600" /> Buscando nas diretrizes operacionais...
                </div>
              )}
            </div>

            <form onSubmit={submitAiQuestion} className="relative">
              <input 
                type="text"
                value={aiChatQuery}
                onChange={(e) => setAiChatQuery(e.target.value)}
                placeholder="Como executar controle de cupins?"
                className="w-full h-9 pl-3 pr-10 rounded-lg text-[11px] border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#1B3A2D] bg-white font-medium"
              />
              <button 
                type="submit" 
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-emerald-600 hover:bg-slate-100 rounded-md"
              >
                <ArrowRight className="size-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT COLUMN: LIST OF CONTENTS AND CARDS (75%) */}
        <div className="lg:col-span-3 space-y-6" id="right-column-contents">
          
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs text-slate-500 font-semibold" id="browse-summary-heading">
            <span>
              Mostrando <strong className="text-slate-800">{selectedFilter === 'Treinamentos' ? trainingsCount : filteredProcedures.length}</strong> itens de conhecimento corporativo
            </span>
            <span className="font-sans text-[10px] bg-slate-200 px-2 py-0.5 rounded text-slate-600">
              {activeCategory ? `Pasta: ${activeCategory}` : 'Todas as Categorias'}
            </span>
          </div>

          {/* CONTENTS GRID CARDS */}
          {selectedFilter === 'Treinamentos' ? (
            /* TREINAMENTOS SPECIAL LAYOUT LIST */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="trainings-data-grid">
              {SEEDED_TRAININGS.map((course) => (
                <div key={course.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-all flex flex-col justify-between" id={`course-card-${course.id}`}>
                  <div>
                    <div className="h-2.5 bg-indigo-500" />
                    <div className="p-5 space-y-2 text-left">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1"><BookOpenCheck className="size-3.5 text-indigo-500" /> Academia Teórica</span>
                        <span className="flex items-center gap-1 text-slate-500"><Clock className="size-3" /> {course.duration}</span>
                      </div>
                      <h4 className="font-bold text-slate-800 text-sm leading-snug">{course.title}</h4>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium">{course.description}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <button
                      id={`btn-start-course-${course.id}`}
                      onClick={() => startTrainingPlayer(course)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      Iniciar Treinamento <ArrowRight className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* POP PROCEDURES CONTENT CARDS LIST */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="pop-procedures-list-grid">
              {filteredProcedures.map((pop) => {
                const isPendingReview = suggestedEdits.some(s => s.popId === pop.id && s.status === 'pendente');
                const matchingAgenda = (agenda || []).filter(e => 
                  e.title?.toLowerCase().includes((pop.pestType || '').toLowerCase()) ||
                  e.title?.toLowerCase().includes((pop.category || '').toLowerCase())
                );
                const activeProducts = (inventory?.products || []).filter(p => 
                  pop.requiredProducts?.some((req: any) => {
                    const name = typeof req === 'string' ? req : (req?.productName || '');
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
                      {/* Left color bar indicator */}
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

                        <h3 className="font-extrabold text-slate-800 text-sm leading-snug tracking-tight">
                          {pop.name}
                        </h3>

                        {/* Brief summary text extraction from markdown instructions */}
                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                          {pop.instructions ? pop.instructions.replace(/[#*`_-]/g, '').substring(0, 140) + '...' : 'Ficha de diretriz instrucional corporativa geral.'}
                        </p>

                        {/* INTEGRATED COLLABORATIVE DATA SHOWN DYNAMICALLY */}
                        <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1.5 text-[10px]">
                          <div className="flex items-center justify-between text-slate-600 font-bold">
                            <span className="flex items-center gap-1"><Activity className="size-3 text-slate-400" /> Serviços Agendados:</span>
                            <span className="text-[#1B3A2D] font-black">{matchingAgenda.length} OS vinculadas</span>
                          </div>
                          <div className="flex items-start justify-between text-slate-650 font-bold">
                            <span className="flex items-center gap-1 mt-0.5"><Package className="size-3 text-slate-400" /> Insumos Associados:</span>
                            <span className="text-[#1B3A2D] font-black text-right truncate max-w-[130px]">
                              {activeProducts.map(p => p.name).join(', ') || pop.requiredProducts?.join(', ') || 'Nenhum insumo'}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 font-sans border-t border-slate-100 pt-2.5">
                          <div className="flex items-center gap-1.5 truncate">
                            <Clock className="size-3 text-slate-400" /> {pop.estimatedTimeHoursPer100m2}h / 100m²
                          </div>
                          <div className="flex items-center gap-1.5 truncate">
                            <Calendar className="size-3 text-slate-400" /> Revisado: {pop.lastRevision}
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
                        className="px-3 py-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs text-slate-650 hover:text-emerald-700 transition-all"
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
                          onClick={() => toast.success('Conteúdo de texto impresso/exportado como documento corporativo oficial de instrução.')}
                          className="p-2 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-650 transition"
                          title="Imprimir Diretriz"
                        >
                          <Download className="size-3.5" />
                        </button>
                      )}
                      <button
                        id={`btn-delete-pop-${pop.id}`}
                        onClick={() => handleDeletePOP(pop.id, pop.name)}
                        className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition"
                        title="Apagar permanentemente"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredProcedures.length === 0 && (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center bg-white p-6" id="empty-state-card">
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

      </div>

      {/* 5. INTERACTIVE READING ROOM & DUAL-COLUMN PREVIEW PANEL MODAL */}
      <AnimatePresence>
        {readingPop && (() => {
          // Find standard version timeline logs
          const activeVersions = readingPop.versions || [
            { version: '1.0', date: readingPop.createdAt, change: 'Homologação primordial e publicação original.' }
          ];

          const readingMatchingAgenda = (agenda || []).filter(e => 
            e.title?.toLowerCase().includes((readingPop.pestType || '').toLowerCase()) ||
            e.title?.toLowerCase().includes((readingPop.category || '').toLowerCase())
          );
          const readingActiveProducts = (inventory?.products || []).filter(p => 
            readingPop.requiredProducts?.some((req: any) => {
              const name = typeof req === 'string' ? req : (req?.productName || '');
              return name.toLowerCase().includes(p.name.toLowerCase()) || p.name.toLowerCase().includes(name.toLowerCase());
            })
          );
          const recentAccesses = [
            { user: 'Marcio Souza (Técnico)', date: 'Segunda-feira, 14:12', client: 'Condomínio Spazio', action: 'Visualização' },
            { user: 'Roberto Dias (Diretor)', date: 'Ontem, 09:45', client: 'Revisão Técnica Corporativa', action: 'Revisão' }
          ];

          return (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" id="reading-room-backdrop">
              <motion.div
                initial={{ opacity: 0, scale: 0.98, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 10 }}
                className="bg-white rounded-2xl border border-slate-250 w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden max-h-[92vh]"
                id="reading-room-container"
              >
                
                {/* HEAD BAR */}
                <div className="bg-[#1B3A2D] text-white px-6 py-5 flex items-center justify-between pointer-events-auto" id="reading-room-header">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-sans font-extrabold tracking-widest text-emerald-300 uppercase">
                        {readingPop.category} {readingPop.subcategory ? `> ${readingPop.subcategory}` : ''}
                      </span>
                      <span className="h-1 w-1 bg-white/40 rounded-full" />
                      <span className="text-[10px] font-mono text-slate-300">Versão Ativa: {readingPop.version}</span>
                    </div>
                    <h3 className="font-extrabold text-white text-lg font-sans tracking-tight leading-tight">{readingPop.name}</h3>
                  </div>
                  <button 
                    onClick={() => {
                      setReadingPop(null);
                      setIsCompareMode(false);
                    }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 hover:text-white transition cursor-pointer"
                    id="btn-close-reader"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {/* DUAL-COLUMN CONTENT GRID */}
                <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto" id="reading-content-splitter">
                  
                  {/* MAIN PANEL (LEFT 70% / 8 columns) */}
                  <div className="lg:col-span-8 p-6 space-y-6 border-r border-slate-100 min-h-[450px]" id="reader-primary-pane">
                    
                    {isCompareMode ? (
                      /* HISTORICAL VERSION COMPARE SCREEN */
                      <div className="space-y-4" id="version-diff-container">
                        <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-3">
                          <span className="font-bold text-slate-800 flex items-center gap-1.5"><History className="size-4 text-emerald-600" /> Comparando alterações da versão</span>
                          <select 
                            value={selectedDiffVersion}
                            onChange={(e) => setSelectedDiffVersion(e.target.value)}
                            className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[11px] font-semibold text-slate-700"
                          >
                            {activeVersions.map(v => (
                              <option key={v.version} value={v.version}>Versão {v.version}</option>
                            ))}
                          </select>
                        </div>

                        {/* Rich side by side Diff simulator */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="simulated-diff-panels">
                          <div className="bg-red-50/70 rounded-xl p-4 border border-red-100 text-xs">
                            <span className="font-bold text-red-750 block border-b border-red-100 pb-1 mb-2">Versão {selectedDiffVersion} anterior</span>
                            <p className="font-medium text-slate-650 leading-relaxed font-sans line-through opacity-70">
                              No item 3. Pulverizar calda química de piretróides irritantes na pia com mangueira manual padrão sem regular bico difusor, concentrando defensivo bruto a 1.2%. Usar apenas botas.
                            </p>
                          </div>
                          
                          <div className="bg-emerald-50/75 rounded-xl p-4 border border-emerald-100 text-xs">
                            <span className="font-bold text-[#1B3A2D] block border-b border-emerald-100 pb-1 mb-2">Versão {readingPop.version} atualizada (Ativo)</span>
                            <p className="font-medium text-slate-750 leading-relaxed font-sans">
                              No item 3. <ins className="bg-emerald-150 text-[#1B3A2D] font-bold no-underline rounded px-0.5">Substituir calda de piretróides por Bifentol 200SC residual,</ins> garantindo cobertura de rodapés perimetrais. <ins className="bg-emerald-150 text-[#1B3A2D] font-bold no-underline rounded px-0.5">Exigido uso obrigatório de máscara com cartucho químico de fita larga.</ins>
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 text-slate-500 rounded-lg text-[11px] font-medium leading-relaxed flex items-start gap-2 border border-slate-150">
                          <Info className="size-4 text-slate-400 shrink-0 mt-0.5" />
                          <span>As diferenças acima destacam as revisões e atualizações executadas pelo Gestor Técnico para fins de adequação de controle de qualidade e instruções da saúde pública de controle integrado.</span>
                        </div>
                      </div>
                    ) : (
                      /* STANDARD TEXT READING VIEW & MINI DOCUMENT MOCK PREVIEWS */
                      <div className="space-y-6" id="standard-manuscript-panel">
                        <div className="prose prose-slate max-w-none text-left" id="markdown-instructions-scroll">
                          {/* Instructions Header */}
                          <div className="space-y-4">
                            <div className="p-5 bg-slate-50 border border-slate-150 rounded-xl space-y-4 font-sans text-xs">
                              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                                <Beaker className="size-3.5 text-emerald-600" /> Dosagens e Insumos Químicos Regulamentados
                              </h4>
                              {readingPop.requiredProducts && readingPop.requiredProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  {readingPop.requiredProducts.map((p, pIdx) => (
                                    <div key={pIdx} className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-slate-200">
                                      <span className="text-slate-600 font-medium truncate">{p.productName}</span>
                                      <span className="font-mono font-bold text-slate-900 shrink-0 ml-2">
                                        {p.quantityPer100m2} {p.unit}/100m²
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-slate-400 italic">Não há vinculação direta de insumos químicos para este POP administrativo, comercial ou financeiro.</p>
                              )}
                            </div>

                            {/* Markdown render simulated area */}
                            <div className="p-6 bg-white border border-slate-150 rounded-xl space-y-4 font-sans text-xs leading-relaxed max-h-[380px] overflow-y-auto whitespace-pre-wrap" id="manuscript-rendered-box">
                              {readingPop.instructions}
                            </div>
                          </div>
                        </div>

                        {/* If file base64 is integrated: Show Mock previews (ANVISA Sheet / PDF style) */}
                        {readingPop.fileUrl && (
                          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50-50 space-y-3 font-sans text-xs" id="file-attachments-preview-panel">
                            <span className="font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide text-[11px]"><FileText className="size-3.5 text-blue-500" /> Original do Anexo</span>
                            <div className="bg-white border rounded-lg p-5 flex items-center justify-between text-left" id="attached-original-card">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-red-50 text-red-600 rounded">
                                  <FileText className="size-6" />
                                </div>
                                <div className="space-y-0.5">
                                  <span className="font-bold text-slate-800 text-[11px] max-w-[200px] truncate block">{readingPop.fileName || 'diretriz_pop.pdf'}</span>
                                  <span className="text-[10px] text-slate-400 font-medium">Documento Técnico Sanitário PDF</span>
                                </div>
                              </div>
                              <a
                                href={readingPop.fileUrl}
                                download={readingPop.fileName || 'diretriz_pop.pdf'}
                                className="px-3.5 py-1.5 bg-slate-50 border hover:bg-slate-100 text-slate-700 font-bold rounded-md"
                              >
                                Baixar Anexo
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>

                  {/* SIDE QUICK INFO TAB (RIGHT 30% / 4 columns) */}
                  <div className="lg:col-span-4 p-6 space-y-6 bg-slate-50 shrink-0 font-sans text-xs text-slate-700 font-medium" id="reader-side-panel">
                    
                    <div className="space-y-3" id="quick-side-info-card">
                      <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-250 pb-2">Informações Rápidas</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-450 font-semibold">Categoria</span>
                          <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold">{readingPop.category}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-450 font-semibold">Status Ativo</span>
                          <span className={`px-2 py-0.5 rounded text-white font-extrabold text-[10px] uppercase ${readingPop.status === 'Ativo' ? 'bg-emerald-500' : 'bg-amber-500'}`}>{readingPop.status}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-450 font-semibold">Versão Atual</span>
                          <span className="font-mono font-bold text-slate-800">v{readingPop.version}</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-450 font-semibold">Duração Padrão</span>
                          <span className="font-semibold text-slate-800">{readingPop.estimatedTimeHoursPer100m2} horas / 100m²</span>
                        </div>
                        <div className="flex justify-between items-center py-1">
                          <span className="text-slate-450 font-semibold">Revisado em</span>
                          <span className="font-semibold text-slate-800">{readingPop.lastRevision}</span>
                        </div>
                      </div>
                    </div>

                    {/* HISTORY TIMELINE */}
                    <div className="space-y-4 pt-1" id="versions-history-timeline">
                      <div className="flex items-center justify-between border-b border-slate-250 pb-2">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Controle de Versões</h4>
                        <button
                          onClick={() => setIsCompareMode(!isCompareMode)}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded transition ${isCompareMode ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                          id="btn-trigger-compare-versions"
                        >
                          {isCompareMode ? 'Fechar Comparador' : 'Comparar versões'}
                        </button>
                      </div>

                      <div className="relative pl-3.5 border-l border-slate-200 ml-1.5 space-y-4" id="timeline-steps">
                        {activeVersions.map((log, lIdx) => (
                          <div key={lIdx} className="relative" id={`timeline-item-${log.version}`}>
                            <div className="absolute -left-5 top-1.5 size-2 bg-emerald-600 rounded-full border border-white" />
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-semibold text-slate-400">{log.date || '01/01/2026'} — v{log.version}</span>
                              <p className="text-[11px] text-slate-800 font-medium leading-relaxed">{log.change}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* SUGGEST REVISION INPUT BUTTON AREA (MODEL B FLOW PROCESS) */}
                    <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3" id="suggestion-editor-card">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5"><HelpCircle className="size-4 text-emerald-600" /> Quer sugerir uma alteração?</span>
                      <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                        Se identificou melhorias práticas para as dosagens sanitárias de campo, insira o detalhamento para crivo técnico do Admin.
                      </p>
                      
                      {isSuggestOpen ? (
                        <div className="space-y-2.5" id="form-suggest-sub">
                          <textarea
                            rows={3}
                            value={suggestionProposal}
                            onChange={(e) => setSuggestionProposal(e.target.value)}
                            placeholder="Descreva seu adendo técnico aqui..."
                            className="w-full text-[11px] p-2 rounded-lg border border-slate-200 focus:outline-[#1B3A2D] leading-relaxed resize-none font-sans font-medium"
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={suggestAlteration}
                              className="px-3 py-1.5 bg-[#1B3A2D] text-white text-[10px] font-bold rounded hover:bg-emerald-700"
                            >
                              Enviar Proposta
                            </button>
                            <button
                              onClick={() => setIsSuggestOpen(false)}
                              className="px-3 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded hover:bg-slate-200"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsSuggestOpen(true)}
                          className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition"
                          id="btn-propose-alteration"
                        >
                          Sugerir Alteração
                        </button>
                      )}
                    </div>

                    {/* CONTEXT INTEGRATION PANELS (UMA INFORMAÇÃO, MÚLTIPLOS CONTEXTOS) */}
                    <div className="space-y-4 pt-2" id="pop-reading-room-shortcuts">
                      
                      {/* RELATING SERVICES */}
                      <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#1B3A2D] flex items-center gap-1.5 border-b border-slate-105 pb-1.5">
                          <Activity className="size-3.5 text-[#1B3A2D]" /> Serviços Relacionados ({readingMatchingAgenda.length})
                        </h4>
                        {readingMatchingAgenda.length > 0 ? (
                          <div className="space-y-2">
                            {readingMatchingAgenda.slice(0, 3).map((ev) => (
                              <div key={ev.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-150">
                                <span className="text-[10px] font-bold text-slate-700 truncate max-w-[150px]" title={ev.title}>
                                  {ev.title}
                                </span>
                                <button
                                  onClick={() => {
                                    setReadingPop(null);
                                    navigate(`/agenda?eventId=${ev.id}`);
                                  }}
                                  className="text-[9px] bg-white border border-slate-200 hover:bg-[#1B3A2D] hover:text-white px-2 py-0.5 rounded font-semibold cursor-pointer transition-all leading-6"
                                >
                                  Ver OS
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">Sem OS vinculada recentemente.</p>
                        )}
                      </div>

                      {/* RELATING PRODUCTS AND QUANTITIES */}
                      <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#1B3A2D] flex items-center gap-1.5 border-b border-slate-105 pb-1.5">
                          <Package className="size-3.5 text-[#1B3A2D]" /> Produtos Relacionados ({readingActiveProducts.length})
                        </h4>
                        {readingActiveProducts.length > 0 ? (
                          <div className="space-y-2">
                            {readingActiveProducts.slice(0, 3).map((prod) => {
                              const isLow = prod.quantity <= prod.minQuantity;
                              return (
                                <div key={prod.id} className="flex justify-between items-center bg-slate-50 p-2 rounded border border-slate-150">
                                  <div className="space-y-0.5 text-left truncate max-w-[140px]">
                                    <span className="text-[10px] font-bold text-slate-700 block truncate">{prod.name}</span>
                                    <span className={`text-[9px] font-bold block ${isLow ? 'text-red-600 animate-pulse font-extrabold' : 'text-emerald-700'}`}>
                                      Qtd: {prod.quantity} {prod.unit}
                                    </span>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setReadingPop(null);
                                      navigate(`/inventory?search=${encodeURIComponent(prod.name)}`);
                                    }}
                                    className="text-[9px] bg-white border border-slate-200 hover:bg-[#1B3A2D] hover:text-white px-2 py-0.5 rounded font-semibold cursor-pointer transition-all leading-6"
                                  >
                                    Ver Estoque
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">Nenhum insumo de estoque associado.</p>
                        )}
                      </div>

                      {/* RECENT ACCESS TRAILS */}
                      <div className="p-4 bg-white rounded-xl border border-slate-100 space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-450 border-b border-slate-250 pb-1 flex items-center gap-1"><Clock className="size-3" /> Últimos Acessos ao POP</h4>
                        <div className="space-y-1.5">
                          {recentAccesses.map((acc, aIdx) => (
                            <div key={aIdx} className="flex justify-between items-center text-[10px] border-b border-slate-50 pb-1 last:border-0">
                              <span className="font-semibold text-slate-700 truncate max-w-[120px]">{acc.user}</span>
                              <span className="text-[9px] text-[#1B3A2D] font-bold">{acc.action} · <span className="text-slate-400 font-medium">{acc.date}</span></span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>

                  </div>

                </div>

                {/* BOTTOM FOOT ACTIONS */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end gap-2.5" id="reading-room-footer">
                  <button
                    onClick={() => {
                      setReadingPop(null);
                      setIsCompareMode(false);
                    }}
                    className="px-5 py-2.5 bg-[#1B3A2D] text-white text-xs font-bold rounded-lg hover:bg-emerald-800 transition"
                  >
                    Concluído a Leitura
                  </button>
                </div>

              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

      {/* 6. MODAL FOR NEW POP CREATION */}
      <AnimatePresence>
        {isCreateOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" id="create-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-xl border border-slate-250 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
              id="create-modal-container"
            >
              <div className="bg-[#1B3A2D] text-white px-6 py-4 flex items-center justify-between" id="create-modal-header">
                <div>
                  <span className="text-[9px] font-extrabold tracking-widest text-[#1b3a2d] bg-emerald-300 px-2.5 py-0.5 rounded leading-none uppercase">Homologador PestFlow</span>
                  <h3 className="font-bold text-white text-base font-sans tracking-tight pt-1">Cadastrar Nova Diretriz Técnica (POP)</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerateProcedureWithAI}
                    disabled={isGeneratingAI}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-400 hover:bg-emerald-300 text-[#1B3A2D] font-extrabold text-xs rounded-lg transition disabled:opacity-50 cursor-pointer shadow-sm"
                  >
                    <Sparkles className="size-3.5" />
                    {isGeneratingAI ? 'Gerando POP...' : 'Gerar com IA'}
                  </button>
                  <button onClick={() => setIsCreateOpen(false)} className="p-1 hover:bg-white/10 rounded-lg text-white/80 transition cursor-pointer">
                    <X className="size-5" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreatePOP} className="p-6 space-y-5 text-left text-xs font-semibold text-slate-700" id="create-pop-form">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">Título Regulamentar</label>
                  <input 
                    type="text" 
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: POP Controle de Baratas Residencial Especializado"
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-medium text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3" id="create-form-selectors">
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 font-sans">Tipo de Praga</label>
                    <select
                      value={formPest}
                      onChange={(e) => setFormPest(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 cursor-pointer font-bold"
                    >
                      <option value="baratas">Baratas</option>
                      <option value="formigas">Formigas</option>
                      <option value="cupins">Cupins</option>
                      <option value="ratos">Roedores</option>
                      <option value="escorpioes">Escorpiões</option>
                      <option value="outro">Outro / Geral</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 font-sans">Setor de Atuação</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 cursor-pointer font-bold"
                    >
                      <option value="Operacional">Operacional</option>
                      <option value="Administrativo">Administrativo</option>
                      <option value="Financeiro">Financeiro</option>
                      <option value="Comercial">Comercial</option>
                      <option value="Sistemas">Sistemas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3" id="create-form-num-values">
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">Tempo Estimado (Horas por 100m²)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(parseFloat(e.target.value) || 1.0)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">Subcategoria Opcional (Seletivo)</label>
                    <input 
                      type="text" 
                      value={formSubcategory}
                      onChange={(e) => setFormSubcategory(e.target.value)}
                      placeholder="Ex: Controle de Baratas"
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-medium text-slate-850"
                    />
                  </div>
                </div>

                {/* TEXT DIRECTIVES */}
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">Procedimento Operacional Descrito (Ficha / Práticas)</label>
                  <textarea
                    rows={4}
                    required
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder="Escreva as advertências sanitárias e regulamento passo a passo corporativo..."
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-sans font-medium text-slate-805"
                  />
                </div>

                {/* CHEMICAL SELECTION */}
                <div className="space-y-2 border-t border-slate-100 pt-3" id="form-chemical-sub-section">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-500">Insumos Químicos Associados</span>
                    <button
                      type="button"
                      onClick={addChemicalLine}
                      className="px-2 py-1 bg-slate-100 border text-slate-650 hover:bg-slate-200 text-[10px] font-extrabold rounded flex items-center gap-1"
                    >
                      <Plus className="size-3" /> + Associar Insumo
                    </button>
                  </div>

                  <div className="space-y-1.5" id="form-chemical-lines">
                    {formRequiredProducts.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2" id={`form-chem-line-${pIdx}`}>
                        <select
                          value={p.productId}
                          onChange={(e) => updateChemicalField(pIdx, 'productId', e.target.value)}
                          className="flex-1 h-9 px-2 border rounded-lg bg-white text-[11px]"
                        >
                          {inventoryProducts.map(pDef => (
                            <option key={pDef.id} value={pDef.id}>{pDef.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={p.quantityPer100m2}
                          onChange={(e) => updateChemicalField(pIdx, 'quantityPer100m2', parseFloat(e.target.value) || 0)}
                          placeholder="Dosagem"
                          className="w-20 h-9 px-2 border rounded-lg text-center font-bold text-[11px]"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-500 w-8">{p.unit}</span>
                        <button 
                          type="button"
                          onClick={() => removeChemicalLine(pIdx)}
                          className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {formRequiredProducts.length === 0 && (
                      <p className="text-[10px] font-medium italic text-slate-400 py-1">Não há insumos indicados.</p>
                    )}
                  </div>
                </div>

                {/* ATTACHMENT DRAG AND DROP */}
                <div className="space-y-2 border-t border-slate-100 pt-3" id="attacher-panel-create">
                  <span className="text-[11px] font-bold uppercase text-slate-500">Documento ou Certificado Técnico de PDF (Opcional)</span>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('pop-file-upload-create')?.click()}
                    className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-colors ${isDragging ? 'bg-emerald-50/50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Upload className="size-5 text-slate-400" />
                      <span className="text-[11px] font-extrabold text-slate-800">Escolha o anexo de laudo no computador</span>
                      <span className="text-[9px] text-slate-400">Limite do navegador recomendado: 3MB (PDF, DOCX, XLSX)</span>
                    </div>
                    <input 
                      type="file" 
                      id="pop-file-upload-create" 
                      onChange={(e) => {
                        if (e.target.files?.[0]) handleUploadedFiles(e.target.files[0]);
                      }}
                      className="hidden" 
                    />
                  </div>
                  {uploadedFileName && (
                    <div className="p-2 bg-blue-50 text-blue-800 rounded-lg flex items-center justify-between text-[11px] font-sans border border-blue-200 mt-2">
                      <span className="truncate">{uploadedFileName}</span>
                      <button type="button" onClick={() => { setUploadedFileName(undefined); setUploadedBase64(undefined); }} className="text-blue-500 font-bold ml-2">✕</button>
                    </div>
                  )}
                </div>

                {/* MODAL BOTTOM BUTTONS */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4" id="create-pop-action-buttons">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 font-bold hover:bg-slate-55"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[#1B3A2D] text-white font-black rounded-lg hover:bg-emerald-800 shadow-sm"
                  >
                    Homologar e Salvar
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. MODAL FOR POP EDITING */}
      <AnimatePresence>
        {isEditOpen && editingPop && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" id="edit-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-xl border border-slate-250 shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-y-auto"
              id="edit-modal-container"
            >
              <div className="bg-[#1B3A2D] text-white px-6 py-4 flex items-center justify-between" id="edit-modal-header">
                <div>
                  <span className="text-[9px] font-extrabold tracking-widest text-[#1b3a2d] bg-emerald-300 px-2.5 py-0.5 rounded leading-none uppercase">Homologador Técnico</span>
                  <h3 className="font-bold text-white text-base font-sans tracking-tight pt-1">Editar Procedimento Operacional</h3>
                </div>
                <button onClick={() => { setIsEditOpen(false); setEditingPop(null); }} className="p-1 hover:bg-white/10 rounded-lg text-white/80 transition cursor-pointer">
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleEditPOP} className="p-6 space-y-5 text-left text-xs font-semibold text-slate-700" id="edit-pop-form">
                
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">Título Regulamentar</label>
                  <input 
                    type="text" 
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: POP Controle de Baratas Residencial"
                    className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-medium text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 font-sans">Tipo de Praga</label>
                    <select
                      value={formPest}
                      onChange={(e) => setFormPest(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 cursor-pointer font-bold"
                    >
                      <option value="baratas">Baratas</option>
                      <option value="formigas">Formigas</option>
                      <option value="cupins">Cupins</option>
                      <option value="ratos">Roedores</option>
                      <option value="escorpioes">Escorpiões</option>
                      <option value="outro">Outro / Geral</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400 font-sans">Setor de Atuação</label>
                    <select
                      value={formServiceType}
                      onChange={(e) => setFormServiceType(e.target.value)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 cursor-pointer font-bold"
                    >
                      <option value="dedetizacao">Dedetização (Operacional)</option>
                      <option value="desratizacao">Desratização (Operacional)</option>
                      <option value="descupinizacao">Descupinização (Operacional)</option>
                      <option value="sanitizacao">Sanitização (Operacional)</option>
                      <option value="administrativo">Administrativo</option>
                      <option value="financeiro">Financeiro</option>
                      <option value="comercial">Comercial</option>
                      <option value="sistemas">Sistemas</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">Tempo Estimado (Horas por 100m²)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      required
                      value={formTime}
                      onChange={(e) => setFormTime(parseFloat(e.target.value) || 1.0)}
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-medium text-slate-800"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">Subcategoria Opcional (Seletivo)</label>
                    <input 
                      type="text" 
                      value={formSubcategory}
                      onChange={(e) => setFormSubcategory(e.target.value)}
                      placeholder="Ex: Controle de Baratas"
                      className="w-full h-10 px-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-medium text-slate-850"
                    />
                  </div>
                </div>

                {/* TEXT DIRECTIVES */}
                <div className="space-y-1">
                  <label className="text-[10px] font-sans font-bold uppercase tracking-wider text-slate-400">Procedimento Operacional Descrito</label>
                  <textarea
                    rows={4}
                    required
                    value={formInstructions}
                    onChange={(e) => setFormInstructions(e.target.value)}
                    placeholder="Escreva as advertências passo a passo..."
                    className="w-full p-3 border border-slate-200 rounded-lg focus:outline-[#1B3A2D] bg-slate-50 font-sans font-medium text-slate-805"
                  />
                </div>

                {/* CHEMICAL SELECTION */}
                <div className="space-y-2 border-t border-slate-100 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase text-slate-500">Insumos Químicos Associados</span>
                    <button
                      type="button"
                      onClick={addChemicalLine}
                      className="px-2 py-1 bg-slate-100 border text-slate-650 hover:bg-slate-200 text-[10px] font-extrabold rounded flex items-center gap-1"
                    >
                      <Plus className="size-3" /> + Associar Insumo
                    </button>
                  </div>

                  <div className="space-y-1.5" id="edit-chemical-lines">
                    {formRequiredProducts.map((p, pIdx) => (
                      <div key={pIdx} className="flex items-center gap-2" id={`edit-chem-line-${pIdx}`}>
                        <select
                          value={p.productId}
                          onChange={(e) => updateChemicalField(pIdx, 'productId', e.target.value)}
                          className="flex-1 h-9 px-2 border rounded-lg bg-white text-[11px]"
                        >
                          {inventoryProducts.map(pDef => (
                            <option key={pDef.id} value={pDef.id}>{pDef.name}</option>
                          ))}
                        </select>
                        <input
                          type="number"
                          value={p.quantityPer100m2}
                          onChange={(e) => updateChemicalField(pIdx, 'quantityPer100m2', parseFloat(e.target.value) || 0)}
                          placeholder="Dosagem"
                          className="w-20 h-9 px-2 border rounded-lg text-center font-bold text-[11px]"
                        />
                        <span className="text-[10px] font-mono font-bold text-slate-500 w-8">{p.unit}</span>
                        <button 
                          type="button"
                          onClick={() => removeChemicalLine(pIdx)}
                          className="p-1 px-1.5 text-red-500 hover:bg-red-50 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    {formRequiredProducts.length === 0 && (
                      <p className="text-[10px] font-medium italic text-slate-400 py-1">Não há insumos indicados.</p>
                    )}
                  </div>
                </div>

                {/* MODAL BOTTOM BUTTONS */}
                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setIsEditOpen(false); setEditingPop(null); }}
                    className="px-4 py-2 border rounded-lg text-slate-600 font-bold hover:bg-slate-55"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-[#1B3A2D] text-white font-black rounded-lg hover:bg-emerald-800 shadow-sm"
                  >
                    Salvar Alterações
                  </button>
                </div>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 8. MODAL FOR UPLOAD DOCUMENTATION FLUX (DRAG & DROP) */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" id="upload-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white rounded-xl border border-slate-250 shadow-2xl w-full max-w-md p-6 relative"
              id="upload-modal-container"
            >
              <button onClick={() => setIsUploadOpen(false)} className="absolute top-4 right-4 p-1 hover:bg-slate-100 rounded-lg text-slate-450 transition cursor-pointer">
                <X className="size-5" />
              </button>

              <div className="space-y-4 text-left" id="upload-modal-main-view">
                <div>
                  <h3 className="font-bold text-slate-800 text-sm">Biblioteca Global: Drag & Drop Uploader</h3>
                  <p className="text-xs text-slate-400 font-medium">Cadastre insumos em lote arrastando arquivos para conversão instantânea.</p>
                </div>

                <div
                  onDragOver={handleDragOver}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('uploader-file-selector-box')?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${isDragging ? 'bg-emerald-50/50 border-emerald-500' : 'bg-slate-50 border-slate-200 hover:border-slate-300'}`}
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="p-3 bg-white border rounded-lg text-emerald-600 shadow-xs">
                      <Upload className="size-5" />
                    </div>
                    <span className="text-xs font-bold text-slate-800">Arraste a diretriz operacional aqui</span>
                    <span className="text-[10px] text-slate-400 font-medium max-w-[220px] leading-relaxed">
                      Formatos aceitos: PDF, DOCX, DOC, XLS, XLSX, CSV, PPT, PPTX, JPG, PNG (Limite: 3MB)
                    </span>
                  </div>
                  <input 
                    type="file" 
                    id="uploader-file-selector-box" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleUploadedFiles(e.target.files[0]);
                    }}
                    className="hidden" 
                  />
                </div>

                {uploadedFileName && (
                  <div className="p-3 bg-emerald-50 text-[#1B3A2D] rounded-lg text-[11px] font-sans border border-emerald-200 mt-2 flex items-center justify-between font-bold">
                    <span className="truncate">{uploadedFileName}</span>
                    <button type="button" onClick={() => { setUploadedFileName(undefined); setUploadedBase64(undefined); }} className="text-[#1b3a2d] font-bold ml-2">✕</button>
                  </div>
                )}

                <div className="space-y-2 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-400 font-medium">
                  <p className="font-bold text-slate-650 flex items-center gap-1.5"><Info className="size-3.5" /> Requisito ANVISA:</p>
                  <span>Cada arquivo acoplado deve conter obrigatoriamente as assinaturas do Responsável Químico correspondente no rodapé da folha oficial.</span>
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button 
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 border rounded-lg text-slate-600 text-xs font-bold hover:bg-slate-50"
                  >
                    Fechar Uploader
                  </button>
                  <button 
                    onClick={() => {
                      if (!uploadedFileName) {
                        toast.error('Escolha um arquivo primeiro!');
                        return;
                      }
                      // Pre-fill creation modal with current attached file boundaries
                      setIsUploadOpen(false);
                      setIsCreateOpen(true);
                      setFormName(uploadedFileName.replace(/\.[^/.]+$/, ""));
                    }}
                    className="px-4 py-2 bg-[#1B3A2D] text-white text-xs font-bold rounded-lg hover:bg-emerald-800"
                  >
                    Seguir para Cadastro
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 9. MODAL FOR INTEGRATED TRAINING PLAYER (ACADEMY COURSE FLUX) */}
      <AnimatePresence>
        {activeTraining && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" id="course-modal-backdrop">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-white rounded-xl border border-slate-250 shadow-2xl w-full max-w-3xl overflow-hidden"
              id="course-modal-container"
            >
              
              {/* Header */}
              <div className="bg-indigo-600 text-white px-6 py-4 flex items-center justify-between" id="course-header">
                <div className="space-y-0.5 text-left">
                  <span className="text-[9px] font-extrabold tracking-widest bg-white/25 px-2 py-0.5 rounded uppercase font-sans">PestFlow Academy</span>
                  <h3 className="font-extrabold text-white text-base leading-tight mt-1">{activeTraining.title}</h3>
                </div>
                <button onClick={() => setActiveTraining(null)} className="p-1 hover:bg-white/10 rounded-lg text-red-100 transition cursor-pointer">
                  <X className="size-5" />
                </button>
              </div>

              {/* Main Content Area */}
              <div className="p-6 md:p-8 min-h-[350px] text-slate-800 font-sans" id="course-room-main-board">
                
                {isQuizMode ? (
                  /* QUIZ VALIDATION CERTIFICATE SCREEN */
                  <div className="space-y-6 text-left" id="course-quiz-flow">
                    <div id="quiz-intro-row">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1"><Award className="size-4" /> Certificação de Capacitação Técnica</span>
                      <h4 className="text-base font-extrabold text-slate-800 mt-1">Gabarito de Verificação Técnica Sanitária</h4>
                      <p className="text-xs text-slate-400 font-semibold leading-relaxed mt-0.5">Responda corretamente as questões abaixo para obter o seu certificado de capacitação técnica.</p>
                    </div>

                    {showQuizResult ? (
                      /* SIMULATED WRITTEN CERTIFICATE PREVIEW */
                      <div className="space-y-6 text-center" id="quiz-results-screen">
                        {(() => {
                          let correctCount = 0;
                          activeTraining.quiz.forEach((q, qIdx) => {
                            if (quizAnswers[qIdx] === q.correctIndex) correctCount++;
                          });
                          const isPassed = correctCount === activeTraining.quiz.length;

                          return (
                            <div className="space-y-5" id="certifications-outcome-wrapper">
                              {isPassed ? (
                                <div className="space-y-4" id="success-certificated-box">
                                  <div className="inline-flex p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full animate-bounce">
                                    <Award className="size-10" />
                                  </div>
                                  <div className="space-y-1 max-w-md mx-auto">
                                    <h4 className="text-base font-black text-slate-800 uppercase tracking-wide">Parabéns! Técnica Homologada</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed font-semibold">Você acertou {correctCount} de {activeTraining.quiz.length} perguntas e obteve 100% de aproveitamento!</p>
                                  </div>

                                  {/* Beautiful classical layout certificate frame */}
                                  <div className="p-6 bg-slate-50 border-4 border-double border-indigo-700/30 rounded-xl space-y-4 text-center max-w-lg mx-auto relative overflow-hidden" id="classical-laudo-frame">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl pointer-events-none" />
                                    
                                    <span className="text-[10px] tracking-widest text-[#1b3a2d] font-bold uppercase block">LAUDO DE HABILITAÇÃO SANITÁRIA</span>
                                    <span className="text-[11px] italic font-sans block text-slate-400 leading-none">Certificamos para os devidos fins que</span>
                                    
                                    <input 
                                      type="text" 
                                      value={certifiedName}
                                      onChange={(e) => setCertifiedName(e.target.value)}
                                      placeholder="Digite seu Nome de Operador Completo..."
                                      className="border-b-2 border-indigo-200 focus:border-indigo-600 outline-none text-center h-10 w-full max-w-sm text-sm font-extrabold text-slate-800 bg-transparent placeholder:text-slate-350"
                                    />

                                    <p className="text-[11px] text-slate-500 max-w-md mx-auto font-medium leading-relaxed">
                                      concluiu com êxito as diretrizes operacionais de 
                                      <strong className="text-slate-800 block mt-0.5">{activeTraining.title} ({activeTraining.duration})</strong>
                                    </p>

                                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-sans border-t border-slate-200 pt-3">
                                      <span>Token: #{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                                      <span>PestFlow - {new Date().toLocaleDateString('pt-BR')}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={downloadSimulatedCertificate}
                                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                                    >
                                      Download Certificado
                                    </button>
                                    <button
                                      onClick={() => setActiveTraining(null)}
                                      className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-lg"
                                    >
                                      Fechar Curso
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4 max-w-md mx-auto" id="failure-certificated-box">
                                  <div className="inline-flex p-4 bg-red-50 text-red-600 rounded-full">
                                    <AlertTriangle className="size-8" />
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-sm font-black text-slate-800 uppercase tracking-wider">Aproveitamento Insuficiente</h4>
                                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                                      Você respondeu {correctCount} de {activeTraining.quiz.length} questões corretamente. Necessário acerto técnico integral (100%) para emissão do certificado sanitário.
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-center gap-2">
                                    <button
                                      onClick={() => {
                                        setQuizAnswers([]);
                                        setShowQuizResult(false);
                                      }}
                                      className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-lg"
                                    >
                                      Tentar Novamente
                                    </button>
                                    <button
                                      onClick={() => setActiveTraining(null)}
                                      className="px-4 py-2 border text-slate-650 text-xs rounded-lg"
                                    >
                                      Sair
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </div>
                    ) : (
                      /* ACTIVE QUIZ QUESTION PANEL */
                      <div className="space-y-6" id="quiz-question-list">
                        {activeTraining.quiz.map((q, qIdx) => {
                          const userSelected = quizAnswers[qIdx];
                          return (
                            <div key={qIdx} className="space-y-2.5 p-4 bg-slate-50 rounded-xl border border-slate-200/60" id={`quiz-block-${qIdx}`}>
                              <span className="text-[10px] text-slate-400 font-sans font-extrabold block">Questão #0{qIdx + 1} de {activeTraining.quiz.length}</span>
                              <h5 className="font-extrabold text-slate-800 text-xs leading-relaxed">{q.question}</h5>
                              <div className="grid grid-cols-1 gap-2 mt-2">
                                {q.options.map((opt, oIdx) => {
                                  const isSelected = userSelected === oIdx;
                                  return (
                                    <button
                                      key={oIdx}
                                      onClick={() => handleSelectQuizAnswer(qIdx, oIdx)}
                                      className={`p-3 text-left text-xs font-semibold rounded-lg border transition-all ${
                                        isSelected 
                                          ? 'bg-indigo-50 border-indigo-400 text-indigo-900 shadow-xs' 
                                          : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-50'
                                      }`}
                                    >
                                      <span className="flex items-center gap-2">
                                        <span className={`size-1.5 rounded-full ${isSelected ? 'bg-indigo-600' : 'bg-slate-350'}`} />
                                        {opt}
                                      </span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                          <button
                            onClick={() => setIsQuizMode(false)}
                            className="text-slate-500 hover:text-slate-800 text-xs font-bold"
                          >
                            Voltar para o Material
                          </button>
                          <button
                            onClick={submitTrainingQuiz}
                            className="px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-lg"
                          >
                            Finalizar e Corrigir Questões
                          </button>
                        </div>
                      </div>
                    )}

                  </div>
                ) : (
                  /* CLASS SLIDES DECK MATERIAL VIEW */
                  <div className="space-y-6 text-left" id="slides-deck-material-player">
                    <div>
                      <span className="text-[10px] font-extrabold tracking-wider text-indigo-600 font-sans uppercase">Leitura do Material</span>
                      <h4 className="text-sm font-extrabold text-slate-800 mt-0.5">Módulo de Leitura: Slides {courseSlideIdx + 1} de {activeTraining.slides.length}</h4>
                      <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 transition-all duration-300"
                          style={{ width: `${((courseSlideIdx + 1)/activeTraining.slides.length)*100}%` }}
                        />
                      </div>
                    </div>

                    {/* Active dynamic visual slide card layout */}
                    <div className="p-8 md:p-11 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-inner flex items-center justify-center min-h-[190px] relative overflow-hidden" id="active-slide-sandbox">
                      <div className="absolute right-0 top-0 w-44 h-44 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
                      <p className="text-sm md:text-base font-medium text-slate-100 leading-relaxed font-sans max-w-xl text-center">
                        {activeTraining.slides[courseSlideIdx]}
                      </p>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-100 pt-4" id="slides-action-buttons">
                      <button
                        disabled={courseSlideIdx === 0}
                        onClick={() => setCourseSlideIdx(prev => prev - 1)}
                        className={`px-4 py-2 border text-xs font-semibold rounded-lg transition ${courseSlideIdx === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-50'}`}
                      >
                        Slide Anterior
                      </button>
                      <button
                        onClick={handleNextSlide}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg"
                      >
                        {courseSlideIdx === activeTraining.slides.length - 1 ? 'Iniciar Exame Técnico' : 'Próximo Slide'}
                      </button>
                    </div>
                  </div>
                )}

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
