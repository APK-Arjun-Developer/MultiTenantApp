import type { ColumnDef } from '@tanstack/react-table';

import type { SortOrder } from '@/types';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  isLoading?: boolean;
  totalCount?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  sortBy?: string;
  sortOrder?: SortOrder;
  sortableColumns?: string[];
  onSortChange?: (sortBy: string | undefined, sortOrder: SortOrder | undefined) => void;
}

export { type DataTableProps };
