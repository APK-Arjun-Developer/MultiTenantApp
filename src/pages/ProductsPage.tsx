import { useMemo, useState } from 'react';
import { z } from 'zod';
import type { ColumnDef } from '@tanstack/react-table';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import InventoryIcon from '@mui/icons-material/Inventory2';
import SearchIcon from '@mui/icons-material/Search';
import { FormBuilder, FIELD_TYPE, type FieldConfig } from 'mui-schema-form-builder';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { TenantContextGuard } from '@/shared/components/TenantContextGuard';
import { useDebounce } from '@/shared/hooks';
import { useSnackbar } from '@/shared/hooks/useSnackbar';
import { usePermission } from '@/shared/hooks/usePermission';
import {
  useGetProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '@/features/products/api/productsApi';
import type { ProductDto, ApiError } from '@/types/api';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const priceRule = z.coerce.number().min(0, 'Price must be 0 or greater');

const createSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  price: priceRule,
});
type CreateValues = z.infer<typeof createSchema>;

const editSchema = z.object({
  name: z.string().min(1, 'Product name is required').max(200),
  price: priceRule,
});
type EditValues = z.infer<typeof editSchema>;

// ─── Create dialog ────────────────────────────────────────────────────────────

const createFields: FieldConfig[] = [
  {
    name: 'name',
    label: 'Product name',
    type: FIELD_TYPE.TEXT,
    required: true,
  },
  {
    name: 'price',
    label: 'Price',
    type: FIELD_TYPE.NUMBER,
    required: true,
    muiProps: { inputProps: { min: 0, step: 0.01 } },
  },
];

interface CreateProductDialogProps {
  open: boolean;
  onClose: () => void;
}

function CreateProductDialog({ open, onClose }: CreateProductDialogProps) {
  const [createProduct] = useCreateProductMutation();
  const snackbar = useSnackbar();

  const onSubmit = async (values: CreateValues) => {
    try {
      const result = await createProduct({ name: values.name, price: values.price }).unwrap();
      snackbar.success(`Product "${result.name}" created.`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to create product.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Product</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={open ? 'open' : 'closed'}
          schema={createSchema}
          fields={createFields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Create product"
          cancelText="Cancel"
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Edit dialog ──────────────────────────────────────────────────────────────

interface EditProductDialogProps {
  open: boolean;
  onClose: () => void;
  product: ProductDto | null;
}

function EditProductDialog({ open, onClose, product }: EditProductDialogProps) {
  const [updateProduct] = useUpdateProductMutation();
  const snackbar = useSnackbar();

  const fields = useMemo<FieldConfig[]>(
    () => [
      {
        name: 'name',
        label: 'Product name',
        type: FIELD_TYPE.TEXT,
        required: true,
        defaultValue: product?.name ?? '',
      },
      {
        name: 'price',
        label: 'Price',
        type: FIELD_TYPE.NUMBER,
        required: true,
        defaultValue: product?.price ?? 0,
        muiProps: { inputProps: { min: 0, step: 0.01 } },
      },
    ],
    [product],
  );

  const onSubmit = async (values: EditValues) => {
    if (!product) return;
    try {
      const result = await updateProduct({
        name: product.name,
        newName: values.name !== product.name ? values.name : undefined,
        price: values.price,
      }).unwrap();
      snackbar.success(`Product "${result.name}" updated.`);
      onClose();
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to update product.');
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Product</DialogTitle>
      <DialogContent>
        <FormBuilder
          key={product?.id}
          schema={editSchema}
          fields={fields}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitText="Save changes"
          cancelText="Cancel"
          sx={{ boxShadow: 'none', p: 0, bgcolor: 'transparent' }}
        />
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const formatPrice = (price: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);

export function ProductsPage() {
  const snackbar = useSnackbar();

  const canCreate = usePermission('Products.Create');
  const canEdit = usePermission('Products.Edit');
  const canDelete = usePermission('Products.Delete');

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const [page, setPage] = useState(1);

  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductDto | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | null>(null);

  const { data, isLoading } = useGetProductsQuery({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
  });

  const [deleteProduct] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.name).unwrap();
      snackbar.success(`Product "${deleteTarget.name}" deleted.`);
    } catch (err) {
      snackbar.error((err as ApiError).message || 'Failed to delete product.');
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = useMemo<ColumnDef<ProductDto>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        cell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {row.original.name}
          </Typography>
        ),
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: ({ row }) => (
          <Typography variant="body2">{formatPrice(row.original.price)}</Typography>
        ),
      },
      {
        header: 'Created',
        accessorKey: 'createdAt',
        cell: ({ row }) => (
          <Typography variant="body2" color="text.secondary">
            {new Date(row.original.createdAt).toLocaleDateString()}
          </Typography>
        ),
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {canEdit && (
              <Tooltip title="Edit">
                <IconButton size="small" onClick={() => setEditProduct(row.original)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {canDelete && (
              <Tooltip title="Delete">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeleteTarget(row.original)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        ),
      },
    ],
    [canEdit, canDelete, setEditProduct, setDeleteTarget],
  );

  return (
    <TenantContextGuard>
      <Box>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <InventoryIcon color="primary" />
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              Products
            </Typography>
          </Box>
          {canCreate && (
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Create product
            </Button>
          )}
        </Box>

        {/* Search */}
        <Box sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search products…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{ width: 280 }}
          />
        </Box>

        <DataTable
          columns={columns}
          data={data?.items ?? []}
          isLoading={isLoading}
          page={page}
          pageSize={20}
          totalCount={data?.totalCount ?? 0}
          onPageChange={setPage}
        />

        <CreateProductDialog open={createOpen} onClose={() => setCreateOpen(false)} />

        <EditProductDialog
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
          product={editProduct}
        />

        <ConfirmDialog
          open={!!deleteTarget}
          title={`Delete "${deleteTarget?.name}"?`}
          description="This product will be permanently removed."
          confirmLabel="Delete"
          danger
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      </Box>
    </TenantContextGuard>
  );
}
