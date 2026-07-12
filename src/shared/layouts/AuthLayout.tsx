import { memo, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { usePageTitle } from '@/shared/hooks';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { styles } from './AuthLayout.styles';
import type {} from './AuthLayout.types';

const PageLoader = memo(function PageLoader() {
  return (
    <Box sx={styles.pageLoader}>
      <CircularProgress size={24} />
    </Box>
  );
});

export const AuthLayout = memo(function AuthLayout() {
  usePageTitle();

  return (
    <Box sx={styles.root}>
      <Box sx={styles.logoContainer}>
        <Box sx={styles.brandRow}>
          <Box sx={styles.brandMark}>M</Box>
          <Typography variant="h5" sx={styles.title}>
            MultiTenant
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={styles.subtitle}>
          Admin Portal
        </Typography>
      </Box>
      <Card sx={styles.card}>
        <CardContent sx={styles.cardContent}>
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </CardContent>
      </Card>
    </Box>
  );
});
