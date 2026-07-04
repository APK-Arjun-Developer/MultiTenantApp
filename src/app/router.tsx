/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { DashboardLayout } from '@/shared/layouts/DashboardLayout';
import { AuthGuard } from '@/shared/components/AuthGuard';
import { SystemAdminGuard } from '@/shared/components/SystemAdminGuard';
import { TenantAdminGuard } from '@/shared/components/TenantAdminGuard';
import { ErrorPage } from '@/shared/components/ErrorPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const InvitationPage = lazy(() =>
  import('@/pages/InvitationPage').then((m) => ({ default: m.InvitationPage })),
);
const AccountSetupPage = lazy(() =>
  import('@/pages/AccountSetupPage').then((m) => ({ default: m.AccountSetupPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const UsersPage = lazy(() => import('@/pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const RolesPage = lazy(() => import('@/pages/RolesPage').then((m) => ({ default: m.RolesPage })));
const TenantsPage = lazy(() =>
  import('@/pages/TenantsPage').then((m) => ({ default: m.TenantsPage })),
);
const TenantAdminsPage = lazy(() =>
  import('@/pages/TenantAdminsPage').then((m) => ({ default: m.TenantAdminsPage })),
);
const ProfilePage = lazy(() =>
  import('@/pages/ProfilePage').then((m) => ({ default: m.ProfilePage })),
);

export const router = createBrowserRouter([
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
            ],
          },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
