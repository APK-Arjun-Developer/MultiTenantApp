import { screen, waitFor, within } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { apiError, envelope, http, server } from '@/__tests__/msw/server';
import { capture, paged } from '@/__tests__/utils/api';
import { renderApp, signedInState, testUser } from '@/__tests__/utils/renderWithProviders';
import type { AuthUser, SystemRole } from '@/types/api';

const stats = {
  totalTenants: 2,
  totalTenantAdmins: 2,
  totalTenantUsers: 5,
  totalRoles: 1,
  totalPendingInvitations: 0,
  freePlanTenants: 1,
  proPlanTenants: 1,
  acceptedInvitations: 0,
  expiredInvitations: 0,
  revokedInvitations: 0,
};

interface SessionOptions {
  systemRole?: SystemRole;
  permissions?: string[];
  impersonatedBy?: AuthUser['impersonatedBy'];
}

/** Mocks a verified session (+ the layout's own queries) for a signed-in user. */
const signIn = ({
  systemRole = 'TenantAdmin',
  permissions = [],
  impersonatedBy = null,
}: SessionOptions = {}) => {
  const user = { ...testUser, systemRole };
  server.use(
    http.get('/api/v1/auth/me', () => envelope({ ...user, permissions, impersonatedBy })),
    http.get('/api/v1/users/current', () =>
      envelope({
        ...user,
        tenantId: 't1',
        isActive: true,
        createdVia: 'Direct',
        hasPendingSetup: false,
      }),
    ),
    http.get('/api/v1/dashboard/stats', () => envelope(stats)),
    http.get('/api/v1/tenants', () =>
      envelope(
        paged([
          { id: 't1', name: 'Acme', isActive: true, createdVia: 'Direct' },
          { id: 't2', name: 'Globex', isActive: true, createdVia: 'Direct' },
        ]),
      ),
    ),
  );
  return signedInState(permissions, user);
};

const nav = () => screen.getAllByRole('navigation')[0];

// Routes lazy-load their pages. Import them up front so a cold import (e.g. the dashboard's
// recharts) under a busy parallel run can't eat into a test's findBy timeout.
beforeAll(async () => {
  await Promise.all([
    import('@/pages/LoginPage'),
    import('@/pages/ForgotPasswordPage'),
    import('@/pages/ResetPasswordPage'),
    import('@/pages/InvitationPage'),
    import('@/pages/AccountSetupPage'),
    import('@/pages/DashboardPage'),
    import('@/pages/UsersPage'),
    import('@/pages/RolesPage'),
    import('@/pages/TenantsPage'),
    import('@/pages/TenantAdminsPage'),
    import('@/pages/ProfilePage'),
    import('@/pages/AuditLogsPage'),
    import('@/pages/SettingsPage'),
    import('@/pages/EmailBroadcastPage'),
  ]);
}, 60_000);

