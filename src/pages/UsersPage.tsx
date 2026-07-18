import { memo, useCallback, useMemo, useState } from 'react';
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
import type { ColumnDef } from '@tanstack/react-table';
import { FIELD_TYPE, type FieldConfig, FilterForm, FormBuilder } from 'mui-schema-form-builder';

import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { authApi } from '@/features/auth/api/authApi';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';
import { useStartImpersonationMutation } from '@/features/impersonation/api/impersonationApi';
import { useGetRolesQuery } from '@/features/roles/api/rolesApi';
import { useGetTenantSettingsQuery } from '@/features/tenantSettings/api/tenantSettingsApi';
import {
  getUserAvatarUrl,
  useActivateUserMutation,
  useCreateUserMutation,
  useDeactivateUserMutation,
  useDeleteUserMutation,
  useGetCurrentUserQuery,
  useGetUserInvitationsQuery,
  useGetUsersQuery,
  useInviteUserMutation,
  useRemoveUserAvatarByAdminMutation,
  useResendUserInvitationMutation,
  useResendUserSetupMutation,
  useRevokeUserInvitationMutation,
  usersApi,
  useUpdateUserMutation,
  useUploadUserAvatarByAdminMutation,
} from '@/features/users/api/usersApi';
import { apiSlice } from '@/shared/api/apiSlice';
import {
  ActiveStatusChip,
  AvatarManageModal,
  ConfirmDialog,
  CreatedViaChip,
  DataTable,
  Icon,
  InvitationStatusChip,
  LabelValue,
  LoadingButton,
  TenantContextGuard,
  ViewDialog,
} from '@/shared/components';
import {
  ACTIVE_STATUS_OPTIONS,
  CREATED_VIA_OPTIONS,
  INVITATION_STATUS_OPTIONS,
} from '@/shared/constants/filterOptions';
import { EXPORT_PAGE_SIZE } from '@/shared/constants/list';
import {
  buildAddressPayload,
  getAddressFields,
  getSameAsCompanyField,
} from '@/shared/forms/addressFields';
import {
  useBooleanDialog,
  useFilterState,
  useItemDialog,
  usePermission,
  useSnackbar,
  useTableState,
  useUrlTabs,
} from '@/shared/hooks';
import { exportToCsv } from '@/shared/utils/exportCsv';
import {
  formatAddress,
  formatDate,
  formatDateTime,
  getInitials,
  statusToIsActive,
} from '@/shared/utils/format';
import type { ApiError, UserCreatedVia } from '@/types/api';

import { styles } from './UsersPage.styles';
import {
  createSchema,
  type CreateUserDialogProps,
  type CreateValues,
  editSchema,
  type EditUserDialogProps,
  type EditValues,
  inviteSchema,
  type InviteUserDialogProps,
  type InviteValues,
  type PendingAction,
  type RoleOption,
  type UserDto,
  type UserInvitationDto,
  type UsersInvitationsFilterBarProps,
  type UsersPageActionsProps,
  type UsersPageFilterBarProps,
  type UsersPageHeaderProps,
  type ViewUserDialogProps,
} from './UsersPage.types';

const USER_FILTER_DEFAULT = { search: '', status: '', createdVia: '' };
const INV_FILTER_DEFAULT = { status: '' };
const USERS_TABS = ['users', 'invitations'] as const;

const CreateUserDialog = memo(({ open, onClose, roleOptions }: CreateUserDialogProps) => {
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
          sx={styles.dialogForm}
        />
      </DialogContent>
    </Dialog>
  );
});

const InviteUserDialog = memo(({ open, onClose, roleOptions }: InviteUserDialogProps) => {
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
          sx={styles.dialogForm}
        />
      </DialogContent>
    </Dialog>
  );
});

const EditUserDialog = memo(({ open, onClose, user, roleOptions }: EditUserDialogProps) => {
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
          sx={styles.dialogForm}
        />
      </DialogContent>
    </Dialog>
  );
});

const ViewUserDialog = memo(({ user, onClose }: ViewUserDialogProps) => {
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
        <LabelValue
          label="Status"
          value={<ActiveStatusChip isActive={user?.isActive ?? false} />}
        />
        <LabelValue
          label="Created via"
          value={<CreatedViaChip createdVia={user?.createdVia ?? 'Direct'} />}
        />
        <LabelValue label="Address" value={formatAddress(user?.address)} />
      </Box>
    </ViewDialog>
  );
});

