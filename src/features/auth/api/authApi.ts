import { apiSlice } from '@/shared/api/apiSlice';
import { login, logout } from '@/features/auth/slices/authSlice';
import type {
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ResetPasswordRequest,
} from '@/types/api';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/api/v1/auth/login', method: 'POST', data: body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(login(data));
        } catch {
          // rejection is surfaced to the caller via the mutation's own result/error state
        }
      },
    }),
    logout: builder.mutation<void, LogoutRequest>({
      query: (body) => ({ url: '/api/v1/auth/logout', method: 'POST', data: body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout());
        }
      },
    }),
    refresh: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (body) => ({ url: '/api/v1/auth/refresh', method: 'POST', data: body }),
    }),
    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (body) => ({ url: '/api/v1/auth/forgot-password', method: 'POST', data: body }),
    }),
    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: '/api/v1/auth/reset-password', method: 'POST', data: body }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
} = authApi;
