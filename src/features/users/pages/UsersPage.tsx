import { useState, useMemo, useCallback } from 'react';
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
import PersonOffIcon from '@mui/icons-material/PersonOff';
import SearchIcon from '@mui/icons-material/Search';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PageTransition } from '@/shared/components/PageTransition';
import { PermissionGuard } from '@/shared/components/PermissionGuard';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { formatDate } from '@/shared/utils/format';
import { UserForm } from '../components/UserForm';
import {
  useGetUsersQuery,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
} from '../api/usersApi';
import type { UserDto, ApiError } from '@/types/api';

export function UsersPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserDto | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<UserDto | undefined>();

  const { data, isLoading } = useGetUsersQuery({
    page: page + 1,
    pageSize,
    search: debouncedSearch || undefined,
  });

  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();

  const handleToggleActive = useCallback(
    async (user: UserDto) => {
      try {
        if (user.isActive) {
          await deactivateUser(user.email).unwrap();
          toast.success(`${user.fullName} deactivated`);
        } else {
          await activateUser(user.email).unwrap();
          toast.success(`${user.fullName} activated`);
        }
      } catch (err) {
        const error = err as ApiError;
        toast.error(error.message || 'Action failed');
      }
    },
    [activateUser, deactivateUser],
  );

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser({ email: deleteTarget.email }).unwrap();
      toast.success('User deleted');
      setDeleteTarget(undefined);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const columns = useMemo<ColumnDef<UserDto>[]>(
    () => [
      { accessorKey: 'fullName', header: 'Full Name' },
      { accessorKey: 'email', header: 'Email' },
      { accessorKey: 'roleName', header: 'Role' },
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
            <PermissionGuard permission={PERMISSIONS.USERS_UPDATE}>
              <Tooltip title={row.original.isActive ? 'Deactivate' : 'Activate'}>
                <IconButton size="small" onClick={() => handleToggleActive(row.original)}>
                  <PersonOffIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.USERS_UPDATE}>
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={() => {
                    setSelectedUser(row.original);
                    setDrawerOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard permission={PERMISSIONS.USERS_DELETE}>
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
    [handleToggleActive],
  );

  return (
    <PageTransition>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Users
        </Typography>
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <TextField
            size="small"
            placeholder="Search users…"
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
          <PermissionGuard permission={PERMISSIONS.USERS_CREATE}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedUser(undefined);
                setDrawerOpen(true);
              }}
            >
              Add User
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

      <UserForm
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedUser(undefined);
        }}
        user={selectedUser}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteTarget?.fullName ?? 'this user'}? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </PageTransition>
  );
}