const UsersPageHeader = memo(
  ({
    canCreate,
    canInvite,
    atUserLimit,
    maxUsers,
    planName,
    onCreateOpen,
    onInviteOpen,
  }: UsersPageHeaderProps) => {
    return (
      <Box sx={styles.header}>
        <Box sx={styles.headerTitle}>
          <Box sx={styles.pageIconBox}>
            <Icon name="People" sx={styles.pageIconSize} />
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
                  startIcon={<Icon name="Send" />}
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
                  startIcon={<Icon name="Add" />}
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
  },
);

const UsersPageFilterBar = memo(
  ({ userFilterFields, defaultValues, onChange }: UsersPageFilterBarProps) => {
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
  },
);

const UsersPageActions = memo(({ exportLoading, hasItems, onExport }: UsersPageActionsProps) => {
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

const UsersInvitationsFilterBar = memo(
  ({ invFilterFields, defaultValues, onChange }: UsersInvitationsFilterBarProps) => {
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
  },
);

const UsersPage = memo(() => {
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

  const { tab, handleTabChange } = useUrlTabs(USERS_TABS);

  const usersTable = useTableState();
  const {
    filter: userFilter,
    debouncedSearch,
    handleFilterChange: handleUserFilterChange,
  } = useFilterState(USER_FILTER_DEFAULT, usersTable.setPage);

  const invTable = useTableState();
  const { filter: invFilter, handleFilterChange: handleInvFilterChange } = useFilterState(
    INV_FILTER_DEFAULT,
    invTable.setPage,
  );

  const createDialog = useBooleanDialog();
  const inviteDialog = useBooleanDialog();
  const editDialog = useItemDialog<UserDto>();
  const viewDialog = useItemDialog<UserDto>();
  const avatarDialog = useItemDialog<UserDto>();
  const pendingActionDialog = useItemDialog<PendingAction>();
  const revokeDialog = useItemDialog<UserInvitationDto>();

  const { data: usersData, isLoading: usersLoading } = useGetUsersQuery({
    page: usersTable.page + 1,
    pageSize: usersTable.pageSize,
    search: debouncedSearch || undefined,
    isActive: statusToIsActive(userFilter.status),
    createdVia: (userFilter.createdVia as UserCreatedVia) || undefined,
    sortBy: usersTable.sortBy,
    sortOrder: usersTable.activeSortOrder,
  });

  const { data: invitationsData, isLoading: invLoading } = useGetUserInvitationsQuery({
    page: invTable.page + 1,
    pageSize: invTable.pageSize,
    status: invFilter.status || undefined,
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
        void dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
        snackbar.success(`Now impersonating ${user.fullName}.`);
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to start impersonation.');
      }
    },
    [startImpersonation, dispatch, snackbar],
  );

  const handleConfirmAction = useCallback(async () => {
    if (!pendingActionDialog.item) return;
    const { type, user } = pendingActionDialog.item;
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
      pendingActionDialog.onClose();
    }
  }, [pendingActionDialog, deleteUser, snackbar, activateUser, deactivateUser]);

  const handleRevokeConfirm = useCallback(async () => {
    if (!revokeDialog.item) return;
    try {
      await revokeInvitation(revokeDialog.item.id).unwrap();
      snackbar.success(`Invitation to ${revokeDialog.item.email} revoked.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to revoke invitation.');
    } finally {
      revokeDialog.onClose();
    }
  }, [revokeDialog, revokeInvitation, snackbar]);

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
      if (!avatarDialog.item) return;
      try {
        const updated = await uploadUserAvatar({ userId: avatarDialog.item.id, file }).unwrap();
        avatarDialog.setItem({ ...avatarDialog.item, profileFileId: updated.profileFileId });
        snackbar.success('Profile picture updated.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to upload avatar.');
      }
    },
    [avatarDialog, uploadUserAvatar, snackbar],
  );

  const handleRemoveAvatar = useCallback(async () => {
    if (!avatarDialog.item) return;
    try {
      const updated = await removeUserAvatar(avatarDialog.item.id).unwrap();
      avatarDialog.setItem({ ...avatarDialog.item, profileFileId: updated.profileFileId });
      snackbar.success('Profile picture removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove avatar.');
    }
  }, [avatarDialog, removeUserAvatar, snackbar]);

  const handleExportUsers = useCallback(async () => {
    setExportLoading(true);
    try {
      const result = await dispatch(
        usersApi.endpoints.getUsers.initiate({ page: 1, pageSize: EXPORT_PAGE_SIZE }),
      );
      const items = ('data' in result ? result.data?.items : null) ?? usersData?.items ?? [];
      exportToCsv(
        'users',
        items.map((u) => ({
          Name: u.fullName,
          Email: u.email,
          Roles: u.roles.join('; '),
          Status: u.isActive ? 'Active' : 'Inactive',
          'Last Login': u.lastLoginAt ? formatDateTime(u.lastLoginAt) : '',
          'Created Via': u.createdVia,
        })),
      );
    } finally {
      setExportLoading(false);
    }
  }, [dispatch, usersData?.items]);

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
        options: ACTIVE_STATUS_OPTIONS,
        grid: { xs: 6, sm: 3 },
      },
      {
        name: 'createdVia',
        label: 'Created via',
        type: FIELD_TYPE.SELECT,
        options: CREATED_VIA_OPTIONS,
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
        options: INVITATION_STATUS_OPTIONS,
        grid: { xs: 12, sm: 4 },
      },
    ],
    [],
  );

  const confirmTitle = useMemo(
    () =>
      pendingActionDialog.item?.type === 'delete'
        ? `Delete "${pendingActionDialog.item.user.fullName}"?`
        : pendingActionDialog.item?.type === 'activate'
          ? `Activate "${pendingActionDialog.item.user.fullName}"?`
          : `Deactivate "${pendingActionDialog.item?.user.fullName}"?`,
    [pendingActionDialog.item],
  );

  const confirmMessage = useMemo(
    () =>
      pendingActionDialog.item?.type === 'delete'
        ? 'This will permanently remove the user. This action cannot be undone.'
        : pendingActionDialog.item?.type === 'activate'
          ? 'The user will be able to sign in again.'
          : 'The user will be unable to sign in until reactivated.',
    [pendingActionDialog.item],
  );

  const avatarSrc = useMemo(
    () => (avatarDialog.item?.profileFileId ? getUserAvatarUrl(avatarDialog.item.id) : null),
    [avatarDialog.item],
  );

  const avatarInitials = useMemo(
    () => getInitials(avatarDialog.item?.fullName),
    [avatarDialog.item?.fullName],
  );

  const userColumns = useMemo<ColumnDef<UserDto>[]>(
    () => [
      {
        id: 'avatar',
        header: '',
        cell: ({ row }) => {
          const user = row.original;
          const initials = getInitials(user.fullName);
          return canEdit ? (
            <Tooltip title="Manage profile photo">
              <Avatar
                src={user.profileFileId ? getUserAvatarUrl(user.id) : undefined}
                sx={styles.avatarClickable}
                onClick={() => avatarDialog.onOpen(user)}
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
            {row.original.lastLoginAt ? formatDateTime(row.original.lastLoginAt) : '—'}
          </Typography>
        ),
      },
      {
        header: 'Status',
        accessorKey: 'isActive',
        cell: ({ row }) => <ActiveStatusChip isActive={row.original.isActive} />,
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
                  <IconButton size="small" onClick={() => viewDialog.onOpen(user)}>
                    <Icon name="Visibility" fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              {canEdit && (
                <Tooltip title="Edit">
                  <IconButton size="small" onClick={() => editDialog.onOpen(user)}>
                    <Icon name="Edit" fontSize="small" />
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
                        <Icon name="Send" fontSize="small" />
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
                      pendingActionDialog.onOpen({
                        type: user.isActive ? 'deactivate' : 'activate',
                        user,
                      })
                    }
                  >
                    {user.isActive ? (
                      <Icon name="Block" fontSize="small" />
                    ) : (
                      <Icon name="CheckCircle" fontSize="small" />
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
                      <Icon name="SupervisorAccount" fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              )}
              {canDelete && (
                <Tooltip title="Delete">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => pendingActionDialog.onOpen({ type: 'delete', user })}
                  >
                    <Icon name="Delete" fontSize="small" />
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
      avatarDialog,
      canView,
      canResend,
      isResendingSetup,
      canActivate,
      canDeactivate,
      currentUser?.systemRole,
      isImpersonating,
      canDelete,
      viewDialog,
      editDialog,
      handleResend,
      pendingActionDialog,
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
          <Typography variant="body2">{formatDate(row.original.expiresAt)}</Typography>
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
                              <Icon name="Email" fontSize="small" />
                            )}
                          </IconButton>
                        </span>
                      </Tooltip>
                    )}
                    {canRevokeRow && (
                      <Tooltip title="Revoke invitation">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => revokeDialog.onOpen(inv)}
                        >
                          <Icon name="Clear" fontSize="small" />
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
    [canRevoke, canResend, isResendingInvitation, handleResendInvitation, revokeDialog],
  );

  return (
    <TenantContextGuard>
      <Box sx={styles.root}>
        <UsersPageHeader
          canCreate={canCreate}
          canInvite={canInvite}
          atUserLimit={atUserLimit}
          maxUsers={maxUsers}
          planName={tenantSettings?.planName}
          onCreateOpen={createDialog.onOpen}
          onInviteOpen={inviteDialog.onOpen}
        />

        {atUserLimit && (
          <Alert severity="warning" sx={styles.limitAlert}>
            You've reached the <strong>{maxUsers}-user limit</strong> on the{' '}
            <strong>{tenantSettings?.planName}</strong> plan. Upgrade to Pro to add more users.
          </Alert>
        )}

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
              defaultValues={USER_FILTER_DEFAULT}
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
              page={usersTable.page}
              pageSize={usersTable.pageSize}
              totalCount={usersData?.totalCount ?? 0}
              onPageChange={usersTable.setPage}
              sortBy={usersTable.sortBy}
              sortOrder={usersTable.sortOrder}
              sortableColumns={['fullName', 'lastLoginAt']}
              onSortChange={usersTable.handleSortChange}
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
              defaultValues={INV_FILTER_DEFAULT}
              onChange={handleInvFilterChange}
            />
            <DataTable
              columns={invitationColumns}
              data={invitationsData?.items ?? []}
              isLoading={invLoading}
              page={invTable.page}
              pageSize={invTable.pageSize}
              totalCount={invitationsData?.totalCount ?? 0}
              onPageChange={invTable.setPage}
            />
          </Box>
        )}

        {/* Dialogs */}
        <AvatarManageModal
          open={avatarDialog.open}
          onClose={avatarDialog.onClose}
          src={avatarSrc}
          initials={avatarInitials}
          title={`Profile photo — ${avatarDialog.item?.fullName ?? ''}`}
          uploading={isUploadingAvatar || isRemovingAvatar}
          onUpload={handleUploadAvatar}
          onRemove={avatarDialog.item?.profileFileId ? handleRemoveAvatar : undefined}
        />
        <ViewUserDialog user={viewDialog.item} onClose={viewDialog.onClose} />
        <CreateUserDialog
          open={createDialog.open}
          onClose={createDialog.onClose}
          roleOptions={roleOptions}
        />
        <InviteUserDialog
          open={inviteDialog.open}
          onClose={inviteDialog.onClose}
          roleOptions={roleOptions}
        />
        <EditUserDialog
          open={editDialog.open}
          onClose={editDialog.onClose}
          user={editDialog.item}
          roleOptions={roleOptions}
        />

        <ConfirmDialog
          open={pendingActionDialog.open}
          title={confirmTitle}
          description={confirmMessage}
          confirmLabel={
            pendingActionDialog.item?.type === 'delete'
              ? 'Delete'
              : pendingActionDialog.item?.type === 'activate'
                ? 'Activate'
                : 'Deactivate'
          }
          danger={pendingActionDialog.item?.type === 'delete'}
          loading={isActivating || isDeactivating || isDeleting}
          onConfirm={handleConfirmAction}
          onCancel={pendingActionDialog.onClose}
        />

        <ConfirmDialog
          open={revokeDialog.open}
          title={`Revoke invitation for "${revokeDialog.item?.email}"?`}
          description="The invitation link will be invalidated immediately."
          confirmLabel="Revoke"
          danger
          loading={isRevoking}
          onConfirm={handleRevokeConfirm}
          onCancel={revokeDialog.onClose}
        />
      </Box>
    </TenantContextGuard>
  );
});
export default UsersPage;
