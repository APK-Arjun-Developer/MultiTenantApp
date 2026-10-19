import { memo, useCallback, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormBuilder } from 'mui-schema-form-builder';

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
import { getInitials } from '@/shared/utils/format';
import type { ApiError, BroadcastTarget, TenantDto, UserDto } from '@/types/api';

import { styles } from './EmailBroadcastPage.styles';
import { composeFields, composeSchema, type ComposeValues } from './EmailBroadcastPage.types';

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
// Tenant multi-select (SystemAdmin — SpecificTenants target)
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
      renderOption={(props, option) => (
        <li {...props} key={option.id}>
          <Box sx={styles.selectOption}>
            <Avatar sx={styles.optionAvatar}>{option.name[0]?.toUpperCase()}</Avatar>
            <Typography variant="body2">{option.name}</Typography>
          </Box>
        </li>
      )}
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
// User multi-select (SpecificUsers target)
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
          <Box sx={styles.selectOption}>
            <Avatar sx={styles.optionAvatar}>{getInitials(option.fullName)}</Avatar>
            <Box>
              <Typography variant="body2" sx={styles.optionName}>
                {option.fullName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {option.email}
              </Typography>
            </Box>
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

  const [sendBroadcast] = useSendEmailBroadcastMutation();
  const [formKey, setFormKey] = useState(0);

  const [targetType, setTargetType] = useState<BroadcastTarget>('CurrentTenant');
  const [selectedTenants, setSelectedTenants] = useState<TenantDto[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<UserDto[]>([]);

  const targets = isSystemAdmin ? SYSTEM_ADMIN_TARGETS : TENANT_ADMIN_TARGETS;
  const userSearchDisabled = isSystemAdmin && targetType === 'SpecificUsers' && !selectedTenantId;

  const handleSend = useCallback(
    async (values: ComposeValues) => {
      try {
        const result = await sendBroadcast({
          subject: values.subject,
          htmlBody: values.htmlBody,
          targetType,
          tenantIds:
            targetType === 'SpecificTenants' ? selectedTenants.map((t) => t.id) : undefined,
          userIds: targetType === 'SpecificUsers' ? selectedUsers.map((u) => u.id) : undefined,
        }).unwrap();

        snackbar.success(result.message);
        setSelectedTenants([]);
        setSelectedUsers([]);
        setFormKey((k) => k + 1);
      } catch (err) {
        snackbar.error((err as ApiError).message || 'Failed to send email broadcast.');
      }
    },
    [targetType, selectedTenants, selectedUsers, sendBroadcast, snackbar],
  );

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

        {targetType === 'SpecificTenants' && (
          <Box sx={styles.autocompleteWrapper}>
            <TenantMultiSelect value={selectedTenants} onChange={setSelectedTenants} />
          </Box>
        )}

        {targetType === 'SpecificUsers' && (
          <Box sx={styles.autocompleteWrapper}>
            {userSearchDisabled ? (
              <Box sx={styles.hintBox}>
                <Typography variant="body2" color="text.secondary">
                  Select a tenant from the picker in the top bar to search users.
                </Typography>
              </Box>
            ) : (
              <UserMultiSelect value={selectedUsers} onChange={setSelectedUsers} />
            )}
          </Box>
        )}
      </Paper>

      {/* Compose */}
      <Paper variant="outlined" sx={styles.sectionCard}>
        <Typography variant="subtitle1" sx={styles.sectionTitle}>
          Compose
        </Typography>

        <FormBuilder
          key={formKey}
          schema={composeSchema}
          fields={composeFields}
          onSubmit={handleSend}
          sx={styles.formBuilder}
          renderActions={({ isSubmitting, submit }) => {
            const handleClick = () => {
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
              submit();
            };
            return (
              <Box sx={styles.footer}>
                <Typography variant="caption" sx={styles.disclaimer}>
                  Only active users with confirmed email addresses will receive this message.
                  Delivery runs in the background — the page returns as soon as recipients are
                  counted.
                </Typography>
                <LoadingButton
                  variant="contained"
                  loading={isSubmitting}
                  onClick={handleClick}
                  startIcon={<Icon name="Send" />}
                  sx={styles.sendButton}
                >
                  Send email
                </LoadingButton>
              </Box>
            );
          }}
        />
      </Paper>
    </Box>
  );
});

const EmailBroadcastPage = memo(() => (
  <PermissionGuard permission={PERMISSIONS.EMAILS_SEND}>
    <EmailBroadcastContent />
  </PermissionGuard>
));

export default EmailBroadcastPage;
