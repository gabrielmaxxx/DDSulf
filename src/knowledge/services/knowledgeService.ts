import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  query, 
  where,
  increment
} from 'firebase/firestore';
import { db } from '@/firebase/config';
import { 
  KnowledgeArticle, 
  Procedure, 
  LearningPath, 
  UserLearningProgress, 
  DocApproval, 
  DocumentVersion, 
  KnowledgeAnalytics, 
  ProcedureExecutionLog, 
  GovernanceConfig 
} from '../types';

// Standard storage keys for offline resilient localStorage fallback
const STORAGE_KEYS = {
  articles: 'ddsulf_offline_articles',
  procedures: 'ddsulf_offline_procedures',
  learningPaths: 'ddsulf_offline_learning_paths',
  learningProgress: 'ddsulf_offline_learning_progress',
  approvals: 'ddsulf_offline_approvals',
  versions: 'ddsulf_offline_versions',
  analytics: 'ddsulf_offline_analytics',
  executions: 'ddsulf_offline_executions',
  governance: 'ddsulf_offline_governance'
};

/**
 * DEFAULT INITIAL SEED DATA FOR DDSULF ORGANIZATIONAL INTELLIGENCE
 */
const SEED_ARTICLES: KnowledgeArticle[] = [
  {
    id: 'art_1',
    tenantId: 'default_tenant',
    title: 'RDC ANVISA nº 52/2014 — Diretrizes de Funcionamento de Empresas de Controle de Pragas',
    content: `# RDC ANVISA nº 52/2014: Boas Práticas Operacionais

Esta RDC estabelece o regulamento técnico para o funcionamento das empresas prestadoras de serviço de controle de vetores e pragas urbanas.

## Pontos Críticos de Compliance:
1. **Responsabilidade Técnica:** Toda empresa habilitada deve ter um profissional devidamente registrado no conselho de classe como Responsável Técnico (RT).
2. **Armazenamento Seguro:** Domissanitários devem ser mantidos em locais ventilados, com acesso controlado por chave e sinalização tóxica ativa.
3. **Equipamento de Proteção:** É infração gravíssima realizar pulverização sem uso completo de respiradores com filtros de carvão ativo e vestimentas hidrorrepelentes.
4. **Descarte de Embalagens:** Obrigatório o registro formal de tríplice lavagem antes da devolução das bombonas de praguicidas aos postos de coleta regulamentados.`,
    category: 'regulatory',
    tags: ['Anvisa', 'Compliance', 'Segurança', 'RDC52'],
    authorId: 'user_rt_1',
    authorName: 'Dr. Lucas Silveira (RT)',
    createdAt: Date.now() - 30 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 5 * 24 * 3600 * 1000,
    viewCount: 145,
    likes: 42,
    isPublished: true,
    version: 3,
    relatedArticleIds: ['art_3'],
    relatedProcedureIds: ['proc_1']
  },
  {
    id: 'art_2',
    tenantId: 'default_tenant',
    title: 'Manejo Integrado de Pragas (MIP): Bases Ecológicas e Aplicação Preventiva',
    content: `# Manejo Integrado de Pragas (MIP)

O MIP visa manter as populações de pragas abaixo do nível de dano econômico e sanitário utilizando todas as técnicas disponíveis de forma inteligente e integrada.

## Pilares Fundamentais:
* **Identificação Georreferenciada:** Classificar corretamente a espécie infestante antes de qualquer ação química.
* **Diagnóstico de Barreiras:** Avaliar falhas estruturais, acúmulo de insumos orgânicos, ralos inadequados e infiltrações de umidade.
* **Controle Físico-Mecânico:** Instalação de telas, vedadores de porta, armadilhas luminosas e placas adesivas.
* **Controle Químico Limitador:** A aplicação química sistemática e reativa deve ser usada apenas como último recurso corretivo.`,
    category: 'operational',
    tags: ['MIP', 'Boas Práticas', 'Prevenção', 'Sustentabilidade'],
    authorId: 'user_rt_1',
    authorName: 'Dr. Lucas Silveira (RT)',
    createdAt: Date.now() - 60 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 10 * 24 * 3600 * 1000,
    viewCount: 98,
    likes: 29,
    isPublished: true,
    version: 1,
    relatedArticleIds: ['art_1'],
    relatedProcedureIds: ['proc_2']
  },
  {
    id: 'art_3',
    tenantId: 'default_tenant',
    title: 'Ficha de toxicologia e emergência médica: Piretróides e Organofosforados',
    content: `# Toxicologia em Campo e Primeiros Socorros

Guia indispensável de primeiros socorros em caso de contato dérmico ou inalação excessiva de domissanitários ativos.

## Ação Rápida de Resgate:
1. **Contaminação Ocular:** Enxaguar abundantemente com soro fisiológico ou água limpa corrente por no mínimo 15 minutos em jato contínuo sem esfregar.
2. **Inalação:** Remover a vítima para local arejado, desabotoar vestimenta hidrorrepelente e monitorar respiração.
3. **Ingestão:** **Não provocar vômito**. Consultar imediatamente o CIT (Centro de Informação Toxicológica) pelo telefone \`0800-721-3000\`.
4. **Antídoto Organofosforados:** Sulfato de Atropina administrado estritamente em ambiente hospitalar de emergência.`,
    category: 'chemical',
    tags: ['Segurança', 'EPI', 'Toxicologia', 'Emergência'],
    authorId: 'user_rt_1',
    authorName: 'Dr. Lucas Silveira (RT)',
    createdAt: Date.now() - 15 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 15 * 24 * 3600 * 1000,
    viewCount: 210,
    likes: 67,
    isPublished: true,
    version: 2,
    relatedArticleIds: ['art_1'],
    relatedProcedureIds: []
  }
];

