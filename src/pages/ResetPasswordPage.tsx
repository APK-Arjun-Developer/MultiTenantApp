import { useRef, useState } from 'react';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import LockResetIcon from '@mui/icons-material/LockReset';
import {
  FormBuilder,
  FIELD_TYPE,
  type FieldConfig,
  type FormBuilderHandle,
} from 'mui-schema-form-builder';
import { useValidateResetTokenQuery, useResetPasswordMutation } from '@/features/auth/api/authApi';
import { LoadingButton } from '@/shared/components/LoadingButton';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import type { ApiError } from '@/types/api';
import CircularProgress from '@mui/material/CircularProgress';

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

const resetFields: FieldConfig[] = [
  {
    name: 'password',
    label: 'New password',
    type: FIELD_TYPE.PASSWORD,
    required: true,
    muiProps: { autoComplete: 'new-password', autoFocus: true },
  },
  {
    name: 'confirmPassword',
    label: 'Confirm new password',
    type: FIELD_TYPE.PASSWORD,
    required: true,
    muiProps: { autoComplete: 'new-password' },
  },
];

// ─── States ──────────────────────────────────────────────────────────────────

function TokenInvalid({ message }: { message?: string | null }) {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <ErrorIcon sx={{ fontSize: 48, color: 'error.main' }} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Link expired or invalid
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {message || 'This password reset link is no longer valid.'}
      </Typography>
      <Button
        component={Link}
        to="/forgot-password"
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 1 }}
      >
        Request a new link
      </Button>
      <Button component={Link} to="/login" variant="text" size="small">
        Back to sign in
      </Button>
    </Stack>
  );
}

function ResetSuccess() {
  return (
    <Stack spacing={2} sx={{ alignItems: 'center', textAlign: 'center' }}>
      <CheckCircleIcon sx={{ fontSize: 48, color: 'success.main' }} />
      <Typography variant="h6" sx={{ fontWeight: 600 }}>
        Password updated
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Your password has been reset successfully. Sign in with your new password.
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

// ─── Page ────────────────────────────────────────────────────────────────────

export function ResetPasswordPage() {
  const formRef = useRef<FormBuilderHandle>(null);
  const snackbar = useSnackbar();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();

  const { data: validation, isLoading: isValidating } = useValidateResetTokenQuery(token, {
    skip: !token,
  });
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const [done, setDone] = useState(false);

  const onSubmit = async (values: FormValues) => {
    try {
      await resetPassword({
        token,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      setDone(true);
      snackbar.success('Password reset successfully!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const error = err as ApiError;
      snackbar.error(error.message || 'Failed to reset password. Please try again.');
    }
  };

  if (!token) return <TokenInvalid message="No reset token found in the link." />;

  if (isValidating) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress size={28} />
      </Box>
    );
  }

  if (!validation?.isValid) return <TokenInvalid message={validation?.errorMessage} />;

  if (done) return <ResetSuccess />;

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
        <LockResetIcon color="primary" />
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Set new password
        </Typography>
      </Box>
      {validation.email && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Resetting password for{' '}
          <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {validation.email}
          </Box>
        </Typography>
      )}

      <FormBuilder
        ref={formRef}
        schema={schema}
        fields={resetFields}
        onSubmit={onSubmit}
        renderActions={({ isSubmitting }) => (
          <LoadingButton
            type="submit"
            loading={isSubmitting || isResetting}
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 1 }}
          >
            Reset password
          </LoadingButton>
        )}
        sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
      />

      <Box sx={{ textAlign: 'center', mt: 1 }}>
        <Button component={Link} to="/login" variant="text" size="small">
          Back to sign in
        </Button>
      </Box>
    </Box>
  );
}
