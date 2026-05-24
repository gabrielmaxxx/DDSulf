import { create } from 'zustand';

export interface UIModalState {
  isOpen: boolean;
  type: string | null;
  data: any;
}

export interface UIState {
  sidebarOpen: boolean;
  activeTab: string;
  isMobileDrawerOpen: boolean;
  modal: UIModalState;
  toasts: Array<{ id: string; message: string; type: 'success' | 'error' | 'info' }>;
  
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
  toggleMobileDrawer: () => void;
  setMobileDrawerOpen: (open: boolean) => void;
  
  // Modal Actions
  openModal: (type: string, data?: any) => void;
  closeModal: () => void;
  
  // Quick actions overlays
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissNotification: (id: string) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  activeTab: 'dashboard',
  isMobileDrawerOpen: false,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
  toasts: [],

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleMobileDrawer: () => set((state) => ({ isMobileDrawerOpen: !state.isMobileDrawerOpen })),
  setMobileDrawerOpen: (open) => set({ isMobileDrawerOpen: open }),
  
  openModal: (type, data = null) => set({
    modal: {
      isOpen: true,
      type,
      data,
    }
  }),
  
  closeModal: () => set({
    modal: {
      isOpen: false,
      type: null,
      data: null,
    }
  }),

  showNotification: (message, type = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    set((state) => ({
      toasts: [...state.toasts, { id, message, type }]
    }));
    
    // Auto dismiss after 4 seconds
    setTimeout(() => {
      get().dismissNotification(id);
    }, 4000);
  },

  dismissNotification: (id) => set((state) => ({
    toasts: state.toasts.filter((t) => t.id !== id)
  })),
}));

export default useUIStore;
