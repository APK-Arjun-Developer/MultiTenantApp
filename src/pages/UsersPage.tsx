import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import PeopleIcon from '@mui/icons-material/People';

export function UsersPage() {
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
        <PeopleIcon color="primary" />
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Users
        </Typography>
      </Box>
      <Typography variant="body1" color="text.secondary">
        User management coming soon.
      </Typography>
    </Box>
  );
}
