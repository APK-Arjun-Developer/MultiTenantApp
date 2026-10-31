import type { Page, Route } from '@playwright/test';

const AUTH_USER_KEY = 'auth.user';

const signedInUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@acme.com',
  fullName: 'Acme Admin',
  roles: ['Admin'],
  systemRole: 'TenantAdmin',
};

type SessionUser = typeof signedInUser;

const fulfillEnvelope = (route: Route, data: unknown, status = 200) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify({ data, message: null }),
  });

const isApiRequest = (url: URL) => url.pathname.startsWith('/api/');

/** Simulates the API process being down (what the Vite proxy returns: 502, empty body). */
const mockApiDown = (page: Page) =>
  page.route(isApiRequest, (route) => route.fulfill({ status: 502, body: '' }));

/** Mocks a single GET endpoint with an API envelope. */
const mockGet = (page: Page, path: string, data: unknown) =>
  page.route(`**${path}*`, (route) => fulfillEnvelope(route, data));

/** Starts the page with a persisted session, as if the user had signed in earlier. */
const signIn = (page: Page, user: SessionUser = signedInUser) =>
  page.addInitScript(([key, value]) => localStorage.setItem(key, JSON.stringify(value)), [
    AUTH_USER_KEY,
    user,
  ] as const);

/**
 * Signed-in session with a verified /auth/me and permissions. Any API call a test
 * doesn't mock answers 404 with the path in the message, so gaps are obvious.
 * Register this first: routes added later take precedence over the fallback.
 */
const signInAs = async (
  page: Page,
  { permissions = [], user = signedInUser }: { permissions?: string[]; user?: SessionUser } = {},
) => {
  await page.route(isApiRequest, (route) =>
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({
        data: null,
        message: `Not mocked in e2e: ${new URL(route.request().url()).pathname}`,
      }),
    }),
  );
  await signIn(page, user);
  await mockGet(page, '/api/v1/auth/me', { ...user, permissions });
  await mockGet(page, '/api/v1/users/current', {
    ...user,
    tenantId: '20000000-0000-0000-0000-000000000001',
    isActive: true,
    createdVia: 'Direct',
    hasPendingSetup: false,
  });
};

export { mockApiDown, mockGet, signIn, signInAs };
