import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useForgotPasswordMutation } from '@/features/auth/api/authApi';
import type { ApiError } from '@/types/api';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  tenantSlug: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await forgotPassword({
        email: values.email,
        tenantSlug: values.tenantSlug || undefined,
      }).unwrap();
      setSent(true);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Could not send reset email. Please try again.');
    }
  };

  if (sent) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 2 }}>
          Check your email — we sent you a password reset link.
        </Alert>
        <Link component={RouterLink} to="/login" variant="body2">
          ← Back to sign in
        </Link>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        Reset your password
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your email and we'll send you a reset link.
      </Typography>

      <Stack spacing={2}>
        <TextField
          {...register('email')}
          label="Email address"
          type="email"
          fullWidth
          autoFocus
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField {...register('tenantSlug')} label="Tenant slug (optional)" fullWidth />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isLoading ? 'Sending…' : 'Send reset link'}
        </Button>
      </Stack>

      <Box sx={{ mt: 2.5, textAlign: 'center' }}>
        <Link component={RouterLink} to="/login" variant="body2">
          ← Back to sign in
        </Link>
      </Box>
    </Box>
  );
}
