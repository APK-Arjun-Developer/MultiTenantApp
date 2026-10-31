import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

import { useAppSelector } from '@/app/hooks';
import { useGetMeQuery } from '@/features/auth/api/authApi';
import { selectIsAuthenticated } from '@/features/auth/slices/authSlice';
import { isNetworkError } from '@/shared/api/networkError';

import Icon from '../Icon';
import LoadingButton from '../LoadingButton';
import { styles } from './styles';

const AuthGuard = React.memo(() => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Verifies session and populates user + permissions via onQueryStarted.
  // Children don't render until isLoading is false, so permissions are set
  // before any page component mounts.
  const { isLoading, isFetching, error, refetch } = useGetMeQuery(undefined, {
    skip: !isAuthenticated,
  });

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <Box sx={styles.loadingContainer}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    const unreachable = isNetworkError(error);
    return (
      <Box sx={styles.errorContainer}>
        <Icon name="ErrorOutline" sx={styles.errorIcon} />
        <Typography variant="h6" sx={styles.errorTitle}>
          {unreachable ? 'Server unavailable' : "Couldn't load your session"}
        </Typography>
        <Typography variant="body2" sx={styles.errorMessage}>
          {unreachable
            ? 'We can’t reach the server right now. Check your connection or try again shortly.'
            : 'Something went wrong while loading your account. Please try again.'}
        </Typography>
        <LoadingButton variant="contained" loading={isFetching} onClick={refetch}>
          Retry
        </LoadingButton>
      </Box>
    );
  }

  return <Outlet />;
});
export default AuthGuard;
