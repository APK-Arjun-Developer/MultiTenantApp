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
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import { useCreateProductMutation, useUpdateProductMutation } from '../api/productsApi';
import type { ProductDto, ApiError } from '@/types/api';

const schema = z.object({
  name: z.string().min(1, 'Product name is required'),
  price: z.number().min(0, 'Price must be a positive number'),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormProps {
  open: boolean;
  onClose: () => void;
  product?: ProductDto;
}

export function ProductForm({ open, onClose, product }: ProductFormProps) {
  const isEdit = Boolean(product);
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
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
        name: product?.name ?? '',
        price: product?.price ?? 0,
      });
    }
  }, [open, product, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isEdit && product) {
        await updateProduct({
          name: product.name,
          newName: values.name !== product.name ? values.name : undefined,
          price: values.price,
        }).unwrap();
        toast.success('Product updated');
      } else {
        await createProduct({ name: values.name, price: values.price }).unwrap();
        toast.success('Product created');
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
          {isEdit ? 'Edit Product' : 'Create Product'}
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
            label="Product name"
            fullWidth
            autoFocus
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            {...register('price', { valueAsNumber: true })}
            label="Price"
            type="number"
            fullWidth
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              },
            }}
            error={!!errors.price}
            helperText={errors.price?.message}
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
          {isEdit ? 'Save changes' : 'Create product'}
        </Button>
      </Box>
    </Drawer>
  );
}
