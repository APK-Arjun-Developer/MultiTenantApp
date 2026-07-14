import React, { memo, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
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
import SendIcon from '@mui/icons-material/Send';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FormBuilder, FilterForm, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { DataTable } from '@/shared/components/DataTable';
import { AvatarManageModal } from '@/shared/components/AvatarManageModal';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { LoadingButton } from '@/shared/components/LoadingButton';
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
  useUploadUserAvatarByAdminMutation,
  useRemoveUserAvatarByAdminMutation,
  getUserAvatarUrl,
} from '@/features/users/api/usersApi';
import type { ApiError } from '@/types/api';
import { styles } from './UsersPage.styles';
import { createSchema, inviteSchema, editSchema } from './UsersPage.types';
import type {
  CreateValues,
  InviteValues,
  EditValues,
  PendingAction,
  RoleOption,
  CreateUserDialogProps,
  InviteUserDialogProps,
  EditUserDialogProps,
  ViewUserDialogProps,
  UsersPageHeaderProps,
  UsersPageFilterBarProps,
  UsersPageActionsProps,
  UsersInvitationsFilterBarProps,
  UserDto,
  UserInvitationDto,
} from './UsersPage.types';

// ─── Status chip ──────────────────────────────────────────────────────────────

const UserStatusChip = memo(function UserStatusChip({ isActive }: { isActive: boolean }) {
  return (
    <Chip
      label={isActive ? 'Active' : 'Inactive'}
      size="small"
      color={isActive ? 'success' : 'default'}
      variant={isActive ? 'filled' : 'outlined'}
    />
  );
});

const InvitationStatusChip = memo(function InvitationStatusChip({ status }: { status: string }) {
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
      variant="filled"
    />
  );
});

// ─── Create dialog ────────────────────────────────────────────────────────────

