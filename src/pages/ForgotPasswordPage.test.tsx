import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { apiError, envelope, http, server } from '@/__tests__/msw/server';
import { renderWithProviders } from '@/__tests__/utils/renderWithProviders';

import ForgotPasswordPage from './ForgotPasswordPage';

const FORGOT = '/api/v1/auth/forgot-password';

const renderPage = () => renderWithProviders(<ForgotPasswordPage />);

describe('ForgotPasswordPage', () => {
  it('sends the reset link and shows the inbox confirmation', async () => {
    let body: unknown;
    server.use(
      http.post(FORGOT, async ({ request }) => {
        body = await request.json();
        return envelope(null);
      }),
    );
    const { user } = renderPage();

    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'jane@acme.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByRole('heading', { name: 'Check your inbox' })).toBeInTheDocument();
    expect(screen.getByText('jane@acme.com')).toBeInTheDocument();
    expect(body).toEqual({ email: 'jane@acme.com' });
  });

  it('lets the user try a different email', async () => {
    server.use(http.post(FORGOT, () => envelope(null)));
    const { user } = renderPage();
    await user.type(screen.getByRole('textbox', { name: /email address/i }), 'jane@acme.com');
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    await user.click(await screen.findByRole('button', { name: 'Try a different email' }));

    expect(await screen.findByRole('heading', { name: 'Reset your password' })).toBeInTheDocument();
  });

  it('validates the email before calling the API', async () => {
    const { user } = renderPage();

    await user.click(screen.getByRole('button', { name: 'Send reset link' }));

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
  });

  it('shows the API error, or a fallback message', async () => {
    server.use(http.post(FORGOT, () => apiError(429, 'Too many requests'), { once: true }));
    const { user } = renderPage();
    const email = screen.getByRole('textbox', { name: /email address/i });
    await user.type(email, 'jane@acme.com');

    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(await screen.findByText('Too many requests')).toBeInTheDocument();

    server.use(http.post(FORGOT, () => apiError(404, '')));
    await user.click(screen.getByRole('button', { name: 'Send reset link' }));
    expect(
      await screen.findByText('No account found with that email address.'),
    ).toBeInTheDocument();
  });

  it('links back to sign in', () => {
    renderPage();

    expect(screen.getByRole('link', { name: 'Back to sign in' })).toHaveAttribute('href', '/login');
  });
});
