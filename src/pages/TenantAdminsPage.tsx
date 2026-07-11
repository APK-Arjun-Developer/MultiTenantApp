import { useMemo, useState } from 'react';
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
import { useDebounce } from '@/shared/hooks';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { usePermission } from '@/shared/hooks/usePermission';
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
import type { TenantAdminDto, TenantAdminInvitationDto, AddressDto, ApiError } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  fullName: z.string().min(1, 'Full name is required').max(200),
  email: z.string().email('Invalid email address'),
  ...requiredAddressZodShape,
});
type CreateValues = z.infer<typeof createSchema>;

const inviteSchema = z.object({
  tenantId: z.string().min(1, 'Tenant is required'),
  email: z.string().email('Invalid email address'),
});
type InviteValues = z.infer<typeof inviteSchema>;

const editSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
  ...addressZodShape,
  ...tenantAddressZodShape,
});
type EditValues = z.infer<typeof editSchema>;

// ─── Create dialog ────────────────────────────────────────────────────────────

interface CreateAdminDialogProps {
  open: boolean;
  onClose: () => void;
  tenantOptions: { value: string; label: string }[];
}

function CreateAdminDialog({ open, onClose, tenantOptions }: CreateAdminDialogProps) {
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

  const onSubmit = async (values: CreateValues) => {
    try {
      const { tenantId, fullName, email, ...rest } = values;
      const result = await createTenantAdmin({
        tenantId,
        fullName,
        email,
        ...buildAddressPayload(rest),
      }).unwrap();
      snackbar.success(`Admin "${result.fullName}" created. Setup email sent to ${result.email}.`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to create tenant admin.');
    }
  };

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
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Invite dialog ────────────────────────────────────────────────────────────

interface InviteAdminDialogProps {
  open: boolean;
  onClose: () => void;
  tenantOptions: { value: string; label: string }[];
}

function InviteAdminDialog({ open, onClose, tenantOptions }: InviteAdminDialogProps) {
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

  const onSubmit = async (values: InviteValues) => {
    try {
      await inviteTenantAdmin(values).unwrap();
      snackbar.success(`Invitation sent to ${values.email}.`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to send invitation.');
    }
  };

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
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

interface EditAdminDialogProps {
  admin: TenantAdminDto | null;
  tenantAddress: AddressDto | null;
  onClose: () => void;
}

function EditAdminDialog({ admin, tenantAddress, onClose }: EditAdminDialogProps) {
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

  const onSubmit = async (values: EditValues) => {
    if (!admin) return;
    try {
      await updateTenantAdmin({
        userId: admin.id,
        fullName: values.fullName,
        ...buildAddressPayload(values),
      }).unwrap();
      if (admin.tenant?.id) {
        await updateTenant({ id: admin.tenant.id, ...buildTenantAddressPayload(values) });
      }
      snackbar.success('Tenant admin updated.');
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update tenant admin.');
    }
  };

  return (
    <Dialog open={!!admin} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Tenant Admin</DialogTitle>
      <DialogContent dividers>
        <LabelValue label="Email" value={admin?.email} sx={{ mb: 2 }} />
        <FormBuilder
          key={admin?.id}
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

// ─── View dialog ──────────────────────────────────────────────────────────────

interface ViewAdminDialogProps {
  admin: TenantAdminDto | null;
  onClose: () => void;
}

function ViewAdminDialog({ admin, onClose }: ViewAdminDialogProps) {
  return (
    <ViewDialog open={!!admin} title="Tenant admin details" onClose={onClose}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
}

// ─── Invitation status chip ───────────────────────────────────────────────────

function InvitationStatusChip({ status }: { status: string }) {
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
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ActionType = 'delete' | 'activate' | 'deactivate';

export function TenantAdminsPage() {
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

  const [tab, setTab] = useState(0);

  // Admins tab
  const [adminsFilter, setAdminsFilter] = useState({
    search: '',
    tenant: '',
    status: '',
    createdVia: '',
  });
  const debouncedSearch = useDebounce(adminsFilter.search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [viewAdmin, setViewAdmin] = useState<TenantAdminDto | null>(null);
  const [editAdmin, setEditAdmin] = useState<TenantAdminDto | null>(null);
  const [avatarAdmin, setAvatarAdmin] = useState<TenantAdminDto | null>(null);
  const [pendingAction, setPendingAction] = useState<{
    type: ActionType;
    admin: TenantAdminDto;
  } | null>(null);

  // Invitations tab
  const [invPage, setInvPage] = useState(0);
  const [invPageSize, setInvPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [pendingRevoke, setPendingRevoke] = useState<TenantAdminInvitationDto | null>(null);

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
    page: page + 1,
    pageSize,
    search: debouncedSearch || undefined,
    tenantId: adminsFilter.tenant || undefined,
    isActive:
      adminsFilter.status === 'active'
        ? true
        : adminsFilter.status === 'inactive'
          ? false
          : undefined,
    createdVia: (adminsFilter.createdVia as 'Direct' | 'Invitation') || undefined,
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
      page: invPage + 1,
      pageSize: invPageSize,
      status: statusFilter || undefined,
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

  const handleUploadAvatar = async (file: File) => {
    if (!avatarAdmin) return;
    try {
      const updated = await uploadUserAvatar({ userId: avatarAdmin.id, file }).unwrap();
      setAvatarAdmin({
        ...avatarAdmin,
        profileFileId: updated.profileFileId,
      });
      snackbar.success('Profile picture updated.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to upload avatar.');
    }
  };

  const handleRemoveAvatar = async () => {
    if (!avatarAdmin) return;
    try {
      const updated = await removeUserAvatar(avatarAdmin.id).unwrap();
      setAvatarAdmin({
        ...avatarAdmin,
        profileFileId: updated.profileFileId,
      });
      snackbar.success('Profile picture removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove avatar.');
    }
  };

  const handleImpersonate = async (admin: TenantAdminDto) => {
    try {
      await startImpersonation({ targetUserId: admin.id, tenantId: admin.tenantId }).unwrap();
      dispatch(apiSlice.util.resetApiState());
      dispatch(authApi.endpoints.getMe.initiate(undefined, { forceRefetch: true }));
      snackbar.success(`Now impersonating ${admin.fullName}.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to start impersonation.');
    }
  };

  const tenantIdOptions = useMemo(
    () => tenantsData?.items.map((t) => ({ value: t.id, label: t.name })) ?? [],
    [tenantsData],
  );

  const editTenantAddress = useMemo<AddressDto | null>(() => {
    if (!editAdmin || !tenantsData) return null;
    return tenantsData.items.find((t) => t.id === editAdmin.tenantId)?.address ?? null;
  }, [editAdmin, tenantsData]);

  const handleResend = async (admin: TenantAdminDto) => {
    try {
      await resendSetup(admin.id).unwrap();
      snackbar.success(`Setup email resent to ${admin.email}.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to resend setup email.');
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction) return;
    const { type, admin } = pendingAction;
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
      setPendingAction(null);
    } catch (err) {
      snackbar.error((err as ApiError).message || `Failed to ${type} admin.`);
    }
  };

  const handleRevokeInvitation = async () => {
    if (!pendingRevoke) return;
    try {
      await revokeInvitation(pendingRevoke.id).unwrap();
      snackbar.success('Invitation revoked.');
      setPendingRevoke(null);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to revoke invitation.');
    }
  };

  const handleResendInvitation = async (inv: TenantAdminInvitationDto) => {
    try {
      await resendInvitationMutation(inv.id).unwrap();
      snackbar.success(`Invitation resent to ${inv.email}.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to resend invitation.');
    }
  };

  const adminColumns: ColumnDef<TenantAdminDto>[] = [
    {
      id: 'avatar',
      header: '',
      cell: ({ row }) => {
        const admin = row.original;
        const initials = admin.fullName
          .split(' ')
          .map((n) => n[0])
          .join('')
          .slice(0, 2)
          .toUpperCase();
        return (
          <Tooltip title="Manage profile photo">
            <Avatar
              src={admin.profileFileId ? getUserAvatarUrl(admin.id) : undefined}
              sx={{ width: 36, height: 36, cursor: 'pointer', fontSize: '0.875rem' }}
              onClick={() => setAvatarAdmin(admin)}
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
      id: 'tenant',
      header: 'Tenant',
      cell: ({ row }) =>
        row.original.tenant ? (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
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
        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
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
              <IconButton size="small" onClick={() => setViewAdmin(row.original)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => setEditAdmin(row.original)}>
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
                  setPendingAction({
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
                onClick={() => setPendingAction({ type: 'delete', admin: row.original })}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const invitationColumns: ColumnDef<TenantAdminInvitationDto>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <Typography variant="body2">{row.original.email}</Typography>,
    },
    {
      id: 'tenant',
      header: 'Tenant',
      cell: ({ row }) => <Typography variant="body2">{row.original.tenantName ?? '—'}</Typography>,
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
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
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
                      <IconButton size="small" color="error" onClick={() => setPendingRevoke(inv)}>
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
  ];

  const confirmTitle =
    pendingAction?.type === 'delete'
      ? `Delete "${pendingAction.admin.fullName}"?`
      : pendingAction?.type === 'deactivate'
        ? `Deactivate "${pendingAction.admin.fullName}"?`
        : `Activate "${pendingAction?.admin.fullName}"?`;

  const confirmDescription =
    pendingAction?.type === 'delete'
      ? 'This will permanently remove the tenant admin account. This action cannot be undone.'
      : pendingAction?.type === 'deactivate'
        ? 'The admin will no longer be able to sign in.'
        : 'The admin account will be re-enabled and they can sign in again.';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ManageAccountsIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Tenant Admins
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canInvite && (
            <Button variant="outlined" startIcon={<SendIcon />} onClick={() => setInviteOpen(true)}>
              Invite Admin
            </Button>
          )}
          {canCreate && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Create Admin
            </Button>
          )}
        </Box>
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Admins" />
        <Tab label="Invitations" />
      </Tabs>

      {/* Admins tab */}
      {tab === 0 && !canList && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">
            You don't have permission to list tenant admins.
          </Typography>
        </Box>
      )}
      {tab === 0 && canList && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <FilterForm
              fields={adminsFilterFields}
              defaultValues={{ search: '', tenant: '', status: '', createdVia: '' }}
              onChange={(values) => {
                setAdminsFilter(values as typeof adminsFilter);
                setPage(0);
              }}
              showReset
              spacing={2}
            />
          </Box>

          <DataTable
            data={adminsData?.items ?? []}
            columns={adminColumns}
            isLoading={isLoadingAdmins}
            totalCount={adminsData?.totalCount ?? 0}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(0);
            }}
          />
        </Box>
      )}

      {/* Invitations tab */}
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
            <FilterForm
              fields={adminsInvFilterFields}
              defaultValues={{ status: '' }}
              onChange={(values) => {
                setStatusFilter((values.status as string) ?? '');
                setInvPage(0);
              }}
              showReset
              spacing={2}
            />
          </Box>

          <DataTable
            data={invitationsData?.items ?? []}
            columns={invitationColumns}
            isLoading={isLoadingInvitations}
            totalCount={invitationsData?.totalCount ?? 0}
            page={invPage}
            pageSize={invPageSize}
            onPageChange={setInvPage}
            onPageSizeChange={(size) => {
              setInvPageSize(size);
              setInvPage(0);
            }}
          />
        </Box>
      )}

      {/* Dialogs */}
      <CreateAdminDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        tenantOptions={tenantIdOptions}
      />
      <InviteAdminDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        tenantOptions={tenantIdOptions}
      />
      <ViewAdminDialog admin={viewAdmin} onClose={() => setViewAdmin(null)} />
      <EditAdminDialog
        admin={editAdmin}
        tenantAddress={editTenantAddress}
        onClose={() => setEditAdmin(null)}
      />

      <AvatarManageModal
        open={!!avatarAdmin}
        onClose={() => setAvatarAdmin(null)}
        src={avatarAdmin?.profileFileId ? getUserAvatarUrl(avatarAdmin.id) : null}
        initials={
          avatarAdmin
            ? avatarAdmin.fullName
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()
            : ''
        }
        title={`Profile photo — ${avatarAdmin?.fullName ?? ''}`}
        uploading={isUploadingAvatar || isRemovingAvatar}
        onUpload={handleUploadAvatar}
        onRemove={avatarAdmin?.profileFileId ? handleRemoveAvatar : undefined}
      />

      <ConfirmDialog
        open={!!pendingAction}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={
          pendingAction?.type === 'delete'
            ? 'Delete'
            : pendingAction?.type === 'deactivate'
              ? 'Deactivate'
              : 'Activate'
        }
        danger={pendingAction?.type === 'delete' || pendingAction?.type === 'deactivate'}
        loading={isActioning}
        onConfirm={handleConfirmAction}
        onCancel={() => setPendingAction(null)}
      />

      <ConfirmDialog
        open={!!pendingRevoke}
        title={`Revoke invitation for "${pendingRevoke?.email}"?`}
        description="The invitation link will be invalidated immediately."
        confirmLabel="Revoke"
        danger
        loading={isRevoking}
        onConfirm={handleRevokeInvitation}
        onCancel={() => setPendingRevoke(null)}
      />
    </Box>
  );
}
