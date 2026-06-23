import { apiSlice } from '@/shared/api/apiSlice';
import type {
  PaginatedResponse,
  UserDto,
  UserInvitationDto,
  CreateTenantUserRequest,
  CreateTenantUserResponse,
  InviteTenantUserRequest,
  InviteUserResponse,
  UpdateUserRequest,
  DeleteUserRequest,
} from '@/types/api';

export interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface GetUserInvitationsParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<UserDto>, GetUsersParams | void>({
      query: (params) => ({
        url: '/api/v1/users',
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
        },
      }),
      providesTags: ['User'],
    }),

    createUser: builder.mutation<CreateTenantUserResponse, CreateTenantUserRequest>({
      query: (body) => ({
        url: '/api/v1/users/direct-create',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['User'],
    }),

    inviteUser: builder.mutation<InviteUserResponse, InviteTenantUserRequest>({
      query: (body) => ({
        url: '/api/v1/users/invite',
        method: 'POST',
        data: body,
      }),
      invalidatesTags: ['User', 'Invitation'],
    }),

    updateUser: builder.mutation<UserDto, UpdateUserRequest>({
      query: (body) => ({
        url: '/api/v1/users',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['User'],
    }),

    deleteUser: builder.mutation<void, DeleteUserRequest>({
      query: (body) => ({
        url: '/api/v1/users',
        method: 'DELETE',
        data: body,
      }),
      invalidatesTags: ['User'],
    }),

    resendUserSetup: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/api/v1/users/${userId}/resend`,
        method: 'POST',
      }),
    }),

    activateUser: builder.mutation<UserDto, string>({
      query: (userId) => ({
        url: `/api/v1/users/${userId}/activate`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    deactivateUser: builder.mutation<UserDto, string>({
      query: (userId) => ({
        url: `/api/v1/users/${userId}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: ['User'],
    }),

    getUserInvitations: builder.query<
      PaginatedResponse<UserInvitationDto>,
      GetUserInvitationsParams | void
    >({
      query: (params) => ({
        url: '/api/v1/users/invitations',
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          status: params?.status,
        },
      }),
      providesTags: ['Invitation'],
    }),

    revokeUserInvitation: builder.mutation<void, string>({
      query: (invitationId) => ({
        url: `/api/v1/users/invitations/${invitationId}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: ['Invitation'],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useInviteUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResendUserSetupMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useGetUserInvitationsQuery,
  useRevokeUserInvitationMutation,
} = usersApi;
