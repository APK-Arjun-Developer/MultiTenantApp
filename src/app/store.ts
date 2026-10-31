import {
  combineReducers,
  configureStore,
  type Reducer,
  type UnknownAction,
} from '@reduxjs/toolkit';

import authReducer, { logout } from '@/features/auth/slices/authSlice';
import uiReducer, {
  SELECTED_TENANT_STORAGE_KEY,
  THEME_COLOR_STORAGE_KEY,
  THEME_STORAGE_KEY,
} from '@/features/ui/uiSlice';
import { apiSlice } from '@/shared/api/apiSlice';
import { storage } from '@/shared/utils/storage';

const combinedReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

type AppState = ReturnType<typeof combinedReducer>;

const rootReducer: Reducer<AppState, UnknownAction, Partial<AppState>> = (state, action) => {
  if (action.type === logout.type && state) {
    // auth handles its own logout; reset ui (clears selectedTenantId) and api (clears all RTK Query cache)
    return combinedReducer({ auth: state.auth }, action);
  }
  return combinedReducer(state, action);
};

const setupStore = (preloadedState?: Partial<AppState>) =>
  configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
  });

const store = setupStore();

// Persist ui preferences to localStorage so they survive page reloads.
let prevTenantId: string | null = store.getState().ui.selectedTenantId;
let prevThemeMode: string = store.getState().ui.themeMode;
let prevThemeColor: string = store.getState().ui.themeColor;
store.subscribe(() => {
  const { selectedTenantId, selectedTenantName, themeMode, themeColor } = store.getState().ui;

  if (selectedTenantId !== prevTenantId) {
    prevTenantId = selectedTenantId;
    if (selectedTenantId) {
      storage.setJson(SELECTED_TENANT_STORAGE_KEY, {
        id: selectedTenantId,
        name: selectedTenantName,
      });
    } else {
      storage.remove(SELECTED_TENANT_STORAGE_KEY);
    }
  }

  if (themeMode !== prevThemeMode) {
    prevThemeMode = themeMode;
    storage.set(THEME_STORAGE_KEY, themeMode);
  }

  if (themeColor !== prevThemeColor) {
    prevThemeColor = themeColor;
    storage.set(THEME_COLOR_STORAGE_KEY, themeColor);
  }
});

type RootState = ReturnType<typeof store.getState>;
type AppDispatch = typeof store.dispatch;
type AppStore = ReturnType<typeof setupStore>;

export { type AppDispatch, type AppStore, type RootState, setupStore, store };
