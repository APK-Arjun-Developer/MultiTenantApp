import { memo, useCallback, useMemo } from 'react';
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
import {
  FIELD_TYPE,
  type FieldConfig,
  FilterForm,
  FormBuilder,
  FormWizard,
} from 'mui-schema-form-builder';
import { z } from 'zod';

import {
  useGetSubscriptionPlansQuery,
  useUpdateTenantPlanMutation,
} from '@/features/subscriptions/api/subscriptionsApi';
import {
  useDeleteTenantMutation,
  useGetTenantCreationInvitationsQuery,
  useGetTenantsQuery,
  useInviteTenantMutation,
  useOnboardTenantMutation,
  useRemoveTenantLogoByAdminMutation,
  useResendTenantInvitationMutation,
  useRevokeTenantInvitationMutation,
  useUpdateTenantMutation,
  useUploadTenantLogoByAdminMutation,
} from '@/features/tenants/api/tenantsApi';
import { getTenantLogoUrl } from '@/features/tenantSettings/api/tenantSettingsApi';
import {
  AvatarManageModal,
  ConfirmDialog,
  CreatedViaChip,
  DataTable,
  Icon,
  InvitationStatusChip,
  LabelValue,
  LoadingButton,
  ViewDialog,
} from '@/shared/components';
import {
  ACTIVE_STATUS_OPTIONS,
  CREATED_VIA_OPTIONS,
  INVITATION_STATUS_OPTIONS,
} from '@/shared/constants/filterOptions';
import {
  addressZodShape,
  buildAddressPayload,
  buildTenantAddressPayload,
  getAddressFields,
  getTenantAddressFields,
  requiredAddressZodShape,
  requiredTenantAddressZodShape,
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
import { formatAddress } from '@/shared/utils/format';
import type { ApiError, PlanType, UserCreatedVia } from '@/types/api';

import { styles } from './TenantsPage.styles';
import type {
  ChangePlanDialogProps,
  EditDialogProps,
  InviteDialogProps,
  OnboardDialogProps,
  TenantCreationInvitationDto,
  TenantDto,
  TenantsInvitationsFilterBarProps,
  TenantsPageFilterBarProps,
  TenantsPageHeaderProps,
  ViewTenantDialogProps,
} from './TenantsPage.types';

const onboardSchema = z.object({
  tenantName: z.string().min(1, 'Tenant name is required').max(200),
  adminFullName: z.string().min(1, 'Admin full name is required').max(200),
  adminEmail: z.email('Invalid email address'),
  ...requiredTenantAddressZodShape,
  ...requiredAddressZodShape,
});
type OnboardValues = z.infer<typeof onboardSchema>;

const inviteSchema = z.object({
  email: z.email('Invalid email address'),
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

const TENANTS_TABS = ['tenants', 'invitations'] as const;
const TENANT_FILTER_DEFAULT = { search: '', status: '', createdVia: '' };
const INV_FILTER_DEFAULT = { status: '' };

const TenantsPageHeader = memo(
  ({ canCreate, onInviteClick, onOnboardClick }: TenantsPageHeaderProps) => {
    return (
      <Box sx={styles.header}>
        <Box sx={styles.headerTitle}>
          <Box sx={styles.pageIconBox}>
            <Icon name="Business" sx={styles.pageIconSize} />
          </Box>
          <Typography variant="h5" sx={styles.headerTitleText}>
            Tenants
          </Typography>
        </Box>
        {canCreate && (
          <Box sx={styles.headerActions}>
            <Button variant="outlined" startIcon={<Icon name="Send" />} onClick={onInviteClick}>
              Invite Tenant
            </Button>
            <Button variant="contained" startIcon={<Icon name="Add" />} onClick={onOnboardClick}>
              New Tenant
            </Button>
          </Box>
        )}
      </Box>
    );
  },
);

const TenantsPageFilterBar = memo(({ onChange }: TenantsPageFilterBarProps) => {
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

  return (
    <Box sx={styles.filterBar}>
      <FilterForm
        fields={fields}
        defaultValues={TENANT_FILTER_DEFAULT}
        onChange={onChange}
        showReset
        spacing={2}
      />
    </Box>
  );
});

const TenantsInvitationsFilterBar = memo(({ onChange }: TenantsInvitationsFilterBarProps) => {
  const fields = useMemo<FieldConfig[]>(
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

  return (
    <Box sx={styles.filterBar}>
      <FilterForm
        fields={fields}
        defaultValues={INV_FILTER_DEFAULT}
        onChange={onChange}
        showReset
        spacing={2}
      />
    </Box>
  );
});

const OnboardTenantDialog = memo(({ open, onClose }: OnboardDialogProps) => {
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
          sx={styles.formInDialog}
        />
      </DialogContent>
    </Dialog>
  );
});

const InviteTenantDialog = memo(({ open, onClose }: InviteDialogProps) => {
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
          sx={styles.formInDialog}
        />
      </DialogContent>
    </Dialog>
  );
});

const EditTenantDialog = memo(({ tenant, onClose }: EditDialogProps) => {
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
          sx={styles.formInDialog}
        />
      </DialogContent>
    </Dialog>
  );
});

const ViewTenantDialog = memo(({ tenant, onClose }: ViewTenantDialogProps) => {
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

const PlanBadge = memo(({ plan }: { plan?: PlanType | string }) => {
  const isPro = plan === 'Pro';
  return (
    <Chip
      label={plan ?? 'Free'}
      color={isPro ? 'primary' : 'default'}
      size="small"
      variant={isPro ? 'filled' : 'outlined'}
      sx={isPro ? undefined : styles.planBadgeFree}
    />
  );
});

const ChangePlanDialog = memo(({ tenant, onClose }: ChangePlanDialogProps) => {
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
          sx={styles.formInDialogWithTopMargin}
        />
      </DialogContent>
    </Dialog>
  );
});

const TenantsPage = memo(() => {
  const snackbar = useSnackbar();

  const canList = usePermission('Tenants.List');
  const canView = usePermission('Tenants.View');
  const canCreate = usePermission('Tenants.Create');
  const canEdit = usePermission('Tenants.Edit');
  const canDelete = usePermission('Tenants.Delete');
  const canEditSubscription = usePermission('Subscriptions.Edit');

  const { tab, handleTabChange } = useUrlTabs(TENANTS_TABS);

  // Tenants tab
  const tenantsTable = useTableState({ initialPageSize: 10 });
  const {
    filter: tenantFilter,
    debouncedSearch,
    handleFilterChange: handleTenantFilterChange,
  } = useFilterState(TENANT_FILTER_DEFAULT, tenantsTable.setPage);

  // Invitations tab
  const invTable = useTableState();
  const { filter: invFilter, handleFilterChange: handleInvFilterChange } = useFilterState(
    INV_FILTER_DEFAULT,
    invTable.setPage,
  );

  // Dialogs
  const onboardDialog = useBooleanDialog();
  const inviteDialog = useBooleanDialog();
  const viewDialog = useItemDialog<TenantDto>();
  const editDialog = useItemDialog<TenantDto>();
  const deleteDialog = useItemDialog<TenantDto>();
  const changePlanDialog = useItemDialog<TenantDto>();
  const logoDialog = useItemDialog<TenantDto>();
  const revokeDialog = useItemDialog<TenantCreationInvitationDto>();

  // Data
  const { data, isLoading } = useGetTenantsQuery({
    page: tenantsTable.page + 1,
    pageSize: tenantsTable.pageSize,
    search: debouncedSearch || undefined,
    isActive:
      tenantFilter.status === 'active'
        ? true
        : tenantFilter.status === 'inactive'
          ? false
          : undefined,
    createdVia: (tenantFilter.createdVia as UserCreatedVia) || undefined,
    sortBy: tenantsTable.sortBy,
    sortOrder: tenantsTable.sortBy ? tenantsTable.sortOrder : undefined,
  });

  const { data: invitationsData, isLoading: isLoadingInvitations } =
    useGetTenantCreationInvitationsQuery({
      page: invTable.page + 1,
      pageSize: invTable.pageSize,
      status: invFilter.status || undefined,
    });

  const [deleteTenantMutation, { isLoading: isDeleting }] = useDeleteTenantMutation();
  const [revokeTenantInvitation, { isLoading: isRevoking }] = useRevokeTenantInvitationMutation();
  const [resendTenantInvitation, { isLoading: isResendingInvitation }] =
    useResendTenantInvitationMutation();
  const [uploadTenantLogo, { isLoading: isUploadingLogo }] = useUploadTenantLogoByAdminMutation();
  const [removeTenantLogo, { isLoading: isRemovingLogo }] = useRemoveTenantLogoByAdminMutation();

  const handleDelete = useCallback(async () => {
    if (!deleteDialog.item) return;
    try {
      await deleteTenantMutation({ id: deleteDialog.item.id }).unwrap();
      snackbar.success(`Tenant "${deleteDialog.item.name}" deleted.`);
      deleteDialog.onClose();
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Failed to delete tenant.');
    }
  }, [deleteDialog, deleteTenantMutation, snackbar]);

  const handleRevokeInvitation = useCallback(async () => {
    if (!revokeDialog.item) return;
    try {
      await revokeTenantInvitation(revokeDialog.item.id).unwrap();
      snackbar.success('Invitation revoked.');
      revokeDialog.onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to revoke invitation.');
    }
  }, [revokeDialog, revokeTenantInvitation, snackbar]);

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
      if (!logoDialog.item) return;
      try {
        const updated = await uploadTenantLogo({ tenantId: logoDialog.item.id, file }).unwrap();
        logoDialog.setItem(updated);
        snackbar.success('Company logo updated.');
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to upload logo.');
      }
    },
    [logoDialog, uploadTenantLogo, snackbar],
  );

  const handleRemoveLogo = useCallback(async () => {
    if (!logoDialog.item) return;
    try {
      const updated = await removeTenantLogo(logoDialog.item.id).unwrap();
      logoDialog.setItem(updated);
      snackbar.success('Company logo removed.');
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to remove logo.');
    }
  }, [logoDialog, removeTenantLogo, snackbar]);

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
              onClick={() => logoDialog.onOpen(row.original)}
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
                <IconButton size="small" onClick={() => viewDialog.onOpen(row.original)}>
                  <Icon name="Visibility" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => editDialog.onOpen(row.original)}>
                  <Icon name="Edit" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canEditSubscription && (
              <Tooltip title="Change plan">
                <IconButton
                  size="small"
                  color="primary"
                  onClick={() => changePlanDialog.onOpen(row.original)}
                >
                  <Icon name="WorkspacePremium" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => deleteDialog.onOpen(row.original)}
                >
                  <Icon name="Delete" fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [
      logoDialog,
      canView,
      canEdit,
      canEditSubscription,
      canDelete,
      viewDialog,
      editDialog,
      changePlanDialog,
      deleteDialog,
    ],
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
                            <Icon name="ForwardToInbox" fontSize="small" />
                          )}
                        </IconButton>
                      </span>
                    </Tooltip>
                    <Tooltip title="Revoke invitation">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => revokeDialog.onOpen(inv)}
                      >
                        <Icon name="Block" fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                );
              },
            },
          ] as ColumnDef<TenantCreationInvitationDto>[])
        : []),
    ],
    [canCreate, isResendingInvitation, handleResendInvitation, revokeDialog],
  );

  return (
    <Box sx={styles.root}>
      <TenantsPageHeader
        canCreate={canCreate}
        onInviteClick={inviteDialog.onOpen}
        onOnboardClick={onboardDialog.onOpen}
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
            data={data?.items ?? []}
            columns={tenantColumns}
            isLoading={isLoading}
            totalCount={data?.totalCount ?? 0}
            page={tenantsTable.page}
            pageSize={tenantsTable.pageSize}
            onPageChange={tenantsTable.setPage}
            onPageSizeChange={tenantsTable.handlePageSizeChange}
            sortBy={tenantsTable.sortBy}
            sortOrder={tenantsTable.sortOrder}
            sortableColumns={['name']}
            onSortChange={tenantsTable.handleSortChange}
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
            page={invTable.page}
            pageSize={invTable.pageSize}
            onPageChange={invTable.setPage}
            onPageSizeChange={invTable.handlePageSizeChange}
          />
        </Box>
      )}

      {/* Dialogs */}
      <OnboardTenantDialog open={onboardDialog.open} onClose={onboardDialog.onClose} />
      <InviteTenantDialog open={inviteDialog.open} onClose={inviteDialog.onClose} />
      <ViewTenantDialog tenant={viewDialog.item} onClose={viewDialog.onClose} />
      <EditTenantDialog tenant={editDialog.item} onClose={editDialog.onClose} />
      <ChangePlanDialog tenant={changePlanDialog.item} onClose={changePlanDialog.onClose} />

      <AvatarManageModal
        open={logoDialog.open}
        onClose={logoDialog.onClose}
        src={
          logoDialog.item?.profileFileId ? getTenantLogoUrl(logoDialog.item.profileFileId) : null
        }
        initials={logoDialog.item?.name?.charAt(0)?.toUpperCase() ?? '?'}
        title="Company logo"
        uploading={isUploadingLogo || isRemovingLogo}
        onUpload={handleUploadLogo}
        onRemove={logoDialog.item?.profileFileId ? handleRemoveLogo : undefined}
      />

      <ConfirmDialog
        open={deleteDialog.open}
        title={`Delete "${deleteDialog.item?.name}"?`}
        description="This will permanently remove the tenant. This action cannot be undone."
        confirmLabel="Delete"
        danger
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={deleteDialog.onClose}
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
export default TenantsPage;
