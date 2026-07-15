import { memo, useCallback, useMemo } from 'react';
import { z } from 'zod';
import type { ColumnDef } from '@tanstack/react-table';
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
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SendIcon from '@mui/icons-material/Send';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { FormBuilder, FilterForm, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import Avatar from '@mui/material/Avatar';
import { DataTable } from '@/shared/components/DataTable';
import { AvatarManageModal } from '@/shared/components/AvatarManageModal';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { CreatedViaChip } from '@/shared/components/CreatedViaChip';
import { LabelValue } from '@/shared/components/LabelValue';
import { ViewDialog } from '@/shared/components/ViewDialog';
import { formatAddress } from '@/shared/utils/format';
import {
  useTableState,
  useFilterState,
  useBooleanDialog,
  useItemDialog,
  useUrlTabs,
  useSnackbar,
  usePermission,
} from '@/shared/hooks';
import {
  addressZodShape,
  requiredAddressZodShape,
  getAddressFields,
  buildAddressPayload,
  tenantAddressZodShape,
  getTenantAddressFields,
  buildTenantAddressPayload,
} from '@/shared/forms/addressFields';
import { useGetTenantsQuery, useUpdateTenantMutation } from '@/features/tenants/api/tenantsApi';
import {
  useGetTenantAdminsQuery,
  useCreateTenantAdminMutation,
  useInviteTenantAdminMutation,
  useUpdateTenantAdminMutation,
  useDeleteTenantAdminMutation,
  useResendTenantAdminSetupMutation,
  useActivateTenantAdminMutation,
  useDeactivateTenantAdminMutation,
  useGetTenantAdminInvitationsQuery,
  useRevokeInvitationMutation,
  useResendInvitationMutation,
} from '@/features/tenantAdmins/api/tenantAdminsApi';
import { useStartImpersonationMutation } from '@/features/impersonation/api/impersonationApi';
import {
  useUploadUserAvatarByAdminMutation,
  useRemoveUserAvatarByAdminMutation,
  getUserAvatarUrl,
} from '@/features/users/api/usersApi';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';
import { apiSlice } from '@/shared/api/apiSlice';
import { authApi } from '@/features/auth/api/authApi';
import { useAppDispatch, useAppSelector } from '@/app/hooks';
import type { ApiError } from '@/types/api';
import { styles } from './TenantAdminsPage.styles';
import type {
  CreateValues,
  InviteValues,
  EditValues,
  ActionType,
  TenantOption,
  CreateAdminDialogProps,
  InviteAdminDialogProps,
  EditAdminDialogProps,
  ViewAdminDialogProps,
  TenantAdminsPageHeaderProps,
  TenantAdminsFilterBarProps,
  TenantAdminsInvitationsFilterBarProps,
  TenantAdminDto,
  TenantAdminInvitationDto,
  AddressDto,
} from './TenantAdminsPage.types';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  fullName: z.string().min(1, 'Full name is required').max(200),
  email: z.email('Invalid email address'),
  ...requiredAddressZodShape,
});

const inviteSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  email: z.email('Invalid email address'),
});

const editSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  ...addressZodShape,
  ...tenantAddressZodShape,
});

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMINS_TABS = ['admins', 'invitations'] as const;
const ADMINS_FILTER_DEFAULT = { search: '', tenant: '', status: '', createdVia: '' };
const INV_FILTER_DEFAULT = { status: '' };

// ─── Section sub-components ───────────────────────────────────────────────────

const TenantAdminsPageHeader = memo(function TenantAdminsPageHeader({
  canCreate,
  canInvite,
  onCreateClick,
  onInviteClick,
}: TenantAdminsPageHeaderProps) {
  return (
    <Box sx={styles.headerRow}>
      <Box sx={styles.headerTitle}>
        <Box sx={styles.pageIconBox}>
          <ManageAccountsIcon sx={styles.pageIconSize} />
        </Box>
        <Typography variant="h5" sx={styles.headerTitleText}>
          Tenant Admins
        </Typography>
      </Box>
      <Box sx={styles.headerActions}>
        {canInvite && (
          <Button variant="outlined" startIcon={<SendIcon />} onClick={onInviteClick}>
            Invite Admin
          </Button>
        )}
        {canCreate && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateClick}>
            Create Admin
          </Button>
        )}
      </Box>
    </Box>
  );
});

