import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

export function TenantAdminsPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <ManageAccountsIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Tenant Admins
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Tenant admin management coming soon.
      </Typography>
    </Box>
  );
}
