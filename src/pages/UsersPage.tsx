import { useCallback, useMemo, useState } from 'react';
import { z } from 'zod';
import type { ColumnDef } from '@tanstack/react-table';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
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
import DownloadIcon from '@mui/icons-material/Download';
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
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { CreatedViaChip } from '@/shared/components/CreatedViaChip';
import { LabelValue } from '@/shared/components/LabelValue';
import { TenantContextGuard } from '@/shared/components/TenantContextGuard';
import { ViewDialog } from '@/shared/components/ViewDialog';
import { formatAddress } from '@/shared/utils/format';
import { exportToCsv } from '@/shared/utils/exportCsv';
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
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';
import { useGetTenantSettingsQuery } from '@/features/tenantSettings/api/tenantSettingsApi';
import { useStartImpersonationMutation } from '@/features/impersonation/api/impersonationApi';
import { authApi } from '@/features/auth/api/authApi';
import { apiSlice } from '@/shared/api/apiSlice';
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
  const [createUser, { isLoading }] = useCreateUserMutation();
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
        muiProps: { multiple: true, disableCloseOnSelect: true },
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
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
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
  const [inviteUser, { isLoading }] = useInviteUserMutation();
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
        muiProps: { multiple: true, disableCloseOnSelect: true },
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
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
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
  const [updateUser, { isLoading }] = useUpdateUserMutation();
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
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent dividers>
        <LabelValue label="Email" value={user?.email} sx={{ mb: 2 }} />
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

// ─── View dialog ──────────────────────────────────────────────────────────────

