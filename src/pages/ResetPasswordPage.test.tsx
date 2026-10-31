import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { apiError, envelope, http, server, unreachable } from '@/__tests__/msw/server';
import { renderWithProviders } from '@/__tests__/utils/renderWithProviders';

import ResetPasswordPage from './ResetPasswordPage';

const VALIDATE = '/api/v1/auth/reset-password/validate';
const RESET = '/api/v1/auth/reset-password';
const STRONG = 'Str0ng!Pass';

const renderPage = (route = '/reset-password?token=abc') =>
  renderWithProviders(<ResetPasswordPage />, { route, path: '/reset-password' });

const validToken = () =>
  server.use(http.get(VALIDATE, () => envelope({ isValid: true, email: 'jane@acme.com' })));

const fillPasswords = async (
  user: ReturnType<typeof renderPage>['user'],
  password: string,
  confirm = password,
) => {
  await user.type(await screen.findByLabelText(/^new password/i, { selector: 'input' }), password);
  await user.type(screen.getByLabelText(/^confirm new password/i, { selector: 'input' }), confirm);
  await user.click(screen.getByRole('button', { name: 'Reset password' }));
};

describe('ResetPasswordPage', () => {
  it('rejects a link without a token', () => {
    renderPage('/reset-password');

    expect(screen.getByText('No reset token found in the link.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Request a new link' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  it('shows the server reason for an invalid token', async () => {
    server.use(
      http.get(VALIDATE, () =>
        envelope({ isValid: false, errorMessage: 'This link has expired.' }),
      ),
    );
    renderPage();

    expect(await screen.findByText('This link has expired.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Link expired or invalid' })).toBeInTheDocument();
  });

  it('falls back to a default reason', async () => {
    server.use(http.get(VALIDATE, () => envelope({ isValid: false })));
    renderPage();

    expect(
      await screen.findByText('This password reset link is no longer valid.'),
    ).toBeInTheDocument();
  });

  it('shows Server unavailable instead of an invalid link when the API is down', async () => {
    server.use(http.get(VALIDATE, unreachable));
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Server unavailable' })).toBeInTheDocument();
  });

  it('resets the password, then sends the user to sign in', async () => {
    validToken();
    let body: unknown;
    server.use(
      http.post(RESET, async ({ request }) => {
        body = await request.json();
        return envelope(null);
      }),
    );
    const { user } = renderPage();

    expect(await screen.findByText('jane@acme.com')).toBeInTheDocument();
    await fillPasswords(user, STRONG);

    expect(await screen.findByRole('heading', { name: 'Password updated' })).toBeInTheDocument();
    expect(body).toEqual({ token: 'abc', newPassword: STRONG, confirmPassword: STRONG });
    expect(await screen.findByTestId('location', {}, { timeout: 3000 })).toHaveTextContent(
      '/login',
    );
  });

  it('enforces the password rules and matching confirmation', async () => {
    validToken();
    const { user } = renderPage();

    await fillPasswords(user, 'weak', 'other');

    expect(await screen.findByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText("Passwords don't match")).toBeInTheDocument();
  });

  it('shows the API error, or a fallback message', async () => {
    validToken();
    server.use(http.post(RESET, () => apiError(400, 'Token already used'), { once: true }));
    const { user } = renderPage();

    await fillPasswords(user, STRONG);
    expect(await screen.findByText('Token already used')).toBeInTheDocument();

    server.use(http.post(RESET, () => apiError(500, '')));
    await user.click(screen.getByRole('button', { name: 'Reset password' }));
    expect(
      await screen.findByText('Failed to reset password. Please try again.'),
    ).toBeInTheDocument();
  });
});