describe('app routes', () => {
  it('sends signed-out visitors to the login page', async () => {
    const { router } = renderApp('/');

    expect(await screen.findByText('Sign in to your account')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
    await waitFor(() => expect(document.title).toBe('Sign In | MultiTenant Admin'));
  });

  it('shows a not-found page for unknown URLs', async () => {
    renderApp('/no-such-page');

    expect(await screen.findByText('404')).toBeInTheDocument();
  });

  it('opens the dashboard with the page title and role-based navigation', async () => {
    const state = signIn({ permissions: ['Users.View', 'Roles.View'] });
    const { router } = renderApp('/', { preloadedState: state });

    expect(await screen.findByText('Welcome back, Acme Admin.')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/dashboard');
    expect(within(screen.getByRole('banner')).getByText('Dashboard')).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe('Dashboard | MultiTenant Admin'));

    const links = within(nav())
      .getAllByRole('link')
      .map((a) => a.textContent);
    expect(links).toEqual(expect.arrayContaining(['Dashboard', 'Roles', 'Users', 'Settings']));
    expect(links).not.toContain('Tenants');
    expect(links).not.toContain('Email Broadcast');
  });

  it('keeps tenant users out of admin pages', async () => {
    const state = signIn({ systemRole: 'TenantUser' });
    const { router } = renderApp('/users', { preloadedState: state });

    expect(await screen.findByText('Your profile')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('keeps tenant admins out of system admin pages', async () => {
    const state = signIn({ systemRole: 'TenantAdmin' });
    const { router } = renderApp('/tenants', { preloadedState: state });

    await screen.findByText('Welcome back, Acme Admin.');
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('lets a system admin pick the tenant to work in', async () => {
    const state = signIn({ systemRole: 'SystemAdmin' });
    server.use(
      http.get('/api/v1/tenants/:id/config', () =>
        envelope({
          tenantId: 't2',
          loginEnabled: true,
          welcomeEmailEnabled: true,
          maintenanceMode: false,
        }),
      ),
    );
    const { user, store } = renderApp('/settings?tab=configuration', { preloadedState: state });

    expect(await screen.findByText(/Select a tenant from the picker/)).toBeInTheDocument();
    await user.click(within(screen.getByRole('banner')).getByRole('combobox'));
    await user.click(await screen.findByRole('option', { name: 'Globex' }));

    expect(store.getState().ui.selectedTenantId).toBe('t2');
    expect(await screen.findByRole('switch', { name: 'Maintenance mode' })).toBeInTheDocument();
  });

  it('toggles the theme and collapses the sidebar', async () => {
    const state = signIn();
    const { user, store } = renderApp('/dashboard', { preloadedState: state });
    await screen.findByText('Welcome back, Acme Admin.');

    await user.click(screen.getByRole('button', { name: 'Dark mode' }));
    expect(store.getState().ui.themeMode).toBe('dark');
    expect(screen.getByRole('button', { name: 'Light mode' })).toBeInTheDocument();

    await user.click(screen.getAllByRole('button', { name: 'Collapse' })[0]);
    expect(screen.getAllByRole('button', { name: 'Expand' }).length).toBeGreaterThan(0);
  });

  it('opens the mobile navigation and closes it on navigation', async () => {
    const state = signIn({ permissions: ['Roles.View', 'Roles.List'] });
    server.use(
      http.get('/api/v1/roles', () => envelope(paged([]))),
      http.get('/api/v1/permissions', () => envelope({ items: [], byModule: [] })),
    );
    const { user, router } = renderApp('/dashboard', { preloadedState: state });
    await screen.findByText('Welcome back, Acme Admin.');

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const drawer = await screen.findByRole('presentation');
    await user.click(within(drawer).getByRole('link', { name: 'Roles' }));

    await waitFor(() => expect(router.state.location.pathname).toBe('/roles'));
  });

  describe('impersonation banner', () => {
    const admin = { id: 'sa', email: 'root@platform.com', fullName: 'Root Admin' };

    it('shows who is impersonated and ends the session', async () => {
      const state = signIn({ impersonatedBy: admin });
      capture('post', '/api/v1/impersonation/stop', {});
      const { user } = renderApp('/dashboard', { preloadedState: state });

      expect(await screen.findByText(/Impersonating/)).toBeInTheDocument();
      expect(screen.getByText('Root Admin')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Stop Impersonation' }));

      expect(
        await screen.findByText('Impersonation ended. Back to admin session.'),
      ).toBeInTheDocument();
    });

    it('reports a failure to stop', async () => {
      const state = signIn({ impersonatedBy: admin });
      server.use(http.post('/api/v1/impersonation/stop', () => apiError(500, '')));
      const { user } = renderApp('/dashboard', { preloadedState: state });

      await user.click(await screen.findByRole('button', { name: 'Stop Impersonation' }));

      expect(await screen.findByText('Failed to stop impersonation.')).toBeInTheDocument();
    });
  });

  describe('every route loads its page', () => {
    it.each([
      ['/forgot-password', 'Reset your password'],
      ['/reset-password', 'No reset token found in the link.'],
      ['/invitation/accept', 'No invitation token found in the link.'],
      ['/account-setup', 'No setup token found in the link.'],
    ])('public route %s', async (url, text) => {
      renderApp(url);

      expect(await screen.findByText(text)).toBeInTheDocument();
    });

    it.each([
      ['/profile', 'Sign out'],
      ['/tenants', 'New Tenant'],
      ['/tenant-admins', 'Create Admin'],
      ['/audit-logs', 'No tenant selected'],
      ['/email-broadcast', 'Send email'],
    ])('system admin route %s', async (url, text) => {
      // Catch-all first: the session mocks registered after it take precedence.
      server.use(http.get('/api/v1/:resource/*', () => envelope(paged([]))));
      const state = signIn({ systemRole: 'SystemAdmin' });

      renderApp(url, { preloadedState: state });

      expect(await screen.findByText(text)).toBeInTheDocument();
    });
  });
});
