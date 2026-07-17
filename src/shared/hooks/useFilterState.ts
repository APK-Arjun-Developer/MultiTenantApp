import { useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { SEARCH_DEBOUNCE_MS } from '@/shared/constants/list';
import type { FilterValues } from '@/types/api';

const useFilterState = <T extends object>(initial: T, setPage: (page: number) => void) => {
  const [filter, setFilter] = useState<T>(initial);

  const rawSearch = (filter as Record<string, unknown>)['search'];
  const debouncedSearch = useDebounce(
    typeof rawSearch === 'string' ? rawSearch : '',
    SEARCH_DEBOUNCE_MS,
  );

  const handleFilterChange = useCallback(
    (values: FilterValues) => {
      setFilter(values as T);
      setPage(0);
    },
    [setPage],
  );

  return { filter, debouncedSearch, handleFilterChange };
};

export { useFilterState };
