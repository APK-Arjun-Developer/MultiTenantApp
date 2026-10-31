import { screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { apiError, envelope, http, server } from '@/__tests__/msw/server';
import { capture, findRow, paged } from '@/__tests__/utils/api';
import { fillFields, validAddress, validAddressPayload } from '@/__tests__/utils/forms';
import {
  renderWithProviders,
  signedInState,
  testUser,
} from '@/__tests__/utils/renderWithProviders';
import type { RootState } from '@/app/store';
import { exportToCsv } from '@/shared/utils/exportCsv';
import type { UserDto, UserInvitationDto } from '@/types/api';

import UsersPage from './UsersPage';

vi.mock('@/shared/utils/exportCsv', () => ({ exportToCsv: vi.fn() }));

const USERS = '/api/v1/users';
const INVITATIONS = '/api/v1/users/invitations';

const ALL = [
  'Users.List',
  'Users.View',
  'Users.Edit',
  'Users.Delete',
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

const jane: UserDto = {
  id: 'u1',
  fullName: 'Jane Doe',
  email: 'jane@acme.com',
  tenantId: 't1',
  systemRole: 'TenantUser',
  isActive: true,
  roles: ['Support'],
  profileFileId: null,
  address: { line1: '1 Main St', city: 'Springfield', postalCode: '12345', country: 'USA' },
  createdVia: 'Direct',
  lastLoginAt: '2026-10-01T10:00:00Z',
  hasPendingSetup: false,
};

const bob: UserDto = {
  ...jane,
  id: 'u2',
  fullName: 'Bob Pending',
  email: 'bob@acme.com',
  isActive: false,
  roles: [],
  createdVia: 'Invitation',
  lastLoginAt: null,
  hasPendingSetup: true,
  profileFileId: 'f1',
};

const invitation = (overrides: Partial<UserInvitationDto>): UserInvitationDto => ({
  id: 'i1',
  email: 'new@acme.com',
  invitationType: 'TenantUser',
  tenantId: 't1',
  expiresAt: '2026-12-01T00:00:00Z',
  isExpired: false,
  isAccepted: false,
  isRevoked: false,
  status: 'Pending',
  createdAt: '2026-10-01T00:00:00Z',
  invitedByUserId: 'u1',
  ...overrides,
});

interface MockOptions {
  users?: UserDto[];
  totalUsers?: number;
  maxUsers?: number;
  invitations?: UserInvitationDto[];
}

/** Mocks every query the page makes; returns the recorded users list requests. */
const mockApi = ({
  users = [jane, bob],
  totalUsers,
  maxUsers = -1,
  invitations = [],
}: MockOptions = {}) => {
  const listRequests: URL[] = [];
  server.use(
    http.get(USERS, ({ request }) => {
      listRequests.push(new URL(request.url));
      return envelope(paged(users, totalUsers));
    }),
    http.get(INVITATIONS, () => envelope(paged(invitations))),
    http.get('/api/v1/roles', () =>
      envelope(
        paged([
          { id: 'r1', name: 'Support', permissionIds: [], permissionNames: [], tenantId: 't1' },
          { id: 'r2', name: 'Billing', permissionIds: [], permissionNames: [], tenantId: 't1' },
        ]),
      ),
    ),
    http.get('/api/v1/tenant-settings', () =>
      envelope({ planName: 'Free', planFeatures: { maxUsers } }),
    ),
    http.get('/api/v1/users/current', () =>
      envelope({ ...jane, tenant: { address: companyAddress } }),
    ),
  );
  return listRequests;
};

const renderPage = (
  granted: string[] = ALL,
  {
    route = '/users',
    preloadedState,
  }: { route?: string; preloadedState?: Partial<RootState> } = {},
) =>
  renderWithProviders(<UsersPage />, {
    route,
    preloadedState: preloadedState ?? signedInState(granted),
  });

type User = ReturnType<typeof renderPage>['user'];

const pickRole = async (user: User, name: string) => {
  const dialog = screen.getByRole('dialog');
  // The form builder's AUTOCOMPLETE label isn't linked to its input, so find it in the dialog.
  await user.click(within(dialog).getByRole('combobox'));
  await user.click(await screen.findByRole('option', { name }));
  // Close the listbox by clicking the dialog title.
  await user.click(within(dialog).getAllByRole('heading')[0]);
};

const openAvatar = async (user: User, rowText: string) =>
  user.click(within(await findRow(rowText)).getByLabelText('Manage profile photo'));

beforeEach(() => {
  vi.mocked(exportToCsv).mockClear();
});

describe('UsersPage', () => {
  describe('users tab', () => {
    it('lists users with roles, sign-in time and status', async () => {
      mockApi();
      renderPage();

      const janeRow = await findRow('Jane Doe');
      expect(within(janeRow).getByText('jane@acme.com')).toBeInTheDocument();
      expect(within(janeRow).getByText('Support')).toBeInTheDocument();
      expect(within(janeRow).getByText('Active')).toBeInTheDocument();

      const bobRow = await findRow('Bob Pending');
      expect(within(bobRow).getByText('-')).toBeInTheDocument();
      expect(within(bobRow).getByText('—')).toBeInTheDocument();
      expect(within(bobRow).getByText('Inactive')).toBeInTheDocument();
    });

    it('explains when the user may not list users or invitations', async () => {
      mockApi();
      const { user } = renderPage(['Users.View']);

      expect(
        await screen.findByText("You don't have permission to list users."),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('tab', { name: 'Invitations' }));
      expect(
        await screen.findByText("You don't have permission to list invitations."),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Create user' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Invite' })).not.toBeInTheDocument();
    });

    it('blocks adding users at the plan limit', async () => {
      mockApi({ totalUsers: 3, maxUsers: 3 });
      renderPage();

      expect(await screen.findByText(/3-user limit/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create user' })).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Invite' })).toBeDisabled();
    });

    it('filters by search text and status', async () => {
      const requests = mockApi();
      const { user } = renderPage();
      await findRow('Jane Doe');

      await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'jan');
      await waitFor(() => expect(requests.at(-1)?.searchParams.get('search')).toBe('jan'));

      await user.click(screen.getByRole('combobox', { name: 'Status' }));
      await user.click(await screen.findByRole('option', { name: 'Inactive' }));
      await waitFor(() => expect(requests.at(-1)?.searchParams.get('isActive')).toBe('false'));
    });

    it('exports all users to CSV', async () => {
      mockApi();
      const { user } = renderPage();
      await findRow('Jane Doe');

      await user.click(screen.getByRole('button', { name: 'Export CSV' }));

      await waitFor(() => expect(exportToCsv).toHaveBeenCalledTimes(1));
      const [filename, rows] = vi.mocked(exportToCsv).mock.calls[0];
      expect(filename).toBe('users');
      expect(rows[0]).toMatchObject({ Name: 'Jane Doe', Roles: 'Support', Status: 'Active' });
      expect(rows[1]).toMatchObject({ Name: 'Bob Pending', Status: 'Inactive', 'Last Login': '' });
    });

    it('shows user details', async () => {
      mockApi();
      const { user } = renderPage();

      await user.click(within(await findRow('Jane Doe')).getByRole('button', { name: 'View' }));

      const dialog = await screen.findByRole('dialog', { name: 'User details' });
      expect(within(dialog).getByText('jane@acme.com')).toBeInTheDocument();
      expect(within(dialog).getByText('Support')).toBeInTheDocument();
      expect(within(dialog).getByText(/1 Main St/)).toBeInTheDocument();
    });
  });

  describe('create user', () => {
    const openCreate = async (user: User) => {
      await user.click(await screen.findByRole('button', { name: 'Create user' }));
      return screen.findByRole('dialog', { name: 'Create User' });
    };

    it('creates a user with roles and address', async () => {
      mockApi();
      const bodies = capture('post', `${USERS}/direct-create`, {
        fullName: 'Sam New',
        email: 'sam@acme.com',
      });
      const { user } = renderPage();
      const dialog = await openCreate(user);

      await fillFields(user, { 'Full name': 'Sam New', 'Email address': 'sam@acme.com' });
      await pickRole(user, 'Billing');
      await fillFields(user, validAddress);
      await user.click(within(dialog).getByRole('button', { name: 'Create user' }));

      expect(
        await screen.findByText('User "Sam New" created. Setup email sent to sam@acme.com.'),
      ).toBeInTheDocument();
      expect(bodies).toEqual([
        {
          fullName: 'Sam New',
          email: 'sam@acme.com',
          roleIds: ['r2'],
          address: validAddressPayload,
        },
      ]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(
        http.post(`${USERS}/direct-create`, () => apiError(409, 'Email taken'), { once: true }),
      );
      const { user } = renderPage();
      const dialog = await openCreate(user);
      await fillFields(user, { 'Full name': 'Sam New', 'Email address': 'sam@acme.com' });
      await pickRole(user, 'Support');
      await fillFields(user, validAddress);

      await user.click(within(dialog).getByRole('button', { name: 'Create user' }));
      expect(await screen.findByText('Email taken')).toBeInTheDocument();

      server.use(http.post(`${USERS}/direct-create`, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Create user' }));
      expect(await screen.findByText('Failed to create user.')).toBeInTheDocument();
    });
  });

  describe('invite user', () => {
    it('sends an invitation with the chosen roles', async () => {
      mockApi();
      const bodies = capture('post', `${USERS}/invite`);
      const { user } = renderPage();

      await user.click(await screen.findByRole('button', { name: 'Invite' }));
      const dialog = await screen.findByRole('dialog', { name: 'Invite User' });
      await fillFields(user, { 'Email address': 'sam@acme.com' });
      await pickRole(user, 'Support');
      await user.click(within(dialog).getByRole('button', { name: 'Send invitation' }));

      expect(await screen.findByText('Invitation sent to sam@acme.com.')).toBeInTheDocument();
      expect(bodies).toEqual([{ email: 'sam@acme.com', roleIds: ['r1'] }]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(
        http.post(`${USERS}/invite`, () => apiError(409, 'Already invited'), { once: true }),
      );
      const { user } = renderPage();
      await user.click(await screen.findByRole('button', { name: 'Invite' }));
      const dialog = await screen.findByRole('dialog', { name: 'Invite User' });
      await fillFields(user, { 'Email address': 'sam@acme.com' });
      await pickRole(user, 'Support');

      await user.click(within(dialog).getByRole('button', { name: 'Send invitation' }));
      expect(await screen.findByText('Already invited')).toBeInTheDocument();

      server.use(http.post(`${USERS}/invite`, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Send invitation' }));
      expect(await screen.findByText('Failed to send invitation.')).toBeInTheDocument();
    });
  });

  describe('edit user', () => {
    const openEdit = async (user: User) => {
      await user.click(within(await findRow('Jane Doe')).getByRole('button', { name: 'Edit' }));
      return screen.findByRole('dialog', { name: 'Edit User' });
    };

    it('updates name, role and keeps the own address', async () => {
      mockApi();
      const bodies = capture('put', USERS, jane);
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await fillFields(user, { 'Full name': 'Jane Smith' });
      await user.click(within(dialog).getByRole('combobox', { name: 'Role' }));
      await user.click(await screen.findByRole('option', { name: 'Billing' }));
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

      expect(await screen.findByText('User updated.')).toBeInTheDocument();
      expect(bodies).toEqual([
        {
          email: 'jane@acme.com',
          fullName: 'Jane Smith',
          roleId: 'r2',
          address: { ...validAddressPayload, line1: '1 Main St' },
        },
      ]);
    });

    it('can use the company address instead', async () => {
      mockApi();
      const bodies = capture('put', USERS, jane);
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await user.click(within(dialog).getByRole('checkbox', { name: /Same as company address/ }));
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

      await screen.findByText('User updated.');
      expect(bodies).toEqual([
        { email: 'jane@acme.com', fullName: 'Jane Doe', roleId: 'r1', address: companyAddress },
      ]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(http.put(USERS, () => apiError(400, 'Invalid role'), { once: true }));
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      expect(await screen.findByText('Invalid role')).toBeInTheDocument();

      server.use(http.put(USERS, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      expect(await screen.findByText('Failed to update user.')).toBeInTheDocument();
    });
  });

  describe('account actions', () => {
    const confirm = async (user: User, rowText: string, action: string, confirmLabel: string) => {
      await user.click(within(await findRow(rowText)).getByRole('button', { name: action }));
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: confirmLabel }));
    };

    it('deactivates an active user', async () => {
      mockApi();
      const bodies = capture('post', `${USERS}/u1/deactivate`, jane);
      const { user } = renderPage();

      await confirm(user, 'Jane Doe', 'Deactivate', 'Deactivate');

      expect(await screen.findByText('User "Jane Doe" deactivated.')).toBeInTheDocument();
      expect(bodies).toHaveLength(1);
    });

    it('activates an inactive user', async () => {
      mockApi();
      capture('post', `${USERS}/u2/activate`, bob);
      const { user } = renderPage();

      await confirm(user, 'Bob Pending', 'Activate', 'Activate');

      expect(await screen.findByText('User "Bob Pending" activated.')).toBeInTheDocument();
    });

    it('deletes a user by email', async () => {
      mockApi();
      const bodies = capture('delete', USERS);
      const { user } = renderPage();

      await confirm(user, 'Jane Doe', 'Delete', 'Delete');

      expect(await screen.findByText('User "Jane Doe" deleted.')).toBeInTheDocument();
      expect(bodies).toEqual([{ email: 'jane@acme.com' }]);
    });

    it('reports a failed action', async () => {
      mockApi();
      server.use(http.delete(USERS, () => apiError(500, '')));
      const { user } = renderPage();

      await confirm(user, 'Jane Doe', 'Delete', 'Delete');

      expect(await screen.findByText('Action failed.')).toBeInTheDocument();
    });

    it('resends the setup email to users who have not finished setup', async () => {
      mockApi();
      capture('post', `${USERS}/u2/resend`);
      const { user } = renderPage();

      expect(
        within(await findRow('Jane Doe')).queryByRole('button', { name: 'Resend setup email' }),
      ).not.toBeInTheDocument();
      await user.click(
        within(await findRow('Bob Pending')).getByRole('button', { name: 'Resend setup email' }),
      );

      expect(await screen.findByText('Setup email resent to bob@acme.com.')).toBeInTheDocument();
    });

    it('reports a failed setup resend', async () => {
      mockApi();
      server.use(http.post(`${USERS}/u2/resend`, () => apiError(500, '')));
      const { user } = renderPage();

      await user.click(
        within(await findRow('Bob Pending')).getByRole('button', { name: 'Resend setup email' }),
      );

      expect(await screen.findByText('Failed to resend setup email.')).toBeInTheDocument();
    });
  });

  describe('impersonation (SystemAdmin)', () => {
    const systemAdminState = (): Partial<RootState> => ({
      ...signedInState([], { ...testUser, systemRole: 'SystemAdmin' }),
      ui: {
        themeMode: 'light',
        themeColor: 'violet',
        sidebarOpen: true,
        selectedTenantId: 't1',
        selectedTenantName: 'Acme',
      },
    });

    it('impersonates an active user', async () => {
      mockApi();
      const bodies = capture('post', '/api/v1/impersonation/start', {});
      server.use(http.get('/api/v1/auth/me', () => envelope({ ...jane, permissions: [] })));
      const { user } = renderPage(ALL, { preloadedState: systemAdminState() });

      expect(
        within(await findRow('Bob Pending')).queryByRole('button', { name: 'Impersonate user' }),
      ).not.toBeInTheDocument();
      await user.click(
        within(await findRow('Jane Doe')).getByRole('button', { name: 'Impersonate user' }),
      );

      expect(await screen.findByText('Now impersonating Jane Doe.')).toBeInTheDocument();
      expect(bodies).toEqual([{ targetUserId: 'u1' }]);
    });

    it('reports a failed impersonation', async () => {
      mockApi();
      server.use(http.post('/api/v1/impersonation/start', () => apiError(403, '')));
      const { user } = renderPage(ALL, { preloadedState: systemAdminState() });

      await user.click(
        within(await findRow('Jane Doe')).getByRole('button', { name: 'Impersonate user' }),
      );

      expect(await screen.findByText('Failed to start impersonation.')).toBeInTheDocument();
    });
  });

  describe('avatar', () => {
    it('removes a user photo after confirmation', async () => {
      mockApi();
      capture('delete', `${USERS}/u2/avatar`, { ...bob, profileFileId: null });
      const { user } = renderPage();

      await openAvatar(user, 'Bob Pending');
      await user.click(await screen.findByRole('button', { name: 'Remove photo' }));
      const confirmDialog = await screen.findByRole('dialog', { name: 'Remove photo' });
      await user.click(within(confirmDialog).getByRole('button', { name: 'Remove' }));

      expect(await screen.findByText('Profile picture removed.')).toBeInTheDocument();
    });

    it('reports a failed removal', async () => {
      mockApi();
      server.use(http.delete(`${USERS}/u2/avatar`, () => apiError(500, '')));
      const { user } = renderPage();

      await openAvatar(user, 'Bob Pending');
      await user.click(await screen.findByRole('button', { name: 'Remove photo' }));
      const confirmDialog = await screen.findByRole('dialog', { name: 'Remove photo' });
      await user.click(within(confirmDialog).getByRole('button', { name: 'Remove' }));

      expect(await screen.findByText('Failed to remove avatar.')).toBeInTheDocument();
    });
  });

  describe('invitations tab', () => {
    const pending = invitation({ id: 'i1', email: 'pending@acme.com' });
    const accepted = invitation({
      id: 'i2',
      email: 'done@acme.com',
      isAccepted: true,
      status: 'Accepted',
    });

    it('lists invitations with actions only for pending ones', async () => {
      mockApi({ invitations: [pending, accepted] });
      renderPage(ALL, { route: '/users?tab=invitations' });

      const pendingRow = await findRow('pending@acme.com');
      expect(
        within(pendingRow).getByRole('button', { name: 'Resend invitation' }),
      ).toBeInTheDocument();
      expect(
        within(pendingRow).getByRole('button', { name: 'Revoke invitation' }),
      ).toBeInTheDocument();
      expect(within(await findRow('done@acme.com')).queryAllByRole('button')).toHaveLength(0);
    });

    it('hides the actions column without resend/revoke permissions', async () => {
      mockApi({ invitations: [pending] });
      renderPage(['Users.List'], { route: '/users?tab=invitations' });

      await findRow('pending@acme.com');
      expect(screen.queryByRole('columnheader', { name: 'Actions' })).not.toBeInTheDocument();
    });

    it('resends a pending invitation', async () => {
      mockApi({ invitations: [pending] });
      capture('post', `${INVITATIONS}/i1/resend`);
      const { user } = renderPage(ALL, { route: '/users?tab=invitations' });

      await user.click(
        within(await findRow('pending@acme.com')).getByRole('button', {
          name: 'Resend invitation',
        }),
      );

      expect(await screen.findByText('Invitation resent to pending@acme.com.')).toBeInTheDocument();
    });

    it('reports a failed resend', async () => {
      mockApi({ invitations: [pending] });
      server.use(http.post(`${INVITATIONS}/i1/resend`, () => apiError(500, '')));
      const { user } = renderPage(ALL, { route: '/users?tab=invitations' });

      await user.click(
        within(await findRow('pending@acme.com')).getByRole('button', {
          name: 'Resend invitation',
        }),
      );

      expect(await screen.findByText('Failed to resend invitation.')).toBeInTheDocument();
    });

    it('revokes a pending invitation after confirmation', async () => {
      mockApi({ invitations: [pending] });
      capture('post', `${INVITATIONS}/i1/revoke`);
      const { user } = renderPage(ALL, { route: '/users?tab=invitations' });

      await user.click(
        within(await findRow('pending@acme.com')).getByRole('button', {
          name: 'Revoke invitation',
        }),
      );
      const dialog = await screen.findByRole('dialog');
      await user.click(within(dialog).getByRole('button', { name: 'Revoke' }));

      expect(
        await screen.findByText('Invitation to pending@acme.com revoked.'),
      ).toBeInTheDocument();
    });

    it('reports a failed revoke', async () => {
      mockApi({ invitations: [pending] });
      server.use(http.post(`${INVITATIONS}/i1/revoke`, () => apiError(500, '')));
      const { user } = renderPage(ALL, { route: '/users?tab=invitations' });

      await user.click(
        within(await findRow('pending@acme.com')).getByRole('button', {
          name: 'Revoke invitation',
        }),
      );
      await user.click(
        within(await screen.findByRole('dialog')).getByRole('button', { name: 'Revoke' }),
      );

      expect(await screen.findByText('Failed to revoke invitation.')).toBeInTheDocument();
    });
  });
});
