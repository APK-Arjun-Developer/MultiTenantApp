import { mockApiDown, signIn } from '../fixtures/api';
import { expect, test } from '../fixtures/test';

test.describe('Auth guard', () => {
  test('redirects unauthenticated users to login', async ({ page }) => {
    await page.goto('/dashboard');

    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('Sign in to your account')).toBeVisible();
  });

  test('blocks the dashboard with a retry screen when the API is down', async ({ page }) => {
    await signIn(page);
    await mockApiDown(page);
    let meCalls = 0;
    page.on('request', (req) => {
      if (req.url().includes('/api/v1/auth/me')) meCalls += 1;
    });

    await page.goto('/dashboard');

    await expect(page.getByRole('heading', { name: 'Server unavailable' })).toBeVisible();
    const callsBeforeRetry = meCalls;

    await page.getByRole('button', { name: 'Retry' }).click();

    await expect.poll(() => meCalls).toBeGreaterThan(callsBeforeRetry);
    await expect(page.getByRole('heading', { name: 'Server unavailable' })).toBeVisible();
  });
});