const TenantAdminsFilterBar = memo(function TenantAdminsFilterBar({
  adminsFilterFields,
  defaultValues,
  onChange,
}: TenantAdminsFilterBarProps) {
  return (
    <Box sx={styles.filterBarWrapper}>
      <FilterForm
        fields={adminsFilterFields}
        defaultValues={defaultValues}
        onChange={onChange}
        showReset
        spacing={2}
      />
    </Box>
  );
});

const TenantAdminsInvitationsFilterBar = memo(function TenantAdminsInvitationsFilterBar({
  adminsInvFilterFields,
  defaultValues,
  onChange,
}: TenantAdminsInvitationsFilterBarProps) {
  return (
    <Box sx={styles.filterBarWrapper}>
      <FilterForm
        fields={adminsInvFilterFields}
        defaultValues={defaultValues}
        onChange={onChange}
        showReset
        spacing={2}
      />
    </Box>
  );
});

// ─── Create dialog ────────────────────────────────────────────────────────────

const CreateAdminDialog = memo(function CreateAdminDialog({
  open,
  onClose,
  tenantOptions,
}: CreateAdminDialogProps) {
  const [createTenantAdmin, { isLoading }] = useCreateTenantAdminMutation();
  const snackbar = useSnackbar();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'tenantId',
        label: 'Tenant',
        type: FIELD_TYPE.SELECT,
        required: true,
        options: tenantOptions,
      },
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
      ...getAddressFields(undefined, 'User Address', true),
    ],
    [tenantOptions],
  );

  const onSubmit = useCallback(
    async (values: CreateValues) => {
      try {
        const { tenantId, fullName, email, ...rest } = values;
        const result = await createTenantAdmin({
          tenantId,
          fullName,
          email,
          ...buildAddressPayload(rest),
        }).unwrap();
        snackbar.success(
          `Admin "${result.fullName}" created. Setup email sent to ${result.email}.`,
        );
        onClose();
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to create tenant admin.');
      }
    },
    [createTenantAdmin, snackbar, onClose],
  );

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Tenant Admin</DialogTitle>
      <DialogContent dividers>
        <FormBuilder
          key={open ? 'open' : 'closed'}
          schema={createSchema}
          fields={fields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Create admin"
          cancelText="Cancel"
          sx={styles.formBuilderInDialog}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── Invite dialog ────────────────────────────────────────────────────────────

const InviteAdminDialog = memo(function InviteAdminDialog({
  open,
  onClose,
  tenantOptions,
}: InviteAdminDialogProps) {
  const [inviteTenantAdmin, { isLoading }] = useInviteTenantAdminMutation();
  const snackbar = useSnackbar();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'tenantId',
        label: 'Tenant',
        type: FIELD_TYPE.SELECT,
        required: true,
        options: tenantOptions,
      },
      {
        name: 'email',
        label: 'Email address',
        type: FIELD_TYPE.TEXT,
        required: true,
        muiProps: { type: 'email', helperText: 'Invitation email will be sent here' },
      },
    ],
    [tenantOptions],
  );

  const onSubmit = useCallback(
    async (values: InviteValues) => {
      try {
        await inviteTenantAdmin(values).unwrap();
        snackbar.success(`Invitation sent to ${values.email}.`);
        onClose();
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to send invitation.');
      }
    },
    [inviteTenantAdmin, snackbar, onClose],
  );

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite Tenant Admin</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={open ? 'open' : 'closed'}
          schema={inviteSchema}
          fields={fields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Send invitation"
          cancelText="Cancel"
          sx={styles.formBuilderInDialog}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── Edit dialog ──────────────────────────────────────────────────────────────

const EditAdminDialog = memo(function EditAdminDialog({
  admin,
  tenantAddress,
  onClose,
}: EditAdminDialogProps) {
  const [updateTenantAdmin, { isLoading: isUpdatingAdmin }] = useUpdateTenantAdminMutation();
  const [updateTenant, { isLoading: isUpdatingTenant }] = useUpdateTenantMutation();
  const isLoading = isUpdatingAdmin || isUpdatingTenant;
  const snackbar = useSnackbar();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'fullName',
        label: 'Full name',
        type: FIELD_TYPE.TEXT,
        required: true,
        defaultValue: admin?.fullName ?? '',
        muiProps: { autoFocus: true },
      },
      ...getAddressFields(admin?.address, 'User Address'),
      ...getTenantAddressFields(tenantAddress, 'Company Address'),
    ],
    [admin, tenantAddress],
  );

  const onSubmit = useCallback(
    async (values: EditValues) => {
      if (!admin) return;
      try {
        await updateTenantAdmin({
          userId: admin.id,
          fullName: values.fullName,
          ...buildAddressPayload(values),
        }).unwrap();
        if (admin.tenant?.id) {
          await updateTenant({
            id: admin.tenant.id,
            ...buildTenantAddressPayload(values),
          });
        }
        snackbar.success('Tenant admin updated.');
        onClose();
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to update tenant admin.');
      }
    },
    [admin, updateTenantAdmin, updateTenant, snackbar, onClose],
  );

  return (
    <Dialog open={!!admin} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Tenant Admin</DialogTitle>
      <DialogContent dividers>
        <LabelValue label="Email" value={admin?.email} sx={styles.editDialogEmailLabel} />
        <FormBuilder
          key={admin?.id}
          schema={editSchema}
          fields={fields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Save changes"
          cancelText="Cancel"
          sx={styles.formBuilderInDialog}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── View dialog ──────────────────────────────────────────────────────────────

const ViewAdminDialog = memo(function ViewAdminDialog({ admin, onClose }: ViewAdminDialogProps) {
  return (
    <ViewDialog open={!!admin} title="Tenant admin details" onClose={onClose}>
      <Box sx={styles.viewDialogContent}>
        <LabelValue label="Full name" value={admin?.fullName} />
        <LabelValue label="Email" value={admin?.email} />
        <LabelValue label="Tenant" value={admin?.tenant?.name} />
        <LabelValue label="Roles" value={admin?.roles.join(', ') || '—'} />
        <LabelValue
          label="Status"
          value={
            admin && (
              <Chip
                label={admin.isActive ? 'Active' : 'Inactive'}
                color={admin.isActive ? 'success' : 'default'}
                size="small"
                variant="outlined"
              />
            )
          }
        />
        <LabelValue label="Created via" value={admin?.createdVia} />
        <LabelValue label="Address" value={formatAddress(admin?.address)} />
      </Box>
    </ViewDialog>
  );
});

// ─── Invitation status chip ───────────────────────────────────────────────────

const InvitationStatusChip = memo(function InvitationStatusChip({ status }: { status: string }) {
  const lower = status.toLowerCase();
  const color =
    lower === 'accepted'
      ? 'success'
      : lower === 'pending'
        ? 'primary'
        : lower === 'expired'
          ? 'warning'
          : 'error';
  return <Chip label={status} color={color} size="small" variant="outlined" />;
});

// ─── Page ─────────────────────────────────────────────────────────────────────

export const TenantAdminsPage = memo(function TenantAdminsPage() {
  const snackbar = useSnackbar();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);

  const canList = usePermission('Tenants.List');
  const canView = usePermission('Tenants.View');
  const canCreate = usePermission('Onboarding.Create');
  const canInvite = usePermission('Onboarding.Invite');
  const canEdit = usePermission('Tenants.Edit');
  const canDelete = usePermission('Tenants.Delete');
  const canActivate = usePermission('Onboarding.Activate');
  const canDeactivate = usePermission('Onboarding.Deactivate');
  const canResend = usePermission('Onboarding.Resend');
  const canRevoke = usePermission('Onboarding.Revoke');

  const { tab, handleTabChange } = useUrlTabs(ADMINS_TABS);

  // Admins tab
  const adminsTable = useTableState();
  const {
    filter: adminsFilter,
    debouncedSearch,
    handleFilterChange: handleAdminsFilterChange,
  } = useFilterState(ADMINS_FILTER_DEFAULT, adminsTable.setPage);

  // Invitations tab
  const invTable = useTableState();
  const { filter: invFilter, handleFilterChange: handleInvitationsFilterChange } = useFilterState(
    INV_FILTER_DEFAULT,
    invTable.setPage,
  );

  // Dialogs
  const createDialog = useBooleanDialog();
  const inviteDialog = useBooleanDialog();
  const viewDialog = useItemDialog<TenantAdminDto>();
  const editDialog = useItemDialog<TenantAdminDto>();
  const avatarDialog = useItemDialog<TenantAdminDto>();
  const pendingActionDialog = useItemDialog<{ type: ActionType; admin: TenantAdminDto }>();
  const revokeDialog = useItemDialog<TenantAdminInvitationDto>();

  // Data
  const { data: tenantsData } = useGetTenantsQuery();

  const adminsFilterFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'search',
        label: 'Search',
        type: FIELD_TYPE.SEARCH,
        placeholder: 'Search admins…',
        grid: { xs: 12, sm: 4 },
      },
      {
        name: 'tenant',
        label: 'Tenant',
        type: FIELD_TYPE.SELECT,
        options: [
          { label: 'All tenants', value: '' },
          ...(tenantsData?.items.map((t) => ({ label: t.name, value: t.id })) ?? []),
        ],
        grid: { xs: 12, sm: 4 },
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
        grid: { xs: 6, sm: 2 },
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
        grid: { xs: 6, sm: 2 },
      },
    ],
    [tenantsData?.items],
  );

  const { data: adminsData, isLoading: isLoadingAdmins } = useGetTenantAdminsQuery({
    page: adminsTable.page + 1,
    pageSize: adminsTable.pageSize,
    search: debouncedSearch || undefined,
    tenantId: adminsFilter.tenant || undefined,
    isActive:
      adminsFilter.status === 'active'
        ? true
        : adminsFilter.status === 'inactive'
          ? false
          : undefined,
    createdVia: (adminsFilter.createdVia as 'Direct' | 'Invitation') || undefined,
    sortBy: adminsTable.sortBy,
    sortOrder: adminsTable.sortBy ? adminsTable.sortOrder : undefined,
  });

  const adminsInvFilterFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'status',
        label: 'Status',
        type: FIELD_TYPE.SELECT,
        options: [
          { label: 'All statuses', value: '' },
          { label: 'Pending', value: 'Pending' },
          { label: 'Accepted', value: 'Accepted' },
          { label: 'Expired', value: 'Expired' },
          { label: 'Revoked', value: 'Revoked' },
        ],
        grid: { xs: 12, sm: 4 },
      },
    ],
    [],
  );

  const { data: invitationsData, isLoading: isLoadingInvitations } =
    useGetTenantAdminInvitationsQuery({
      page: invTable.page + 1,
      pageSize: invTable.pageSize,
      status: invFilter.status || undefined,
    });

  // Mutations
  const [deleteTenantAdmin, { isLoading: isDeleting }] = useDeleteTenantAdminMutation();
  const [activateTenantAdmin, { isLoading: isActivating }] = useActivateTenantAdminMutation();
  const [deactivateTenantAdmin, { isLoading: isDeactivating }] = useDeactivateTenantAdminMutation();
  const [resendSetup, { isLoading: isResendingSetup }] = useResendTenantAdminSetupMutation();
  const [revokeInvitation, { isLoading: isRevoking }] = useRevokeInvitationMutation();
  const [resendInvitationMutation, { isLoading: isResendingInvitation }] =
    useResendInvitationMutation();
  const [startImpersonation, { isLoading: isImpersonating }] = useStartImpersonationMutation();
  const [uploadUserAvatar, { isLoading: isUploadingAvatar }] = useUploadUserAvatarByAdminMutation();
  const [removeUserAvatar, { isLoading: isRemovingAvatar }] = useRemoveUserAvatarByAdminMutation();

  const isActioning = isDeleting || isActivating || isDeactivating;

  // ─── Computed values ──────────────────────────────────────────────────────

  const tenantIdOptions = useMemo<TenantOption[]>(
    () => tenantsData?.items.map((t) => ({ value: t.id, label: t.name })) ?? [],
    [tenantsData],
  );

  const editTenantAddress = useMemo<AddressDto | null>(() => {
    const item = editDialog.item;
    if (!item || !tenantsData) return null;
    return tenantsData.items.find((t) => t.id === item.tenantId)?.address ?? null;
  }, [editDialog.item, tenantsData]);

  const avatarInitials = useMemo(
    () =>
      avatarDialog.item
        ? avatarDialog.item.fullName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()
        : '',
    [avatarDialog.item],
  );

  const confirmTitle = useMemo(
    () =>
      pendingActionDialog.item?.type === 'delete'
        ? `Delete "${pendingActionDialog.item.admin.fullName}"?`
        : pendingActionDialog.item?.type === 'deactivate'
          ? `Deactivate "${pendingActionDialog.item.admin.fullName}"?`
          : `Activate "${pendingActionDialog.item?.admin.fullName}"?`,
    [pendingActionDialog.item],
  );

  const confirmDescription = useMemo(
    () =>
      pendingActionDialog.item?.type === 'delete'
        ? 'This will permanently remove the tenant admin account. This action cannot be undone.'
        : pendingActionDialog.item?.type === 'deactivate'
          ? 'The admin will no longer be able to sign in.'
          : 'The admin account will be re-enabled and they can sign in again.',
    [pendingActionDialog.item],
  );

  const confirmLabel = useMemo(
    () =>
      pendingActionDialog.item?.type === 'delete'
        ? 'Delete'
        : pendingActionDialog.item?.type === 'deactivate'
          ? 'Deactivate'
          : 'Activate',
    [pendingActionDialog.item],
  );

  // ─── Callbacks ────────────────────────────────────────────────────────────

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

  const handleImpersonate = useCallback(
    async (admin: TenantAdminDto) => {
      try {
        await startImpersonation({ targetUserId: admin.id, tenantId: admin.tenantId }).unwrap();
        dispatch(apiSlice.util.resetApiState());
        void dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
        snackbar.success(`Now impersonating ${admin.fullName}.`);
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to start impersonation.');
      }
    },
    [startImpersonation, dispatch, snackbar],
  );

  const handleResend = useCallback(
    async (admin: TenantAdminDto) => {
      try {
        await resendSetup(admin.id).unwrap();
        snackbar.success(`Setup email resent to ${admin.email}.`);
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to resend setup email.');
      }
    },
    [resendSetup, snackbar],
  );

  const handleConfirmAction = useCallback(async () => {
    if (!pendingActionDialog.item) return;
    const { type, admin } = pendingActionDialog.item;
    try {
      if (type === 'delete') {
        await deleteTenantAdmin(admin.id).unwrap();
        snackbar.success(`${admin.fullName} deleted.`);
      } else if (type === 'activate') {
        await activateTenantAdmin(admin.id).unwrap();
        snackbar.success(`${admin.fullName} activated.`);
      } else {
        await deactivateTenantAdmin(admin.id).unwrap();
        snackbar.success(`${admin.fullName} deactivated.`);
      }
      pendingActionDialog.onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || `Failed to ${type} admin.`);
    }
  }, [
    pendingActionDialog,
    deleteTenantAdmin,
    snackbar,
    activateTenantAdmin,
    deactivateTenantAdmin,
  ]);

  const handleRevokeInvitation = useCallback(async () => {
    if (!revokeDialog.item) return;
    try {
      await revokeInvitation(revokeDialog.item.id).unwrap();
      snackbar.success('Invitation revoked.');
      revokeDialog.onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to revoke invitation.');
    }
  }, [revokeDialog, revokeInvitation, snackbar]);

  const handleResendInvitation = useCallback(
    async (inv: TenantAdminInvitationDto) => {
      try {
        await resendInvitationMutation(inv.id).unwrap();
        snackbar.success(`Invitation resent to ${inv.email}.`);
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to resend invitation.');
      }
    },
    [resendInvitationMutation, snackbar],
  );

  // ─── Column defs ─────────────────────────────────────────────────────────────

  const adminColumns = useMemo<ColumnDef<TenantAdminDto>[]>(
    () => [
      {
        id: 'avatar',
        header: '',
        cell: ({ row }) => {
          const admin = row.original;
          const initials = admin.fullName
            .split(' ')
            .map((n: string) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();
          return (
            <Tooltip title="Manage profile photo">
              <Avatar
                src={admin.profileFileId ? getUserAvatarUrl(admin.id) : undefined}
                sx={styles.adminAvatar}
                onClick={() => avatarDialog.onOpen(admin)}
              >
                {initials}
              </Avatar>
            </Tooltip>
          );
        },
      },
      {
        accessorKey: 'fullName',
        header: 'Admin',
        cell: ({ row }) => (
          <Box sx={styles.adminNameCell}>
            <Typography variant="body2" sx={styles.adminNameText}>
              {row.original.fullName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.email}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'tenant',
        header: 'Tenant',
        cell: ({ row }) =>
          row.original.tenant ? (
            <Typography variant="body2" sx={styles.tenantNameText}>
              {row.original.tenant.name}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary">
              —
            </Typography>
          ),
      },
      {
        accessorKey: 'createdVia',
        header: 'Created via',
        cell: ({ row }) => <CreatedViaChip createdVia={row.original.createdVia} />,
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
          <Box sx={styles.adminRowActions}>
            {currentUser?.systemRole === 'SystemAdmin' && row.original.isActive && (
              <Tooltip title="Impersonate admin">
                <span>
                  <IconButton
                    size="small"
                    color="secondary"
                    disabled={isImpersonating}
                    onClick={() => handleImpersonate(row.original)}
                  >
                    <SupervisorAccountIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {canView && (
              <Tooltip title="View">
                <IconButton size="small" onClick={() => viewDialog.onOpen(row.original)}>
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => editDialog.onOpen(row.original)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canResend && row.original.hasPendingSetup && (
              <Tooltip title="Resend setup email">
                <span>
                  <IconButton
                    size="small"
                    color="info"
                    disabled={isResendingSetup}
                    onClick={() => handleResend(row.original)}
                  >
                    {isResendingSetup ? (
                      <CircularProgress size={14} />
                    ) : (
                      <EmailIcon fontSize="small" />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
            {(canActivate || canDeactivate) && (
              <Tooltip title={row.original.isActive ? 'Deactivate' : 'Activate'}>
                <IconButton
                  size="small"
                  color={row.original.isActive ? 'warning' : 'success'}
                  onClick={() =>
                    pendingActionDialog.onOpen({
                      type: row.original.isActive ? 'deactivate' : 'activate',
                      admin: row.original,
                    })
                  }
                >
                  {row.original.isActive ? (
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
                  onClick={() =>
                    pendingActionDialog.onOpen({ type: 'delete', admin: row.original })
                  }
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [
      avatarDialog,
      currentUser?.systemRole,
      isImpersonating,
      canView,
      canEdit,
      canResend,
      isResendingSetup,
      canActivate,
      canDeactivate,
      canDelete,
      handleImpersonate,
      viewDialog,
      editDialog,
      handleResend,
      pendingActionDialog,
    ],
  );

  const invitationColumns = useMemo<ColumnDef<TenantAdminInvitationDto>[]>(
    () => [
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <Typography variant="body2">{row.original.email}</Typography>,
      },
      {
        id: 'tenant',
        header: 'Tenant',
        cell: ({ row }) => (
          <Typography variant="body2">{row.original.tenantName ?? '—'}</Typography>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => <InvitationStatusChip status={row.original.status} />,
      },
      {
        accessorKey: 'expiresAt',
        header: 'Expires',
        cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {new Date(row.original.expiresAt).toLocaleDateString()}
          </Typography>
        ),
      },
      ...(canRevoke || canResend
        ? ([
            {
              id: 'actions',
              header: '',
              cell: ({ row }) => {
                const inv = row.original;
                const isPending = !inv.isRevoked && !inv.isAccepted && !inv.isExpired;
                const canRevokeRow = canRevoke && isPending;
                const canResendRow = canResend && isPending;
                if (!canRevokeRow && !canResendRow) return null;
                return (
                  <Box sx={styles.invitationRowActions}>
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
                              <ForwardToInboxIcon fontSize="small" />
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
                          <BlockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>
                );
              },
            },
          ] as ColumnDef<TenantAdminInvitationDto>[])
        : []),
    ],
    [canRevoke, canResend, isResendingInvitation, handleResendInvitation, revokeDialog],
  );

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <Box sx={styles.pageRoot}>
      <TenantAdminsPageHeader
        canCreate={canCreate}
        canInvite={canInvite}
        onCreateClick={createDialog.onOpen}
        onInviteClick={inviteDialog.onOpen}
      />

      <Tabs value={tab} onChange={handleTabChange} sx={styles.tabs}>
        <Tab label="Admins" />
        <Tab label="Invitations" />
      </Tabs>

      {/* Admins tab */}
      {tab === 0 && !canList && (
        <Box sx={styles.permissionDenied}>
          <Typography color="text.secondary">
            You don't have permission to list tenant admins.
          </Typography>
        </Box>
      )}
      {tab === 0 && canList && (
        <Box>
          <TenantAdminsFilterBar
            adminsFilterFields={adminsFilterFields}
            defaultValues={ADMINS_FILTER_DEFAULT}
            onChange={handleAdminsFilterChange}
          />
          <DataTable
            data={adminsData?.items ?? []}
            columns={adminColumns}
            isLoading={isLoadingAdmins}
            totalCount={adminsData?.totalCount ?? 0}
            page={adminsTable.page}
            pageSize={adminsTable.pageSize}
            onPageChange={adminsTable.setPage}
            onPageSizeChange={adminsTable.handlePageSizeChange}
            sortBy={adminsTable.sortBy}
            sortOrder={adminsTable.sortOrder}
            sortableColumns={['fullName']}
            onSortChange={adminsTable.handleSortChange}
          />
        </Box>
      )}

      {/* Invitations tab */}
      {tab === 1 && !canList && (
        <Box sx={styles.permissionDenied}>
          <Typography color="text.secondary">
            You don't have permission to list invitations.
          </Typography>
        </Box>
      )}
      {tab === 1 && canList && (
        <Box>
          <TenantAdminsInvitationsFilterBar
            adminsInvFilterFields={adminsInvFilterFields}
            defaultValues={INV_FILTER_DEFAULT}
            onChange={handleInvitationsFilterChange}
          />
          <DataTable
            data={invitationsData?.items ?? []}
            columns={invitationColumns}
            isLoading={isLoadingInvitations}
            totalCount={invitationsData?.totalCount ?? 0}
            page={invTable.page}
            pageSize={invTable.pageSize}
            onPageChange={invTable.setPage}
            onPageSizeChange={invTable.handlePageSizeChange}
          />
        </Box>
      )}

      {/* Dialogs */}
      <CreateAdminDialog
        open={createDialog.open}
        onClose={createDialog.onClose}
        tenantOptions={tenantIdOptions}
      />
      <InviteAdminDialog
        open={inviteDialog.open}
        onClose={inviteDialog.onClose}
        tenantOptions={tenantIdOptions}
      />
      <ViewAdminDialog admin={viewDialog.item} onClose={viewDialog.onClose} />
      <EditAdminDialog
        admin={editDialog.item}
        tenantAddress={editTenantAddress}
        onClose={editDialog.onClose}
      />

      <AvatarManageModal
        open={avatarDialog.open}
        onClose={avatarDialog.onClose}
        src={avatarDialog.item?.profileFileId ? getUserAvatarUrl(avatarDialog.item.id) : null}
        initials={avatarInitials}
        title={`Profile photo — ${avatarDialog.item?.fullName ?? ''}`}
        uploading={isUploadingAvatar || isRemovingAvatar}
        onUpload={handleUploadAvatar}
        onRemove={avatarDialog.item?.profileFileId ? handleRemoveAvatar : undefined}
      />

      <ConfirmDialog
        open={pendingActionDialog.open}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        danger={
          pendingActionDialog.item?.type === 'delete' ||
          pendingActionDialog.item?.type === 'deactivate'
        }
        loading={isActioning}
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
        onConfirm={handleRevokeInvitation}
        onCancel={revokeDialog.onClose}
      />
    </Box>
  );
});
