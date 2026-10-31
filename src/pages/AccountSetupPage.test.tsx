import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { apiError, envelope, http, server, unreachable } from '@/__tests__/msw/server';
import {
  fillFields,
  STRONG_PASSWORD,
  validAddress,
  validAddressPayload,
} from '@/__tests__/utils/forms';
import { renderWithProviders } from '@/__tests__/utils/renderWithProviders';

import AccountSetupPage from './AccountSetupPage';

const VALIDATE = '/api/v1/account-setup/validate';
const SET_PASSWORD = '/api/v1/account-setup/set-password';

const setPasswordResponse = { userId: 'u1', email: 'jane@acme.com', isActive: true };

const renderPage = (route = '/account-setup?token=abc') =>
  renderWithProviders(<AccountSetupPage />, { route, path: '/account-setup' });

const validate = (data: Record<string, unknown>) =>
  server.use(
    http.get(VALIDATE, () => envelope({ isValid: true, email: 'jane@acme.com', ...data })),
  );

const captureSetPassword = () => {
  const calls: unknown[] = [];
  server.use(
    http.post(SET_PASSWORD, async ({ request }) => {
      calls.push(await request.json());
      return envelope(setPasswordResponse);
    }),
  );
  return calls;
};

describe('AccountSetupPage', () => {
  it('rejects a link without a token', () => {
    renderPage('/account-setup');

    expect(screen.getByText('No setup token found in the link.')).toBeInTheDocument();
  });

  it('shows the server reason, or a default, for an invalid link', async () => {
    server.use(http.get(VALIDATE, () => envelope({ isValid: false, hasAddress: false })));
    renderPage();

    expect(
      await screen.findByText(/This account setup link is no longer valid/),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Go to sign in' })).toHaveAttribute('href', '/login');
  });

  it('shows Server unavailable when the API is down', async () => {
    server.use(http.get(VALIDATE, unreachable));
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Server unavailable' })).toBeInTheDocument();
  });

  describe('direct creation (admin already set name and address)', () => {
    it('only asks for a password and activates the account', async () => {
      validate({ hasAddress: true, fullName: 'Jane Doe' });
      const calls = captureSetPassword();
      const { user } = renderPage();

      expect(await screen.findByText('jane@acme.com')).toBeInTheDocument();
      await fillFields(user, {
        'New password': STRONG_PASSWORD,
        'Confirm password': STRONG_PASSWORD,
      });
      await user.click(screen.getByRole('button', { name: 'Activate account' }));

      expect(await screen.findByRole('heading', { name: 'Account is ready!' })).toBeInTheDocument();
      expect(calls).toEqual([
        { token: 'abc', password: STRONG_PASSWORD, confirmPassword: STRONG_PASSWORD },
      ]);
      expect(screen.getByRole('link', { name: 'Sign in' })).toHaveAttribute('href', '/login');
    });

    it('shows the API error, or a fallback message', async () => {
      validate({ hasAddress: true });
      server.use(http.post(SET_PASSWORD, () => apiError(400, 'Link already used'), { once: true }));
      const { user } = renderPage();
      await screen.findByText('jane@acme.com');
      await fillFields(user, {
        'New password': STRONG_PASSWORD,
        'Confirm password': STRONG_PASSWORD,
      });

      await user.click(screen.getByRole('button', { name: 'Activate account' }));
      expect(await screen.findByText('Link already used')).toBeInTheDocument();

      server.use(http.post(SET_PASSWORD, () => apiError(500, '')));
      await user.click(screen.getByRole('button', { name: 'Activate account' }));
      expect(
        await screen.findByText('Failed to set password. The link may have expired.'),
      ).toBeInTheDocument();
    });
  });

  describe('invitation flow (user provides name and address)', () => {
    it('walks through both steps and sends name, password and address', async () => {
      validate({ hasAddress: false, fullName: 'Jane Doe' });
      const calls = captureSetPassword();
      const { user } = renderPage();

      await screen.findByText('jane@acme.com');
      expect(screen.getByLabelText(/^full name/i, { selector: 'input' })).toHaveValue('Jane Doe');
      await fillFields(user, {
        'New password': STRONG_PASSWORD,
        'Confirm password': STRONG_PASSWORD,
      });
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await fillFields(user, validAddress);
      await user.click(screen.getByRole('button', { name: 'Activate account' }));

      expect(await screen.findByRole('heading', { name: 'Account is ready!' })).toBeInTheDocument();
      expect(calls).toEqual([
        {
          token: 'abc',
          password: STRONG_PASSWORD,
          confirmPassword: STRONG_PASSWORD,
          fullName: 'Jane Doe',
          address: validAddressPayload,
        },
      ]);
    });

    it('shows the API error on activation', async () => {
      validate({ hasAddress: false, fullName: 'Jane Doe' });
      server.use(http.post(SET_PASSWORD, () => apiError(400, 'Link already used')));
      const { user } = renderPage();
      await screen.findByText('jane@acme.com');
      await fillFields(user, {
        'New password': STRONG_PASSWORD,
        'Confirm password': STRONG_PASSWORD,
      });
      await user.click(screen.getByRole('button', { name: 'Next' }));
      await fillFields(user, validAddress);

      await user.click(screen.getByRole('button', { name: 'Activate account' }));

      expect(await screen.findByText('Link already used')).toBeInTheDocument();
    });

    it('goes back to the first step, and cancels to sign in', async () => {
      validate({ hasAddress: false, fullName: 'Jane Doe' });
      const { user } = renderPage();
      await screen.findByText('jane@acme.com');
      await fillFields(user, {
        'New password': STRONG_PASSWORD,
        'Confirm password': STRONG_PASSWORD,
      });
      await user.click(screen.getByRole('button', { name: 'Next' }));

      await user.click(await screen.findByRole('button', { name: 'Back' }));
      await user.click(await screen.findByRole('button', { name: 'Cancel' }));

      expect(await screen.findByTestId('location')).toHaveTextContent('/login');
    });
  });
});
