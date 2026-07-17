import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAppSelector } from '@/app/hooks';
import { useGetMeQuery } from '@/features/auth/api/authApi';
import { selectIsAuthenticated } from '@/features/auth/slices/authSlice';

import { styles } from './AuthGuard.styles';

const AuthGuard = React.memo(() => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Verifies session and populates user + permissions via onQueryStarted.
  // Children don't render until isLoading is false, so permissions are set
  // before any page component mounts.
  const { isLoading } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  return <Outlet />;
});
export default AuthGuard;
