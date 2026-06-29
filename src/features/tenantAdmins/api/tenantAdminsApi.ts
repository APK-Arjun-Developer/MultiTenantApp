import { apiSlice } from '@/shared/api/apiSlice';
import type {
  PaginatedResponse,
  TenantAdminDto,
  TenantAdminInvitationDto,
  CreateTenantAdminRequest,
  CreateTenantAdminResponse,
  InviteTenantAdminRequest,
  InviteTenantAdminResponse,
  UpdateTenantAdminRequest,
} from '@/types/api';

export interface GetTenantAdminsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  tenantId?: string;
}

export interface GetTenantAdminInvitationsParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

export const tenantAdminsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTenantAdmins: builder.query<
      PaginatedResponse<TenantAdminDto>,
      GetTenantAdminsParams | undefined
    >({
      query: (params) => ({
        url: '/api/v1/tenant-admins',
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          search: params?.search,
          tenantId: params?.tenantId,
        },
        skipTenantHeader: true,
      }),
      providesTags: ['TenantAdmin'],
    }),

    createTenantAdmin: builder.mutation<CreateTenantAdminResponse, CreateTenantAdminRequest>({
      query: (body) => ({
        url: '/api/v1/tenant-admins',
        method: 'POST',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['TenantAdmin'],
    }),

    inviteTenantAdmin: builder.mutation<InviteTenantAdminResponse, InviteTenantAdminRequest>({
      query: (body) => ({
        url: '/api/v1/tenant-admins/invite',
        method: 'POST',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['TenantAdmin', 'Invitation'],
    }),

    updateTenantAdmin: builder.mutation<TenantAdminDto, UpdateTenantAdminRequest>({
      query: ({ userId, ...body }) => ({
        url: `/api/v1/tenant-admins/${userId}`,
        method: 'PUT',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['TenantAdmin'],
    }),

    deleteTenantAdmin: builder.mutation<void, string>({
      query: (id) => ({
        url: `/api/v1/tenant-admins/${id}`,
        method: 'DELETE',
        skipTenantHeader: true,
      }),
      invalidatesTags: ['TenantAdmin'],
    }),

    resendTenantAdminSetup: builder.mutation<void, string>({
      query: (userId) => ({
        url: `/api/v1/tenant-admins/${userId}/resend`,
        method: 'POST',
        skipTenantHeader: true,
      }),
    }),

    activateTenantAdmin: builder.mutation<TenantAdminDto, string>({
      query: (userId) => ({
        url: `/api/v1/tenant-admins/${userId}/activate`,
        method: 'POST',
        skipTenantHeader: true,
      }),
      invalidatesTags: ['TenantAdmin'],
    }),

    deactivateTenantAdmin: builder.mutation<TenantAdminDto, string>({
      query: (userId) => ({
        url: `/api/v1/tenant-admins/${userId}/deactivate`,
        method: 'POST',
        skipTenantHeader: true,
      }),
      invalidatesTags: ['TenantAdmin'],
    }),

    getTenantAdminInvitations: builder.query<
      PaginatedResponse<TenantAdminInvitationDto>,
      GetTenantAdminInvitationsParams | undefined
    >({
      query: (params) => ({
        url: '/api/v1/tenant-admins/invitations',
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          status: params?.status,
        },
        skipTenantHeader: true,
      }),
      providesTags: ['Invitation'],
    }),

    revokeInvitation: builder.mutation<void, string>({
      query: (invitationId) => ({
        url: `/api/v1/tenant-admins/invitations/${invitationId}/revoke`,
        method: 'POST',
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Invitation'],
    }),

    resendInvitation: builder.mutation<void, string>({
      query: (invitationId) => ({
        url: `/api/v1/tenant-admins/invitations/${invitationId}/resend`,
        method: 'POST',
        skipTenantHeader: true,
      }),
    }),
  }),
});

export const {
  useGetTenantAdminsQuery,
  useCreateTenantAdminMutation,
  useInviteTenantAdminMutation,
  useUpdateTenantAdminMutation,
  useDeleteTenantAdminMutation,
  useResendTenantAdminSetupMutation,
  useActivateTenantAdminMutation,
  useDeactivateTenantAdminMutation,
  useGetTenantAdminInvitationsQuery,
  useRevokeInvitationMutation,
  useResendInvitationMutation,
} = tenantAdminsApi;
