import { create } from 'zustand';
import { loggerMiddleware } from '../middleware/logger';
import { PresenceUser } from '../types';

export interface RealtimeState {
  isOnline: boolean;
  isSyncing: boolean;
  latencyMs: number;
  activeSubscriptions: string[]; // List of active Firestore subscription paths
  presentUsers: PresenceUser[];

  // Actions
  setOnlineStatus: (isOnline: boolean) => void;
  setSyncing: (isSyncing: boolean) => void;
  setLatency: (ms: number) => void;
  registerSubscription: (path: string) => void;
  unregisterSubscription: (path: string) => void;
  addPresentUser: (user: PresenceUser) => void;
  removePresentUser: (uid: string) => void;
  updateUserPresenceView: (uid: string, viewName: string) => void;
  clearAllSubscriptions: () => void;
}

export const useRealtimeStore = create<RealtimeState>()(
  loggerMiddleware((set, get) => ({
    isOnline: typeof window !== 'undefined' ? window.navigator.onLine : true,
    isSyncing: false,
    latencyMs: 15,
    activeSubscriptions: [],
    presentUsers: [
      { uid: 'u_01', displayName: 'Gabriel Max (Você)', email: 'gabriel@ddsulf.com', role: 'admin', activeView: 'Calculadora Operacional', lastActive: new Date().toISOString() },
      { uid: 'u_02', displayName: 'Patrícia Souza', email: 'patricia@ddsulf.com', role: 'commercial', activeView: 'Financeiro', lastActive: new Date().toISOString() }
    ],

    setOnlineStatus: (isOnline) => set({ isOnline }),
    
    setSyncing: (isSyncing) => set({ isSyncing }),

    setLatency: (latencyMs) => set({ latencyMs }),

    registerSubscription: (path) => set((state) => {
      if (state.activeSubscriptions.includes(path)) return {};
      return { activeSubscriptions: [...state.activeSubscriptions, path] };
    }),

    unregisterSubscription: (path) => set((state) => ({
      activeSubscriptions: state.activeSubscriptions.filter(p => p !== path)
    })),

    addPresentUser: (user) => set((state) => {
      const exists = state.presentUsers.some(u => u.uid === user.uid);
      if (exists) {
        return {
          presentUsers: state.presentUsers.map(u => u.uid === user.uid ? user : u)
        };
      }
      return { presentUsers: [...state.presentUsers, user] };
    }),

    removePresentUser: (uid) => set((state) => ({
      presentUsers: state.presentUsers.filter(u => u.uid !== uid)
    })),

    updateUserPresenceView: (uid, viewName) => set((state) => ({
      presentUsers: state.presentUsers.map(u => 
        u.uid === uid 
          ? { ...u, activeView: viewName, lastActive: new Date().toISOString() } 
          : u
      )
    })),

    clearAllSubscriptions: () => set({ activeSubscriptions: [] })
  }))
);
