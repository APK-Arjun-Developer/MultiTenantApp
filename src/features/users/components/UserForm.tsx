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
import { useCreateUserMutation, useUpdateUserMutation } from '../api/usersApi';
import type { UserDto, ApiError } from '@/types/api';

const createSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  roleName: z.string().optional(),
});

const editSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  roleName: z.string().optional(),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 6, {
      message: 'Password must be at least 6 characters',
    }),
});

type CreateValues = z.infer<typeof createSchema>;
type EditValues = z.infer<typeof editSchema>;

interface UserFormProps {
  open: boolean;
  onClose: () => void;
  user?: UserDto;
}

export function UserForm({ open, onClose, user }: UserFormProps) {
  const isEdit = Boolean(user);
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const isLoading = isCreating || isUpdating;

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
        user
          ? { fullName: user.fullName, roleName: user.roleName ?? '', password: '' }
          : { fullName: '', email: '', password: '', roleName: '' },
      );
    }
  }, [open, user, reset]);

  const onSubmit = async (values: CreateValues | EditValues) => {
    try {
      if (isEdit && user) {
        const { fullName, roleName, password } = values as EditValues;
        await updateUser({
          email: user.email,
          fullName,
          roleName: roleName || undefined,
          password: password || undefined,
        }).unwrap();
        toast.success('User updated');
      } else {
        const { fullName, email, password, roleName } = values as CreateValues;
        await createUser({ fullName, email, password, roleName: roleName || undefined }).unwrap();
        toast.success('User created');
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
      slotProps={{ paper: { sx: { width: 440 } } }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {isEdit ? 'Edit User' : 'Create User'}
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
        <Stack spacing={2.5}>
          {isEdit && (
            <TextField
              label="Email address"
              value={user?.email}
              disabled
              fullWidth
              helperText="Email cannot be changed"
            />
          )}
          <TextField
            {...register('fullName')}
            label="Full name"
            fullWidth
            error={!!errors.fullName}
            helperText={errors.fullName?.message}
          />
          {!isEdit && (
            <TextField
              {...register('email' as keyof CreateValues)}
              label="Email address"
              type="email"
              fullWidth
              error={!!('email' in errors && errors.email)}
              helperText={'email' in errors ? errors.email?.message : undefined}
            />
          )}
          <TextField
            {...register('password')}
            label={isEdit ? 'New password (leave blank to keep current)' : 'Password'}
            type="password"
            fullWidth
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            {...register('roleName')}
            label="Role name"
            fullWidth
            error={!!errors.roleName}
            helperText={errors.roleName?.message ?? 'Leave blank for default role'}
          />
        </Stack>
      </Box>

      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          form="user-form"
          disabled={isLoading}
          onClick={handleSubmit(onSubmit)}
          startIcon={isLoading ? <CircularProgress size={14} color="inherit" /> : undefined}
        >
          {isEdit ? 'Save changes' : 'Create user'}
        </Button>
      </Box>
    </Drawer>
  );
}
