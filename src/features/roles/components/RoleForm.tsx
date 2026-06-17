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
import { useCreateRoleMutation, useUpdateRoleMutation } from '../api/rolesApi';
import type { RoleDto, ApiError } from '@/types/api';

const schema = z.object({
  name: z.string().min(1, 'Role name is required'),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface RoleFormProps {
  open: boolean;
  onClose: () => void;
  role?: RoleDto;
}

export function RoleForm({ open, onClose, role }: RoleFormProps) {
  const isEdit = Boolean(role);
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const isLoading = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({
        name: role?.name ?? '',
        description: role?.description ?? '',
      });
    }
  }, [open, role, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && role) {
        await updateRole({
          name: role.name,
          body: {
            name: values.name,
            description: values.description || null,
            permissions: role.permissions.map((p) => p.id),
          },
        }).unwrap();
        toast.success('Role updated');
      } else {
        await createRole({
          name: values.name,
          description: values.description || null,
        }).unwrap();
        toast.success('Role created');
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
          {isEdit ? 'Edit Role' : 'Create Role'}
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
          <TextField
            {...register('name')}
            label="Role name"
            fullWidth
            autoFocus
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            {...register('description')}
            label="Description"
            fullWidth
            multiline
            rows={3}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        </Stack>
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
          {isEdit ? 'Save changes' : 'Create role'}
        </Button>
      </Box>
    </Drawer>
  );
}
