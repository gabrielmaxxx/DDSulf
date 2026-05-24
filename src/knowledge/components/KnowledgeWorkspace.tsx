import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Award, 
  ShieldCheck, 
  CheckSquare, 
  Camera, 
  Sparkles, 
  Clock, 
  CornerDownRight, 
  Terminal, 
  ArrowRight, 
  Search, 
  FileText, 
  Sliders, 
  Eye, 
  Heart, 
  Lock, 
  RefreshCw, 
  Play, 
  StopCircle, 
  SlidersHorizontal,
  ChevronRight,
  ThumbsUp,
  AlertCircle,
  TrendingUp,
  FolderSync,
  Building,
  Check,
  Plus,
  Trash2,
  FileCheck
} from 'lucide-react';

import { 
  useOperationalKnowledge, 
  useContextualLearning, 
  useKnowledgeSearch, 
  useProcedureExecution, 
  useKnowledgeAnalytics, 
  useLearningProgress 
} from '../hooks';
import { KnowledgeArticle, Procedure, DocumentCategory, ProcedureStep } from '../types';

export function KnowledgeWorkspace() {
  const [activeTab, setActiveTab] = useState<'articles' | 'procedures' | 'learning' | 'approvals' | 'generator' | 'analytics'>('articles');
  const [activePageContext, setActivePageContext] = useState<'dashboard' | 'chemicals' | 'stock' | 'routes' | 'finance' | 'safety' | 'pops'>('pops');

  // Hooks core
  const { 
    articles, 
    procedures, 
    pendingApprovals, 
    loading, 
    error,
    refreshKnowledge,
    viewArticle,
    likeArticle,
    createNewArticleProposal,
    requestDocumentChangeApproval,
    executeApprovalAction
  } = useOperationalKnowledge();

  const {
    recommendedArticles,
    recommendedProcedures,
    loadingContextRecommendations
  } = useContextualLearning(activePageContext);

  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedTag,
    setSelectedTag,
    availableTags,
    filteredResults
  } = useKnowledgeSearch(articles, procedures);

  const {
    paths,
    progress,
    loadingLearning,
    markStepComplete,
    sendQuizAnswers,
    refreshPaths
  } = useLearningProgress();

  const {
    metrics,
    executions,
    refreshAnalytics
  } = useKnowledgeAnalytics();

  // Selected details
  const [selectedArt, setSelectedArt] = useState<KnowledgeArticle | null>(null);
  const [selectedProc, setSelectedProc] = useState<Procedure | null>(null);

  // Active execution state tracking
  const execHook = useProcedureExecution(selectedProc);
  
  // Quiz specific states
  const [activeQuizPathId, setActiveQuizPathId] = useState<string | null>(null);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizFinished, setQuizFinished] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);

  // Auto Generator state logic
  const [genTitle, setGenTitle] = useState<string>('');
  const [genDescription, setGenDescription] = useState<string>('');
  const [genPests, setGenPests] = useState<string>('Blattella germanica, Roedores');
  const [genChemicals, setGenChemicals] = useState<string>('chem_cipermetrina, chem_fipronil');
  const [generatingAi, setGeneratingAi] = useState<boolean>(false);
  const [aiGeneratedResult, setAiGeneratedResult] = useState<any | null>(null);
  const [generativeError, setGenerativeError] = useState<string | null>(null);

  // Document change draft state
  const [isEditingArt, setIsEditingArt] = useState<boolean>(false);
  const [editedContent, setEditedContent] = useState<string>('');

  // Article reading tracker
  const [readingStartTime, setReadingStartTime] = useState<number | null>(null);

  useEffect(() => {
    if (selectedArt) {
      setReadingStartTime(Date.now());
      viewArticle(selectedArt.id);
      setIsEditingArt(false);
    } else {
      setReadingStartTime(null);
    }
  }, [selectedArt, viewArticle]);

  // Handle auto view engagement updates upon closing or switching documents
  useEffect(() => {
    return () => {
      if (readingStartTime && selectedArt) {
        const timeSpent = Math.max(1, Math.round((Date.now() - readingStartTime) / 1000));
        console.log(`Leitura gravada para ${selectedArt.id}: ${timeSpent} segundos`);
      }
    };
  }, [selectedArt, readingStartTime]);

  // Seeding quiz session
  const openQuizSession = (pathId: string) => {
    setActiveQuizPathId(pathId);
    setCurrentQuizIndex(0);
    setQuizAnswers({});
    setQuizFinished(false);
    setQuizScore(0);
  };

  const handleSelectQuizOption = (questionId: string, optionIdx: number) => {
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIdx }));
  };

  const submitQuiz = async (path: any) => {
    if (!path.quizzes) return;
    
    let correctCount = 0;
    path.quizzes.forEach((q: any) => {
      if (quizAnswers[q.questionId] === q.correctOptionIndex) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / path.quizzes.length) * 100);
    setQuizScore(percent);
    setQuizFinished(true);

    // Save on database
    await sendQuizAnswers(path.id, 'path_1_quiz', correctCount, path.quizzes.length);
    refreshPaths();
  };

  // Triggering document revisions submittal
  const submitChangedRevision = async () => {
    if (!selectedArt) return;
    try {
      await requestDocumentChangeApproval(
        selectedArt.id,
        'article',
        selectedArt.title,
        JSON.stringify({ content: editedContent }),
        'user_tech_1',
        'Carlos Silva (Operador)'
      );
      alert('Proposta de revisão documental enviada com sucesso para o canal de aprovação técnica!');
      setIsEditingArt(false);
      refreshKnowledge();
    } catch (e: any) {
      alert(e.message);
    }
  };

  // AI Document generate co-pilot trigger
  const runAiProcedureGeneration = async () => {
    if (!genTitle || !genDescription) {
      setGenerativeError('Preencha um título de POP e descrição para alimentar a rede cognitiva de IA.');
      return;
    }

    setGeneratingAi(true);
    setGenerativeError(null);
    setAiGeneratedResult(null);

    try {
      const pestsArr = genPests.split(',').map(s => s.trim());
      const chemsArr = genChemicals.split(',').map(s => s.trim());

      const res = await fetch('/api/ai/generate-procedure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: genTitle,
          description: genDescription,
          targetPests: pestsArr,
          allowedChemicalIds: chemsArr
        })
      });

      if (!res.ok) throw new Error('Falha ao obter reposta cognitiva do Gemini 3.5-Flash');
      
      const payload = await res.json();
      setAiGeneratedResult(payload);
    } catch (e: any) {
      setGenerativeError(e.message || 'Falha ao processar documentação por IA');
    } finally {
      setGeneratingAi(false);
    }
  };

  const saveAiGeneratedProcToDatabase = async () => {
    if (!aiGeneratedResult) return;
    try {
      await createNewArticleProposal(
        `POP IA: ${genTitle}`,
        `# ${genTitle}\n\n${genDescription}\n\n## Diretrizes Geradas por IA:\n* **Dosagem Recomentada:** ${aiGeneratedResult.recommendedChemicalVolume}\n* **Aviso de EPI:** ${aiGeneratedResult.requiredEPIs?.extraArmorText || ''}\n\n### Passo a Passo de Execução:\n${aiGeneratedResult.steps?.map((s: any) => `${s.sequence}. **${s.title}**: ${s.description}`).join('\n')}`,
        'operational',
        ['IA', 'POP-Gerado'],
        'AI Co-Pilot (Gemini 3.5-Flash)'
      );
      alert('POP gerado por IA publicado e incluído no acervo de conhecimento do DDSulf com sucesso!');
      setAiGeneratedResult(null);
      setGenTitle('');
      setGenDescription('');
      refreshKnowledge();
      setActiveTab('articles');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const simulateExecutionPhoto = (stepId: string) => {
    const mockPhotos = [
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%234A5568"/><text x="10" y="55" fill="white" font-family="monospace" font-size="10">ISOLAMENTO OK</text></svg>',
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%232D3748"/><text x="10" y="55" fill="white" font-family="monospace" font-size="10">EPI VESTIDO</text></svg>',
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%231A202C"/><text x="10" y="55" fill="white" font-family="monospace" font-size="10">MEDIDA CALDA OK</text></svg>'
    ];
    const pick = mockPhotos[Math.floor(Math.random() * mockPhotos.length)];
    execHook.markStepDone(stepId, pick);
  };

  return (
    <div className="bg-[#fcfdfd] text-neutral-900 rounded-3xl overflow-hidden border border-neutral-100 flex flex-col min-h-[750px] shadow-sm font-sans">
      
      {/* Outer context header */}
      <div className="bg-white border-b border-neutral-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-neutral-900 text-white rounded-lg">
              <BookOpen className="h-5 w-5" />
            </span>
            <h2 className="text-lg font-black uppercase tracking-tight text-neutral-900">
              Módulos de Conhecimento e Onboarding
            </h2>
          </div>
          <p className="text-xs text-neutral-400 font-bold uppercase tracking-wider mt-1.5 flex items-center gap-1">
            <span>DDSulf</span>
            <span>•</span>
            <Building className="h-3 w-3" />
            <span>ORGANATIONAL LEARNING & OPERATIONAL AUDITING ENVIRONMENT</span>
          </p>
        </div>

        {/* Dynamic Context Recommender Widget */}
        <div className="bg-[#f8f9fa] border border-neutral-200 rounded-xl px-4 py-2 text-left flex items-center space-x-3 text-xs w-full md:w-auto">
          <div className="shrink-0 p-1 bg-neutral-300 text-neutral-800 rounded">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-neutral-400 uppercase">Contexto da Tela Ativa:</span>
            <select 
              value={activePageContext}
              onChange={(e: any) => setActivePageContext(e.target.value)}
              className="font-bold text-neutral-800 bg-transparent py-0.5 focus:outline-none focus:border-neutral-900 text-xs block"
            >
              <option value="pops">Visualizando POPs</option>
              <option value="chemicals">Manejo de Químicos</option>
              <option value="stock">Estoque Central</option>
              <option value="routes">Sincronia de Rotas</option>
              <option value="finance">Comercial & Financeiro</option>
              <option value="safety">Segurança de Trabalho</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tabs navigation list */}
      <div className="bg-white border-b border-neutral-100 px-6 py-1 flex overflow-x-auto gap-1">
        {[
          { id: 'articles', label: 'Manual & Artigos Téclicos', icon: <BookOpen className="h-4 w-4" /> },
          { id: 'procedures', label: 'Executador de POPs (Campo)', icon: <CheckSquare className="h-4 w-4" /> },
          { id: 'learning', label: 'Trilhas de Onboarding', icon: <Award className="h-4 w-4" /> },
          { id: 'generator', label: 'Co-Pilot de Documentação por IA', icon: <Sparkles className="h-4 w-4 text-purple-600 animate-pulse" /> },
          { id: 'approvals', label: 'Auditoria de POPs (R.T.)', count: pendingApprovals.length, icon: <ShieldCheck className="h-4 w-4 text-emerald-600" /> },
          { id: 'analytics', label: 'Telemetria de Absorção', icon: <TrendingUp className="h-4 w-4" /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-3 text-xs font-bold transition-all flex items-center shrink-0 space-x-2 border-b-2 leading-none ${
              activeTab === tab.id 
                ? 'border-neutral-950 text-neutral-950 bg-neutral-50/50' 
                : 'border-transparent text-neutral-400 hover:text-neutral-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-[9px] font-mono leading-none font-bold">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Recommended context items alert stripe */}
      <div className="bg-neutral-50 px-8 py-2 border-b border-neutral-100 flex flex-wrap gap-4 text-xs text-neutral-500 items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-3.5 w-3.5 text-purple-600 shrink-0" />
          <span>Sugerido para esta seção:</span>
          {recommendedArticles.map(art => (
            <button 
              key={art.id}
              onClick={() => { setSelectedArt(art); setActiveTab('articles'); }}
              className="underline font-bold text-neutral-700 hover:text-black hover:scale-101 transition-all"
            >
              {art.title.slice(0, 30)}...
            </button>
          ))}
          {recommendedProcedures.map(proc => (
            <button 
              key={proc.id}
              onClick={() => { setSelectedProc(proc); setActiveTab('procedures'); }}
              className="underline font-bold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 uppercase text-[9px]"
            >
              Executar {proc.id.toUpperCase()}
            </button>
          ))}
        </div>
        <span className="font-mono text-[9px] text-neutral-400 uppercase font-black">LEITURA RESILIENTE OFFLINE-FIRST</span>
      </div>

      {/* Main Grid Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 relative min-h-[500px]">
        
        {/* VIEWPORTS */}
        <div className="lg:col-span-12 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            
            {/* ARTICLES PLATFORM */}
            {activeTab === 'articles' && (
              <motion.div
                key="articles-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Lateral filters search list */}
                <div className="lg:col-span-4 space-y-4 text-left">
                  
                  {/* Search and drop-down selectors */}
                  <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-xs space-y-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-3.5 h-3.5 w-3.5 text-neutral-400" />
                      <input 
                        type="text"
                        placeholder="Pesquisar artigos ou tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-black text-xs font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={selectedCategory}
                        onChange={(e: any) => setSelectedCategory(e.target.value)}
                        className="w-full py-2 px-2.5 bg-[#fcfcfc] border border-neutral-200 rounded-lg focus:outline-none text-xs font-bold text-neutral-600"
                      >
                        <option value="all">Todas Seções</option>
                        <option value="regulatory">Regulamentos</option>
                        <option value="operational">Operacional</option>
                        <option value="chemical">Toxicologia</option>
                        <option value="safety">Segurança</option>
                      </select>

                      <select
                        value={selectedTag}
                        onChange={(e: any) => setSelectedTag(e.target.value)}
                        className="w-full py-2 px-2.5 bg-[#fcfcfc] border border-neutral-200 rounded-lg focus:outline-none text-xs font-bold text-neutral-600"
                      >
                        <option value="all">Filtro por Tag</option>
                        {availableTags.map(tag => (
                          <option key={tag} value={tag}>{tag}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* List outputs */}
                  <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
                    {filteredResults.articles.length === 0 ? (
                      <div className="bg-white rounded-xl p-6 border border-neutral-100 text-center text-neutral-400">
                        <AlertCircle className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                        <p className="text-xs font-bold">Nenhum manual de conformidade encontrado.</p>
                      </div>
                    ) : (
                      filteredResults.articles.map(art => (
                        <div
                          key={art.id}
                          onClick={() => setSelectedArt(art)}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-start space-x-3 ${
                            selectedArt?.id === art.id 
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-md' 
                              : 'bg-white hover:bg-neutral-50 border-neutral-100'
                          }`}
                        >
                          <BookOpen className={`h-4.5 w-4.5 shrink-0 mt-0.5 ${selectedArt?.id === art.id ? 'text-white' : 'text-neutral-500'}`} />
                          <div className="space-y-1 min-w-0 flex-1">
                            <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${
                              selectedArt?.id === art.id 
                                ? 'bg-neutral-800 text-neutral-300' 
                                : 'bg-neutral-100 text-neutral-700'
                            }`}>
                              {art.category}
                            </span>
                            <h4 className="text-xs font-black truncate mt-1">{art.title}</h4>
                            <p className={`text-[10.5px] line-clamp-2 leading-relaxed ${selectedArt?.id === art.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                              {art.content.slice(0, 100).replace(/[#*]/g, '')}...
                            </p>
                            <div className="flex items-center space-x-2 pt-1.5 text-[9px] font-mono font-bold">
                              <span className="opacity-75">v{art.version}</span>
                              <span className="opacity-50">•</span>
                              <span className="opacity-75">{art.viewCount} acessos</span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 mt-3 opacity-40" />
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Main article reader */}
                <div className="lg:col-span-8 text-left">
                  {selectedArt ? (
                    <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-xs space-y-6">
                      
                      {/* Document Meta Header */}
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-neutral-100 pb-5">
                        <div className="space-y-1.5">
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-0.5 bg-neutral-900 text-white text-[9px] uppercase font-black rounded font-mono">
                              {selectedArt.category}
                            </span>
                            <span className="text-[10px] font-mono text-neutral-400">
                              Artigo {selectedArt.id}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-black leading-snug">{selectedArt.title}</h3>
                          <div className="text-[11px] text-neutral-500 flex items-center space-x-2 font-semibold">
                            <span>Selo de RT por:</span>
                            <strong className="text-neutral-800">{selectedArt.authorName}</strong>
                            <span>•</span>
                            <span>v{selectedArt.version}</span>
                          </div>
                        </div>

                        {/* Likes counter and Revision button */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => likeArticle(selectedArt.id)}
                            className="px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center space-x-1.5 text-xs text-neutral-600 font-black"
                          >
                            <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                            <span>{selectedArt.likes}</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditedContent(selectedArt.content);
                              setIsEditingArt(!isEditingArt);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-black text-white hover:bg-neutral-800 font-bold transition-all text-xs"
                          >
                            {isEditingArt ? 'Cancelar Edição' : 'Propor Alteração'}
                          </button>
                        </div>
                      </div>

                      {/* Content view / Editable markdown editor */}
                      <div className="space-y-4">
                        {isEditingArt ? (
                          <div className="space-y-4">
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 text-neutral-800 text-xs flex items-start space-x-2">
                              <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="space-y-1 leading-relaxed">
                                <p className="font-extrabold">Modo de Redação de Proposta de Mudança Documental</p>
                                <p className="text-[11px] text-neutral-600">Escreva as alterações técnicas. Sua proposta será encaminhada para o fluxo de auditoria do Responsável Técnico (R.T.). Uma vez homologada, o artigo será atualizado para a versão v{selectedArt.version + 1}.</p>
                              </div>
                            </div>
                            <textarea
                              rows={15}
                              value={editedContent}
                              onChange={(e) => setEditedContent(e.target.value)}
                              className="w-full text-xs font-mono p-4 border border-neutral-200 rounded-xl focus:outline-none focus:border-black bg-neutral-50/50"
                            />
                            <button
                              onClick={submitChangedRevision}
                              className="w-full py-3 bg-neutral-900 hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                            >
                              Salvar e Submeter Proposta a R.T.
                            </button>
                          </div>
                        ) : (
                          <div className="prose prose-sm max-w-none text-neutral-700 leading-relaxed space-y-4">
                            {selectedArt.content.split('\n').map((line, idx) => {
                              if (line.startsWith('# ')) return <h1 key={idx} className="text-lg font-black text-neutral-900 border-b border-neutral-100 pb-2 mb-4 mt-6 uppercase leading-none">{line.slice(2)}</h1>;
                              if (line.startsWith('## ')) return <h2 key={idx} className="text-sm font-black text-neutral-800 mt-5 mb-2 uppercase">{line.slice(3)}</h2>;
                              if (line.startsWith('### ')) return <h3 key={idx} className="text-xs font-extrabold text-neutral-800 mt-4 mb-1">{line.slice(4)}</h3>;
                              if (line.startsWith('* ') || line.startsWith('- ')) return <li key={idx} className="ml-4 list-disc text-xs text-neutral-600 mb-1">{line.slice(2)}</li>;
                              if (line.match(/^\d+\./)) return <li key={idx} className="ml-4 list-decimal text-xs text-neutral-600 mb-1">{line.replace(/^\d+\.\s*/, '')}</li>;
                              return <p key={idx} className="text-xs text-neutral-600 leading-relaxed mb-3">{line}</p>;
                            })}
                          </div>
                        )}
                      </div>

                      {/* Displaying related items link tags */}
                      {selectedArt.tags && selectedArt.tags.length > 0 && (
                        <div className="border-t border-neutral-100 pt-4 flex flex-wrap gap-1.5 items-center">
                          <span className="text-[9px] font-mono text-neutral-400 uppercase font-black">Tags de Indexamento:</span>
                          {selectedArt.tags.map(t => (
                            <span key={t} className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded text-[9.5px] font-bold font-mono">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center text-neutral-400">
                      <BookOpen className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-neutral-600">Leitor Operacional Prera</h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">Selecione algum artigo regulatório, biológico ou técnico na lista lateral para iniciar leitura monitorada.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* PROCEDURES (POPs) CONTROLLER WORKSPACE */}
            {activeTab === 'procedures' && (
              <motion.div
                key="procedures-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6"
              >
                {/* Procedures list selectable */}
                <div className="lg:col-span-4 space-y-4 text-left">
                  <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-xs">
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-3 leading-none">Selecione o Procedimento</h3>
                    <div className="space-y-2">
                      {procedures.map(proc => (
                        <div
                          key={proc.id}
                          onClick={() => {
                            setSelectedProc(proc);
                            execHook.cancelExecution();
                          }}
                          className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between ${
                            selectedProc?.id === proc.id 
                              ? 'bg-neutral-900 text-white border-neutral-900 shadow-sm' 
                              : 'bg-white hover:bg-neutral-50 border-neutral-100 font-normal'
                          }`}
                        >
                          <div className="space-y-1">
                            <span className={`text-[8px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                              selectedProc?.id === proc.id ? 'bg-neutral-800 text-neutral-300' : 'bg-neutral-100 text-neutral-600'
                            }`}>
                              {proc.category}
                            </span>
                            <h4 className="text-xs font-black leading-snug mt-1">{proc.title}</h4>
                            <p className={`text-[10px] ${selectedProc?.id === proc.id ? 'text-neutral-300' : 'text-neutral-400'}`}>
                              v{proc.version} • {proc.steps.length} etapas críticas
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 opacity-40 ml-2" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Active logs history display */}
                  <div className="bg-white rounded-2xl p-4 border border-neutral-100 shadow-xs text-left">
                    <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest leading-none mb-2">Auditorias de Execução Recentes</h3>
                    <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                      {executions.length === 0 ? (
                        <p className="text-[10.5px] text-neutral-400 italic">Nenhum POP executado no turno.</p>
                      ) : (
                        executions.map((ex, i) => (
                          <div key={i} className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs space-y-1">
                            <div className="flex justify-between font-bold">
                              <span className="text-neutral-800 font-extrabold truncate max-w-[150px]">{ex.procedureTitle}</span>
                              <span className={`text-[9.5px] font-mono leading-none ${ex.status === 'completed' ? 'text-emerald-600' : 'text-red-600'}`}>
                                {ex.status === 'completed' ? 'CONCLUÍDO' : 'FALHA'}
                              </span>
                            </div>
                            <div className="flex justify-between text-[10px] text-neutral-400">
                              <span>Duração: {ex.durationSeconds}s</span>
                              <span>Calda: {ex.chemicalVolumeUsed}L</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Procedure execution zone */}
                <div className="lg:col-span-8 text-left">
                  {selectedProc ? (
                    <div className="bg-white rounded-2xl p-6 border border-neutral-150 shadow-xs space-y-5">
                      
                      {/* POP Header */}
                      <div className="flex justify-between items-start border-b border-neutral-100 pb-4">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase text-neutral-400">{selectedProc.id.toUpperCase()}</span>
                          <h3 className="text-sm font-black uppercase text-neutral-900">{selectedProc.title}</h3>
                          <p className="text-xs text-neutral-500 leading-relaxed">{selectedProc.description}</p>
                        </div>
                      </div>

                      {/* Execution simulation block (Running / Idle toggle) */}
                      {execHook.executionState === 'idle' ? (
                        <div className="space-y-6">
                          
                          {/* EPI and Chemical compliance rules checklist */}
                          <div className="bg-[#fcfdfd] border border-neutral-200 rounded-xl p-4 space-y-3">
                            <h4 className="text-xs font-black text-neutral-800 uppercase flex items-center space-x-1.5">
                              <ShieldCheck className="h-4 w-4 text-emerald-600" />
                              <span>EPIs Mandatórios Ordenados pelo RT</span>
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                              {[
                                { val: selectedProc.requiredEPIs.hasMask, label: 'Respirador Gás' },
                                { val: selectedProc.requiredEPIs.hasGloves, label: 'Luvas Nitrílicas' },
                                { val: selectedProc.requiredEPIs.hasGoggles, label: 'Óculos Panorâmicos' },
                                { val: selectedProc.requiredEPIs.hasBoots, label: 'Botas Hidro' },
                                { val: selectedProc.requiredEPIs.hasApron, label: 'Avental Químico' }
                              ].map((epi, i) => {
                                if (!epi.val) return null;
                                return (
                                  <div key={i} className="flex items-center space-x-1.5 p-2 bg-neutral-50 rounded border border-neutral-100 text-xs text-neutral-700">
                                    <Check className="h-3.5 w-3.5 text-emerald-600 stroke-[3]" />
                                    <span className="font-extrabold">{epi.label}</span>
                                  </div>
                                );
                              })}
                            </div>
                            {selectedProc.requiredEPIs.extraArmorText && (
                              <p className="text-[10.5px] bg-neutral-900 text-neutral-100 font-mono p-2.5 rounded-lg border">
                                <strong>Nota Técnica Cobertura:</strong> {selectedProc.requiredEPIs.extraArmorText}
                              </p>
                            )}
                          </div>

                          {/* Chemical recipe dosage mapping */}
                          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-150 space-y-1.5 text-xs">
                            <p className="font-bold">Dosagem de Calda Mapeada:</p>
                            <p className="text-neutral-600 italic font-mono bg-white p-2.5 rounded border">
                              "{selectedProc.recommendedChemicalVolume}"
                            </p>
                            <div className="pt-1.5 flex flex-wrap gap-1.5">
                              <span className="text-[9px] font-bold uppercase text-neutral-400">Pragas Alvo de Lacre:</span>
                              {selectedProc.targetPests?.map(p => (
                                <span key={p} className="px-2 py-0.5 bg-neutral-200 text-neutral-700 font-mono text-[9px] rounded uppercase">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Initiate execution button */}
                          <button
                            onClick={execHook.startExecution}
                            className="w-full py-4 bg-neutral-900 border hover:bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 shadow-xs transition-all"
                          >
                            <Play className="h-4 w-4 stroke-[3]" />
                            <span>Iniciar Aplicação Procedimental</span>
                          </button>
                        </div>
                      ) : execHook.executionState === 'running' ? (
                        <div className="space-y-6">
                          
                          {/* Live clock and sequence trackers */}
                          <div className="bg-neutral-900 text-white rounded-xl p-4 flex justify-between items-center shadow-md border">
                            <div className="space-y-1">
                              <span className="text-[9px] font-mono font-bold text-neutral-400 uppercase tracking-widest">Execução em Progresso</span>
                              <h4 className="text-xs font-black font-mono">
                                Etapa {execHook.currentStepIndex + 1} de {selectedProc.steps.length}
                              </h4>
                            </div>

                            <div className="flex items-center space-x-2 text-neutral-100 font-mono">
                              <Clock className="h-4 w-4 text-emerald-500 animate-pulse" />
                              <strong className="text-base font-black">
                                {Math.floor(execHook.elapsedSeconds / 60)}m {execHook.elapsedSeconds % 60}s
                              </strong>
                            </div>
                          </div>

                          {/* Current step card show off */}
                          <div className="bg-white border-2 border-neutral-900 rounded-2xl p-5 space-y-4">
                            <div className="flex justify-between items-start">
                              <span className="p-1 px-2.5 bg-neutral-900 text-white text-xs font-mono font-black rounded-lg">
                                ETAPA {selectedProc.steps[execHook.currentStepIndex].sequence}
                              </span>

                              {selectedProc.steps[execHook.currentStepIndex].requiresPhotoProof && (
                                <span className="bg-red-50 text-red-700 border border-red-200 text-[10px] font-black uppercase px-2 py-0.5 rounded leading-none flex items-center space-x-1 animate-pulse">
                                  <Camera className="h-3 w-3" />
                                  <span>Foto de Segurança Exigida</span>
                                </span>
                              )}
                            </div>

                            <div className="space-y-1 text-left">
                              <h4 className="text-xs font-black text-neutral-900">
                                {selectedProc.steps[execHook.currentStepIndex].title}
                              </h4>
                              <p className="text-xs text-neutral-600 leading-relaxed pt-1 font-semibold">
                                {selectedProc.steps[execHook.currentStepIndex].description}
                              </p>
                            </div>

                            {/* Interactions: simulated photo or checklist toggle accomplishments */}
                            <div className="border-t border-neutral-100 pt-3 flex flex-col sm:flex-row gap-3">
                              
                              {selectedProc.steps[execHook.currentStepIndex].requiresPhotoProof ? (
                                <button
                                  onClick={() => simulateExecutionPhoto(selectedProc.steps[execHook.currentStepIndex].id)}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-black uppercase flex items-center justify-center space-x-2 transition-all ${
                                    execHook.completedSteps.includes(selectedProc.steps[execHook.currentStepIndex].id)
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-neutral-600'
                                  }`}
                                >
                                  <Camera className="h-4 w-4" />
                                  <span>
                                    {execHook.completedSteps.includes(selectedProc.steps[execHook.currentStepIndex].id) 
                                      ? 'Evidência Fotografada ✔' 
                                      : 'Efetuar Foto Comprobatória'}
                                  </span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => execHook.markStepDone(selectedProc.steps[execHook.currentStepIndex].id)}
                                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold uppercase transition-all ${
                                    execHook.completedSteps.includes(selectedProc.steps[execHook.currentStepIndex].id)
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                      : 'bg-neutral-900 text-white hover:bg-black'
                                  }`}
                                >
                                  <span>
                                    {execHook.completedSteps.includes(selectedProc.steps[execHook.currentStepIndex].id) 
                                      ? 'Etapa Concluída ✔' 
                                      : 'Confirmar Conclusão'}
                                  </span>
                                </button>
                              )}
                            </div>

                            {/* display photo previews if simulated */}
                            {execHook.stepPhotos[selectedProc.steps[execHook.currentStepIndex].id] && (
                              <div className="bg-neutral-100 p-2.5 rounded-xl border text-center flex items-center justify-center space-x-1">
                                <span className="text-[10px] font-mono text-neutral-700">Evidência registrada no buffer:</span>
                                <span className="text-[10px] text-emerald-700 font-extrabold font-mono">OK_PROOF_SNAP.JPG</span>
                              </div>
                            )}
                          </div>

                          {/* Navigation buttons inside active steppers */}
                          <div className="flex gap-2.5">
                            <button
                              disabled={execHook.currentStepIndex === 0}
                              onClick={execHook.prevStep}
                              className="px-4 py-2 text-xs font-bold border rounded-lg hover:bg-neutral-50 disabled:opacity-40"
                            >
                              Voltar
                            </button>

                            {execHook.currentStepIndex < selectedProc.steps.length - 1 ? (
                              <button
                                onClick={execHook.nextStep}
                                className="flex-1 py-2 bg-neutral-900 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-black"
                              >
                                Próximo Passo
                              </button>
                            ) : (
                              <div className="flex-1 flex gap-2">
                                <button
                                  onClick={() => execHook.finishExecution(true)}
                                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-black uppercase tracking-wider"
                                >
                                  Homologar & Fechar POP
                                </button>
                                <button
                                  onClick={() => execHook.finishExecution(false)}
                                  className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 border border-red-200"
                                >
                                  Falha Geral
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Extra closure data fields (chemical usage) */}
                          <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-200 text-xs space-y-3">
                            <p className="font-bold uppercase text-[9.5px] text-neutral-400">Dados do Fechamento Técnico (Anvisa)</p>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <label className="text-neutral-500 font-semibold text-[11px] block text-left">Volume Real Aplicado (L)</label>
                                <input
                                  type="number"
                                  value={execHook.chemicalVolumeUsed || ''}
                                  onChange={(e) => execHook.setChemicalVolumeUsed(parseFloat(e.target.value) || 0)}
                                  className="w-full text-xs font-bold p-2 border border-neutral-200 rounded-lg focus:outline-none"
                                />
                              </div>

                              <div className="flex items-center space-x-2 pt-5">
                                <input
                                  type="checkbox"
                                  id="adh_chk"
                                  checked={execHook.adherenceConfirmed}
                                  onChange={(e) => execHook.setAdherenceConfirmed(e.target.checked)}
                                  className="h-4 w-4 accent-black rounded"
                                />
                                <label htmlFor="adh_chk" className="text-[11px] text-neutral-600 font-bold select-none text-left">Confirmo aderência estrita à dosagem RT</label>
                              </div>
                            </div>

                            <div className="space-y-1">
                              <label className="text-neutral-500 font-semibold text-[11px] block text-left">Observações e Anomalias em Campo</label>
                              <input
                                type="text"
                                placeholder="Inscreva vazamentos periféricos ou interferências climáticas..."
                                value={execHook.notes}
                                onChange={(e) => execHook.setNotes(e.target.value)}
                                className="w-full text-xs font-semibold p-2 border border-neutral-200 rounded-lg focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-emerald-50 rounded-2xl p-8 border border-emerald-100 text-center space-y-3">
                          <ShieldCheck className="h-12 w-12 text-emerald-600 mx-auto" />
                          <h3 className="text-base font-black text-emerald-900 leading-none">POP ENCERRADO COM CONFORMIDADE</h3>
                          <p className="text-xs text-emerald-700 max-w-md mx-auto">
                            Toda a telemetria, tempo transcorrido útil do POP ({execHook.elapsedSeconds}s) e assinaturas fotográficas foram consolidados em um bloco indexado de auditoria DDSulf.
                          </p>
                          <button
                            onClick={execHook.cancelExecution}
                            className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs font-bold rounded-xl mt-3"
                          >
                            Nova Aplicação POP
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-white border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center text-neutral-400">
                      <CheckSquare className="h-10 w-10 text-neutral-300 mx-auto mb-3" />
                      <h4 className="text-sm font-bold text-neutral-600">Módulo de Execução de POP Clínico</h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">Selecione o procedimento na barra esquerda para iniciar o isolamento de risco e cronômetro de aplicação sanitária.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* LEARNING TRACKS (ONBOARDING & TRAINING QUIZZES) */}
            {activeTab === 'learning' && (
              <motion.div
                key="learning-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {/* Onboarding Introduction Header */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-sm font-black text-neutral-900 uppercase">Capacitação Profissional & Onboarding Gamificado</h3>
                    <p className="text-xs text-neutral-400 mt-1">Conclua as trilhas de aprendizado necessárias para obter certificações e destravar ordens de serviços ativas</p>
                  </div>

                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 flex items-center space-x-2 text-xs">
                    <Award className="h-4.5 w-4.5 text-yellow-500" />
                    <div>
                      <span className="text-[10px] font-mono font-black text-neutral-400 block uppercase">Prêmio Total Disponível</span>
                      <strong className="font-mono text-neutral-800 text-sm">500 XP Premium</strong>
                    </div>
                  </div>
                </div>

                {/* Submitting Quiz / Running Quiz Panel */}
                {activeQuizPathId ? (
                  <div className="bg-white rounded-2xl p-6 border-2 border-neutral-900 shadow-sm space-y-6">
                    {paths.filter(p => p.id === activeQuizPathId).map((path) => {
                      if (!path.quizzes) return null;
                      const q = path.quizzes[currentQuizIndex];
                      
                      return (
                        <div key={path.id} className="space-y-6">
                          {/* Quiz upper timeline header */}
                          <div className="flex justify-between items-center border-b border-neutral-100 pb-3">
                            <span className="text-xs font-black uppercase text-neutral-600">Questionário Técnico: {path.title.slice(0, 30)}...</span>
                            <span className="text-xs font-mono font-bold text-neutral-400">
                              Pergunta {currentQuizIndex + 1} de {path.quizzes.length}
                            </span>
                          </div>

                          {!quizFinished ? (
                            <div className="space-y-5">
                              {/* Question title text */}
                              <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                                <h4 className="text-sm font-extrabold text-neutral-900">{q.questionText}</h4>
                              </div>

                              {/* Multiple Choice Options List */}
                              <div className="grid grid-cols-1 gap-2.5">
                                {q.options.map((opt, oIdx) => (
                                  <button
                                    key={oIdx}
                                    onClick={() => handleSelectQuizOption(q.questionId, oIdx)}
                                    className={`p-3.5 text-xs font-semibold text-left rounded-xl border transition-all flex items-start space-x-3 ${
                                      quizAnswers[q.questionId] === oIdx
                                        ? 'bg-neutral-950 text-white border-neutral-950 shadow-md'
                                        : 'bg-white hover:bg-neutral-50 border-neutral-200 text-neutral-600'
                                    }`}
                                  >
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono leading-none ${
                                      quizAnswers[q.questionId] === oIdx ? 'bg-neutral-800 text-neutral-200' : 'bg-neutral-100 text-neutral-500'
                                    }`}>
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span className="flex-1 leading-snug">{opt}</span>
                                  </button>
                                ))}
                              </div>

                              {/* Progress navigators */}
                              <div className="flex justify-between items-center pt-3 border-t border-neutral-100">
                                <button
                                  disabled={currentQuizIndex === 0}
                                  onClick={() => setCurrentQuizIndex(prev => prev - 1)}
                                  className="px-4 py-2 border rounded-lg text-xs font-bold disabled:opacity-35"
                                >
                                  Instância Anterior
                                </button>

                                {currentQuizIndex < path.quizzes.length - 1 ? (
                                  <button
                                    disabled={quizAnswers[q.questionId] === undefined}
                                    onClick={() => setCurrentQuizIndex(prev => prev + 1)}
                                    className="px-4 py-2 bg-neutral-900 text-white hover:bg-black rounded-lg text-xs font-bold"
                                  >
                                    Seguir Teste
                                  </button>
                                ) : (
                                  <button
                                    disabled={path.quizzes.some(question => quizAnswers[question.questionId] === undefined)}
                                    onClick={() => submitQuiz(path)}
                                    className="px-6 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-wider hover:bg-emerald-700 transition"
                                  >
                                    Finalizar e Avaliar Prova
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center p-6 space-y-4">
                              <div className="h-14 w-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-xl font-black font-mono">
                                {quizScore}%
                              </div>
                              <h3 className="text-base font-black text-neutral-900 leading-none">
                                {quizScore >= 80 ? 'PARABÉNS! VOCÊ PASSOU!' : 'VOCÊ NÃO ATINGIU A NOTA DE CORTE'}
                              </h3>
                              <p className="text-xs text-neutral-500 max-w-md mx-auto leading-relaxed">
                                {quizScore >= 80 
                                  ? 'Sua certificação profissional teórica Anvisa foi anexada com conformidade ao seu prontuário digital DDSulf. Sua conta está autorizada a retirar defensivos.' 
                                  : 'Lamentamos, a taxa mínima exigida de fixação para fins regulatórios é de 80%. Refaça a trilha e reteste seus conhecimentos.'}
                              </p>

                              {/* Detailed explanations review */}
                              <div className="border border-neutral-100 rounded-xl bg-neutral-50 p-4 text-left space-y-3 max-h-[220px] overflow-y-auto mt-4">
                                <p className="text-xs font-black uppercase tracking-wider text-neutral-400">Gabarito de Estudo Comentado:</p>
                                {path.quizzes.map((question, qIdx) => (
                                  <div key={question.questionId} className="text-[11px] leading-relaxed border-b border-neutral-200 pb-2.5 last:border-0 last:pb-0">
                                    <p className="font-bold text-neutral-800">{qIdx + 1}. {question.questionText}</p>
                                    <p className="text-emerald-700 font-extrabold mt-0.5">Resposta Correta: {question.options[question.correctOptionIndex]}</p>
                                    <p className="text-neutral-500">Sua Escolha: {question.options[quizAnswers[question.questionId]]}</p>
                                  </div>
                                ))}
                              </div>

                              <div className="flex gap-2 justify-center pt-2">
                                <button
                                  onClick={() => openQuizSession(path.id)}
                                  className="px-4 py-2 border rounded-lg text-xs font-bold hover:bg-neutral-50"
                                >
                                  Refazer Teste
                                </button>
                                <button
                                  onClick={() => setActiveQuizPathId(null)}
                                  className="px-4 py-2 bg-neutral-950 text-white rounded-lg text-xs font-bold"
                                >
                                  Fechar Relatório de Prova
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Courses loop */}
                    {paths.map((path) => {
                      const userProg = progress.find(p => p.pathId === path.id);
                      const isComplete = userProg?.isCompleted || false;
                      const finishedStepsCount = userProg?.completedStepIds.length || 0;
                      const percent = Math.round((finishedStepsCount / path.steps.length) * 100);

                      return (
                        <div key={path.id} className="md:col-span-2 bg-white rounded-2xl p-5 border border-neutral-100 shadow-xs space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9.5px] font-mono font-bold text-neutral-400 uppercase">{path.category}</span>
                              <h4 className="text-sm font-black text-neutral-900 mt-0.5 leading-snug">{path.title}</h4>
                            </div>
                            
                            {isComplete && (
                              <span className="bg-emerald-50 text-emerald-700 font-extrabold text-[9px] uppercase px-2 py-0.5 rounded border border-emerald-100 font-mono">
                                CERTIFICADO
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-neutral-500 leading-relaxed font-semibold">{path.description}</p>

                          {/* Steps linear tree completed checklists */}
                          <div className="space-y-2 border-t border-neutral-100 pt-4">
                            <span className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider block">Estágios de Fixação de Conhecimento:</span>
                            <div className="space-y-2">
                              {path.steps.map((st) => {
                                const isStepChecked = userProg?.completedStepIds.includes(st.id) || false;

                                return (
                                  <div key={st.id} className="flex items-center justify-between p-3 bg-neutral-50 hover:bg-neutral-100/50 rounded-xl border border-neutral-100 text-xs transition-all">
                                    <div className="flex items-start space-x-2.5 min-w-0 flex-1">
                                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono leading-none ${
                                        st.type === 'quiz' ? 'bg-amber-100 text-amber-800' : 'bg-neutral-200 text-neutral-700'
                                      }`}>
                                        {st.type}
                                      </span>
                                      <div className="truncate text-left leading-snug">
                                        <p className="font-extrabold p-0.2">{st.title}</p>
                                        <span className="text-[10px] text-neutral-400 font-medium block">{st.description}</span>
                                      </div>
                                    </div>

                                    {st.type === 'quiz' ? (
                                      <button 
                                        onClick={() => openQuizSession(path.id)}
                                        className="py-1 px-2.5 rounded border font-black uppercase text-[10px] tracking-wider transition-all bg-amber-500 border-amber-500 hover:bg-amber-600 text-white"
                                      >
                                        Iniciar Quiz
                                      </button>
                                    ) : (
                                      <input 
                                        type="checkbox"
                                        checked={isStepChecked}
                                        onChange={() => markStepComplete(path.id, st.id, !isStepChecked)}
                                        className="h-4.5 w-4.5 accent-black rounded shrink-0 cursor-pointer"
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Progress summaries stats panel right sidebar */}
                    <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-xs text-left h-fit space-y-4">
                      <h4 className="text-xs font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">Status de Capacitação</h4>
                      <p className="text-[11px] text-neutral-400">Total acumulado de fixabilidade didática operacional do técnico</p>
                      
                      <div className="space-y-3 pt-3">
                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-neutral-600">Módulos Homologados:</span>
                          <strong className="font-mono text-neutral-800">
                            {progress.filter(p => p.isCompleted).length} cursos
                          </strong>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-neutral-600">XP Tático Premium:</span>
                          <strong className="font-mono text-yellow-600 font-black">
                            {progress.reduce((acc, p) => acc + (p.totalXPPremium || 0), 0)} XP
                          </strong>
                        </div>

                        <div className="flex justify-between text-xs">
                          <span className="font-bold text-neutral-600">Média Geral Flashtest:</span>
                          <strong className="font-mono text-teal-600 font-black">
                            {Object.values(progress[0]?.quizScores || {}).reduce((a, b) => a + b, 0)}%
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* AI DOCUMENT CO-PILOT ASSISTED GENERATOR */}
            {activeTab === 'generator' && (
              <motion.div
                key="generator-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left"
              >
                {/* Inputs area Left block */}
                <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-4">
                  <div>
                    <h3 className="text-xs font-black text-neutral-900 uppercase">AI Co-Pilot de Documentação</h3>
                    <p className="text-[11.5px] text-neutral-400 mt-1">Crie procedimentos operacionais padrão (POPs) regulamentares por IA em segundos fornecendo conceitos básicos</p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-500 uppercase">Título Comercial do POP</label>
                      <input 
                        type="text"
                        placeholder="Ex: POP-03: Controle de Baratas em Prateleiras de Alimentos"
                        value={genTitle}
                        onChange={(e) => setGenTitle(e.target.value)}
                        className="w-full text-xs font-bold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-500 uppercase">Descrição Operacional</label>
                      <textarea
                        rows={4}
                        placeholder="Indique as especificidades fundamentais da aplicação e se há restrições sanitárias especiais..."
                        value={genDescription}
                        onChange={(e) => setGenDescription(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-500 uppercase">Classes Pragas Alvo</label>
                      <input 
                        type="text"
                        placeholder="Blattella germanica, Roedores"
                        value={genPests}
                        onChange={(e) => setGenPests(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold text-neutral-500 uppercase">Ids de Defensivos Autorizados</label>
                      <input 
                        type="text"
                        value={genChemicals}
                        onChange={(e) => setGenChemicals(e.target.value)}
                        className="w-full text-xs font-semibold p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>

                    {generativeError && (
                      <p className="p-3 bg-red-50 text-red-700 rounded-lg border border-red-100 text-[11px] font-semibold">{generativeError}</p>
                    )}

                    <button
                      disabled={generatingAi}
                      onClick={runAiProcedureGeneration}
                      className="w-full py-3 bg-purple-650 hover:bg-purple-700 bg-neutral-950 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 transition-all disabled:opacity-40"
                    >
                      {generatingAi ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          <span>Computando Redes Cognitivas...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 text-purple-400" />
                          <span>Formular POP por IA (Gemini 3.5-Flash)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Gemini Output Preview area Right block */}
                <div className="lg:col-span-7">
                  {aiGeneratedResult ? (
                    <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-purple-500 shadow-sm space-y-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 bg-purple-500 text-white text-[9px] font-mono uppercase font-black tracking-widest">
                        Preview Gerador Assistido por IA
                      </div>

                      <div className="space-y-1 pt-2">
                        <h4 className="text-sm font-black text-neutral-900 leading-snug">Rascunho Técnico: {genTitle}</h4>
                        <p className="text-xs text-neutral-500 leading-relaxed italic">"Dosagem Estimada de Calda: {aiGeneratedResult.recommendedChemicalVolume}"</p>
                      </div>

                      {/* Required EPI checks generated */}
                      <div className="space-y-2 border-t border-purple-100 pt-4">
                        <span className="text-[10px] font-mono font-black text-neutral-400 block uppercase">EPIs Sugeridos:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10.5px]">
                          {Object.entries(aiGeneratedResult.requiredEPIs || {}).map(([epi, has]) => {
                            if (epi === 'extraArmorText' || !has) return null;
                            return (
                              <span key={epi} className="p-1 px-2.5 bg-purple-50 border border-purple-100 text-purple-800 rounded text-center font-extrabold truncate">
                                {epi.replace('has', '')}
                              </span>
                            );
                          })}
                        </div>
                        {aiGeneratedResult.requiredEPIs?.extraArmorText && (
                          <div className="p-2.5 bg-neutral-50 border rounded text-[11px] text-neutral-600 font-mono italic">
                            {aiGeneratedResult.requiredEPIs.extraArmorText}
                          </div>
                        )}
                      </div>

                      {/* Sequential steps generated */}
                      <div className="space-y-2.5 border-t border-purple-100 pt-4">
                        <span className="text-[10px] font-mono font-black text-neutral-400 block uppercase">Passo-a-Passo de Aplicação Traçado:</span>
                        <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                          {aiGeneratedResult.steps?.map((step: any, i: number) => (
                            <div key={i} className="p-3 bg-neutral-50 border border-neutral-100 rounded-xl flex items-start space-x-2.5 text-xs">
                              <span className="h-5 w-5 rounded bg-purple-100 text-purple-800 font-mono font-black flex items-center justify-center shrink-0">
                                {step.sequence}
                              </span>
                              <div className="truncate leading-snug">
                                <p className="font-extrabold text-neutral-900">{step.title} ({step.estimatedDurationSeconds}s)</p>
                                <span className="text-[10.5px] text-neutral-500 font-medium block">{step.description}</span>
                                {step.requiresPhotoProof && <span className="text-[8px] bg-red-100 text-red-800 uppercase font-black py-0.2 px-1 rounded inline-block mt-0.5 animate-pulse">Foto Requerida</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Publishing controllers */}
                      <div className="pt-3 border-t border-neutral-100 flex gap-2.5">
                        <button
                          onClick={saveAiGeneratedProcToDatabase}
                          className="flex-1 py-3 bg-neutral-950 font-black uppercase text-white hover:bg-black rounded-lg text-xs tracking-wider"
                        >
                          Aprovar e Publicar POP Diretamente
                        </button>
                        <button
                          onClick={() => setAiGeneratedResult(null)}
                          className="px-4 py-3 border font-extrabold hover:bg-neutral-50 text-neutral-500 rounded-lg text-xs"
                        >
                          Ignorar Draft
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#fcfdfd] border-2 border-dashed border-neutral-200 rounded-2xl p-16 text-center text-neutral-400 flex flex-col justify-center items-center h-full min-h-[300px]">
                      <Sparkles className="h-10 w-10 text-neutral-300 mb-2" />
                      <h4 className="text-sm font-bold text-neutral-600">Geração de POP de Alta Performance por IA</h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-sm">Preencha os objetivos de manejo na ficha esquerda para gerar automaticamente dosagens, procedimentos e checklists de segurança de classe mundial.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* DOCUMENT COMPLIANCE AUDITORIA TECHNICAL PORTAL (RT APPROVALS) */}
            {activeTab === 'approvals' && (
              <motion.div
                key="approvals-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                <div className="bg-white rounded-2xl p-5 border border-neutral-150 shadow-xs">
                  <h3 className="text-sm font-black text-neutral-900 uppercase">Portal de Homologação Regulatório (Responsável Técnico)</h3>
                  <p className="text-xs text-neutral-400 mt-1">Inspeção detalhada de propostas de revisão de relatórios técnicos submetidas pelas equipes em campo</p>
                </div>

                {pendingApprovals.length === 0 ? (
                  <div className="bg-white rounded-2xl p-12 border border-neutral-100 text-center shadow-xs">
                    <ShieldCheck className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
                    <h4 className="text-sm font-bold text-neutral-700">Tudo verificado</h4>
                    <p className="text-xs text-neutral-400 mt-1">Nenhuma alteração de texto de compliance pendente de homologação técnica.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingApprovals.map((appr) => {
                      let proposedPayload: any = {};
                      try {
                        proposedPayload = JSON.parse(appr.proposedContentJSON);
                      } catch (e) {}

                      return (
                        <div key={appr.id} className="bg-white border-2 border-neutral-900 rounded-2xl p-5 space-y-4 shadow-sm flex flex-col justify-between">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] font-mono text-neutral-400 font-bold uppercase">{appr.id}</span>
                                <h4 className="text-xs font-black text-neutral-900 mt-0.5">{appr.proposedTitle}</h4>
                              </div>
                              <span className="text-[8.5px] font-mono font-black uppercase text-amber-800 bg-amber-50 px-2 py-0.5 border rounded animate-pulse">
                                PENDENTE DE RT
                              </span>
                            </div>

                            <p className="text-xs text-neutral-500 font-semibold leading-relaxed">
                              Proposta por: <strong className="text-neutral-800">{appr.authorName}</strong>
                            </p>

                            {/* Proposed change textual view */}
                            {proposedPayload.content && (
                              <div className="text-xs bg-neutral-50 p-3 rounded-lg border border-neutral-100 max-h-[140px] overflow-y-auto font-mono text-neutral-600 leading-relaxed">
                                <p className="font-sans font-black text-neutral-900 mb-1 leading-none text-[10.5px]">Nova Redação Proposta:</p>
                                <p>{proposedPayload.content}</p>
                              </div>
                            )}
                          </div>

                          {/* Approval and Rejection controllers and reviewer logs */}
                          <div className="flex gap-2.5 pt-3 border-t border-neutral-100">
                            <button
                              onClick={() => executeApprovalAction(appr.id, 'approved', 'Dr. Lucas Silveira (RT)', 'Mudança atende à RDC 52')}
                              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 font-bold uppercase tracking-wider text-white text-xs rounded-lg"
                            >
                              Homologar Alterações
                            </button>
                            <button
                              onClick={() => executeApprovalAction(appr.id, 'rejected', 'Dr. Lucas Silveira (RT)', 'Texto inadequado')}
                              className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold hover:bg-red-100 rounded-lg"
                            >
                              Rejeitar Draft
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            )}

            {/* TELEMETRY ANALYTICS MAPPED */}
            {activeTab === 'analytics' && (
              <motion.div
                key="analytics-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6 text-left"
              >
                {/* Telemetry metadata counts cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs">
                    <span className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider">Acessos Monitorados</span>
                    <strong className="text-xl font-black text-neutral-800 font-mono block mt-1">453 leituras</strong>
                    <span className="text-[9px] text-emerald-600 font-black block mt-1 leading-none">Taxa de evasão: &lt; 2%</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs">
                    <span className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider">Erros Registrados</span>
                    <strong className="text-xl font-black text-neutral-800 font-mono block mt-1">0 falhas</strong>
                    <span className="text-[9px] text-neutral-500 font-bold block mt-1 leading-none">Conformidade operacional</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs">
                    <span className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider">Sessão Homologada RT</span>
                    <strong className="text-xl font-black text-neutral-800 font-mono block mt-1">100%</strong>
                    <span className="text-[9px] text-indigo-600 font-black block mt-1 leading-none">Trilhas Anvisa ativas</span>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-neutral-100 shadow-xs">
                    <span className="text-[10px] font-mono font-black text-neutral-400 uppercase tracking-wider">Tempo de Leitura Total</span>
                    <strong className="text-xl font-black text-neutral-800 font-mono block mt-1">4.2 horas</strong>
                    <span className="text-[9px] text-teal-600 font-bold block mt-1 leading-none">Absorção cognitiva</span>
                  </div>
                </div>

                {/* Engagement listing items table */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-xs space-y-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-black text-neutral-900 uppercase">Mapeamento de Leitura e Duração Média por Manual</h3>
                    <button onClick={refreshAnalytics} className="p-1 px-2.5 rounded border border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-50 text-[10px] font-bold">
                      Recarregar Telemetria
                    </button>
                  </div>

                  <div className="space-y-3">
                    {/* Item 1 */}
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                      <div>
                        <p className="font-extrabold text-neutral-900">RDC ANVISA nº 52/2014</p>
                        <span className="text-[10.5px] text-neutral-400">Tempo Médio Ativo: 145 segundos</span>
                      </div>
                      <span className="font-mono text-neutral-600 font-bold">145 views</span>
                    </div>

                    {/* Item 2 */}
                    <div className="flex items-center justify-between text-xs pb-2 border-b border-neutral-100">
                      <div>
                        <p className="font-extrabold text-neutral-900">Manejo Integrado de Pragas (MIP)</p>
                        <span className="text-[10.5px] text-neutral-400">Tempo Médio Ativo: 98 segundos</span>
                      </div>
                      <span className="font-mono text-neutral-600 font-bold">98 views</span>
                    </div>

                    {/* Item 3 */}
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <p className="font-extrabold text-neutral-900">Ficha de Toxicologia & Primeiros Socorros</p>
                        <span className="text-[10.5px] text-neutral-400">Tempo Médio Ativo: 210 segundos</span>
                      </div>
                      <span className="font-mono text-neutral-600 font-bold">210 views</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}
export default KnowledgeWorkspace;
