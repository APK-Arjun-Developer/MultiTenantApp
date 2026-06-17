import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useResetPasswordMutation } from '@/features/auth/api/authApi';
import type { ApiError } from '@/types/api';

const schema = z
  .object({
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [resetPassword, { isLoading }] = useResetPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (!token) {
    return (
      <Alert severity="error">
        Invalid or missing reset token.{' '}
        <Link component={RouterLink} to="/forgot-password">
          Request a new link.
        </Link>
      </Alert>
    );
  }

  const onSubmit = async (values: FormValues) => {
    try {
      await resetPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      }).unwrap();
      toast.success('Password reset successfully. Please sign in.');
      navigate('/login', { replace: true });
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Failed to reset password. The link may have expired.');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        Set a new password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a strong password for your account.
      </Typography>

      <Stack spacing={2}>
        <TextField
          {...register('newPassword')}
          label="New password"
          type="password"
          fullWidth
          autoFocus
          autoComplete="new-password"
          error={!!errors.newPassword}
          helperText={errors.newPassword?.message}
        />
        <TextField
          {...register('confirmPassword')}
          label="Confirm password"
          type="password"
          fullWidth
          autoComplete="new-password"
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword?.message}
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isLoading ? 'Resetting…' : 'Reset password'}
        </Button>
      </Stack>
    </Box>
  );
}
