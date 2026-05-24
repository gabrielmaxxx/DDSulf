import { create } from 'zustand';

export interface SyncTask {
  id: string;
  collection: string;
  action: 'create' | 'update' | 'delete';
  payload: any;
  timestamp: string;
}

export interface RealtimeState {
  isOnline: boolean;
  isSyncing: boolean;
  syncQueue: SyncTask[];
  activeSubscriptionsCount: number;
  
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  enqueueSyncTask: (task: Omit<SyncTask, 'id' | 'timestamp'>) => void;
  dequeueSyncTask: (id: string) => void;
  clearSyncQueue: () => void;
  
  incrementActiveSubscriptions: () => void;
  decrementActiveSubscriptions: () => void;
}

export const useRealtimeStore = create<RealtimeState>((set) => ({
  isOnline: typeof window !== 'undefined' ? window.navigator.onLine : true,
  isSyncing: false,
  syncQueue: [],
  activeSubscriptionsCount: 0,

  setOnlineStatus: (isOnline) => set({ isOnline }),
  setSyncing: (isSyncing) => set({ isSyncing }),
  
  enqueueSyncTask: (task) => set((state) => {
    const newTask: SyncTask = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString()
    };
    return { syncQueue: [...state.syncQueue, newTask] };
  }),
  
  dequeueSyncTask: (id) => set((state) => ({
    syncQueue: state.syncQueue.filter((t) => t.id !== id)
  })),
  
  clearSyncQueue: () => set({ syncQueue: [] }),
  
  incrementActiveSubscriptions: () => set((state) => ({ 
    activeSubscriptionsCount: state.activeSubscriptionsCount + 1 
  })),
  
  decrementActiveSubscriptions: () => set((state) => ({ 
    activeSubscriptionsCount: Math.max(0, state.activeSubscriptionsCount - 1) 
  })),
}));

export default useRealtimeStore;
