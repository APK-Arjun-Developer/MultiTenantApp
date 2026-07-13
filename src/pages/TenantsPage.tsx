import React, { memo, useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
import type { ApiError, PlanType } from '@/types/api';
import { styles } from './TenantsPage.styles';
import type {
  OnboardDialogProps,
  InviteDialogProps,
  EditDialogProps,
  ViewTenantDialogProps,
  ChangePlanDialogProps,
  TenantsPageHeaderProps,
  TenantsPageFilterBarProps,
  TenantsInvitationsFilterBarProps,
  TenantDto,
  TenantCreationInvitationDto,
} from './TenantsPage.types';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const onboardSchema = z.object({
  tenantName: z.string().min(1, 'Tenant name is required').max(200),
  adminFullName: z.string().min(1, 'Admin full name is required').max(200),
  adminEmail: z.string().email('Invalid email address'),
  ...requiredTenantAddressZodShape,
  ...requiredAddressZodShape,
});
type OnboardValues = z.infer<typeof onboardSchema>;

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
});
type InviteValues = z.infer<typeof inviteSchema>;

const editSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  isActive: z.boolean(),
  ...addressZodShape,
});
type EditValues = z.infer<typeof editSchema>;

const planSchema = z.object({
  planType: z.string().min(1, 'Plan is required'),
});
type PlanValues = z.infer<typeof planSchema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

const TenantsPageHeader = memo(function TenantsPageHeader({
  canCreate,
  onInviteClick,
  onOnboardClick,
}: TenantsPageHeaderProps) {
  return (
    <Box sx={styles.header}>
      <Box sx={styles.headerTitle}>
        <Box sx={styles.pageIconBox}>
          <BusinessIcon sx={{ fontSize: '1.125rem' }} />
        </Box>
        <Typography variant="h5" sx={styles.headerTitleText}>
          Tenants
        </Typography>
      </Box>
      {canCreate && (
        <Box sx={styles.headerActions}>
          <Button variant="outlined" startIcon={<SendIcon />} onClick={onInviteClick}>
            Invite Tenant
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={onOnboardClick}>
            New Tenant
          </Button>
        </Box>
      )}
    </Box>
  );
});

