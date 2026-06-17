import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectIsAuthenticated } from '@/features/auth/slices/authSlice';

export function AuthGuard() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}
