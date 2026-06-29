import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';
import type { ColumnDef } from '@tanstack/react-table';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import PeopleIcon from '@mui/icons-material/People';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { TenantContextGuard } from '@/shared/components/TenantContextGuard';
import { useDebounce } from '@/shared/hooks';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { usePermission } from '@/shared/hooks/usePermission';
import {
  addressZodShape,
  requiredAddressZodShape,
  getAddressFields,
  getSameAsCompanyField,
  buildAddressPayload,
} from '@/shared/forms/addressFields';
import { useGetCurrentUserQuery } from '@/features/users/api/usersApi';
import { useGetRolesQuery } from '@/features/roles/api/rolesApi';
import {
  useGetUsersQuery,
  useCreateUserMutation,
  useInviteUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResendUserSetupMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetUserInvitationsQuery,
  useRevokeUserInvitationMutation,
  useResendUserInvitationMutation,
} from '@/features/users/api/usersApi';
import type { UserDto, UserInvitationDto, ApiError } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  email: z.string().email('Invalid email address'),
  // AUTOCOMPLETE multiple returns option objects { value, label }, not plain strings
  roleIds: z.array(z.any()).min(1, 'At least one role is required'),
  ...requiredAddressZodShape,
});
type CreateValues = z.infer<typeof createSchema>;

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  roleIds: z.array(z.any()).min(1, 'At least one role is required'),
});
type InviteValues = z.infer<typeof inviteSchema>;

const editSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  roleId: z.string().optional(),
  sameAsCompany: z.boolean().default(false),
  ...addressZodShape,
});
type EditValues = z.infer<typeof editSchema>;

// ─── Status chip ──────────────────────────────────────────────────────────────

function UserStatusChip({ isActive }: { isActive: boolean }) {
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      color={isActive ? 'success' : 'default'}
      variant="outlined"
    />
  );
}

function InvitationStatusChip({ status }: { status: string }) {
  const color =
    status === 'accepted'
      ? 'success'
      : status === 'pending'
        ? 'primary'
        : status === 'expired'
          ? 'warning'
          : 'error';
  return (
    <Chip
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      size="small"
      color={color}
      variant="outlined"
    />
  );
}

// ─── Create dialog ────────────────────────────────────────────────────────────

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  roleOptions: { value: string; label: string }[];
}

