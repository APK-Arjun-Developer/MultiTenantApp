import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

import NotFoundPage from '@/pages/NotFoundPage';
import { AuthGuard, ErrorPage, SystemAdminGuard, TenantAdminGuard } from '@/shared/components';
import { AuthLayout, DashboardLayout } from '@/shared/layouts';

const LoginPage = lazy(() => import('@/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'));
const InvitationPage = lazy(() => import('@/pages/InvitationPage'));
const AccountSetupPage = lazy(() => import('@/pages/AccountSetupPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const UsersPage = lazy(() => import('@/pages/UsersPage'));
const RolesPage = lazy(() => import('@/pages/RolesPage'));
const TenantsPage = lazy(() => import('@/pages/TenantsPage'));
const TenantAdminsPage = lazy(() => import('@/pages/TenantAdminsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AuditLogsPage = lazy(() => import('@/pages/AuditLogsPage'));

const router = createBrowserRouter([
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', handle: { title: 'Sign In' }, element: <LoginPage /> },
      {
        path: '/forgot-password',
        handle: { title: 'Forgot Password' },
        element: <ForgotPasswordPage />,
      },
      {
        path: '/reset-password',
        handle: { title: 'Reset Password' },
        element: <ResetPasswordPage />,
      },
      {
        path: '/invitation/accept',
        handle: { title: 'Accept Invitation' },
        element: <InvitationPage />,
      },
      { path: '/account-setup', handle: { title: 'Account Setup' }, element: <AccountSetupPage /> },
    ],
  },
  {
    element: <AuthGuard />,
    errorElement: <ErrorPage />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', handle: { title: 'Dashboard' }, element: <DashboardPage /> },
          { path: '/profile', handle: { title: 'Profile' }, element: <ProfilePage /> },

          // TenantAdmin or above — TenantUser redirected to /dashboard
          {
            element: <TenantAdminGuard />,
            children: [
              { path: '/users', handle: { title: 'Users' }, element: <UsersPage /> },
              { path: '/roles', handle: { title: 'Roles' }, element: <RolesPage /> },
            ],
          },

          // SystemAdmin only — others redirected to /dashboard
          {
            element: <SystemAdminGuard />,
            children: [
              { path: '/tenants', handle: { title: 'Tenants' }, element: <TenantsPage /> },
              {
                path: '/tenant-admins',
                handle: { title: 'Tenant Admins' },
                element: <TenantAdminsPage />,
              },
              { path: '/audit-logs', handle: { title: 'Audit Log' }, element: <AuditLogsPage /> },
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);

export default router;
