import { useRef, useState } from 'react';
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
import { FormBuilder, type FieldConfig, type FormBuilderHandle } from 'mui-schema-form-builder';
import { useValidateAccountSetupQuery, useSetPasswordMutation } from '@/features/auth/api/authApi';
import { PASSWORD_FIELD } from '@/shared/components/PasswordField';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ApiError, SetPasswordResponse } from '@/types/api';

// ─── Schema ───────────────────────────────────────────────────────────────────

const passwordRule = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'Must include an uppercase letter')
  .regex(/[0-9]/, 'Must include a number')
  .regex(/[^A-Za-z0-9]/, 'Must include a special character');

const schema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });
type FormValues = z.infer<typeof schema>;

const setupFields: FieldConfig[] = [
  {
    name: 'password',
    label: 'New password',
    type: PASSWORD_FIELD,
    required: true,
    muiProps: { autoComplete: 'new-password', autoFocus: true },
  },
  {
    name: 'confirmPassword',
    label: 'Confirm password',
    type: PASSWORD_FIELD,
    required: true,
    muiProps: { autoComplete: 'new-password' },
  },
];

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
        to="/login"
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
  const formRef = useRef<FormBuilderHandle>(null);
  const snackbar = useSnackbar();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const { data: validation, isLoading: isValidating } = useValidateAccountSetupQuery(token, {
    skip: !token,
  });
  const [setPassword, { isLoading: isSetting }] = useSetPasswordMutation();

  const [result, setResult] = useState<SetPasswordResponse | null>(null);

  const onSubmit = async (values: FormValues) => {
    try {
      const response = await setPassword({
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      setResult(response);
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Failed to set password. The link may have expired.');
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

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <AccountCircleIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Set your password
        </Typography>
      </Box>

      {(validation.fullName || validation.email) && (
        <Box sx={{ mb: 2 }}>
          {validation.fullName && (
            <Typography variant="body2" color="text.secondary">
              Welcome,{' '}
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {validation.fullName}
              </Box>
              .
            </Typography>
          )}
          {validation.email && (
            <Typography variant="body2" color="text.secondary">
              Setting up account for{' '}
              <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                {validation.email}
              </Box>
            </Typography>
          )}
        </Box>
      )}

      <FormBuilder
        ref={formRef}
        schema={schema}
        fields={setupFields}
        onSubmit={onSubmit}
        submitText={isSetting ? 'Saving…' : 'Set password & activate account'}
        sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
      />
    </Box>
  );
}
