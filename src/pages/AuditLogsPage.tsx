import { memo, useCallback, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ColumnDef } from '@tanstack/react-table';
import { FIELD_TYPE, FilterForm } from 'mui-schema-form-builder';

import { useAppDispatch } from '@/app/hooks';
import {
  activityLogsApi,
  useGetActivityLogsQuery,
} from '@/features/activityLogs/api/activityLogsApi';
import { DataTable, Icon, LoadingButton, TenantContextGuard } from '@/shared/components';
import { DATE_DEBOUNCE_MS, EXPORT_PAGE_SIZE } from '@/shared/constants/list';
import { useDebounce, useFilterState, useTableState } from '@/shared/hooks';
import { exportToCsv } from '@/shared/utils/exportCsv';
import { formatDateTime } from '@/shared/utils/format';
import type { ActivityLogDto } from '@/types/api';

import { styles } from './AuditLogsPage.styles';
import type {
  AuditFilter,
  AuditLogsFilterBarProps,
  AuditLogsPageHeaderProps,
  ModuleColor,
} from './AuditLogsPage.types';

const MODULE_OPTIONS = [
  'Auth',
  'Users',
  'Roles',
  'Tenants',
  'Files',
  'Onboarding',
  'Subscriptions',
];

const MODULE_COLORS: Record<string, ModuleColor> = {
  Auth: 'info',
  Users: 'primary',
  Roles: 'secondary',
  Tenants: 'warning',
  Files: 'default',
  Onboarding: 'success',
  Subscriptions: 'error',
};

const AUDIT_FILTER_DEFAULT: AuditFilter = { module: '', dateFrom: '', dateTo: '' };

const AuditLogsPageHeader = memo(
  ({ exportLoading, disableExport, onExport }: AuditLogsPageHeaderProps) => {
    return (
      <Box sx={styles.header}>
        <Box sx={styles.headerTitle}>
          <Box sx={styles.pageIconBox}>
            <Icon name="History" sx={styles.pageIconSize} />
          </Box>
          <Typography variant="h5" sx={styles.titleText}>
            Audit Log
          </Typography>
        </Box>
        <Tooltip title="Export to CSV">
          <span>
            <LoadingButton
              variant="outlined"
              size="small"
              loading={exportLoading}
              disabled={disableExport}
              onClick={onExport}
            >
              Export CSV
            </LoadingButton>
          </span>
        </Tooltip>
      </Box>
    );
  },
);

const AuditLogsFilterBar = memo(({ fields, onFilterChange }: AuditLogsFilterBarProps) => {
  return (
    <Box sx={styles.filterBar}>
      <FilterForm
        fields={fields}
        defaultValues={AUDIT_FILTER_DEFAULT}
        onChange={onFilterChange}
        showReset
        spacing={2}
      />
    </Box>
  );
});

const AuditLogsPage = memo(() => {
  const dispatch = useAppDispatch();
  const table = useTableState();
  const { filter: auditFilter, handleFilterChange } = useFilterState<AuditFilter>(
    AUDIT_FILTER_DEFAULT,
    table.setPage,
  );
  const [exportLoading, setExportLoading] = useState(false);

  const debouncedDateFrom = useDebounce(auditFilter.dateFrom, DATE_DEBOUNCE_MS);
  const debouncedDateTo = useDebounce(auditFilter.dateTo, DATE_DEBOUNCE_MS);

  const auditFilterFields = useMemo(
    () => [
      {
        name: 'module',
        label: 'Module',
        type: FIELD_TYPE.SELECT,
        options: [
          { label: 'All modules', value: '' },
          ...MODULE_OPTIONS.map((m) => ({ label: m, value: m })),
        ],
        grid: { xs: 12, sm: 4 },
      },
      {
        name: 'dateFrom',
        label: 'From date',
        type: FIELD_TYPE.DATE,
        grid: { xs: 6, sm: 4 },
      },
      {
        name: 'dateTo',
        label: 'To date',
        type: FIELD_TYPE.DATE,
        grid: { xs: 6, sm: 4 },
      },
    ],
    [],
  );

  const { data, isLoading } = useGetActivityLogsQuery({
    page: table.page + 1,
    pageSize: table.pageSize,
    module: auditFilter.module || undefined,
    dateFrom: debouncedDateFrom || undefined,
    dateTo: debouncedDateTo ? `${debouncedDateTo}T23:59:59Z` : undefined,
    sortBy: table.sortBy,
    sortOrder: table.activeSortOrder,
  });

  const handleExport = useCallback(async () => {
    setExportLoading(true);
    try {
      const result = await dispatch(
        activityLogsApi.endpoints.getActivityLogs.initiate({
          page: 1,
          pageSize: EXPORT_PAGE_SIZE,
          module: auditFilter.module || undefined,
          dateFrom: debouncedDateFrom || undefined,
          dateTo: debouncedDateTo ? `${debouncedDateTo}T23:59:59Z` : undefined,
        }),
      );
      const items = ('data' in result ? result.data?.items : null) ?? data?.items ?? [];
      exportToCsv(
        'audit-logs',
        items.map((log) => ({
          Time: formatDateTime(log.createdAt),
          Module: log.module,
          Action: log.action,
          User: log.userDisplayName,
          Email: log.userEmail,
          Description: log.description,
          IP: log.ipAddress ?? '',
        })),
      );
    } finally {
      setExportLoading(false);
    }
  }, [dispatch, auditFilter.module, debouncedDateFrom, debouncedDateTo, data?.items]);

  const columns = useMemo<ColumnDef<ActivityLogDto>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Time',
        cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" sx={styles.timeCell}>
            {formatDateTime(row.original.createdAt)}
          </Typography>
        ),
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ row }) => (
          <Chip
            label={row.original.module}
            color={MODULE_COLORS[row.original.module] ?? 'default'}
            size="small"
            variant="outlined"
          />
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <Typography variant="body2" sx={styles.actionCell}>
            {row.original.action}
          </Typography>
        ),
      },
      {
        id: 'user',
        header: 'User',
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2">{row.original.userDisplayName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.userEmail}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ row }) => (
          <Tooltip title={row.original.description} placement="top-start">
            <Typography variant="body2" color="text.secondary" sx={styles.descriptionCell}>
              {row.original.description}
            </Typography>
          </Tooltip>
        ),
      },
      {
        accessorKey: 'ipAddress',
        header: 'IP',
        cell: ({ row }) => (
          <Typography variant="caption" color="text.secondary">
            {row.original.ipAddress ?? '—'}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <TenantContextGuard>
      <Box sx={styles.root}>
        <AuditLogsPageHeader
          exportLoading={exportLoading}
          disableExport={!data?.items?.length}
          onExport={handleExport}
        />

        <AuditLogsFilterBar fields={auditFilterFields} onFilterChange={handleFilterChange} />

        <DataTable
          data={data?.items ?? []}
          columns={columns}
          isLoading={isLoading}
          totalCount={data?.totalCount ?? 0}
          page={table.page}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.handlePageSizeChange}
          sortBy={table.sortBy}
          sortOrder={table.sortOrder}
          sortableColumns={['createdAt']}
          onSortChange={table.handleSortChange}
        />
      </Box>
    </TenantContextGuard>
  );
});
export default AuditLogsPage;
