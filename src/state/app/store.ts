import { create } from 'zustand';
import { loggerMiddleware } from '../middleware/logger';
import { SystemMetadata } from '../types';

export interface AppState {
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  activeView: 'dashboard' | 'calculator' | 'financial' | 'analytics' | 'inventory' | string;
  metadata: SystemMetadata;

  // Actions
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  setActiveView: (view: string) => void;
  updateMetadata: (meta: Partial<SystemMetadata>) => void;
}

export const useAppStore = create<AppState>()(
  loggerMiddleware((set) => ({
    theme: 'light',
    sidebarOpen: true,
    activeView: 'dashboard',
    metadata: {
      apiVersion: 'v1.4.0',
      deployedEnvironment: 'production-cloud-run',
      latencyMs: 12,
      lastSuccessfulSync: new Date().toISOString(),
      storageUsageBytes: 4120
    },

    toggleTheme: () => set((state) => ({ 
      theme: state.theme === 'light' ? 'dark' : 'light' 
    })),

    setTheme: (theme) => set({ theme }),

    toggleSidebar: () => set((state) => ({ 
      sidebarOpen: !state.sidebarOpen 
    })),

    setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

    setActiveView: (activeView) => set({ activeView }),

    updateMetadata: (newMeta) => set((state) => ({
      metadata: { ...state.metadata, ...newMeta }
    }))
  }))
);
