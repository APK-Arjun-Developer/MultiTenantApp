import { describe, expect, it } from 'vitest';

import { envelope, http, server } from '@/__tests__/msw/server';
import { authApi } from '@/features/auth/api/authApi';
import { login, logout } from '@/features/auth/slices/authSlice';
import {
  clearSelectedTenant,
  setSelectedTenant,
  setThemeColor,
  setThemeMode,
} from '@/features/ui/uiSlice';

import { setupStore, store } from './store';

const user = { id: 'u1', email: 'a@b.com', fullName: 'A B', roles: [] };

describe('store', () => {
  it('persists theme and tenant choices from the app store', () => {
    store.dispatch(setThemeMode('dark'));
    store.dispatch(setThemeColor('amber'));
    store.dispatch(setSelectedTenant({ id: 't1', name: 'Acme' }));

    expect(localStorage.getItem('themeMode')).toBe('dark');
    expect(localStorage.getItem('themeColor')).toBe('amber');
    expect(JSON.parse(localStorage.getItem('selectedTenant') ?? 'null')).toEqual({
      id: 't1',
      name: 'Acme',
    });

    store.dispatch(clearSelectedTenant());
    expect(localStorage.getItem('selectedTenant')).toBeNull();
  });

  it('resets ui and api cache on logout but keeps auth handling its own state', async () => {
    server.use(http.get('/api/v1/auth/me', () => envelope({ ...user, permissions: [] })));
    const testStore = setupStore();
    testStore.dispatch(login(user));
    testStore.dispatch(setSelectedTenant({ id: 't1', name: 'Acme' }));
    await testStore.dispatch(authApi.endpoints.getMe.initiate());
    expect(Object.keys(testStore.getState().api.queries)).not.toHaveLength(0);

    testStore.dispatch(logout());

    const state = testStore.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.ui.selectedTenantId).toBeNull();
    expect(Object.keys(state.api.queries)).toHaveLength(0);
  });

  it('accepts preloaded state', () => {
    const testStore = setupStore({
      ui: {
        themeMode: 'dark',
        themeColor: 'blue',
        sidebarOpen: false,
        selectedTenantId: 't9',
        selectedTenantName: 'Nine',
      },
    });

    expect(testStore.getState().ui.selectedTenantName).toBe('Nine');
  });
});
