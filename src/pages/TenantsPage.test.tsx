import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiError, envelope, http, server } from '@/__tests__/msw/server';
import { capture, findRow, paged } from '@/__tests__/utils/api';
import { fillFields, validAddress, validAddressPayload } from '@/__tests__/utils/forms';
import {
  renderWithProviders,
  signedInState,
  testUser,
} from '@/__tests__/utils/renderWithProviders';
import { mockImageCanvas, uploadAndCrop } from '@/__tests__/utils/upload';
import type { TenantCreationInvitationDto, TenantDto } from '@/types/api';

import TenantsPage from './TenantsPage';

const TENANTS = '/api/v1/tenants';
const INVITATIONS = '/api/v1/tenants/invitations';

const ALL = [
  'Tenants.List',
  'Tenants.View',
  'Tenants.Create',
  'Tenants.Edit',
  'Tenants.Delete',
  'Subscriptions.Edit',
];

const acme: TenantDto = {
  id: 't1',
  name: 'Acme',
  isActive: true,
  createdVia: 'Direct',
  profileFileId: null,
  address: { line1: '1 Main St', city: 'Springfield', postalCode: '12345', country: 'USA' },
  adminEmail: 'admin@acme.com',
  planType: 'Pro',
};

const globex: TenantDto = {
  ...acme,
  id: 't2',
  name: 'Globex',
  isActive: false,
  createdVia: 'Invitation',
  profileFileId: 'logo-1',
  address: null,
  adminEmail: null,
  planType: 'Free',
};

const invitation = (
  overrides: Partial<TenantCreationInvitationDto>,
): TenantCreationInvitationDto => ({
  id: 'i1',
  email: 'owner@newco.com',
  status: 'Pending',
  expiresAt: '2026-12-01T00:00:00Z',
  isExpired: false,
  isAccepted: false,
  isRevoked: false,
  createdAt: '2026-10-01T00:00:00Z',
  ...overrides,
});

const mockApi = ({
  tenants = [acme, globex],
  invitations = [] as TenantCreationInvitationDto[],
} = {}) => {
  const listRequests: URL[] = [];
  server.use(
    http.get(TENANTS, ({ request }) => {
      listRequests.push(new URL(request.url));
      return envelope(paged(tenants));
    }),
    http.get(INVITATIONS, () => envelope(paged(invitations))),
    http.get('/api/v1/subscriptions/plans', () =>
      envelope([
        { planType: 'Free', name: 'Free', features: { maxUsers: 3 } },
        { planType: 'Pro', name: 'Pro', features: { maxUsers: -1 } },
      ]),
    ),
  );
  return listRequests;
};

const systemAdmin = { ...testUser, systemRole: 'SystemAdmin' as const };

/** SystemAdmin sees everything (usePermission is always true for it). */
const renderPage = (granted: string[] = ALL, route = '/tenants') =>
  renderWithProviders(<TenantsPage />, {
    route,
    preloadedState: signedInState(granted, systemAdmin),
  });

/** A non-SystemAdmin user, so permission gating applies. */
const renderAsLimited = (granted: string[], route = '/tenants') =>
  renderWithProviders(<TenantsPage />, { route, preloadedState: signedInState(granted, testUser) });

type User = ReturnType<typeof renderPage>['user'];

