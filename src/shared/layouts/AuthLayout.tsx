import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { usePageTitle } from '@/shared/hooks';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

function PageLoader() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
      <CircularProgress size={24} />
    </Box>
  );
}

export function AuthLayout() {
  usePageTitle();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main' }}>
          MultiTenant
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Admin Portal
        </Typography>
      </Box>
      <Card sx={{ width: '100%', maxWidth: 440 }}>
        <CardContent sx={{ p: 4 }}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </CardContent>
      </Card>
    </Box>
  );
}
