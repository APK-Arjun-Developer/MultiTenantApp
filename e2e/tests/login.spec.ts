import { mockApiDown } from '../fixtures/api';
import { expect, test } from '../fixtures/test';

test.describe('Login', () => {
  test('shows a clear message when the API is unreachable', async ({ page }) => {
    await mockApiDown(page);
    await page.goto('/login');

    await page.getByRole('textbox', { name: /email address/i }).fill('admin@acme.com');
    await page.locator('input[name="password"]').fill('Password123!');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();

    await expect(page.getByText('Unable to reach the server')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