describe('TenantsPage', () => {
  describe('tenants tab', () => {
    it('lists tenants with admin email, plan and status', async () => {
      mockApi();
      renderPage();

      const acmeRow = await findRow('Acme');
      expect(within(acmeRow).getByText('admin@acme.com')).toBeInTheDocument();
      expect(within(acmeRow).getByText('Pro')).toBeInTheDocument();
      expect(within(acmeRow).getByText('Active')).toBeInTheDocument();

      const globexRow = await findRow('Globex');
      expect(within(globexRow).getByText('Free')).toBeInTheDocument();
      expect(within(globexRow).getByText('Inactive')).toBeInTheDocument();
    });

    it('explains when tenants or invitations may not be listed', async () => {
      mockApi();
      const { user } = renderAsLimited(['Tenants.View']);

      expect(
        await screen.findByText("You don't have permission to list tenants."),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('tab', { name: 'Invitations' }));
      expect(
        await screen.findByText("You don't have permission to list invitations."),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'New Tenant' })).not.toBeInTheDocument();
    });

    it('searches and sorts tenants', async () => {
      const requests = mockApi();
      const { user } = renderPage();
      await findRow('Acme');

      await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'acm');
      await waitFor(() => expect(requests.at(-1)?.searchParams.get('search')).toBe('acm'));

      await user.click(screen.getByRole('button', { name: 'Name' }));
      await waitFor(() => expect(requests.at(-1)?.searchParams.get('sortBy')).toBe('name'));
    });

    it('shows tenant details', async () => {
      mockApi();
      const { user } = renderPage();

      await user.click(within(await findRow('Acme')).getByRole('button', { name: 'View' }));

      const dialog = await screen.findByRole('dialog', { name: 'Tenant details' });
      expect(within(dialog).getByText('admin@acme.com')).toBeInTheDocument();
      expect(within(dialog).getByText(/1 Main St/)).toBeInTheDocument();
    });
  });

  describe('new tenant wizard', () => {
    const openWizard = async (user: User) => {
      await user.click(await screen.findByRole('button', { name: 'New Tenant' }));
      return screen.findByRole('dialog', { name: 'New Tenant' });
    };

    const completeWizard = async (user: User, dialog: HTMLElement) => {
      await fillFields(user, {
        'Full name': 'Ada Admin',
        'Email address': 'ada@newco.com',
        ...validAddress,
      });
      await user.click(within(dialog).getByRole('button', { name: 'Next' }));
      await fillFields(user, { 'Tenant name': 'NewCo', ...validAddress });
      await user.click(within(dialog).getByRole('button', { name: 'Create tenant' }));
    };

    it('onboards a tenant with its admin and both addresses', async () => {
      mockApi();
      const bodies = capture('post', TENANTS, { name: 'NewCo', adminEmail: 'ada@newco.com' });
      const { user } = renderPage();
      const dialog = await openWizard(user);

      await completeWizard(user, dialog);

      expect(
        await screen.findByText('Tenant "NewCo" created. Setup email sent to ada@newco.com.'),
      ).toBeInTheDocument();
      expect(bodies).toEqual([
        {
          tenant: { name: 'NewCo', address: validAddressPayload },
          user: { fullName: 'Ada Admin', email: 'ada@newco.com', address: validAddressPayload },
        },
      ]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(http.post(TENANTS, () => apiError(409, 'Tenant exists'), { once: true }));
      const { user } = renderPage();
      const dialog = await openWizard(user);

      await completeWizard(user, dialog);
      expect(await screen.findByText('Tenant exists')).toBeInTheDocument();

      server.use(http.post(TENANTS, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Create tenant' }));
      expect(await screen.findByText('Failed to create tenant.')).toBeInTheDocument();
    });

    it('cancels from the first step', async () => {
      mockApi();
      const { user } = renderPage();
      const dialog = await openWizard(user);

      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });

  describe('invite tenant', () => {
    it('sends a tenant invitation', async () => {
      mockApi();
      const bodies = capture('post', `${TENANTS}/invite`);
      const { user } = renderPage();

      await user.click(await screen.findByRole('button', { name: 'Invite Tenant' }));
      const dialog = await screen.findByRole('dialog', { name: 'Invite New Tenant' });
      await fillFields(user, { 'Email address': 'owner@newco.com' });
      await user.click(within(dialog).getByRole('button', { name: 'Send invitation' }));

      expect(await screen.findByText('Invitation sent to owner@newco.com.')).toBeInTheDocument();
      expect(bodies).toEqual([{ email: 'owner@newco.com' }]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(
        http.post(`${TENANTS}/invite`, () => apiError(409, 'Already invited'), { once: true }),
      );
      const { user } = renderPage();
      await user.click(await screen.findByRole('button', { name: 'Invite Tenant' }));
      const dialog = await screen.findByRole('dialog', { name: 'Invite New Tenant' });
      await fillFields(user, { 'Email address': 'owner@newco.com' });

      await user.click(within(dialog).getByRole('button', { name: 'Send invitation' }));
      expect(await screen.findByText('Already invited')).toBeInTheDocument();

      server.use(http.post(`${TENANTS}/invite`, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Send invitation' }));
      expect(await screen.findByText('Failed to send invitation.')).toBeInTheDocument();
    });
  });

  describe('edit tenant', () => {
    const openEdit = async (user: User) => {
      await user.click(within(await findRow('Acme')).getByRole('button', { name: 'Edit' }));
      return screen.findByRole('dialog', { name: 'Edit Tenant' });
    };

    it('renames, deactivates and keeps the address', async () => {
      mockApi();
      const bodies = capture('put', TENANTS, acme);
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await fillFields(user, { Name: 'Acme Corp' });
      await user.click(within(dialog).getByRole('checkbox', { name: /Active/ }));
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

      expect(await screen.findByText('Tenant updated.')).toBeInTheDocument();
      expect(bodies).toEqual([
        {
          id: 't1',
          name: 'Acme Corp',
          isActive: false,
          address: { ...validAddressPayload, line1: '1 Main St' },
        },
      ]);
    });

    it('clears the address when every address field is emptied', async () => {
      mockApi();
      const bodies = capture('put', TENANTS, acme);
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await fillFields(user, { 'Address line 1': '', City: '', 'Postal code': '', Country: '' });
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

      await screen.findByText('Tenant updated.');
      expect(bodies).toEqual([{ id: 't1', name: 'Acme', isActive: true, clearAddress: true }]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(http.put(TENANTS, () => apiError(409, 'Name taken'), { once: true }));
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      expect(await screen.findByText('Name taken')).toBeInTheDocument();

      server.use(http.put(TENANTS, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      expect(await screen.findByText('Failed to update tenant.')).toBeInTheDocument();
    });
  });

  describe('change plan', () => {
    const openPlan = async (user: User) => {
      await user.click(
        within(await findRow('Globex')).getByRole('button', { name: 'Change plan' }),
      );
      return screen.findByRole('dialog', { name: 'Change Plan — Globex' });
    };

    it('moves a tenant to another plan', async () => {
      mockApi();
      const bodies = capture('put', '/api/v1/subscriptions/tenant-plan', {});
      const { user } = renderPage();
      const dialog = await openPlan(user);

      await user.click(within(dialog).getByRole('combobox', { name: /Subscription plan/ }));
      await user.click(await screen.findByRole('option', { name: 'Pro — Max users: Unlimited' }));
      await user.click(within(dialog).getByRole('button', { name: 'Update plan' }));

      expect(await screen.findByText('Plan updated to Pro for "Globex".')).toBeInTheDocument();
      expect(bodies).toEqual([{ tenantId: 't2', planType: 'Pro' }]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(
        http.put('/api/v1/subscriptions/tenant-plan', () => apiError(400, 'Too many users'), {
          once: true,
        }),
      );
      const { user } = renderPage();
      const dialog = await openPlan(user);

      await user.click(within(dialog).getByRole('button', { name: 'Update plan' }));
      expect(await screen.findByText('Too many users')).toBeInTheDocument();

      server.use(http.put('/api/v1/subscriptions/tenant-plan', () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Update plan' }));
      expect(await screen.findByText('Failed to update plan.')).toBeInTheDocument();
    });
  });

  describe('delete tenant', () => {
    const confirmDelete = async (user: User) => {
      await user.click(within(await findRow('Acme')).getByRole('button', { name: 'Delete' }));
      const dialog = await screen.findByRole('dialog', { name: 'Delete "Acme"?' });
      await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    };

    it('deletes after confirmation', async () => {
      mockApi();
      const bodies = capture('delete', TENANTS);
      const { user } = renderPage();

      await confirmDelete(user);

      expect(await screen.findByText('Tenant "Acme" deleted.')).toBeInTheDocument();
      expect(bodies).toEqual([{ id: 't1' }]);
    });

    it('keeps the dialog open and shows the error when deleting fails', async () => {
      mockApi();
      server.use(http.delete(TENANTS, () => apiError(409, 'Tenant has users'), { once: true }));
      const { user } = renderPage();

      await confirmDelete(user);
      expect(await screen.findByText('Tenant has users')).toBeInTheDocument();
      expect(screen.getByRole('dialog', { name: 'Delete "Acme"?' })).toBeInTheDocument();

      server.use(http.delete(TENANTS, () => apiError(500, '')));
      await user.click(screen.getByRole('button', { name: 'Delete' }));
      expect(await screen.findByText('Failed to delete tenant.')).toBeInTheDocument();
    });
  });

  describe('company logo', () => {
    const openLogo = async (user: User, name: string) => {
      const avatar = (await findRow(name)).querySelector('.MuiAvatar-root') as HTMLElement;
      await user.click(avatar);
      return screen.findByRole('dialog');
    };

    it('removes a tenant logo after confirmation', async () => {
      mockApi();
      capture('delete', `${TENANTS}/t2/logo`, { ...globex, profileFileId: null });
      const { user } = renderPage();

      await openLogo(user, 'Globex');
      await user.click(await screen.findByRole('button', { name: 'Remove photo' }));
      const confirm = await screen.findByRole('dialog', { name: 'Remove photo' });
      await user.click(within(confirm).getByRole('button', { name: 'Remove' }));

      expect(await screen.findByText('Company logo removed.')).toBeInTheDocument();
    });

    it('reports a failed removal', async () => {
      mockApi();
      server.use(http.delete(`${TENANTS}/t2/logo`, () => apiError(500, '')));
      const { user } = renderPage();

      await openLogo(user, 'Globex');
      await user.click(await screen.findByRole('button', { name: 'Remove photo' }));
      const confirm = await screen.findByRole('dialog', { name: 'Remove photo' });
      await user.click(within(confirm).getByRole('button', { name: 'Remove' }));

      expect(await screen.findByText('Failed to remove logo.')).toBeInTheDocument();
    });

    it('offers no removal when the tenant has no logo', async () => {
      mockApi();
      const { user } = renderPage();

      await openLogo(user, 'Acme');

      expect(screen.queryByRole('button', { name: 'Remove photo' })).not.toBeInTheDocument();
    });
  });

  describe('invitations tab', () => {
    const pending = invitation({ id: 'i1', email: 'pending@newco.com' });
    const expired = invitation({
      id: 'i2',
      email: 'late@newco.com',
      isExpired: true,
      status: 'Expired',
    });

    it('offers resend and revoke only for pending invitations', async () => {
      mockApi({ invitations: [pending, expired] });
      renderPage(ALL, '/tenants?tab=invitations');

      const pendingRow = await findRow('pending@newco.com');
      expect(
        within(pendingRow).getByRole('button', { name: 'Resend invitation' }),
      ).toBeInTheDocument();
      expect(within(await findRow('late@newco.com')).queryAllByRole('button')).toHaveLength(0);
    });

    it('resends an invitation', async () => {
      mockApi({ invitations: [pending] });
      capture('post', `${INVITATIONS}/i1/resend`);
      const { user } = renderPage(ALL, '/tenants?tab=invitations');

      await user.click(
        within(await findRow('pending@newco.com')).getByRole('button', {
          name: 'Resend invitation',
        }),
      );

      expect(
        await screen.findByText('Invitation resent to pending@newco.com.'),
      ).toBeInTheDocument();
    });

    it('reports a failed resend', async () => {
      mockApi({ invitations: [pending] });
      server.use(http.post(`${INVITATIONS}/i1/resend`, () => apiError(500, '')));
      const { user } = renderPage(ALL, '/tenants?tab=invitations');

      await user.click(
        within(await findRow('pending@newco.com')).getByRole('button', {
          name: 'Resend invitation',
        }),
      );

      expect(await screen.findByText('Failed to resend invitation.')).toBeInTheDocument();
    });

    it('revokes an invitation, keeping the dialog open on failure', async () => {
      mockApi({ invitations: [pending] });
      server.use(http.post(`${INVITATIONS}/i1/revoke`, () => apiError(500, ''), { once: true }));
      const { user } = renderPage(ALL, '/tenants?tab=invitations');

      await user.click(
        within(await findRow('pending@newco.com')).getByRole('button', {
          name: 'Revoke invitation',
        }),
      );
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: 'Revoke' }));
      expect(await screen.findByText('Failed to revoke invitation.')).toBeInTheDocument();

      capture('post', `${INVITATIONS}/i1/revoke`);
      await user.click(within(dialog).getByRole('button', { name: 'Revoke' }));
      expect(await screen.findByText('Invitation revoked.')).toBeInTheDocument();
    });

    it('hides invitation actions without Tenants.Create', async () => {
      mockApi({ invitations: [pending] });
      renderAsLimited(['Tenants.List'], '/tenants?tab=invitations');

      expect(within(await findRow('pending@newco.com')).queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('company logo upload', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('uploads a tenant logo, and reports a failed upload', async () => {
      mockImageCanvas();
      mockApi();
      server.use(http.post(`${TENANTS}/t1/logo`, () => apiError(413, ''), { once: true }));
      const { user } = renderPage();

      await user.click((await findRow('Acme')).querySelector('.MuiAvatar-root') as HTMLElement);
      await uploadAndCrop(user);
      expect(await screen.findByText('Failed to upload logo.')).toBeInTheDocument();

      capture('post', `${TENANTS}/t1/logo`, { ...acme, profileFileId: 'logo-9' });
      await uploadAndCrop(user);
      expect(await screen.findByText('Company logo updated.')).toBeInTheDocument();
    });
  });
});
