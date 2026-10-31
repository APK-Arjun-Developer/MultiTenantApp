import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { apiError, envelope, http, server } from '@/__tests__/msw/server';
import { capture, paged } from '@/__tests__/utils/api';
import { fillFields } from '@/__tests__/utils/forms';
import {
  renderWithProviders,
  signedInState,
  testUser,
} from '@/__tests__/utils/renderWithProviders';
import type { RootState } from '@/app/store';
import type { SystemRole } from '@/types/api';

import EmailBroadcastPage from './EmailBroadcastPage';

const BROADCAST = '/api/v1/emails/broadcast';

const stateFor = (
  systemRole: SystemRole,
  { selectedTenantId = null as string | null, permissions = ['Emails.Send'] } = {},
) =>
  ({
    ...signedInState(permissions, { ...testUser, systemRole }),
    ui: {
      themeMode: 'light',
      themeColor: 'violet',
      sidebarOpen: true,
      selectedTenantId,
      selectedTenantName: selectedTenantId ? 'Acme' : null,
    },
  }) as Partial<RootState>;

const renderPage = (state: Partial<RootState>) =>
  renderWithProviders(<EmailBroadcastPage />, { preloadedState: state });

type User = ReturnType<typeof renderPage>['user'];

const compose = (user: User) =>
  fillFields(user, { Subject: 'Hello', 'Email body (HTML supported)': '<p>Hi all</p>' });

const send = (user: User) => user.click(screen.getByRole('button', { name: 'Send email' }));

const sent = (message = 'Queued for 12 recipients.') => envelope({ recipientCount: 12, message });

describe('EmailBroadcastPage', () => {
  it('renders nothing without Emails.Send', () => {
    renderPage(stateFor('TenantAdmin', { permissions: ['Users.View'] }));

    expect(screen.queryByRole('button', { name: 'Send email' })).not.toBeInTheDocument();
  });

  describe('tenant admin', () => {
    it('emails everyone in the organization and resets the form', async () => {
      const bodies = capture('post', BROADCAST, { recipientCount: 12, message: 'Queued for 12.' });
      const { user } = renderPage(stateFor('TenantAdmin'));

      expect(screen.getByText('All users in my organization')).toBeInTheDocument();
      await compose(user);
      await send(user);

      expect(await screen.findByText('Queued for 12.')).toBeInTheDocument();
      expect(bodies).toEqual([
        { subject: 'Hello', htmlBody: '<p>Hi all</p>', targetType: 'CurrentTenant' },
      ]);
      await waitFor(() =>
        expect(screen.getByRole('textbox', { name: /^Subject/ })).toHaveValue(''),
      );
    });

    it('requires a subject and body', async () => {
      const { user } = renderPage(stateFor('TenantAdmin'));

      await send(user);

      expect(await screen.findByText('Subject is required')).toBeInTheDocument();
      expect(screen.getByText('Body is required')).toBeInTheDocument();
    });

    it('emails hand-picked users', async () => {
      server.use(
        http.get('/api/v1/users', () =>
          envelope(paged([{ id: 'u1', fullName: 'Jane Doe', email: 'jane@acme.com' }])),
        ),
      );
      const bodies = capture('post', BROADCAST, { recipientCount: 1, message: 'Queued for 1.' });
      const { user } = renderPage(stateFor('TenantAdmin'));

      await user.click(screen.getByRole('radio', { name: /Specific users/ }));
      await compose(user);
      await send(user);
      expect(await screen.findByText('Select at least one user.')).toBeInTheDocument();

      await user.click(screen.getByRole('combobox', { name: 'Select users' }));
      await user.click(await screen.findByRole('option', { name: /Jane Doe/ }));
      await send(user);

      expect(await screen.findByText('Queued for 1.')).toBeInTheDocument();
      expect(bodies[0]).toMatchObject({ targetType: 'SpecificUsers', userIds: ['u1'] });
    });

    it('shows the API error, or a fallback message', async () => {
      server.use(http.post(BROADCAST, () => apiError(429, 'Daily limit reached'), { once: true }));
      const { user } = renderPage(stateFor('TenantAdmin'));
      await compose(user);

      await send(user);
      expect(await screen.findByText('Daily limit reached')).toBeInTheDocument();

      server.use(http.post(BROADCAST, () => apiError(500, '')));
      await send(user);
      expect(await screen.findByText('Failed to send email broadcast.')).toBeInTheDocument();
    });
  });

  describe('system admin', () => {
    it('needs a selected tenant for "current tenant" and "specific users"', async () => {
      const { user } = renderPage(stateFor('SystemAdmin'));
      await compose(user);

      await send(user);
      expect(
        await screen.findByText('Select a tenant from the picker in the top bar.'),
      ).toBeInTheDocument();

      await user.click(screen.getByRole('radio', { name: /Specific users/ }));
      expect(
        screen.getByText('Select a tenant from the picker in the top bar to search users.'),
      ).toBeInTheDocument();
    });

    it('emails every tenant', async () => {
      const bodies = capture('post', BROADCAST, {
        recipientCount: 500,
        message: 'Queued for 500.',
      });
      const { user } = renderPage(stateFor('SystemAdmin'));

      await user.click(screen.getByRole('radio', { name: /Everyone/ }));
      await compose(user);
      await send(user);

      expect(await screen.findByText('Queued for 500.')).toBeInTheDocument();
      expect(bodies[0]).toMatchObject({ targetType: 'AllTenants' });
    });

    it('emails the selected tenants', async () => {
      server.use(
        http.get('/api/v1/tenants', () =>
          envelope(paged([{ id: 't2', name: 'Globex', isActive: true, createdVia: 'Direct' }])),
        ),
      );
      const bodies = capture('post', BROADCAST, { recipientCount: 40, message: 'Queued for 40.' });
      const { user } = renderPage(stateFor('SystemAdmin', { selectedTenantId: 't1' }));

      await user.click(screen.getByRole('radio', { name: /Selected tenants/ }));
      await compose(user);
      await send(user);
      expect(await screen.findByText('Select at least one tenant.')).toBeInTheDocument();

      await user.click(screen.getByRole('combobox', { name: 'Select tenants' }));
      await user.click(await screen.findByRole('option', { name: 'G Globex' }));
      await send(user);

      expect(await screen.findByText('Queued for 40.')).toBeInTheDocument();
      expect(bodies[0]).toMatchObject({ targetType: 'SpecificTenants', tenantIds: ['t2'] });
    });

    it('emails the current tenant once one is selected', async () => {
      server.use(http.post(BROADCAST, () => sent()));
      const { user } = renderPage(stateFor('SystemAdmin', { selectedTenantId: 't1' }));

      await compose(user);
      await send(user);

      expect(await screen.findByText('Queued for 12 recipients.')).toBeInTheDocument();
    });
  });
});
