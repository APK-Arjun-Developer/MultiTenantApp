import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';

/** Allows only system admins (no tenantSlug in JWT). Tenant users are sent to /dashboard. */
export function SystemAdminGuard() {
  const user = useAppSelector(selectCurrentUser);
  return !user?.tenantSlug ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
