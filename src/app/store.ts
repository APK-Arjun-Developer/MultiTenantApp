import { configureStore, combineReducers } from '@reduxjs/toolkit';
import type { UnknownAction } from '@reduxjs/toolkit';
import authReducer, { logout } from '@/features/auth/slices/authSlice';
import uiReducer from '@/features/ui/uiSlice';
import { apiSlice } from '@/shared/api/apiSlice';

const combinedReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

type AppState = ReturnType<typeof combinedReducer>;

function rootReducer(state: AppState | undefined, action: UnknownAction): AppState {
  if (action.type === logout.type && state) {
    // auth handles its own logout; reset ui (clears selectedTenantId) and api (clears all RTK Query cache)
    return combinedReducer({ auth: state.auth } as AppState, action);
  }
  return combinedReducer(state, action);
}

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