const SEED_PROCEDURES: Procedure[] = [
  {
    id: 'proc_1',
    tenantId: 'default_tenant',
    title: 'POP-01: Barreira Química Sistêmica em Tubulações e Ralos Sanitários',
    description: 'Procedimento Operacional Padrão obrigatório para controle preventivo de baratas, aranhas e escorpiões em áreas logísticas e industriais utilizando bicos de injeção radial.',
    category: 'safety',
    version: 2,
    targetPests: ['Blattella germanica', 'Periplaneta americana', 'Loxosceles reclusa', 'Tityus serrulatus'],
    allowedChemicalIds: ['chem_cipermetrina_premium', 'chem_deltametrina_spray'],
    recommendedChemicalVolume: '0.5 L de calda por metro quadrado linear de tubulação',
    createdBy: 'user_rt_1',
    createdByName: 'Dr. Lucas Silveira (RT)',
    createdAt: Date.now() - 40 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 2 * 24 * 3600 * 1000,
    isPublished: true,
    viewCount: 180,
    averageExecutionTimeSeconds: 420,
    requiredEPIs: {
      hasMask: true,
      hasGloves: true,
      hasGoggles: true,
      hasBoots: true,
      hasApron: true,
      extraArmorText: 'Protetor facial panorâmico extra e macacão de pernas Tyvek Nível 4'
    },
    steps: [
      {
        id: 'step_1_1',
        sequence: 1,
        title: 'Inspeção Prvia e Isolamento Físico',
        description: 'Verificar se não há pessoas desprotegidas em um raio de 10 metros. Colocar fita zebrada de advertência e recolher alimentos abertos ou bebedouros.',
        isRequired: true,
        requiresPhotoProof: true
      },
      {
        id: 'step_1_2',
        sequence: 2,
        title: 'Verificao de PPE & Selamentos de Canos',
        description: 'Vestir máscara respiratória com filtro químico carbônico, testar o selo no rosto e fixar as braçadeiras de vedação das botas hidrorrepelentes.',
        isRequired: true,
        requiresPhotoProof: false
      },
      {
        id: 'step_1_3',
        sequence: 3,
        title: 'Calibrao da Calda no Atomizador',
        description: 'Adicionar dosagem recomendada conforme taxa descrita de defensivo. Verificar ausência de vazamento nas conexões flexíveis sob pressão de 40 PSI.',
        isRequired: true,
        requiresPhotoProof: true,
        chemicalAdjustmentRequired: true
      },
      {
        id: 'step_1_4',
        sequence: 4,
        title: 'Injetamento Radial e Nebulizao',
        description: 'Introduzir o bico de aplicação radial na profundidade adequada, injetar a calda de maneira lenta e contínua movimentando-se de trás para frente.',
        isRequired: true,
        requiresPhotoProof: false,
        estimatedDurationSeconds: 120
      },
      {
        id: 'step_1_5',
        sequence: 5,
        title: 'Registro e Baixa no Selo Anvisa',
        description: 'Aplicar etiqueta adesiva de controle de higienização ddsulf com código QR colado na tampa metálica do ralo e descarte correto de resíduos do tanque.',
        isRequired: true,
        requiresPhotoProof: true
      }
    ]
  },
  {
    id: 'proc_2',
    tenantId: 'default_tenant',
    title: 'POP-02: Termonebulização em Galpões de Armazenamento de Grãos',
    description: 'Instruções oficiais para controle sistemático de carunchos e traças de cereais em silos industriais por meio de fog térmico.',
    category: 'operational',
    version: 1,
    targetPests: ['Sitophilus oryzae', 'Ephestia kuehniella'],
    allowedChemicalIds: ['chem_fipronil_sc', 'chem_cipermetrina_premium'],
    recommendedChemicalVolume: '2 L por 1000 metros cúbicos de ar circulante',
    createdBy: 'user_rt_1',
    createdByName: 'Dr. Lucas Silveira (RT)',
    createdAt: Date.now() - 20 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 20 * 24 * 3600 * 1000,
    isPublished: true,
    viewCount: 76,
    averageExecutionTimeSeconds: 900,
    requiredEPIs: {
      hasMask: true,
      hasGloves: true,
      hasGoggles: true,
      hasBoots: true,
      hasApron: false,
      extraArmorText: 'Autônomo com respirador autossuficiente de oxigênio sob demanda'
    },
    steps: [
      {
        id: 'step_2_1',
        sequence: 1,
        title: 'Vedao Hermtica Total',
        description: 'Lacre completo de respiros, janelas elevadas e portões de carga utilizando lona plástica espessa e fita adesiva de alta tração.',
        isRequired: true,
        requiresPhotoProof: true
      },
      {
        id: 'step_2_2',
        sequence: 2,
        title: 'Pr-Aquecimento da Caldeira Pulsatria',
        description: 'Acionar a câmara de combustão do termonebulizador térmico por 2 minutos para atingir a temperatura operacional recomendada de 450ºC.',
        isRequired: true,
        requiresPhotoProof: false
      },
      {
        id: 'step_2_3',
        sequence: 3,
        title: 'Aplicao Operacional com Passos Traseiros',
        description: 'Iniciar a projeção de névoa de fundo para o portão de saída, recuando gradativamente sem respirar nos vapores gerados pela névoa suspensa.',
        isRequired: true,
        requiresPhotoProof: true,
        estimatedDurationSeconds: 400
      }
    ]
  }
];

