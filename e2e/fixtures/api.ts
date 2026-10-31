import type { Page, Route } from '@playwright/test';

const AUTH_USER_KEY = 'auth.user';

const signedInUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@acme.com',
  fullName: 'Acme Admin',
  roles: ['Admin'],
  systemRole: 'TenantAdmin',
};

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
const signIn = (page: Page) =>
  page.addInitScript(([key, user]) => localStorage.setItem(key, JSON.stringify(user)), [
    AUTH_USER_KEY,
    signedInUser,
  ] as const);

export { mockApiDown, mockGet, signIn };
