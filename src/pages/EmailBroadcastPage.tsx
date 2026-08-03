import { memo, useCallback, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';
import { useSendEmailBroadcastMutation } from '@/features/emails/api/emailsApi';
import { useGetTenantsQuery } from '@/features/tenants/api/tenantsApi';
import { selectSelectedTenantId } from '@/features/ui/uiSlice';
import { useGetUsersQuery } from '@/features/users/api/usersApi';
import { Icon, LoadingButton, PermissionGuard } from '@/shared/components';
import { PERMISSIONS } from '@/shared/constants/permissions';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ApiError, BroadcastTarget, TenantDto, UserDto } from '@/types/api';

import { styles } from './EmailBroadcastPage.styles';

// ---------------------------------------------------------------------------
// Target type options
// ---------------------------------------------------------------------------

interface TargetOption {
  value: BroadcastTarget;
  label: string;
  description: string;
}

const SYSTEM_ADMIN_TARGETS: TargetOption[] = [
  {
    value: 'CurrentTenant',
    label: 'Current tenant — all users',
    description: 'All active confirmed users in the tenant selected above.',
  },
  {
    value: 'SpecificTenants',
    label: 'Selected tenants — all users',
    description: 'All active confirmed users across the tenants you pick.',
  },
  {
    value: 'AllTenants',
    label: 'Everyone (all tenants)',
    description: 'All active confirmed users across every tenant on the platform.',
  },
  {
    value: 'SpecificUsers',
    label: 'Specific users',
    description: 'Hand-pick individual users from the current tenant.',
  },
];

const TENANT_ADMIN_TARGETS: TargetOption[] = [
  {
    value: 'CurrentTenant',
    label: 'All users in my organization',
    description: 'Every active confirmed user in your tenant receives this email.',
  },
  {
    value: 'SpecificUsers',
    label: 'Specific users',
    description: 'Hand-pick individual users from your organization.',
  },
];

// ---------------------------------------------------------------------------
// Tenant multi-select (SystemAdmin SpecificTenants)
// ---------------------------------------------------------------------------

interface TenantMultiSelectProps {
  value: TenantDto[];
  onChange: (tenants: TenantDto[]) => void;
}

const TenantMultiSelect = memo(({ value, onChange }: TenantMultiSelectProps) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isFetching } = useGetTenantsQuery({
    search: debouncedSearch || undefined,
    pageSize: 30,
  });
  const options = data?.items ?? [];

  return (
    <Autocomplete<TenantDto, true>
      multiple
      value={value}
      options={options}
      loading={isFetching}
      getOptionLabel={(o) => o.name}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      filterOptions={(x) => x}
      onInputChange={(_, v) => setSearch(v)}
      onChange={(_, v) => onChange(v)}
      slotProps={{ chip: { size: 'small' } }}
      renderInput={(params) => (
        <TextField
          id={params.id}
          disabled={params.disabled}
          fullWidth={params.fullWidth}
          size={params.size}
          label="Select tenants"
          placeholder={value.length === 0 ? 'Search by name…' : undefined}
          slotProps={{
            inputLabel: params.slotProps.inputLabel,
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <>
                  {isFetching && <CircularProgress size={16} />}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
            htmlInput: params.slotProps.htmlInput,
          }}
        />
      )}
    />
  );
});

// ---------------------------------------------------------------------------
// User multi-select (both roles for SpecificUsers)
// ---------------------------------------------------------------------------

interface UserMultiSelectProps {
  value: UserDto[];
  onChange: (users: UserDto[]) => void;
  disabled?: boolean;
}

const UserMultiSelect = memo(({ value, onChange, disabled }: UserMultiSelectProps) => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const { data, isFetching } = useGetUsersQuery(
    { search: debouncedSearch || undefined, pageSize: 30, isActive: true },
    { skip: disabled },
  );
  const options = data?.items ?? [];

  return (
    <Autocomplete<UserDto, true>
      multiple
      disabled={disabled}
      value={value}
      options={options}
      loading={isFetching}
      getOptionLabel={(o) => o.fullName}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      filterOptions={(x) => x}
      onInputChange={(_, v) => setSearch(v)}
      onChange={(_, v) => onChange(v)}
      slotProps={{ chip: { size: 'small' } }}
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box>
            <Typography variant="body2">{option.fullName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {option.email}
            </Typography>
          </Box>
        </li>
      )}
      renderInput={(params) => (
        <TextField
          id={params.id}
          disabled={params.disabled}
          fullWidth={params.fullWidth}
          size={params.size}
          label="Select users"
          placeholder={value.length === 0 ? 'Search by name or email…' : undefined}
          slotProps={{
            inputLabel: params.slotProps.inputLabel,
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <>
                  {isFetching && <CircularProgress size={16} />}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
            htmlInput: params.slotProps.htmlInput,
          }}
        />
      )}
    />
  );
});

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

