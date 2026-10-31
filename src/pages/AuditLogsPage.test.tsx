import { fireEvent, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { envelope, http, server, unreachable } from '@/__tests__/msw/server';
import {
  renderWithProviders,
  signedInState,
  testUser,
} from '@/__tests__/utils/renderWithProviders';
import { exportToCsv } from '@/shared/utils/exportCsv';
import type { ActivityLogDto } from '@/types/api';

import AuditLogsPage from './AuditLogsPage';

vi.mock('@/shared/utils/exportCsv', () => ({ exportToCsv: vi.fn() }));

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

  describe('filters and export', () => {
    beforeEach(() => {
      vi.mocked(exportToCsv).mockClear();
    });

    const recordRequests = (items: ActivityLogDto[] = [log]) => {
      const requests: URL[] = [];
      server.use(
        http.get(LOGS_URL, ({ request }) => {
          requests.push(new URL(request.url));
          return envelope(page(items));
        }),
      );
      return requests;
    };

    it('filters by module and date range', async () => {
      const requests = recordRequests();
      const { user } = renderWithProviders(<AuditLogsPage />, { preloadedState: signedInState() });
      await screen.findByText('Created user jane@acme.com');

      await user.click(screen.getByRole('combobox', { name: 'Module' }));
      await user.click(await screen.findByRole('option', { name: 'Users' }));
      await waitFor(() => expect(requests.at(-1)?.searchParams.get('module')).toBe('Users'));

      fireEvent.change(screen.getByLabelText('From date'), { target: { value: '2026-10-01' } });
      fireEvent.change(screen.getByLabelText('To date'), { target: { value: '2026-10-31' } });
      await waitFor(() => {
        const last = requests.at(-1)?.searchParams;
        expect(last?.get('dateFrom')).toBe('2026-10-01');
        expect(last?.get('dateTo')).toBe('2026-10-31T23:59:59Z');
      });
    });

    it('sorts by time', async () => {
      const requests = recordRequests();
      const { user } = renderWithProviders(<AuditLogsPage />, { preloadedState: signedInState() });
      await screen.findByText('Created user jane@acme.com');

      await user.click(screen.getByRole('button', { name: 'Time' }));

      await waitFor(() => expect(requests.at(-1)?.searchParams.get('sortBy')).toBe('createdAt'));
    });

    it('exports the filtered logs to CSV', async () => {
      const unknownModule = {
        ...log,
        id: 'x2',
        module: 'Custom',
        description: 'Custom event',
        ipAddress: null,
      };
      recordRequests([log, unknownModule]);
      const { user } = renderWithProviders(<AuditLogsPage />, { preloadedState: signedInState() });
      await screen.findByText('Created user jane@acme.com');

      await user.click(screen.getByRole('button', { name: 'Export CSV' }));

      await waitFor(() => expect(exportToCsv).toHaveBeenCalledTimes(1));
      const [filename, rows] = vi.mocked(exportToCsv).mock.calls[0];
      expect(filename).toBe('audit-logs');
      expect(rows[0]).toMatchObject({ Module: 'Users', Action: 'Create', IP: '10.0.0.1' });
      expect(rows[1]).toMatchObject({ Module: 'Custom', IP: '' });
    });
  });
});
