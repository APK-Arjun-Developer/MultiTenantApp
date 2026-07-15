import type { FieldConfig } from 'mui-schema-form-builder';
import type { FilterValues } from '@/types/api';

// ─── Constants ────────────────────────────────────────────────────────────────

export type ModuleColor =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'warning'
  | 'error'
  | 'info'
  | 'success';

// ─── State ────────────────────────────────────────────────────────────────────

export interface AuditFilter extends FilterValues {
  module: string;
  dateFrom: string;
  dateTo: string;
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface AuditLogsPageHeaderProps {
  exportLoading: boolean;
  disableExport: boolean;
  onExport: () => void;
}

export interface AuditLogsFilterBarProps {
  fields: FieldConfig[];
  onFilterChange: (values: AuditFilter) => void;
}