const EmailBroadcastContent = memo(() => {
  const snackbar = useSnackbar();
  const user = useAppSelector(selectCurrentUser);
  const isSystemAdmin = user?.systemRole === 'SystemAdmin';
  const selectedTenantId = useAppSelector(selectSelectedTenantId);

  const [sendBroadcast, { isLoading: isSending }] = useSendEmailBroadcastMutation();

  // Compose state
  const [subject, setSubject] = useState('');
  const [htmlBody, setHtmlBody] = useState('');

  // Recipient state
  const [targetType, setTargetType] = useState<BroadcastTarget>('CurrentTenant');
  const [selectedTenants, setSelectedTenants] = useState<TenantDto[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserDto[]>([]);

  const targets = isSystemAdmin ? SYSTEM_ADMIN_TARGETS : TENANT_ADMIN_TARGETS;

  // For SystemAdmin + SpecificUsers, we need a tenant context for user search
  const userSearchDisabled = isSystemAdmin && targetType === 'SpecificUsers' && !selectedTenantId;

  const handleSend = useCallback(async () => {
    if (!subject.trim()) {
      snackbar.error('Subject is required.');
      return;
    }
    if (!htmlBody.trim()) {
      snackbar.error('Email body is required.');
      return;
    }
    if (targetType === 'CurrentTenant' && isSystemAdmin && !selectedTenantId) {
      snackbar.error('Select a tenant from the picker in the top bar.');
      return;
    }
    if (targetType === 'SpecificTenants' && selectedTenants.length === 0) {
      snackbar.error('Select at least one tenant.');
      return;
    }
    if (targetType === 'SpecificUsers' && selectedUsers.length === 0) {
      snackbar.error('Select at least one user.');
      return;
    }

    try {
      const result = await sendBroadcast({
        subject,
        htmlBody,
        targetType,
        tenantIds: targetType === 'SpecificTenants' ? selectedTenants.map((t) => t.id) : undefined,
        userIds: targetType === 'SpecificUsers' ? selectedUsers.map((u) => u.id) : undefined,
      }).unwrap();

      snackbar.success(result.message);
      setSubject('');
      setHtmlBody('');
      setSelectedTenants([]);
      setSelectedUsers([]);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to send email broadcast.');
    }
  }, [
    subject,
    htmlBody,
    targetType,
    selectedTenants,
    selectedUsers,
    isSystemAdmin,
    selectedTenantId,
    sendBroadcast,
    snackbar,
  ]);

  return (
    <Box sx={styles.root}>
      <Typography variant="body2" color="text.secondary" sx={styles.pageIntro}>
        {isSystemAdmin
          ? 'Send a custom email to users across one or all tenants.'
          : 'Send a custom email to users in your organization.'}
      </Typography>

      {/* Recipients */}
      <Paper variant="outlined" sx={styles.sectionCard}>
        <Typography variant="subtitle1" sx={styles.sectionTitle}>
          Recipients
        </Typography>

        <RadioGroup
          value={targetType}
          onChange={(e) => {
            setTargetType(e.target.value as BroadcastTarget);
            setSelectedTenants([]);
            setSelectedUsers([]);
          }}
          sx={styles.radioGroup}
        >
          {targets.map((opt) => (
            <FormControlLabel
              key={opt.value}
              value={opt.value}
              control={<Radio size="small" />}
              sx={styles.radioLabelRoot}
              label={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {opt.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={styles.radioDescription}>
                    {opt.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </RadioGroup>

        {/* Tenant multi-select for SpecificTenants */}
        {targetType === 'SpecificTenants' && (
          <Box sx={styles.autocompleteWrapper}>
            <TenantMultiSelect value={selectedTenants} onChange={setSelectedTenants} />
          </Box>
        )}

        {/* User multi-select for SpecificUsers */}
        {targetType === 'SpecificUsers' && (
          <Box sx={styles.autocompleteWrapper}>
            {userSearchDisabled ? (
              <Box sx={styles.hintBox}>
                <Typography variant="body2" color="text.secondary">
                  Select a tenant from the picker in the top bar to search users.
                </Typography>
              </Box>
            ) : (
              <UserMultiSelect value={selectedUsers} onChange={setSelectedUsers} disabled={false} />
            )}
          </Box>
        )}
      </Paper>

      {/* Compose */}
      <Paper variant="outlined" sx={styles.sectionCard}>
        <Typography variant="subtitle1" sx={styles.sectionTitle}>
          Compose
        </Typography>

        <TextField
          fullWidth
          label="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="e.g. Happy holidays from our team!"
          slotProps={{ htmlInput: { maxLength: 200 } }}
          sx={styles.subjectField}
        />

        <TextField
          fullWidth
          label="Email body (HTML supported)"
          value={htmlBody}
          onChange={(e) => setHtmlBody(e.target.value)}
          multiline
          rows={10}
          placeholder={'<p>Dear user,</p>\n<p>...</p>'}
        />
      </Paper>

      {/* Footer */}
      <Box sx={styles.footer}>
        <Typography variant="caption" sx={styles.disclaimer}>
          Only active users with confirmed email addresses will receive this message. Delivery runs
          in the background — the page returns as soon as recipients are counted.
        </Typography>
        <LoadingButton
          variant="contained"
          loading={isSending}
          onClick={handleSend}
          startIcon={<Icon name="Send" />}
          sx={styles.sendButton}
        >
          Send email
        </LoadingButton>
      </Box>
    </Box>
  );
});

const EmailBroadcastPage = memo(() => (
  <PermissionGuard permission={PERMISSIONS.EMAILS_SEND}>
    <EmailBroadcastContent />
  </PermissionGuard>
));

export default EmailBroadcastPage;
