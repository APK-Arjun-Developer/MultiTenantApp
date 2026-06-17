import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated } from '@/features/auth/slices/authSlice';
import { useLoginMutation } from '@/features/auth/api/authApi';
import type { ApiError } from '@/types/api';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  tenantSlug: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    try {
      await login({
        email: values.email,
        password: values.password,
        tenantSlug: values.tenantSlug || undefined,
      }).unwrap();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Login failed. Please check your credentials.');
    }
  };

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
        Sign in to your account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Enter your credentials to continue
      </Typography>

      <Stack spacing={2}>
        <TextField
          {...register('email')}
          label="Email address"
          type="email"
          fullWidth
          autoComplete="email"
          autoFocus
          error={!!errors.email}
          helperText={errors.email?.message}
        />
        <TextField
          {...register('password')}
          label="Password"
          type="password"
          fullWidth
          autoComplete="current-password"
          error={!!errors.password}
          helperText={errors.password?.message}
        />
        <TextField
          {...register('tenantSlug')}
          label="Tenant slug (optional)"
          fullWidth
          autoComplete="off"
        />
        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} color="inherit" /> : undefined}
        >
          {isLoading ? 'Signing in…' : 'Sign in'}
        </Button>
      </Stack>

      <Box sx={{ mt: 2.5, textAlign: 'center' }}>
        <Link component={RouterLink} to="/forgot-password" variant="body2">
          Forgot your password?
        </Link>
      </Box>
    </Box>
  );
}
