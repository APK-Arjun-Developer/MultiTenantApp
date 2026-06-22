import { apiSlice } from '@/shared/api/apiSlice';
import { login, logout } from '@/features/auth/slices/authSlice';
import type {
  AcceptInvitationResponse,
  AcceptTenantAdminInvitationRequest,
  AcceptTenantUserInvitationRequest,
  AuthUser,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  ResendEmailOtpRequest,
  ResetPasswordRequest,
  SetPasswordRequest,
  SetPasswordResponse,
  ValidateAccountSetupResponse,
  ValidateInvitationResponse,
  ValidateResetTokenResponse,
  VerifyEmailOtpRequest,
} from '@/types/api';

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<AuthUser, void>({
      query: () => ({ url: '/api/v1/auth/me', method: 'GET' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(login(data));
        } catch {
          // 401 handled by baseQueryWithReauth — it will dispatch logout() automatically
        }
      },
    }),

    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({ url: '/api/v1/auth/login', method: 'POST', data: body }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Server returns a flat response; id comes from /auth/me on the next load.
          const user: AuthUser = {
            id: '',
            email: data.email,
            fullName: data.fullName,
            roles: data.roles,
            tenantSlug: null,
          };
          dispatch(login(user));
        } catch {
          // rejection surfaced to the caller via the mutation result
        }
      },
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: '/api/v1/auth/logout', method: 'POST' }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(logout());
        }
      },
    }),

    verifyEmail: builder.mutation<void, VerifyEmailOtpRequest>({
      query: (body) => ({ url: '/api/v1/auth/verify-email', method: 'POST', data: body }),
    }),

    resendVerification: builder.mutation<void, ResendEmailOtpRequest>({
      query: (body) => ({ url: '/api/v1/auth/resend-verification', method: 'POST', data: body }),
    }),

    forgotPassword: builder.mutation<void, ForgotPasswordRequest>({
      query: (body) => ({ url: '/api/v1/auth/forgot-password', method: 'POST', data: body }),
    }),

    validateResetToken: builder.query<ValidateResetTokenResponse, string>({
      query: (token) => ({ url: '/api/v1/auth/reset-password/validate', params: { token } }),
    }),

    resetPassword: builder.mutation<void, ResetPasswordRequest>({
      query: (body) => ({ url: '/api/v1/auth/reset-password', method: 'POST', data: body }),
    }),

    validateInvitation: builder.query<ValidateInvitationResponse, string>({
      query: (token) => ({ url: '/api/v1/invitations/validate', params: { token } }),
    }),

    acceptTenantAdminInvitation: builder.mutation<
      AcceptInvitationResponse,
      AcceptTenantAdminInvitationRequest
    >({
      query: (body) => ({
        url: '/api/v1/invitations/accept/tenant-admin',
        method: 'POST',
        data: body,
      }),
    }),

    acceptTenantUserInvitation: builder.mutation<
      AcceptInvitationResponse,
      AcceptTenantUserInvitationRequest
    >({
      query: (body) => ({
        url: '/api/v1/invitations/accept/user',
        method: 'POST',
        data: body,
      }),
    }),

    validateAccountSetup: builder.query<ValidateAccountSetupResponse, string>({
      query: (token) => ({ url: '/api/v1/account-setup/validate', params: { token } }),
    }),

    setPassword: builder.mutation<SetPasswordResponse, SetPasswordRequest>({
      query: (body) => ({ url: '/api/v1/account-setup/set-password', method: 'POST', data: body }),
    }),
  }),
});

export const {
  useGetMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useValidateResetTokenQuery,
  useResetPasswordMutation,
  useValidateInvitationQuery,
  useAcceptTenantAdminInvitationMutation,
  useAcceptTenantUserInvitationMutation,
  useValidateAccountSetupQuery,
  useSetPasswordMutation,
} = authApi;
