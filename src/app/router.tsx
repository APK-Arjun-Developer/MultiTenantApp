/* eslint-disable react-refresh/only-export-components */
import { lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '@/shared/layouts/AuthLayout';
import { DashboardLayout } from '@/shared/layouts/DashboardLayout';
import { AuthGuard } from '@/shared/components/AuthGuard';
import { NotFoundPage } from '@/pages/NotFoundPage';

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const ForgotPasswordPage = lazy(() =>
  import('@/pages/ForgotPasswordPage').then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import('@/pages/ResetPasswordPage').then((m) => ({ default: m.ResetPasswordPage })),
);
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const TenantsPage = lazy(() =>
  import('@/pages/TenantsPage').then((m) => ({ default: m.TenantsPage })),
);
const UsersPage = lazy(() => import('@/pages/UsersPage').then((m) => ({ default: m.UsersPage })));
const RolesPage = lazy(() => import('@/pages/RolesPage').then((m) => ({ default: m.RolesPage })));
const ProductsPage = lazy(() =>
  import('@/pages/ProductsPage').then((m) => ({ default: m.ProductsPage })),
);
const ReportsPage = lazy(() =>
  import('@/pages/ReportsPage').then((m) => ({ default: m.ReportsPage })),
);

export const router = createBrowserRouter([
  // Public auth routes — no guard, centered card layout
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
    ],
  },
  // Protected routes — AuthGuard redirects unauthenticated to /login
  {
    element: <AuthGuard />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: '/', element: <Navigate to="/dashboard" replace /> },
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/tenants', element: <TenantsPage /> },
          { path: '/users', element: <UsersPage /> },
          { path: '/roles', element: <RolesPage /> },
          { path: '/products', element: <ProductsPage /> },
          { path: '/reports', element: <ReportsPage /> },
        ],
      },
    ],
  },
  // Catch-all 404
  { path: '*', element: <NotFoundPage /> },
]);
