import { useState, useCallback } from 'react';

export interface UsePaginationOptions {
  initialLimit?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(options.initialLimit || 10);
  const [totalPages, setTotalPages] = useState(1);

  const nextPage = useCallback(() => {
    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev));
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => (prev > 1 ? prev - 1 : prev));
  }, []);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const setTotalItems = useCallback((totalItemsCount: number) => {
    const pages = Math.ceil(totalItemsCount / limit);
    setTotalPages(pages || 1);
  }, [limit]);

  return {
    currentPage,
    limit,
    totalPages,
    nextPage,
    prevPage,
    goToPage,
    setLimit,
    setTotalItems,
  };
}

export default usePagination;
