import { memo, useCallback, useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FormBuilder, FilterForm, FIELD_TYPE } from 'mui-schema-form-builder';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { LabelValue } from '@/shared/components/LabelValue';
import { TenantContextGuard } from '@/shared/components/TenantContextGuard';
import { ViewDialog } from '@/shared/components/ViewDialog';
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
import { styles } from './RolesPage.styles';
import type {
  CreateValues,
  EditValues,
  PermissionOption,
  CreateRoleDialogProps,
  EditRoleDialogProps,
  ViewRoleDialogProps,
  RolesPageHeaderProps,
  RolesFilterBarProps,
  RolesFilter,
} from './RolesPage.types';
import { createSchema, editSchema } from './RolesPage.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractPermissionIds(raw: unknown[]): string[] {
  return raw.map((r) => (typeof r === 'string' ? r : (r as { value: string }).value));
}

// ─── Header sub-component ─────────────────────────────────────────────────────

const RolesPageHeader = memo(function RolesPageHeader({
  canCreate,
  onCreateClick,
}: RolesPageHeaderProps) {
  return (
    <Box sx={styles.header}>
      <Box sx={styles.headerTitle}>
        <Box sx={styles.pageIconBox}>
          <AdminPanelSettingsIcon sx={styles.pageIconSize} />
        </Box>
        <Typography variant="h5" sx={styles.titleText}>
          Roles
        </Typography>
      </Box>
      {canCreate && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateClick}>
          Create role
        </Button>
      )}
    </Box>
  );
});

// ─── FilterBar sub-component ──────────────────────────────────────────────────

const RolesFilterBar = memo(function RolesFilterBar({
  fields,
  onFilterChange,
}: RolesFilterBarProps) {
  return (
    <Box sx={styles.filterBar}>
      <FilterForm
        fields={fields}
        defaultValues={{ search: '', permissions: [] }}
        onChange={(values) => onFilterChange(values as RolesFilter)}
        showReset
        spacing={2}
      />
    </Box>
  );
});

// ─── Create dialog ────────────────────────────────────────────────────────────

const CreateRoleDialog = memo(function CreateRoleDialog({
  open,
  onClose,
  permissionOptions,
}: CreateRoleDialogProps) {
  const [createRole, { isLoading }] = useCreateRoleMutation();
  const snackbar = useSnackbar();

  const fields = useMemo(
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
        muiProps: { multiple: true, disableCloseOnSelect: true },
      },
    ],
    [permissionOptions],
  );

  const onSubmit = useCallback(
    async (values: CreateValues) => {
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
    },
    [createRole, snackbar, onClose],
  );

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
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
          sx={styles.formBuilder as never}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── Edit dialog ──────────────────────────────────────────────────────────────

