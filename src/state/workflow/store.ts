import { create } from 'zustand';
import { loggerMiddleware } from '../middleware/logger';
import { QuoteDraft, WorkflowStep } from '../types';
import { persistenceService } from '../persistence/persistenceService';

export interface WorkflowState {
  steps: WorkflowStep[];
  currentStepIndex: number;
  activeDraft: QuoteDraft | null;
  savedDrafts: QuoteDraft[];
  undoStack: QuoteDraft[];
  redoStack: QuoteDraft[];

  // Actions
  initializeWorkflow: (steps: Omit<WorkflowStep, 'id'>[]) => void;
  nextStep: () => void;
  prevStep: () => void;
  jumpToStep: (index: number) => void;
  startNewDraft: (clientName: string) => QuoteDraft;
  updateActiveDraft: (draftUpdate: Partial<QuoteDraft['inputs']>, breakdownUpdate?: Partial<QuoteDraft['breakdown']>) => void;
  undoDraftChange: () => void;
  redoDraftChange: () => void;
  autosaveDraft: () => void;
  loadDraftsFromStorage: () => void;
  deleteDraftFromStorage: (id: string) => void;
  resetWorkflow: () => void;
}

const defaultSteps: WorkflowStep[] = [
  { index: 0, title: 'Identificação', isCompleted: false, isValid: false },
  { index: 1, title: 'Insumos Químicos', isCompleted: false, isValid: false },
  { index: 2, title: 'Simulação Financeira', isCompleted: false, isValid: false },
  { index: 3, title: 'Consolidação', isCompleted: false, isValid: false },
];

export const useWorkflowStore = create<WorkflowState>()(
  loggerMiddleware((set, get) => ({
    steps: defaultSteps,
    currentStepIndex: 0,
    activeDraft: null,
    savedDrafts: [],
    undoStack: [],
    redoStack: [],

    initializeWorkflow: (stepsList) => set({
      steps: stepsList.map((s, i) => ({ ...s, index: i }))
    }),

    nextStep: () => set((state) => {
      const nextIndex = Math.min(state.currentStepIndex + 1, state.steps.length - 1);
      const updatedSteps = state.steps.map((s, i) => 
        i === state.currentStepIndex ? { ...s, isCompleted: true } : s
      );
      return { 
        currentStepIndex: nextIndex,
        steps: updatedSteps
      };
    }),

    prevStep: () => set((state) => ({
      currentStepIndex: Math.max(state.currentStepIndex - 1, 0)
    })),

    jumpToStep: (index) => set((state) => ({
      currentStepIndex: Math.max(0, Math.min(index, state.steps.length - 1))
    })),

    startNewDraft: (clientName) => {
      const newDraft: QuoteDraft = {
        id: `draft_${Math.random().toString(36).substring(2, 9)}`,
        inputs: { clientName, areaSize: 100, pestType: 'Baratas', environmentType: 'Residencial' },
        breakdown: {},
        currentStep: 0,
        updatedAt: new Date().toISOString(),
        version: 1
      };
      set({ 
        activeDraft: newDraft,
        currentStepIndex: 0,
        undoStack: [],
        redoStack: []
      });
      get().autosaveDraft();
      return newDraft;
    },

    updateActiveDraft: (draftUpdate, breakdownUpdate) => {
      const { activeDraft, undoStack } = get();
      if (!activeDraft) return;

      // Keep copy for undo
      const draftHistoryCopy = JSON.parse(JSON.stringify(activeDraft));

      const updatedDraft: QuoteDraft = {
        ...activeDraft,
        inputs: { ...activeDraft.inputs, ...draftUpdate },
        breakdown: breakdownUpdate ? { ...activeDraft.breakdown, ...breakdownUpdate } : activeDraft.breakdown,
        updatedAt: new Date().toISOString(),
        version: activeDraft.version + 1
      };

      set({
        activeDraft: updatedDraft,
        undoStack: [...undoStack, draftHistoryCopy],
        redoStack: [] // clear redo stack on new action
      });

      // Quick autosave
      get().autosaveDraft();
    },

    undoDraftChange: () => {
      const { activeDraft, undoStack, redoStack } = get();
      if (undoStack.length === 0 || !activeDraft) return;

      const previous = undoStack[undoStack.length - 1];
      const remainingUndo = undoStack.slice(0, -1);

      set({
        activeDraft: previous,
        undoStack: remainingUndo,
        redoStack: [activeDraft, ...redoStack]
      });
      get().autosaveDraft();
    },

    redoDraftChange: () => {
      const { activeDraft, undoStack, redoStack } = get();
      if (redoStack.length === 0 || !activeDraft) return;

      const next = redoStack[0];
      const remainingRedo = redoStack.slice(1);

      set({
        activeDraft: next,
        undoStack: [...undoStack, activeDraft],
        redoStack: remainingRedo
      });
      get().autosaveDraft();
    },

    autosaveDraft: () => {
      const { activeDraft, savedDrafts } = get();
      if (!activeDraft) return;

      const listWithoutDraft = savedDrafts.filter(d => d.id !== activeDraft.id);
      const updatedList = [activeDraft, ...listWithoutDraft];
      
      set({ savedDrafts: updatedList });
      persistenceService.save<QuoteDraft[]>('saved_drafts', updatedList);
    },

    loadDraftsFromStorage: () => {
      const loaded = persistenceService.load<QuoteDraft[]>('saved_drafts', []);
      set({ savedDrafts: loaded });
    },

    deleteDraftFromStorage: (id) => {
      const { savedDrafts, activeDraft } = get();
      const updated = savedDrafts.filter(d => d.id !== id);
      set({ 
        savedDrafts: updated,
        activeDraft: activeDraft?.id === id ? null : activeDraft
      });
      persistenceService.save<QuoteDraft[]>('saved_drafts', updated);
    },

    resetWorkflow: () => {
      set({
        currentStepIndex: 0,
        activeDraft: null,
        undoStack: [],
        redoStack: []
      });
    }
  }))
);
