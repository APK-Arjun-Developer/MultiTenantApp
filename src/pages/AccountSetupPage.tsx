import { useState } from 'react';
import { z } from 'zod';
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
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import {
  requiredAddressZodShape,
  getAddressFields,
  buildAddressPayload,
} from '@/shared/forms/addressFields';
import type { ApiError, SetPasswordResponse } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

const passwordOnlySchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(200),
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

const fullSetupSchema = z
  .object({
    fullName: z.string().min(2, 'Full name must be at least 2 characters').max(200),
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    ...requiredAddressZodShape,
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type PasswordOnlyValues = z.infer<typeof passwordOnlySchema>;
type FullSetupValues = z.infer<typeof fullSetupSchema>;

// ─── Sub-components ───────────────────────────────────────────────────────────

function SetupInvalid({ message }: { message?: string | null }) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
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
        sx={{ mt: 1 }}
      >
        Go to sign in
      </Button>
    </Stack>
  );
}

function SetupSuccess({ result }: { result: SetPasswordResponse }) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Account is ready!
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Your password has been set. Sign in with{' '}
        <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {result.email}
        </Box>
        {result.tenantSlug && (
          <>
            {' '}
            and tenant slug{' '}
            <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {result.tenantSlug}
            </Box>
          </>
        )}
        .
      </Typography>
      <Button
        component={Link}
        to={result.tenantSlug ? `/login?slug=${result.tenantSlug}` : '/login'}
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 1 }}
      >
        Sign in
      </Button>
    </Stack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AccountSetupPage() {
  const snackbar = useSnackbar();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const { data: validation, isLoading: isValidating } = useValidateAccountSetupQuery(token, {
    skip: !token,
  });
  const [setPassword] = useSetPasswordMutation();

  const [result, setResult] = useState<SetPasswordResponse | null>(null);

  const accountFields: FieldConfig[] = [
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
  ];

  const addressFields: FieldConfig[] = getAddressFields(undefined, undefined, true);

  const onSubmitPasswordOnly = async (values: PasswordOnlyValues) => {
    try {
      const response = await setPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
        fullName: values.fullName,
      }).unwrap();
      setResult(response);
    } catch (err) {
      snackbar.error(
        (err as ApiError).message || 'Failed to set password. The link may have expired.',
      );
    }
  };

  const onSubmitFull = async (values: FullSetupValues) => {
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
  };

  if (!token) return <SetupInvalid message="No setup token found in the link." />;

  if (isValidating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!validation?.isValid) return <SetupInvalid message={validation?.errorMessage} />;

  if (result) return <SetupSuccess result={result} />;

  const header = (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <AccountCircleIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Set up your account
        </Typography>
      </Box>
      {validation.email && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Setting up account for{' '}
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {validation.email}
          </Box>
        </Typography>
      )}
    </Box>
  );

  // Direct-creation flow: address was already provided by the admin.
  if (validation.hasAddress) {
    return (
      <Box>
        {header}
        <FormBuilder
          key={token}
          schema={passwordOnlySchema}
          fields={accountFields}
          onSubmit={onSubmitPasswordOnly}
          submitText="Activate account"
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </Box>
    );
  }

  // Invitation flow: user needs to provide address too.
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
        submitText="Activate account"
        sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
      />
    </Box>
  );
}
