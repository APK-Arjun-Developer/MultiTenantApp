import { memo, useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { FormWizard, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import {
  useValidateInvitationQuery,
  useAcceptTenantAdminInvitationMutation,
  useAcceptTenantUserInvitationMutation,
  useAcceptTenantCreationInvitationMutation,
} from '@/features/auth/api/authApi';
import { LoadingButton, Icon } from '@/shared/components';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import {
  getAddressFields,
  buildAddressPayload,
  getTenantAddressFields,
  buildTenantAddressPayload,
} from '@/shared/forms/addressFields';
import type { AcceptInvitationResponse, ApiError } from '@/types/api';
import { styles } from './InvitationPage.styles';
import {
  inviteSchema,
  tenantCreationSchema,
  type FormValues,
  type TenantCreationValues,
  type InvitationInvalidProps,
  type InvitationSuccessProps,
} from './InvitationPage.types';

// ─── InvitationInvalid ────────────────────────────────────────────────────────

const InvitationInvalid = memo(({ message }: InvitationInvalidProps) => {
  return (
    <Stack spacing={2} sx={styles.invalidStack}>
      <Box sx={styles.invalidIconBox}>
        <Icon name="Error" sx={styles.invalidIcon} />
      </Box>
      <Typography variant="h6" sx={styles.invalidTitle}>
        Invitation expired or invalid
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message || 'This invitation link is no longer valid. Please contact your administrator.'}
      </Typography>
      <Button
        component={Link}
        to="/login"
        variant="contained"
        fullWidth
        size="large"
        sx={styles.invalidButton}
      >
        Go to sign in
      </Button>
    </Stack>
  );
});

// ─── InvitationSuccess ────────────────────────────────────────────────────────

const InvitationSuccess = memo(({ result }: InvitationSuccessProps) => {
  return (
    <Stack spacing={2} sx={styles.successStack}>
      <Box sx={styles.successIconBox}>
        <Icon name="CheckCircle" sx={styles.successIcon} />
      </Box>
      <Typography variant="h6" sx={styles.successTitle}>
        Account created!
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Welcome,{' '}
        <Box component="span" sx={styles.successNameSpan}>
          {result.fullName}
        </Box>
        . Your account is ready.
        {result.roles.length > 0 && (
          <>
            {' '}
            You have been assigned the role{result.roles.length > 1 ? 's' : ''}:{' '}
            <Box component="span" sx={styles.successRolesSpan}>
              {result.roles.join(', ')}
            </Box>
            .
          </>
        )}
      </Typography>
      <Button
        component={Link}
        to="/login"
        variant="contained"
        fullWidth
        size="large"
        sx={styles.successButton}
      >
        Sign in
      </Button>
    </Stack>
  );
});

// ─── InvitationPage ───────────────────────────────────────────────────────────

const InvitationPage = memo(() => {
  const snackbar = useSnackbar();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const { data: validation, isLoading: isValidating } = useValidateInvitationQuery(token, {
    skip: !token,
  });

  const [acceptAdmin, { isLoading: isAcceptingAdmin }] = useAcceptTenantAdminInvitationMutation();
  const [acceptUser, { isLoading: isAcceptingUser }] = useAcceptTenantUserInvitationMutation();
  const [acceptNewTenant, { isLoading: isAcceptingNewTenant }] =
    useAcceptTenantCreationInvitationMutation();

  const [result, setResult] = useState<AcceptInvitationResponse | null>(null);

  const isSubmitting = isAcceptingAdmin || isAcceptingUser || isAcceptingNewTenant;

  const rawInvType: unknown = validation?.invitationType;
  const isAdmin = rawInvType === 'TenantAdmin' || rawInvType === 1;
  const isNewTenant = rawInvType === 'NewTenant' || rawInvType === 3;

  // ── Fields for admin / user flows ────────────────────────────────────────

  const phoneSelectOptions = useMemo(
    () => [
      { label: '+1', value: '+1' },
      { label: '+44', value: '+44' },
      { label: '+91', value: '+91' },
      { label: '+61', value: '+61' },
      { label: '+49', value: '+49' },
      { label: '+33', value: '+33' },
      { label: '+86', value: '+86' },
      { label: '+81', value: '+81' },
      { label: '+55', value: '+55' },
      { label: '+52', value: '+52' },
    ],
    [],
  );

  const profileFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'fullName',
        label: 'Full name',
        type: FIELD_TYPE.TEXT,
        required: true,
        muiProps: { autoComplete: 'name', autoFocus: true },
      },
      {
        name: 'phone',
        label: 'Phone',
        type: FIELD_TYPE.COMBO_INPUT,
        placeholder: 'Phone number',
        selectOptions: phoneSelectOptions,
        selectPlaceholder: 'Code',
        selectWidth: 88,
      },
      {
        name: 'password',
        label: 'Password',
        type: FIELD_TYPE.PASSWORD,
        required: true,
        muiProps: { autoComplete: 'new-password' },
      },
      {
        name: 'confirmPassword',
        label: 'Confirm password',
        type: FIELD_TYPE.PASSWORD,
        required: true,
        muiProps: { autoComplete: 'new-password' },
      },
    ],
    [phoneSelectOptions],
  );

  const addressFields = useMemo<FieldConfig[]>(
    () => getAddressFields(undefined, undefined, true),
    [],
  );

  // ── Fields for new-tenant flow ────────────────────────────────────────────

  const newTenantAccountFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'fullName',
        label: 'Full name',
        type: FIELD_TYPE.TEXT,
        required: true,
        muiProps: { autoComplete: 'name', autoFocus: true },
      },
      {
        name: 'phone',
        label: 'Phone',
        type: FIELD_TYPE.COMBO_INPUT,
        placeholder: 'Phone number',
        selectOptions: phoneSelectOptions,
        selectPlaceholder: 'Code',
        selectWidth: 88,
      },
      {
        name: 'password',
        label: 'Password',
        type: FIELD_TYPE.PASSWORD,
        required: true,
        muiProps: { autoComplete: 'new-password' },
      },
      {
        name: 'confirmPassword',
        label: 'Confirm password',
        type: FIELD_TYPE.PASSWORD,
        required: true,
        muiProps: { autoComplete: 'new-password' },
      },
    ],
    [phoneSelectOptions],
  );

  const newTenantDetailsFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'tenantName',
        label: 'Company / tenant name',
        type: FIELD_TYPE.TEXT,
        required: true,
      },
      ...getTenantAddressFields(undefined, undefined, true),
    ],
    [],
  );

  const newTenantUserAddressFields = useMemo<FieldConfig[]>(
    () => getAddressFields(undefined, undefined, true),
    [],
  );

  // ── Wizard step configs ───────────────────────────────────────────────────

  const adminUserSteps = useMemo(
    () => [
      {
        label: 'Your profile',
        description: 'Name and password',
        fields: profileFields,
      },
      {
        label: 'Address',
        description: 'Personal address',
        fields: addressFields,
      },
    ],
    [profileFields, addressFields],
  );

  const newTenantSteps = useMemo(
    () => [
      {
        label: 'Your account',
        description: 'Name and password',
        fields: newTenantAccountFields,
      },
      {
        label: 'Tenant details',
        description: 'Company name and address',
        fields: newTenantDetailsFields,
      },
      {
        label: 'Your address',
        description: 'Personal address',
        fields: newTenantUserAddressFields,
      },
    ],
    [newTenantAccountFields, newTenantDetailsFields, newTenantUserAddressFields],
  );

  // ── Submit handlers ───────────────────────────────────────────────────────

  const onSubmit = useCallback(
    async (values: FormValues) => {
      try {
        const currentType: unknown = validation?.invitationType;
        const submitAsAdmin = currentType === 'TenantAdmin' || currentType === 1;

        const addressPayload = buildAddressPayload(values);
        const payload = {
          token,
          fullName: values.fullName,
          phone: values.phone?.input ? `${values.phone.select}${values.phone.input}` : undefined,
          password: values.password,
          confirmPassword: values.confirmPassword,
          ...addressPayload,
        };

        let response: AcceptInvitationResponse;
        if (submitAsAdmin) {
          response = await acceptAdmin(payload).unwrap();
        } else {
          response = await acceptUser(payload).unwrap();
        }

        setResult(response);
      } catch (err) {
        snackbar.error(
          (err as ApiError).message || 'Failed to accept invitation. The link may have expired.',
        );
      }
    },
    [token, validation?.invitationType, acceptAdmin, acceptUser, snackbar],
  );

  const onSubmitNewTenant = useCallback(
    async (values: TenantCreationValues) => {
      try {
        const tenantAddressPayload = buildTenantAddressPayload(values);
        const userAddressPayload = buildAddressPayload(values);

        const response = await acceptNewTenant({
          token,
          fullName: values.fullName,
          phone: values.phone?.input ? `${values.phone.select}${values.phone.input}` : undefined,
          password: values.password,
          confirmPassword: values.confirmPassword,
          tenantName: values.tenantName,
          ...(tenantAddressPayload.address ? { tenantAddress: tenantAddressPayload.address } : {}),
          ...(userAddressPayload.address ? { userAddress: userAddressPayload.address } : {}),
        }).unwrap();

        setResult(response);
      } catch (err) {
        snackbar.error(
          (err as ApiError).message || 'Failed to accept invitation. The link may have expired.',
        );
      }
    },
    [token, acceptNewTenant, snackbar],
  );

  // ── Wizard renderActions ──────────────────────────────────────────────────

  const renderNewTenantActions = useCallback(
    ({
      isSubmitting: formSubmitting,
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
        {!isFirstStep && (
          <Button type="button" onClick={back} variant="outlined" sx={styles.wizardActionButton}>
            Back
          </Button>
        )}
        <LoadingButton
          type={isLastStep ? 'submit' : 'button'}
          loading={formSubmitting || (isLastStep && isSubmitting)}
          onClick={isLastStep ? undefined : next}
          variant="contained"
          sx={styles.wizardActionButton}
        >
          {isLastStep ? 'Create tenant & account' : 'Next'}
        </LoadingButton>
      </Box>
    ),
    [isSubmitting],
  );

  const renderAdminUserActions = useCallback(
    ({
      isSubmitting: formSubmitting,
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
        {!isFirstStep && (
          <Button type="button" onClick={back} variant="outlined" sx={styles.wizardActionButton}>
            Back
          </Button>
        )}
        <LoadingButton
          type={isLastStep ? 'submit' : 'button'}
          loading={formSubmitting || (isLastStep && isSubmitting)}
          onClick={isLastStep ? undefined : next}
          variant="contained"
          sx={styles.wizardActionButton}
        >
          {isLastStep ? 'Create' : 'Next'}
        </LoadingButton>
      </Box>
    ),
    [isSubmitting],
  );

  // ── Early returns ─────────────────────────────────────────────────────────

  if (!token) return <InvitationInvalid message="No invitation token found in the link." />;

  if (isValidating) {
    return (
      <Box sx={styles.loadingBox}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!validation?.isValid) return <InvitationInvalid message={validation?.errorMessage} />;

  if (result) return <InvitationSuccess result={result} />;

  // ── New Tenant invitation UI ──────────────────────────────────────────────

  if (isNewTenant) {
    return (
      <Box sx={styles.newTenantRoot}>
        <Box sx={styles.newTenantHeader}>
          <Box sx={styles.headerIconBox}>
            <Icon name="PersonAdd" sx={styles.headerIconSize} />
          </Box>
          <Typography variant="h6" sx={styles.newTenantTitle}>
            Create your tenant account
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={styles.newTenantSubtitle}>
          You've been invited to set up a new tenant on this platform.
        </Typography>

        <TextField
          label="Email address"
          value={validation.email ?? ''}
          fullWidth
          disabled
          sx={styles.newTenantEmailField}
          slotProps={{ input: { readOnly: true } }}
        />

        <FormWizard
          key={token}
          schema={tenantCreationSchema}
          steps={newTenantSteps}
          onSubmit={onSubmitNewTenant}
          renderActions={renderNewTenantActions}
          sx={styles.formWizardContainer}
        />
      </Box>
    );
  }

  // ── Admin / User invitation UI ────────────────────────────────────────────

  return (
    <Box sx={styles.adminUserRoot}>
      <Box sx={styles.adminUserHeader}>
        <Box sx={styles.headerIconBox}>
          <Icon name="PersonAdd" sx={styles.headerIconSize} />
        </Box>
        <Typography variant="h6" sx={styles.adminUserTitle}>
          Accept invitation
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={styles.adminUserSubtitle}>
        You've been invited to join
      </Typography>
      <Box sx={styles.adminUserTenantRow}>
        <Typography variant="subtitle1" sx={styles.adminUserTenantName}>
          {validation.tenantName}
        </Typography>
        <Chip
          label={isAdmin ? 'Admin' : 'User'}
          size="small"
          color={isAdmin ? 'primary' : 'default'}
          variant="outlined"
        />
      </Box>

      <TextField
        label="Email address"
        value={validation.email ?? ''}
        fullWidth
        disabled
        sx={styles.adminUserEmailField}
        slotProps={{ input: { readOnly: true } }}
      />

      <FormWizard
        key={token}
        schema={inviteSchema}
        steps={adminUserSteps}
        onSubmit={onSubmit}
        renderActions={renderAdminUserActions}
        sx={styles.formWizardContainer}
      />
    </Box>
  );
});
export default InvitationPage;
