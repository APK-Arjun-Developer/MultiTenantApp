import { createMemoryRouter, data, RouterProvider } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import ErrorPage from '.';

afterEach(() => {
  vi.restoreAllMocks();
});

/** Renders a route whose loader fails with `failure`, handled by ErrorPage. */
const renderFailingRoute = (failure: () => never) => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  const router = createMemoryRouter(
    [
      { path: '/broken', loader: failure, element: null, errorElement: <ErrorPage /> },
      { path: '/dashboard', element: <p>Dashboard home</p> },
    ],
    { initialEntries: ['/broken'] },
  );
  render(<RouterProvider router={router} />);
  return router;
};

describe('ErrorPage', () => {
  it('shows a thrown error message and leads back to the dashboard', async () => {
    const router = renderFailingRoute(() => {
      throw new Error('Chunk failed to load');
    });

    expect(await screen.findByText('Chunk failed to load')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Back to Dashboard' }));

    expect(await screen.findByText('Dashboard home')).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/dashboard');
  });

  it('shows route error responses (text body or status text)', async () => {
    renderFailingRoute(() => {
      throw data('Tenant not found', { status: 404 });
    });
    expect(await screen.findByText('Tenant not found')).toBeInTheDocument();
  });

  it('falls back to the status text for non-text error data', async () => {
    renderFailingRoute(() => {
      throw data({ code: 1 }, { status: 403, statusText: 'Forbidden' });
    });
    expect(await screen.findByText('Forbidden')).toBeInTheDocument();
  });

  it('has a generic message for unknown errors', async () => {
    renderFailingRoute(() => {
      throw 'boom' as never;
    });
    expect(await screen.findByText('An unexpected error occurred.')).toBeInTheDocument();
  });
});
