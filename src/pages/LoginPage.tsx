import { Navigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated } from '@/features/auth/slices/authSlice';

export function LoginPage() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <Typography variant="body2" color="text.secondary" align="center">
      Login form — Phase 5
    </Typography>
  );
}
