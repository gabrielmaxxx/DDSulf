import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuoteWorkflow, METADATA_STEPS } from '../hooks/useQuoteWorkflow';
import { useRealtimeWorkflow } from '../hooks/useRealtimeWorkflow';
import { useWorkflowSimulation } from '../hooks/useWorkflowSimulation';
import { useWorkflowValidation } from '../hooks/useWorkflowValidation';
import { WorkflowProgress } from './WorkflowProgress';
import { WorkflowSidebar } from './WorkflowSidebar';
import { WorkflowAlerts } from './WorkflowAlerts';
import { SimulationPanel } from './SimulationPanel';
import { DraftRecovery } from './DraftRecovery';
import { QuoteReview } from './QuoteReview';
import { workflowService } from '../services/workflowService';
import { analyticsService } from '@/calculator/analytics';
import { CurrentStepIndex } from '../types';
import { 
  Building, 
  Home, 
  Store, 
  Factory, 
  HeartPlus, 
  TreePine, 
  Sparkles, 
  Bug, 
  Flame, 
  Check, 
  HelpCircle,
  Truck, 
  Users, 
  Route, 
  Percent, 
  DollarSign, 
  Calendar, 
  FileCheck, 
  Save, 
  User, 
  ArrowLeft, 
  ArrowRight, 
  Smartphone, 
  RefreshCcw, 
  FileSpreadsheet, 
  Plus, 
  ShieldAlert, 
  Info 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EnvironmentType, InfestationLevel, OperationalComplexity, PestType, Recurrence, UrgencyLevel } from '@/types/database';