const SEED_LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path_1',
    tenantId: 'default_tenant',
    title: 'Onboarding Operacional para Técnicos DDSulf — Segurança & Regulamento',
    description: 'Seja bem-vindo à DDSulf. Este programa acelerado instrui e habilita tecnicamente o novo operador sanitário sobre normas de segurança de trabalho e boas práticas estabelecidas pela Anvisa.',
    category: 'onboarding',
    rewardXP: 500,
    isPublished: true,
    createdAt: Date.now() - 15 * 24 * 3600 * 1000,
    updatedAt: Date.now() - 15 * 24 * 3600 * 1000,
    steps: [
      {
        id: 'lstep_1_1',
        title: 'Introdução às Boas Práticas',
        description: 'Estudo do artigo regulatório correspondente à norma nacional RDC ANVISA 52/2014.',
        estimatedMinutes: 10,
        type: 'article',
        targetId: 'art_1'
      },
      {
        id: 'lstep_1_2',
        title: 'Manejo de Barreira Química Rápida',
        description: 'Domínio do Procedimento Operacional Padrão número 1 (POP-01).',
        estimatedMinutes: 15,
        type: 'procedure',
        targetId: 'proc_1'
      },
      {
        id: 'lstep_1_3',
        title: 'Pronto Socorro Toxicológico',
        description: 'Conhecimento prioritário de reações a praguicidas e antídotos necessários.',
        estimatedMinutes: 8,
        type: 'article',
        targetId: 'art_3'
      },
      {
        id: 'lstep_1_4',
        title: 'Avaliação de Capacitação e Fixação de Risco',
        description: 'Questionário técnico para legitimar a certificação teórica do operador.',
        estimatedMinutes: 10,
        type: 'quiz',
        targetId: 'path_1_quiz'
      }
    ],
    quizzes: [
      {
        questionId: 'q1',
        questionText: 'Qual o profissional exigido por lei segundo o regramento Anvisa RDC 52 para supervisionar as caldas químicas?',
        options: [
          'Qualquer técnico com mais de 5 anos de experiência prática',
          'Um Responsável Técnico (RT) registrado formalmente em conselho de classe habilitado',
          'O encarregado administrativo do almoxarifado químico central',
          'O motorista com CNH classe C habilitado'
        ],
        correctOptionIndex: 1
      },
      {
        questionId: 'q2',
        questionText: 'Qual a conduta adequada indicada ao sofrer pulverizações acidentais nos olhos?',
        options: [
          'Esfregar vigorosamente e tampar com bandagem de algodão compressivo',
          'Não lavar e procurar farmácia para ministrar colírio anestésico',
          'Lavar imediatamente com água corrente limpa ou soro fisiológico por pelo menos 15 minutos em fluxo suave contínuo',
          'Ignorar e completar o POP-01 para evitar perda de calda'
        ],
        correctOptionIndex: 2
      }
    ]
  }
];