function CreateUserDialog({ open, onClose, roleOptions }: CreateUserDialogProps) {
  const [createUser] = useCreateUserMutation();
  const snackbar = useSnackbar();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'fullName',
        label: 'Full name',
        type: FIELD_TYPE.TEXT,
        required: true,
      },
      {
        name: 'email',
        label: 'Email address',
        type: FIELD_TYPE.TEXT,
        required: true,
        muiProps: { type: 'email', helperText: 'Account setup email will be sent here' },
      },
      {
        name: 'roleIds',
        label: 'Roles',
        type: FIELD_TYPE.AUTOCOMPLETE,
        required: true,
        options: roleOptions,
        defaultValue: [],
        muiProps: { multiple: true },
      },
      ...getAddressFields(undefined, 'Address', true),
    ],
    [roleOptions],
  );

  const onSubmit = async (values: CreateValues) => {
    try {
      const result = await createUser({
        fullName: values.fullName,
        email: values.email,
        roleIds: values.roleIds.map((r: unknown) =>
          typeof r === 'string' ? r : (r as { value: string }).value,
        ),
        ...buildAddressPayload(values),
      }).unwrap();
      snackbar.success(`User "${result.fullName}" created. Setup email sent to ${result.email}.`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to create user.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create User</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={open ? 'open' : 'closed'}
          schema={createSchema}
          fields={fields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Create user"
          cancelText="Cancel"
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Invite dialog ────────────────────────────────────────────────────────────

interface InviteUserDialogProps {
  open: boolean;
  onClose: () => void;
  roleOptions: { value: string; label: string }[];
}

function InviteUserDialog({ open, onClose, roleOptions }: InviteUserDialogProps) {
  const [inviteUser] = useInviteUserMutation();
  const snackbar = useSnackbar();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'email',
        label: 'Email address',
        type: FIELD_TYPE.TEXT,
        required: true,
        muiProps: { type: 'email', helperText: 'Invitation email will be sent here' },
      },
      {
        name: 'roleIds',
        label: 'Roles',
        type: FIELD_TYPE.AUTOCOMPLETE,
        required: true,
        options: roleOptions,
        defaultValue: [],
        muiProps: { multiple: true },
      },
    ],
    [roleOptions],
  );

  const onSubmit = async (values: InviteValues) => {
    try {
      await inviteUser({
        email: values.email,
        roleIds: values.roleIds.map((r: unknown) =>
          typeof r === 'string' ? r : (r as { value: string }).value,
        ),
      }).unwrap();
      snackbar.success(`Invitation sent to ${values.email}.`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to send invitation.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite User</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={open ? 'open' : 'closed'}
          schema={inviteSchema}
          fields={fields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Send invitation"
          cancelText="Cancel"
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

interface EditUserDialogProps {
  open: boolean;
  onClose: () => void;
  user: UserDto | null;
  roleOptions: { value: string; label: string }[];
}

function EditUserDialog({ open, onClose, user, roleOptions }: EditUserDialogProps) {
  const [updateUser] = useUpdateUserMutation();
  const snackbar = useSnackbar();
  const { data: currentUser } = useGetCurrentUserQuery();
  const tenantAddress = currentUser?.tenant?.address ?? null;

  const currentRoleId = useMemo(() => {
    if (!user || !roleOptions.length) return undefined;
    const matchedRole = roleOptions.find((r) => user.roles.includes(r.label));
    return matchedRole?.value;
  }, [user, roleOptions]);

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'fullName',
        label: 'Full name',
        type: FIELD_TYPE.TEXT,
        required: true,
        defaultValue: user?.fullName,
      },
      {
        name: 'roleId',
        label: 'Role',
        type: FIELD_TYPE.SELECT,
        options: roleOptions,
        defaultValue: currentRoleId,
      },
      ...(tenantAddress ? [getSameAsCompanyField('Address')] : []),
      ...getAddressFields(user?.address, 'Address').map((f) => ({
        ...f,
        ...(tenantAddress ? { visibleIf: (v: Record<string, unknown>) => !v.sameAsCompany } : {}),
      })),
    ],
    [user, roleOptions, currentRoleId, tenantAddress],
  );

  const onSubmit = async (values: EditValues) => {
    if (!user) return;
    try {
      const addressPayload =
        values.sameAsCompany && tenantAddress
          ? { address: tenantAddress }
          : buildAddressPayload(values);

      await updateUser({
        email: user.email,
        fullName: values.fullName,
        roleId: values.roleId || null,
        ...addressPayload,
      }).unwrap();
      snackbar.success('User updated.');
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update user.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent dividers>
        <FormBuilder
          key={user?.id}
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

// ─── Action types ─────────────────────────────────────────────────────────────

type ActionType = 'delete' | 'activate' | 'deactivate';

interface PendingAction {
  type: ActionType;
  user: UserDto;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function UsersPage() {
  const snackbar = useSnackbar();

  const canCreate = usePermission('Onboarding.Create');
  const canInvite = usePermission('Onboarding.Invite');
  const canEdit = usePermission('Users.Edit');
  const canDelete = usePermission('Users.Delete');
  const canActivate = usePermission('Onboarding.Activate');
  const canDeactivate = usePermission('Onboarding.Deactivate');
  const canResend = usePermission('Onboarding.Resend');
  const canRevoke = usePermission('Onboarding.Revoke');

  // Tabs
  const [tab, setTab] = useState(0);

  // Users tab state
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [usersPage, setUsersPage] = useState(1);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Invitations tab state
  const [invStatusFilter, setInvStatusFilter] = useState('');
  const [invitationsPage, setInvitationsPage] = useState(1);
  const [revokeTarget, setRevokeTarget] = useState<UserInvitationDto | null>(null);

  // API
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
    page: usersPage,
    pageSize: 20,
    search: debouncedSearch || undefined,
  });

  const { data: invitationsData, isLoading: invLoading } = useGetUserInvitationsQuery({
    page: invitationsPage,
    pageSize: 20,
    status: invStatusFilter || undefined,
  });

  const { data: rolesData } = useGetRolesQuery();

  const [resendSetup] = useResendUserSetupMutation();
  const [activateUser] = useActivateUserMutation();
  const [deactivateUser] = useDeactivateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [revokeInvitation] = useRevokeUserInvitationMutation();
  const [resendInvitation] = useResendUserInvitationMutation();

  const roleOptions = useMemo(
    () => (rolesData?.items ?? []).map((r) => ({ value: r.id, label: r.name })),
    [rolesData],
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleResend = useCallback(
    async (user: UserDto) => {
      try {
        await resendSetup(user.id).unwrap();
        snackbar.success(`Setup email resent to ${user.email}.`);
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to resend setup email.');
      }
    },
    [resendSetup, snackbar],
  );

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    const { type, user } = pendingAction;
    try {
      if (type === 'delete') {
        await deleteUser({ email: user.email }).unwrap();
        snackbar.success(`User "${user.fullName}" deleted.`);
      } else if (type === 'activate') {
        await activateUser(user.id).unwrap();
        snackbar.success(`User "${user.fullName}" activated.`);
      } else {
        await deactivateUser(user.id).unwrap();
        snackbar.success(`User "${user.fullName}" deactivated.`);
      }
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Action failed.');
    } finally {
      setPendingAction(null);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!revokeTarget) return;
    try {
      await revokeInvitation(revokeTarget.id).unwrap();
      snackbar.success(`Invitation to ${revokeTarget.email} revoked.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to revoke invitation.');
    } finally {
      setRevokeTarget(null);
    }
  };

  const handleResendInvitation = useCallback(
    async (inv: UserInvitationDto) => {
      try {
        await resendInvitation(inv.id).unwrap();
        snackbar.success(`Invitation resent to ${inv.email}.`);
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to resend invitation.');
      }
    },
    [resendInvitation, snackbar],
  );

  // ── Table columns ────────────────────────────────────────────────────────────

  const userColumns = useMemo<ColumnDef<UserDto>[]>(
    () => [
      {
        header: 'User',
        accessorKey: 'fullName',
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.original.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.email}
            </Typography>
          </Box>
        ),
      },
      {
        header: 'Roles',
        accessorKey: 'roles',
        cell: ({ row }) => (
          <Typography variant="body2">
            {row.original.roles.length > 0 ? row.original.roles.join(', ') : '—'}
          </Typography>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'isActive',
        cell: ({ row }) => <UserStatusChip isActive={row.original.isActive} />,
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
          const user = row.original;
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {canEdit && (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => setEditUser(user)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {canResend && user.hasPendingSetup && (
                <Tooltip title="Resend setup email">
                  <IconButton size="small" onClick={() => handleResend(user)}>
                    <SendIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {(canActivate || canDeactivate) && (
                <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setPendingAction({ type: user.isActive ? 'deactivate' : 'activate', user })
                    }
                  >
                    {user.isActive ? (
                      <BlockIcon fontSize="small" />
                    ) : (
                      <CheckCircleIcon fontSize="small" />
                    )}
                  </IconButton>
                </Tooltip>
              )}
              {canDelete && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setPendingAction({ type: 'delete', user })}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        },
      },
    ],
    [
      canEdit,
      canResend,
      canActivate,
      canDeactivate,
      canDelete,
      setEditUser,
      setPendingAction,
      handleResend,
    ],
  );

  const invitationColumns = useMemo<ColumnDef<UserInvitationDto>[]>(
    () => [
      {
        header: 'Email',
        accessorKey: 'email',
        cell: ({ row }) => <Typography variant="body2">{row.original.email}</Typography>,
      },
      {
        header: 'Status',
        accessorKey: 'status',
        cell: ({ row }) => <InvitationStatusChip status={row.original.status} />,
      },
      {
        header: 'Expires',
        accessorKey: 'expiresAt',
        cell: ({ row }) => (
          <Typography variant="body2">
            {new Date(row.original.expiresAt).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => {
          const inv = row.original;
          const isPending = !inv.isRevoked && !inv.isAccepted && !inv.isExpired;
          const canRevokeRow = canRevoke && isPending;
          const canResendRow = canResend && isPending;
          if (!canRevokeRow && !canResendRow) return null;
          return (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {canResendRow && (
                <Tooltip title="Resend invitation">
                  <IconButton size="small" color="info" onClick={() => handleResendInvitation(inv)}>
                    <EmailIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {canRevokeRow && (
                <Tooltip title="Revoke invitation">
                  <IconButton size="small" color="error" onClick={() => setRevokeTarget(inv)}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
          );
        },
      },
    ],
    [canRevoke, canResend, setRevokeTarget, handleResendInvitation],
  );

  // ── Confirm dialog copy ───────────────────────────────────────────────────────

  const confirmTitle =
    pendingAction?.type === 'delete'
      ? `Delete "${pendingAction.user.fullName}"?`
      : pendingAction?.type === 'activate'
        ? `Activate "${pendingAction?.user.fullName}"?`
        : `Deactivate "${pendingAction?.user.fullName}"?`;

  const confirmMessage =
    pendingAction?.type === 'delete'
      ? 'This will permanently remove the user. This action cannot be undone.'
      : pendingAction?.type === 'activate'
        ? 'The user will be able to log in again.'
        : 'The user will be unable to log in until reactivated.';

  return (
    <TenantContextGuard>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PeopleIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Users
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {canInvite && (
              <Button
                variant="outlined"
                startIcon={<SendIcon />}
                onClick={() => setInviteOpen(true)}
              >
                Invite
              </Button>
            )}
            {canCreate && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setCreateOpen(true)}
              >
                Create user
              </Button>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Users" />
          <Tab label="Invitations" />
        </Tabs>

        {/* ── Users tab ── */}
        {tab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                size="small"
                placeholder="Search users…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setUsersPage(1);
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
              columns={userColumns}
              data={usersData?.items ?? []}
              isLoading={usersLoading}
              page={usersPage}
              pageSize={20}
              totalCount={usersData?.totalCount ?? 0}
              onPageChange={setUsersPage}
            />
          </Box>
        )}

        {/* ── Invitations tab ── */}
        {tab === 1 && (
          <Box>
            <Box sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={invStatusFilter}
                  label="Status"
                  onChange={(e) => {
                    setInvStatusFilter(e.target.value);
                    setInvitationsPage(1);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="revoked">Revoked</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <DataTable
              columns={invitationColumns}
              data={invitationsData?.items ?? []}
              isLoading={invLoading}
              page={invitationsPage}
              pageSize={20}
              totalCount={invitationsData?.totalCount ?? 0}
              onPageChange={setInvitationsPage}
            />
          </Box>
        )}

        {/* Dialogs */}
        <CreateUserDialog
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          roleOptions={roleOptions}
        />
        <InviteUserDialog
          open={inviteOpen}
          onClose={() => setInviteOpen(false)}
          roleOptions={roleOptions}
        />
        <EditUserDialog
          open={!!editUser}
          onClose={() => setEditUser(null)}
          user={editUser}
          roleOptions={roleOptions}
        />

        <ConfirmDialog
          open={!!pendingAction}
          title={confirmTitle}
          description={confirmMessage}
          confirmLabel={
            pendingAction?.type === 'delete'
              ? 'Delete'
              : pendingAction?.type === 'activate'
                ? 'Activate'
                : 'Deactivate'
          }
          danger={pendingAction?.type === 'delete'}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />

        <ConfirmDialog
          open={!!revokeTarget}
          title={`Revoke invitation for ${revokeTarget?.email}?`}
          description="The invitation link will no longer be valid."
          confirmLabel="Revoke"
          onConfirm={handleRevokeConfirm}
          onCancel={() => setRevokeTarget(null)}
        />
      </Box>
    </TenantContextGuard>
  );
}
