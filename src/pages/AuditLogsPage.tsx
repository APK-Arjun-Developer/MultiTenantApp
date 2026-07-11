import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import HistoryIcon from '@mui/icons-material/History';
import { FilterForm, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
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

const MODULE_OPTIONS = [
  'Auth',
  'Users',
  'Roles',
  'Tenants',
  'Files',
  'Onboarding',
  'Subscriptions',
];

const MODULE_COLORS: Record<
  string,
  'default' | 'primary' | 'secondary' | 'warning' | 'error' | 'info' | 'success'
> = {
  Auth: 'info',
  Users: 'primary',
  Roles: 'secondary',
  Tenants: 'warning',
  Files: 'default',
  Onboarding: 'success',
  Subscriptions: 'error',
};

const columns: ColumnDef<ActivityLogDto>[] = [
  {
    accessorKey: 'createdAt',
    header: 'Time',
    cell: ({ row }) => (
      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
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
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            maxWidth: 360,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
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
];

export function AuditLogsPage() {
  const dispatch = useAppDispatch();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [auditFilter, setAuditFilter] = useState({ module: '', dateFrom: '', dateTo: '' });
  const [exportLoading, setExportLoading] = useState(false);
  const debouncedDateFrom = useDebounce(auditFilter.dateFrom, 500);
  const debouncedDateTo = useDebounce(auditFilter.dateTo, 500);

  const auditFilterFields = useMemo<FieldConfig[]>(
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
  });

  const handleExport = async () => {
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
  };

  return (
    <TenantContextGuard>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <HistoryIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Audit Log
            </Typography>
          </Box>
          <Tooltip title="Export to CSV">
            <span>
              <LoadingButton
                variant="outlined"
                size="small"
                loading={exportLoading}
                disabled={!data?.items?.length}
                onClick={handleExport}
              >
                Export CSV
              </LoadingButton>
            </span>
          </Tooltip>
        </Box>

        <Box sx={{ mb: 2 }}>
          <FilterForm
            fields={auditFilterFields}
            defaultValues={{ module: '', dateFrom: '', dateTo: '' }}
            onChange={(values) => {
              setAuditFilter(values as typeof auditFilter);
              setPage(0);
            }}
            showReset
            spacing={2}
          />
        </Box>

        <DataTable
          data={data?.items ?? []}
          columns={columns}
          isLoading={isLoading}
          totalCount={data?.totalCount ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => {
            setPageSize(size);
            setPage(0);
          }}
        />
      </Box>
    </TenantContextGuard>
  );
}
