import { useCallback, useState } from 'react';

import { DEFAULT_PAGE_SIZE } from '@/shared/constants/list';
import type { SortOrder } from '@/types';

interface UseTableStateOptions {
  initialPageSize?: number;
}

const useTableState = (options?: UseTableStateOptions) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(options?.initialPageSize ?? DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSortChange = useCallback(
    (newSortBy: string | undefined, newSortOrder: SortOrder | undefined) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder ?? 'asc');
      setPage(0);
    },
    [],
  );

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(0);
  }, []);

  const activeSortOrder = sortBy ? sortOrder : undefined;

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    activeSortOrder,
    setPage,
    handleSortChange,
    handlePageSizeChange,
  };
};

export { useTableState };
