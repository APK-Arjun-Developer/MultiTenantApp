import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/features/auth/slices/authSlice';
import uiReducer from '@/features/ui/uiSlice';
import { apiSlice } from '@/shared/api/apiSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
