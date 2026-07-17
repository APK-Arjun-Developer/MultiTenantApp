import { useCallback, useState } from 'react';

import { DEFAULT_PAGE_SIZE } from '@/shared/constants/list';

interface UseTableStateOptions {
  initialPageSize?: number;
}

const useTableState = (options?: UseTableStateOptions) => {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(options?.initialPageSize ?? DEFAULT_PAGE_SIZE);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSortChange = useCallback(
    (newSortBy: string | undefined, newSortOrder: 'asc' | 'desc' | undefined) => {
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

  return { page, pageSize, sortBy, sortOrder, setPage, handleSortChange, handlePageSizeChange };
};

export { useTableState };