function ViewUserDialog({ user, onClose }: { user: UserDto | null; onClose: () => void }) {
  return (
    <ViewDialog open={!!user} title="User details" onClose={onClose}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <LabelValue label="Full name" value={user?.fullName} />
        <LabelValue label="Email" value={user?.email} />
        <LabelValue
          label="Roles"
          value={
            user?.roles && user.roles.length > 0
              ? user.roles.map((r) => (
                  <Chip key={r} label={r} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                ))
              : undefined
          }
        />
        <LabelValue label="Status" value={<UserStatusChip isActive={user?.isActive ?? false} />} />
        <LabelValue
          label="Created via"
          value={<CreatedViaChip createdVia={user?.createdVia ?? 'Direct'} />}
        />
        <LabelValue label="Address" value={formatAddress(user?.address)} />
      </Box>
    </ViewDialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function UsersPage() {
  const snackbar = useSnackbar();

  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const isTenantAdmin = currentUser?.systemRole === 'TenantAdmin';
  const { data: tenantSettings } = useGetTenantSettingsQuery(undefined, { skip: !isTenantAdmin });

  const canList = usePermission('Users.List');
  const canView = usePermission('Users.View');
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
  const [usersPage, setUsersPage] = useState(0);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [viewUser, setViewUser] = useState<UserDto | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const [statusFilter, setStatusFilter] = useState('');
  const [createdViaFilter, setCreatedViaFilter] = useState('');

  // Invitations tab state
  const [invStatusFilter, setInvStatusFilter] = useState('');
  const [invitationsPage, setInvitationsPage] = useState(0);
  const [revokeTarget, setRevokeTarget] = useState<UserInvitationDto | null>(null);

  // API
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
    page: usersPage + 1,
    pageSize: 20,
    search: debouncedSearch || undefined,
    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
    createdVia: (createdViaFilter as 'Direct' | 'Invitation') || undefined,
  });

  const { data: invitationsData, isLoading: invLoading } = useGetUserInvitationsQuery({
    page: invitationsPage + 1,
    pageSize: 20,
    status: invStatusFilter || undefined,
  });

  const { data: rolesData } = useGetRolesQuery();

  const [startImpersonation, { isLoading: isImpersonating }] = useStartImpersonationMutation();

  const [resendSetup, { isLoading: isResendingSetup }] = useResendUserSetupMutation();
  const [activateUser, { isLoading: isActivating }] = useActivateUserMutation();
  const [deactivateUser, { isLoading: isDeactivating }] = useDeactivateUserMutation();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [revokeInvitation, { isLoading: isRevoking }] = useRevokeUserInvitationMutation();
  const [resendInvitation, { isLoading: isResendingInvitation }] =
    useResendUserInvitationMutation();

  const roleOptions = useMemo(
    () => (rolesData?.items ?? []).map((r) => ({ value: r.id, label: r.name })),
    [rolesData],
  );

  const [exportLoading, setExportLoading] = useState(false);

  const maxUsers = tenantSettings?.planFeatures?.maxUsers ?? -1;
  const totalUsers = usersData?.totalCount ?? 0;
  const atUserLimit = maxUsers !== -1 && totalUsers >= maxUsers;

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

  const handleImpersonate = useCallback(
    async (user: UserDto) => {
      try {
        await startImpersonation({ targetUserId: user.id }).unwrap();
        // Reset cached data (admin's data shouldn't show for impersonated user)
        dispatch(apiSlice.util.resetApiState());
        // getMe refetch picks up the new cookie and sets impersonation state + permissions
        dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
        snackbar.success(`Now impersonating ${user.fullName}.`);
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to start impersonation.');
      }
    },
    [startImpersonation, dispatch, snackbar],
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
            {row.original.roles.length > 0 ? row.original.roles.join(', ') : '-'}
          </Typography>
        ),
      },
      {
        header: 'Created via',
        accessorKey: 'createdVia',
        cell: ({ row }) => <CreatedViaChip createdVia={row.original.createdVia} />,
      },
      {
        header: 'Last login',
        accessorKey: 'lastLoginAt',
        cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
            {row.original.lastLoginAt ? new Date(row.original.lastLoginAt).toLocaleString() : '—'}
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
              {canView && (
                <Tooltip title="View">
                  <IconButton size="small" onClick={() => setViewUser(user)}>
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {canEdit && (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => setEditUser(user)}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {canResend && user.hasPendingSetup && (
                <Tooltip title="Resend setup email">
                  <span>
                    <IconButton
                      size="small"
                      disabled={isResendingSetup}
                      onClick={() => handleResend(user)}
                    >
                      {isResendingSetup ? (
                        <CircularProgress size={14} />
                      ) : (
                        <SendIcon fontSize="small" />
                      )}
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {(canActivate || canDeactivate) && (
                <Tooltip title={user.isActive ? 'Deactivate' : 'Activate'}>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setPendingAction({
                        type: user.isActive ? 'deactivate' : 'activate',
                        user,
                      })
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
              {currentUser?.systemRole === 'SystemAdmin' && user.isActive && (
                <Tooltip title="Impersonate user">
                  <span>
                    <IconButton
                      size="small"
                      color="secondary"
                      disabled={isImpersonating}
                      onClick={() => handleImpersonate(user)}
                    >
                      <SupervisorAccountIcon fontSize="small" />
                    </IconButton>
                  </span>
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
      canView,
      canEdit,
      canResend,
      canActivate,
      canDeactivate,
      canDelete,
      isResendingSetup,
      isImpersonating,
      currentUser,
      handleResend,
      handleImpersonate,
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
      ...(canRevoke || canResend
        ? ([
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
                        <span>
                          <IconButton
                            size="small"
                            color="info"
                            disabled={isResendingInvitation}
                            onClick={() => handleResendInvitation(inv)}
                          >
                            {isResendingInvitation ? (
                              <CircularProgress size={14} />
                            ) : (
                              <EmailIcon fontSize="small" />
                            )}
                          </IconButton>
                        </span>
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
          ] as ColumnDef<UserInvitationDto>[])
        : []),
    ],
    [canRevoke, canResend, isResendingInvitation, setRevokeTarget, handleResendInvitation],
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
        ? 'The user will be able to sign in again.'
        : 'The user will be unable to sign in until reactivated.';

  const handleExportUsers = async () => {
    setExportLoading(true);
    try {
      const { usersApi } = await import('@/features/users/api/usersApi');
      const result = await dispatch(
        usersApi.endpoints.getUsers.initiate({ page: 1, pageSize: 5000 }),
      );
      const items = ('data' in result ? result.data?.items : null) ?? usersData?.items ?? [];
      exportToCsv(
        'users',
        items.map((u) => ({
          Name: u.fullName,
          Email: u.email,
          Roles: u.roles.join('; '),
          Status: u.isActive ? 'Active' : 'Inactive',
          'Last Login': u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '',
          'Created Via': u.createdVia,
        })),
      );
    } finally {
      setExportLoading(false);
    }
  };

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
              <Tooltip
                title={
                  atUserLimit
                    ? `User limit reached (${maxUsers} on ${tenantSettings?.planName} plan)`
                    : ''
                }
              >
                <span>
                  <Button
                    variant="outlined"
                    startIcon={<SendIcon />}
                    disabled={atUserLimit}
                    onClick={() => setInviteOpen(true)}
                  >
                    Invite
                  </Button>
                </span>
              </Tooltip>
            )}
            {canCreate && (
              <Tooltip
                title={
                  atUserLimit
                    ? `User limit reached (${maxUsers} on ${tenantSettings?.planName} plan)`
                    : ''
                }
              >
                <span>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    disabled={atUserLimit}
                    onClick={() => setCreateOpen(true)}
                  >
                    Create user
                  </Button>
                </span>
              </Tooltip>
            )}
          </Box>
        </Box>

        {/* Plan limit banner */}
        {atUserLimit && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            You've reached the <strong>{maxUsers}-user limit</strong> on the{' '}
            <strong>{tenantSettings?.planName}</strong> plan. Upgrade to Pro to add more users.
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Users" />
          <Tab label="Invitations" />
        </Tabs>

        {/* ── Users tab ── */}
        {tab === 0 && !canList && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">You don't have permission to list users.</Typography>
          </Box>
        )}
        {tab === 0 && canList && (
          <Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2, alignItems: 'center' }}>
              <TextField
                size="small"
                placeholder="Search users"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setUsersPage(0);
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
                sx={{ width: 240 }}
              />
              <FormControl size="small" sx={{ minWidth: 140 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setUsersPage(0);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Created via</InputLabel>
                <Select
                  value={createdViaFilter}
                  label="Created via"
                  onChange={(e) => {
                    setCreatedViaFilter(e.target.value);
                    setUsersPage(0);
                  }}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="Direct">Direct</MenuItem>
                  <MenuItem value="Invitation">Invitation</MenuItem>
                </Select>
              </FormControl>
              <Box sx={{ ml: 'auto' }}>
                <Tooltip title="Export to CSV">
                  <span>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={exportLoading ? <CircularProgress size={14} /> : <DownloadIcon />}
                      disabled={exportLoading || !usersData?.items?.length}
                      onClick={handleExportUsers}
                    >
                      Export CSV
                    </Button>
                  </span>
                </Tooltip>
              </Box>
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
        {tab === 1 && !canList && (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">
              You don't have permission to list invitations.
            </Typography>
          </Box>
        )}
        {tab === 1 && canList && (
          <Box>
            <Box sx={{ mb: 2 }}>
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={invStatusFilter}
                  label="Status"
                  onChange={(e) => {
                    setInvStatusFilter(e.target.value);
                    setInvitationsPage(0);
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
        <ViewUserDialog user={viewUser} onClose={() => setViewUser(null)} />
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
          loading={isActivating || isDeactivating || isDeleting}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
        />

        <ConfirmDialog
          open={!!revokeTarget}
          title={`Revoke invitation for "${revokeTarget?.email}"?`}
          description="The invitation link will be invalidated immediately."
          confirmLabel="Revoke"
          danger
          loading={isRevoking}
          onConfirm={handleRevokeConfirm}
          onCancel={() => setRevokeTarget(null)}
        />
      </Box>
    </TenantContextGuard>
  );
}
