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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SearchIcon from '@mui/icons-material/Search';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { TenantContextGuard } from '@/shared/components/TenantContextGuard';
import { useDebounce } from '@/shared/hooks';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { usePermission } from '@/shared/hooks/usePermission';
import {
  useGetRolesQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
} from '@/features/roles/api/rolesApi';
import type { RoleDto, ApiError } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  description: z.string().optional(),
  // AUTOCOMPLETE multiple returns option objects { value, label }
  permissions: z.array(z.any()).min(1, 'At least one permission is required'),
});
type CreateValues = z.infer<typeof createSchema>;

const editSchema = z.object({
  description: z.string().optional(),
  permissions: z.array(z.any()).min(1, 'At least one permission is required'),
});
type EditValues = z.infer<typeof editSchema>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractPermissionIds(raw: unknown[]): string[] {
  return raw.map((r) => (typeof r === 'string' ? r : (r as { value: string }).value));
}

// ─── Create dialog ────────────────────────────────────────────────────────────

interface CreateRoleDialogProps {
  open: boolean;
  onClose: () => void;
  permissionOptions: { value: string; label: string }[];
}

function CreateRoleDialog({ open, onClose, permissionOptions }: CreateRoleDialogProps) {
  const [createRole] = useCreateRoleMutation();
  const snackbar = useSnackbar();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'name',
        label: 'Role name',
        type: FIELD_TYPE.TEXT,
        required: true,
      },
      {
        name: 'description',
        label: 'Description',
        type: FIELD_TYPE.TEXT,
      },
      {
        name: 'permissions',
        label: 'Permissions',
        type: FIELD_TYPE.AUTOCOMPLETE,
        required: true,
        options: permissionOptions,
        defaultValue: [],
        muiProps: { multiple: true },
      },
    ],
    [permissionOptions],
  );

  const onSubmit = async (values: CreateValues) => {
    try {
      const result = await createRole({
        name: values.name,
        description: values.description || null,
        permissions: extractPermissionIds(values.permissions),
      }).unwrap();
      snackbar.success(`Role "${result.name}" created.`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to create role.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Role</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={open ? 'open' : 'closed'}
          schema={createSchema}
          fields={fields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Create role"
          cancelText="Cancel"
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

interface EditRoleDialogProps {
  open: boolean;
  onClose: () => void;
  role: RoleDto | null;
  permissionOptions: { value: string; label: string }[];
}

function EditRoleDialog({ open, onClose, role, permissionOptions }: EditRoleDialogProps) {
  const [updateRole] = useUpdateRoleMutation();
  const snackbar = useSnackbar();

  const defaultPermissions = useMemo(
    () => permissionOptions.filter((opt) => role?.permissionIds.includes(opt.value)),
    [role, permissionOptions],
  );

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'description',
        label: 'Description',
        type: FIELD_TYPE.TEXT,
        defaultValue: role?.description ?? '',
      },
      {
        name: 'permissions',
        label: 'Permissions',
        type: FIELD_TYPE.AUTOCOMPLETE,
        required: true,
        options: permissionOptions,
        defaultValue: defaultPermissions,
        muiProps: { multiple: true },
      },
    ],
    [role, permissionOptions, defaultPermissions],
  );

  const onSubmit = async (values: EditValues) => {
    if (!role) return;
    try {
      await updateRole({
        name: role.name,
        description: values.description || null,
        permissions: extractPermissionIds(values.permissions),
      }).unwrap();
      snackbar.success(`Role "${role.name}" updated.`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update role.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Role — {role?.name}</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={role?.id}
          schema={editSchema}
          fields={fields}
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

export function RolesPage() {
  const snackbar = useSnackbar();

  const canCreate = usePermission('Roles.Create');
  const canEdit = usePermission('Roles.Edit');
  const canDelete = usePermission('Roles.Delete');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleDto | null>(null);

  const { data: rolesData, isLoading } = useGetRolesQuery({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
  });

  const { data: permissionsData } = useGetPermissionsQuery();

  const [deleteRole] = useDeleteRoleMutation();

  const permissionOptions = useMemo(
    () => (permissionsData?.items ?? []).map((p) => ({ value: p.id, label: p.name })),
    [permissionsData],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget.name).unwrap();
      snackbar.success(`Role "${deleteTarget.name}" deleted.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to delete role.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = useMemo<ColumnDef<RoleDto>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.original.name}
          </Typography>
        ),
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {row.original.description || '—'}
          </Typography>
        ),
      },
      {
        header: 'Permissions',
        accessorKey: 'permissionNames',
        cell: ({ row }) => {
          const names = row.original.permissionNames;
          if (names.length === 0) return <Typography variant="body2">—</Typography>;
          const shown = names.slice(0, 3);
          const rest = names.length - shown.length;
          return (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {shown.map((n) => (
                <Chip key={n} label={n} size="small" variant="outlined" />
              ))}
              {rest > 0 && (
                <Chip label={`+${rest} more`} size="small" variant="outlined" color="default" />
              )}
            </Box>
          );
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => setEditRole(row.original)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeleteTarget(row.original)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [canEdit, canDelete, setEditRole, setDeleteTarget],
  );

  return (
    <TenantContextGuard>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <AdminPanelSettingsIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Roles
            </Typography>
          </Box>
          {canCreate && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Create role
            </Button>
          )}
        </Box>

        {/* Search */}
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search roles…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
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
            sx={{ width: 280 }}
          />
        </Box>

        <DataTable
          columns={columns}
          data={rolesData?.items ?? []}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          totalCount={rolesData?.totalCount ?? 0}
          onPageChange={setPage}
        />

        <CreateRoleDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          permissionOptions={permissionOptions}
        />

        <EditRoleDialog
          open={!!editRole}
          onClose={() => setEditRole(null)}
          role={editRole}
          permissionOptions={permissionOptions}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          title={`Delete "${deleteTarget?.name}"?`}
          description="This role will be permanently removed. Roles assigned to users cannot be deleted."
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </Box>
    </TenantContextGuard>
  );
}
