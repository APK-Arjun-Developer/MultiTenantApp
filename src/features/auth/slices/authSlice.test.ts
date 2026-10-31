import { beforeEach, describe, expect, it } from 'vitest';

import type { AuthUser } from '@/types/api';

import authReducer, { login, logout, setPermissions } from './authSlice';

const user: AuthUser = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'jane@acme.com',
  fullName: 'Jane Doe',
  roles: ['Admin'],
  systemRole: 'TenantAdmin',
};

const initial = authReducer(undefined, { type: '@@init' });

beforeEach(() => {
  localStorage.clear();
});

describe('authSlice', () => {
  it('login stores the user and marks the session authenticated', () => {
    const state = authReducer(initial, login(user));

    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
    expect(JSON.parse(localStorage.getItem('auth.user') ?? 'null')).toEqual(user);
  });

  it('setPermissions marks permissions as loaded', () => {
    const state = authReducer(initial, setPermissions(['Users.View']));

    expect(state.permissions).toEqual(['Users.View']);
    expect(state.permissionsLoaded).toBe(true);
  });

  it('logout clears the session and persisted user', () => {
    const loggedIn = authReducer(authReducer(initial, login(user)), setPermissions(['Users.View']));

    const state = authReducer(loggedIn, logout());

    expect(state).toMatchObject({
      user: null,
      permissions: [],
      permissionsLoaded: false,
      isAuthenticated: false,
    });
    expect(localStorage.getItem('auth.user')).toBeNull();
  });
});
