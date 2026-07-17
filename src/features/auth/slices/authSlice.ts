import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { RootState } from '@/app/store';
import type { AuthUser, ImpersonatedByInfo } from '@/types/api';

interface AuthState {
  user: AuthUser | null;
  permissions: string[];
  permissionsLoaded: boolean;
  isAuthenticated: boolean;
  isImpersonating: boolean;
  impersonatedBy: ImpersonatedByInfo | null;
}

const USER_KEY = 'auth.user';

const readUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
};

const storedUser = readUser();

const initialState: AuthState = {
  user: storedUser,
  permissions: [],
  permissionsLoaded: false,
  isAuthenticated: Boolean(storedUser),
  isImpersonating: false,
  impersonatedBy: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isImpersonating = false;
      state.impersonatedBy = null;
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.permissions = [];
      state.permissionsLoaded = false;
      state.isAuthenticated = false;
      state.isImpersonating = false;
      state.impersonatedBy = null;
      localStorage.removeItem(USER_KEY);
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
      state.permissionsLoaded = true;
    },
    setImpersonation: (
      state,
      action: PayloadAction<{ user: AuthUser; impersonatedBy: ImpersonatedByInfo }>,
    ) => {
      state.user = action.payload.user;
      state.isImpersonating = true;
      state.impersonatedBy = action.payload.impersonatedBy;
      state.permissions = [];
      state.permissionsLoaded = false;
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload.user));
    },
    clearImpersonation: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isImpersonating = false;
      state.impersonatedBy = null;
      state.permissions = [];
      state.permissionsLoaded = false;
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
    },
  },
});

const { login, logout, setPermissions, setImpersonation, clearImpersonation } = authSlice.actions;

const selectCurrentUser = (state: RootState) => state.auth.user;
const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
const selectPermissions = (state: RootState) => state.auth.permissions;
const selectPermissionsLoaded = (state: RootState) => state.auth.permissionsLoaded;
const selectIsImpersonating = (state: RootState) => state.auth.isImpersonating;
const selectImpersonatedBy = (state: RootState) => state.auth.impersonatedBy;

export {
  clearImpersonation,
  login,
  logout,
  selectCurrentUser,
  selectImpersonatedBy,
  selectIsAuthenticated,
  selectIsImpersonating,
  selectPermissions,
  selectPermissionsLoaded,
  setImpersonation,
  setPermissions,
};
export default authSlice.reducer;
