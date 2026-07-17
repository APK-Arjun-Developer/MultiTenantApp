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
  UpdateCurrentUserRequest,
  ChangePasswordRequest,
  DeleteUserRequest,
} from '@/types/api';

interface GetUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  createdVia?: 'Direct' | 'Invitation';
}

interface GetUserInvitationsParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

const usersApi = apiSlice.injectEndpoints({
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
          isActive: params?.isActive,
          createdVia: params?.createdVia,
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

    resendUserInvitation: builder.mutation<void, string>({
      query: (invitationId) => ({
        url: `/api/v1/users/invitations/${invitationId}/resend`,
        method: 'POST',
      }),
    }),

    getCurrentUser: builder.query<UserDto, void>({
      query: () => ({ url: '/api/v1/users/current', skipTenantHeader: true }),
      providesTags: ['User'],
    }),

    updateCurrentUser: builder.mutation<UserDto, UpdateCurrentUserRequest>({
      query: (body) => ({
        url: '/api/v1/users/current',
        method: 'PUT',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['User'],
    }),

    changePassword: builder.mutation<void, ChangePasswordRequest>({
      query: (body) => ({
        url: '/api/v1/users/current/change-password',
        method: 'POST',
        data: body,
        skipTenantHeader: true,
      }),
    }),

    uploadCurrentUserAvatar: builder.mutation<UserDto, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return {
          url: '/api/v1/users/current/avatar',
          method: 'POST',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
          skipTenantHeader: true,
        };
      },
      invalidatesTags: ['User'],
    }),

    removeCurrentUserAvatar: builder.mutation<UserDto, void>({
      query: () => ({
        url: '/api/v1/users/current/avatar',
        method: 'DELETE',
        skipTenantHeader: true,
      }),
      invalidatesTags: ['User'],
    }),

    uploadUserAvatarByAdmin: builder.mutation<UserDto, { userId: string; file: File }>({
      query: ({ userId, file }) => {
        const formData = new FormData();
        formData.append('avatar', file);
        return {
          url: `/api/v1/users/${userId}/avatar`,
          method: 'POST',
          data: formData,
          headers: { 'Content-Type': 'multipart/form-data' },
        };
      },
      invalidatesTags: ['User'],
    }),

    removeUserAvatarByAdmin: builder.mutation<UserDto, string>({
      query: (userId) => ({
        url: `/api/v1/users/${userId}/avatar`,
        method: 'DELETE',
      }),
      invalidatesTags: ['User'],
    }),
  }),
});

const {
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
  useResendUserInvitationMutation,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useChangePasswordMutation,
  useUploadCurrentUserAvatarMutation,
  useRemoveCurrentUserAvatarMutation,
  useUploadUserAvatarByAdminMutation,
  useRemoveUserAvatarByAdminMutation,
} = usersApi;

const getUserAvatarUrl = (userId: string): string => {
  return `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/${userId}/avatar`;
};

export {
  usersApi,
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
  useResendUserInvitationMutation,
  useGetCurrentUserQuery,
  useUpdateCurrentUserMutation,
  useChangePasswordMutation,
  useUploadCurrentUserAvatarMutation,
  useRemoveCurrentUserAvatarMutation,
  useUploadUserAvatarByAdminMutation,
  useRemoveUserAvatarByAdminMutation,
  getUserAvatarUrl,
  type GetUsersParams,
  type GetUserInvitationsParams,
};
