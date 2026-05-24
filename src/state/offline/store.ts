import { create } from 'zustand';
import { loggerMiddleware } from '../middleware/logger';
import { OutgoingSyncTask, SyncActionType } from '../types';
import { persistenceService } from '../persistence/persistenceService';

export interface OfflineState {
  syncQueue: OutgoingSyncTask[];
  isProcessingQueue: boolean;
  failedTasksHistory: OutgoingSyncTask[];

  // Actions
  enqueueTask: (collection: string, documentId: string, action: SyncActionType, payload: any) => void;
  dequeueTask: (taskId: string) => void;
  incrementRetryCount: (taskId: string, errorMessage: string) => void;
  moveToFailedHistory: (taskId: string) => void;
  loadQueueFromStorage: () => void;
  clearSyncQueue: () => void;
  setProcessingQueue: (processing: boolean) => void;
}

export const useOfflineStore = create<OfflineState>()(
  loggerMiddleware((set, get) => ({
    syncQueue: [],
    isProcessingQueue: false,
    failedTasksHistory: [],

    enqueueTask: (collection, documentId, action, payload) => {
      const { syncQueue } = get();
      
      const newTask: OutgoingSyncTask = {
        id: `task_${Math.random().toString(36).substring(2, 9)}`,
        collection,
        documentId,
        action,
        payload,
        timestamp: new Date().toISOString(),
        retryCount: 0
      };

      const updatedQueue = [...syncQueue, newTask];
      set({ syncQueue: updatedQueue });
      persistenceService.save<OutgoingSyncTask[]>('offline_sync_queue', updatedQueue);
    },

    dequeueTask: (taskId) => {
      const { syncQueue } = get();
      const updatedQueue = syncQueue.filter(t => t.id !== taskId);
      set({ syncQueue: updatedQueue });
      persistenceService.save<OutgoingSyncTask[]>('offline_sync_queue', updatedQueue);
    },

    incrementRetryCount: (taskId, errorMessage) => {
      const { syncQueue } = get();
      const updatedQueue = syncQueue.map((t) =>
        t.id === taskId
          ? { ...t, retryCount: t.retryCount + 1, error: errorMessage }
          : t
      );
      set({ syncQueue: updatedQueue });
      persistenceService.save<OutgoingSyncTask[]>('offline_sync_queue', updatedQueue);
    },

    moveToFailedHistory: (taskId) => {
      const { syncQueue, failedTasksHistory } = get();
      const task = syncQueue.find(t => t.id === taskId);
      if (!task) return;

      const updatedQueue = syncQueue.filter(t => t.id !== taskId);
      set({
        syncQueue: updatedQueue,
        failedTasksHistory: [...failedTasksHistory, task]
      });
      persistenceService.save<OutgoingSyncTask[]>('offline_sync_queue', updatedQueue);
    },

    loadQueueFromStorage: () => {
      const loaded = persistenceService.load<OutgoingSyncTask[]>('offline_sync_queue', []);
      set({ syncQueue: loaded });
    },

    clearSyncQueue: () => {
      set({ syncQueue: [] });
      persistenceService.save<OutgoingSyncTask[]>('offline_sync_queue', []);
    },

    setProcessingQueue: (isProcessingQueue) => set({ isProcessingQueue })
  }))
);
