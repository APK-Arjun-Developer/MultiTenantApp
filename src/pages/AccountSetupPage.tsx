import { memo, useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { FormBuilder, FormWizard, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { useValidateAccountSetupQuery, useSetPasswordMutation } from '@/features/auth/api/authApi';
import { LoadingButton } from '@/shared/components/LoadingButton';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { getAddressFields, buildAddressPayload } from '@/shared/forms/addressFields';
import type { ApiError, SetPasswordResponse } from '@/types/api';
import { styles } from './AccountSetupPage.styles';
import { directPasswordSchema, fullSetupSchema } from './AccountSetupPage.types';
import type {
  DirectPasswordValues,
  FullSetupValues,
  SetupInvalidProps,
  SetupSuccessProps,
} from './AccountSetupPage.types';

// ─── Sub-components ───────────────────────────────────────────────────────────

const SetupInvalid = memo(function SetupInvalid({ message }: SetupInvalidProps) {
  return (
    <Stack spacing={2} sx={styles.invalidIconRoot}>
      <ErrorIcon sx={styles.invalidIcon} />
      <Typography variant="h6" sx={styles.invalidTitle}>
        Setup link expired or invalid
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message ||
          'This account setup link is no longer valid. Please contact your administrator to resend the email.'}
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

const SetupSuccess = memo(function SetupSuccess({ result }: SetupSuccessProps) {
  return (
    <Stack spacing={2} sx={styles.successIconRoot}>
      <CheckCircleIcon sx={styles.successIcon} />
      <Typography variant="h6" sx={styles.successTitle}>
        Account is ready!
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Your password has been set. Sign in with{' '}
        <Box component="span" sx={styles.successEmailHighlight}>
          {result.email}
        </Box>
        .
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export const AccountSetupPage = memo(function AccountSetupPage() {
  const snackbar = useSnackbar();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const { data: validation, isLoading: isValidating } = useValidateAccountSetupQuery(token, {
    skip: !token,
  });
  const [setPassword, { isLoading: isSubmitting }] = useSetPasswordMutation();

  const [result, setResult] = useState<SetPasswordResponse | null>(null);

  // Password-only fields (direct creation — admin already set full name)
  const passwordFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'password',
        label: 'New password',
        type: FIELD_TYPE.PASSWORD,
        required: true,
        muiProps: { autoComplete: 'new-password', autoFocus: true },
      },
      {
        name: 'confirmPassword',
        label: 'Confirm password',
        type: FIELD_TYPE.PASSWORD,
        required: true,
        muiProps: { autoComplete: 'new-password' },
      },
    ],
    [],
  );

  // Full account fields (invitation flow — user must set their own name)
  const accountFields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'fullName',
        label: 'Full name',
        type: FIELD_TYPE.TEXT,
        required: true,
        defaultValue: validation?.fullName ?? '',
        muiProps: { autoComplete: 'name', autoFocus: true },
      },
      {
        name: 'password',
        label: 'New password',
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
    [validation?.fullName],
  );

  const addressFields = useMemo<FieldConfig[]>(
    () => getAddressFields(undefined, undefined, true),
    [],
  );

  const onSubmitDirect = useCallback(
    async (values: DirectPasswordValues) => {
      try {
        const response = await setPassword({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword,
        }).unwrap();
        setResult(response);
      } catch (err) {
        snackbar.error(
          (err as ApiError).message || 'Failed to set password. The link may have expired.',
        );
      }
    },
    [setPassword, token, snackbar],
  );

  const onSubmitFull = useCallback(
    async (values: FullSetupValues) => {
      try {
        const response = await setPassword({
          token,
          password: values.password,
          confirmPassword: values.confirmPassword,
          fullName: values.fullName,
          ...buildAddressPayload(values),
        }).unwrap();
        setResult(response);
      } catch (err) {
        snackbar.error(
          (err as ApiError).message || 'Failed to set password. The link may have expired.',
        );
      }
    },
    [setPassword, token, snackbar],
  );

  const renderDirectActions = useCallback(
    ({ isSubmitting: formSubmitting }: { isSubmitting: boolean }) => (
      <LoadingButton
        type="submit"
        loading={formSubmitting || isSubmitting}
        variant="contained"
        fullWidth
        size="large"
        sx={styles.submitButton}
      >
        Activate account
      </LoadingButton>
    ),
    [isSubmitting],
  );

  const renderWizardActions = useCallback(
    ({
      isSubmitting: formSubmitting,
      isLastStep,
      next,
      back,
      isFirstStep,
    }: {
      isSubmitting: boolean;
      isLastStep: boolean;
      isFirstStep: boolean;
      next: () => void;
      back: () => void;
    }) => (
      <Box sx={styles.wizardActionsRow}>
        {!isFirstStep && (
          <Button type="button" onClick={back} variant="outlined" sx={styles.wizardBackButton}>
            Back
          </Button>
        )}
        <LoadingButton
          type={isLastStep ? 'submit' : 'button'}
          loading={formSubmitting || (isLastStep && isSubmitting)}
          onClick={isLastStep ? undefined : next}
          variant="contained"
          sx={styles.wizardNextButton}
        >
          {isLastStep ? 'Activate account' : 'Next'}
        </LoadingButton>
      </Box>
    ),
    [isSubmitting],
  );

  if (!token) return <SetupInvalid message="No setup token found in the link." />;

  if (isValidating) {
    return (
      <Box sx={styles.loadingBox}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!validation?.isValid) return <SetupInvalid message={validation?.errorMessage} />;

  if (result) return <SetupSuccess result={result} />;

  const header = (
    <Box>
      <Box sx={styles.headerTitleRow}>
        <AccountCircleIcon color="primary" />
        <Typography variant="h6" sx={styles.headerTitle}>
          Set up your account
        </Typography>
      </Box>
      {validation.email && (
        <Typography variant="body2" color="text.secondary" sx={styles.headerSubtitle}>
          Setting up account for{' '}
          <Box component="span" sx={styles.headerEmailHighlight}>
            {validation.email}
          </Box>
        </Typography>
      )}
    </Box>
  );

  // Direct-creation flow: address and name were already provided by the admin.
  if (validation.hasAddress) {
    return (
      <Box>
        {header}
        <FormBuilder
          key={token}
          schema={directPasswordSchema}
          fields={passwordFields}
          onSubmit={onSubmitDirect}
          renderActions={renderDirectActions}
          sx={styles.formBuilder as never}
        />
      </Box>
    );
  }

  // Invitation flow: user needs to provide name and address too.
  return (
    <Box>
      {header}
      <FormWizard
        key={token}
        schema={fullSetupSchema}
        steps={[
          {
            label: 'Your account',
            description: 'Set your name and password',
            fields: accountFields,
          },
          {
            label: 'Address',
            description: 'Personal address',
            fields: addressFields,
          },
        ]}
        onSubmit={onSubmitFull}
        renderActions={renderWizardActions}
        sx={styles.formBuilder as never}
      />
    </Box>
  );
});
