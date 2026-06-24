import { useMemo, useState } from 'react';
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
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { useDebounce } from '@/shared/hooks';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { usePermission } from '@/shared/hooks/usePermission';
import { useGetTenantsQuery } from '@/features/tenants/api/tenantsApi';
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
} from '@/features/tenantAdmins/api/tenantAdminsApi';
import type { TenantAdminDto, TenantAdminInvitationDto, ApiError } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const createSchema = z.object({
  tenantSlug: z.string().min(1, 'Tenant is required'),
  fullName: z.string().min(1, 'Full name is required').max(200),
  email: z.string().email('Invalid email address'),
});
type CreateValues = z.infer<typeof createSchema>;

const inviteSchema = z.object({
  tenantSlug: z.string().min(1, 'Tenant is required'),
  email: z.string().email('Invalid email address'),
});
type InviteValues = z.infer<typeof inviteSchema>;

const editSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(200),
});
type EditValues = z.infer<typeof editSchema>;

// ─── Create dialog ────────────────────────────────────────────────────────────

interface CreateAdminDialogProps {
  open: boolean;
  onClose: () => void;
  tenantOptions: { value: string; label: string }[];
}

function CreateAdminDialog({ open, onClose, tenantOptions }: CreateAdminDialogProps) {
  const [createTenantAdmin] = useCreateTenantAdminMutation();
  const snackbar = useSnackbar();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'tenantSlug',
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
    ],
    [tenantOptions],
  );

  const onSubmit = async (values: CreateValues) => {
    try {
      const result = await createTenantAdmin(values).unwrap();
      snackbar.success(`Admin "${result.fullName}" created. Setup email sent to ${result.email}.`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to create tenant admin.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Tenant Admin</DialogTitle>
      <DialogContent>
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
  const [inviteTenantAdmin] = useInviteTenantAdminMutation();
  const snackbar = useSnackbar();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'tenantSlug',
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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
  onClose: () => void;
}

function EditAdminDialog({ admin, onClose }: EditAdminDialogProps) {
  const [updateTenantAdmin] = useUpdateTenantAdminMutation();
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
    ],
    [admin],
  );

  const onSubmit = async (values: EditValues) => {
    if (!admin) return;
    try {
      await updateTenantAdmin({ userId: admin.id, fullName: values.fullName }).unwrap();
      snackbar.success('Tenant admin updated.');
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update tenant admin.');
    }
  };

  return (
    <Dialog open={!!admin} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Tenant Admin</DialogTitle>
      <DialogContent>
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
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [tenantIdFilter, setTenantIdFilter] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [createOpen, setCreateOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editAdmin, setEditAdmin] = useState<TenantAdminDto | null>(null);
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
  const { data: adminsData, isLoading: isLoadingAdmins } = useGetTenantAdminsQuery({
    page: page + 1,
    pageSize,
    search: debouncedSearch || undefined,
    tenantId: tenantIdFilter || undefined,
  });
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
  const [resendSetup] = useResendTenantAdminSetupMutation();
  const [revokeInvitation, { isLoading: isRevoking }] = useRevokeInvitationMutation();

  const isActioning = isDeleting || isActivating || isDeactivating;

  const tenantSlugOptions = useMemo(
    () => tenantsData?.items.map((t) => ({ value: t.slug, label: t.name })) ?? [],
    [tenantsData],
  );

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

  const adminColumns: ColumnDef<TenantAdminDto>[] = [
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
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {row.original.tenant.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.original.tenant.slug}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            —
          </Typography>
        ),
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
          {canEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => setEditAdmin(row.original)}>
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {canResend && !row.original.isActive && (
            <Tooltip title="Resend setup email">
              <IconButton size="small" color="info" onClick={() => handleResend(row.original)}>
                <EmailIcon fontSize="small" />
              </IconButton>
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
    {
      id: 'actions',
      header: '',
      cell: ({ row }) =>
        canRevoke &&
        !row.original.isRevoked &&
        !row.original.isAccepted &&
        !row.original.isExpired ? (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip title="Revoke invitation">
              <IconButton size="small" color="error" onClick={() => setPendingRevoke(row.original)}>
                <BlockIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ) : null,
    },
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
      {tab === 0 && (
        <Box>
          <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
            <TextField
              size="small"
              placeholder="Search admins…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(0);
              }}
              sx={{ minWidth: 260 }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" color="action" />
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
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by tenant</InputLabel>
              <Select
                value={tenantIdFilter}
                label="Filter by tenant"
                onChange={(e) => {
                  setTenantIdFilter(e.target.value);
                  setPage(0);
                }}
              >
                <MenuItem value="">All tenants</MenuItem>
                {tenantsData?.items.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
      {tab === 1 && (
        <Box>
          <Box sx={{ mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Filter by status</InputLabel>
              <Select
                value={statusFilter}
                label="Filter by status"
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setInvPage(0);
                }}
              >
                <MenuItem value="">All statuses</MenuItem>
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Accepted">Accepted</MenuItem>
                <MenuItem value="Expired">Expired</MenuItem>
                <MenuItem value="Revoked">Revoked</MenuItem>
              </Select>
            </FormControl>
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
        tenantOptions={tenantSlugOptions}
      />
      <InviteAdminDialog
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        tenantOptions={tenantSlugOptions}
      />
      <EditAdminDialog admin={editAdmin} onClose={() => setEditAdmin(null)} />

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
