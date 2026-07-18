import type { FieldConfig } from 'mui-schema-form-builder';

import type { FilterValues } from '@/types/api';

type ModuleColor = 'default' | 'primary' | 'secondary' | 'warning' | 'error' | 'info' | 'success';

interface AuditFilter extends FilterValues {
  module: string;
  dateFrom: string;
  dateTo: string;
}

interface AuditLogsPageHeaderProps {
  exportLoading: boolean;
  disableExport: boolean;
  onExport: () => void;
}

interface AuditLogsFilterBarProps {
  fields: FieldConfig[];
  onFilterChange: (values: FilterValues) => void;
}

export {
  type AuditFilter,
  type AuditLogsFilterBarProps,
  type AuditLogsPageHeaderProps,
  type ModuleColor,
};
