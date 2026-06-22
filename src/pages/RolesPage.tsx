import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

export function RolesPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <AdminPanelSettingsIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Roles
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        Roles &amp; permissions management coming soon.
      </Typography>
    </Box>
  );
}
