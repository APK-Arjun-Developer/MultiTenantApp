import { apiSlice } from '@/shared/api/apiSlice';
import type {
  UUID,
  UserDto,
  CreateUserRequest,
  UpdateUserRequest,
  DeleteUserRequest,
  InviteTenantUserRequest,
  InvitationDto,
  PaginatedResponse,
  PaginationParams,
} from '@/types/api';

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<PaginatedResponse<UserDto>, PaginationParams>({
      query: (params) => ({ url: '/api/v1/users', params }),
      providesTags: (result) =>
        result
          ? [
              ...result.items.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    getCurrentUser: builder.query<UserDto, void>({
      query: () => ({ url: '/api/v1/users/current' }),
      providesTags: [{ type: 'User', id: 'CURRENT' }],
    }),
    createUser: builder.mutation<UserDto, CreateUserRequest>({
      query: (body) => ({ url: '/api/v1/users', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    updateUser: builder.mutation<UserDto, UpdateUserRequest>({
      query: (body) => ({ url: '/api/v1/users', method: 'PUT', data: body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    deleteUser: builder.mutation<void, DeleteUserRequest>({
      query: (body) => ({ url: '/api/v1/users', method: 'DELETE', data: body }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    activateUser: builder.mutation<void, string>({
      query: (email) => ({
        url: `/api/v1/users/${encodeURIComponent(email)}/activate`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    deactivateUser: builder.mutation<void, string>({
      query: (email) => ({
        url: `/api/v1/users/${encodeURIComponent(email)}/deactivate`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    inviteUser: builder.mutation<InvitationDto, InviteTenantUserRequest>({
      query: (body) => ({ url: '/api/v1/users/invite', method: 'POST', data: body }),
      invalidatesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),
    getInvitations: builder.query<InvitationDto[], void>({
      query: () => ({ url: '/api/v1/users/invitations' }),
      providesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),
    revokeInvitation: builder.mutation<void, UUID>({
      query: (id) => ({ url: `/api/v1/users/invitations/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Invitation', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetCurrentUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useActivateUserMutation,
  useDeactivateUserMutation,
  useInviteUserMutation,
  useGetInvitationsQuery,
  useRevokeInvitationMutation,
} = usersApi;
