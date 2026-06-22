import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import InventoryIcon from '@mui/icons-material/Inventory2';

export function ProductsPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <InventoryIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Products
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Products management coming soon.
      </Typography>
    </Box>
  );
}
