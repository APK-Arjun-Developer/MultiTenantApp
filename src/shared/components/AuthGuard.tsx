import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated } from '@/features/auth/slices/authSlice';
import { useGetMeQuery } from '@/features/auth/api/authApi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export function AuthGuard() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Verifies session and populates user + permissions via onQueryStarted.
  // Children don't render until isLoading is false, so permissions are set
  // before any page component mounts.
  const { isLoading } = useGetMeQuery(undefined, { skip: !isAuthenticated });

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (isLoading) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return <Outlet />;
}
