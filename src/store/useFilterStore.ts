import { create } from 'zustand';

export interface FilterState {
  startDate: string | null;
  endDate: string | null;
  searchQuery: string;
  statusFilter: string | null;
  pestFilter: string | null;
  categoryFilter: string | null;
  
  setDates: (start: string | null, end: string | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string | null) => void;
  setPestFilter: (pest: string | null) => void;
  setCategoryFilter: (category: string | null) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  startDate: null,
  endDate: null,
  searchQuery: '',
  statusFilter: null,
  pestFilter: null,
  categoryFilter: null,

  setDates: (start, end) => set({ startDate: start, endDate: end }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  setPestFilter: (pest) => set({ pestFilter: pest }),
  setCategoryFilter: (category) => set({ categoryFilter: category }),
  resetFilters: () => set({
    startDate: null,
    endDate: null,
    searchQuery: '',
    statusFilter: null,
    pestFilter: null,
    categoryFilter: null,
  }),
}));

export default useFilterStore;
