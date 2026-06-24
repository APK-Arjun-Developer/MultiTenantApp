import { useMemo, useState } from 'react';
import { z } from 'zod';
import type { ColumnDef } from '@tanstack/react-table';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDebounce } from '@/shared/hooks';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { usePermission } from '@/shared/hooks/usePermission';
import {
  useGetTenantsQuery,
  useOnboardTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
} from '@/features/tenants/api/tenantsApi';
import type { TenantDto, ApiError } from '@/types/api';

// ─── Onboard dialog ───────────────────────────────────────────────────────────

const onboardSchema = z.object({
  tenantName: z.string().min(1, 'Tenant name is required').max(200),
  tenantSlug: z
    .string()
    .min(1, 'Slug is required')
    .max(100)
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      'Lowercase letters, digits and hyphens only (e.g. my-company)',
    ),
  adminFullName: z.string().min(1, 'Admin full name is required').max(200),
  adminEmail: z.string().email('Invalid email address'),
});
type OnboardValues = z.infer<typeof onboardSchema>;

const onboardFields: FieldConfig[] = [
  {
    name: 'tenantName',
    label: 'Tenant name',
    type: FIELD_TYPE.TEXT,
    section: 'Tenant details',
    required: true,
  },
  {
    name: 'tenantSlug',
    label: 'Slug',
    type: FIELD_TYPE.TEXT,
    section: 'Tenant details',
    required: true,
    muiProps: { helperText: 'URL-safe identifier — lowercase letters, digits and hyphens' },
  },
  {
    name: 'adminFullName',
    label: 'Full name',
    type: FIELD_TYPE.TEXT,
    section: 'Admin Details',
    required: true,
  },
  {
    name: 'adminEmail',
    label: 'Email address',
    type: FIELD_TYPE.TEXT,
    section: 'Admin Details',
    required: true,
    muiProps: { type: 'email', helperText: 'Account setup email will be sent here' },
  },
];

interface OnboardDialogProps {
  open: boolean;
  onClose: () => void;
}

function OnboardTenantDialog({ open, onClose }: OnboardDialogProps) {
  const [onboardTenant] = useOnboardTenantMutation();
  const snackbar = useSnackbar();

  const onSubmit = async (values: OnboardValues) => {
    try {
      const result = await onboardTenant({
        tenant: { name: values.tenantName, slug: values.tenantSlug },
        user: { fullName: values.adminFullName, email: values.adminEmail },
      }).unwrap();
      snackbar.success(
        `Tenant "${result.name}" created. Setup email sent to ${result.adminEmail}.`,
      );
      onClose();
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Failed to create tenant.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Tenant</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={open ? 'open' : 'closed'}
          schema={onboardSchema}
          fields={onboardFields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Create tenant"
          cancelText="Cancel"
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

const editSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  newSlug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, digits and hyphens only')
    .optional()
    .or(z.literal('')),
  isActive: z.boolean(),
});
type EditValues = z.infer<typeof editSchema>;

interface EditDialogProps {
  tenant: TenantDto | null;
  onClose: () => void;
}

function EditTenantDialog({ tenant, onClose }: EditDialogProps) {
  const [updateTenant] = useUpdateTenantMutation();
  const snackbar = useSnackbar();

  const editFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'name',
        label: 'Name',
        type: FIELD_TYPE.TEXT,
        required: true,
        defaultValue: tenant?.name ?? '',
        muiProps: { autoFocus: true },
      },
      {
        name: 'newSlug',
        label: 'New slug',
        type: FIELD_TYPE.TEXT,
        defaultValue: '',
        muiProps: {
          helperText: `Current: ${tenant?.slug ?? ''} — leave blank to keep unchanged`,
        },
      },
      {
        name: 'isActive',
        label: 'Active',
        type: FIELD_TYPE.CHECKBOX,
        defaultValue: tenant?.isActive ?? true,
      },
    ],
    [tenant],
  );

  const onSubmit = async (values: EditValues) => {
    if (!tenant) return;
    try {
      await updateTenant({
        slug: tenant.slug,
        name: values.name,
        newSlug: values.newSlug || undefined,
        isActive: values.isActive,
      }).unwrap();
      snackbar.success('Tenant updated.');
      onClose();
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Failed to update tenant.');
    }
  };

  return (
    <Dialog open={!!tenant} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Tenant</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={tenant?.id}
          schema={editSchema}
          fields={editFields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Save changes"
          cancelText="Cancel"
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function TenantsPage() {
  const snackbar = useSnackbar();

  const canCreate = usePermission('Tenants.Create');
  const canEdit = usePermission('Tenants.Edit');
  const canDelete = usePermission('Tenants.Delete');

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const debouncedSearch = useDebounce(search, 300);

  const [onboardOpen, setOnboardOpen] = useState(false);
  const [editTenant, setEditTenant] = useState<TenantDto | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<TenantDto | null>(null);

  const { data, isLoading } = useGetTenantsQuery({
    page: page + 1,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const [deleteTenantMutation, { isLoading: isDeleting }] = useDeleteTenantMutation();

  const tenants = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleDelete = async () => {
    if (!deleteTenant) return;
    try {
      await deleteTenantMutation({ slug: deleteTenant.slug }).unwrap();
      snackbar.success(`Tenant "${deleteTenant.name}" deleted.`);
      setDeleteTenant(null);
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Failed to delete tenant.');
    }
  };

  const columns: ColumnDef<TenantDto>[] = [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.original.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {row.original.slug}
          </Typography>
        </Box>
      ),
    },
    {
      accessorKey: 'isActive',
      header: 'Status',
      cell: ({ row }) => (
        <Chip
          label={row.original.isActive ? 'Active' : 'Inactive'}
          color={row.original.isActive ? 'success' : 'default'}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
          {canEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => setEditTenant(row.original)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setDeleteTenant(row.original)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BusinessIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Tenants
          </Typography>
        </Box>
        {canCreate && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOnboardOpen(true)}>
            New Tenant
          </Button>
        )}
      </Box>

      {/* Search */}
      <Box sx={{ mb: 2, maxWidth: 360 }}>
        <TextField
          size="small"
          fullWidth
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
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearch('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            },
          }}
        />
      </Box>

      {/* Table */}
      <DataTable
        data={tenants}
        columns={columns}
        isLoading={isLoading}
        totalCount={totalCount}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(0);
        }}
      />

      {/* Dialogs */}
      <OnboardTenantDialog open={onboardOpen} onClose={() => setOnboardOpen(false)} />
      <EditTenantDialog tenant={editTenant} onClose={() => setEditTenant(null)} />
      <ConfirmDialog
        open={!!deleteTenant}
        title={`Delete "${deleteTenant?.name}"?`}
        description="This will permanently remove the tenant. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTenant(null)}
      />
    </Box>
  );
}
