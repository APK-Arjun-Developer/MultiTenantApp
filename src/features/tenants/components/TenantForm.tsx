import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { useOnboardTenantMutation, useUpdateTenantMutation } from '../api/tenantsApi';
import type { TenantDto, ApiError } from '@/types/api';

const createSchema = z.object({
  tenantName: z.string().min(1, 'Tenant name is required'),
  tenantSlug: z
    .string()
    .min(1, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Only lowercase letters, numbers, and hyphens'),
  adminFullName: z.string().min(1, 'Admin full name is required'),
  adminEmail: z.string().email('Invalid email address'),
  adminPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

interface TenantFormProps {
  open: boolean;
  onClose: () => void;
  tenant?: TenantDto;
}

export function TenantForm({ open, onClose, tenant }: TenantFormProps) {
  const isEdit = Boolean(tenant);
  const [onboardTenant, { isLoading: isOnboarding }] = useOnboardTenantMutation();
  const [updateTenant, { isLoading: isUpdating }] = useUpdateTenantMutation();
  const isLoading = isOnboarding || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateValues | EditValues>({
    resolver: zodResolver(isEdit ? editSchema : createSchema),
  });

  useEffect(() => {
    if (open) {
      reset(
        tenant
          ? { name: tenant.name }
          : {
              tenantName: '',
              tenantSlug: '',
              adminFullName: '',
              adminEmail: '',
              adminPassword: '',
            },
      );
    }
  }, [open, tenant, reset]);

  const onSubmit = async (values: CreateValues | EditValues) => {
    try {
      if (isEdit && tenant) {
        const { name } = values as EditValues;
        await updateTenant({ slug: tenant.slug, name }).unwrap();
        toast.success('Tenant updated');
      } else {
        const v = values as CreateValues;
        await onboardTenant({
          tenant: { name: v.tenantName, slug: v.tenantSlug },
          user: { fullName: v.adminFullName, email: v.adminEmail, password: v.adminPassword },
        }).unwrap();
        toast.success('Tenant onboarded');
      }
      onClose();
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'An error occurred');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: 480 } } }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEdit ? 'Edit Tenant' : 'Onboard Tenant'}
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Toolbar>

      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit)}
        sx={{ flex: 1, overflow: 'auto', p: 3 }}
        noValidate
      >
        {isEdit ? (
          <Stack spacing={2.5}>
            <TextField
              {...register('name' as keyof EditValues)}
              label="Tenant name"
              fullWidth
              autoFocus
              error={!!('name' in errors && errors.name)}
              helperText={'name' in errors ? errors.name?.message : undefined}
            />
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Tenant details
            </Typography>
            <TextField
              {...register('tenantName' as keyof CreateValues)}
              label="Tenant name"
              fullWidth
              autoFocus
              error={!!('tenantName' in errors && errors.tenantName)}
              helperText={'tenantName' in errors ? errors.tenantName?.message : undefined}
            />
            <TextField
              {...register('tenantSlug' as keyof CreateValues)}
              label="Slug (e.g. acme-corp)"
              fullWidth
              error={!!('tenantSlug' in errors && errors.tenantSlug)}
              helperText={'tenantSlug' in errors ? errors.tenantSlug?.message : undefined}
            />
            <Divider />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Admin user
            </Typography>
            <TextField
              {...register('adminFullName' as keyof CreateValues)}
              label="Admin full name"
              fullWidth
              error={!!('adminFullName' in errors && errors.adminFullName)}
              helperText={'adminFullName' in errors ? errors.adminFullName?.message : undefined}
            />
            <TextField
              {...register('adminEmail' as keyof CreateValues)}
              label="Admin email"
              type="email"
              fullWidth
              error={!!('adminEmail' in errors && errors.adminEmail)}
              helperText={'adminEmail' in errors ? errors.adminEmail?.message : undefined}
            />
            <TextField
              {...register('adminPassword' as keyof CreateValues)}
              label="Admin password"
              type="password"
              fullWidth
              error={!!('adminPassword' in errors && errors.adminPassword)}
              helperText={'adminPassword' in errors ? errors.adminPassword?.message : undefined}
            />
          </Stack>
        )}
      </Box>

      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={isLoading}
          onClick={handleSubmit(onSubmit)}
          startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {isEdit ? 'Save changes' : 'Onboard tenant'}
        </Button>
      </Box>
    </Drawer>
  );
}
