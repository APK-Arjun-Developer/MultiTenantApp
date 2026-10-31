import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { envelope, http, server, unreachable } from '@/__tests__/msw/server';
import {
  renderWithProviders,
  signedInState,
  testUser,
} from '@/__tests__/utils/renderWithProviders';
import type { ActivityLogDto } from '@/types/api';

import AuditLogsPage from './AuditLogsPage';

const LOGS_URL = '/api/v1/activity-logs';

const log: ActivityLogDto = {
  id: '10000000-0000-0000-0000-000000000001',
  tenantId: '20000000-0000-0000-0000-000000000001',
  userId: testUser.id,
  userDisplayName: 'Acme Admin',
  userEmail: 'admin@acme.com',
  action: 'Create',
  module: 'Users',
  description: 'Created user jane@acme.com',
  ipAddress: '10.0.0.1',
  createdAt: '2026-10-01T10:00:00Z',
};

const page = (items: ActivityLogDto[]) => ({
  items,
  page: 1,
  pageSize: 20,
  totalCount: items.length,
  totalPages: 1,
});

describe('AuditLogsPage', () => {
  it('lists activity logs from the API', async () => {
    server.use(http.get(LOGS_URL, () => envelope(page([log]))));

    renderWithProviders(<AuditLogsPage />, { preloadedState: signedInState() });

    expect(await screen.findByText('Created user jane@acme.com')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeEnabled();
  });

  it('disables export when there are no logs', async () => {
    server.use(http.get(LOGS_URL, () => envelope(page([]))));

    renderWithProviders(<AuditLogsPage />, { preloadedState: signedInState() });

    expect(await screen.findByText('No records found')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Export CSV' })).toBeDisabled();
  });

  it('shows an error with Retry when the API is down, and recovers on retry', async () => {
    // Handlers added later take precedence: the first call fails once, then the API recovers.
    server.use(http.get(LOGS_URL, () => envelope(page([log]))));
    server.use(http.get(LOGS_URL, unreachable, { once: true }));

    const { user } = renderWithProviders(<AuditLogsPage />, { preloadedState: signedInState() });

    await user.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Created user jane@acme.com')).toBeInTheDocument();
  });

  it('asks a SystemAdmin to pick a tenant before loading anything', () => {
    renderWithProviders(<AuditLogsPage />, {
      preloadedState: signedInState([], { ...testUser, systemRole: 'SystemAdmin' }),
    });

    expect(screen.getByRole('heading', { name: 'No tenant selected' })).toBeInTheDocument();
  });
});
