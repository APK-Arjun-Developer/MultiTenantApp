import { apiSlice } from '@/shared/api/apiSlice';
import type {
  DeleteTenantRequest,
  InviteResponse,
  InviteTenantRequest,
  OnboardTenantRequest,
  OnboardTenantResponse,
  PaginatedResponse,
  TenantCreationInvitationDto,
  TenantDto,
  UpdateCurrentTenantAddressRequest,
  UpdateTenantRequest,
} from '@/types/api';

interface GetTenantsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isActive?: boolean;
  createdVia?: 'Direct' | 'Invitation';
}

const tenantsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getTenants: builder.query<PaginatedResponse<TenantDto>, GetTenantsParams | void>({
      query: (params) => ({
        url: '/api/v1/tenants',
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 200,
          search: params?.search,
          sortBy: params?.sortBy,
          sortOrder: params?.sortOrder,
          isActive: params?.isActive,
          createdVia: params?.createdVia,
        },
        skipTenantHeader: true,
      }),
      providesTags: ['Tenant'],
    }),

    onboardTenant: builder.mutation<OnboardTenantResponse, OnboardTenantRequest>({
      query: (body) => ({
        url: '/api/v1/tenants',
        method: 'POST',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Tenant'],
    }),

    updateTenant: builder.mutation<TenantDto, UpdateTenantRequest>({
      query: (body) => ({
        url: '/api/v1/tenants',
        method: 'PUT',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Tenant'],
    }),

    updateCurrentTenantAddress: builder.mutation<TenantDto, UpdateCurrentTenantAddressRequest>({
      query: (body) => ({
        url: '/api/v1/tenants/current/address',
        method: 'PUT',
        data: body,
      }),
      invalidatesTags: ['Tenant'],
    }),

    deleteTenant: builder.mutation<void, DeleteTenantRequest>({
      query: (body) => ({
        url: '/api/v1/tenants',
        method: 'DELETE',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Tenant'],
    }),

    getTenantCreationInvitations: builder.query<
      PaginatedResponse<TenantCreationInvitationDto>,
      { page?: number; pageSize?: number; status?: string } | void
    >({
      query: (params) => ({
        url: '/api/v1/tenants/invitations',
        params: {
          page: params?.page ?? 1,
          pageSize: params?.pageSize ?? 20,
          status: params?.status,
        },
        skipTenantHeader: true,
      }),
      providesTags: ['Invitation'],
    }),

    inviteTenant: builder.mutation<InviteResponse, InviteTenantRequest>({
      query: (body) => ({
        url: '/api/v1/tenants/invite',
        method: 'POST',
        data: body,
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Invitation'],
    }),

    revokeTenantInvitation: builder.mutation<void, string>({
      query: (invitationId) => ({
        url: `/api/v1/tenants/invitations/${invitationId}/revoke`,
        method: 'POST',
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Invitation'],
    }),

    resendTenantInvitation: builder.mutation<void, string>({
      query: (invitationId) => ({
        url: `/api/v1/tenants/invitations/${invitationId}/resend`,
        method: 'POST',
        skipTenantHeader: true,
      }),
    }),

    uploadTenantLogoByAdmin: builder.mutation<TenantDto, { tenantId: string; file: File }>({
      query: ({ tenantId, file }) => {
        const form = new FormData();
        form.append('file', file);
        return {
          url: `/api/v1/tenants/${tenantId}/logo`,
          method: 'POST',
          data: form,
          skipTenantHeader: true,
        };
      },
      invalidatesTags: ['Tenant'],
    }),

    removeTenantLogoByAdmin: builder.mutation<TenantDto, string>({
      query: (tenantId) => ({
        url: `/api/v1/tenants/${tenantId}/logo`,
        method: 'DELETE',
        skipTenantHeader: true,
      }),
      invalidatesTags: ['Tenant'],
    }),
  }),
});

const {
  useGetTenantsQuery,
  useOnboardTenantMutation,
  useUpdateTenantMutation,
  useUpdateCurrentTenantAddressMutation,
  useDeleteTenantMutation,
  useGetTenantCreationInvitationsQuery,
  useInviteTenantMutation,
  useRevokeTenantInvitationMutation,
  useResendTenantInvitationMutation,
  useUploadTenantLogoByAdminMutation,
  useRemoveTenantLogoByAdminMutation,
} = tenantsApi;

export {
  type GetTenantsParams,
  tenantsApi,
  useDeleteTenantMutation,
  useGetTenantCreationInvitationsQuery,
  useGetTenantsQuery,
  useInviteTenantMutation,
  useOnboardTenantMutation,
  useRemoveTenantLogoByAdminMutation,
  useResendTenantInvitationMutation,
  useRevokeTenantInvitationMutation,
  useUpdateCurrentTenantAddressMutation,
  useUpdateTenantMutation,
  useUploadTenantLogoByAdminMutation,
};
