import { screen, waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { apiError, envelope, http, server } from '@/__tests__/msw/server';
import { capture } from '@/__tests__/utils/api';
import {
  renderWithProviders,
  signedInState,
  testUser,
} from '@/__tests__/utils/renderWithProviders';
import type { RootState } from '@/app/store';
import type { SystemRole, TenantConfigDto } from '@/types/api';

import SettingsPage from './SettingsPage';

const OWN_CONFIG = '/api/v1/tenant-settings/config';
const ADMIN_CONFIG = '/api/v1/tenants/t1/config';

const config: TenantConfigDto = {
  tenantId: 't1',
  loginEnabled: true,
  welcomeEmailEnabled: false,
  maintenanceMode: false,
  maintenanceMessage: null,
};

const stateFor = (systemRole: SystemRole, selectedTenantId: string | null = null) => {
  const state = signedInState([], { ...testUser, systemRole });
  return {
    ...state,
    ui: {
      themeMode: 'light',
      themeColor: 'violet',
      sidebarOpen: true,
      selectedTenantId,
      selectedTenantName: selectedTenantId ? 'Acme' : null,
    },
  } as Partial<RootState>;
};

const renderPage = (preloadedState: Partial<RootState>, route = '/settings') =>
  renderWithProviders(<SettingsPage />, { route, preloadedState });

const save = () => screen.getByRole('button', { name: 'Save changes' });

describe('SettingsPage', () => {
  describe('appearance', () => {
    it('switches the accent color and display mode', async () => {
      const { user, store } = renderPage(stateFor('TenantUser'));

      await user.click(screen.getByRole('button', { name: 'Teal' }));
      await user.click(screen.getByRole('button', { name: 'Dark mode' }));

      expect(store.getState().ui.themeColor).toBe('teal');
      expect(store.getState().ui.themeMode).toBe('dark');
      expect(screen.getByRole('button', { name: 'Teal' })).toHaveAttribute('aria-pressed', 'true');
    });

    it('has no configuration tab for regular users, even when linked to it', () => {
      renderPage(stateFor('TenantUser'), '/settings?tab=configuration');

      expect(screen.queryByRole('tab', { name: 'Configuration' })).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Appearance' })).toBeInTheDocument();
    });
  });

  describe('tenant admin configuration', () => {
    it('saves only the changed login and email settings', async () => {
      server.use(http.get(OWN_CONFIG, () => envelope(config)));
      const bodies = capture('put', OWN_CONFIG, config);
      const { user } = renderPage(stateFor('TenantAdmin'), '/settings?tab=configuration');

      const welcome = await screen.findByRole('switch', { name: 'Welcome email' });
      expect(save()).toBeDisabled();
      expect(screen.queryByRole('switch', { name: 'Maintenance mode' })).not.toBeInTheDocument();

      await user.click(welcome);
      expect(save()).toBeEnabled();
      await user.click(save());

      expect(await screen.findByText('Configuration saved.')).toBeInTheDocument();
      expect(bodies).toEqual([{ loginEnabled: true, welcomeEmailEnabled: true }]);
    });

    it('shows the API error, or a fallback message', async () => {
      server.use(
        http.get(OWN_CONFIG, () => envelope(config)),
        http.put(OWN_CONFIG, () => apiError(400, 'Not allowed'), { once: true }),
      );
      const { user } = renderPage(stateFor('TenantAdmin'), '/settings?tab=configuration');

      await user.click(await screen.findByRole('switch', { name: 'Login enabled' }));
      await user.click(save());
      expect(await screen.findByText('Not allowed')).toBeInTheDocument();

      server.use(http.put(OWN_CONFIG, () => apiError(500, '')));
      await user.click(save());
      expect(await screen.findByText('Failed to save configuration.')).toBeInTheDocument();
    });
  });

  describe('system admin configuration', () => {
    it('asks to pick a tenant first', () => {
      renderPage(stateFor('SystemAdmin'), '/settings?tab=configuration');

      expect(screen.getByText(/Select a tenant from the picker/)).toBeInTheDocument();
    });

    it('turns on maintenance mode with a message for the selected tenant', async () => {
      server.use(http.get(ADMIN_CONFIG, () => envelope(config)));
      const bodies = capture('put', ADMIN_CONFIG, config);
      const { user } = renderPage(stateFor('SystemAdmin', 't1'), '/settings?tab=configuration');

      await user.click(await screen.findByRole('switch', { name: 'Maintenance mode' }));
      await user.type(screen.getByRole('textbox', { name: 'Maintenance message' }), 'Back at 6pm');
      await user.click(save());

      expect(await screen.findByText('Configuration saved.')).toBeInTheDocument();
      expect(bodies).toEqual([
        {
          loginEnabled: true,
          welcomeEmailEnabled: false,
          maintenanceMode: true,
          maintenanceMessage: 'Back at 6pm',
        },
      ]);
    });

    it('sends no message when maintenance has none, and reports failures', async () => {
      server.use(http.get(ADMIN_CONFIG, () => envelope(config)));
      const bodies = capture('put', ADMIN_CONFIG, config);
      // Added last, so it answers first: the first save fails, the retry succeeds.
      server.use(http.put(ADMIN_CONFIG, () => apiError(500, ''), { once: true }));
      const { user } = renderPage(stateFor('SystemAdmin', 't1'), '/settings?tab=configuration');

      await user.click(await screen.findByRole('switch', { name: 'Maintenance mode' }));
      await user.click(save());
      expect(await screen.findByText('Failed to save configuration.')).toBeInTheDocument();

      await user.click(save());
      await waitFor(() => expect(bodies).toHaveLength(1));
      expect(bodies[0]).toMatchObject({ maintenanceMode: true, maintenanceMessage: null });
    });
  });
});
