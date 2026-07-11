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
import BusinessIcon from '@mui/icons-material/Business';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ForwardToInboxIcon from '@mui/icons-material/ForwardToInbox';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import {
  FormBuilder,
  FormWizard,
  FilterForm,
  FIELD_TYPE,
  type FieldConfig,
} from 'mui-schema-form-builder';
import Avatar from '@mui/material/Avatar';
import { DataTable } from '@/shared/components/DataTable';
import { AvatarManageModal } from '@/shared/components/AvatarManageModal';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { CreatedViaChip } from '@/shared/components/CreatedViaChip';
import { LoadingButton } from '@/shared/components/LoadingButton';
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
  requiredTenantAddressZodShape,
  getTenantAddressFields,
  buildTenantAddressPayload,
} from '@/shared/forms/addressFields';
import {
  useGetTenantsQuery,
  useOnboardTenantMutation,
  useUpdateTenantMutation,
  useDeleteTenantMutation,
  useGetTenantCreationInvitationsQuery,
  useInviteTenantMutation,
  useRevokeTenantInvitationMutation,
  useResendTenantInvitationMutation,
  useUploadTenantLogoByAdminMutation,
  useRemoveTenantLogoByAdminMutation,
} from '@/features/tenants/api/tenantsApi';
import {
  useGetSubscriptionPlansQuery,
  useUpdateTenantPlanMutation,
} from '@/features/subscriptions/api/subscriptionsApi';
import { getTenantLogoUrl } from '@/features/tenantSettings/api/tenantSettingsApi';
import type { TenantDto, TenantCreationInvitationDto, ApiError, PlanType } from '@/types/api';

// ─── Onboard dialog ───────────────────────────────────────────────────────────

const onboardSchema = z.object({
  tenantName: z.string().min(1, 'Tenant name is required').max(200),
  adminFullName: z.string().min(1, 'Admin full name is required').max(200),
  adminEmail: z.string().email('Invalid email address'),
  ...requiredTenantAddressZodShape,
  ...requiredAddressZodShape,
});
type OnboardValues = z.infer<typeof onboardSchema>;

interface OnboardDialogProps {
  open: boolean;
  onClose: () => void;
}

function OnboardTenantDialog({ open, onClose }: OnboardDialogProps) {
  const [onboardTenant, { isLoading }] = useOnboardTenantMutation();
  const snackbar = useSnackbar();

  const adminFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'adminFullName',
        label: 'Full name',
        type: FIELD_TYPE.TEXT,
        required: true,
      },
      {
        name: 'adminEmail',
        label: 'Email address',
        type: FIELD_TYPE.TEXT,
        required: true,
        muiProps: { type: 'email', helperText: 'Account setup email will be sent here' },
      },
      ...getAddressFields(undefined, 'Admin Address', true),
    ],
    [],
  );

  const tenantFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'tenantName',
        label: 'Tenant name',
        type: FIELD_TYPE.TEXT,
        required: true,
      },
      ...getTenantAddressFields(undefined, 'Company Address', true),
    ],
    [],
  );

  const onSubmit = async (values: OnboardValues) => {
    try {
      const tenantAddressPayload = buildTenantAddressPayload(values);
      const userAddressPayload = buildAddressPayload(values);

      const result = await onboardTenant({
        tenant: {
          name: values.tenantName,
          ...(tenantAddressPayload.address ? { address: tenantAddressPayload.address } : {}),
        },
        user: {
          fullName: values.adminFullName,
          email: values.adminEmail,
          ...(userAddressPayload.address ? { address: userAddressPayload.address } : {}),
        },
      }).unwrap();
      snackbar.success(
        `Tenant "${result.name}" created. Setup email sent to ${result.adminEmail}.`,
      );
      onClose();
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Failed to create tenant.');
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Tenant</DialogTitle>
      <DialogContent dividers>
        <FormWizard
          key={open ? 'open' : 'closed'}
          schema={onboardSchema}
          steps={[
            {
              label: 'Admin details',
              description: 'Admin name, email, and address',
              fields: adminFields,
            },
            {
              label: 'Tenant details',
              description: 'Company name and address',
              fields: tenantFields,
            },
          ]}
          onSubmit={onSubmit}
          renderActions={({ isSubmitting, isLastStep, isFirstStep, next, back }) => (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button
                type="button"
                onClick={isFirstStep ? onClose : back}
                variant="outlined"
                sx={{ flex: 1 }}
              >
                {isFirstStep ? 'Cancel' : 'Back'}
              </Button>
              <LoadingButton
                type={isLastStep ? 'submit' : 'button'}
                loading={isSubmitting || (isLastStep && isLoading)}
                onClick={isLastStep ? undefined : next}
                variant="contained"
                sx={{ flex: 1 }}
              >
                {isLastStep ? 'Create' : 'Next'}
              </LoadingButton>
            </Box>
          )}
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Invite dialog ────────────────────────────────────────────────────────────

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});
type InviteValues = z.infer<typeof inviteSchema>;

