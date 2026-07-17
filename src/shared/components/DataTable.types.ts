import type { ColumnDef } from '@tanstack/react-table';

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
  sortOrder?: 'asc' | 'desc';
  sortableColumns?: string[];
  onSortChange?: (sortBy: string | undefined, sortOrder: 'asc' | 'desc' | undefined) => void;
}

export { type DataTableProps };
