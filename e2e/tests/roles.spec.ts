import { mockGet, signInAs } from '../fixtures/api';
import { expect, test } from '../fixtures/test';

const roles = {
  items: [
    {
      id: '30000000-0000-0000-0000-000000000001',
      name: 'Support Agent',
      description: 'Handles customer tickets',
      tenantId: '20000000-0000-0000-0000-000000000001',
      permissionIds: [],
      permissionNames: ['Users.View'],
    },
  ],
  page: 1,
  pageSize: 10,
  totalCount: 1,
  totalPages: 1,
};

test.describe('Roles (signed in)', () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, { permissions: ['Roles.List', 'Roles.View', 'Roles.Create'] });
    await mockGet(page, '/api/v1/permissions', { items: [], byModule: [] });
  });

  test('lists roles from the API', async ({ page }) => {
    await mockGet(page, '/api/v1/roles', roles);

    await page.goto('/roles');

    await expect(page.getByRole('cell', { name: 'Support Agent' })).toBeVisible();
  });

  test('shows Retry when roles fail to load and recovers', async ({ page }) => {
    let calls = 0;
    await page.route('**/api/v1/roles*', (route) => {
      calls += 1;
      return calls === 1
        ? route.fulfill({ status: 502, body: '' })
        : route.fulfill({ json: { data: roles, message: null } });
    });

    await page.goto('/roles');
    await page.getByRole('button', { name: 'Retry' }).click();

    await expect(page.getByRole('cell', { name: 'Support Agent' })).toBeVisible();
  });
});
