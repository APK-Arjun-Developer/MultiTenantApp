import { memo, useCallback, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HistoryIcon from '@mui/icons-material/History';
import { FilterForm, FIELD_TYPE } from 'mui-schema-form-builder';
import { LoadingButton } from '@/shared/components/LoadingButton';
import { TenantContextGuard } from '@/shared/components/TenantContextGuard';
import { DataTable } from '@/shared/components/DataTable';
import { exportToCsv } from '@/shared/utils/exportCsv';
import { useDebounce } from '@/shared/hooks';
import { useAppDispatch } from '@/app/hooks';
import {
  activityLogsApi,
  useGetActivityLogsQuery,
} from '@/features/activityLogs/api/activityLogsApi';
import type { ActivityLogDto } from '@/types/api';
import { styles } from './AuditLogsPage.styles';
import type {
  ModuleColor,
  AuditFilter,
  AuditLogsPageHeaderProps,
  AuditLogsFilterBarProps,
} from './AuditLogsPage.types';

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Header sub-component ─────────────────────────────────────────────────────

const AuditLogsPageHeader = memo(function AuditLogsPageHeader({
  exportLoading,
  disableExport,
  onExport,
}: AuditLogsPageHeaderProps) {
  return (
    <Box sx={styles.header}>
      <Box sx={styles.headerTitle}>
        <Box sx={styles.pageIconBox}>
          <HistoryIcon sx={styles.pageIconSize} />
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
});

// ─── FilterBar sub-component ──────────────────────────────────────────────────

const AuditLogsFilterBar = memo(function AuditLogsFilterBar({
  fields,
  onFilterChange,
}: AuditLogsFilterBarProps) {
  return (
    <Box sx={styles.filterBar}>
      <FilterForm
        fields={fields}
        defaultValues={{ module: '', dateFrom: '', dateTo: '' }}
        onChange={(values) => onFilterChange(values as AuditFilter)}
        showReset
        spacing={2}
      />
    </Box>
  );
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export const AuditLogsPage = memo(function AuditLogsPage() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [auditFilter, setAuditFilter] = useState<AuditFilter>({
    module: '',
    dateFrom: '',
    dateTo: '',
  });
  const [exportLoading, setExportLoading] = useState(false);

  const debouncedDateFrom = useDebounce(auditFilter.dateFrom, 500);
  const debouncedDateTo = useDebounce(auditFilter.dateTo, 500);

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
    page: page + 1,
    pageSize,
    module: auditFilter.module || undefined,
    dateFrom: debouncedDateFrom || undefined,
    dateTo: debouncedDateTo ? `${debouncedDateTo}T23:59:59Z` : undefined,
    sortBy,
    sortOrder: sortBy ? sortOrder : undefined,
  });

  const handleSortChange = useCallback(
    (newSortBy: string | undefined, newSortOrder: 'asc' | 'desc' | undefined) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder ?? 'asc');
      setPage(0);
    },
    [],
  );

  const handleFilterChange = useCallback((values: AuditFilter) => {
    setAuditFilter(values);
    setPage(0);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(0);
  }, []);

  const handleExport = useCallback(async () => {
    setExportLoading(true);
    try {
      const result = await dispatch(
        activityLogsApi.endpoints.getActivityLogs.initiate({
          page: 1,
          pageSize: 5000,
          module: auditFilter.module || undefined,
          dateFrom: debouncedDateFrom || undefined,
          dateTo: debouncedDateTo ? `${debouncedDateTo}T23:59:59Z` : undefined,
        }),
      );
      const items = ('data' in result ? result.data?.items : null) ?? data?.items ?? [];
      exportToCsv(
        'audit-logs',
        items.map((log) => ({
          Time: new Date(log.createdAt).toLocaleString(),
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
            {new Date(row.original.createdAt).toLocaleString()}
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
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          sortableColumns={['createdAt']}
          onSortChange={handleSortChange}
        />
      </Box>
    </TenantContextGuard>
  );
});
