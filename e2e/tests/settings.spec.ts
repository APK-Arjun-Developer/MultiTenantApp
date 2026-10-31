import { mockGet, signInAs } from '../fixtures/api';
import { expect, test } from '../fixtures/test';

const config = {
  tenantId: 't1',
  loginEnabled: true,
  welcomeEmailEnabled: false,
  maintenanceMode: false,
  maintenanceMessage: null,
};

test.describe('Settings (signed in as tenant admin)', () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page);
  });

  test('changes the accent color and display mode, and remembers them', async ({ page }) => {
    await page.goto('/settings');

    await page.getByRole('button', { name: 'Teal' }).click();
    await page.getByRole('main').getByRole('button', { name: 'Dark mode' }).click();

    await expect(page.getByRole('button', { name: 'Teal' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect.poll(() => page.evaluate(() => localStorage.getItem('themeMode'))).toBe('dark');
    await expect.poll(() => page.evaluate(() => localStorage.getItem('themeColor'))).toBe('teal');
  });

  test('saves the organization configuration', async ({ page }) => {
    await mockGet(page, '/api/v1/tenant-settings/config', config);
    let body: unknown;
    await page.route('**/api/v1/tenant-settings/config', async (route) => {
      if (route.request().method() !== 'PUT') return route.fallback();
      body = route.request().postDataJSON();
      await route.fulfill({
        json: { data: { ...config, welcomeEmailEnabled: true }, message: null },
      });
    });
    await page.goto('/settings?tab=configuration');

    const save = page.getByRole('button', { name: 'Save changes' });
    await expect(save).toBeDisabled();
    await page.getByRole('switch', { name: 'Welcome email' }).click();
    await save.click();

    await expect(page.getByText('Configuration saved.')).toBeVisible();
    expect(body).toEqual({ loginEnabled: true, welcomeEmailEnabled: true });
  });
});
