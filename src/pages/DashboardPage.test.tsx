import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { envelope, http, server } from '@/__tests__/msw/server';
import {
  renderWithProviders,
  signedInState,
  testUser,
} from '@/__tests__/utils/renderWithProviders';
import type { AuthUser, DashboardStatsDto } from '@/types/api';

import DashboardPage from './DashboardPage';

const stats: DashboardStatsDto = {
  totalTenants: 7,
  totalTenantAdmins: 9,
  totalTenantUsers: 42,
  totalRoles: 5,
  totalPendingInvitations: 3,
  freePlanTenants: 4,
  proPlanTenants: 3,
  acceptedInvitations: 10,
  expiredInvitations: 2,
  revokedInvitations: 1,
};

const renderAs = (user: Partial<AuthUser>) =>
  renderWithProviders(<DashboardPage />, {
    preloadedState: signedInState([], { ...testUser, ...user }),
  });

const mockStats = () => server.use(http.get('/api/v1/dashboard/stats', () => envelope(stats)));

describe('DashboardPage', () => {
  it('shows platform totals and the plan chart to a system admin', async () => {
    mockStats();
    renderAs({ systemRole: 'SystemAdmin' });

    expect(screen.getByText('Welcome back, Acme Admin.')).toBeInTheDocument();
    expect(await screen.findByText('7')).toBeInTheDocument();
    expect(screen.getByText('Tenants')).toBeInTheDocument();
    expect(screen.getByText('9')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
    expect(screen.getByText('Plan Distribution')).toBeInTheDocument();
  });

  it('shows tenant totals and the invitation chart to a tenant admin', async () => {
    mockStats();
    renderAs({ systemRole: 'TenantAdmin' });

    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Pending Invitations')).toBeInTheDocument();
    expect(screen.getByText('Invitation Overview')).toBeInTheDocument();
  });

  it('shows a regular user their own profile and roles', () => {
    renderAs({ systemRole: 'TenantUser', roles: ['Support', 'Billing'] });

    expect(screen.getByText('Your profile')).toBeInTheDocument();
    expect(screen.getByText('admin@acme.com')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
    expect(screen.getByText('Billing')).toBeInTheDocument();
  });

  it('greets without a name and hides empty roles', () => {
    renderAs({ systemRole: 'TenantUser', fullName: '', roles: [] });

    expect(screen.getByText('Welcome back.')).toBeInTheDocument();
    expect(screen.queryByText('Roles')).not.toBeInTheDocument();
  });

  it('shows 0 for stats the API leaves empty', async () => {
    server.use(
      http.get('/api/v1/dashboard/stats', () =>
        envelope({ ...stats, totalRoles: null, totalPendingInvitations: null }),
      ),
    );
    renderAs({ systemRole: 'TenantAdmin' });

    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getAllByText('0')).toHaveLength(2);
  });
});
