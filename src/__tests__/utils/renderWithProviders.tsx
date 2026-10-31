import type { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';
import {
  createMemoryRouter,
  MemoryRouter,
  Route,
  RouterProvider,
  Routes,
  useLocation,
} from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { routes } from '@/app/router';
import { type AppStore, type RootState, setupStore } from '@/app/store';
import { SnackbarProvider } from '@/shared/components';
import { buildTheme } from '@/shared/theme';
import type { AuthUser } from '@/types/api';

interface ProviderOptions extends Omit<RenderOptions, 'wrapper'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
  /** Initial URL, e.g. '/users?page=2'. */
  route?: string;
  /**
   * Mounts `ui` as a route with this path (e.g. '/login'). Navigating anywhere else renders
   * a `location` test id holding the new pathname + search, so redirects can be asserted.
   */
  path?: string;
}

const theme = buildTheme('light');

const LocationDisplay = () => {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}`}</div>;
};

/** Renders UI with the same providers as the app: Redux store, router, MUI theme and snackbars. */
const renderWithProviders = (
  ui: ReactElement,
  {
    preloadedState,
    store = setupStore(preloadedState),
    route = '/',
    path,
    ...options
  }: ProviderOptions = {},
) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>
  );

  const tree = path ? (
    <Routes>
      <Route path={path} element={ui} />
      <Route path="*" element={<LocationDisplay />} />
    </Routes>
  ) : (
    ui
  );

  return { store, user: userEvent.setup(), ...render(tree, { wrapper: Wrapper, ...options }) };
};

/**
 * Renders the real app routes (layouts, guards, lazy pages) at `url` in a memory data router,
 * with the same providers as the app.
 */
const renderApp = (
  url: string,
  { preloadedState, store = setupStore(preloadedState) }: ProviderOptions = {},
) => {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  const view = render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <RouterProvider router={router} />
        </SnackbarProvider>
      </ThemeProvider>
    </Provider>,
  );
  return { store, router, user: userEvent.setup(), ...view };
};

const testUser: AuthUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@acme.com',
  fullName: 'Acme Admin',
  roles: ['Admin'],
  systemRole: 'TenantAdmin',
};

/** Preloaded auth state for a signed-in user with the given permissions. */
const signedInState = (
  permissions: string[] = [],
  user: AuthUser = testUser,
): Partial<RootState> => ({
  auth: {
    user,
    permissions,
    permissionsLoaded: true,
    isAuthenticated: true,
    isImpersonating: false,
    impersonatedBy: null,
  },
});

export { renderApp, renderWithProviders, signedInState, testUser };
