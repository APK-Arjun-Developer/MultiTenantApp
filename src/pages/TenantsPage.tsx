import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import BusinessIcon from '@mui/icons-material/Business';

export function TenantsPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <BusinessIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Tenants
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Tenant management coming soon.
      </Typography>
    </Box>
  );
}
