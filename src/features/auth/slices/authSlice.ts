import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';
import type { AuthUser } from '@/types/api';

interface AuthState {
  user: AuthUser | null;
  permissions: string[];
  permissionsLoaded: boolean;
  isAuthenticated: boolean;
}

const USER_KEY = 'auth.user';

function readUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

const storedUser = readUser();

const initialState: AuthState = {
  user: storedUser,
  permissions: [],
  permissionsLoaded: false,
  isAuthenticated: Boolean(storedUser),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<AuthUser>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem(USER_KEY, JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.user = null;
      state.permissions = [];
      state.permissionsLoaded = false;
      state.isAuthenticated = false;
      localStorage.removeItem(USER_KEY);
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload;
      state.permissionsLoaded = true;
    },
  },
});

export const { login, logout, setPermissions } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectPermissions = (state: RootState) => state.auth.permissions;
export const selectPermissionsLoaded = (state: RootState) => state.auth.permissionsLoaded;
