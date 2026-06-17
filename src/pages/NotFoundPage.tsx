import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: 'background.default',
      }}
    >
      <Typography
        variant="h1"
        sx={{ fontWeight: 700, color: 'primary.main', fontSize: { xs: '5rem', sm: '8rem' } }}
      >
        404
      </Typography>
      <Typography variant="h5" color="text.secondary">
        Page not found
      </Typography>
      <Button component={Link} to="/dashboard" variant="contained" sx={{ mt: 2 }}>
        Go to Dashboard
      </Button>
    </Box>
  );
}
