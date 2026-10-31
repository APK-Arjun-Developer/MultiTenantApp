import { mockGet } from '../fixtures/api';
import { expect, test } from '../fixtures/test';

test.describe('Stepper forms: Cancel on the first step', () => {
  test('invitation wizard cancels back to login', async ({ page }) => {
    await mockGet(page, '/api/v1/invitations/validate', {
      isValid: true,
      email: 'new.admin@acme.com',
      invitationType: 'TenantAdmin',
      tenantName: 'Acme',
    });

    await page.goto('/invitation/accept?token=test-token');

    await expect(page.getByRole('button', { name: 'Next' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Back' })).toHaveCount(0);

    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('new-tenant invitation wizard cancels back to login', async ({ page }) => {
    await mockGet(page, '/api/v1/invitations/validate', {
      isValid: true,
      email: 'owner@newco.com',
      invitationType: 'NewTenant',
    });

    await page.goto('/invitation/accept?token=test-token');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });

  test('account setup wizard cancels back to login', async ({ page }) => {
    await mockGet(page, '/api/v1/account-setup/validate', {
      isValid: true,
      email: 'jane@acme.com',
      fullName: 'Jane Doe',
      hasAddress: false,
    });

    await page.goto('/account-setup?token=test-token');
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(page).toHaveURL(/\/login$/);
  });
});
