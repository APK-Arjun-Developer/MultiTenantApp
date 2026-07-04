import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';

/** Allows only system admins. Tenant users are sent to /dashboard. */
export function SystemAdminGuard() {
  const user = useAppSelector(selectCurrentUser);
  return user?.systemRole === 'SystemAdmin' ? <Outlet /> : <Navigate to="/dashboard" replace />;
}
