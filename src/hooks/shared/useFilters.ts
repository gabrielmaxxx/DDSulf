import { useFilterStore } from '@/store/useFilterStore';

export function useFilters() {
  const {
    startDate,
    endDate,
    searchQuery,
    statusFilter,
    pestFilter,
    categoryFilter,
    setDates,
    setSearchQuery,
    setStatusFilter,
    setPestFilter,
    setCategoryFilter,
    resetFilters
  } = useFilterStore();

  return {
    startDate,
    endDate,
    searchQuery,
    statusFilter,
    pestFilter,
    categoryFilter,
    setDates,
    setSearchQuery,
    setStatusFilter,
    setPestFilter,
    setCategoryFilter,
    reset: resetFilters
  };
}

export default useFilters;
