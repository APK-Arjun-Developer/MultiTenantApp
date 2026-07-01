/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { DashboardLayout } from '@/shared/layouts/DashboardLayout';
import { AuthGuard } from '@/shared/components/AuthGuard';
import { TenantContextGuard } from '@/shared/components/TenantContextGuard';
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
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
      { path: '/invitation/accept', element: <InvitationPage /> },
      { path: '/account-setup', element: <AccountSetupPage /> },
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
          { path: '/dashboard', element: <DashboardPage /> },

          // Tenant-scoped pages — require a tenant selection for SystemAdmin
          {
            path: '/users',
            element: (
              <TenantContextGuard>
                <UsersPage />
              </TenantContextGuard>
            ),
          },
          {
            path: '/roles',
            element: (
              <TenantContextGuard>
                <RolesPage />
              </TenantContextGuard>
            ),
          },
          // Platform-level pages — no tenant context needed
          { path: '/tenants', element: <TenantsPage /> },
          { path: '/tenant-admins', element: <TenantAdminsPage /> },

          // User-scoped — accessible regardless of tenant selection
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
