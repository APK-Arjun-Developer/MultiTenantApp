import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PageTransition } from '@/shared/components/PageTransition';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { formatDate } from '@/shared/utils/format';
import { RoleForm } from '../components/RoleForm';
import { useGetRolesQuery, useDeleteRoleMutation } from '../api/rolesApi';
import type { RoleDto, ApiError } from '@/types/api';

export function RolesPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleDto | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<RoleDto | undefined>();

  const { data = [], isLoading } = useGetRolesQuery();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteRole(deleteTarget.name).unwrap();
      toast.success('Role deleted');
      setDeleteTarget(undefined);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Failed to delete role');
    }
  };

  const columns = useMemo<ColumnDef<RoleDto>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'description', header: 'Description' },
      {
        id: 'permissions',
        header: 'Permissions',
        cell: ({ row }) => (
          <Chip label={row.original.permissions.length} size="small" variant="outlined" />
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
            <PermissionGuard permission={PERMISSIONS.ROLES_UPDATE}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedRole(row.original);
                    setDrawerOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.ROLES_DELETE}>
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
          Roles
        </Typography>
        <PermissionGuard permission={PERMISSIONS.ROLES_CREATE}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedRole(undefined);
              setDrawerOpen(true);
            }}
          >
            Add Role
          </Button>
        </PermissionGuard>
      </Box>

      <DataTable data={data} columns={columns} isLoading={isLoading} />

      <RoleForm
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedRole(undefined);
        }}
        role={selectedRole}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Role"
        description={`Are you sure you want to delete the role "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </PageTransition>
  );
}
