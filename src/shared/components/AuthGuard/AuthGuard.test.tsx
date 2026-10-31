import { Route, Routes } from 'react-router-dom';
import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { apiError, envelope, http, server, unreachable } from '@/__tests__/msw/server';
import {
  renderWithProviders,
  signedInState,
  testUser,
} from '@/__tests__/utils/renderWithProviders';

import AuthGuard from '.';

const ME = '/api/v1/auth/me';

const renderGuard = (signedIn = true) =>
  renderWithProviders(
    <Routes>
      <Route element={<AuthGuard />}>
        <Route path="/" element={<p>Protected content</p>} />
      </Route>
      <Route path="/login" element={<p>Login page</p>} />
    </Routes>,
    signedIn ? { preloadedState: signedInState() } : {},
  );

describe('AuthGuard', () => {
  it('redirects signed-out visitors to login', () => {
    renderGuard(false);

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders the protected page once the session is verified', async () => {
    server.use(http.get(ME, () => envelope({ ...testUser, permissions: ['Users.View'] })));
    const { store } = renderGuard();

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
    expect(store.getState().auth.permissions).toEqual(['Users.View']);
  });

  it('defaults to no permissions when the session has none', async () => {
    server.use(http.get(ME, () => envelope(testUser)));
    const { store } = renderGuard();

    await screen.findByText('Protected content');
    expect(store.getState().auth.permissions).toEqual([]);
    expect(store.getState().auth.permissionsLoaded).toBe(true);
  });

  it('blocks the page with a retry when the server is unreachable', async () => {
    server.use(http.get(ME, unreachable));
    renderGuard();

    expect(await screen.findByRole('heading', { name: 'Server unavailable' })).toBeInTheDocument();
    expect(screen.queryByText('Protected content')).not.toBeInTheDocument();
  });

  it('blocks the page when the session cannot be loaded for another reason, and recovers', async () => {
    server.use(http.get(ME, () => envelope({ ...testUser, permissions: [] })));
    server.use(http.get(ME, () => apiError(500, 'Database down'), { once: true }));
    const { user } = renderGuard();

    expect(
      await screen.findByRole('heading', { name: "Couldn't load your session" }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(await screen.findByText('Protected content')).toBeInTheDocument();
  });
});