const EditRoleDialog = memo(function EditRoleDialog({
  open,
  onClose,
  role,
  permissionOptions,
}: EditRoleDialogProps) {
  const [updateRole, { isLoading }] = useUpdateRoleMutation();
  const snackbar = useSnackbar();

  const defaultPermissions = useMemo(
    () => permissionOptions.filter((opt) => role?.permissionIds.includes(opt.value)),
    [role, permissionOptions],
  );

  const fields = useMemo(
    () => [
      {
        name: 'name',
        label: 'Role name',
        type: FIELD_TYPE.TEXT,
        required: true,
        defaultValue: role?.name ?? '',
      },
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
        muiProps: { multiple: true, disableCloseOnSelect: true },
      },
    ],
    [role, permissionOptions, defaultPermissions],
  );

  const onSubmit = useCallback(
    async (values: EditValues) => {
      if (!role) return;
      try {
        const newName = values.name.trim();
        await updateRole({
          name: role.name,
          newName: newName !== role.name ? newName : undefined,
          description: values.description || null,
          permissions: extractPermissionIds(values.permissions),
        }).unwrap();
        snackbar.success(`Role "${newName}" updated.`);
        onClose();
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to update role.');
      }
    },
    [updateRole, snackbar, onClose, role],
  );

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Role - {role?.name}</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={role?.id}
          schema={editSchema}
          fields={fields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Save changes"
          cancelText="Cancel"
          sx={styles.formBuilder as never}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── View dialog ──────────────────────────────────────────────────────────────

const ViewRoleDialog = memo(function ViewRoleDialog({ role, onClose }: ViewRoleDialogProps) {
  return (
    <ViewDialog open={!!role} title="Role details" onClose={onClose}>
      <Box sx={styles.viewDialogContent}>
        <LabelValue label="Name" value={role?.name} />
        <LabelValue label="Description" value={role?.description} />
        <LabelValue
          label="Permissions"
          value={
            role?.permissionNames && role.permissionNames.length > 0
              ? role.permissionNames.map((n) => (
                  <Chip
                    key={n}
                    label={n}
                    size="small"
                    variant="outlined"
                    sx={styles.permissionChip}
                  />
                ))
              : undefined
          }
        />
      </Box>
    </ViewDialog>
  );
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export const RolesPage = memo(function RolesPage() {
  const snackbar = useSnackbar();

  const canList = usePermission('Roles.List');
  const canView = usePermission('Roles.View');
  const canCreate = usePermission('Roles.Create');
  const canEdit = usePermission('Roles.Edit');
  const canDelete = usePermission('Roles.Delete');

  const [rolesFilter, setRolesFilter] = useState<RolesFilter>({
    search: '',
    permissions: [],
  });
  const debouncedSearch = useDebounce(rolesFilter.search, 400);
  const [page, setPage] = useState(0);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [createOpen, setCreateOpen] = useState(false);
  const [editRole, setEditRole] = useState<RoleDto | null>(null);
  const [viewRole, setViewRole] = useState<RoleDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RoleDto | null>(null);

  const { data: permissionsData } = useGetPermissionsQuery();

  const permissionOptions = useMemo<PermissionOption[]>(
    () => (permissionsData?.items ?? []).map((p) => ({ value: p.id, label: p.name })),
    [permissionsData],
  );

  const rolesFilterFields = useMemo(
    () => [
      {
        name: 'search',
        label: 'Search',
        type: FIELD_TYPE.SEARCH,
        placeholder: 'Search roles…',
        grid: { xs: 12, sm: 6 },
      },
      {
        name: 'permissions',
        label: 'Filter by permission',
        type: FIELD_TYPE.SELECT,
        multiple: true,
        options: permissionOptions,
        grid: { xs: 12, sm: 6 },
      },
    ],
    [permissionOptions],
  );

  const { data: rolesData, isLoading } = useGetRolesQuery({
    page: page + 1,
    pageSize: 20,
    search: debouncedSearch || undefined,
    permissionIds: rolesFilter.permissions.length > 0 ? rolesFilter.permissions : undefined,
    sortBy,
    sortOrder: sortBy ? sortOrder : undefined,
  });

  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const handleSortChange = useCallback(
    (newSortBy: string | undefined, newSortOrder: 'asc' | 'desc' | undefined) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder ?? 'asc');
      setPage(0);
    },
    [],
  );

  const handleOpenCreate = useCallback(() => setCreateOpen(true), []);
  const handleCloseCreate = useCallback(() => setCreateOpen(false), []);
  const handleCloseEdit = useCallback(() => setEditRole(null), []);
  const handleCloseView = useCallback(() => setViewRole(null), []);
  const handleCloseDelete = useCallback(() => setDeleteTarget(null), []);

  const handleFilterChange = useCallback((values: RolesFilter) => {
    setRolesFilter(values);
    setPage(0);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget.name).unwrap();
      snackbar.success(`Role "${deleteTarget.name}" deleted.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to delete role.');
    } finally {
      setDeleteTarget(null);
    }
  }, [deleteRole, deleteTarget, snackbar]);

  const columns = useMemo<ColumnDef<RoleDto>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <Typography variant="body2" sx={styles.columnName}>
            {row.original.name}
          </Typography>
        ),
      },
      {
        header: 'Description',
        accessorKey: 'description',
        cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {row.original.description || '-'}
          </Typography>
        ),
      },
      {
        header: 'Permissions',
        accessorKey: 'permissionNames',
        cell: ({ row }) => {
          const names = row.original.permissionNames;
          if (names.length === 0) return <Typography variant="body2">-</Typography>;
          const shown = names.slice(0, 3);
          const rest = names.length - shown.length;
          return (
            <Box sx={styles.chipRow}>
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
          <Box sx={styles.actionButtons}>
            {canView && (
              <Tooltip title="View">
                <IconButton size="small" onClick={() => setViewRole(row.original)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
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
    [canView, canEdit, canDelete],
  );

  return (
    <TenantContextGuard>
      <Box sx={styles.root}>
        <RolesPageHeader canCreate={canCreate} onCreateClick={handleOpenCreate} />

        <RolesFilterBar fields={rolesFilterFields} onFilterChange={handleFilterChange} />

        {!canList ? (
          <Box sx={styles.emptyState}>
            <Typography color="text.secondary">You don't have permission to list roles.</Typography>
          </Box>
        ) : (
          <DataTable
            columns={columns}
            data={rolesData?.items ?? []}
            isLoading={isLoading}
            page={page}
            pageSize={20}
            totalCount={rolesData?.totalCount ?? 0}
            onPageChange={setPage}
            sortBy={sortBy}
            sortOrder={sortOrder}
            sortableColumns={['name']}
            onSortChange={handleSortChange}
          />
        )}

        <ViewRoleDialog role={viewRole} onClose={handleCloseView} />
        <CreateRoleDialog
          open={createOpen}
          onClose={handleCloseCreate}
          permissionOptions={permissionOptions}
        />
        <EditRoleDialog
          open={!!editRole}
          onClose={handleCloseEdit}
          role={editRole}
          permissionOptions={permissionOptions}
        />
        <ConfirmDialog
          open={!!deleteTarget}
          title={`Delete "${deleteTarget?.name}"?`}
          description="This role will be permanently removed. Roles assigned to users cannot be deleted."
          confirmLabel="Delete"
          danger
          loading={isDeleting}
          onConfirm={handleDelete}
          onCancel={handleCloseDelete}
        />
      </Box>
    </TenantContextGuard>
  );
});
