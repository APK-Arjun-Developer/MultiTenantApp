import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PageTransition } from '@/shared/components/PageTransition';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatDate } from '@/shared/utils/format';
import { TenantForm } from '../components/TenantForm';
import { useGetTenantsQuery, useDeleteTenantMutation } from '../api/tenantsApi';
import type { TenantDto, ApiError } from '@/types/api';

export function TenantsPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantDto | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<TenantDto | undefined>();

  const { data, isLoading } = useGetTenantsQuery({
    page: page + 1,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const [deleteTenant, { isLoading: isDeleting }] = useDeleteTenantMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteTenant({ slug: deleteTarget.slug }).unwrap();
      toast.success('Tenant deleted');
      setDeleteTarget(undefined);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Failed to delete tenant');
    }
  };

  const columns = useMemo<ColumnDef<TenantDto>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'slug', header: 'Slug' },
      {
        accessorKey: 'isActive',
        header: 'Status',
        cell: ({ row }) => (
          <Chip
            label={row.original.isActive ? 'Active' : 'Inactive'}
            color={row.original.isActive ? 'success' : 'default'}
            size="small"
          />
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
            <PermissionGuard permission={PERMISSIONS.TENANTS_UPDATE}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedTenant(row.original);
                    setDrawerOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.TENANTS_DELETE}>
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeleteTarget(row.original)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <PageTransition>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Tenants
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search tenants…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <PermissionGuard permission={PERMISSIONS.TENANTS_CREATE}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedTenant(undefined);
                setDrawerOpen(true);
              }}
            >
              Onboard Tenant
            </Button>
          </PermissionGuard>
        </Stack>
      </Box>

      <DataTable
        data={data?.items ?? []}
        columns={columns}
        isLoading={isLoading}
        totalCount={data?.totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(0);
        }}
      />

      <TenantForm
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedTenant(undefined);
        }}
        tenant={selectedTenant}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Tenant"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? All associated data will be permanently removed.`}
        confirmLabel="Delete"
        danger
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </PageTransition>
  );
}
