import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated } from '@/features/auth/slices/authSlice';
import { useGetMeQuery } from '@/features/auth/api/authApi';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

export function AuthGuard() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  // Verify the session cookie is still valid on every cold load.
  // baseQueryWithReauth handles 401 → refresh; on double failure it dispatches logout().
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