const DEFAULT_GOVERNANCE: GovernanceConfig = {
  requireDoubleApprovalForCriticalChemicals: true,
  minimumReviewPeriodDays: 3,
  allowOfflineExecution: true,
  defaultOnboardingTrackIds: ['path_1'],
  mandatedEPICloseouts: true
};

/**
 * Consolidates all services under a powerful centralized controller:
 * - Handles Firestore collections with perfect error recovery
 * - Saves progress, approvals, revisions, history, and metrics
 */
export class DDSulfKnowledgeService {
  private static instance: DDSulfKnowledgeService;
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.isOnline = true);
      window.addEventListener('offline', () => this.isOnline = false);
    }
  }

  public static getInstance(): DDSulfKnowledgeService {
    if (!DDSulfKnowledgeService.instance) {
      DDSulfKnowledgeService.instance = new DDSulfKnowledgeService();
    }
    return DDSulfKnowledgeService.instance;
  }

  // Helper helper to support offline resiliency
  private getLocalCache<T>(key: string): T[] {
    if (typeof window === 'undefined') return [];
    try {
      const serialized = localStorage.getItem(key);
      return serialized ? JSON.parse(serialized) : [];
    } catch (e) {
      console.error(`Error reading local storage cache line for ${key}:`, e);
      return [];
    }
  }

  private setLocalCache<T>(key: string, data: T[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error(`Failed to record local storage cache for ${key}:`, e);
    }
  }

  /* ==========================================
   * 1. KNOWLEDGE ARTICLES SERVICE
   * ========================================== */
  public async getArticles(): Promise<KnowledgeArticle[]> {
    try {
      const q = query(collection(db, 'ddsulf_knowledge_articles'));
      const querySnapshot = await getDocs(q);
      const docsArr: KnowledgeArticle[] = [];
      querySnapshot.forEach((docSnap) => {
        docsArr.push({ id: docSnap.id, ...docSnap.data() } as KnowledgeArticle);
      });
      
      // Seed fallback if Firestore collection returns empty
      if (docsArr.length === 0) {
        // Return seeded fallback
        this.setLocalCache(STORAGE_KEYS.articles, SEED_ARTICLES);
        return SEED_ARTICLES;
      }
      this.setLocalCache(STORAGE_KEYS.articles, docsArr);
      return docsArr;
    } catch (error) {
      console.warn('Firestore articles retrieval failed, reverting to local offline storage:', error);
      const cached = this.getLocalCache<KnowledgeArticle>(STORAGE_KEYS.articles);
      if (cached.length === 0) {
        this.setLocalCache(STORAGE_KEYS.articles, SEED_ARTICLES);
        return SEED_ARTICLES;
      }
      return cached;
    }
  }

  public async createArticle(article: Omit<KnowledgeArticle, 'id' | 'createdAt' | 'updatedAt' | 'viewCount' | 'likes'>): Promise<KnowledgeArticle> {
    const newArticle: KnowledgeArticle = {
      ...article,
      id: 'art_' + Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewCount: 0,
      likes: 0
    };

    try {
      await setDoc(doc(db, 'ddsulf_knowledge_articles', newArticle.id), newArticle);
    } catch (e) {
      console.warn('Failed to upload article to Firestore, writing in offline sandbox queue:', e);
    }

    // Always update local cache for offline-first resilience
    const current = await this.getArticles();
    this.setLocalCache(STORAGE_KEYS.articles, [...current, newArticle]);
    return newArticle;
  }

  public async incrementArticleView(id: string): Promise<void> {
    try {
      const articleRef = doc(db, 'ddsulf_knowledge_articles', id);
      await updateDoc(articleRef, {
        viewCount: increment(1)
      });
    } catch (e) {
      console.warn('View count increment failed or was offline:', id);
    }

    const current = this.getLocalCache<KnowledgeArticle>(STORAGE_KEYS.articles);
    const updated = current.map(item => item.id === id ? { ...item, viewCount: item.viewCount + 1 } : item);
    this.setLocalCache(STORAGE_KEYS.articles, updated);
  }

  public async toggleLikeArticle(id: string): Promise<number> {
    const current = this.getLocalCache<KnowledgeArticle>(STORAGE_KEYS.articles);
    let newLikes = 0;
    const updated = current.map(item => {
      if (item.id === id) {
        newLikes = item.likes + 1;
        return { ...item, likes: newLikes };
      }
      return item;
    });

    try {
      const articleRef = doc(db, 'ddsulf_knowledge_articles', id);
      await updateDoc(articleRef, {
        likes: increment(1)
      });
    } catch (e) {
      console.warn('Like save error or offline state. Offline cache remains up to date:', e);
    }

    this.setLocalCache(STORAGE_KEYS.articles, updated);
    return newLikes;
  }

  /* ==========================================
   * 2. PROCEDURE SYSTEM SERVICE (POPs)
   * ========================================== */
  public async getProcedures(): Promise<Procedure[]> {
    try {
      const q = query(collection(db, 'ddsulf_procedures'));
      const querySnapshot = await getDocs(q);
      const docsArr: Procedure[] = [];
      querySnapshot.forEach((docSnap) => {
        docsArr.push({ id: docSnap.id, ...docSnap.data() } as Procedure);
      });
      
      if (docsArr.length === 0) {
        this.setLocalCache(STORAGE_KEYS.procedures, SEED_PROCEDURES);
        return SEED_PROCEDURES;
      }
      this.setLocalCache(STORAGE_KEYS.procedures, docsArr);
      return docsArr;
    } catch (error) {
      console.warn('Firestore procedures retrieval error, reading offline procedural queue:', error);
      const cached = this.getLocalCache<Procedure>(STORAGE_KEYS.procedures);
      if (cached.length === 0) {
        this.setLocalCache(STORAGE_KEYS.procedures, SEED_PROCEDURES);
        return SEED_PROCEDURES;
      }
      return cached;
    }
  }

  public async createProcedure(proc: Omit<Procedure, 'id' | 'createdAt' | 'updatedAt' | 'viewCount'>): Promise<Procedure> {
    const newProc: Procedure = {
      ...proc,
      id: 'proc_' + Math.random().toString(36).substring(2, 9),
      createdAt: Date.now(),
      updatedAt: Date.now(),
      viewCount: 0
    };

    try {
      await setDoc(doc(db, 'ddsulf_procedures', newProc.id), newProc);
    } catch (e) {
      console.warn('Failed to upload procedure POP to remote storage, caching locally:', e);
    }

    const current = await this.getProcedures();
    this.setLocalCache(STORAGE_KEYS.procedures, [...current, newProc]);
    return newProc;
  }

  /* ==========================================
   * 3. LEARNING ORCHESTRATION SERVICE
   * ========================================== */
  public async getLearningPaths(): Promise<LearningPath[]> {
    try {
      const q = query(collection(db, 'ddsulf_learning_paths'));
      const querySnapshot = await getDocs(q);
      const docsArr: LearningPath[] = [];
      querySnapshot.forEach((docSnap) => {
        docsArr.push({ id: docSnap.id, ...docSnap.data() } as LearningPath);
      });
      
      if (docsArr.length === 0) {
        this.setLocalCache(STORAGE_KEYS.learningPaths, SEED_LEARNING_PATHS);
        return SEED_LEARNING_PATHS;
      }
      this.setLocalCache(STORAGE_KEYS.learningPaths, docsArr);
      return docsArr;
    } catch (error) {
      console.warn('Learning paths load exception, pulling offline courses:', error);
      const cached = this.getLocalCache<LearningPath>(STORAGE_KEYS.learningPaths);
      if (cached.length === 0) {
        this.setLocalCache(STORAGE_KEYS.learningPaths, SEED_LEARNING_PATHS);
        return SEED_LEARNING_PATHS;
      }
      return cached;
    }
  }

  public async getLearningProgress(userId: string): Promise<UserLearningProgress[]> {
    try {
      const q = query(collection(db, 'ddsulf_learning_progress'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const docsArr: UserLearningProgress[] = [];
      querySnapshot.forEach((docSnap) => {
        docsArr.push({ id: docSnap.id, ...docSnap.data() } as UserLearningProgress);
      });
      
      this.setLocalCache(STORAGE_KEYS.learningProgress, docsArr);
      return docsArr;
    } catch (error) {
      console.warn('User progress error loading from remote db, getting client caches:', error);
      return this.getLocalCache<UserLearningProgress>(STORAGE_KEYS.learningProgress);
    }
  }

  public async updateLearningStepCompletion(userId: string, pathId: string, stepId: string, isCompleted: boolean): Promise<UserLearningProgress> {
    const allProgressList = this.getLocalCache<UserLearningProgress>(STORAGE_KEYS.learningProgress);
    let matchedProgress = allProgressList.find(prog => prog.userId === userId && prog.pathId === pathId);
    
    if (!matchedProgress) {
      // Build a fresh progress tracker for first timer
      matchedProgress = {
        id: 'prog_' + Math.random().toString(36).substring(2, 9),
        userId,
        userName: 'Técnico Autenticado',
        tenantId: 'default_tenant',
        pathId,
        completedStepIds: [],
        quizScores: {},
        isCompleted: false,
        startedAt: Date.now(),
        totalXPPremium: 0
      };
      allProgressList.push(matchedProgress);
    }

    if (isCompleted) {
      if (!matchedProgress.completedStepIds.includes(stepId)) {
        matchedProgress.completedStepIds = [...matchedProgress.completedStepIds, stepId];
      }
    } else {
      matchedProgress.completedStepIds = matchedProgress.completedStepIds.filter(id => id !== stepId);
    }

    // Verify if path is completed
    const paths = await this.getLearningPaths();
    const targetedPath = paths.find(p => p.id === pathId);
    if (targetedPath) {
      const designStepCount = targetedPath.steps.length;
      if (matchedProgress.completedStepIds.length >= designStepCount) {
        matchedProgress.isCompleted = true;
        matchedProgress.completedAt = Date.now();
        matchedProgress.totalXPPremium = targetedPath.rewardXP;
      }
    }

    try {
      await setDoc(doc(db, 'ddsulf_learning_progress', matchedProgress.id), matchedProgress);
    } catch (e) {
      console.warn('Failed to upload progress step update, saved in offline buffer:', e);
    }

    this.setLocalCache(STORAGE_KEYS.learningProgress, allProgressList);
    return matchedProgress;
  }

  public async submitQuizResult(userId: string, pathId: string, quizId: string, score: number): Promise<UserLearningProgress> {
    const allProgressList = this.getLocalCache<UserLearningProgress>(STORAGE_KEYS.learningProgress);
    let matchedProgress = allProgressList.find(prog => prog.userId === userId && prog.pathId === pathId);
    
    if (!matchedProgress) {
      matchedProgress = {
        id: 'prog_' + Math.random().toString(36).substring(2, 9),
        userId,
        userName: 'Técnico Autenticado',
        tenantId: 'default_tenant',
        pathId,
        completedStepIds: [],
        quizScores: {},
        isCompleted: false,
        startedAt: Date.now(),
        totalXPPremium: 0
      };
      allProgressList.push(matchedProgress);
    }

    matchedProgress.quizScores = {
      ...matchedProgress.quizScores,
      [quizId]: score
    };

    // Auto complete quiz step for progress logic
    const paths = await this.getLearningPaths();
    const targetedPath = paths.find(p => p.id === pathId);
    const quizStep = targetedPath?.steps.find(s => s.type === 'quiz');
    if (quizStep && !matchedProgress.completedStepIds.includes(quizStep.id)) {
      matchedProgress.completedStepIds = [...matchedProgress.completedStepIds, quizStep.id];
    }

    if (targetedPath && matchedProgress.completedStepIds.length >= targetedPath.steps.length) {
      matchedProgress.isCompleted = true;
      matchedProgress.completedAt = Date.now();
      matchedProgress.totalXPPremium = targetedPath.rewardXP;
    }

    try {
      await setDoc(doc(db, 'ddsulf_learning_progress', matchedProgress.id), matchedProgress);
    } catch (e) {
      console.warn('Quiz score upload error, updating inside offline state:', e);
    }

    this.setLocalCache(STORAGE_KEYS.learningProgress, allProgressList);
    return matchedProgress;
  }

  /* ==========================================
   * 4. DOCUMENT REVISIONS & VERSIONING SERVICE
   * ========================================== */
  public async getVersions(documentId: string): Promise<DocumentVersion[]> {
    try {
      const q = query(collection(db, 'ddsulf_document_versions'), where('documentId', '==', documentId));
      const querySnapshot = await getDocs(q);
      const docsArr: DocumentVersion[] = [];
      querySnapshot.forEach((docSnap) => {
        docsArr.push({ id: docSnap.id, ...docSnap.data() } as DocumentVersion);
      });
      docsArr.sort((a, b) => b.version - a.version);
      
      this.setLocalCache(STORAGE_KEYS.versions, docsArr);
      return docsArr;
    } catch (error) {
      console.warn('Doc versions pull error, fetching document timelines offline:', error);
      return this.getLocalCache<DocumentVersion>(STORAGE_KEYS.versions).filter(v => v.documentId === documentId);
    }
  }

  public async logDocumentVersion(versionBlock: Omit<DocumentVersion, 'id' | 'timestamp'>): Promise<DocumentVersion> {
    const completeBlock: DocumentVersion = {
      ...versionBlock,
      id: 'diff_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    };

    try {
      await setDoc(doc(db, 'ddsulf_document_versions', completeBlock.id), completeBlock);
    } catch (e) {
      console.warn('Fallen out of remote doc revisions logger, continuing offline:', e);
    }

    const currentLocal = this.getLocalCache<DocumentVersion>(STORAGE_KEYS.versions);
    this.setLocalCache(STORAGE_KEYS.versions, [completeBlock, ...currentLocal]);
    return completeBlock;
  }

  /* ==========================================
   * 5. DOCUMENT APPROVALS WORKFLOW
   * ========================================== */
  public async getPendingApprovals(): Promise<DocApproval[]> {
    try {
      const q = query(collection(db, 'ddsulf_approvals'), where('status', '==', 'pending'));
      const querySnapshot = await getDocs(q);
      const docsArr: DocApproval[] = [];
      querySnapshot.forEach((docSnap) => {
        docsArr.push({ id: docSnap.id, ...docSnap.data() } as DocApproval);
      });
      
      this.setLocalCache(STORAGE_KEYS.approvals, docsArr);
      return docsArr;
    } catch (error) {
      console.warn('Pending approvals list error, serving offline cache queues:', error);
      return this.getLocalCache<DocApproval>(STORAGE_KEYS.approvals);
    }
  }

  public async submitDocForApproval(approval: Omit<DocApproval, 'id' | 'status' | 'requestDate'>): Promise<DocApproval> {
    const newApproval: DocApproval = {
      ...approval,
      id: 'appr_' + Math.random().toString(36).substring(2, 9),
      status: 'pending',
      requestDate: Date.now()
    };

    try {
      await setDoc(doc(doc(db, 'ddsulf_approvals', newApproval.id), newApproval.id), newApproval);
    } catch (e) {
      console.warn('Failure logging approval requested to firestore:', e);
    }

    const current = this.getLocalCache<DocApproval>(STORAGE_KEYS.approvals);
    this.setLocalCache(STORAGE_KEYS.approvals, [newApproval, ...current]);
    return newApproval;
  }

  public async reviewDocProposed(approvalId: string, status: 'approved' | 'rejected', reviewerName: string, feedbackText?: string): Promise<DocApproval | null> {
    const list = this.getLocalCache<DocApproval>(STORAGE_KEYS.approvals);
    const item = list.find(item => item.id === approvalId);
    
    if (!item) return null;

    item.status = status;
    item.reviewedByName = reviewerName;
    item.reviewedAt = Date.now();
    item.feedback = feedbackText;

    // If approved, dynamically update the targeted article or procedure
    if (status === 'approved') {
      try {
        const payload = JSON.parse(item.proposedContentJSON);
        if (item.documentType === 'article') {
          const artRef = doc(db, 'ddsulf_knowledge_articles', item.documentId);
          await updateDoc(artRef, {
            ...payload,
            updatedAt: Date.now(),
            version: increment(1)
          });

          // Log complete block with incremental versions
          const currentArts = this.getLocalCache<KnowledgeArticle>(STORAGE_KEYS.articles);
          const relatedArt = currentArts.find(a => a.id === item.documentId);
          if (relatedArt) {
            await this.logDocumentVersion({
              documentId: item.documentId,
              type: 'article',
              version: relatedArt.version + 1,
              changesSummary: `Aprovação de Edital técnica: ${feedbackText || 'Alterações gerais'}`,
              authorId: item.authorId,
              authorName: item.authorName,
              contentBackup: payload.content || relatedArt.content
            });
          }
        } else {
          const procRef = doc(db, 'ddsulf_procedures', item.documentId);
          await updateDoc(procRef, {
            ...payload,
            updatedAt: Date.now(),
            version: increment(1)
          });

          const currentProcs = this.getLocalCache<Procedure>(STORAGE_KEYS.procedures);
          const relatedProc = currentProcs.find(p => p.id === item.documentId);
          if (relatedProc) {
            await this.logDocumentVersion({
              documentId: item.documentId,
              type: 'procedure',
              version: relatedProc.version + 1,
              changesSummary: `Revisão e homologação do POP por RT: ${reviewerName}`,
              authorId: item.authorId,
              authorName: item.authorName,
              contentBackup: JSON.stringify(payload.steps || relatedProc.steps)
            });
          }
        }
      } catch (e) {
        console.error('Exception on executing approval modifications updates:', e);
      }
    }

    try {
      const approvalDocRef = doc(db, 'ddsulf_approvals', approvalId);
      await setDoc(approvalDocRef, item);
    } catch (e) {
      console.warn('Failed syncing approval review to Firestore cloud, caching locally:', e);
    }

    const nextPending = list.filter(app => app.id !== approvalId || app.status === 'pending');
    this.setLocalCache(STORAGE_KEYS.approvals, nextPending);
    
    return item;
  }

  /* ==========================================
   * 6. KNOWLEDGE ANALYTICS & TELEMETRY
   * ========================================== */
  public async getAnalyticsMetrics(): Promise<KnowledgeAnalytics[]> {
    try {
      const q = query(collection(db, 'ddsulf_knowledge_analytics'));
      const querySnapshot = await getDocs(q);
      const metricsList: KnowledgeAnalytics[] = [];
      querySnapshot.forEach((docSnap) => {
        metricsList.push({ id: docSnap.id, ...docSnap.data() } as KnowledgeAnalytics);
      });
      this.setLocalCache(STORAGE_KEYS.analytics, metricsList);
      return metricsList;
    } catch (e) {
      console.warn('Analytics system offline, serving operational logs cache:', e);
      return this.getLocalCache<KnowledgeAnalytics>(STORAGE_KEYS.analytics);
    }
  }

  public async trackDocumentEngagement(documentId: string, type: 'article' | 'procedure', readingDurationSec: number): Promise<void> {
    const existing = this.getLocalCache<KnowledgeAnalytics>(STORAGE_KEYS.analytics);
    let matched = existing.find(an => an.documentId === documentId);
    
    if (!matched) {
      matched = {
        id: 'metric_' + Math.random().toString(36).substring(2, 9),
        tenantId: 'default_tenant',
        documentId,
        type,
        viewsCount: 1,
        averageDurationSeconds: readingDurationSec,
        activeExecutionsCount: 0,
        failedStepsCount: 0,
        lastAccessedAt: Date.now()
      };
      existing.push(matched);
    } else {
      matched.viewsCount += 1;
      matched.lastAccessedAt = Date.now();
      matched.averageDurationSeconds = Math.round((matched.averageDurationSeconds + readingDurationSec) / 2);
    }

    try {
      await setDoc(doc(db, 'ddsulf_knowledge_analytics', matched.id), matched);
    } catch (e) {
      console.warn('Offline state. Dynamic metric buffered in browser telemetry system:', e);
    }

    this.setLocalCache(STORAGE_KEYS.analytics, existing);
  }

  /* ==========================================
   * 7. ACTIVE PROCEDURE EXECUTION CONTROLLER
   * ========================================== */
  public async logProcedureExecution(execution: ProcedureExecutionLog): Promise<void> {
    try {
      await setDoc(doc(db, 'ddsulf_procedure_executions', execution.id), execution);
      
      // Update the average execution time inside the master procedure document
      if (execution.status === 'completed' && execution.durationSeconds > 0) {
        const currentProcs = this.getLocalCache<Procedure>(STORAGE_KEYS.procedures);
        const targetedProc = currentProcs.find(p => p.id === execution.procedureId);
        if (targetedProc) {
          const oldTime = targetedProc.averageExecutionTimeSeconds || 300;
          const updatedAvg = Math.round((oldTime + execution.durationSeconds) / 2);
          
          await updateDoc(doc(db, 'ddsulf_procedures', execution.procedureId), {
            averageExecutionTimeSeconds: updatedAvg
          });
        }
      }
    } catch (e) {
      console.warn('Failed uploading active POP execution logs to firestore. Caching locally for offline audits:', e);
    }

    const currentExecutions = this.getLocalCache<ProcedureExecutionLog>(STORAGE_KEYS.executions);
    this.setLocalCache(STORAGE_KEYS.executions, [execution, ...currentExecutions]);
  }

  public getProcedureExecutions(): ProcedureExecutionLog[] {
    return this.getLocalCache<ProcedureExecutionLog>(STORAGE_KEYS.executions);
  }

  /* ==========================================
   * 8. GOVERNANCE CONFIGS
   * ========================================== */
  public getGovernanceConfig(): GovernanceConfig {
    if (typeof window === 'undefined') return DEFAULT_GOVERNANCE;
    try {
      const serial = localStorage.getItem(STORAGE_KEYS.governance);
      return serial ? JSON.parse(serial) : DEFAULT_GOVERNANCE;
    } catch (e) {
      return DEFAULT_GOVERNANCE;
    }
  }

  public saveGovernanceConfig(config: GovernanceConfig) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.governance, JSON.stringify(config));
    } catch (e) {
      console.error(e);
    }
  }
}

export default DDSulfKnowledgeService;
