import { useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import DownloadIcon from '@mui/icons-material/Download';
import HistoryIcon from '@mui/icons-material/History';
import { TenantContextGuard } from '@/shared/components/TenantContextGuard';
import { DataTable } from '@/shared/components/DataTable';
import { exportToCsv } from '@/shared/utils/exportCsv';
import { useDebounce } from '@/shared/hooks';
import { useAppDispatch } from '@/app/hooks';
import { useGetActivityLogsQuery } from '@/features/activityLogs/api/activityLogsApi';
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
  const [moduleFilter, setModuleFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exportLoading, setExportLoading] = useState(false);
  const debouncedDateFrom = useDebounce(dateFrom, 500);
  const debouncedDateTo = useDebounce(dateTo, 500);

  const { data, isLoading } = useGetActivityLogsQuery({
    page: page + 1,
    pageSize,
    module: moduleFilter || undefined,
    dateFrom: debouncedDateFrom || undefined,
    dateTo: debouncedDateTo ? `${debouncedDateTo}T23:59:59Z` : undefined,
  });

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const { activityLogsApi } = await import('@/features/activityLogs/api/activityLogsApi');
      const result = await dispatch(
        activityLogsApi.endpoints.getActivityLogs.initiate({
          page: 1,
          pageSize: 5000,
          module: moduleFilter || undefined,
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
              <Button
                variant="outlined"
                size="small"
                startIcon={exportLoading ? <CircularProgress size={14} /> : <DownloadIcon />}
                disabled={exportLoading || !data?.items?.length}
                onClick={handleExport}
              >
                Export CSV
              </Button>
            </span>
          </Tooltip>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Module</InputLabel>
            <Select
              value={moduleFilter}
              label="Module"
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">All modules</MenuItem>
              {MODULE_OPTIONS.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            label="From date"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(0);
            }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 160 }}
          />

          <TextField
            size="small"
            label="To date"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(0);
            }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 160 }}
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
