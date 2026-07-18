import { memo, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import type { ColumnDef } from '@tanstack/react-table';
import { FIELD_TYPE, FilterForm, FormBuilder } from 'mui-schema-form-builder';

import {
  useCreateRoleMutation,
  useDeleteRoleMutation,
  useGetPermissionsQuery,
  useGetRolesQuery,
  useUpdateRoleMutation,
} from '@/features/roles/api/rolesApi';
import {
  ConfirmDialog,
  DataTable,
  Icon,
  LabelValue,
  TenantContextGuard,
  ViewDialog,
} from '@/shared/components';
import {
  useBooleanDialog,
  useFilterState,
  useItemDialog,
  usePermission,
  useSnackbar,
  useTableState,
} from '@/shared/hooks';
import type { ApiError, RoleDto } from '@/types/api';

import { styles } from './RolesPage.styles';
import {
  type CreateRoleDialogProps,
  createSchema,
  type CreateValues,
  type EditRoleDialogProps,
  editSchema,
  type EditValues,
  type PermissionOption,
  type RolesFilter,
  type RolesFilterBarProps,
  type RolesPageHeaderProps,
  type ViewRoleDialogProps,
} from './RolesPage.types';

const extractPermissionIds = (raw: unknown[]): string[] => {
  return raw.map((r) => (typeof r === 'string' ? r : (r as { value: string }).value));
};

const ROLES_FILTER_DEFAULT: RolesFilter = { search: '', permissions: [] };

const RolesPageHeader = memo(({ canCreate, onCreateClick }: RolesPageHeaderProps) => {
  return (
    <Box sx={styles.header}>
      <Box sx={styles.headerTitle}>
        <Box sx={styles.pageIconBox}>
          <Icon name="AdminPanelSettings" sx={styles.pageIconSize} />
        </Box>
        <Typography variant="h5" sx={styles.titleText}>
          Roles
        </Typography>
      </Box>
      {canCreate && (
        <Button variant="contained" startIcon={<Icon name="Add" />} onClick={onCreateClick}>
          Create role
        </Button>
      )}
    </Box>
  );
});

const RolesFilterBar = memo(({ fields, onFilterChange }: RolesFilterBarProps) => {
  return (
    <Box sx={styles.filterBar}>
      <FilterForm
        fields={fields}
        defaultValues={ROLES_FILTER_DEFAULT}
        onChange={onFilterChange}
        showReset
        spacing={2}
      />
    </Box>
  );
});

const CreateRoleDialog = memo(({ open, onClose, permissionOptions }: CreateRoleDialogProps) => {
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
          sx={styles.formBuilder}
        />
      </DialogContent>
    </Dialog>
  );
});

const EditRoleDialog = memo(({ open, onClose, role, permissionOptions }: EditRoleDialogProps) => {
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
          sx={styles.formBuilder}
        />
      </DialogContent>
    </Dialog>
  );
});

const ViewRoleDialog = memo(({ role, onClose }: ViewRoleDialogProps) => {
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

const RolesPage = memo(() => {
  const snackbar = useSnackbar();

  const canList = usePermission('Roles.List');
  const canView = usePermission('Roles.View');
  const canCreate = usePermission('Roles.Create');
  const canEdit = usePermission('Roles.Edit');
  const canDelete = usePermission('Roles.Delete');

  const table = useTableState();
  const {
    filter: rolesFilter,
    debouncedSearch,
    handleFilterChange,
  } = useFilterState<RolesFilter>(ROLES_FILTER_DEFAULT, table.setPage);

  const createDialog = useBooleanDialog();
  const editDialog = useItemDialog<RoleDto>();
  const viewDialog = useItemDialog<RoleDto>();
  const deleteDialog = useItemDialog<RoleDto>();

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
    page: table.page + 1,
    pageSize: table.pageSize,
    search: debouncedSearch || undefined,
    permissionIds: rolesFilter.permissions.length > 0 ? rolesFilter.permissions : undefined,
    sortBy: table.sortBy,
    sortOrder: table.activeSortOrder,
  });

  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const handleDelete = useCallback(async () => {
    if (!deleteDialog.item) return;
    try {
      await deleteRole(deleteDialog.item.name).unwrap();
      snackbar.success(`Role "${deleteDialog.item.name}" deleted.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to delete role.');
    } finally {
      deleteDialog.onClose();
    }
  }, [deleteDialog, deleteRole, snackbar]);

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
                <IconButton size="small" onClick={() => viewDialog.onOpen(row.original)}>
                  <Icon name="Visibility" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => editDialog.onOpen(row.original)}>
                  <Icon name="Edit" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => deleteDialog.onOpen(row.original)}
                >
                  <Icon name="Delete" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [canView, canEdit, canDelete, viewDialog, editDialog, deleteDialog],
  );

  return (
    <TenantContextGuard>
      <Box sx={styles.root}>
        <RolesPageHeader canCreate={canCreate} onCreateClick={createDialog.onOpen} />

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
            page={table.page}
            pageSize={table.pageSize}
            totalCount={rolesData?.totalCount ?? 0}
            onPageChange={table.setPage}
            sortBy={table.sortBy}
            sortOrder={table.sortOrder}
            sortableColumns={['name']}
            onSortChange={table.handleSortChange}
          />
        )}

        <ViewRoleDialog role={viewDialog.item} onClose={viewDialog.onClose} />
        <CreateRoleDialog
          open={createDialog.open}
          onClose={createDialog.onClose}
          permissionOptions={permissionOptions}
        />
        <EditRoleDialog
          open={editDialog.open}
          onClose={editDialog.onClose}
          role={editDialog.item}
          permissionOptions={permissionOptions}
        />
        <ConfirmDialog
          open={deleteDialog.open}
          title={`Delete "${deleteDialog.item?.name}"?`}
          description="This role will be permanently removed. Roles assigned to users cannot be deleted."
          confirmLabel="Delete"
          danger
          loading={isDeleting}
          onConfirm={handleDelete}
          onCancel={deleteDialog.onClose}
        />
      </Box>
    </TenantContextGuard>
  );
});
export default RolesPage;
