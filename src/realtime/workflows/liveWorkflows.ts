import { eventBus } from '../events/eventBus';
import { offlineQueue } from '../offline/offlineQueue';
import { syncEngine } from '../synchronization/syncEngine';
import { generateUUID } from '../utils';

export interface LiveDraft {
  id: string;
  clientName: string;
  pestType: string;
  areaSize: number;
  complexity: 'Baixa' | 'Média' | 'Alta' | 'Crítica';
  displacementDistance: number;
  finalPrice: number;
  currentStep: number;
  updatedAt: string;
  isSynced: boolean;
}

export class LiveWorkflowsManager {
  private static instance: LiveWorkflowsManager;
  private activeDrafts = new Map<string, LiveDraft>();

  public static getInstance(): LiveWorkflowsManager {
    if (!LiveWorkflowsManager.instance) {
      LiveWorkflowsManager.instance = new LiveWorkflowsManager();
    }
    return LiveWorkflowsManager.instance;
  }

  /**
   * Initializes a fresh draft in the active cache memory
   */
  public createDraft(clientName: string): LiveDraft {
    const draft: LiveDraft = {
      id: generateUUID('dft'),
      clientName,
      pestType: 'Baratas',
      areaSize: 100,
      complexity: 'Média',
      displacementDistance: 20,
      finalPrice: 0,
      currentStep: 0,
      updatedAt: new Date().toISOString(),
      isSynced: false,
    };

    this.activeDrafts.set(draft.id, draft);
    this.autosave(draft);
    return draft;
  }

  /**
   * Commits partial user shifts immediately to memory cache and dispatches background replication
   */
  public updateDraft(draftId: string, updates: Partial<LiveDraft>): LiveDraft | null {
    const existing = this.activeDrafts.get(draftId);
    if (!existing) return null;

    const updated: LiveDraft = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      isSynced: false,
    };

    this.activeDrafts.set(draftId, updated);
    this.autosave(updated);

    // Notify state components
    eventBus.publish('workflow:draft_updated', updated);

    return updated;
  }

  /**
   * Finalize draft quote and promote it into full order status
   */
  public completeWorkflow(draftId: string): void {
    const draft = this.activeDrafts.get(draftId);
    if (draft) {
      eventBus.publish('workflow:completed', draft);
      this.activeDrafts.delete(draftId);
    }
  }

  /**
   * Safe persistent action. Saves to offline queue and triggers background flushing
   */
  private async autosave(draft: LiveDraft): Promise<void> {
    const health = syncEngine.getHealth();
    
    // Save draft into our offline IndexedDB queue using high priority (2)
    await offlineQueue.enqueue('quotes', draft.id, 'CREATE', draft, 2);

    if (health.isOnline) {
      syncEngine.processBacklog();
      draft.isSynced = true;
    }
  }

  public getDraft(id: string): LiveDraft | undefined {
    return this.activeDrafts.get(id);
  }

  public getActiveDraftsList(): LiveDraft[] {
    return Array.from(this.activeDrafts.values());
  }
}

export const liveWorkflowsManager = LiveWorkflowsManager.getInstance();
