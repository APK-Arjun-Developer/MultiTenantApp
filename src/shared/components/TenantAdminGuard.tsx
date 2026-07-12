import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@/app/hooks';
import { selectCurrentUser } from '@/features/auth/slices/authSlice';

/** Allows TenantAdmin and SystemAdmin. TenantUsers are sent to /dashboard. */
export const TenantAdminGuard = React.memo(function TenantAdminGuard() {
  const user = useAppSelector(selectCurrentUser);
  const role = user?.systemRole;
  return role === 'TenantAdmin' || role === 'SystemAdmin' ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" replace />
  );
});
