import { useState, useEffect, useMemo, useCallback } from 'react';
import { QuoteWorkflowState, CurrentStepIndex, StepMetadata } from '../types';
import { ProductCostItem } from '../../types';
import { validationService } from '../services/validationService';
import { autosaveService } from '../services/autosaveService';
import { draftService } from '../services/draftService';
import { workflowService } from '../services/workflowService';
import { toast } from 'sonner';

export const METADATA_STEPS: StepMetadata[] = [
  { number: 1, title: 'Contato Inicial', subtitle: 'Cadastro do cliente', description: 'Atribua o nome de identificação da proposta e dados de correspondência básica.', category: 'Cadastro' },
  { number: 2, title: 'Ambiente Base', subtitle: 'Tipo de local', description: 'Selecione a classificação do ecossistema físico para calcular dispersões de overhead.', category: 'Operacional' },
  { number: 3, title: 'Praga Regulada', subtitle: 'Vetor biológico', description: 'Defina a praga-alvo dominante que motivou a abertura da calibração.', category: 'Operacional' },
  { number: 4, title: 'Estratégia & Risco', subtitle: 'Urgência e esforço', description: 'Informe o nível de risco operacional e a urgência técnica do atendimento.', category: 'Operacional' },
  { number: 5, title: 'Área Atendida', subtitle: 'Dimensão total (m²)', description: 'Determine a área superficial exata para estimar o consumo volumétrico ideal.', category: 'Operacional' },
  { number: 6, title: 'Calda Ativa', subtitle: 'Formulações químicas', description: 'Alouque os insumos ativos e as dosagens padrão de aspersão superficial m².', category: 'Operacional' },
  { number: 7, title: 'Técnicos Alocados', subtitle: 'Dimensionamento de equipe', description: 'Escolha o quantitativo de profissionais enviados a campo para intervenção.', category: 'Operacional' },
  { number: 8, title: 'Logística de Campo', subtitle: 'Deslocamento (Km)', description: 'Calcule a distância rodada para amortizar combustível e fadiga automotiva.', category: 'Operacional' },
  { number: 9, title: 'Fluxo Contratual', subtitle: 'Regime de recorrência', description: 'Atribua contratos recorrentes para mitigar custos de aquisição comercial.', category: 'Comercial' },
  { number: 10, title: 'Elasticidade de Lucro', subtitle: 'Painel de margem', description: 'Dimensione a margem de faturamento final desejada para regular o preço.', category: 'Finanças' },
  { number: 11, title: 'Visão Detalhada', subtitle: 'Métricas da operação', description: 'Inspecione a divisão cirúrgica de despesas fixas, variáveis e faturamento.', category: 'Finanças' },
  { number: 12, title: 'Análise de Saúde', subtitle: 'Revisão e viabilidade', description: 'Avalie sugestões automáticas baseadas em complexidade e elasticidade.', category: 'Finanças' },
  { number: 13, title: 'Fechamento de Orçamento', subtitle: 'Finalização do plano', description: 'Assine e consolide a proposta técnica em registros comerciais estáveis.', category: 'Conclusão' }
];