export function QuoteWorkflowSystem() {
  const [isOnboarding, setIsOnboarding] = useState<boolean>(true);
  const [savingCompleted, setSavingCompleted] = useState<boolean>(false);
  const [lastQuoteIdSaved, setLastQuoteIdSaved] = useState<string>('');

  const {
    state,
    setField,
    handleNextStep,
    handlePrevStep,
    jumpToStep,
    resetWorkflow,
    chemicalDatabase,
    selectChemical,
    adjustChemicalDosage,
    lastSavedTime,
    loadingSteps
  } = useQuoteWorkflow();

  const { breakdown, yields, viability, risk, decision, alerts } = useRealtimeWorkflow(state);
  const simScenarios = useWorkflowSimulation(state, breakdown);
  const currentValidation = useWorkflowValidation(state.currentStep, state);

  const handleApplySimulatedMargin = (simulatedMargin: number) => {
    setField('customMargin', Math.round(simulatedMargin));
    toast.success(`Margem líquida da simulação (${simulatedMargin}%) aplicada com sucesso!`);
  };

  const handleFinalizeQuoteSubmission = async () => {
    try {
      setSavingCompleted(true);
      const docId = await workflowService.finalizeQuote(state, breakdown);
      setLastQuoteIdSaved(docId);
      
      // Save deep snapshot of operational variables for SaaS analytics and AI audit trails
      analyticsService.saveSnapshot(
        docId, 
        state as any, 
        breakdown, 
        'comercial_assistido', 
        'Proposta comercial finalizada com sucesso via assistido'
      );

      workflowService.trackAnalytics('quote_finalized_successfully', { quoteId: docId });
      toast.success('Orçamento consolidado!');
    } catch {
      toast.error('Ocorreu um erro no faturamento. Arquivo guardado em rascunhos.');
    }
  };

  const handleResetForNewProposal = () => {
    resetWorkflow();
    setSavingCompleted(false);
    setLastQuoteIdSaved('');
    setIsOnboarding(true);
  };

  if (isOnboarding && !loadingSteps) {
    return (
      <div className="max-w-4xl mx-auto py-8">
        <DraftRecovery
          onLoadDraft={(recovered) => {
            setIsOnboarding(false);
            toast.success(`Sessão para '${recovered.state.clientName}' recuperada.`);
          }}
          onNewWorkflow={() => {
            setIsOnboarding(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-gray-200 rounded-[28px] p-6 shadow-xs">
        <div className="space-y-1">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block leading-none">
            PestFlow Premium Operations
          </span>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight leading-none md:text-3xl">
            Calculadora de Orçamentos de Precisão
          </h1>
          <p className="text-xs text-gray-400 font-semibold">
            Configurador de 13 etapas parametrizado contra riscos biológicos, Km de rota e rateios tributários.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={resetWorkflow}
            className="flex items-center gap-2 border border-gray-200 hover:border-black rounded-2xl px-4 py-2.5 text-xs font-bold text-gray-700 bg-white hover:text-black transition-all select-none"
          >
            <RefreshCcw className="size-3.5" /> Reiniciar Workflow
          </button>
        </div>
      </div>

      {/* Grid: Form Steps + Sidebar values */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Central steps layout */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active progress tracker status */}
          <div className="bg-white border border-gray-200 p-6 rounded-[28px] shadow-xs">
            <WorkflowProgress 
              currentStep={state.currentStep} 
              maxStepReached={state.maxStepReached} 
              onStepClick={jumpToStep} 
            />
          </div>

          <div className="bg-white border border-gray-200 rounded-[28px] p-6 md:p-8 shadow-xs relative">
            <AnimatePresence mode="wait">
              {savingCompleted ? (
                <motion.div
                  key="success-card"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6 py-6"
                >
                  <div className="inline-flex p-4.5 bg-emerald-50 border border-emerald-150 rounded-full text-emerald-600">
                    <FileCheck className="size-10 animate-bounce" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-black text-gray-950">Orçamento Concluido com Sucesso!</h2>
                    <p className="text-xs text-gray-500 font-semibold leading-relaxed max-w-sm mx-auto">
                      A proposta técnica para o cliente <strong className="text-black font-extrabold">{state.clientName}</strong> foi salva no Firestore com a margem líquida pretendida de {state.customMargin}%.
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl max-w-md mx-auto text-left space-y-3">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Metadados da Transação</span>
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-gray-900">
                      <div>ID de Cadastro:</div>
                      <div className="font-mono text-gray-500 text-right truncate">{lastQuoteIdSaved || 'Salvo em rascunhos'}</div>
                      <div>Preço de Venda Bruto:</div>
                      <div className="text-right text-indigo-600 font-black">R$ {breakdown.suggestedPrice.toFixed(2)}</div>
                      <div>Net Margin:</div>
                      <div className="text-right text-emerald-600 font-black">{yields.netMarginPercent}%</div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetForNewProposal}
                      className="px-5 py-3 bg-black hover:bg-zinc-900 text-white text-xs font-black rounded-2xl transition-all"
                    >
                      Criar Nova Proposta
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key={`step-${state.currentStep}`}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* Step Title/Header description */}
                  <div className="space-y-1 border-b border-gray-100 pb-4">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-black rounded-md uppercase">
                        Passo {state.currentStep} de 13
                      </span>
                    </div>
                    <h2 className="text-xl font-black text-gray-950">
                      {METADATA_STEPS[state.currentStep - 1].title}
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                      {METADATA_STEPS[state.currentStep - 1].description}
                    </p>
                  </div>

                  {/* STEP 1: INITIAL INFORMATION */}
                  {state.currentStep === 1 && (
                    <div className="grid gap-4.5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">Nome do Cliente / Identificador</label>
                        <div className="relative">
                          <User className="absolute left-4.5 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                          <input
                            type="text"
                            value={state.clientName}
                            onChange={(e) => setField('clientName', e.target.value)}
                            placeholder="Ex: Condomínio Residencial Jardins"
                            className="w-full pl-11.5 pr-4.5 py-3 bg-white border border-gray-200 focus:border-black rounded-2xl font-semibold text-sm outline-none transition-colors"
                          />
                        </div>
                        {currentValidation.errors.clientName && (
                          <span className="text-[10px] text-rose-500 font-bold block">{currentValidation.errors.clientName}</span>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">Telefone de Contato</label>
                          <input
                            type="tel"
                            value={state.clientPhone}
                            onChange={(e) => setField('clientPhone', e.target.value)}
                            placeholder="DDD + Número"
                            className="w-full px-4.5 py-3 bg-white border border-gray-200 focus:border-black rounded-2xl font-semibold text-sm outline-none transition-colors"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">Email Corporativo / Pessoal</label>
                          <input
                            type="email"
                            value={state.clientEmail}
                            onChange={(e) => setField('clientEmail', e.target.value)}
                            placeholder="cliente@provedor.com"
                            className="w-full px-4.5 py-3 bg-white border border-gray-200 focus:border-black rounded-2xl font-semibold text-sm outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-500 uppercase tracking-wider block">Notas e Observações Especiais</label>
                        <textarea
                          value={state.notes}
                          onChange={(e) => setField('notes', e.target.value)}
                          placeholder="Particularidades físicas como frestas de asfalto, barreiras sanitárias, etc."
                          rows={3}
                          className="w-full px-4.5 py-3 bg-white border border-gray-200 focus:border-black rounded-2xl font-semibold text-sm outline-none transition-colors resize-vertical"
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 2: ENVIRONMENT SELECTOR */}
                  {state.currentStep === 2 && (
                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block leading-none">Classificação de Ecossistema</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                        {[
                          { value: 'Residência', label: 'Residência', desc: 'Casas, quintais ou sobrados', icon: Home },
                          { value: 'Comércio', label: 'Comércio', desc: 'Escritórios, lojas e galpões', icon: Store },
                          { value: 'Indústria', label: 'Indústria', desc: 'Fábricas e plantas químicas', icon: Factory },
                          { value: 'Restaurante', label: 'Restaurantes', desc: 'Áreas de manuseio alimentar', icon: Flame },
                          { value: 'Condomínio', label: 'Condomínio', desc: 'Áreas comuns residenciais', icon: Building },
                          { value: 'Hospital', label: 'Hospital/Saúde', desc: 'Clínicas e UTIs estéreis', icon: HeartPlus },
                          { value: 'Área Externa', label: 'Áreas Externas', desc: 'Parques, terrenos e florestas', icon: TreePine }
                        ].map(item => {
                          const IconComp = item.icon;
                          const isSelected = state.environmentType === item.value;

                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setField('environmentType', item.value as EnvironmentType)}
                              className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all cursor-pointer space-y-2 select-none min-h-[110px]",
                                isSelected 
                                  ? "bg-black border-black text-white" 
                                  : "bg-white border-gray-150 text-gray-900 hover:border-gray-300"
                              )}
                            >
                              <IconComp className="size-5" />
                              <div>
                                <span className="text-xs font-black block leading-none">{item.label}</span>
                                <span className={cn("text-[9px] block leading-normal mt-0.5", isSelected ? "text-gray-300" : "text-gray-400")}>
                                  {item.desc}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 3: VECTORS SELECTOR */}
                  {state.currentStep === 3 && (
                    <div className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider block">Espécie de Vetor Alvo</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {['Baratas', 'Ratos', 'Cupins', 'Formigas', 'Escorpiões', 'Pulgas', 'Mosquitos', 'Percevejos', 'Outros'].map(p => {
                            const isSelected = state.pestType === p;
                            return (
                              <button
                                key={p}
                                type="button"
                                onClick={() => setField('pestType', p as PestType)}
                                className={cn(
                                  "px-4 py-3 rounded-xl border text-xs font-black uppercase text-center transition-all cursor-pointer flex items-center justify-center gap-2",
                                  isSelected 
                                    ? "bg-black border-black text-white" 
                                    : "bg-white border-gray-150 text-gray-800 hover:border-gray-300"
                                )}
                              >
                                <Bug className="size-4 flex-shrink-0" />
                                {p}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4 space-y-3">
                        <span className="text-xs font-black text-gray-400 uppercase tracking-wider block">Densidade de Infestação</span>
                        <div className="grid grid-cols-4 gap-2.5">
                          {['Baixo', 'Médio', 'Alto', 'Crítico'].map(level => {
                            const isSelected = state.infestationLevel === level;
                            return (
                              <button
                                key={level}
                                type="button"
                                onClick={() => setField('infestationLevel', level as InfestationLevel)}
                                className={cn(
                                  "py-3 rounded-xl border text-xs font-black block text-center transition-all cursor-pointer",
                                  isSelected 
                                    ? "bg-indigo-600 border-indigo-600 text-white" 
                                    : "bg-white border-gray-150 text-gray-700 hover:border-gray-200"
                                )}
                              >
                                {level}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: OPERATIONAL COMPLEXITY */}
                  {state.currentStep === 4 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider block">Complexidade de Operação</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Simples', 'Normal', 'Complexo'].map(comp => {
                            const isSelected = state.complexity === comp;
                            return (
                              <button
                                key={comp}
                                type="button"
                                onClick={() => setField('complexity', comp as OperationalComplexity)}
                                className={cn(
                                  "py-4.5 rounded-2xl border text-xs font-black text-center transition-all cursor-pointer",
                                  isSelected 
                                    ? "bg-black border-black text-white" 
                                    : "bg-white border-gray-150 text-gray-800 hover:border-gray-300"
                                )}
                              >
                                {comp}
                                <span className="block text-[8px] font-normal tracking-wide opacity-65 mt-1.5 leading-none">
                                  {comp === 'Simples' ? 'Sem riscos físicos' : comp === 'Normal' ? 'Controle padrão' : 'Altura / Espaço confinado'}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-gray-100 pt-4 space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-wider block">Regime de Atendimento (Gatilho de Urgência)</label>
                        <div className="grid grid-cols-3 gap-3">
                          {['Normal', 'Prioritário', 'Emergência'].map(urg => {
                            const isSelected = state.urgency === urg;
                            return (
                              <button
                                key={urg}
                                type="button"
                                onClick={() => setField('urgency', urg as UrgencyLevel)}
                                className={cn(
                                  "py-3 rounded-xl border text-xs font-bold block text-center transition-all cursor-pointer",
                                  isSelected 
                                    ? "bg-indigo-600 border-indigo-600 text-white animate-pulse" 
                                    : "bg-white border-gray-150 text-gray-700 hover:border-gray-200"
                                )}
                              >
                                {urg}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5: AREA SIZE */}
                  {state.currentStep === 5 && (
                    <div className="space-y-6">
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-wider">
                          <span>Dimensão Útil Total</span>
                          <span className="text-lg font-black text-black">{state.areaSize} m²</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={2000}
                          step={10}
                          value={state.areaSize}
                          onChange={(e) => setField('areaSize', Number(e.target.value))}
                          className="w-full accent-black cursor-pointer bg-gray-100 h-1 rounded-full border-none appearance-none"
                        />
                      </div>

                      <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex items-center gap-3.5">
                        <Smartphone className="size-5 text-gray-500 flex-shrink-0" />
                        <div className="text-[11px] font-semibold text-gray-600 leading-normal">
                          Configurador Inteligente: Alterações no m² aumentam proporcionalmente as dosagens mínimas recomendadas de calda ativa!
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: PRODUCTS SELECTION */}
                  {state.currentStep === 6 && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-wider leading-none">
                        <span>Produtos Recomendados PestFlow</span>
                        <span className="text-gray-500 font-bold">{state.selectedProducts.length} selecionados</span>
                      </div>

                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {chemicalDatabase.map(chem => {
                          const isSelected = state.selectedProducts.some(p => p.id === chem.id);
                          const chosenItem = state.selectedProducts.find(p => p.id === chem.id);

                          return (
                            <div
                              key={chem.id}
                              className={cn(
                                "p-4.5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4 select-none",
                                isSelected 
                                  ? "bg-white border-black/70 ring-1 ring-black/40" 
                                  : "bg-white border-gray-200 hover:border-gray-300"
                              )}
                            >
                              <div className="flex-1 space-y-1">
                                <h4 className="text-xs font-black text-black leading-tight">{chem.name}</h4>
                                <span className="text-[9px] text-gray-450 font-semibold block uppercase">
                                  Dose Ref: {chem.dosagePerM2} {chem.unitLabel}/m² • Custo: R$ {chem.unitCost.toFixed(2)}/{chem.unitLabel}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 justify-between md:justify-end">
                                {isSelected && chosenItem && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-gray-400 font-black">Dosagem:</span>
                                    <input
                                      type="number"
                                      step={0.01}
                                      value={chosenItem.dosagePerM2}
                                      onChange={(e) => adjustChemicalDosage(chem.id, Number(e.target.value))}
                                      className="w-16 px-1.5 py-1 bg-gray-50 border border-gray-200 hover:border-gray-400 rounded-lg text-center font-bold text-xs outline-none"
                                    />
                                    <span className="text-[10px] font-bold text-indigo-600 block">
                                      Total: {chosenItem.amountUsed.toFixed(0)} {chem.unitLabel}
                                    </span>
                                  </div>
                                )}

                                <button
                                  type="button"
                                  onClick={() => selectChemical(chem)}
                                  className={cn(
                                    "px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase transition-all flex items-center gap-1.5 cursor-pointer selection:bg-none",
                                    isSelected 
                                      ? "bg-black border-black text-white" 
                                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                                  )}
                                >
                                  {isSelected ? <Check className="size-3" /> : <Plus className="size-3" />}
                                  {isSelected ? 'Selecionado' : 'Selecionar'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 7: TEAM SIZE */}
                  {state.currentStep === 7 && (
                    <div className="space-y-6">
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-wider">
                          <span>Operadores Técnicos em Campo</span>
                          <span className="text-lg font-black text-black">{state.technicians} {state.technicians > 1 ? 'Técnicos' : 'Técnico'}</span>
                        </div>
                        <input
                          type="range"
                          min={1}
                          max={8}
                          step={1}
                          value={state.technicians}
                          onChange={(e) => setField('technicians', Number(e.target.value))}
                          className="w-full accent-black cursor-pointer bg-gray-100 h-1 rounded-full border-none appearance-none"
                        />
                      </div>

                      <div className="p-4 bg-gray-50 border border-gray-150 rounded-2xl flex items-center gap-3">
                        <Users className="size-5 text-gray-500" />
                        <p className="text-[10px] text-gray-600 font-bold leading-normal">
                          Custo de equipe computado com tarifas de hora técnica operacional cheia. Evite superdimensionamentos que restrinjam a margem real.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 8: DISPLACEMENT KM */}
                  {state.currentStep === 8 && (
                    <div className="space-y-6">
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-wider animate-out">
                          <span>Distância Total Ida e Volta (Km)</span>
                          <span className="text-lg font-black text-black">{state.displacement} Km</span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={250}
                          step={5}
                          value={state.displacement}
                          onChange={(e) => setField('displacement', Number(e.target.value))}
                          className="w-full accent-black cursor-pointer bg-gray-100 h-1 rounded-full border-none appearance-none"
                        />
                      </div>

                      <div className="p-4.5 bg-gray-50 border border-gray-150 rounded-2xl flex gap-3.5">
                        <Route className="size-5.5 text-gray-500 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-black text-black block mb-0.5">Depreciação de Rota</span>
                          <p className="text-[10px] text-gray-400 font-semibold leading-relaxed leading-3">
                            Viagens de longo percurso acima de 80km reduzem a viabilidade administrativa. Desgaste de pneu e consumo de combustível aplicam fatores multiplicadores de recomposição de preço.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 9: RECURRENCE */}
                  {state.currentStep === 9 && (
                    <div className="space-y-4">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-wider block leading-none">Contrato ou Frequência Comercial</label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {[
                          { value: 'Único', label: 'Operação Única', desc: 'Sem garantia estendida' },
                          { value: 'Mensal', label: 'Integral Mensal', desc: '12 faturamentos/ano' },
                          { value: 'Trimestral', label: 'Trimestral', desc: '4 intervenções físicas/ano' },
                          { value: 'Semestral', label: 'Semestral', desc: '2 intervenções físicas/ano' },
                          { value: 'Anual', label: 'Garantia Anual', desc: '1 faturamento global' }
                        ].map(item => {
                          const isSelected = state.recurrence === item.value;
                          return (
                            <button
                              key={item.value}
                              type="button"
                              onClick={() => setField('recurrence', item.value as Recurrence)}
                              className={cn(
                                "p-4 rounded-xl border text-center transition-all cursor-pointer min-h-[95px] flex flex-col justify-center space-y-1.5 selection:bg-none",
                                isSelected 
                                  ? "bg-black border-black text-white" 
                                  : "bg-white border-gray-150 text-gray-900 hover:border-gray-300"
                              )}
                            >
                              <span className="text-xs font-black block leading-none">{item.label}</span>
                              <span className={cn("text-[9px] block leading-normal", isSelected ? "text-gray-300" : "text-gray-400")}>
                                {item.desc}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* STEP 10: MARGIN ELASTICITY & SCENARIOS */}
                  {state.currentStep === 10 && (
                    <div className="space-y-6">
                      <div className="space-y-3.5">
                        <div className="flex justify-between items-center text-xs font-black text-gray-400 uppercase tracking-wider">
                          <span>Meta de Margem Líquida Pretendida</span>
                          <span className="text-lg font-black text-indigo-600">{state.customMargin}%</span>
                        </div>
                        <input
                          type="range"
                          min={20}
                          max={85}
                          step={5}
                          value={state.customMargin}
                          onChange={(e) => setField('customMargin', Number(e.target.value))}
                          className="w-full accent-black cursor-pointer bg-gray-100 h-1  rounded-full border-none appearance-none"
                        />
                      </div>

                      {/* Display Simulation scenarios comparison directly inside step 10! */}
                      <div className="border-t border-gray-100 pt-5">
                        <SimulationPanel
                          scenarios={simScenarios}
                          onApplyScenario={handleApplySimulatedMargin}
                        />
                      </div>
                    </div>
                  )}

                  {/* STEP 11: DETAILED BREAKDOWN METRICS */}
                  {state.currentStep === 11 && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5">
                        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Mão de Obra de Campo</span>
                          <div className="text-base font-black text-black">R$ {breakdown.directLaborCost.toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Gasto Logístico total</span>
                          <div className="text-base font-black text-black">R$ {breakdown.displacementCost.toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Custo Bruto Insumos</span>
                          <div className="text-base font-black text-black">R$ {breakdown.chemicalsCost.toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Rateio Geral Overhead</span>
                          <div className="text-base font-black text-black">R$ {breakdown.indirectOverheadCost.toFixed(2)}</div>
                        </div>
                        <div className="bg-gray-50 border border-gray-150 rounded-2xl p-4 space-y-1">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block leading-none">Encargo Tributação Bruto</span>
                          <div className="text-base font-black text-black">R$ {(breakdown.suggestedPrice * 0.09).toFixed(2)}</div>
                        </div>
                        <div className="bg-indigo-50 border border-indigo-150 rounded-2xl p-4 space-y-1">
                          <span className="text-[9px] font-black text-indigo-700 uppercase tracking-widest block leading-none">Margem Líquida Real</span>
                          <div className="text-base font-black text-indigo-950">{yields.netMarginPercent}%</div>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl space-y-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest block leading-none">Observações de Cálculos</span>
                        <p className="text-[10px] text-gray-400 leading-normal font-semibold">
                          Os rateios acima consideram custos indiretos gerais de operação e tributos federais integrados para formulação de faturas transparentes e autolimpantes.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* STEP 12: GENERAL REVIEW */}
                  {state.currentStep === 12 && (
                    <div className="space-y-4">
                      <QuoteReview state={state} />
                    </div>
                  )}

                  {/* STEP 13: END SUBMISSION GENERATOR */}
                  {state.currentStep === 13 && (
                    <div className="text-center space-y-6 py-6 animate-in fade-in zoom-in duration-300">
                      <div className="inline-flex p-4 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full">
                        <FileCheck className="size-8" />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-black text-gray-950">Pronto para Consolidar?</h3>
                        <p className="text-xs text-gray-400 font-semibold max-w-sm mx-auto leading-relaxed">
                          PestFlow revisou as composições técnicas e não detectou distorções no piso de custos. Pressione o botão para registrar o faturamento no log do cliente.
                        </p>
                      </div>

                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={handleFinalizeQuoteSubmission}
                          className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-md"
                        >
                          <Save className="size-4" /> Consolidar Proposta Direta
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step Warning notifications */}
                  <div className="mt-4">
                    <WorkflowAlerts alerts={alerts} />
                  </div>

                  {/* Page bottom Navigator controls */}
                  <div className="flex justify-between items-center border-t border-gray-100 pt-5 mt-6">
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      disabled={state.currentStep === 1}
                      className={cn(
                        "flex items-center gap-2 border rounded-xl px-4 py-2.5 text-xs font-black transition-all select-none cursor-pointer",
                        state.currentStep === 1 
                          ? "border-gray-100 text-gray-300 cursor-not-allowed" 
                          : "border-gray-200 text-gray-700 hover:border-black hover:text-black"
                      )}
                    >
                      <ArrowLeft className="size-3.5" /> Anterior
                    </button>

                    {state.currentStep < 13 ? (
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex items-center gap-2 bg-black hover:bg-zinc-900 border border-black text-white rounded-xl px-4 py-2.5 text-xs font-black transition-all select-none cursor-pointer"
                      >
                        Avançar <ArrowRight className="size-3.5" />
                      </button>
                    ) : (
                      <div className="size-1" />
                    )}
                  </div>

                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Live score card on the right */}
        <div className="lg:col-span-4 space-y-6">
          <WorkflowSidebar state={state} lastSavedTime={lastSavedTime} />
        </div>

      </div>
    </div>
  );
}