const TenantsPageFilterBar = memo(function TenantsPageFilterBar({
  onChange,
}: TenantsPageFilterBarProps) {
  const fields = useMemo<FieldConfig[]>(
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

  return (
    <Box sx={styles.filterBar}>
      <FilterForm
        fields={fields}
        defaultValues={{ search: '', status: '', createdVia: '' }}
        onChange={onChange}
        showReset
        spacing={2}
      />
    </Box>
  );
});

const TenantsInvitationsFilterBar = memo(function TenantsInvitationsFilterBar({
  onChange,
}: TenantsInvitationsFilterBarProps) {
  const fields = useMemo<FieldConfig[]>(
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

  return (
    <Box sx={styles.filterBar}>
      <FilterForm
        fields={fields}
        defaultValues={{ status: '' }}
        onChange={onChange}
        showReset
        spacing={2}
      />
    </Box>
  );
});

// ─── Onboard dialog ───────────────────────────────────────────────────────────

const OnboardTenantDialog = memo(function OnboardTenantDialog({
  open,
  onClose,
}: OnboardDialogProps) {
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

  const onSubmit = useCallback(
    async (values: OnboardValues) => {
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
    },
    [onboardTenant, snackbar, onClose],
  );

  const renderActions = useCallback(
    ({
      isSubmitting,
      isLastStep,
      isFirstStep,
      next,
      back,
    }: {
      isSubmitting: boolean;
      isLastStep: boolean;
      isFirstStep: boolean;
      next: () => void;
      back: () => void;
    }) => (
      <Box sx={styles.wizardActions}>
        <Button
          type="button"
          onClick={isFirstStep ? onClose : back}
          variant="outlined"
          sx={styles.wizardActionFlex}
        >
          {isFirstStep ? 'Cancel' : 'Back'}
        </Button>
        <LoadingButton
          type={isLastStep ? 'submit' : 'button'}
          loading={isSubmitting || (isLastStep && isLoading)}
          onClick={isLastStep ? undefined : next}
          variant="contained"
          sx={styles.wizardActionFlex}
        >
          {isLastStep ? 'Create' : 'Next'}
        </LoadingButton>
      </Box>
    ),
    [onClose, isLoading],
  );

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
          renderActions={renderActions}
          sx={styles.formInDialog as never}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── Invite dialog ────────────────────────────────────────────────────────────

const InviteTenantDialog = memo(function InviteTenantDialog({ open, onClose }: InviteDialogProps) {
  const [inviteTenant, { isLoading }] = useInviteTenantMutation();
  const snackbar = useSnackbar();

  const fields = useMemo<FieldConfig[]>(
    () => [
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
    ],
    [],
  );

  const onSubmit = useCallback(
    async (values: InviteValues) => {
      try {
        await inviteTenant({ email: values.email }).unwrap();
        snackbar.success(`Invitation sent to ${values.email}.`);
        onClose();
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to send invitation.');
      }
    },
    [inviteTenant, snackbar, onClose],
  );

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
          sx={styles.formInDialog as never}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── Edit dialog ──────────────────────────────────────────────────────────────

const EditTenantDialog = memo(function EditTenantDialog({ tenant, onClose }: EditDialogProps) {
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

  const onSubmit = useCallback(
    async (values: EditValues) => {
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
    },
    [tenant, updateTenant, snackbar, onClose],
  );

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
          sx={styles.formInDialog as never}
        />
      </DialogContent>
    </Dialog>
  );
});

// ─── View dialog ──────────────────────────────────────────────────────────────

const ViewTenantDialog = memo(function ViewTenantDialog({
  tenant,
  onClose,
}: ViewTenantDialogProps) {
  return (
    <ViewDialog open={!!tenant} title="Tenant details" onClose={onClose}>
      <Box sx={styles.viewDialogContent}>
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
});

// ─── Plan badge ───────────────────────────────────────────────────────────────

const PlanBadge = memo(function PlanBadge({ plan }: { plan?: PlanType | string }) {
  const isPro = plan === 'Pro';
  return (
    <Chip
      label={plan ?? 'Free'}
      color={isPro ? 'primary' : 'default'}
      size="small"
      variant={isPro ? 'filled' : 'outlined'}
      sx={isPro ? undefined : { color: 'text.disabled', borderColor: 'divider' }}
    />
  );
});

// ─── Change plan dialog ───────────────────────────────────────────────────────

const ChangePlanDialog = memo(function ChangePlanDialog({
  tenant,
  onClose,
}: ChangePlanDialogProps) {
  const snackbar = useSnackbar();
  const { data: plans = [] } = useGetSubscriptionPlansQuery();
  const [updatePlan, { isLoading }] = useUpdateTenantPlanMutation();

  const planFields = useMemo<FieldConfig[]>(
    () => [
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
    ],
    [tenant, plans],
  );

  const onSubmit = useCallback(
    async (values: PlanValues) => {
      if (!tenant) return;
      try {
        await updatePlan({ tenantId: tenant.id, planType: values.planType as PlanType }).unwrap();
        snackbar.success(`Plan updated to ${values.planType} for "${tenant.name}".`);
        onClose();
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to update plan.');
      }
    },
    [tenant, updatePlan, snackbar, onClose],
  );

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
          sx={styles.formInDialogWithTopMargin as never}
        />
      </DialogContent>
    </Dialog>
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
  return <Chip label={status} color={color} size="small" variant="filled" />;
});

const TENANTS_TABS = ['tenants', 'invitations'] as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

export const TenantsPage = memo(function TenantsPage() {
  const snackbar = useSnackbar();

  const canList = usePermission('Tenants.List');
  const canView = usePermission('Tenants.View');
  const canCreate = usePermission('Tenants.Create');
  const canEdit = usePermission('Tenants.Edit');
  const canDelete = usePermission('Tenants.Delete');
  const canEditSubscription = usePermission('Subscriptions.Edit');

  const [searchParams, setSearchParams] = useSearchParams();
  const tab = useMemo(() => {
    const idx = (TENANTS_TABS as readonly string[]).indexOf(searchParams.get('tab') ?? '');
    return idx >= 0 ? idx : 0;
  }, [searchParams]);

  // Tenants tab
  const [tenantFilter, setTenantFilter] = useState({ search: '', status: '', createdVia: '' });
  const debouncedSearch = useDebounce(tenantFilter.search, 300);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [onboardOpen, setOnboardOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [viewTenant, setViewTenant] = useState<TenantDto | null>(null);
  const [editTenant, setEditTenant] = useState<TenantDto | null>(null);
  const [deleteTenant, setDeleteTenant] = useState<TenantDto | null>(null);
  const [changePlanTenant, setChangePlanTenant] = useState<TenantDto | null>(null);
  const [logoTenant, setLogoTenant] = useState<TenantDto | null>(null);

  // Invitations tab
  const [invPage, setInvPage] = useState(0);
  const [invPageSize, setInvPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState('');
  const [pendingRevoke, setPendingRevoke] = useState<TenantCreationInvitationDto | null>(null);

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
    sortBy,
    sortOrder: sortBy ? sortOrder : undefined,
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

  const tenants = useMemo(() => data?.items ?? [], [data]);
  const totalCount = useMemo(() => data?.totalCount ?? 0, [data]);

  // ─── Callbacks ────────────────────────────────────────────────────────────

  const handleTabChange = useCallback(
    (_: React.SyntheticEvent, v: number) => {
      setSearchParams({ tab: TENANTS_TABS[v] }, { replace: true });
    },
    [setSearchParams],
  );

  const handleSortChange = useCallback(
    (newSortBy: string | undefined, newSortOrder: 'asc' | 'desc' | undefined) => {
      setSortBy(newSortBy);
      setSortOrder(newSortOrder ?? 'asc');
      setPage(0);
    },
    [],
  );

  const handleOnboardOpen = useCallback(() => setOnboardOpen(true), []);
  const handleOnboardClose = useCallback(() => setOnboardOpen(false), []);
  const handleInviteOpen = useCallback(() => setInviteOpen(true), []);
  const handleInviteClose = useCallback(() => setInviteOpen(false), []);

  const handleViewClose = useCallback(() => setViewTenant(null), []);
  const handleEditClose = useCallback(() => setEditTenant(null), []);
  const handleChangePlanClose = useCallback(() => setChangePlanTenant(null), []);
  const handleLogoClose = useCallback(() => setLogoTenant(null), []);
  const handleDeleteCancel = useCallback(() => setDeleteTenant(null), []);
  const handleRevokeCancel = useCallback(() => setPendingRevoke(null), []);

  const handleTenantFilterChange = useCallback((values: Record<string, unknown>) => {
    setTenantFilter(values as typeof tenantFilter);
    setPage(0);
  }, []);

  const handleInvFilterChange = useCallback((values: Record<string, unknown>) => {
    setStatusFilter((values.status as string) ?? '');
    setInvPage(0);
  }, []);

  const handlePageSizeChange = useCallback((size: number) => {
    setPageSize(size);
    setPage(0);
  }, []);

  const handleInvPageSizeChange = useCallback((size: number) => {
    setInvPageSize(size);
    setInvPage(0);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTenant) return;
    try {
      await deleteTenantMutation({ id: deleteTenant.id }).unwrap();
      snackbar.success(`Tenant "${deleteTenant.name}" deleted.`);
      setDeleteTenant(null);
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Failed to delete tenant.');
    }
  }, [deleteTenant, deleteTenantMutation, snackbar]);

  const handleRevokeInvitation = useCallback(async () => {
    if (!pendingRevoke) return;
    try {
      await revokeTenantInvitation(pendingRevoke.id).unwrap();
      snackbar.success('Invitation revoked.');
      setPendingRevoke(null);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to revoke invitation.');
    }
  }, [pendingRevoke, revokeTenantInvitation, snackbar]);

  const handleResendInvitation = useCallback(
    async (inv: TenantCreationInvitationDto) => {
      try {
        await resendTenantInvitation(inv.id).unwrap();
        snackbar.success(`Invitation resent to ${inv.email}.`);
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to resend invitation.');
      }
    },
    [resendTenantInvitation, snackbar],
  );

  const handleUploadLogo = useCallback(
    async (file: File) => {
      if (!logoTenant) return;
      try {
        const updated = await uploadTenantLogo({ tenantId: logoTenant.id, file }).unwrap();
        setLogoTenant(updated);
        snackbar.success('Company logo updated.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to upload logo.');
      }
    },
    [logoTenant, uploadTenantLogo, snackbar],
  );

  const handleRemoveLogo = useCallback(async () => {
    if (!logoTenant) return;
    try {
      const updated = await removeTenantLogo(logoTenant.id).unwrap();
      setLogoTenant(updated);
      snackbar.success('Company logo removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove logo.');
    }
  }, [logoTenant, removeTenantLogo, snackbar]);

  // ─── Column defs ──────────────────────────────────────────────────────────

  const tenantColumns = useMemo<ColumnDef<TenantDto>[]>(
    () => [
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
              sx={styles.avatarLogo}
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
            <Typography variant="body2" sx={styles.tenantNameCell}>
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
            variant={row.original.isActive ? 'filled' : 'outlined'}
          />
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Box sx={styles.actionsCell}>
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
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeleteTenant(row.original)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [canView, canEdit, canEditSubscription, canDelete],
  );

  const invitationColumns = useMemo<ColumnDef<TenantCreationInvitationDto>[]>(
    () => [
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
                  <Box sx={styles.actionsCell}>
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
    ],
    [canCreate, isResendingInvitation, handleResendInvitation],
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={styles.root}>
      <TenantsPageHeader
        canCreate={canCreate}
        onInviteClick={handleInviteOpen}
        onOnboardClick={handleOnboardOpen}
      />

      <Tabs value={tab} onChange={handleTabChange} sx={styles.tabsRow}>
        <Tab label="Tenants" />
        <Tab label="Invitations" />
      </Tabs>

      {/* Tenants tab */}
      {tab === 0 && !canList && (
        <Box sx={styles.emptyPermission}>
          <Typography color="text.secondary">You don't have permission to list tenants.</Typography>
        </Box>
      )}
      {tab === 0 && canList && (
        <Box>
          <TenantsPageFilterBar onChange={handleTenantFilterChange} />
          <DataTable
            data={tenants}
            columns={tenantColumns}
            isLoading={isLoading}
            totalCount={totalCount}
            page={page}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={handlePageSizeChange}
            sortBy={sortBy}
            sortOrder={sortOrder}
            sortableColumns={['name']}
            onSortChange={handleSortChange}
          />
        </Box>
      )}

      {/* Invitations tab */}
      {tab === 1 && !canList && (
        <Box sx={styles.emptyPermission}>
          <Typography color="text.secondary">
            You don't have permission to list invitations.
          </Typography>
        </Box>
      )}
      {tab === 1 && canList && (
        <Box>
          <TenantsInvitationsFilterBar onChange={handleInvFilterChange} />
          <DataTable
            data={invitationsData?.items ?? []}
            columns={invitationColumns}
            isLoading={isLoadingInvitations}
            totalCount={invitationsData?.totalCount ?? 0}
            page={invPage}
            pageSize={invPageSize}
            onPageChange={setInvPage}
            onPageSizeChange={handleInvPageSizeChange}
          />
        </Box>
      )}

      {/* Dialogs */}
      <OnboardTenantDialog open={onboardOpen} onClose={handleOnboardClose} />
      <InviteTenantDialog open={inviteOpen} onClose={handleInviteClose} />
      <ViewTenantDialog tenant={viewTenant} onClose={handleViewClose} />
      <EditTenantDialog tenant={editTenant} onClose={handleEditClose} />
      <ChangePlanDialog tenant={changePlanTenant} onClose={handleChangePlanClose} />

      <AvatarManageModal
        open={!!logoTenant}
        onClose={handleLogoClose}
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
        onCancel={handleDeleteCancel}
      />

      <ConfirmDialog
        open={!!pendingRevoke}
        title={`Revoke invitation for "${pendingRevoke?.email}"?`}
        description="The invitation link will be invalidated immediately."
        confirmLabel="Revoke"
        danger
        loading={isRevoking}
        onConfirm={handleRevokeInvitation}
        onCancel={handleRevokeCancel}
      />
    </Box>
  );
});
