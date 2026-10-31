import { screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { apiError, envelope, http, server } from '@/__tests__/msw/server';
import { capture, findRow, hold, paged } from '@/__tests__/utils/api';
import { fillFields, validAddress, validAddressPayload } from '@/__tests__/utils/forms';
import {
  renderWithProviders,
  signedInState,
  testUser,
} from '@/__tests__/utils/renderWithProviders';
import { mockImageCanvas, uploadAndCrop } from '@/__tests__/utils/upload';
import type { TenantAdminDto, TenantAdminInvitationDto, TenantDto } from '@/types/api';

import TenantAdminsPage from './TenantAdminsPage';

const ADMINS = '/api/v1/tenant-admins';
const INVITATIONS = '/api/v1/tenant-admins/invitations';

const ALL = [
  'Tenants.List',
  'Tenants.View',
  'Tenants.Edit',
  'Tenants.Delete',
  'Onboarding.Create',
  'Onboarding.Invite',
  'Onboarding.Activate',
  'Onboarding.Deactivate',
  'Onboarding.Resend',
  'Onboarding.Revoke',
];

const companyAddress = {
  line1: '9 Corp Way',
  city: 'Metropolis',
  postalCode: '99999',
  country: 'USA',
};

const tenants: TenantDto[] = [
  { id: 't1', name: 'Acme', isActive: true, createdVia: 'Direct', address: companyAddress },
  { id: 't2', name: 'Globex', isActive: true, createdVia: 'Direct', address: null },
];

const ada: TenantAdminDto = {
  id: 'a1',
  fullName: 'Ada Admin',
  email: 'ada@acme.com',
  tenantId: 't1',
  systemRole: 'TenantAdmin',
  isActive: true,
  roles: ['Admin'],
  profileFileId: null,
  address: { line1: '1 Main St', city: 'Springfield', postalCode: '12345', country: 'USA' },
  tenant: { id: 't1', name: 'Acme', isActive: true },
  createdVia: 'Direct',
  hasPendingSetup: false,
};

const ben: TenantAdminDto = {
  ...ada,
  id: 'a2',
  fullName: 'Ben Pending',
  email: 'ben@globex.com',
  tenantId: 't2',
  isActive: false,
  roles: [],
  tenant: null,
  createdVia: 'Invitation',
  hasPendingSetup: true,
  profileFileId: 'f1',
};

const invitation = (overrides: Partial<TenantAdminInvitationDto>): TenantAdminInvitationDto => ({
  id: 'i1',
  email: 'new@acme.com',
  tenantId: 't1',
  tenantName: 'Acme',
  expiresAt: '2026-12-01T00:00:00Z',
  isExpired: false,
  isAccepted: false,
  isRevoked: false,
  status: 'Pending',
  createdAt: '2026-10-01T00:00:00Z',
  ...overrides,
});

const mockApi = ({ admins = [ada, ben], invitations = [] as TenantAdminInvitationDto[] } = {}) => {
  const listRequests: URL[] = [];
  server.use(
    http.get(ADMINS, ({ request }) => {
      listRequests.push(new URL(request.url));
      return envelope(paged(admins));
    }),
    http.get(INVITATIONS, () => envelope(paged(invitations))),
    http.get('/api/v1/tenants', () => envelope(paged(tenants))),
  );
  return listRequests;
};

const systemAdmin = { ...testUser, systemRole: 'SystemAdmin' as const };

/** SystemAdmin sees everything (usePermission is always true for it). */
const renderPage = (route = '/tenant-admins') =>
  renderWithProviders(<TenantAdminsPage />, {
    route,
    preloadedState: signedInState(ALL, systemAdmin),
  });

/** A non-SystemAdmin user, so permission gating applies. */
const renderAsLimited = (granted: string[], route = '/tenant-admins') =>
  renderWithProviders(<TenantAdminsPage />, {
    route,
    preloadedState: signedInState(granted, testUser),
  });

type User = ReturnType<typeof renderPage>['user'];

const chooseOption = async (user: User, dialog: HTMLElement, label: RegExp, option: string) => {
  await user.click(within(dialog).getByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: option }));
};

