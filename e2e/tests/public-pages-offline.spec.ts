import { expect, test } from '../fixtures/test';

const pages = [
  {
    name: 'account setup',
    url: '/account-setup?token=test-token',
    api: '**/api/v1/account-setup/validate*',
    valid: { isValid: true, email: 'jane@acme.com', fullName: 'Jane Doe', hasAddress: true },
    readyText: 'Set up your account',
  },
  {
    name: 'invitation',
    url: '/invitation/accept?token=test-token',
    api: '**/api/v1/invitations/validate*',
    valid: {
      isValid: true,
      email: 'new.admin@acme.com',
      invitationType: 'TenantAdmin',
      tenantName: 'Acme',
    },
    readyText: 'Accept invitation',
  },
  {
    name: 'reset password',
    url: '/reset-password?token=test-token',
    api: '**/api/v1/auth/reset-password/validate*',
    valid: { isValid: true, email: 'jane@acme.com' },
    readyText: 'jane@acme.com',
  },
];

for (const { name, url, api, valid, readyText } of pages) {
  test(`${name}: API down shows Server unavailable, not an expired link, and Retry recovers`, async ({
    page,
  }) => {
    let calls = 0;
    await page.route(api, (route) => {
      calls += 1;
      return calls === 1
        ? route.fulfill({ status: 502, body: '' })
        : route.fulfill({ json: { data: valid, message: null } });
    });

    await page.goto(url);

    await expect(page.getByRole('heading', { name: 'Server unavailable' })).toBeVisible();
    await expect(page.getByText(/expired or invalid/i)).toHaveCount(0);

    await page.getByRole('button', { name: 'Retry' }).click();

    await expect(page.getByText(readyText).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Server unavailable' })).toHaveCount(0);
  });
}
