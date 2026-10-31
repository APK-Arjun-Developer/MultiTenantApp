import { screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { apiError, envelope, http, server } from '@/__tests__/msw/server';
import { fillFields } from '@/__tests__/utils/forms';
import { renderWithProviders, signedInState } from '@/__tests__/utils/renderWithProviders';
import type { RoleDto } from '@/types/api';

import RolesPage from './RolesPage';

const ROLES = '/api/v1/roles';
const PERMISSIONS = '/api/v1/permissions';
const ALL = ['Roles.List', 'Roles.View', 'Roles.Create', 'Roles.Edit', 'Roles.Delete'];

const permissions = [
  { id: 'p1', name: 'Users.View', module: 'Users', description: '', scope: 'TenantUser' },
  { id: 'p2', name: 'Users.Edit', module: 'Users', description: '', scope: 'TenantUser' },
];

const support: RoleDto = {
  id: 'r1',
  name: 'Support',
  description: 'Handles tickets',
  tenantId: 't1',
  permissionIds: ['p1'],
  permissionNames: ['Users.View'],
};

const auditor: RoleDto = {
  id: 'r2',
  name: 'Auditor',
  description: null,
  tenantId: 't1',
  permissionIds: [],
  permissionNames: ['A.View', 'B.View', 'C.View', 'D.View', 'E.View'],
};

const empty: RoleDto = { ...auditor, id: 'r3', name: 'Empty', permissionNames: [] };

const paged = (items: RoleDto[]) => ({
  items,
  page: 1,
  pageSize: 10,
  totalCount: items.length,
  totalPages: 1,
});

/** Mocks permissions + roles and records every roles list request URL. */
const mockApi = (items: RoleDto[] = [support, auditor, empty]) => {
  const listRequests: URL[] = [];
  server.use(
    http.get(PERMISSIONS, () => envelope({ items: permissions, byModule: [] })),
    http.get(ROLES, ({ request }) => {
      listRequests.push(new URL(request.url));
      return envelope(paged(items));
    }),
  );
  return listRequests;
};

const renderPage = (granted: string[] = ALL) =>
  renderWithProviders(<RolesPage />, { preloadedState: signedInState(granted) });

const row = async (name: string) =>
  (await screen.findByRole('cell', { name })).closest('tr') as HTMLElement;

describe('RolesPage', () => {
  it('lists roles with description and permission chips', async () => {
    mockApi();
    renderPage();

    const supportRow = await row('Support');
    expect(within(supportRow).getByText('Handles tickets')).toBeInTheDocument();
    expect(within(supportRow).getByText('Users.View')).toBeInTheDocument();

    const auditorRow = await row('Auditor');
    expect(within(auditorRow).getByText('+2 more')).toBeInTheDocument();
    expect(within(auditorRow).getAllByText('-')).toHaveLength(1);

    expect(within(await row('Empty')).getAllByText('-')).toHaveLength(2);
  });

  it('hides the list without Roles.List, and actions without their permissions', async () => {
    mockApi();
    renderPage(['Roles.View']);

    expect(await screen.findByText("You don't have permission to list roles.")).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Create role' })).not.toBeInTheDocument();
  });

  it('shows only the actions the user is allowed to use', async () => {
    mockApi([support]);
    renderPage(['Roles.List', 'Roles.View']);

    const supportRow = await row('Support');
    expect(within(supportRow).getByRole('button', { name: 'View' })).toBeInTheDocument();
    expect(within(supportRow).queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(within(supportRow).queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('shows role details', async () => {
    mockApi([support, empty]);
    const { user } = renderPage();

    await user.click(within(await row('Support')).getByRole('button', { name: 'View' }));

    const dialog = await screen.findByRole('dialog', { name: 'Role details' });
    expect(within(dialog).getByText('Handles tickets')).toBeInTheDocument();
    expect(within(dialog).getByText('Users.View')).toBeInTheDocument();
  });

  describe('create', () => {
    const openCreate = async (user: ReturnType<typeof renderPage>['user']) => {
      await user.click(await screen.findByRole('button', { name: 'Create role' }));
      return screen.findByRole('dialog', { name: 'Create Role' });
    };

    // The form builder's AUTOCOMPLETE label isn't linked to its input (label for="permissions",
    // input has a generated id), so the combobox has no accessible name; find it in the dialog.
    const pickPermission = async (user: ReturnType<typeof renderPage>['user'], name: string) => {
      await user.click(within(screen.getByRole('dialog')).getByRole('combobox'));
      await user.click(await screen.findByRole('option', { name }));
      await user.keyboard('{Escape}');
    };

    it('creates a role with the selected permissions', async () => {
      mockApi();
      let body: unknown;
      server.use(
        http.post(ROLES, async ({ request }) => {
          body = await request.json();
          return envelope({ ...support, id: 'r9', name: 'Billing' });
        }),
      );
      const { user } = renderPage();
      const dialog = await openCreate(user);

      await fillFields(user, { 'Role name': 'Billing' });
      await pickPermission(user, 'Users.Edit');
      await user.click(within(dialog).getByRole('button', { name: 'Create role' }));

      expect(await screen.findByText('Role "Billing" created.')).toBeInTheDocument();
      expect(body).toEqual({ name: 'Billing', description: null, permissions: ['p2'] });
      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });

    it('requires a name and at least one permission', async () => {
      mockApi();
      const { user } = renderPage();
      const dialog = await openCreate(user);

      await user.click(within(dialog).getByRole('button', { name: 'Create role' }));

      expect(await screen.findByText('Role name is required')).toBeInTheDocument();
      expect(screen.getByText('At least one permission is required')).toBeInTheDocument();
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(http.post(ROLES, () => apiError(409, 'Role already exists'), { once: true }));
      const { user } = renderPage();
      const dialog = await openCreate(user);
      await fillFields(user, { 'Role name': 'Support' });
      await pickPermission(user, 'Users.View');

      await user.click(within(dialog).getByRole('button', { name: 'Create role' }));
      expect(await screen.findByText('Role already exists')).toBeInTheDocument();

      server.use(http.post(ROLES, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Create role' }));
      expect(await screen.findByText('Failed to create role.')).toBeInTheDocument();
    });

    it('closes on Cancel', async () => {
      mockApi();
      const { user } = renderPage();
      const dialog = await openCreate(user);

      await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });

  describe('edit', () => {
    const openEdit = async (user: ReturnType<typeof renderPage>['user']) => {
      await user.click(within(await row('Support')).getByRole('button', { name: 'Edit' }));
      return screen.findByRole('dialog', { name: 'Edit Role - Support' });
    };

    const captureUpdate = () => {
      const bodies: unknown[] = [];
      server.use(
        http.put(ROLES, async ({ request }) => {
          bodies.push(await request.json());
          return envelope(support);
        }),
      );
      return bodies;
    };

    it('renames a role and keeps its permissions', async () => {
      mockApi();
      const bodies = captureUpdate();
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await fillFields(user, { 'Role name': 'Support Lead', Description: '' });
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

      expect(await screen.findByText('Role "Support Lead" updated.')).toBeInTheDocument();
      expect(bodies).toEqual([
        { name: 'Support', newName: 'Support Lead', description: null, permissions: ['p1'] },
      ]);
    });

    it('does not send newName when the name is unchanged', async () => {
      mockApi();
      const bodies = captureUpdate();
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));

      await screen.findByText('Role "Support" updated.');
      expect(bodies).toEqual([
        { name: 'Support', description: 'Handles tickets', permissions: ['p1'] },
      ]);
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(http.put(ROLES, () => apiError(400, 'Name in use'), { once: true }));
      const { user } = renderPage();
      const dialog = await openEdit(user);

      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      expect(await screen.findByText('Name in use')).toBeInTheDocument();

      server.use(http.put(ROLES, () => apiError(500, '')));
      await user.click(within(dialog).getByRole('button', { name: 'Save changes' }));
      expect(await screen.findByText('Failed to update role.')).toBeInTheDocument();
    });
  });

  describe('delete', () => {
    const confirmDelete = async (user: ReturnType<typeof renderPage>['user']) => {
      await user.click(within(await row('Support')).getByRole('button', { name: 'Delete' }));
      const dialog = await screen.findByRole('dialog', { name: 'Delete "Support"?' });
      await user.click(within(dialog).getByRole('button', { name: 'Delete' }));
    };

    it('deletes the role after confirmation', async () => {
      mockApi();
      let deleted = '';
      server.use(
        http.delete(`${ROLES}/:name`, ({ params }) => {
          deleted = String(params.name);
          return envelope(null);
        }),
      );
      const { user } = renderPage();

      await confirmDelete(user);

      expect(await screen.findByText('Role "Support" deleted.')).toBeInTheDocument();
      expect(deleted).toBe('Support');
    });

    it('shows the API error, or a fallback message', async () => {
      mockApi();
      server.use(
        http.delete(`${ROLES}/:name`, () => apiError(409, 'Role is assigned to users'), {
          once: true,
        }),
      );
      const { user } = renderPage();

      await confirmDelete(user);
      expect(await screen.findByText('Role is assigned to users')).toBeInTheDocument();

      server.use(http.delete(`${ROLES}/:name`, () => apiError(500, '')));
      await confirmDelete(user);
      expect(await screen.findByText('Failed to delete role.')).toBeInTheDocument();
    });

    it('cancels without deleting', async () => {
      mockApi();
      const { user } = renderPage();

      await user.click(within(await row('Support')).getByRole('button', { name: 'Delete' }));
      await user.click(await screen.findByRole('button', { name: 'Cancel' }));

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    });
  });

  it('searches roles by name', async () => {
    const requests = mockApi();
    const { user } = renderPage();
    await row('Support');

    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'sup');

    await waitFor(() => expect(requests.at(-1)?.searchParams.get('search')).toBe('sup'));
  });

  it('sorts by name', async () => {
    const requests = mockApi();
    const { user } = renderPage();
    await row('Support');

    await user.click(screen.getByRole('button', { name: 'Name' }));

    await waitFor(() => expect(requests.at(-1)?.searchParams.get('sortBy')).toBe('name'));
  });
});