describe('TenantAdminsPage', () => {
  describe('admins tab', () => {
    it('lists admins with their tenant and status', async () => {
      mockApi();
      renderPage();

      const adaRow = await findRow('Ada Admin');
      expect(within(adaRow).getByText('Acme')).toBeInTheDocument();
      expect(within(adaRow).getByText('Active')).toBeInTheDocument();

      const benRow = await findRow('Ben Pending');
      expect(within(benRow).getByText('—')).toBeInTheDocument();
      expect(within(benRow).getByText('Inactive')).toBeInTheDocument();
    });

    it('explains when admins or invitations may not be listed, and hides actions', async () => {
      mockApi();
      const { user } = renderAsLimited(['Tenants.View']);

      expect(
        await screen.findByText("You don't have permission to list tenant admins."),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Create Admin' })).not.toBeInTheDocument();
      await user.click(screen.getByRole('tab', { name: 'Invitations' }));
      expect(
        await screen.findByText("You don't have permission to list invitations."),
      ).toBeInTheDocument();
    });

    it('filters by search and tenant', async () => {
      const requests = mockApi();
      const { user } = renderPage();
      await findRow('Ada Admin');

      await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'ada');
      await waitFor(() => expect(requests.at(-1)?.searchParams.get('search')).toBe('ada'));

      await user.click(screen.getByRole('combobox', { name: 'Tenant' }));
      await user.click(await screen.findByRole('option', { name: 'Globex' }));
      await waitFor(() => expect(requests.at(-1)?.searchParams.get('tenantId')).toBe('t2'));
    });

    it('shows admin details', async () => {
      mockApi();
      const { user } = renderPage();

      await user.click(within(await findRow('Ada Admin')).getByRole('button', { name: 'View' }));

      const dialog = await screen.findByRole('dialog', { name: 'Tenant admin details' });
      expect(within(dialog).getByText('ada@acme.com')).toBeInTheDocument();
      expect(within(dialog).getByText('Admin')).toBeInTheDocument();
    });
  });

  describe('create and invite', () => {
    it('creates a tenant admin for the chosen tenant', async () => {
      mockApi();
      const bodies = capture('post', ADMINS, { fullName: 'Cy New', email: 'cy@acme.com' });
      const { user } = renderPage();

      await user.click(await screen.findByRole('button', { name: 'Create Admin' }));
      const dialog = await screen.findByRole('dialog', { name: 'Create Tenant Admin' });
      await chooseOption(user, dialog, /^Tenant/, 'Acme');
      await fillFields(user, {
        'Full name': 'Cy New',
        'Email address': 'cy@acme.com',
        ...validAddress,
      });
      await user.click(within(dialog).getByRole('button', { name: 'Create admin' }));

      expect(
        await screen.findByText('Admin "Cy New" created. Setup email sent to cy@acme.com.'),
      ).toBeInTheDocument();
      expect(bodies).toEqual([
        { tenantId: 't1', fullName: 'Cy New', email: 'cy@acme.com', address: validAddressPayload },
      ]);
    });

    it('shows the create error, or a fallback message', async () => {
      mockApi();
      server.use(http.post(ADMINS, () => apiError(409, 'Email taken'), { once: true }));
      const { user } = renderPage();
      await user.click(await screen.findByRole('button', { name: 'Create Admin' }));
      const dialog = await screen.findByRole('dialog', { name: 'Create Tenant Admin' });
      await chooseOption(user, dialog, /^Tenant/, 'Acme');
      await fillFields(user, {
        'Full name': 'Cy New',
        'Email address': 'cy@acme.com',
        ...validAddress,
      });

      await user.click(within(dialog).getByRole('button', { name: 'Create admin' }));
      expect(await screen.findByText('Email taken')).toBeInTheDocument();

      server.use(http.post(ADMINS, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Create admin' }));
      expect(await screen.findByText('Failed to create tenant admin.')).toBeInTheDocument();
    });

    it('invites an admin to a tenant', async () => {
      mockApi();
      const bodies = capture('post', `${ADMINS}/invite`);
      const { user } = renderPage();

      await user.click(await screen.findByRole('button', { name: 'Invite Admin' }));
      const dialog = await screen.findByRole('dialog', { name: 'Invite Tenant Admin' });
      await chooseOption(user, dialog, /^Tenant/, 'Globex');
      await fillFields(user, { 'Email address': 'dee@globex.com' });
      await user.click(within(dialog).getByRole('button', { name: 'Send invitation' }));

      expect(await screen.findByText('Invitation sent to dee@globex.com.')).toBeInTheDocument();
      expect(bodies).toEqual([{ tenantId: 't2', email: 'dee@globex.com' }]);
    });

    it('shows the invite error, or a fallback message', async () => {
      mockApi();
      server.use(
        http.post(`${ADMINS}/invite`, () => apiError(409, 'Already invited'), { once: true }),
      );
      const { user } = renderPage();
      await user.click(await screen.findByRole('button', { name: 'Invite Admin' }));
      const dialog = await screen.findByRole('dialog', { name: 'Invite Tenant Admin' });
      await chooseOption(user, dialog, /^Tenant/, 'Globex');
      await fillFields(user, { 'Email address': 'dee@globex.com' });

      await user.click(within(dialog).getByRole('button', { name: 'Send invitation' }));
      expect(await screen.findByText('Already invited')).toBeInTheDocument();

      server.use(http.post(`${ADMINS}/invite`, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Send invitation' }));
      expect(await screen.findByText('Failed to send invitation.')).toBeInTheDocument();
    });
  });

  describe('edit', () => {
    const openEdit = async (user: User) => {
      await user.click(within(await findRow('Ada Admin')).getByRole('button', { name: 'Edit' }));
      return screen.findByRole('dialog', { name: 'Edit Tenant Admin' });
    };

    it('updates the admin and the company address', async () => {
      mockApi();
      const adminBodies = capture('put', `${ADMINS}/a1`, ada);
      const tenantBodies = capture('put', '/api/v1/tenants', tenants[0]);
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await fillFields(user, { 'Full name': 'Ada Lovelace' });
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

      expect(await screen.findByText('Tenant admin updated.')).toBeInTheDocument();
      expect(adminBodies).toEqual([
        {
          fullName: 'Ada Lovelace',
          address: { ...validAddressPayload, line1: '1 Main St' },
        },
      ]);
      expect(tenantBodies).toEqual([
        { id: 't1', address: { ...companyAddress, line2: null, state: null } },
      ]);
    });

    it('reports a failed company address update instead of claiming success', async () => {
      mockApi();
      capture('put', `${ADMINS}/a1`, ada);
      server.use(http.put('/api/v1/tenants', () => apiError(400, 'Invalid company address')));
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

      expect(await screen.findByText('Invalid company address')).toBeInTheDocument();
      expect(screen.queryByText('Tenant admin updated.')).not.toBeInTheDocument();
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(http.put(`${ADMINS}/a1`, () => apiError(400, 'Bad name'), { once: true }));
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      expect(await screen.findByText('Bad name')).toBeInTheDocument();

      server.use(http.put(`${ADMINS}/a1`, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      expect(await screen.findByText('Failed to update tenant admin.')).toBeInTheDocument();
    });
  });

  describe('account actions', () => {
    const confirm = async (user: User, rowText: string, action: string) => {
      await user.click(within(await findRow(rowText)).getByRole('button', { name: action }));
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: action }));
      return dialog;
    };

    const dialogClosed = () =>
      waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());

    it('deactivates, activates and deletes admins', async () => {
      mockApi();
      capture('post', `${ADMINS}/a1/deactivate`, ada);
      capture('post', `${ADMINS}/a2/activate`, ben);
      capture('delete', `${ADMINS}/a1`);
      const { user } = renderPage();

      await confirm(user, 'Ada Admin', 'Deactivate');
      expect(await screen.findByText('Ada Admin deactivated.')).toBeInTheDocument();
      await dialogClosed();

      await confirm(user, 'Ben Pending', 'Activate');
      expect(await screen.findByText('Ben Pending activated.')).toBeInTheDocument();
      await dialogClosed();

      await confirm(user, 'Ada Admin', 'Delete');
      expect(await screen.findByText('Ada Admin deleted.')).toBeInTheDocument();
    });

    it('keeps the dialog open and names the failed action', async () => {
      mockApi();
      server.use(http.delete(`${ADMINS}/a1`, () => apiError(500, '')));
      const { user } = renderPage();

      const dialog = await confirm(user, 'Ada Admin', 'Delete');

      expect(await screen.findByText('Failed to delete admin.')).toBeInTheDocument();
      expect(dialog).toBeInTheDocument();
    });

    it('resends the setup email, and reports failure', async () => {
      mockApi();
      server.use(http.post(`${ADMINS}/a2/resend`, () => apiError(500, ''), { once: true }));
      const { user } = renderPage();
      const resend = async () =>
        user.click(
          within(await findRow('Ben Pending')).getByRole('button', { name: 'Resend setup email' }),
        );

      await resend();
      expect(await screen.findByText('Failed to resend setup email.')).toBeInTheDocument();

      capture('post', `${ADMINS}/a2/resend`);
      await resend();
      expect(await screen.findByText('Setup email resent to ben@globex.com.')).toBeInTheDocument();
    });

    it('impersonates an active admin within their tenant', async () => {
      mockApi();
      const requests: { body: unknown; tenant: string | null }[] = [];
      server.use(
        http.post('/api/v1/impersonation/start', async ({ request }) => {
          requests.push({ body: await request.json(), tenant: request.headers.get('X-Tenant-Id') });
          return envelope({});
        }),
        http.get('/api/v1/auth/me', () => envelope({ ...ada, permissions: [] })),
      );
      const { user } = renderPage();

      expect(
        within(await findRow('Ben Pending')).queryByRole('button', { name: 'Impersonate admin' }),
      ).not.toBeInTheDocument();
      await user.click(
        within(await findRow('Ada Admin')).getByRole('button', { name: 'Impersonate admin' }),
      );

      expect(await screen.findByText('Now impersonating Ada Admin.')).toBeInTheDocument();
      expect(requests).toEqual([{ body: { targetUserId: 'a1' }, tenant: 't1' }]);
    });

    it('reports a failed impersonation', async () => {
      mockApi();
      server.use(http.post('/api/v1/impersonation/start', () => apiError(403, '')));
      const { user } = renderPage();

      await user.click(
        within(await findRow('Ada Admin')).getByRole('button', { name: 'Impersonate admin' }),
      );

      expect(await screen.findByText('Failed to start impersonation.')).toBeInTheDocument();
    });

    it('removes an admin photo, and reports failure', async () => {
      mockApi();
      server.use(http.delete('/api/v1/users/a2/avatar', () => apiError(500, ''), { once: true }));
      const { user } = renderPage();
      const removePhoto = async () => {
        await user.click(await screen.findByRole('button', { name: 'Remove photo' }));
        const confirmDialog = await screen.findByRole('dialog', { name: 'Remove photo' });
        await user.click(within(confirmDialog).getByRole('button', { name: 'Remove' }));
      };

      await user.click(within(await findRow('Ben Pending')).getByLabelText('Manage profile photo'));
      await removePhoto();
      expect(await screen.findByText('Failed to remove avatar.')).toBeInTheDocument();

      capture('delete', '/api/v1/users/a2/avatar', { ...ben, profileFileId: null });
      await removePhoto();
      expect(await screen.findByText('Profile picture removed.')).toBeInTheDocument();
    });
  });

  describe('invitations tab', () => {
    const pending = invitation({ id: 'i1', email: 'pending@acme.com' });
    const revoked = invitation({
      id: 'i2',
      email: 'gone@acme.com',
      tenantName: null,
      isRevoked: true,
      status: 'Revoked',
    });

    it('lists invitations with actions only for pending ones', async () => {
      mockApi({ invitations: [pending, revoked] });
      renderPage('/tenant-admins?tab=invitations');

      expect(within(await findRow('pending@acme.com')).getByText('Acme')).toBeInTheDocument();
      const revokedRow = await findRow('gone@acme.com');
      expect(within(revokedRow).getByText('—')).toBeInTheDocument();
      expect(within(revokedRow).queryAllByRole('button')).toHaveLength(0);
    });

    it('resends an invitation, and reports failure', async () => {
      mockApi({ invitations: [pending] });
      server.use(http.post(`${INVITATIONS}/i1/resend`, () => apiError(500, ''), { once: true }));
      const { user } = renderPage('/tenant-admins?tab=invitations');
      const resend = async () =>
        user.click(
          within(await findRow('pending@acme.com')).getByRole('button', {
            name: 'Resend invitation',
          }),
        );

      await resend();
      expect(await screen.findByText('Failed to resend invitation.')).toBeInTheDocument();

      capture('post', `${INVITATIONS}/i1/resend`);
      await resend();
      expect(await screen.findByText('Invitation resent to pending@acme.com.')).toBeInTheDocument();
    });

    it('revokes an invitation, keeping the dialog open on failure', async () => {
      mockApi({ invitations: [pending] });
      server.use(http.post(`${INVITATIONS}/i1/revoke`, () => apiError(500, ''), { once: true }));
      const { user } = renderPage('/tenant-admins?tab=invitations');

      await user.click(
        within(await findRow('pending@acme.com')).getByRole('button', {
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

    it('hides the actions column without resend/revoke permissions', async () => {
      mockApi({ invitations: [pending] });
      renderAsLimited(['Tenants.List'], '/tenant-admins?tab=invitations');

      expect(within(await findRow('pending@acme.com')).queryAllByRole('button')).toHaveLength(0);
    });
  });

  describe('avatar upload', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it('uploads an admin photo, and reports a failed upload', async () => {
      mockImageCanvas();
      mockApi();
      server.use(http.post('/api/v1/users/a1/avatar', () => apiError(413, ''), { once: true }));
      const { user } = renderPage();

      await user.click(within(await findRow('Ada Admin')).getByLabelText('Manage profile photo'));
      await uploadAndCrop(user);
      expect(await screen.findByText('Failed to upload avatar.')).toBeInTheDocument();

      capture('post', '/api/v1/users/a1/avatar', { ...ada, profileFileId: 'f9' });
      await uploadAndCrop(user);
      expect(await screen.findByText('Profile picture updated.')).toBeInTheDocument();
    });
  });

  describe('while saving', () => {
    it('keeps the create dialog open on Escape', async () => {
      mockApi();
      hold('post', ADMINS);
      const { user } = renderPage();
      await user.click(await screen.findByRole('button', { name: 'Create Admin' }));
      const dialog = await screen.findByRole('dialog', { name: 'Create Tenant Admin' });
      await chooseOption(user, dialog, /^Tenant/, 'Acme');
      await fillFields(user, {
        'Full name': 'Cy New',
        'Email address': 'cy@acme.com',
        ...validAddress,
      });

      await user.click(within(dialog).getByRole('button', { name: 'Create admin' }));
      await user.keyboard('{Escape}');

      expect(screen.getByRole('dialog', { name: 'Create Tenant Admin' })).toBeInTheDocument();
    });

    it('keeps the invite dialog open on Escape', async () => {
      mockApi();
      hold('post', `${ADMINS}/invite`);
      const { user } = renderPage();
      await user.click(await screen.findByRole('button', { name: 'Invite Admin' }));
      const dialog = await screen.findByRole('dialog', { name: 'Invite Tenant Admin' });
      await chooseOption(user, dialog, /^Tenant/, 'Globex');
      await fillFields(user, { 'Email address': 'dee@globex.com' });

      await user.click(within(dialog).getByRole('button', { name: 'Send invitation' }));
      await user.keyboard('{Escape}');

      expect(screen.getByRole('dialog', { name: 'Invite Tenant Admin' })).toBeInTheDocument();
    });

    it('keeps the edit dialog open on Escape', async () => {
      mockApi();
      hold('put', `${ADMINS}/a1`);
      const { user } = renderPage();
      await user.click(within(await findRow('Ada Admin')).getByRole('button', { name: 'Edit' }));
      const dialog = await screen.findByRole('dialog', { name: 'Edit Tenant Admin' });

      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      await user.keyboard('{Escape}');

      expect(screen.getByRole('dialog', { name: 'Edit Tenant Admin' })).toBeInTheDocument();
    });
  });

  it('skips the company address update for an admin without a tenant', async () => {
    mockApi();
    const adminBodies = capture('put', `${ADMINS}/a2`, ben);
    const tenantBodies = capture('put', '/api/v1/tenants', {});
    const { user } = renderPage();
    await user.click(within(await findRow('Ben Pending')).getByRole('button', { name: 'Edit' }));
    const dialog = await screen.findByRole('dialog', { name: 'Edit Tenant Admin' });

    await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

    await screen.findByText('Tenant admin updated.');
    expect(adminBodies).toHaveLength(1);
    expect(tenantBodies).toHaveLength(0);
  });

  it('hides activation for users without the permission', async () => {
    mockApi();
    renderAsLimited(['Tenants.List']);

    expect(
      within(await findRow('Ada Admin')).queryByRole('button', { name: 'Deactivate' }),
    ).not.toBeInTheDocument();
  });
});