interface InviteDialogProps {
  open: boolean;
  onClose: () => void;
}

function InviteTenantDialog({ open, onClose }: InviteDialogProps) {
  const [inviteTenant, { isLoading }] = useInviteTenantMutation();
  const snackbar = useSnackbar();

  const fields: FieldConfig[] = [
    {
      name: 'email',
      label: 'Email address',
      type: FIELD_TYPE.TEXT,
      required: true,
      muiProps: {
        type: 'email',
        helperText:
          'The invited user will set up their tenant name, address, and password via the invitation link.',
      },
    },
  ];

  const onSubmit = async (values: InviteValues) => {
    try {
      await inviteTenant({ email: values.email }).unwrap();
      snackbar.success(`Invitation sent to ${values.email}.`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to send invitation.');
    }
  };

  return (
    <Dialog open={open} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Invite New Tenant</DialogTitle>
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

const editSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  isActive: z.boolean(),
  ...addressZodShape,
});
type EditValues = z.infer<typeof editSchema>;

interface EditDialogProps {
  tenant: TenantDto | null;
  onClose: () => void;
}

function EditTenantDialog({ tenant, onClose }: EditDialogProps) {
  const [updateTenant, { isLoading }] = useUpdateTenantMutation();
  const snackbar = useSnackbar();

  const editFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'name',
        label: 'Name',
        type: FIELD_TYPE.TEXT,
        required: true,
        defaultValue: tenant?.name ?? '',
        muiProps: { autoFocus: true },
      },
      {
        name: 'isActive',
        label: 'Active',
        type: FIELD_TYPE.CHECKBOX,
        defaultValue: tenant?.isActive ?? true,
      },
      ...getAddressFields(tenant?.address, 'Address'),
    ],
    [tenant],
  );

  const onSubmit = async (values: EditValues) => {
    if (!tenant) return;
    try {
      await updateTenant({
        id: tenant.id,
        name: values.name,
        isActive: values.isActive,
        ...buildAddressPayload(values),
      }).unwrap();
      snackbar.success('Tenant updated.');
      onClose();
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Failed to update tenant.');
    }
  };

  return (
    <Dialog open={!!tenant} onClose={isLoading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Tenant</DialogTitle>
      <DialogContent dividers>
        <FormBuilder
          key={tenant?.id}
          schema={editSchema}
          fields={editFields}
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

interface ViewTenantDialogProps {
  tenant: TenantDto | null;
  onClose: () => void;
}

function ViewTenantDialog({ tenant, onClose }: ViewTenantDialogProps) {
  return (
    <ViewDialog open={!!tenant} title="Tenant details" onClose={onClose}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <LabelValue label="Name" value={tenant?.name} />
        <LabelValue label="Admin email" value={tenant?.adminEmail} />
        <LabelValue
          label="Status"
          value={
            tenant && (
              <Chip
                label={tenant.isActive ? 'Active' : 'Inactive'}
                color={tenant.isActive ? 'success' : 'default'}
                size="small"
                variant="outlined"
              />
            )
          }
        />
        <LabelValue
          label="Created via"
          value={<CreatedViaChip createdVia={tenant?.createdVia ?? 'Direct'} />}
        />
        <LabelValue label="Address" value={formatAddress(tenant?.address)} />
      </Box>
    </ViewDialog>
  );
}

// ─── Plan badge ───────────────────────────────────────────────────────────────

function PlanBadge({ plan }: { plan?: PlanType | string }) {
  return (
    <Chip
      label={plan ?? 'Free'}
      color={plan === 'Pro' ? 'primary' : 'default'}
      size="small"
      variant={plan === 'Pro' ? 'filled' : 'outlined'}
    />
  );
}

// ─── Change plan dialog ───────────────────────────────────────────────────────

interface ChangePlanDialogProps {
  tenant: TenantDto | null;
  onClose: () => void;
}

function ChangePlanDialog({ tenant, onClose }: ChangePlanDialogProps) {
  const snackbar = useSnackbar();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const [updatePlan, { isLoading }] = useUpdateTenantPlanMutation();

  const planSchema = z.object({
    planType: z.string().min(1, 'Plan is required'),
  });
  type PlanValues = z.infer<typeof planSchema>;

  const planFields: FieldConfig[] = [
    {
      name: 'planType',
      label: 'Subscription plan',
      type: FIELD_TYPE.SELECT,
      required: true,
      defaultValue: tenant?.planType ?? 'Free',
      options: plans.map((p) => ({
        label: `${p.name} — Max users: ${p.features.maxUsers === -1 ? 'Unlimited' : p.features.maxUsers}`,
        value: p.planType,
      })),
    },
  ];

  const onSubmit = async (values: PlanValues) => {
    if (!tenant) return;
    try {
      await updatePlan({ tenantId: tenant.id, planType: values.planType as PlanType }).unwrap();
      snackbar.success(`Plan updated to ${values.planType} for "${tenant.name}".`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update plan.');
    }
  };

  return (
    <Dialog open={!!tenant} onClose={isLoading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Plan — {tenant?.name}</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={tenant?.id}
          schema={planSchema}
          fields={planFields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Update plan"
          cancelText="Cancel"
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent', mt: 1 }}
        />
      </DialogContent>
    </Dialog>
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

export function TenantsPage() {
  const snackbar = useSnackbar();

  const canList = usePermission('Tenants.List');
  const canView = usePermission('Tenants.View');
  const canCreate = usePermission('Tenants.Create');
  const canEdit = usePermission('Tenants.Edit');
  const canDelete = usePermission('Tenants.Delete');

  const [tab, setTab] = useState(0);

  // Tenants tab
  const [tenantFilter, setTenantFilter] = useState({ search: '', status: '', createdVia: '' });
  const debouncedSearch = useDebounce(tenantFilter.search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [onboardOpen, setOnboardOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [viewTenant, setViewTenant] = useState<TenantDto | null>(null);
  const [editTenant, setEditTenant] = useState<TenantDto | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<TenantDto | null>(null);
  const [changePlanTenant, setChangePlanTenant] = useState<TenantDto | null>(null);
  const [logoTenant, setLogoTenant] = useState<TenantDto | null>(null);

  const canEditSubscription = usePermission('Subscriptions.Edit');

  // Invitations tab
  const [invPage, setInvPage] = useState(0);
  const [invPageSize, setInvPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [pendingRevoke, setPendingRevoke] = useState<TenantCreationInvitationDto | null>(null);

  const tenantFilterFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'search',
        label: 'Search',
        type: FIELD_TYPE.SEARCH,
        placeholder: 'Search tenants…',
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

  // Data
  const { data, isLoading } = useGetTenantsQuery({
    page: page + 1,
    pageSize,
    search: debouncedSearch || undefined,
    isActive:
      tenantFilter.status === 'active'
        ? true
        : tenantFilter.status === 'inactive'
          ? false
          : undefined,
    createdVia: (tenantFilter.createdVia as 'Direct' | 'Invitation') || undefined,
  });

  const { data: invitationsData, isLoading: isLoadingInvitations } =
    useGetTenantCreationInvitationsQuery({
      page: invPage + 1,
      pageSize: invPageSize,
      status: statusFilter || undefined,
    });

  const [deleteTenantMutation, { isLoading: isDeleting }] = useDeleteTenantMutation();
  const [revokeTenantInvitation, { isLoading: isRevoking }] = useRevokeTenantInvitationMutation();
  const [resendTenantInvitation, { isLoading: isResendingInvitation }] =
    useResendTenantInvitationMutation();
  const [uploadTenantLogo, { isLoading: isUploadingLogo }] = useUploadTenantLogoByAdminMutation();
  const [removeTenantLogo, { isLoading: isRemovingLogo }] = useRemoveTenantLogoByAdminMutation();

  const tenants = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;

  const handleDelete = async () => {
    if (!deleteTenant) return;
    try {
      await deleteTenantMutation({ id: deleteTenant.id }).unwrap();
      snackbar.success(`Tenant "${deleteTenant.name}" deleted.`);
      setDeleteTenant(null);
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Failed to delete tenant.');
    }
  };

  const handleRevokeInvitation = async () => {
    if (!pendingRevoke) return;
    try {
      await revokeTenantInvitation(pendingRevoke.id).unwrap();
      snackbar.success('Invitation revoked.');
      setPendingRevoke(null);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to revoke invitation.');
    }
  };

  const handleResendInvitation = async (inv: TenantCreationInvitationDto) => {
    try {
      await resendTenantInvitation(inv.id).unwrap();
      snackbar.success(`Invitation resent to ${inv.email}.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to resend invitation.');
    }
  };

  const handleUploadLogo = async (file: File) => {
    if (!logoTenant) return;
    try {
      const updated = await uploadTenantLogo({ tenantId: logoTenant.id, file }).unwrap();
      setLogoTenant(updated);
      snackbar.success('Company logo updated.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to upload logo.');
    }
  };

  const handleRemoveLogo = async () => {
    if (!logoTenant) return;
    try {
      const updated = await removeTenantLogo(logoTenant.id).unwrap();
      setLogoTenant(updated);
      snackbar.success('Company logo removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove logo.');
    }
  };

  const tenantColumns: ColumnDef<TenantDto>[] = [
    {
      id: 'logo',
      header: '',
      size: 48,
      cell: ({ row }) => {
        const logoSrc = row.original.profileFileId
          ? getTenantLogoUrl(row.original.profileFileId)
          : undefined;
        return (
          <Avatar
            src={logoSrc}
            sx={{ width: 36, height: 36, cursor: 'pointer', fontSize: 14 }}
            onClick={() => setLogoTenant(row.original)}
          >
            {row.original.name.charAt(0).toUpperCase()}
          </Avatar>
        );
      },
    },
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.original.name}
          </Typography>
          {row.original.adminEmail && (
            <Typography variant="caption" color="text.secondary">
              {row.original.adminEmail}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      accessorKey: 'planType',
      header: 'Plan',
      cell: ({ row }) => <PlanBadge plan={row.original.planType} />,
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
          {canView && (
            <Tooltip title="View">
              <IconButton size="small" onClick={() => setViewTenant(row.original)}>
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => setEditTenant(row.original)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canEditSubscription && (
            <Tooltip title="Change plan">
              <IconButton
                size="small"
                color="primary"
                onClick={() => setChangePlanTenant(row.original)}
              >
                <WorkspacePremiumIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setDeleteTenant(row.original)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      ),
    },
  ];

  const invitationColumns: ColumnDef<TenantCreationInvitationDto>[] = [
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => <Typography variant="body2">{row.original.email}</Typography>,
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
    ...(canCreate
      ? ([
          {
            id: 'actions',
            header: '',
            cell: ({ row }) => {
              const inv = row.original;
              const isPending = !inv.isRevoked && !inv.isAccepted && !inv.isExpired;
              if (!isPending) return null;
              return (
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
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
                  <Tooltip title="Revoke invitation">
                    <IconButton size="small" color="error" onClick={() => setPendingRevoke(inv)}>
                      <BlockIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              );
            },
          },
        ] as ColumnDef<TenantCreationInvitationDto>[])
      : []),
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <BusinessIcon color="primary" />
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Tenants
          </Typography>
        </Box>
        {canCreate && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" startIcon={<SendIcon />} onClick={() => setInviteOpen(true)}>
              Invite Tenant
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOnboardOpen(true)}
            >
              New Tenant
            </Button>
          </Box>
        )}
      </Box>

      {/* Tabs */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Tenants" />
        <Tab label="Invitations" />
      </Tabs>

      {/* Tenants tab */}
      {tab === 0 && !canList && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography color="text.secondary">You don't have permission to list tenants.</Typography>
        </Box>
      )}
      {tab === 0 && canList && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <FilterForm
              fields={tenantFilterFields}
              defaultValues={{ search: '', status: '', createdVia: '' }}
              onChange={(values) => {
                setTenantFilter(values as typeof tenantFilter);
                setPage(0);
              }}
              showReset
              spacing={2}
            />
          </Box>

          <DataTable
            data={tenants}
            columns={tenantColumns}
            isLoading={isLoading}
            totalCount={totalCount}
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
              fields={invFilterFields}
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
      <OnboardTenantDialog open={onboardOpen} onClose={() => setOnboardOpen(false)} />
      <InviteTenantDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <ViewTenantDialog tenant={viewTenant} onClose={() => setViewTenant(null)} />
      <EditTenantDialog tenant={editTenant} onClose={() => setEditTenant(null)} />
      <ChangePlanDialog tenant={changePlanTenant} onClose={() => setChangePlanTenant(null)} />

      <AvatarManageModal
        open={!!logoTenant}
        onClose={() => setLogoTenant(null)}
        src={logoTenant?.profileFileId ? getTenantLogoUrl(logoTenant.profileFileId) : null}
        initials={logoTenant?.name?.charAt(0)?.toUpperCase() ?? '?'}
        title="Company logo"
        uploading={isUploadingLogo || isRemovingLogo}
        onUpload={handleUploadLogo}
        onRemove={logoTenant?.profileFileId ? handleRemoveLogo : undefined}
      />

      <ConfirmDialog
        open={!!deleteTenant}
        title={`Delete "${deleteTenant?.name}"?`}
        description="This will permanently remove the tenant. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTenant(null)}
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