const CreateUserDialog = memo(function CreateUserDialog({
  open,
  onClose,
  roleOptions,
}: CreateUserDialogProps) {
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

  const onSubmit = useCallback(
    async (values: CreateValues) => {
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
    },
    [createUser, snackbar, onClose],
  );

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
          sx={styles.dialogForm as never}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── Invite dialog ────────────────────────────────────────────────────────────

const InviteUserDialog = memo(function InviteUserDialog({
  open,
  onClose,
  roleOptions,
}: InviteUserDialogProps) {
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

  const onSubmit = useCallback(
    async (values: InviteValues) => {
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
    },
    [inviteUser, snackbar, onClose],
  );

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
          sx={styles.dialogForm as never}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── Edit dialog ──────────────────────────────────────────────────────────────

const EditUserDialog = memo(function EditUserDialog({
  open,
  onClose,
  user,
  roleOptions,
}: EditUserDialogProps) {
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

  const onSubmit = useCallback(
    async (values: EditValues) => {
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
    },
    [updateUser, snackbar, onClose, user, tenantAddress],
  );

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit User</DialogTitle>
      <DialogContent dividers>
        <LabelValue label="Email" value={user?.email} sx={styles.editDialogEmail} />
        <FormBuilder
          key={user?.id}
          schema={editSchema}
          fields={fields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Save changes"
          cancelText="Cancel"
          sx={styles.dialogForm as never}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── View dialog ──────────────────────────────────────────────────────────────

const ViewUserDialog = memo(function ViewUserDialog({ user, onClose }: ViewUserDialogProps) {
  return (
    <ViewDialog open={!!user} title="User details" onClose={onClose}>
      <Box sx={styles.viewDialogBody}>
        <LabelValue label="Full name" value={user?.fullName} />
        <LabelValue label="Email" value={user?.email} />
        <LabelValue
          label="Roles"
          value={
            user?.roles && user.roles.length > 0
              ? user.roles.map((r) => <Chip key={r} label={r} size="small" sx={styles.roleChip} />)
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
});

// ─── Section sub-components ───────────────────────────────────────────────────

const UsersPageHeader = memo(function UsersPageHeader({
  canCreate,
  canInvite,
  atUserLimit,
  maxUsers,
  planName,
  onCreateOpen,
  onInviteOpen,
}: UsersPageHeaderProps) {
  return (
    <Box sx={styles.header}>
      <Box sx={styles.headerTitle}>
        <Box sx={styles.pageIconBox}>
          <PeopleIcon sx={styles.pageIconSize} />
        </Box>
        <Typography variant="h5" sx={styles.titleText}>
          Users
        </Typography>
      </Box>
      <Box sx={styles.headerActions}>
        {canInvite && (
          <Tooltip
            title={atUserLimit ? `User limit reached (${maxUsers} on ${planName} plan)` : ''}
          >
            <span>
              <Button
                variant="outlined"
                startIcon={<SendIcon />}
                disabled={atUserLimit}
                onClick={onInviteOpen}
              >
                Invite
              </Button>
            </span>
          </Tooltip>
        )}
        {canCreate && (
          <Tooltip
            title={atUserLimit ? `User limit reached (${maxUsers} on ${planName} plan)` : ''}
          >
            <span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={atUserLimit}
                onClick={onCreateOpen}
              >
                Create user
              </Button>
            </span>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
});

const UsersPageFilterBar = memo(function UsersPageFilterBar({
  userFilterFields,
  defaultValues,
  onChange,
}: UsersPageFilterBarProps) {
  return (
    <Box sx={styles.filterBar}>
      <FilterForm
        fields={userFilterFields}
        defaultValues={defaultValues}
        onChange={onChange}
        showReset
        spacing={2}
      />
    </Box>
  );
});

const UsersPageActions = memo(function UsersPageActions({
  exportLoading,
  hasItems,
  onExport,
}: UsersPageActionsProps) {
  return (
    <Box sx={styles.exportRow}>
      <Tooltip title="Export to CSV">
        <span>
          <LoadingButton
            variant="outlined"
            size="small"
            loading={exportLoading}
            disabled={!hasItems}
            onClick={onExport}
          >
            Export CSV
          </LoadingButton>
        </span>
      </Tooltip>
    </Box>
  );
});

const UsersInvitationsFilterBar = memo(function UsersInvitationsFilterBar({
  invFilterFields,
  defaultValues,
  onChange,
}: UsersInvitationsFilterBarProps) {
  return (
    <Box sx={styles.invitationsFilterBar}>
      <FilterForm
        fields={invFilterFields}
        defaultValues={defaultValues}
        onChange={onChange}
        showReset
        spacing={2}
      />
    </Box>
  );
});

const USERS_TABS = ['users', 'invitations'] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export const UsersPage = memo(function UsersPage() {
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
  const [searchParams, setSearchParams] = useSearchParams();
  const tab = useMemo(() => {
    const idx = (USERS_TABS as readonly string[]).indexOf(searchParams.get('tab') ?? '');
    return idx >= 0 ? idx : 0;
  }, [searchParams]);

  // Users tab state
  const [userFilter, setUserFilter] = useState({ search: '', status: '', createdVia: '' });
  const debouncedSearch = useDebounce(userFilter.search, 400);
  const [usersPage, setUsersPage] = useState(0);
  const [usersSortBy, setUsersSortBy] = useState<string | undefined>(undefined);
  const [usersSortOrder, setUsersSortOrder] = useState<'asc' | 'desc'>('asc');

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserDto | null>(null);
  const [viewUser, setViewUser] = useState<UserDto | null>(null);
  const [avatarUser, setAvatarUser] = useState<UserDto | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  // Invitations tab state
  const [invStatusFilter, setInvStatusFilter] = useState('');
  const [invitationsPage, setInvitationsPage] = useState(0);
  const [revokeTarget, setRevokeTarget] = useState<UserInvitationDto | null>(null);

  // Field configs
  const userFilterFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'search',
        label: 'Search',
        type: FIELD_TYPE.SEARCH,
        placeholder: 'Search users…',
        grid: { xs: 12, sm: 5 },
      },
      {
        name: 'status',
        label: 'Status',
        type: FIELD_TYPE.SELECT,
        options: [
          { label: 'All', value: '' },
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
        ],
        grid: { xs: 6, sm: 3 },
      },
      {
        name: 'createdVia',
        label: 'Created via',
        type: FIELD_TYPE.SELECT,
        options: [
          { label: 'All', value: '' },
          { label: 'Direct', value: 'Direct' },
          { label: 'Invitation', value: 'Invitation' },
        ],
        grid: { xs: 6, sm: 4 },
      },
    ],
    [],
  );

  const invFilterFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'status',
        label: 'Status',
        type: FIELD_TYPE.SELECT,
        options: [
          { label: 'All', value: '' },
          { label: 'Pending', value: 'pending' },
          { label: 'Accepted', value: 'accepted' },
          { label: 'Expired', value: 'expired' },
          { label: 'Revoked', value: 'revoked' },
        ],
        grid: { xs: 12, sm: 4 },
      },
    ],
    [],
  );

  // Default values (memoised objects — prevent referential churn on FilterForm)
  const userFilterDefaults = useMemo(() => ({ search: '', status: '', createdVia: '' }), []);

  const invFilterDefaults = useMemo(() => ({ status: '' }), []);

  // API
  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
    page: usersPage + 1,
    pageSize: 20,
    search: debouncedSearch || undefined,
    isActive:
      userFilter.status === 'active' ? true : userFilter.status === 'inactive' ? false : undefined,
    createdVia: (userFilter.createdVia as 'Direct' | 'Invitation') || undefined,
    sortBy: usersSortBy,
    sortOrder: usersSortBy ? usersSortOrder : undefined,
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
  const [uploadUserAvatar, { isLoading: isUploadingAvatar }] = useUploadUserAvatarByAdminMutation();
  const [removeUserAvatar, { isLoading: isRemovingAvatar }] = useRemoveUserAvatarByAdminMutation();

  const roleOptions = useMemo<RoleOption[]>(
    () => (rolesData?.items ?? []).map((r) => ({ value: r.id, label: r.name })),
    [rolesData],
  );

  const [exportLoading, setExportLoading] = useState(false);

  const maxUsers = tenantSettings?.planFeatures?.maxUsers ?? -1;
  const totalUsers = usersData?.totalCount ?? 0;
  const atUserLimit = useMemo(
    () => maxUsers !== -1 && totalUsers >= maxUsers,
    [maxUsers, totalUsers],
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleUsersSortChange = useCallback(
    (newSortBy: string | undefined, newSortOrder: 'asc' | 'desc' | undefined) => {
      setUsersSortBy(newSortBy);
      setUsersSortOrder(newSortOrder ?? 'asc');
      setUsersPage(0);
    },
    [],
  );

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, v: number) => {
      setSearchParams({ tab: USERS_TABS[v] }, { replace: true });
    },
    [setSearchParams],
  );

  const handleCreateOpen = useCallback(() => setCreateOpen(true), []);
  const handleCreateClose = useCallback(() => setCreateOpen(false), []);
  const handleInviteOpen = useCallback(() => setInviteOpen(true), []);
  const handleInviteClose = useCallback(() => setInviteOpen(false), []);
  const handleViewClose = useCallback(() => setViewUser(null), []);
  const handleEditClose = useCallback(() => setEditUser(null), []);
  const handleAvatarClose = useCallback(() => setAvatarUser(null), []);
  const handlePendingCancel = useCallback(() => setPendingAction(null), []);
  const handleRevokeCancel = useCallback(() => setRevokeTarget(null), []);

  const handleUserFilterChange = useCallback((values: Record<string, unknown>) => {
    setUserFilter(values as { search: string; status: string; createdVia: string });
    setUsersPage(0);
  }, []);

  const handleInvFilterChange = useCallback((values: Record<string, unknown>) => {
    setInvStatusFilter((values.status as string) ?? '');
    setInvitationsPage(0);
  }, []);

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
        dispatch(apiSlice.util.resetApiState());
        dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
        snackbar.success(`Now impersonating ${user.fullName}.`);
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to start impersonation.');
      }
    },
    [startImpersonation, dispatch, snackbar],
  );

  const handleConfirmAction = useCallback(async () => {
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
  }, [pendingAction, deleteUser, activateUser, deactivateUser, snackbar]);

  const handleRevokeConfirm = useCallback(async () => {
    if (!revokeTarget) return;
    try {
      await revokeInvitation(revokeTarget.id).unwrap();
      snackbar.success(`Invitation to ${revokeTarget.email} revoked.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to revoke invitation.');
    } finally {
      setRevokeTarget(null);
    }
  }, [revokeTarget, revokeInvitation, snackbar]);

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

  const handleUploadAvatar = useCallback(
    async (file: File) => {
      if (!avatarUser) return;
      try {
        const updated = await uploadUserAvatar({ userId: avatarUser.id, file }).unwrap();
        setAvatarUser({ ...avatarUser, profileFileId: updated.profileFileId });
        snackbar.success('Profile picture updated.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to upload avatar.');
      }
    },
    [avatarUser, uploadUserAvatar, snackbar],
  );

  const handleRemoveAvatar = useCallback(async () => {
    if (!avatarUser) return;
    try {
      const updated = await removeUserAvatar(avatarUser.id).unwrap();
      setAvatarUser({ ...avatarUser, profileFileId: updated.profileFileId });
      snackbar.success('Profile picture removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove avatar.');
    }
  }, [avatarUser, removeUserAvatar, snackbar]);

  const handleExportUsers = useCallback(async () => {
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
  }, [dispatch, usersData?.items]);

  // ── Table columns ─────────────────────────────────────────────────────────────

  const userColumns = useMemo<ColumnDef<UserDto>[]>(
    () => [
      {
        id: 'avatar',
        header: '',
        cell: ({ row }) => {
          const user = row.original;
          const initials = user.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return canEdit ? (
            <Tooltip title="Manage profile photo">
              <Avatar
                src={user.profileFileId ? getUserAvatarUrl(user.id) : undefined}
                sx={styles.avatarClickable}
                onClick={() => setAvatarUser(user)}
              >
                {initials}
              </Avatar>
            </Tooltip>
          ) : (
            <Avatar
              src={user.profileFileId ? getUserAvatarUrl(user.id) : undefined}
              sx={styles.avatarReadOnly}
            >
              {initials}
            </Avatar>
          );
        },
      },
      {
        header: 'User',
        accessorKey: 'fullName',
        cell: ({ row }) => (
          <Box sx={styles.userCell}>
            <Typography variant="body2" sx={styles.userCellName}>
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
          <Typography variant="body2" color="text.secondary" sx={styles.lastLoginCell}>
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
            <Box sx={styles.actionsCell}>
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
                  <Box sx={styles.invitationActionsCell}>
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
    [canRevoke, canResend, isResendingInvitation, handleResendInvitation],
  );

  // ── Confirm dialog copy ───────────────────────────────────────────────────────

  const confirmTitle = useMemo(
    () =>
      pendingAction?.type === 'delete'
        ? `Delete "${pendingAction.user.fullName}"?`
        : pendingAction?.type === 'activate'
          ? `Activate "${pendingAction?.user.fullName}"?`
          : `Deactivate "${pendingAction?.user.fullName}"?`,
    [pendingAction],
  );

  const confirmMessage = useMemo(
    () =>
      pendingAction?.type === 'delete'
        ? 'This will permanently remove the user. This action cannot be undone.'
        : pendingAction?.type === 'activate'
          ? 'The user will be able to sign in again.'
          : 'The user will be unable to sign in until reactivated.',
    [pendingAction],
  );

  // ── Avatar modal helpers ──────────────────────────────────────────────────────

  const avatarSrc = useMemo(
    () => (avatarUser?.profileFileId ? getUserAvatarUrl(avatarUser.id) : null),
    [avatarUser],
  );

  const avatarInitials = useMemo(
    () =>
      avatarUser
        ? avatarUser.fullName
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : '',
    [avatarUser],
  );

  return (
    <TenantContextGuard>
      <Box sx={styles.root}>
        {/* Header */}
        <UsersPageHeader
          canCreate={canCreate}
          canInvite={canInvite}
          atUserLimit={atUserLimit}
          maxUsers={maxUsers}
          planName={tenantSettings?.planName}
          onCreateOpen={handleCreateOpen}
          onInviteOpen={handleInviteOpen}
        />

        {/* Plan limit banner */}
        {atUserLimit && (
          <Alert severity="warning" sx={styles.limitAlert}>
            You've reached the <strong>{maxUsers}-user limit</strong> on the{' '}
            <strong>{tenantSettings?.planName}</strong> plan. Upgrade to Pro to add more users.
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={tab} onChange={handleTabChange} sx={styles.tabsRow}>
          <Tab label="Users" />
          <Tab label="Invitations" />
        </Tabs>

        {/* ── Users tab ── */}
        {tab === 0 && !canList && (
          <Box sx={styles.noPermission}>
            <Typography color="text.secondary">You don't have permission to list users.</Typography>
          </Box>
        )}
        {tab === 0 && canList && (
          <Box>
            <UsersPageFilterBar
              userFilterFields={userFilterFields}
              defaultValues={userFilterDefaults}
              onChange={handleUserFilterChange}
            />
            <UsersPageActions
              exportLoading={exportLoading}
              hasItems={!!usersData?.items?.length}
              onExport={handleExportUsers}
            />
            <DataTable
              columns={userColumns}
              data={usersData?.items ?? []}
              isLoading={usersLoading}
              page={usersPage}
              pageSize={20}
              totalCount={usersData?.totalCount ?? 0}
              onPageChange={setUsersPage}
              sortBy={usersSortBy}
              sortOrder={usersSortOrder}
              sortableColumns={['fullName', 'lastLoginAt']}
              onSortChange={handleUsersSortChange}
            />
          </Box>
        )}

        {/* ── Invitations tab ── */}
        {tab === 1 && !canList && (
          <Box sx={styles.noPermission}>
            <Typography color="text.secondary">
              You don't have permission to list invitations.
            </Typography>
          </Box>
        )}
        {tab === 1 && canList && (
          <Box>
            <UsersInvitationsFilterBar
              invFilterFields={invFilterFields}
              defaultValues={invFilterDefaults}
              onChange={handleInvFilterChange}
            />
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
        <AvatarManageModal
          open={!!avatarUser}
          onClose={handleAvatarClose}
          src={avatarSrc}
          initials={avatarInitials}
          title={`Profile photo — ${avatarUser?.fullName ?? ''}`}
          uploading={isUploadingAvatar || isRemovingAvatar}
          onUpload={handleUploadAvatar}
          onRemove={avatarUser?.profileFileId ? handleRemoveAvatar : undefined}
        />
        <ViewUserDialog user={viewUser} onClose={handleViewClose} />
        <CreateUserDialog open={createOpen} onClose={handleCreateClose} roleOptions={roleOptions} />
        <InviteUserDialog open={inviteOpen} onClose={handleInviteClose} roleOptions={roleOptions} />
        <EditUserDialog
          open={!!editUser}
          onClose={handleEditClose}
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
          onCancel={handlePendingCancel}
        />

        <ConfirmDialog
          open={!!revokeTarget}
          title={`Revoke invitation for "${revokeTarget?.email}"?`}
          description="The invitation link will be invalidated immediately."
          confirmLabel="Revoke"
          danger
          loading={isRevoking}
          onConfirm={handleRevokeConfirm}
          onCancel={handleRevokeCancel}
        />
      </Box>
    </TenantContextGuard>
  );
});
