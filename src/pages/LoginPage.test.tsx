import { fireEvent, screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { apiError, envelope, http, server } from '@/__tests__/msw/server';
import { renderWithProviders, signedInState } from '@/__tests__/utils/renderWithProviders';

import LoginPage from './LoginPage';

const LOGIN = '/api/v1/auth/login';
const VERIFY = '/api/v1/auth/verify-email';
const RESEND = '/api/v1/auth/resend-verification';

const loginResponse = {
  accessToken: 'a',
  refreshToken: 'r',
  expiresAt: '2026-11-01T00:00:00Z',
  email: 'admin@acme.com',
  fullName: 'Acme Admin',
  roles: ['Admin'],
  systemRole: 'TenantAdmin',
};

const renderLogin = (options = {}) =>
  renderWithProviders(<LoginPage />, { route: '/login', path: '/login', ...options });

const fillAndSubmit = async (
  user: ReturnType<typeof renderLogin>['user'],
  email = 'admin@acme.com',
  password = 'Password123!',
) => {
  await user.type(screen.getByRole('textbox', { name: /email address/i }), email);
  await user.type(screen.getByLabelText(/^password/i, { selector: 'input' }), password);
  await user.click(screen.getByRole('button', { name: 'Sign in' }));
};

const otpInputs = () =>
  screen.getAllByRole('textbox').filter((el) => el.getAttribute('maxlength') === '1');

/** Logs in with an unverified account to reach the verify step. */
const goToVerifyStep = async () => {
  server.use(
    http.post(LOGIN, () => apiError(400, 'Email has not been verified.')),
    http.post(RESEND, () => envelope(null)),
  );
  const view = renderLogin();
  await fillAndSubmit(view.user, 'new@acme.com');
  await screen.findByRole('heading', { name: 'Verify your email' });
  return view;
};

describe('LoginPage', () => {
  it('redirects to the dashboard when already signed in', () => {
    renderLogin({ preloadedState: signedInState() });

    expect(screen.getByTestId('location')).toHaveTextContent('/dashboard');
  });

  it('signs in and navigates to the dashboard', async () => {
    server.use(http.post(LOGIN, () => envelope(loginResponse)));
    const { user, store } = renderLogin();

    await fillAndSubmit(user);

    expect(await screen.findByTestId('location')).toHaveTextContent('/dashboard');
    expect(store.getState().auth.user?.email).toBe('admin@acme.com');
  });

  it('validates the form before calling the API', async () => {
    const { user } = renderLogin();

    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid email address')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows the API error for wrong credentials', async () => {
    server.use(http.post(LOGIN, () => apiError(401, 'Invalid email or password.')));
    const { user } = renderLogin();

    await fillAndSubmit(user);

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
  });

  it('falls back to a generic message when the error has none', async () => {
    server.use(http.post(LOGIN, () => apiError(401, '')));
    const { user } = renderLogin();

    await fillAndSubmit(user);

    expect(
      await screen.findByText('Invalid credentials. Please check your email and password.'),
    ).toBeInTheDocument();
  });

  it('links to forgot password', () => {
    renderLogin();

    expect(screen.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute(
      'href',
      '/forgot-password',
    );
  });

  describe('email verification', () => {
    it('moves unverified users to the code step and sends a code silently', async () => {
      let resent = 0;
      server.use(
        http.post(LOGIN, () => apiError(400, 'Email has not been verified.')),
        http.post(RESEND, () => {
          resent += 1;
          return envelope(null);
        }),
      );
      const { user } = renderLogin();

      await fillAndSubmit(user, 'new@acme.com');

      expect(await screen.findByRole('heading', { name: 'Verify your email' })).toBeInTheDocument();
      expect(screen.getByText('new@acme.com')).toBeInTheDocument();
      await waitFor(() => expect(resent).toBe(1));
      expect(await screen.findByText(/Resend code in/)).toBeInTheDocument();
      expect(screen.queryByText('A new code has been sent to your email.')).not.toBeInTheDocument();
    });

    it('verifies the code and returns to sign in', async () => {
      let body: unknown;
      server.use(
        http.post(VERIFY, async ({ request }) => {
          body = await request.json();
          return envelope(null);
        }),
      );
      const { user } = await goToVerifyStep();
      const verify = screen.getByRole('button', { name: 'Verify email' });
      expect(verify).toBeDisabled();

      await user.click(otpInputs()[0]);
      await user.keyboard('123456');
      expect(verify).toBeEnabled();
      await user.click(verify);

      expect(await screen.findByText('Email verified! You can now sign in.')).toBeInTheDocument();
      expect(body).toEqual({ email: 'new@acme.com', otp: '123456' });
      expect(await screen.findByText('Sign in to your account')).toBeInTheDocument();
    });

    it('shows an error for a wrong code', async () => {
      server.use(http.post(VERIFY, () => apiError(400, 'Invalid or expired code.')));
      const { user } = await goToVerifyStep();

      await user.click(otpInputs()[0]);
      await user.keyboard('654321');
      await user.click(screen.getByRole('button', { name: 'Verify email' }));

      expect(await screen.findByText('Invalid or expired code.')).toBeInTheDocument();
    });

    it('accepts a pasted code, ignoring non-digits', async () => {
      await goToVerifyStep();

      fireEvent.paste(otpInputs()[0], { clipboardData: { getData: () => '12-34 56' } });

      expect(
        otpInputs()
          .map((el) => (el as HTMLInputElement).value)
          .join(''),
      ).toBe('123456');
      expect(screen.getByRole('button', { name: 'Verify email' })).toBeEnabled();
    });

    it('ignores a paste with no digits', async () => {
      await goToVerifyStep();

      fireEvent.paste(otpInputs()[0], { clipboardData: { getData: () => 'abc' } });

      expect(otpInputs().every((el) => (el as HTMLInputElement).value === '')).toBe(true);
    });

    it('supports backspace and arrow-key navigation between digits', async () => {
      const { user } = await goToVerifyStep();
      const inputs = otpInputs();

      await user.click(inputs[0]);
      await user.keyboard('12');
      expect(inputs[2]).toHaveFocus();

      await user.keyboard('{Backspace}');
      expect(inputs[1]).toHaveFocus();
      await user.keyboard('{Backspace}');
      expect((inputs[1] as HTMLInputElement).value).toBe('');

      await user.keyboard('{ArrowLeft}');
      expect(inputs[0]).toHaveFocus();
      await user.keyboard('{ArrowRight}');
      expect(inputs[1]).toHaveFocus();
    });

    it('offers Resend when the automatic send failed, and confirms a resend', async () => {
      server.use(
        http.post(LOGIN, () => apiError(400, 'Email has not been verified.')),
        http.post(RESEND, () => apiError(500, 'Mail server down'), { once: true }),
      );
      const { user } = renderLogin();
      await fillAndSubmit(user, 'new@acme.com');
      server.use(http.post(RESEND, () => envelope(null)));

      await user.click(await screen.findByRole('button', { name: 'Resend code' }));

      expect(
        await screen.findByText('A new code has been sent to your email.'),
      ).toBeInTheDocument();
      expect(screen.getByText(/Resend code in/)).toBeInTheDocument();
    });

    it('goes back to sign in from the code step', async () => {
      const { user } = await goToVerifyStep();

      await user.click(screen.getByRole('button', { name: 'Back to sign in' }));

      expect(await screen.findByText('Sign in to your account')).toBeInTheDocument();
    });
  });
});
