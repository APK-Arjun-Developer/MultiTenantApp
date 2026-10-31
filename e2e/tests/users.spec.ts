import { mockGet, signInAs } from '../fixtures/api';
import { expect, test } from '../fixtures/test';

const paged = <T>(items: T[]) => ({
  items,
  page: 1,
  pageSize: 10,
  totalCount: items.length,
  totalPages: 1,
});

const jane = {
  id: 'u1',
  fullName: 'Jane Doe',
  email: 'jane@acme.com',
  tenantId: 't1',
  systemRole: 'TenantUser',
  isActive: true,
  roles: ['Support'],
  createdVia: 'Direct',
  lastLoginAt: '2026-10-01T10:00:00Z',
  hasPendingSetup: false,
};

test.describe('Users (signed in as tenant admin)', () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, {
      permissions: [
        'Users.List',
        'Users.View',
        'Users.Edit',
        'Onboarding.Create',
        'Onboarding.Invite',
      ],
    });
    await mockGet(page, '/api/v1/users/invitations', paged([]));
    await mockGet(
      page,
      '/api/v1/roles',
      paged([
        { id: 'r1', name: 'Support', permissionIds: [], permissionNames: [], tenantId: 't1' },
      ]),
    );
    await mockGet(page, '/api/v1/tenant-settings', {
      planName: 'Pro',
      planFeatures: { maxUsers: -1 },
    });
    await page.route(
      (url) => url.pathname === '/api/v1/users',
      (route) =>
        route.request().method() === 'GET'
          ? route.fulfill({ json: { data: paged([jane]), message: null } })
          : route.fallback(),
    );
  });

  test('lists users and shows their details', async ({ page }) => {
    await page.goto('/users');

    const row = page.getByRole('row', { name: /Jane Doe/ });
    await expect(row).toContainText('jane@acme.com');
    await expect(row).toContainText('Active');

    await row.getByRole('button', { name: 'View' }).click();
    const dialog = page.getByRole('dialog', { name: 'User details' });
    await expect(dialog).toContainText('Support');
  });

  test('invites a user with a role', async ({ page }) => {
    let body: unknown;
    await page.route('**/api/v1/users/invite', async (route) => {
      body = route.request().postDataJSON();
      await route.fulfill({ json: { data: {}, message: null } });
    });
    await page.goto('/users');

    await page.getByRole('button', { name: 'Invite' }).click();
    const dialog = page.getByRole('dialog', { name: 'Invite User' });
    await dialog.getByRole('textbox', { name: /Email address/ }).fill('sam@acme.com');
    await dialog.getByRole('combobox').click();
    await page.getByRole('option', { name: 'Support' }).click();
    await dialog.getByRole('heading').first().click();
    await dialog.getByRole('button', { name: 'Send invitation' }).click();

    await expect(page.getByText('Invitation sent to sam@acme.com.')).toBeVisible();
    expect(body).toEqual({ email: 'sam@acme.com', roleIds: ['r1'] });
  });

  test('switches to the invitations tab', async ({ page }) => {
    await page.goto('/users');

    await page.getByRole('tab', { name: 'Invitations' }).click();

    await expect(page).toHaveURL(/tab=invitations/);
    await expect(page.getByText('No records found')).toBeVisible();
  });
});