export function useQuoteWorkflow() {
  const [state, setState] = useState<QuoteWorkflowState>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    pestType: 'Baratas',
    environmentType: 'Residência',
    areaSize: 100,
    infestationLevel: 'Médio',
    complexity: 'Normal',
    displacement: 20,
    technicians: 1,
    urgency: 'Normal',
    recurrence: 'Único',
    selectedProducts: [],
    customMargin: 55,
    notes: '',
    additionalCosts: 0,
    currentStep: 1,
    maxStepReached: 1,
    budgetStartedAt: new Date().toISOString(),
    isOfflineDraft: true,
    version: '1.0.0'
  });

  const [lastSavedTime, setLastSavedTime] = useState<string>('');
  const [chemicalDatabase, setChemicalDatabase] = useState<ProductCostItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load database chemicals and look for active draft on startup
  useEffect(() => {
    async function init() {
      try {
        const products = await workflowService.getChemicalProducts();
        setChemicalDatabase(products);

        const draft = draftService.getLatestLocalDraft();
        if (draft) {
          setState(draft.state);
          setLastSavedTime(new Date(draft.timestamp).toLocaleTimeString());
        }
      } catch (e) {
        console.warn('Draft recovery failed. Booting standard state.', e);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // Update dynamic fields state values
  const setField = useCallback(<K extends keyof QuoteWorkflowState>(key: K, value: QuoteWorkflowState[K]) => {
    setState(prev => {
      const updated = { ...prev, [key]: value };
      
      // Auto-recalculate dosages if areaSize or selected products changed
      if (key === 'areaSize' && typeof value === 'number') {
        updated.selectedProducts = prev.selectedProducts.map(p => ({
          ...p,
          amountUsed: Number((value * p.dosagePerM2).toFixed(2)),
          totalCost: Number((value * p.dosagePerM2 * p.unitCost).toFixed(2))
        }));
      }

      // Auto-save typing debounced events
      autosaveService.triggerAutosave(updated, t => setLastSavedTime(t));
      return updated;
    });
  }, []);

  // Navigation commands
  const handleNextStep = useCallback(() => {
    const check = validationService.validateStep(state.currentStep, state);
    if (!check.isValid) {
      const firstError = Object.values(check.errors)[0];
      toast.error(firstError);
      return false;
    }

    if (Object.keys(check.warnings).length > 0) {
      const firstWarning = Object.values(check.warnings)[0];
      toast.warning(firstWarning);
    }

    setState(prev => {
      const next = (prev.currentStep + 1) as CurrentStepIndex;
      if (next > METADATA_STEPS.length) return prev;
      
      const updated = {
        ...prev,
        currentStep: next,
        maxStepReached: Math.max(prev.maxStepReached, next)
      };
      draftService.saveLatestLocalDraft(updated);
      workflowService.trackAnalytics('step_advanced', { from: prev.currentStep, to: next });
      return updated;
    });
    return true;
  }, [state]);

  const handlePrevStep = useCallback(() => {
    setState(prev => {
      const prevStep = (prev.currentStep - 1) as CurrentStepIndex;
      if (prevStep < 1) return prev;

      const updated = { ...prev, currentStep: prevStep };
      draftService.saveLatestLocalDraft(updated);
      workflowService.trackAnalytics('step_regressed', { from: prev.currentStep, to: prevStep });
      return updated;
    });
  }, []);

  const jumpToStep = useCallback((target: CurrentStepIndex) => {
    // Prevent skipping steps without completing prior ones
    if (target > state.maxStepReached) {
      toast.error('Complete as etapas anteriores antes de avançar livremente.');
      return;
    }

    setState(prev => {
      const updated = { ...prev, currentStep: target };
      draftService.saveLatestLocalDraft(updated);
      workflowService.trackAnalytics('step_jump', { from: prev.currentStep, target });
      return updated;
    });
  }, [state.maxStepReached]);

  const resetWorkflow = useCallback(() => {
    draftService.clearActiveDraft();
    setState({
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      pestType: 'Baratas',
      environmentType: 'Residência',
      areaSize: 100,
      infestationLevel: 'Médio',
      complexity: 'Normal',
      displacement: 20,
      technicians: 1,
      urgency: 'Normal',
      recurrence: 'Único',
      selectedProducts: [],
      customMargin: 55,
      notes: '',
      additionalCosts: 0,
      currentStep: 1,
      maxStepReached: 1,
      budgetStartedAt: new Date().toISOString(),
      isOfflineDraft: true,
      version: '1.0.0'
    });
    setLastSavedTime('');
    toast.success('Workflow operacional reiniciado. Cache limpo.');
  }, []);

  const selectChemical = useCallback((chemical: ProductCostItem) => {
    setState(prev => {
      const foundIdx = prev.selectedProducts.findIndex(p => p.id === chemical.id);
      let updatedProducts = [...prev.selectedProducts];

      if (foundIdx >= 0) {
        updatedProducts = updatedProducts.filter(p => p.id !== chemical.id);
      } else {
        const dosage = chemical.dosagePerM2;
        const totalUsed = prev.areaSize * dosage;
        updatedProducts.push({
          ...chemical,
          amountUsed: Number(totalUsed.toFixed(2)),
          totalCost: Number((totalUsed * chemical.unitCost).toFixed(2))
        });
      }

      const updated = { ...prev, selectedProducts: updatedProducts };
      draftService.saveLatestLocalDraft(updated);
      return updated;
    });
  }, []);

  const adjustChemicalDosage = useCallback((productId: string, dosage: number) => {
    setState(prev => {
      const updatedProducts = prev.selectedProducts.map(p => {
        if (p.id === productId) {
          const totalUsed = prev.areaSize * dosage;
          return {
            ...p,
            dosagePerM2: dosage,
            amountUsed: Number(totalUsed.toFixed(2)),
            totalCost: Number((totalUsed * p.unitCost).toFixed(2))
          };
        }
        return p;
      });

      const updated = { ...prev, selectedProducts: updatedProducts };
      draftService.saveLatestLocalDraft(updated);
      return updated;
    });
  }, []);

  return {
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
    loadingSteps: loading
  };
}
