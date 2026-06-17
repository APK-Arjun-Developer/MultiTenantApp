import { useState, useMemo } from 'react';
import { type ColumnDef } from '@tanstack/react-table';
import toast from 'react-hot-toast';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { DataTable } from '@/shared/components/DataTable';
import { ConfirmDialog } from '@/shared/components/ConfirmDialog';
import { PageTransition } from '@/shared/components/PageTransition';
import { formatDate, formatCurrency } from '@/shared/utils/format';
import { ProductForm } from '../components/ProductForm';
import { useGetProductsQuery, useDeleteProductMutation } from '../api/productsApi';
import type { ProductDto, ApiError } from '@/types/api';

export function ProductsPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | undefined>();
  const [deleteTarget, setDeleteTarget] = useState<ProductDto | undefined>();

  const { data = [], isLoading } = useGetProductsQuery();
  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.name).unwrap();
      toast.success('Product deleted');
      setDeleteTarget(undefined);
    } catch (err) {
      const error = err as ApiError;
      toast.error(error.message || 'Failed to delete product');
    }
  };

  const columns = useMemo<ColumnDef<ProductDto>[]>(
    () => [
      { accessorKey: 'name', header: 'Name' },
      {
        accessorKey: 'price',
        header: 'Price',
        cell: ({ getValue }) => formatCurrency(getValue() as number),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={() => {
                  setSelectedProduct(row.original);
                  setDrawerOpen(true);
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={() => setDeleteTarget(row.original)}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [],
  );

  return (
    <PageTransition>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Products
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedProduct(undefined);
            setDrawerOpen(true);
          }}
        >
          Add Product
        </Button>
      </Box>

      <DataTable data={data} columns={columns} isLoading={isLoading} />

      <ProductForm
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false);
          setSelectedProduct(undefined);
        }}
        product={selectedProduct}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Product"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        danger
        loading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(undefined)}
      />
    </PageTransition>
  );
}
